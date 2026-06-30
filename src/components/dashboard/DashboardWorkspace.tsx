"use client";

import { useMemo, useState } from "react";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import DashboardPeriodPicker from "@/components/dashboard/DashboardPeriodPicker";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardSidebarCards from "@/components/dashboard/DashboardSidebarCards";
import DashboardSummary from "@/components/dashboard/DashboardSummary";
import MovementTable from "@/components/dashboard/MovementTable";
import {
  buildDashboardPeriods,
  buildDashboardPeriodsFromSire,
  ensureDashboardPeriods,
  filterMovementsByPeriod,
  filterReportsByPeriod,
  mergeDashboardPeriods,
} from "@/features/dashboard/lib/dashboardPeriods";
import { buildDashboardViewModel } from "@/features/dashboard/lib/dashboardViewModel";
import type { DashboardData } from "@/services/dashboardServiceServer";
import type { SireDashboardContext } from "@/types/sire";

interface DashboardWorkspaceProps {
  data: DashboardData;
  sireContext: SireDashboardContext;
}

export default function DashboardWorkspace({
  data,
  sireContext,
}: DashboardWorkspaceProps) {
  const hasMovementData = data.movements.length > 0;
  const shouldUseSirePeriods =
    !hasMovementData &&
    (sireContext.periodCodes.length > 0 ||
      data.source.sirePeriodCodes.length > 0) &&
    !data.source.usesSireProposalData;
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
    () => {
      if (hasMovementData) {
        return ensureDashboardPeriods(
          mergeDashboardPeriods(movementPeriods, sirePeriods)
        );
      }

      if (shouldUseSirePeriods) {
        return ensureDashboardPeriods(sirePeriods);
      }

      return ensureDashboardPeriods(movementPeriods);
    },
    [
      hasMovementData,
      movementPeriods,
      sirePeriods,
      shouldUseSirePeriods,
    ]
  );
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(() =>
    Math.max(0, periods.length - 1)
  );
  const safeSelectedPeriodIndex =
    periods.length === 0
      ? 0
      : Math.min(selectedPeriodIndex, periods.length - 1);
  const selectedPeriod = periods[safeSelectedPeriodIndex];
  const filteredMovements = filterMovementsByPeriod(
    data.movements,
    selectedPeriod
  );
  const filteredReports = filterReportsByPeriod(data.reports, selectedPeriod);
  const viewModel = buildDashboardViewModel({
    company: data.company,
    profile: data.profile,
    movements: filteredMovements,
    reports: filteredReports,
  });

  viewModel.dateRangeLabel = selectedPeriod.label;

  return (
    <DashboardShell viewModel={viewModel}>
      <div className="space-y-5">
        <section className="rounded-[18px] border border-slate-200 bg-white px-4 py-4 shadow-[0_24px_48px_-42px_rgba(15,23,42,0.28)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-950">
                Periodo del Dashboard
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {selectedPeriod.label}
                {selectedPeriod.sirePeriodCode
                  ? ` | Codigo SUNAT ${selectedPeriod.sirePeriodCode}`
                  : ""}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Genera un ticket desde reportes y elige el periodo para que la
                informacion aparezca aqui
              </p>
            </div>

            <DashboardPeriodPicker
              periods={periods}
              selectedPeriod={selectedPeriod}
              selectedPeriodIndex={safeSelectedPeriodIndex}
              onSelectPeriod={setSelectedPeriodIndex}
            />
          </div>
        </section>

        <DashboardSummary viewModel={viewModel} />

        <DashboardCharts
          series={viewModel.chartSeries}
          lineChartTitle={viewModel.lineChartTitle}
          showPurchasesSeries={viewModel.showPurchasesSeries}
          distribution={viewModel.expenseDistribution}
          distributionTitle={viewModel.distributionTitle}
          distributionTotal={viewModel.distributionTotal}
          distributionEmptyTitle={viewModel.distributionEmptyTitle}
          distributionEmptyDescription={viewModel.distributionEmptyDescription}
        />

        <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
          <MovementTable movements={viewModel.recentMovements} />
          <DashboardSidebarCards
            reports={viewModel.reports}
            company={viewModel.company}
          />
        </div>
      </div>
    </DashboardShell>
  );
}
