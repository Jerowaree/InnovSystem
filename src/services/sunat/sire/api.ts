import { logSunatDiagnostic, logTokenDebug } from "@/services/sunat/sire/diagnostics";
import {
  buildSolUsername,
  CPE_API_BASE_URL,
  CPE_SCOPE,
  getRuntimeCacheValue,
  parseSirePeriodsResponse,
  parseSireProposalTicketResponse,
  parseTicketStatusItems,
  ResolvedSireCredentials,
  SIRE_BOOKS,
  SIRE_SCOPE,
  setRuntimeCacheValue,
  SireServiceError,
  tokenCache,
  toFriendlySunatMessage,
} from "@/services/sunat/sire/shared";
import type {
  SireAccessTokenResponse,
  SireBookCode,
  SirePeriodYear,
  SireSalesDownloadParams,
  SireSalesProposalRequest,
  SireSalesProposalTicketResponse,
  SireSalesTicketStatusResponse,
} from "@/types/sire";

const RETRYABLE_SUNAT_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);
const TOKEN_REUSE_BUFFER_MS = 30_000;
const PERIODS_CACHE_TTL_MS = 3 * 60 * 1000;

const inflightTokenRequests = new Map<string, Promise<string>>();
const periodsCache = new Map<
  string,
  { value: SirePeriodYear[]; expiresAtMs: number }
>();
const inflightPeriodsRequests = new Map<string, Promise<SirePeriodYear[]>>();

function getPeriodsCacheKey(
  credentials: ResolvedSireCredentials,
  bookCode: SireBookCode
) {
  return `${credentials.ruc}|${credentials.apiBaseUrl}|${bookCode}`;
}

function isRetryableSunatStatus(status: number) {
  return RETRYABLE_SUNAT_STATUS_CODES.has(status);
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithSunatResilience(
  endpoint: string,
  init: RequestInit,
  options?: {
    timeoutMs?: number;
    retries?: number;
  }
) {
  const timeoutMs = options?.timeoutMs ?? 15_000;
  const retries = options?.retries ?? 1;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(endpoint, {
        ...init,
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (response.ok || !isRetryableSunatStatus(response.status) || attempt === retries) {
        return response;
      }

      await logSunatDiagnostic({
        operation: "fetchWithSunatResilience",
        endpoint,
        response,
      });
    } catch (error) {
      lastError = error;

      if (attempt === retries) {
        throw error;
      }
    }

    await wait(250 * (attempt + 1));
  }

  throw lastError instanceof Error
    ? lastError
    : new SireServiceError("No se pudo completar la consulta con SUNAT.");
}

async function parseSunatError(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";
  let message = "";

  if (contentType.includes("application/json")) {
    const payload = (await response.json()) as
      | { msg?: string; error_description?: string; errors?: { msg?: string }[] }
      | undefined;

    message =
      payload?.errors?.[0]?.msg ||
      payload?.msg ||
      payload?.error_description ||
      `SUNAT respondio con estado ${response.status}.`;

    return toFriendlySunatMessage(message);
  }

  const text = await response.text();
  message = text || `SUNAT respondio con estado ${response.status}.`;
  return toFriendlySunatMessage(message);
}

export async function fetchSunatAccessTokenForScope(
  credentials: ResolvedSireCredentials,
  scope: string
): Promise<SireAccessTokenResponse> {
  const endpoint = `${credentials.securityBaseUrl}/v1/clientessol/${credentials.clientId}/oauth2/token/`;
  const body = new URLSearchParams({
    grant_type: "password",
    scope,
    client_id: credentials.clientId,
    client_secret: credentials.clientSecret,
    username: buildSolUsername(credentials.ruc, credentials.solUser),
    password: credentials.solPassword,
  });

  const response = await fetchWithSunatResilience(
    endpoint,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      cache: "no-store",
    },
    { timeoutMs: 15_000, retries: 1 }
  );

  if (!response.ok) {
    await logSunatDiagnostic({
      operation: "fetchSireAccessToken",
      endpoint,
      response,
    });
    throw new SireServiceError(await parseSunatError(response));
  }

  return (await response.json()) as SireAccessTokenResponse;
}

export async function fetchSireAccessToken(
  credentials: ResolvedSireCredentials
): Promise<SireAccessTokenResponse> {
  return fetchSunatAccessTokenForScope(credentials, SIRE_SCOPE);
}

