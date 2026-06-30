import {
  getSunatSireConfigByCompanyIdServer,
  updateSunatSireConfigTestResultServer,
} from "@/services/server/repositories/sunatSireConfigRepository";
import {
  getSunatSireSalesTicketByCompanyAndNumberServer,
  listSunatSireSalesTicketsByCompanyServer,
  upsertSunatSireSalesTicketServer,
} from "@/services/server/repositories/sunatSireSalesTicketRepository";
import {
  clearSireApiRuntimeCache,
  fetchSireAccessToken,
  fetchSirePeriods,
  fetchSireSalesProposalTicket,
  fetchSireSalesTicketStatus,
  getCachedSireAccessToken,
  downloadSireSalesReport,
  probeRceComprasAccess,
  probeSsppStatusAccess,
} from "@/services/sunat/sire/api";
import {
  getCompanySireCredentials,
  getSireConfigSummary as getSireConfigSummaryInternal,
  listSireSalesTicketsPageForCompany,
  listSireSalesTicketsForCompany,
  resolveCredentialsFromSources,
  saveSireConfigForCompany as saveSireConfigForCompanyInternal,
  validateSireConfigPayload,
} from "@/services/sunat/sire/config";
import {
  buildSireSalesProposalPreviewPage,
  parseSireSalesProposalPreview,
} from "@/services/sunat/sire/proposalPreview";
import { buildDatasetFromStoredSireSalesTickets } from "@/services/sunat/sire/proposalMovements";
import {
  isDevelopmentEnvironment,
  logSireAuthDebug,
  logTokenDebug,
} from "@/services/sunat/sire/diagnostics";
import {
  getStoredProposalPreview,
  mergeStoredTicketPayload,
} from "@/services/sunat/sire/ticketSnapshot";
import {
  buildMaskedCredentialSnapshot,
  countBookPeriods,
  hasAvailableBooks,
  normalizeReportFileTypeCode,
  parseTicketStatusItems,
  resolveBookAccessState,
  SIRE_BOOKS,
  SireServiceError,
  toFriendlySunatMessage,
  validateFileType,
  validatePeriodo,
  validateTicketNumber,
} from "@/services/sunat/sire/shared";
import type {
  SireBookCode,
  SireBookStatus,
  SireConfigFormData,
  SireDashboardContext,
  SireConfigSummary,
  SireSalesProposalRequest,
  SireSalesProposalPreview,
  SireSalesProposalPreviewPage,
  SireStatusResponse,
} from "@/types/sire";

const DASHBOARD_CONTEXT_CACHE_TTL_MS = 2 * 60 * 1000;

const dashboardContextCache = new Map<
  string,
  { value: SireDashboardContext; expiresAtMs: number }
>();
const inflightDashboardContext = new Map<string, Promise<SireDashboardContext>>();

function getCachedDashboardContext(cacheKey: string) {
  const entry = dashboardContextCache.get(cacheKey);

  if (!entry) {
    return null;
  }

  if (entry.expiresAtMs <= Date.now()) {
    return null;
  }

  return entry.value;
}

function setCachedDashboardContext(
  cacheKey: string,
  value: SireDashboardContext
) {
  dashboardContextCache.set(cacheKey, {
    value,
    expiresAtMs: Date.now() + DASHBOARD_CONTEXT_CACHE_TTL_MS,
  });
}

function clearSireRuntimeCacheForCompany(
  companyId: string,
  config?: Pick<SireConfigSummary, "ruc" | "apiBaseUrl"> | null
) {
  dashboardContextCache.delete(`${companyId}:periods`);
  dashboardContextCache.delete(`${companyId}:config`);
  inflightDashboardContext.delete(`${companyId}:periods`);
  inflightDashboardContext.delete(`${companyId}:config`);
  clearSireApiRuntimeCache({
    companyId,
    ruc: config?.ruc,
    apiBaseUrl: config?.apiBaseUrl,
  });
}

