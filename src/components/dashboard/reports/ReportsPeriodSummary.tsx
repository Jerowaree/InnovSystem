"use client";

import { BarChart3, Info } from "lucide-react";
import type { WorkspaceSummaryItem } from "@/components/dashboard/reports/reportsWorkspaceUtils";

interface ReportsPeriodSummaryProps {
  periodLabel: string;
  periodSourceLabel: string;
  sirePeriodCode?: string;
  summaryItems: WorkspaceSummaryItem[];
}

export function ReportsPeriodSummary({
  periodLabel,
  periodSourceLabel,
  sirePeriodCode,
  summaryItems,
}: ReportsPeriodSummaryProps) {
  return (
    <article className="rounded-[18px] border border-white/80 bg-white px-5 py-5 shadow-[0_24px_48px_-42px_rgba(15,23,42,0.28)]">
      <h2 className="text-lg font-semibold text-slate-950">
        Resumen del periodo
      </h2>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
        <p className="text-sm font-semibold text-slate-900">{periodLabel}</p>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Base de trabajo: {periodSourceLabel}
          {sirePeriodCode ? ` | Codigo SUNAT ${sirePeriodCode}` : ""}
        </p>
      </div>

      <div className="mt-4 space-y-4">
        {summaryItems.map((item) => (
          <div
            key={item.label}
            className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-4"
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${item.tone}`}
            >
              <BarChart3 className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900">
                {item.label}
              </p>
              <p className="mt-1 text-xs text-slate-500">{item.description}</p>
            </div>
            <p className="text-sm font-semibold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-600">
            <Info className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Lectura recomendada
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Usa este resumen para revisar tu operacion del mes. Si luego
              deseas contrastarlo con SUNAT, trabaja tambien desde el panel de
              SIRE Ventas de esta misma pagina.
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