export async function getCachedSireAccessToken(
  companyId: string,
  credentials: ResolvedSireCredentials
) {
  const cachedToken = tokenCache.get(companyId);

  if (cachedToken && cachedToken.expiresAtMs > Date.now() + TOKEN_REUSE_BUFFER_MS) {
    return cachedToken.accessToken;
  }

  const inflightRequest = inflightTokenRequests.get(companyId);

  if (inflightRequest) {
    return inflightRequest;
  }

  const nextRequest = (async () => {
    const tokenResponse = await fetchSireAccessToken(credentials);
    const expiresAtMs = Date.now() + tokenResponse.expires_in * 1000;

    logTokenDebug(companyId, tokenResponse);

    tokenCache.set(companyId, {
      accessToken: tokenResponse.access_token,
      expiresAtMs,
    });

    return tokenResponse.access_token;
  })();

  inflightTokenRequests.set(companyId, nextRequest);

  try {
    return await nextRequest;
  } finally {
    inflightTokenRequests.delete(companyId);
  }
}

export async function fetchSirePeriods(
  credentials: ResolvedSireCredentials,
  accessToken: string,
  bookCode: SireBookCode
): Promise<SirePeriodYear[]> {
  const cacheKey = getPeriodsCacheKey(credentials, bookCode);
  const cachedPeriods = getRuntimeCacheValue(periodsCache, cacheKey);

  if (cachedPeriods) {
    return cachedPeriods;
  }

  const inflightRequest = inflightPeriodsRequests.get(cacheKey);

  if (inflightRequest) {
    return inflightRequest;
  }

  const endpoint = `${credentials.apiBaseUrl}/v1/contribuyente/migeigv/libros/rvierce/padron/web/omisos/${bookCode}/periodos`;
  const staleEntry = periodsCache.get(cacheKey);
  const request = (async () => {
    try {
      const response = await fetchWithSunatResilience(
        endpoint,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        },
        { timeoutMs: 15_000, retries: 1 }
      );

      if (!response.ok) {
        await logSunatDiagnostic({
          operation: "fetchSirePeriods",
          endpoint,
          response,
        });

        if (staleEntry && isRetryableSunatStatus(response.status)) {
          return staleEntry.value;
        }

        throw new SireServiceError(await parseSunatError(response));
      }

      const periods = parseSirePeriodsResponse(await response.json());
      setRuntimeCacheValue(periodsCache, cacheKey, periods, PERIODS_CACHE_TTL_MS);
      return periods;
    } catch (error) {
      if (staleEntry) {
        return staleEntry.value;
      }

      throw error;
    }
  })();

  inflightPeriodsRequests.set(cacheKey, request);

  try {
    return await request;
  } finally {
    inflightPeriodsRequests.delete(cacheKey);
  }
}

export async function fetchSireSalesProposalTicket(
  credentials: ResolvedSireCredentials,
  accessToken: string,
  request: SireSalesProposalRequest
): Promise<SireSalesProposalTicketResponse> {
  const endpoint = `${credentials.apiBaseUrl}/v1/contribuyente/migeigv/libros/rvie/propuesta/web/propuesta/${request.periodo}/exportapropuesta?codTipoArchivo=${request.fileType}`;
  const response = await fetchWithSunatResilience(
    endpoint,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
    { timeoutMs: 15_000, retries: 1 }
  );

  if (!response.ok) {
    await logSunatDiagnostic({
      operation: "fetchSireSalesProposalTicket",
      endpoint,
      response,
    });
    throw new SireServiceError(await parseSunatError(response));
  }

  return parseSireProposalTicketResponse(await response.json());
}

export function clearSireApiRuntimeCache(options: {
  companyId?: string;
  ruc?: string;
  apiBaseUrl?: string;
}) {
  if (options.companyId) {
    tokenCache.delete(options.companyId);
    inflightTokenRequests.delete(options.companyId);
  }

  if (options.ruc && options.apiBaseUrl) {
    const prefix = `${options.ruc}|${options.apiBaseUrl}|`;

    for (const key of periodsCache.keys()) {
      if (key.startsWith(prefix)) {
        periodsCache.delete(key);
      }
    }

    for (const key of inflightPeriodsRequests.keys()) {
      if (key.startsWith(prefix)) {
        inflightPeriodsRequests.delete(key);
      }
    }
  }
}

