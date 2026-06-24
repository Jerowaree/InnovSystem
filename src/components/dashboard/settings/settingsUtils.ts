import {
  defaultApiBaseUrl,
  defaultSecurityBaseUrl,
} from "@/schemas/sireSchemas";
import type {
  SireConfigFormData,
  SireConfigSummary,
  SireStatusResponse,
} from "@/types/sire";

export const emptyStatus: SireStatusResponse = {
  configured: false,
  checkedAt: null,
  message: "Todavia no hemos probado tu conexion con SUNAT.",
  missingFields: [],
  auth: {
    ok: false,
    message: "Completa tus datos y guardalos para empezar.",
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
      code: "140000",
      ok: false,
      years: 0,
      periods: 0,
      message: "Aun no hemos revisado este modulo.",
      accessState: "error",
    },
    rce: {
      code: "080000",
      ok: false,
      years: 0,
      periods: 0,
      message: "Aun no hemos revisado este modulo.",
      accessState: "error",
    },
  },
};

export function getDefaultValues(
  companyRuc: string,
  initialSireConfig: SireConfigSummary | null
): SireConfigFormData {
  return {
    ruc: initialSireConfig?.ruc ?? companyRuc,
    solUser: initialSireConfig?.solUser ?? "",
    solPassword: "",
    clientId: initialSireConfig?.clientId ?? "",
    clientSecret: "",
    securityBaseUrl:
      initialSireConfig?.securityBaseUrl ?? defaultSecurityBaseUrl,
    apiBaseUrl: initialSireConfig?.apiBaseUrl ?? defaultApiBaseUrl,
  };
}

export function inputClassName(error?: string) {
  return `h-11 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 transition outline-none placeholder:text-slate-400 focus:ring-4 ${
    error
      ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10"
      : "border-slate-200 focus:border-[#2563EB] focus:ring-[#2563EB]/10"
  }`;
}

export function formatDate(value: string | null) {
  if (!value) {
    return "Aun sin prueba";
  }

  const formatter = new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Lima",
  });

  const parts = formatter.formatToParts(new Date(value));
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const day = getPart("day");
  const month = getPart("month");
  const year = getPart("year");
  const hour = getPart("hour");
  const minute = getPart("minute");
  const dayPeriod = getPart("dayPeriod").replace(/\s+/g, " ").trim();

  return `${day} ${month} ${year}, ${hour}:${minute} ${dayPeriod}`;
}
