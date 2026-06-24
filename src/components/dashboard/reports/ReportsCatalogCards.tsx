"use client";

import { Download } from "lucide-react";
import type {
  WorkspaceReportCard,
  WorkspaceReportType,
} from "@/components/dashboard/reports/reportsWorkspaceUtils";

interface ReportsCatalogCardsProps {
  cards: WorkspaceReportCard[];
  onExport: (type: WorkspaceReportType) => void;
}

export function ReportsCatalogCards({
  cards,
  onExport,
}: ReportsCatalogCardsProps) {
  return (
    <section className="grid gap-4 xl:grid-cols-3">
      {cards.map((card) => (
        <article
          key={card.title}
          className="rounded-[18px] border border-white/80 bg-white px-5 py-5 shadow-[0_24px_48px_-42px_rgba(15,23,42,0.28)]"
        >
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${card.iconTone}`}
            >
              <card.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate-950">
                {card.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {card.description}
              </p>
            </div>
          </div>

          <p className="mt-4 rounded-xl bg-slate-50 px-3 py-3 text-xs leading-5 text-slate-500">
            {card.helperText}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                {card.secondaryLabel}
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-900">
                {card.secondaryValue}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                {card.metricLabel}
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-900">
                {card.metricValue}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onExport(card.type)}
            className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${card.actionTone}`}
          >
            <Download className="h-4 w-4" />
            Exportar Excel
          </button>
        </article>
      ))}
    </section>
  );
}
