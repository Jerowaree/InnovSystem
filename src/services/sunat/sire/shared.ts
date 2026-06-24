import type {
  SireAccessTokenResponse,
  SireBookCode,
  SireBookStatus,
  SireConfigFormData,
  SirePeriodYear,
  SireProposalFileTypeCode,
  SireSalesProposalTicketResponse,
  SireSalesReportFile,
  SireSalesTicketStatusItem,
} from "@/types/sire";

export const SIRE_SCOPE = "https://api-sire.sunat.gob.pe";
export const CPE_SCOPE = "https://api-cpe.sunat.gob.pe";
export const CPE_API_BASE_URL = "https://api-cpe.sunat.gob.pe";

export const ALLOWED_SUNAT_HOSTS = new Set([
  "api-seguridad.sunat.gob.pe",
  "api-sire.sunat.gob.pe",
  "api-cpe.sunat.gob.pe",
]);

export const SIRE_BOOKS = {
  rvie: "140000",
  rce: "080000",
} satisfies Record<"rvie" | "rce", SireBookCode>;

export const tokenCache = new Map<
  string,
  { accessToken: string; expiresAtMs: number }
>();

export interface RuntimeCacheEntry<T> {
  value: T;
  expiresAtMs: number;
}

export class SireServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SireServiceError";
  }
}

export interface ResolvedSireCredentials {
  ruc: string;
  solUser: string;
  solPassword: string;
  clientId: string;
  clientSecret: string;
  securityBaseUrl: string;
  apiBaseUrl: string;
}

export function normalizeReportFileTypeCode(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return trimmedValue;
  }

  if (trimmedValue.toLowerCase() === "null") {
    return "null";
  }

  if (/^\d+$/.test(trimmedValue)) {
    return String(Number(trimmedValue));
  }

  return trimmedValue;
}

export function normalizeText(value: string) {
  return value.trim();
}

export function assertAllowedSunatUrl(value: string, label: string) {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(value);
  } catch {
    throw new SireServiceError(`La ${label} no es valida.`);
  }

  if (parsedUrl.protocol !== "https:") {
    throw new SireServiceError(`La ${label} debe usar HTTPS.`);
  }

  if (!ALLOWED_SUNAT_HOSTS.has(parsedUrl.hostname)) {
    throw new SireServiceError(
      `La ${label} debe apuntar a un dominio oficial de SUNAT.`
    );
  }
}

export function buildSolUsername(ruc: string, solUser: string) {
  return solUser.startsWith(ruc) ? solUser : `${ruc}${solUser}`;
}

export function toFriendlySunatMessage(message: string) {
  const normalizedMessage = message.trim().toLowerCase();

  if (
    normalizedMessage.includes("<html") ||
    normalizedMessage.includes("<head>") ||
    normalizedMessage.includes("<body>")
  ) {
    if (normalizedMessage.includes("401 authorization required")) {
      return (
        "SUNAT acepto la conexion principal, pero este modulo todavia no esta disponible para tu cuenta " +
        "o falta habilitarlo en SUNAT."
      );
    }

    if (
      normalizedMessage.includes("500 request failed") ||
      normalizedMessage.includes("internal server error")
    ) {
      return (
        "SUNAT no pudo entregar el archivo en este momento. " +
        "Vuelve a intentar en unos segundos. Si el problema sigue, conviene consultar otra vez el ticket."
      );
    }

    return (
      "SUNAT devolvio una respuesta no esperada en este momento. Intenta nuevamente en unos segundos."
    );
  }

  if (
    normalizedMessage.includes("error en la autenticacion del usuario") ||
    normalizedMessage.includes("usuario y/o clave") ||
    normalizedMessage.includes("invalid_grant") ||
    normalizedMessage.includes("credenciales invalidas") ||
    normalizedMessage.includes("credenciales inválidas")
  ) {
    return (
      "No pudimos entrar a SUNAT con los datos guardados. " +
      "Revisa tu RUC, usuario SOL, clave SOL, client ID y client secret. " +
      "Tambien confirma en SUNAT que tu aplicacion tenga acceso a SIRE Ventas."
    );
  }

  if (
    normalizedMessage.includes("unauthorized") ||
    normalizedMessage.includes("forbidden")
  ) {
    return (
      "SUNAT rechazo el acceso de esta aplicacion. " +
      "Verifica que las credenciales pertenezcan a la misma empresa y que el servicio este habilitado."
    );
  }

  if (
    normalizedMessage.includes("no se encontro") &&
    normalizedMessage.includes("ticket")
  ) {
    return "No se encontro el ticket para el periodo seleccionado.";
  }

  if (
    normalizedMessage.includes("número de ticket") ||
    normalizedMessage.includes("numero de ticket")
  ) {
    return "No se encontro el ticket para el periodo seleccionado.";
  }

  return message;
}

