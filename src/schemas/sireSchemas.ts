import * as yup from "yup";
import type { InferType } from "yup";

const defaultSecurityBaseUrl = "https://api-seguridad.sunat.gob.pe";
const defaultApiBaseUrl = "https://api-sire.sunat.gob.pe";

function optionalSecretSchema(hasStoredValue: boolean, label: string) {
  return hasStoredValue
    ? yup.string().trim().default("")
    : yup.string().trim().required(`${label} es obligatorio`);
}

export function createSireConfigSchema(options?: {
  hasStoredSolPassword?: boolean;
  hasStoredClientSecret?: boolean;
}) {
  const hasStoredSolPassword = Boolean(options?.hasStoredSolPassword);
  const hasStoredClientSecret = Boolean(options?.hasStoredClientSecret);

  return yup
    .object({
      ruc: yup
        .string()
        .trim()
        .required("El RUC es obligatorio")
        .matches(/^\d{11}$/, "El RUC debe tener 11 digitos"),
      solUser: yup
        .string()
        .trim()
        .required("El usuario SOL es obligatorio")
        .min(3, "El usuario SOL es muy corto")
        .max(32, "El usuario SOL es demasiado largo"),
      solPassword: optionalSecretSchema(
        hasStoredSolPassword,
        "La clave SOL"
      ).max(128, "La clave SOL es demasiado larga"),
      clientId: yup
        .string()
        .trim()
        .required("El Client ID es obligatorio")
        .min(12, "El Client ID es demasiado corto")
        .max(120, "El Client ID es demasiado largo"),
      clientSecret: optionalSecretSchema(
        hasStoredClientSecret,
        "El Client Secret"
      ).max(200, "El Client Secret es demasiado largo"),
      securityBaseUrl: yup
        .string()
        .trim()
        .required("La URL de seguridad es obligatoria")
        .url("La URL de seguridad no es valida")
        .default(defaultSecurityBaseUrl),
      apiBaseUrl: yup
        .string()
        .trim()
        .required("La URL base de SIRE es obligatoria")
        .url("La URL base de SIRE no es valida")
        .default(defaultApiBaseUrl),
    })
    .noUnknown()
    .required();
}

export const sireConfigSchema = createSireConfigSchema();

export type SireConfigSchemaValues = InferType<typeof sireConfigSchema>;
export { defaultApiBaseUrl, defaultSecurityBaseUrl };
