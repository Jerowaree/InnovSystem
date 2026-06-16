"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Plus,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { applyDashboardMockData } from "@/features/dashboard/lib/dashboardMockData";
import {
  buildDashboardPeriods,
  filterMovementsByPeriod,
  filterReportsByPeriod,
} from "@/features/dashboard/lib/dashboardPeriods";
import { buildDashboardViewModel } from "@/features/dashboard/lib/dashboardViewModel";
import type { DashboardData } from "@/services/dashboardServiceServer";

interface ReportsWorkspaceProps {
  data: DashboardData;
}

export default function ReportsWorkspace({ data }: ReportsWorkspaceProps) {
  const previewData = useMemo(() => applyDashboardMockData(data), [data]);
  const periods = useMemo(
    () => buildDashboardPeriods(previewData.movements),
    [previewData.movements]
  );
  const [selectedPeriodIndex] = useState(Math.max(0, periods.length - 1));
  const selectedPeriod = periods[selectedPeriodIndex];
  const filteredMovements = filterMovementsByPeriod(
    previewData.movements,
    selectedPeriod
  );
  const filteredReports = filterReportsByPeriod(
    previewData.reports,
    selectedPeriod
  );
  const viewModel = buildDashboardViewModel({
    company: previewData.company,
    profile: previewData.profile,
    movements: filteredMovements,
    reports: filteredReports,
  });

  const downloadEmptyExcel = async (reportTitle: string) => {
    const ExcelJS = await import("exceljs");
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(reportTitle);

    worksheet.columns = [
      { header: "Campo", key: "field", width: 24 },
      { header: "Valor", key: "value", width: 32 },
    ];

    worksheet.addRow({ field: "Reporte", value: reportTitle });
    worksheet.addRow({ field: "Periodo", value: selectedPeriod.label });
    worksheet.addRow({ field: "Estado", value: "Plantilla vacía" });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${reportTitle.toLowerCase().replace(/\s+/g, "-")}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const reportCards = [
    {
      title: "Reporte de Ventas",
      description:
        "Exporta el detalle de todas las ventas e ingresos del período seleccionado.",
      icon: BarChart3,
      tone: "bg-[#EAF7EF] text-[#16A34A]",
      actionTone: "bg-[#EEF9F1] text-[#16A34A]",
      metricLabel: "Total Ventas",
      metricValue: viewModel.kpis[0]?.value ?? "S/ 0",
      secondaryLabel: "Registros",
      secondaryValue: `${
        filteredMovements.filter((item) =>
          item.movement_type.toLowerCase().includes("venta")
        ).length
      }`,
    },
    {
      title: "Reporte de Compras",
      description:
        "Exporta el detalle de todas las compras y egresos del período seleccionado.",
      icon: ShoppingCart,
      tone: "bg-[#EEF4FF] text-[#2F6BFF]",
      actionTone: "bg-[#EEF4FF] text-[#2F6BFF]",
      metricLabel: "Total Compras",
      metricValue: viewModel.kpis[1]?.value ?? "S/ 0",
      secondaryLabel: "Registros",
      secondaryValue: `${
        filteredMovements.filter((item) =>
          item.movement_type.toLowerCase().match(/compra|gasto|egreso/)
        ).length
      }`,
    },
    {
      title: "Balance Financiero",
      description:
        "Exporta el balance general con activos, pasivos y patrimonio del período.",
      icon: Wallet,
      tone: "bg-[#F4EDFF] text-[#7C3AED]",
      actionTone: "bg-[#F4EDFF] text-[#7C3AED]",
      metricLabel: "Resultado Neto",
      metricValue: viewModel.kpis[2]?.value ?? "S/ 0",
      secondaryLabel: "Registros",
      secondaryValue: "-",
    },
  ];

  const summaryItems = [
    {
      label: "Total Ventas",
      description: "Ingresos en el período",
      value: viewModel.kpis[0]?.value ?? "S/ 0",
      tone: "text-[#16A34A] bg-[#EAF7EF]",
    },
    {
      label: "Total Compras",
      description: "Egresos en el período",
      value: viewModel.kpis[1]?.value ?? "S/ 0",
      tone: "text-[#DC2626] bg-[#FDECEC]",
    },
    {
      label: "Gasto Operativo",
      description: "Gastos administrativos",
      value: "S/ 18,250.00",
      tone: "text-[#2563EB] bg-[#EEF4FF]",
    },
    {
      label: "Resultado Neto",
      description: "Utilidad del período",
      value: viewModel.kpis[2]?.value ?? "S/ 0",
      tone: "text-[#7C3AED] bg-[#F4EDFF]",
    },
  ];

  return (
    <DashboardShell viewModel={viewModel}>
      <div className="space-y-5">
        <section className="rounded-[20px] border border-white/80 bg-white px-5 py-5 shadow-[0_24px_48px_-42px_rgba(15,23,42,0.28)]">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="mb-2 text-xs font-medium tracking-[0.14em] text-slate-400 uppercase">
                  Período
                </p>
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                  {selectedPeriod.label}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium tracking-[0.14em] text-slate-400 uppercase">
                  Tipo de reporte
                </p>
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                  Todos los reportes
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium tracking-[0.14em] text-slate-400 uppercase">
                  Estado
                </p>
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                  Todos
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 xl:items-end">
              <button
                type="button"
                onClick={() => downloadEmptyExcel("reporte-general")}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2F6BFF] px-5 text-sm font-semibold text-white transition hover:bg-[#2558D9]"
              >
                <Plus className="h-4 w-4" />
                Generar Reporte
              </button>
              <button className="inline-flex items-center justify-center gap-2 text-sm font-medium text-[#2F6BFF]">
                Programar reportes
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          {reportCards.map((card) => (
            <article
              key={card.title}
              className="rounded-[18px] border border-white/80 bg-white px-5 py-5 shadow-[0_24px_48px_-42px_rgba(15,23,42,0.28)]"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${card.tone}`}
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

              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <div>
                  <p className="text-xs tracking-[0.14em] text-slate-400 uppercase">
                    {card.secondaryLabel}
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    {card.secondaryValue}
                  </p>
                </div>
                <div>
                  <p className="text-xs tracking-[0.14em] text-slate-400 uppercase">
                    {card.metricLabel}
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    {card.metricValue}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => downloadEmptyExcel(card.title)}
                className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${card.actionTone}`}
              >
                <Download className="h-4 w-4" />
                Descargar Excel
              </button>
            </article>
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.85fr)]">
          <article className="rounded-[18px] border border-white/80 bg-white px-5 py-5 shadow-[0_24px_48px_-42px_rgba(15,23,42,0.28)]">
            <h2 className="text-lg font-semibold text-slate-950">
              Historial de Reportes Generados
            </h2>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
              <div className="grid grid-cols-[1.1fr_1.4fr_0.9fr_0.8fr_1fr_0.8fr_0.7fr] gap-3 bg-slate-50 px-4 py-3 text-xs font-medium tracking-[0.14em] text-slate-400 uppercase">
                <span>Fecha</span>
                <span>Reporte</span>
                <span>Período</span>
                <span>Formato</span>
                <span>Generado por</span>
                <span>Estado</span>
                <span>Acción</span>
              </div>

              {viewModel.reports.map((report) => (
                <div
                  key={report.id}
                  className="grid grid-cols-[1.1fr_1.4fr_0.9fr_0.8fr_1fr_0.8fr_0.7fr] gap-3 border-t border-slate-100 px-4 py-4 text-sm text-slate-700"
                >
                  <span>{report.generatedAt}</span>
                  <span className="flex items-center gap-2 font-medium text-slate-900">
                    <FileSpreadsheet className="h-4 w-4 text-[#16A34A]" />
                    {report.title}
                  </span>
                  <span>{selectedPeriod.label}</span>
                  <span>xlsx</span>
                  <span>Administrador</span>
                  <span className="inline-flex w-fit rounded-full bg-[#EAF7EF] px-2.5 py-1 text-xs font-semibold text-[#16A34A]">
                    Completado
                  </span>
                  <button
                    type="button"
                    onClick={() => downloadEmptyExcel(report.title)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[18px] border border-white/80 bg-white px-5 py-5 shadow-[0_24px_48px_-42px_rgba(15,23,42,0.28)]">
            <h2 className="text-lg font-semibold text-slate-950">
              Resumen del Período
            </h2>
            <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
              {selectedPeriod.label}
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
                    <p className="mt-1 text-xs text-slate-500">
                      {item.description}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <button className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#2F6BFF]">
              Ver análisis detallado
            </button>
          </article>
        </section>
      </div>
    </DashboardShell>
  );
}
