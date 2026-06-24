import type { SireAccessTokenResponse } from "@/types/sire";
import {
  buildTokenDebugPayload,
  SIRE_SCOPE,
} from "@/services/sunat/sire/shared";

export interface SunatDiagnosticInput {
  operation: string;
  endpoint: string;
  response: Response;
}

export function isDevelopmentEnvironment() {
  return process.env.NODE_ENV !== "production";
}

export async function logSunatDiagnostic({
  operation,
  endpoint,
  response,
}: SunatDiagnosticInput) {
  if (!isDevelopmentEnvironment()) {
    return;
  }

  try {
    const preview = (await response.clone().text())
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 240);

    console.warn("[SUNAT DEBUG]", {
      operation,
      endpoint,
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get("content-type") ?? "unknown",
      preview,
    });
  } catch (error) {
    console.warn("[SUNAT DEBUG]", {
      operation,
      endpoint,
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get("content-type") ?? "unknown",
      preview: "No se pudo leer la respuesta de SUNAT para diagnostico.",
      error: error instanceof Error ? error.message : "unknown",
    });
  }
}

export function logTokenDebug(
  companyId: string,
  tokenResponse: SireAccessTokenResponse
) {
  if (!isDevelopmentEnvironment()) {
    return;
  }

  const payload = buildTokenDebugPayload(companyId, tokenResponse);

  console.info("[SIRE TOKEN DEBUG]", payload);
}

export function logSireAuthDebug(payload: Record<string, unknown>) {
  if (!isDevelopmentEnvironment()) {
    return;
  }

  console.info("[SIRE AUTH DEBUG]", payload);
}

export async function logSunatModuleProbe(input: {
  companyId: string;
  moduleName: string;
  endpoint: string;
  accessToken: string;
}) {
  if (!isDevelopmentEnvironment()) {
    return;
  }

  try {
    const response = await fetch(input.endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${input.accessToken}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    const preview = (await response.text())
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 180);

    console.info("[SUNAT MODULE DEBUG]", {
      companyId: input.companyId,
      moduleName: input.moduleName,
      endpoint: input.endpoint,
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get("content-type") ?? "unknown",
      preview,
      tokenScope: SIRE_SCOPE,
    });
  } catch (error) {
    console.info("[SUNAT MODULE DEBUG]", {
      companyId: input.companyId,
      moduleName: input.moduleName,
      endpoint: input.endpoint,
      error: error instanceof Error ? error.message : "unknown",
    });
  }
}