export async function fetchSireSalesTicketStatus(
  credentials: ResolvedSireCredentials,
  accessToken: string,
  periodo: string,
  ticketNumber: string
): Promise<SireSalesTicketStatusResponse> {
  const query = new URLSearchParams({
    perIni: periodo,
    perFin: periodo,
    page: "1",
    perPage: "20",
    numTicket: ticketNumber,
    codLibro: SIRE_BOOKS.rvie,
    codOrigenEnvio: "2",
  });

  const endpoint = `${credentials.apiBaseUrl}/v1/contribuyente/migeigv/libros/rvierce/gestionprocesosmasivos/web/masivo/consultaestadotickets?${query.toString()}`;
  const response = await fetchWithSunatResilience(
    endpoint,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
    { timeoutMs: 15_000, retries: 1 }
  );

  if (!response.ok) {
    await logSunatDiagnostic({
      operation: "fetchSireSalesTicketStatus",
      endpoint,
      response,
    });
    throw new SireServiceError(await parseSunatError(response));
  }

  const raw = (await response.json()) as unknown;

  return {
    items: parseTicketStatusItems(raw),
    raw,
  };
}

export async function downloadSireSalesReport(
  credentials: ResolvedSireCredentials,
  accessToken: string,
  params: SireSalesDownloadParams
) {
  const query = new URLSearchParams({
    nomArchivoReporte: params.reportFileName,
    codTipoArchivoReporte: params.reportFileTypeCode,
    codLibro: SIRE_BOOKS.rvie,
    perTributario: params.periodo,
    codProceso: params.processCode,
    numTicket: params.ticketNumber,
  });

  const endpoint = `${credentials.apiBaseUrl}/v1/contribuyente/migeigv/libros/rvierce/gestionprocesosmasivos/web/masivo/archivoreporte?${query.toString()}`;
  const response = await fetchWithSunatResilience(
    endpoint,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    },
    { timeoutMs: 30_000, retries: 1 }
  );

  if (!response.ok) {
    await logSunatDiagnostic({
      operation: "downloadSireSalesReport",
      endpoint,
      response,
    });
    throw new SireServiceError(await parseSunatError(response));
  }

  return {
    bytes: Buffer.from(await response.arrayBuffer()),
    contentType:
      response.headers.get("content-type") ?? "application/octet-stream",
    contentDisposition: response.headers.get("content-disposition"),
  };
}

export async function probeSunatModuleAccess(
  credentials: ResolvedSireCredentials,
  accessToken: string,
  modulePath: string
) {
  const endpoint = `${credentials.apiBaseUrl}${modulePath}`;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });

  const preview = (await response.text()).replace(/\s+/g, " ").trim().slice(0, 180);

  return {
    endpoint,
    status: response.status,
    statusText: response.statusText,
    contentType: response.headers.get("content-type") ?? "unknown",
    preview,
  };
}

export async function probeSsppStatusAccess(
  credentials: ResolvedSireCredentials
) {
  const tokenResponse = await fetchSunatAccessTokenForScope(
    credentials,
    CPE_SCOPE
  );
  const documentId = `${credentials.ruc}-14-F001-99999999`;
  const endpoint = `${CPE_API_BASE_URL}/v1/contribuyente/enviossp/${documentId}/estados`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${tokenResponse.access_token}`,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });

  const preview = (await response.text()).replace(/\s+/g, " ").trim().slice(0, 180);

  return {
    documentId,
    endpoint,
    status: response.status,
    statusText: response.statusText,
    contentType: response.headers.get("content-type") ?? "unknown",
    preview,
    tokenResponse,
  };
}

export async function probeRceComprasAccess(
  credentials: ResolvedSireCredentials
) {
  const tokenResponse = await fetchSunatAccessTokenForScope(
    credentials,
    SIRE_SCOPE
  );
  const periodsEndpoint = `${credentials.apiBaseUrl}/v1/contribuyente/migeigv/libros/rvierce/padron/web/omisos/080000/periodos`;
  const proposalEndpoint = `${credentials.apiBaseUrl}/v1/contribuyente/migeigv/libros/rce/propuesta/web/propuesta/202301/exportacioncomprobantepropuesta?codTipoArchivo=0&codOrigenEnvio=2`;

  const [periodsResponse, proposalResponse] = await Promise.all([
    fetch(periodsEndpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${tokenResponse.access_token}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    }),
    fetch(proposalEndpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${tokenResponse.access_token}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    }),
  ]);

  const periodsPreview = (await periodsResponse.text())
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
  const proposalPreview = (await proposalResponse.text())
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);

  return {
    periodsEndpoint,
    periodsStatus: periodsResponse.status,
    periodsStatusText: periodsResponse.statusText,
    periodsContentType: periodsResponse.headers.get("content-type") ?? "unknown",
    periodsPreview,
    proposalEndpoint,
    proposalStatus: proposalResponse.status,
    proposalStatusText: proposalResponse.statusText,
    proposalContentType:
      proposalResponse.headers.get("content-type") ?? "unknown",
    proposalPreview,
    tokenResponse,
  };
}