async function resolveBookStatus(
  credentials: Awaited<ReturnType<typeof getCompanySireCredentials>>,
  accessToken: string,
  bookCode: SireBookCode
): Promise<SireBookStatus> {
  try {
    const years = await fetchSirePeriods(credentials, accessToken, bookCode);

    return {
      code: bookCode,
      ok: true,
      years: years.length,
      periods: countBookPeriods(years),
      message: "Consulta disponible.",
      accessState: "available",
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? toFriendlySunatMessage(error.message)
        : "No se pudo consultar el libro en SUNAT.";

    return {
      code: bookCode,
      ok: false,
      years: 0,
      periods: 0,
      message,
      accessState: resolveBookAccessState(message),
    };
  }
}

async function logAdditionalModuleProbes(
  companyId: string,
  credentials: Awaited<ReturnType<typeof getCompanySireCredentials>>
) {
  if (!isDevelopmentEnvironment()) {
    return;
  }

  const ssppResult = await probeSsppStatusAccess(credentials);
  logTokenDebug(companyId, ssppResult.tokenResponse);
  const safeSsppResult = {
    documentId: ssppResult.documentId,
    endpoint: ssppResult.endpoint,
    status: ssppResult.status,
    statusText: ssppResult.statusText,
    contentType: ssppResult.contentType,
    preview: ssppResult.preview,
  };

  console.info("[SUNAT MODULE DEBUG]", {
    companyId,
    moduleName: "SSPP Receptor XML",
    ...safeSsppResult,
  });
}

export {
  listSireSalesTicketsPageForCompany,
  listSireSalesTicketsForCompany,
  toFriendlySunatMessage,
  validateSireConfigPayload,
};

function flattenSirePeriodCodes(periodYears: { lisPeriodos: { perTributario: string }[] }[]) {
  return periodYears.flatMap((year) =>
    year.lisPeriodos.map((period) => period.perTributario)
  );
}

function resolveStoredTicketProcessCode(
  ticketNumber: string,
  lastResponse: unknown
) {
  const ticketStatus = mergeStoredTicketPayload(lastResponse, {}).ticketStatus;

  if (!ticketStatus) {
    return null;
  }

  try {
    const items = parseTicketStatusItems(ticketStatus);
    const matchingItem =
      items.find((item) => item.numTicket === ticketNumber) ?? items[0] ?? null;

    return matchingItem?.codProceso?.trim() || null;
  } catch {
    return null;
  }
}

async function warmSireSalesProposalPreviewCache(input: {
  companyId: string;
  periodo: string;
  ticketNumber: string;
}) {
  try {
    await getSireSalesProposalPreviewForCompany(
      input.companyId,
      input.periodo,
      input.ticketNumber
    );
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[SIRE PREVIEW CACHE DEBUG]", {
        companyId: input.companyId,
        periodo: input.periodo,
        ticketNumber: input.ticketNumber,
        error: error instanceof Error ? error.message : error,
      });
    }
  }
}

export async function getSireDashboardContextForCompany(
  companyId: string,
  options?: { includePeriods?: boolean }
): Promise<SireDashboardContext> {
  const includePeriods = options?.includePeriods ?? true;
  const cacheKey = `${companyId}:${includePeriods ? "periods" : "config"}`;
  const cachedContext = getCachedDashboardContext(cacheKey);

  if (cachedContext) {
    return cachedContext;
  }

  const inflightRequest = inflightDashboardContext.get(cacheKey);

  if (inflightRequest) {
    return inflightRequest;
  }

  const request = (async () => {
    let config: SireConfigSummary | null;

    try {
      config = await getSireConfigSummaryInternal(companyId);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No pudimos cargar la configuracion SIRE.";
      const context = {
        config: null,
        periodCodes: [],
        availability: "unavailable",
        message,
      } satisfies SireDashboardContext;

      setCachedDashboardContext(cacheKey, context);
      return context;
    }

    if (!config) {
      const context = {
        config: null,
        periodCodes: [],
        availability: "not_configured",
        message: "Primero guarda tus datos de SUNAT para activar SIRE.",
      } satisfies SireDashboardContext;

      setCachedDashboardContext(cacheKey, context);
      return context;
    }

    if (!includePeriods) {
      const context = {
        config,
        periodCodes: [],
        availability: "unknown",
        message: null,
      } satisfies SireDashboardContext;

      setCachedDashboardContext(cacheKey, context);
      return context;
    }

    try {
      const periodYears = await getSireSalesPeriodsForCompany(companyId);
      const context = {
        config,
        periodCodes: flattenSirePeriodCodes(periodYears),
        availability: "available",
        message: null,
      } satisfies SireDashboardContext;

      setCachedDashboardContext(cacheKey, context);
      return context;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No pudimos consultar SIRE.";
      const context = {
        config,
        periodCodes: [],
        availability: "unavailable",
        message,
      } satisfies SireDashboardContext;

      setCachedDashboardContext(cacheKey, context);
      return context;
    }
  })();

  inflightDashboardContext.set(cacheKey, request);

  try {
    return await request;
  } finally {
    inflightDashboardContext.delete(cacheKey);
  }
}