export function countBookPeriods(years: { lisPeriodos: unknown[] }[]) {
  return years.reduce((total, year) => total + year.lisPeriodos.length, 0);
}

export function hasAvailableBooks(status: {
  rvie: { ok: boolean };
  rce: { ok: boolean };
}) {
  return status.rvie.ok || status.rce.ok;
}

export function resolveBookAccessState(
  message: string
): SireBookStatus["accessState"] {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("authorization required") ||
    normalized.includes("unauthorized") ||
    normalized.includes("falta habilitarlo")
  ) {
    return "unauthorized";
  }

  if (normalized.includes("consulta disponible")) {
    return "available";
  }

  return "error";
}

export function parseTicketStatusItems(payload: unknown): SireSalesTicketStatusItem[] {
  const items = getArrayLikeField(payload, ["registros", "items"]);

  if (!items) {
    throw new SireServiceError(
      "SUNAT respondio con una estructura de ticket distinta a la documentada."
    );
  }

  return items.map((item, index) => normalizeTicketStatusItem(item, index));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getRequiredString(
  record: Record<string, unknown>,
  field: string,
  context: string
) {
  const value = record[field];

  if (typeof value !== "string" || !value.trim()) {
    throw new SireServiceError(`SUNAT no envio el campo ${context}.${field}.`);
  }

  return value.trim();
}

function getOptionalString(record: Record<string, unknown>, field: string) {
  const value = record[field];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getOptionalStringByAliases(
  record: Record<string, unknown>,
  fields: string[]
) {
  for (const field of fields) {
    const value = getOptionalString(record, field);

    if (value) {
      return value;
    }
  }

  return undefined;
}

function getArrayLikeField(
  payload: unknown,
  fields: string[]
): unknown[] | null {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!isRecord(payload)) {
    return null;
  }

  for (const field of fields) {
    const candidate = payload[field];

    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return null;
}

function normalizeReportFile(
  value: unknown
): SireSalesReportFile | undefined {
  if (Array.isArray(value)) {
    for (const item of value) {
      const normalizedItem = normalizeReportFile(item);

      if (normalizedItem) {
        return normalizedItem;
      }
    }

    return undefined;
  }

  if (!isRecord(value)) {
    return undefined;
  }

  const nomArchivoReporte = getOptionalStringByAliases(value, [
    "nomArchivoReporte",
    "nomArchivoContenido",
  ]);
  const codTipoArchivoReporte = getOptionalStringByAliases(value, [
    "codTipoArchivoReporte",
    "codTipoAchivoReporte",
    "codTipoArchivo",
  ]);

  if (!nomArchivoReporte) {
    return undefined;
  }

  if (!codTipoArchivoReporte) {
    return {
      nomArchivoReporte,
      codTipoArchivoReporte: "null",
    };
  }

  return {
    nomArchivoReporte,
    codTipoArchivoReporte: normalizeReportFileTypeCode(codTipoArchivoReporte),
  };
}

function resolveTopLevelReportFile(
  item: Record<string, unknown>,
  detalleTicket: Record<string, unknown> | null
) {
  const nestedReportFile =
    normalizeReportFile(item.archivoReporte) ??
    normalizeReportFile(detalleTicket?.archivoReporte);

  const nomArchivoReporte =
    nestedReportFile?.nomArchivoReporte ??
    getOptionalStringByAliases(item, [
      "nomArchivoReporte",
      "nomArchivoContenido",
    ]) ??
    getOptionalString(detalleTicket ?? {}, "nomArchivoReporte");
  const codTipoArchivoReporte =
    nestedReportFile?.codTipoArchivoReporte ??
    getOptionalStringByAliases(item, [
      "codTipoArchivoReporte",
      "codTipoAchivoReporte",
      "codTipoArchivo",
    ]) ??
    getOptionalStringByAliases(detalleTicket ?? {}, [
      "codTipoArchivoReporte",
      "codTipoAchivoReporte",
      "codTipoArchivo",
    ]);

  if (!nomArchivoReporte) {
    return undefined;
  }

  return {
    nomArchivoReporte,
    codTipoArchivoReporte: codTipoArchivoReporte
      ? normalizeReportFileTypeCode(codTipoArchivoReporte)
      : "null",
  } satisfies SireSalesReportFile;
}

function normalizeTicketStatusItem(
  item: unknown,
  index: number
): SireSalesTicketStatusItem {
  if (!isRecord(item)) {
    throw new SireServiceError(
      `SUNAT envio un registro de ticket invalido en la posicion ${index}.`
    );
  }

  const detalleTicket = isRecord(item.detalleTicket) ? item.detalleTicket : null;
  const archivoReporte = resolveTopLevelReportFile(item, detalleTicket);

  const numTicket =
    getOptionalString(item, "numTicket") ??
    getOptionalString(detalleTicket ?? {}, "numTicket");

  if (!numTicket) {
    throw new SireServiceError(
      `SUNAT no envio el campo registros[${index}].numTicket.`
    );
  }

  const codEstadoProceso =
    getOptionalString(item, "codEstadoProceso") ??
    getOptionalString(detalleTicket ?? {}, "codEstadoEnvio") ??
    getOptionalString(item, "codProceso");

  const desEstadoProceso =
    getOptionalString(item, "desEstadoProceso") ??
    getOptionalString(detalleTicket ?? {}, "desEstadoEnvio") ??
    getOptionalString(item, "detalleTicket") ??
    getOptionalString(item, "desProceso");

  if (!codEstadoProceso || !desEstadoProceso) {
    throw new SireServiceError(
      `SUNAT envio un ticket sin estado interpretable en registros[${index}].`
    );
  }

  return {
    ...item,
    numTicket,
    codEstadoProceso,
    desEstadoProceso,
    codProceso: getOptionalString(item, "codProceso"),
    desProceso: getOptionalString(item, "desProceso"),
    nomArchivoImportacion: getOptionalString(item, "nomArchivoImportacion"),
    archivoReporte,
    nomArchivoReporte: archivoReporte?.nomArchivoReporte,
    codTipoArchivoReporte: archivoReporte?.codTipoArchivoReporte,
  };
}

export function parseSirePeriodsResponse(payload: unknown): SirePeriodYear[] {
  if (!Array.isArray(payload)) {
    throw new SireServiceError(
      "SUNAT respondio con una estructura de periodos distinta a la documentada."
    );
  }

  return payload.map((yearItem, yearIndex) => {
    if (!isRecord(yearItem)) {
      throw new SireServiceError(
        `SUNAT envio un bloque de periodos invalido en la posicion ${yearIndex}.`
      );
    }

    const lisPeriodos = yearItem.lisPeriodos;

    if (!Array.isArray(lisPeriodos)) {
      throw new SireServiceError(
        `SUNAT no envio el campo periodos[${yearIndex}].lisPeriodos.`
      );
    }

    return {
      numEjercicio: getRequiredString(
        yearItem,
        "numEjercicio",
        `periodos[${yearIndex}]`
      ),
      desEstado: getRequiredString(
        yearItem,
        "desEstado",
        `periodos[${yearIndex}]`
      ),
      lisPeriodos: lisPeriodos.map((periodItem, periodIndex) => {
        if (!isRecord(periodItem)) {
          throw new SireServiceError(
            `SUNAT envio un periodo invalido en periodos[${yearIndex}].lisPeriodos[${periodIndex}].`
          );
        }

        return {
          perTributario: getRequiredString(
            periodItem,
            "perTributario",
            `periodos[${yearIndex}].lisPeriodos[${periodIndex}]`
          ),
          codEstado: getRequiredString(
            periodItem,
            "codEstado",
            `periodos[${yearIndex}].lisPeriodos[${periodIndex}]`
          ),
          desEstado: getRequiredString(
            periodItem,
            "desEstado",
            `periodos[${yearIndex}].lisPeriodos[${periodIndex}]`
          ),
        };
      }),
    };
  });
}

export function parseSireProposalTicketResponse(
  payload: unknown
): SireSalesProposalTicketResponse {
  if (typeof payload === "string" && payload.trim()) {
    return { numTicket: payload.trim() };
  }

  if (!isRecord(payload)) {
    throw new SireServiceError(
      "SUNAT respondio con una estructura de ticket de propuesta distinta a la documentada."
    );
  }

  const numTicket = getOptionalString(payload, "numTicket");

  if (!numTicket) {
    throw new SireServiceError(
      "SUNAT no envio el campo numTicket en la respuesta de propuesta."
    );
  }

  return { numTicket };
}

export function validatePeriodo(periodo: string) {
  if (!/^\d{6}$/.test(periodo)) {
    throw new SireServiceError("El periodo debe tener el formato AAAAMM.");
  }
}

export function normalizeTicketNumber(ticketNumber: string) {
  return ticketNumber.trim().replace(/\s+/g, "");
}

export function validateTicketNumber(ticketNumber: string) {
  const normalizedTicketNumber = normalizeTicketNumber(ticketNumber);

  if (!normalizedTicketNumber) {
    throw new SireServiceError("Indica un numero de ticket valido.");
  }

  if (!/^\d{8,20}$/.test(normalizedTicketNumber)) {
    throw new SireServiceError(
      "El numero de ticket solo debe contener digitos."
    );
  }

  return normalizedTicketNumber;
}

export function validateFileType(
  fileType: string
): asserts fileType is SireProposalFileTypeCode {
  if (fileType !== "0" && fileType !== "1") {
    throw new SireServiceError("El tipo de archivo debe ser 0 (TXT) o 1 (XLS).");
  }
}

export function maskSecretLikeValue(value: string) {
  const trimmedValue = value.trim();

  if (trimmedValue.length <= 4) {
    return "*".repeat(trimmedValue.length);
  }

  return `${trimmedValue.slice(0, 3)}***${trimmedValue.slice(-3)}`;
}

export function getTokenPreview(value: string) {
  const trimmedValue = value.trim();

  if (trimmedValue.length <= 16) {
    return maskSecretLikeValue(trimmedValue);
  }

  return `${trimmedValue.slice(0, 8)}...${trimmedValue.slice(-8)}`;
}

export function buildMaskedCredentialSnapshot(
  companyId: string,
  credentials: ResolvedSireCredentials
) {
  return {
    companyId,
    ruc: maskSecretLikeValue(credentials.ruc),
    solUser: maskSecretLikeValue(credentials.solUser),
    solUsername: maskSecretLikeValue(
      buildSolUsername(credentials.ruc, credentials.solUser)
    ),
    clientId: maskSecretLikeValue(credentials.clientId),
  };
}

export function buildTokenDebugPayload(
  companyId: string,
  tokenResponse: SireAccessTokenResponse
) {
  const payload: Record<string, unknown> = {
    companyId,
    tokenType: tokenResponse.token_type,
    tokenLength: tokenResponse.access_token?.length ?? 0,
    tokenPreview: getTokenPreview(tokenResponse.access_token),
    authHeaderPreview: `Bearer ${getTokenPreview(tokenResponse.access_token)}`,
    expiresIn: tokenResponse.expires_in,
    scope: tokenResponse.scope ?? SIRE_SCOPE,
  };

  return payload;
}

export type SireConfigPayload = Awaited<
  ReturnType<() => Promise<SireConfigFormData>>
>;

export function getRuntimeCacheValue<T>(
  cache: Map<string, RuntimeCacheEntry<T>>,
  key: string
) {
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  if (entry.expiresAtMs <= Date.now()) {
    return null;
  }

  return entry.value;
}

export function setRuntimeCacheValue<T>(
  cache: Map<string, RuntimeCacheEntry<T>>,
  key: string,
  value: T,
  ttlMs: number
) {
  cache.set(key, {
    value,
    expiresAtMs: Date.now() + ttlMs,
  });
}
