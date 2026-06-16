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
    <div className="grid gap-5 xl:grid-cols-1">
      <section className="rounded-[28px] border border-white/80 bg-white px-5 py-5 shadow-[0_30px_60px_-45px_rgba(15,23,42,0.35)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-950">
            Reportes Generados
          </h2>
          <span className="text-xs font-medium text-[#2F6BFF]">Ver todos</span>
        </div>

        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-500">
              Aún no hay reportes generados para esta empresa.
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3"
              >
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF7EF] text-[#16A34A]">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {report.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {report.generatedAt}
                  </p>
                </div>
                <a
                  href={report.fileUrl || "#"}
                  className="text-slate-400 transition hover:text-slate-700"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/80 bg-white px-5 py-5 shadow-[0_30px_60px_-45px_rgba(15,23,42,0.35)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-950">
            Información SUNAT
          </h2>
          <span className="text-xs text-slate-400">Actualizado hace 2 min</span>
        </div>

        <div className="space-y-4 text-sm">
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-3">
            <div>
              <p className="text-xs tracking-[0.16em] text-slate-400 uppercase">
                RUC
              </p>
              <p className="mt-1 font-semibold text-slate-900">{company.ruc}</p>
            </div>
            <div>
              <p className="text-xs tracking-[0.16em] text-slate-400 uppercase">
                Estado
              </p>
              <span className="mt-1 inline-flex rounded-full bg-[#EAF7EF] px-2.5 py-1 text-xs font-semibold text-[#16A34A]">
                ACTIVO
              </span>
            </div>
            <div>
              <p className="text-xs tracking-[0.16em] text-slate-400 uppercase">
                Condición
              </p>
              <p className="mt-1 font-semibold text-slate-900">HABIDO</p>
            </div>
          </div>

          <div>
            <p className="text-xs tracking-[0.16em] text-slate-400 uppercase">
              Razón social
            </p>
            <p className="mt-1 font-semibold text-slate-950">
              {company.business_name}
            </p>
          </div>

          <button className="inline-flex items-center text-sm font-semibold text-[#2F6BFF]">
            Ver más información
          </button>
        </div>
      </section>
    </div>
  );
}