export async function getSireConfigSummary(companyId: string) {
  return getSireConfigSummaryInternal(companyId);
}

export async function saveSireConfigForCompany(
  companyId: string,
  payload: SireConfigFormData
) {
  const savedConfig = await saveSireConfigForCompanyInternal(companyId, payload);
  clearSireRuntimeCacheForCompany(companyId, savedConfig);
  return savedConfig;
}

export async function testSireConnectionForCompany(
  companyId: string,
  payload?: SireConfigFormData
): Promise<SireStatusResponse> {
  const existingResult = await getSunatSireConfigByCompanyIdServer(companyId);

  if (existingResult.error) {
    throw existingResult.error;
  }

  if (!payload && !existingResult.data) {
    return {
      configured: false,
      checkedAt: new Date().toISOString(),
      message: "Aun no hay credenciales SIRE guardadas para esta empresa.",
      missingFields: [
        "RUC",
        "Usuario SOL",
        "Clave SOL",
        "Client ID",
        "Client Secret",
      ],
      auth: {
        ok: false,
        message: "Guarda tus credenciales antes de probar la conexion.",
      },
      diagnostics: {
        tokenOk: false,
        moduleAccess: {
          rvie: false,
          rce: false,
        },
      },
      books: {
        rvie: {
          code: SIRE_BOOKS.rvie,
          ok: false,
          years: 0,
          periods: 0,
          message: "Configuracion pendiente.",
          accessState: "error",
        },
        rce: {
          code: SIRE_BOOKS.rce,
          ok: false,
          years: 0,
          periods: 0,
          message: "Configuracion pendiente.",
          accessState: "error",
        },
      },
    };
  }

  const normalized = await validateSireConfigPayload(
    payload ?? {
      ruc: existingResult.data!.ruc,
      solUser: existingResult.data!.sol_user,
      solPassword: "",
      clientId: existingResult.data!.client_id,
      clientSecret: "",
      securityBaseUrl: existingResult.data!.security_base_url,
      apiBaseUrl: existingResult.data!.api_base_url,
    },
    existingResult.data
  );
  const resolved = resolveCredentialsFromSources(normalized, existingResult.data);

  const checkedAt = new Date().toISOString();
  const maskedCredentialSnapshot = buildMaskedCredentialSnapshot(
    companyId,
    resolved
  );

  try {
    const token = await fetchSireAccessToken(resolved);
    logTokenDebug(companyId, token);

    const [rvie, rce] = await Promise.all([
      resolveBookStatus(resolved, token.access_token, SIRE_BOOKS.rvie),
      resolveBookStatus(resolved, token.access_token, SIRE_BOOKS.rce),
    ]);

    await logAdditionalModuleProbes(companyId, resolved);

    const status: SireStatusResponse = {
      configured: true,
      checkedAt,
      message:
        rvie.ok || rce.ok
          ? "Pudimos entrar a SUNAT y revisar tus modulos disponibles."
          : rvie.accessState === "unauthorized" &&
              rce.accessState === "unauthorized"
            ? "Tu empresa aun no figura habilitada en SIRE o no esta registrada como obligada en SUNAT."
            : "Pudimos entrar a SUNAT, pero tus modulos todavia no responden con acceso.",
      missingFields: [],
      auth: {
        ok: true,
        message:
          rvie.ok || rce.ok
            ? "Tus datos fueron aceptados por SUNAT."
            : rvie.accessState === "unauthorized" &&
                rce.accessState === "unauthorized"
              ? "Tus datos fueron aceptados por SUNAT, pero tu empresa aun no aparece habilitada para usar SIRE."
              : "Tus datos fueron aceptados por SUNAT, pero el acceso a los modulos aun no quedo disponible.",
      },
      diagnostics: {
        tokenOk: true,
        moduleAccess: {
          rvie: rvie.ok,
          rce: rce.ok,
        },
      },
      books: {
        rvie,
        rce,
      },
    };

    logSireAuthDebug({
      ...maskedCredentialSnapshot,
      tokenOk: true,
      rvieOk: rvie.ok,
      rceOk: rce.ok,
      rvieAccessState: rvie.accessState,
      rceAccessState: rce.accessState,
    });

    if (existingResult.data) {
      await updateSunatSireConfigTestResultServer({
        companyId,
        lastTestStatus: hasAvailableBooks(status.books) ? "success" : "error",
        lastTestMessage: status.auth.message,
        lastTestedAt: checkedAt,
      });
    }

    return status;
  } catch (error) {
    const status: SireStatusResponse = {
      configured: true,
      checkedAt,
      message: "No se pudo autenticar o consultar SIRE en SUNAT.",
      missingFields: [],
      auth: {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "No se pudo autenticar contra SUNAT.",
      },
      diagnostics: {
        tokenOk: false,
        moduleAccess: {
          rvie: false,
          rce: false,
        },
      },
      books: {
        rvie: {
          code: SIRE_BOOKS.rvie,
          ok: false,
          years: 0,
          periods: 0,
          message: "La consulta depende de una autenticacion valida.",
          accessState: "error",
        },
        rce: {
          code: SIRE_BOOKS.rce,
          ok: false,
          years: 0,
          periods: 0,
          message: "La consulta depende de una autenticacion valida.",
          accessState: "error",
        },
      },
    };

    logSireAuthDebug({
      ...maskedCredentialSnapshot,
      tokenOk: false,
      rvieOk: false,
      rceOk: false,
      authMessage: status.auth.message,
    });

    if (existingResult.data) {
      await updateSunatSireConfigTestResultServer({
        companyId,
        lastTestStatus: "error",
        lastTestMessage: status.auth.message,
        lastTestedAt: checkedAt,
      });
    }

    return status;
  }
}

