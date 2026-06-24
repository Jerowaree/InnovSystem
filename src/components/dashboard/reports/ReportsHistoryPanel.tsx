"use client";

import { Download } from "lucide-react";
import type { DashboardReportItem } from "@/features/dashboard/lib/dashboardViewModel";
import type { Report } from "@/types/db";
import {
  buildGeneratedByLabel,
  buildReportStatusLabel,
  getHistoryEmptyState,
  getReportIconForHistory,
} from "@/components/dashboard/reports/reportsWorkspaceUtils";

interface ReportsHistoryPanelProps {
  hasRealData: boolean;
  onExportReport: (title: string) => void;
  reports: DashboardReportItem[];
  reportsRaw: Report[];
  selectedPeriodLabel: string;
}

export function ReportsHistoryPanel({
  hasRealData,
  onExportReport,
  reports,
  reportsRaw,
  selectedPeriodLabel,
}: ReportsHistoryPanelProps) {
  const HistoryIcon = getReportIconForHistory();

  return (
    <article className="rounded-[18px] border border-white/80 bg-white px-5 py-5 shadow-[0_24px_48px_-42px_rgba(15,23,42,0.28)]">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-slate-950">
          Reportes guardados en el sistema
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          Aqui ves los archivos registrados para el periodo seleccionado y
          puedes volver a exportar una version de apoyo.
        </p>
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-100">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[1.1fr_1.5fr_1fr_0.9fr_1fr_0.9fr_0.8fr] gap-3 bg-slate-50 px-4 py-3 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
            <span>Fecha</span>
            <span>Reporte</span>
            <span>Periodo</span>
            <span>Formato</span>
            <span>Origen</span>
            <span>Estado</span>
            <span>Accion</span>
          </div>

          {reports.length > 0 ? (
            reports.map((report, index) => {
              const rawReport = reportsRaw[index];
              const generatedBy = rawReport
                ? buildGeneratedByLabel(rawReport)
                : "Sistema";
              const statusLabel = rawReport
                ? buildReportStatusLabel(rawReport)
                : "Disponible";

              return (
                <div
                  key={report.id}
                  className="grid grid-cols-[1.1fr_1.5fr_1fr_0.9fr_1fr_0.9fr_0.8fr] gap-3 border-t border-slate-100 px-4 py-4 text-sm text-slate-700"
                >
                  <span>{report.generatedAt}</span>
                  <span className="flex items-center gap-2 font-medium text-slate-900">
                    <HistoryIcon className="h-4 w-4 text-emerald-600" />
                    {report.title}
                  </span>
                  <span>{selectedPeriodLabel}</span>
                  <span>XLSX</span>
                  <span>{generatedBy}</span>
                  <span className="inline-flex w-fit rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    {statusLabel}
                  </span>
                  <button
                    type="button"
                    onClick={() => onExportReport(report.title)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                    aria-label={`Exportar ${report.title}`}
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-6 text-sm text-slate-500">
              {getHistoryEmptyState(hasRealData)}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
