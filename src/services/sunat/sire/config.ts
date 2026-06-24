import { decryptSecret, encryptSecret } from "@/lib/server/secretCipher";
import { createSireConfigSchema } from "@/schemas/sireSchemas";
import {
  getSunatSireConfigByCompanyIdServer,
  upsertSunatSireConfigServer,
} from "@/services/server/repositories/sunatSireConfigRepository";
import { listSunatSireSalesTicketsByCompanyServer } from "@/services/server/repositories/sunatSireSalesTicketRepository";
import { listSunatSireSalesTicketsByCompanyPaginatedServer } from "@/services/server/repositories/sunatSireSalesTicketRepository";
import {
  assertAllowedSunatUrl,
  normalizeText,
  ResolvedSireCredentials,
  SireServiceError,
} from "@/services/sunat/sire/shared";
import type { SunatSireConfig } from "@/types/db";
import type {
  SireConfigFormData,
  SireConfigSummary,
  SireSalesTicketHistoryPage,
  SireSalesTicketSummary,
} from "@/types/sire";
import { ValidationError } from "yup";

export function mapConfigSummary(record: SunatSireConfig): SireConfigSummary {
  return {
    id: record.id,
    companyId: record.company_id,
    ruc: record.ruc,
    solUser: record.sol_user,
    clientId: record.client_id,
    securityBaseUrl: record.security_base_url,
    apiBaseUrl: record.api_base_url,
    hasSolPassword: Boolean(record.sol_password_encrypted),
    hasClientSecret: Boolean(record.client_secret_encrypted),
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    lastTestedAt: record.last_tested_at,
    lastTestStatus: record.last_test_status,
    lastTestMessage: record.last_test_message,
  };
}

export function mapSalesTicketSummary(
  record: import("@/types/db").SunatSireSalesTicket
): SireSalesTicketSummary {
  return {
    id: record.id,
    periodo: record.periodo,
    ticketNumber: record.ticket_number,
    fileTypeCode: record.file_type_code,
    processStatus: record.process_status,
    reportFileName: record.report_file_name,
    reportFileTypeCode: record.report_file_type_code,
    updatedAt: record.updated_at,
  };
}

function resolveMissingSecret(
  currentValue: string,
  existingEncryptedValue: string | null | undefined,
  label: string
) {
  if (currentValue) {
    return currentValue;
  }

  if (existingEncryptedValue) {
    return decryptSecret(existingEncryptedValue);
  }

  throw new SireServiceError(`Completa el campo ${label}.`);
}

export async function validateSireConfigPayload(
  payload: SireConfigFormData,
  existing: SunatSireConfig | null
) {
  try {
    const schema = createSireConfigSchema({
      hasStoredSolPassword: Boolean(existing?.sol_password_encrypted),
      hasStoredClientSecret: Boolean(existing?.client_secret_encrypted),
    });

    const normalized = await schema.validate(payload, {
      abortEarly: false,
      stripUnknown: true,
    });

    const securityBaseUrl = normalizeText(normalized.securityBaseUrl).replace(
      /\/+$/,
      ""
    );
    const apiBaseUrl = normalizeText(normalized.apiBaseUrl).replace(/\/+$/, "");

    assertAllowedSunatUrl(securityBaseUrl, "URL de seguridad");
    assertAllowedSunatUrl(apiBaseUrl, "URL base de SIRE");

    return {
      ruc: normalizeText(normalized.ruc),
      solUser: normalizeText(normalized.solUser),
      solPassword: normalized.solPassword.trim(),
      clientId: normalizeText(normalized.clientId),
      clientSecret: normalized.clientSecret.trim(),
      securityBaseUrl,
      apiBaseUrl,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      const messages = error.inner
        .map((item) => item.message)
        .filter(Boolean);

      throw new SireServiceError(messages[0] ?? error.message);
    }

    if (error instanceof Error) {
      throw new SireServiceError(error.message);
    }

    throw new SireServiceError("No se pudo validar la configuracion SIRE.");
  }
}