export async function getSireSalesPeriodsForCompany(companyId: string) {
  const credentials = await getCompanySireCredentials(companyId);
  const accessToken = await getCachedSireAccessToken(companyId, credentials);

  return fetchSirePeriods(credentials, accessToken, SIRE_BOOKS.rvie);
}

export async function requestSireSalesProposalForCompany(
  companyId: string,
  request: SireSalesProposalRequest
) {
  validatePeriodo(request.periodo);
  validateFileType(request.fileType);

  const credentials = await getCompanySireCredentials(companyId);
  const accessToken = await getCachedSireAccessToken(companyId, credentials);
  const ticketResponse = await fetchSireSalesProposalTicket(
    credentials,
    accessToken,
    request
  );

  const existingTicketResult =
    await getSunatSireSalesTicketByCompanyAndNumberServer(
      companyId,
      ticketResponse.numTicket
    );

  if (existingTicketResult.error) {
    throw existingTicketResult.error;
  }

  const upsertResult = await upsertSunatSireSalesTicketServer({
    company_id: companyId,
    periodo: request.periodo,
    ticket_number: ticketResponse.numTicket,
    file_type_code: request.fileType,
    process_status: null,
    report_file_name: null,
    report_file_type_code: null,
    last_response: mergeStoredTicketPayload(
      existingTicketResult.data?.last_response,
      {
        proposalTicket: ticketResponse,
      }
    ),
  });

  if (upsertResult.error) {
    throw upsertResult.error;
  }

  return ticketResponse;
}

