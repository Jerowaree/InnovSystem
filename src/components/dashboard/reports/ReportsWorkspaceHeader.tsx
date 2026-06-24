"use client";

import { Plus } from "lucide-react";
import type { DashboardPeriod } from "@/features/dashboard/lib/dashboardPeriods";
import type { ReportSourceState } from "@/components/dashboard/reports/reportsWorkspaceUtils";

interface ReportsWorkspaceHeaderProps {
  hasRealData: boolean;
  message: string | null;
  onExportSummary: () => void;
  periods: DashboardPeriod[];
  selectedPeriod: DashboardPeriod;
  sourceState: ReportSourceState;
  onSelectPeriod: (periodKey: string) => void;
}

export function ReportsWorkspaceHeader({
  hasRealData,
  message,
  onExportSummary,
  periods,
  selectedPeriod,
  sourceState,
  onSelectPeriod,
}: ReportsWorkspaceHeaderProps) {
  return (
    <section className="rounded-[20px] border border-white/80 bg-white px-5 py-5 shadow-[0_24px_48px_-42px_rgba(15,23,42,0.28)]">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Reportes del sistema
          </div>
          <h2 className="mt-4 text-xl font-semibold text-slate-950">
            Exportacion de reportes operativos y control del periodo
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Desde aqui puedes trabajar con el periodo de tu empresa, revisar la
            referencia de SUNAT y exportar archivos para seguimiento interno.
          </p>
        </div>

        <div className="flex flex-col gap-2 xl:items-end">
          <button
            type="button"
            onClick={onExportSummary}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
          >
            <Plus className="h-4 w-4" />
            Exportar resumen del periodo
          </button>
          <p className="text-xs text-slate-500">
            Genera un Excel con el resumen visible de esta pantalla.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
            Periodo de trabajo
          </p>
          <select
            value={selectedPeriod.key}
            onChange={(event) => onSelectPeriod(event.target.value)}
            className="mt-3 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
          >
            {periods.map((period) => (
              <option key={period.key} value={period.key}>
                {period.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-slate-500">
            {selectedPeriod.sirePeriodCode
              ? `Codigo SUNAT: ${selectedPeriod.sirePeriodCode}`
              : "Este periodo se basa en la informacion interna del sistema."}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
            Fuente del periodo
          </p>
          <p className="mt-3 text-sm font-semibold text-slate-900">
            {sourceState.label}
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            {sourceState.detail}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
            Estado del panel
          </p>
          <div className="mt-3 inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
            {hasRealData ? "Con datos reales" : "Modo demostracion"}
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            {message}
          </p>
        </div>
      </div>
    </section>
  );
}