export function resolveCredentialsFromSources(
  normalized: Awaited<ReturnType<typeof validateSireConfigPayload>>,
  existing: SunatSireConfig | null
): ResolvedSireCredentials {
  return {
    ruc: normalized.ruc,
    solUser: normalized.solUser,
    clientId: normalized.clientId,
    securityBaseUrl: normalized.securityBaseUrl,
    apiBaseUrl: normalized.apiBaseUrl,
    solPassword: resolveMissingSecret(
      normalized.solPassword,
      existing?.sol_password_encrypted,
      "Clave SOL"
    ),
    clientSecret: resolveMissingSecret(
      normalized.clientSecret,
      existing?.client_secret_encrypted,
      "Client Secret"
    ),
  };
}

export async function getSireConfigSummary(companyId: string) {
  const result = await getSunatSireConfigByCompanyIdServer(companyId);

  if (result.error) {
    throw result.error;
  }

  return result.data ? mapConfigSummary(result.data) : null;
}

export async function listSireSalesTicketsForCompany(companyId: string) {
  const result = await listSunatSireSalesTicketsByCompanyServer(companyId);

  if (result.error) {
    throw result.error;
  }

  return result.data.map(mapSalesTicketSummary);
}

export async function listSireSalesTicketsPageForCompany(
  companyId: string,
  input: {
    page: number;
    perPage: number;
  }
): Promise<SireSalesTicketHistoryPage> {
  const result = await listSunatSireSalesTicketsByCompanyPaginatedServer(
    companyId,
    input
  );

  if (result.error) {
    throw result.error;
  }

  return {
    tickets: result.data.map(mapSalesTicketSummary),
    page: result.page,
    perPage: result.perPage,
    totalCount: result.count,
    totalPages: result.totalPages,
    hasNextPage: result.hasNextPage,
    hasPreviousPage: result.hasPreviousPage,
  };
}

export async function getCompanySireCredentials(companyId: string) {
  const configResult = await getSunatSireConfigByCompanyIdServer(companyId);

  if (configResult.error) {
    throw configResult.error;
  }

  if (!configResult.data) {
    throw new SireServiceError(
      "Primero guarda tus datos de SUNAT en la configuracion."
    );
  }

  const normalized = await validateSireConfigPayload(
    {
      ruc: configResult.data.ruc,
      solUser: configResult.data.sol_user,
      solPassword: "",
      clientId: configResult.data.client_id,
      clientSecret: "",
      securityBaseUrl: configResult.data.security_base_url,
      apiBaseUrl: configResult.data.api_base_url,
    },
    configResult.data
  );

  return resolveCredentialsFromSources(normalized, configResult.data);
}

export async function saveSireConfigForCompany(
  companyId: string,
  payload: SireConfigFormData
) {
  const existingResult = await getSunatSireConfigByCompanyIdServer(companyId);

  if (existingResult.error) {
    throw existingResult.error;
  }

  const normalized = await validateSireConfigPayload(
    payload,
    existingResult.data
  );
  const resolved = resolveCredentialsFromSources(normalized, existingResult.data);
  const upsertResult = await upsertSunatSireConfigServer({
    company_id: companyId,
    ruc: resolved.ruc,
    sol_user: resolved.solUser,
    sol_password_encrypted: encryptSecret(resolved.solPassword),
    client_id: resolved.clientId,
    client_secret_encrypted: encryptSecret(resolved.clientSecret),
    security_base_url: resolved.securityBaseUrl,
    api_base_url: resolved.apiBaseUrl,
    last_tested_at: existingResult.data?.last_tested_at ?? null,
    last_test_status: existingResult.data?.last_test_status ?? null,
    last_test_message: existingResult.data?.last_test_message ?? null,
  });

  if (upsertResult.error || !upsertResult.data) {
    throw (
      upsertResult.error ?? new Error("No se pudo guardar la configuracion SIRE.")
    );
  }

  return mapConfigSummary(upsertResult.data);
}