export async function getSireSalesTicketStatusForCompany(
  companyId: string,
  periodo: string,
  ticketNumber: string
) {
  validatePeriodo(periodo);
  const normalizedTicketNumber = validateTicketNumber(ticketNumber);

  const credentials = await getCompanySireCredentials(companyId);
  const accessToken = await getCachedSireAccessToken(companyId, credentials);
  const statusResponse = await fetchSireSalesTicketStatus(
    credentials,
    accessToken,
    periodo,
    normalizedTicketNumber
  );
  const ticketResult =
    await getSunatSireSalesTicketByCompanyAndNumberServer(
      companyId,
      normalizedTicketNumber
    );

  if (ticketResult.error) {
    throw ticketResult.error;
  }

  const ticketItem =
    statusResponse.items.find((item) => item.numTicket === normalizedTicketNumber) ??
    statusResponse.items[0];

  await upsertSunatSireSalesTicketServer({
    company_id: companyId,
    periodo,
    ticket_number: normalizedTicketNumber,
    file_type_code: "0",
    process_status:
      ticketItem?.desEstadoProceso ?? ticketItem?.codEstadoProceso ?? null,
    report_file_name: ticketItem?.nomArchivoReporte ?? null,
    report_file_type_code: ticketItem?.codTipoArchivoReporte ?? null,
    last_response: mergeStoredTicketPayload(ticketResult.data?.last_response, {
      ticketStatus: statusResponse.raw,
    }),
  });

  if (
    ticketItem?.nomArchivoReporte &&
    ticketItem?.codTipoArchivoReporte &&
    !getStoredProposalPreview(ticketResult.data?.last_response)
  ) {
    void warmSireSalesProposalPreviewCache({
      companyId,
      periodo,
      ticketNumber: normalizedTicketNumber,
    });
  }

  return statusResponse;
}

export async function downloadSireSalesReportForCompany(
  companyId: string,
  periodo: string,
  ticketNumber: string
) {
  validatePeriodo(periodo);
  const normalizedTicketNumber = validateTicketNumber(ticketNumber);

  const ticketResult =
    await getSunatSireSalesTicketByCompanyAndNumberServer(
      companyId,
      normalizedTicketNumber
    );

  if (ticketResult.error) {
    throw ticketResult.error;
  }

  const reportFileName = ticketResult.data?.report_file_name;
  const reportFileTypeCode = ticketResult.data?.report_file_type_code
    ? normalizeReportFileTypeCode(ticketResult.data.report_file_type_code)
    : null;
  const processCode = resolveStoredTicketProcessCode(
    normalizedTicketNumber,
    ticketResult.data?.last_response
  );

  if (!reportFileName || !reportFileTypeCode) {
    throw new SireServiceError(
      "Aun no tenemos el archivo listo. Revisa primero el estado del ticket."
    );
  }

  if (!processCode) {
    throw new SireServiceError(
      "Necesitamos volver a consultar el ticket antes de descargar el archivo de SUNAT."
    );
  }

  const credentials = await getCompanySireCredentials(companyId);
  const accessToken = await getCachedSireAccessToken(companyId, credentials);

  return downloadSireSalesReport(credentials, accessToken, {
    reportFileName,
    reportFileTypeCode,
    periodo,
    processCode,
    ticketNumber: normalizedTicketNumber,
  });
}

