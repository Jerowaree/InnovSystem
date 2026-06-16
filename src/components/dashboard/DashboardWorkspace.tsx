"use client";

import { useMemo, useState } from "react";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import DashboardShell from "@/components/dashboard/DashboardShell";
import DashboardSidebarCards from "@/components/dashboard/DashboardSidebarCards";
import DashboardSummary from "@/components/dashboard/DashboardSummary";
import MovementTable from "@/components/dashboard/MovementTable";
import { applyDashboardMockData } from "@/features/dashboard/lib/dashboardMockData";
import {
  buildDashboardPeriods,
  filterMovementsByPeriod,
  filterReportsByPeriod,
} from "@/features/dashboard/lib/dashboardPeriods";
import { buildDashboardViewModel } from "@/features/dashboard/lib/dashboardViewModel";
import type { DashboardData } from "@/services/dashboardServiceServer";

interface DashboardWorkspaceProps {
  data: DashboardData;
}

export default function DashboardWorkspace({ data }: DashboardWorkspaceProps) {
  const previewData = useMemo(() => applyDashboardMockData(data), [data]);
  const periods = buildDashboardPeriods(previewData.movements);
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(
    Math.max(0, periods.length - 1)
  );
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

  viewModel.dateRangeLabel = selectedPeriod.label;

  return (
    <DashboardShell
      viewModel={viewModel}
      dateSelector={{
        label: selectedPeriod.label,
        canGoBackward: selectedPeriodIndex > 0,
        canGoForward: selectedPeriodIndex < periods.length - 1,
        onPrevious: () =>
          setSelectedPeriodIndex((current) => Math.max(0, current - 1)),
        onNext: () =>
          setSelectedPeriodIndex((current) =>
            Math.min(periods.length - 1, current + 1)
          ),
      }}
    >
      <div className="space-y-5">
        <DashboardSummary viewModel={viewModel} />

        <DashboardCharts
          series={viewModel.chartSeries}
          distribution={viewModel.expenseDistribution}
          totalPurchases={viewModel.kpis[1]?.value ?? "S/ 0"}
        />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
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
