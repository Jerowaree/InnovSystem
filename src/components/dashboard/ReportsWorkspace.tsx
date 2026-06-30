"use client";

import Image from "next/image";
import { Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { LazySireSalesReportsPanel } from "@/components/dashboard/reports/LazySireSalesReportsPanel";
import {
  buildDashboardPeriods,
  buildDashboardPeriodsFromSire,
  ensureDashboardPeriods,
  filterMovementsByPeriod,
  filterReportsByPeriod,
  mergeDashboardPeriods,
  type DashboardPeriod,
} from "@/features/dashboard/lib/dashboardPeriods";
import { buildDashboardViewModel } from "@/features/dashboard/lib/dashboardViewModel";
import type { DashboardData } from "@/services/dashboardServiceServer";
import type { SireDashboardContext } from "@/types/sire";
import { exportWorkspaceReport } from "@/components/dashboard/reports/reportsWorkspaceExport";

interface ReportsWorkspaceProps {
  data: DashboardData;
  sireContext: SireDashboardContext;
}

interface ExportFeedbackState {
  type: "success" | "error" | null;
  message: string;
}

export default function ReportsWorkspace({
  data,
  sireContext,
}: ReportsWorkspaceProps) {
  const movementPeriods = useMemo(
    () => buildDashboardPeriods(data.movements),
    [data.movements]
  );
  const combinedSirePeriodCodes = useMemo(
    () =>
      Array.from(
        new Set([...data.source.sirePeriodCodes, ...sireContext.periodCodes])
      ),
    [data.source.sirePeriodCodes, sireContext.periodCodes]
  );
  const sirePeriods = useMemo(
    () => buildDashboardPeriodsFromSire(combinedSirePeriodCodes),
    [combinedSirePeriodCodes]
  );
  const periods = useMemo(
    () => ensureDashboardPeriods(mergeDashboardPeriods(movementPeriods, sirePeriods)),
    [movementPeriods, sirePeriods]
  );
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(() =>
    Math.max(0, periods.length - 1)
  );
  const [isExportingBalance, setIsExportingBalance] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<ExportFeedbackState>({
    type: null,
    message: "",
  });
  const safeSelectedPeriodIndex =
    periods.length === 0
      ? 0
      : Math.min(selectedPeriodIndex, periods.length - 1);
  const selectedPeriod = periods[safeSelectedPeriodIndex];
  const filteredMovements = filterMovementsByPeriod(data.movements, selectedPeriod);
  const filteredReports = filterReportsByPeriod(data.reports, selectedPeriod);
  const viewModel = buildDashboardViewModel({
    company: data.company,
    profile: data.profile,
    movements: filteredMovements,
    reports: filteredReports,
  });
  const totalSales = filteredMovements.reduce((total, movement) => {
    const value = movement.movement_type.trim().toLowerCase();
    return total + (value.includes("venta") || value.includes("ingreso") ? movement.amount : 0);
  }, 0);
  const totalExpenses = filteredMovements.reduce((total, movement) => {
    const value = movement.movement_type.trim().toLowerCase();
    return total + (value.includes("compra") || value.includes("gasto") || value.includes("egreso") ? movement.amount : 0);
  }, 0);
  const totalTaxes = filteredMovements.reduce(
    (total, movement) => total + (movement.tax_amount ?? 0),
    0
  );
  const netResult = totalSales - totalExpenses - totalTaxes;
  const isProfitable = netResult >= 0;
  const semaphoreState =
    netResult > 0 ? "green" : netResult < 0 ? "red" : "yellow";
  const formattedNetResult = `S/ ${Math.abs(netResult).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

  useEffect(() => {
    if (!exportFeedback.type) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setExportFeedback({ type: null, message: "" });
    }, 5000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [exportFeedback]);

  const exportAccountBalance = async () => {
    try {
      setIsExportingBalance(true);
      setExportFeedback({ type: null, message: "" });

      await exportWorkspaceReport({
        type: "balance",
        selectedPeriod: selectedPeriod as DashboardPeriod,
        companyName: data.company.business_name,
        companyRuc: data.company.ruc,
        movements: filteredMovements,
        reports: filteredReports,
        totalSalesLabel: viewModel.kpis[0]?.value ?? "S/ 0",
        totalPurchasesLabel: `S/ ${totalExpenses.toLocaleString("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}`,
        estimatedProfitLabel: `${isProfitable ? "Ganancia" : "Perdida"} ${formattedNetResult}`,
        igvLabel: `S/ ${totalTaxes.toLocaleString("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}`,
        totalSalesAmount: totalSales,
        totalPurchasesAmount: totalExpenses,
        estimatedProfitAmount: netResult,
        igvAmount: totalTaxes,
      });

      setExportFeedback({
        type: "success",
        message:
          "Tu archivo Excel ya se descargo correctamente. Puedes compartirlo o revisarlo ahora mismo.",
      });
    } catch (error) {
      setExportFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "No pudimos exportar el Excel en este momento. Vuelve a intentarlo.",
      });
    } finally {
      setIsExportingBalance(false);
    }
  };

  return (
    <DashboardShell viewModel={viewModel}>
      <div className="space-y-5">
        <LazySireSalesReportsPanel initialSireConfig={sireContext.config} />

        <section className="rounded-[20px] border border-white/80 bg-white px-5 py-5 shadow-[0_24px_48px_-42px_rgba(15,23,42,0.28)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-slate-950">
                Balance general de cuenta
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Revisa de forma directa si la empresa viene ganando o perdiendo
                en el periodo seleccionado y exporta un Excel para sustentarlo.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void exportAccountBalance()}
              disabled={isExportingBalance}
              className="inline-flex h-11 items-center justify-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
            >
              {isExportingBalance ? (
                <Loader2 className="h-[18px] w-[18px] animate-spin" />
              ) : (
                <Image
                  src="/excel.png"
                  alt="Excel"
                  width={18}
                  height={18}
                  className="h-[18px] w-[18px]"
                />
              )}
              {isExportingBalance ? "Exportando..." : "Exportar balance general"}
            </button>
          </div>

          {exportFeedback.type ? (
            <div
              className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
                exportFeedback.type === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {exportFeedback.message}
            </div>
          ) : null}

          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                    Periodo analizado
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {selectedPeriod.label}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {selectedPeriod.sirePeriodCode
                      ? `Codigo SUNAT ${selectedPeriod.sirePeriodCode}`
                      : "Basado en movimientos disponibles del sistema"}
                  </p>
                </div>

                <select
                  value={selectedPeriod.key}
                  onChange={(event) => {
                    const nextIndex = periods.findIndex(
                      (period) => period.key === event.target.value
                    );

                    if (nextIndex >= 0) {
                      setSelectedPeriodIndex(nextIndex);
                    }
                  }}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 sm:w-[280px]"
                >
                  {periods.map((period) => (
                    <option key={period.key} value={period.key}>
                      {period.sirePeriodCode
                        ? `${period.sirePeriodCode} - ${period.label}`
                        : period.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-white px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    Ingresos
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {viewModel.kpis[0]?.value ?? "S/ 0"}
                  </p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    Egresos
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    S/ {totalExpenses.toLocaleString("en-US")}
                  </p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    Impuestos
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    S/ {totalTaxes.toLocaleString("en-US")}
                  </p>
                </div>
                <div className="rounded-2xl bg-white px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                    Comprobantes
                  </p>
                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {filteredMovements.length}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`rounded-2xl border px-5 py-5 ${
                isProfitable
                  ? "border-emerald-200 bg-emerald-50/80"
                  : netResult < 0
                    ? "border-rose-200 bg-rose-50/80"
                    : "border-amber-200 bg-amber-50/80"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                    isProfitable
                      ? "bg-white text-emerald-600"
                      : netResult < 0
                        ? "bg-white text-rose-600"
                        : "bg-white text-amber-600"
                  }`}
                >
                  {isProfitable ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : netResult < 0 ? (
                    <TrendingDown className="h-5 w-5" />
                  ) : (
                    <div className="h-3.5 w-3.5 rounded-full bg-amber-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                      Semaforo
                    </span>
                    <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5">
                      <span
                        className={`h-3 w-3 rounded-full ${
                          semaphoreState === "green"
                            ? "bg-emerald-500 ring-4 ring-emerald-100"
                            : "bg-slate-200"
                        }`}
                      />
                      <span
                        className={`h-3 w-3 rounded-full ${
                          semaphoreState === "yellow"
                            ? "bg-amber-500 ring-4 ring-amber-100"
                            : "bg-slate-200"
                        }`}
                      />
                      <span
                        className={`h-3 w-3 rounded-full ${
                          semaphoreState === "red"
                            ? "bg-rose-500 ring-4 ring-rose-100"
                            : "bg-slate-200"
                        }`}
                      />
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    {netResult > 0
                      ? "La empresa esta ganando en este periodo"
                      : netResult < 0
                        ? "La empresa esta perdiendo en este periodo"
                        : "La empresa esta en equilibrio en este periodo"}
                  </p>
                  <p
                    className={`mt-3 text-2xl font-semibold ${
                      netResult > 0
                        ? "text-emerald-700"
                        : netResult < 0
                          ? "text-rose-700"
                          : "text-amber-700"
                    }`}
                  >
                    {netResult > 0 ? "+" : netResult < 0 ? "-" : ""}
                    {formattedNetResult}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Este resultado toma los ingresos del periodo y les descuenta
                    egresos e impuestos visibles en tus movimientos actuales.
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white/80 px-3 py-3">
                      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
                        Estado
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {netResult > 0
                          ? "Favorable"
                          : netResult < 0
                            ? "En riesgo"
                            : "Estable"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/80 px-3 py-3">
                      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
                        Flujo neto
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {netResult > 0 ? "Positivo" : netResult < 0 ? "Negativo" : "Neutro"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/80 px-3 py-3">
                      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
                        Decision sugerida
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {netResult > 0
                          ? "Mantener ritmo"
                          : netResult < 0
                            ? "Revisar costos"
                            : "Monitorear"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