export async function getSireSalesProposalPreviewForCompany(
  companyId: string,
  periodo: string,
  ticketNumber: string
): Promise<SireSalesProposalPreview> {
  validatePeriodo(periodo);
  const normalizedTicketNumber = validateTicketNumber(ticketNumber);

  const ticketResult =
    await getSunatSireSalesTicketByCompanyAndNumberServer(
      companyId,
      normalizedTicketNumber
    );

  if (ticketResult.error) {
    throw ticketResult.error;
  }

  const reportFileName = ticketResult.data?.report_file_name;
  const reportFileTypeCode = ticketResult.data?.report_file_type_code
    ? normalizeReportFileTypeCode(ticketResult.data.report_file_type_code)
    : null;
  const storedPreview = getStoredProposalPreview(ticketResult.data?.last_response);

  if (!reportFileName || !reportFileTypeCode) {
    throw new SireServiceError(
      "Primero revisa el ticket hasta que SUNAT deje listo el archivo de la propuesta."
    );
  }

  if (storedPreview) {
    return storedPreview;
  }

  const file = await downloadSireSalesReportForCompany(
    companyId,
    periodo,
    normalizedTicketNumber
  );

  const preview = await parseSireSalesProposalPreview({
    fileName: reportFileName,
    bytes: file.bytes,
  });

  await upsertSunatSireSalesTicketServer({
    company_id: companyId,
    periodo,
    ticket_number: normalizedTicketNumber,
    file_type_code: ticketResult.data?.file_type_code ?? "0",
    process_status: ticketResult.data?.process_status ?? null,
    report_file_name: reportFileName,
    report_file_type_code: reportFileTypeCode,
    last_response: mergeStoredTicketPayload(ticketResult.data?.last_response, {
      proposalPreview: preview,
      proposalPreviewCapturedAt: new Date().toISOString(),
    }),
  });

  return preview;
}

export async function getSireSalesProposalPreviewPageForCompany(
  companyId: string,
  periodo: string,
  ticketNumber: string,
  input: {
    page: number;
    perPage: number;
    query: string;
  }
): Promise<SireSalesProposalPreviewPage> {
  const preview = await getSireSalesProposalPreviewForCompany(
    companyId,
    periodo,
    ticketNumber
  );

  return buildSireSalesProposalPreviewPage({
    preview,
    page: input.page,
    perPage: input.perPage,
    query: input.query,
  });
}

export async function getStoredSireSalesDatasetForCompany(companyId: string) {
  const ticketsResult = await listSunatSireSalesTicketsByCompanyServer(companyId);

  if (ticketsResult.error) {
    throw ticketsResult.error;
  }

  const dataset = buildDatasetFromStoredSireSalesTickets({
    companyId,
    tickets: ticketsResult.data,
  });

  if (process.env.NODE_ENV !== "production") {
    console.info("[SIRE DASHBOARD DEBUG]", {
      companyId,
      ticketCount: ticketsResult.data.length,
      movementCount: dataset.movements.length,
      reportCount: dataset.reports.length,
      periods: dataset.periods,
    });
  }

  return dataset;
}

export async function getSireSsppProbeForCompany(companyId: string) {
  const credentials = await getCompanySireCredentials(companyId);
  const result = await probeSsppStatusAccess(credentials);

  logTokenDebug(companyId, result.tokenResponse);
  const safeResult = {
    documentId: result.documentId,
    endpoint: result.endpoint,
    status: result.status,
    statusText: result.statusText,
    contentType: result.contentType,
    preview: result.preview,
  };

  return {
    moduleName: "SSPP Receptor XML",
    ...safeResult,
  };
}

export async function getSireRceComprasProbeForCompany(companyId: string) {
  const credentials = await getCompanySireCredentials(companyId);
  const result = await probeRceComprasAccess(credentials);

  logTokenDebug(companyId, result.tokenResponse);
  const safeResult = {
    periodsEndpoint: result.periodsEndpoint,
    periodsStatus: result.periodsStatus,
    periodsStatusText: result.periodsStatusText,
    periodsContentType: result.periodsContentType,
    periodsPreview: result.periodsPreview,
    proposalEndpoint: result.proposalEndpoint,
    proposalStatus: result.proposalStatus,
    proposalStatusText: result.proposalStatusText,
    proposalContentType: result.proposalContentType,
    proposalPreview: result.proposalPreview,
  };

  return {
    moduleName: "RCE Compras",
    ...safeResult,
  };
}
