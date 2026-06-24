"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { BookCard, StatusPill } from "./SettingsUi";
import { formatDate } from "./settingsUtils";
import type { SireConfigSummary, SireStatusResponse } from "@/types/sire";

interface SireConnectionPanelProps {
  status: SireStatusResponse;
  savedConfig: SireConfigSummary | null;
  isTesting: boolean;
  isSubmitting: boolean;
  onTest: () => void;
}

export function SireConnectionPanel({
  status,
  savedConfig,
  isTesting,
  isSubmitting,
  onTest,
}: SireConnectionPanelProps) {
  const hasSireModuleAccess =
    status.diagnostics?.moduleAccess.rvie === true ||
    status.diagnostics?.moduleAccess.rce === true;
  const connectionReady = status.auth.ok && hasSireModuleAccess;
  const connectionLabel = status.auth.ok
    ? hasSireModuleAccess
      ? "Listo para usar"
      : "Pendiente en SUNAT"
    : "Sin conexion";

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-950">
              Revisar conexion
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Vamos a revisar si tu cuenta puede entrar correctamente a SUNAT.
              Si ya guardaste tu clave y tu secret, no necesitas volver a
              escribirlos para esta prueba.
            </p>
          </div>
          <button
            type="button"
            onClick={onTest}
            disabled={isTesting || isSubmitting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isTesting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isTesting ? "Revisando..." : "Probar conexion"}
          </button>
        </div>

        <div className="mt-4 rounded-xl bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">
                {status.message}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {status.auth.message}
              </p>
            </div>
            <StatusPill ok={connectionReady} label={connectionLabel} />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            <span suppressHydrationWarning>
              Ultima revision en pantalla: {formatDate(status.checkedAt)}
            </span>
          </p>
          {savedConfig?.lastTestedAt ? (
            <p className="mt-1 text-xs text-slate-500">
              <span suppressHydrationWarning>
                Ultima revision guardada: {formatDate(savedConfig.lastTestedAt)}
              </span>
            </p>
          ) : null}
        </div>

        {status.auth.ok && !hasSireModuleAccess ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">
              Tus datos estan bien, pero SUNAT todavia no habilita SIRE para esta empresa.
            </p>
            <p className="mt-2 text-sm leading-6 text-amber-800">
              Esto suele pasar cuando el RUC aun no figura como obligado o cuando
              el acceso al modulo todavia no esta activo en SUNAT.
            </p>
          </div>
        ) : null}

        {status.missingFields.length > 0 ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-800">
              Te falta completar
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {status.missingFields.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-white px-3 py-1 text-xs font-medium text-amber-800"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <BookCard title="RVIE - Ventas" {...status.books.rvie} />
        <BookCard title="RCE - Compras" {...status.books.rce} />
      </div>
    </>
  );
}
