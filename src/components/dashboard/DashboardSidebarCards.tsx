import type { DashboardReportItem } from "@/features/dashboard/lib/dashboardViewModel";
import type { Company } from "@/types/db";
import { ExternalLink, FileSpreadsheet } from "lucide-react";

interface DashboardSidebarCardsProps {
  reports: DashboardReportItem[];
  company: Company;
}

export default function DashboardSidebarCards({
  reports,
  company,
}: DashboardSidebarCardsProps) {
  return (
    <div className="grid min-w-0 gap-5 xl:grid-cols-1">
      <section className="min-w-0 overflow-hidden rounded-[28px] border border-white/80 bg-white px-5 py-5 shadow-[0_30px_60px_-45px_rgba(15,23,42,0.35)]">
        <div className="mb-4 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-slate-950">
            Reportes Generados
          </h2>
          <span className="max-w-full break-words text-xs font-medium text-[#2F6BFF]">
            Ver todos
          </span>
        </div>

        <div className="min-w-0 space-y-3">
          {reports.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-500">
              Aun no hay reportes generados para esta empresa.
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="flex min-w-0 items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3"
              >
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EAF7EF] text-[#16A34A]">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm font-medium text-slate-900">
                    {report.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {report.generatedAt}
                  </p>
                </div>
                <a
                  href={report.fileUrl || "#"}
                  className="shrink-0 text-slate-400 transition hover:text-slate-700"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="min-w-0 overflow-hidden rounded-[28px] border border-white/80 bg-white px-5 py-5 shadow-[0_30px_60px_-45px_rgba(15,23,42,0.35)]">
        <div className="mb-4 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-slate-950">
            Informacion SUNAT
          </h2>
          <span className="max-w-full break-words text-xs text-slate-400">
            Actualizado hace 2 min
          </span>
        </div>

        <div className="min-w-0 space-y-4 text-sm">
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                RUC
              </p>
              <p className="mt-1 break-words font-semibold text-slate-900">
                {company.ruc}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                Estado
              </p>
              <span className="mt-1 inline-flex rounded-full bg-[#EAF7EF] px-2.5 py-1 text-xs font-semibold text-[#16A34A]">
                ACTIVO
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                Condicion
              </p>
              <p className="mt-1 font-semibold text-slate-900">HABIDO</p>
            </div>
          </div>

          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
              Razon social
            </p>
            <p className="mt-1 break-words font-semibold text-slate-950">
              {company.business_name}
            </p>
          </div>

          <button className="inline-flex max-w-full items-center break-words text-left text-sm font-semibold text-[#2F6BFF]">
            Ver mas informacion
          </button>
        </div>
      </section>
    </div>
  );
}
