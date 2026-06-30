"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import CompactSelect, {
  type CompactSelectOption,
} from "@/components/CompactSelect";
import type { DashboardPeriod } from "@/features/dashboard/lib/dashboardPeriods";

interface DashboardPeriodPickerProps {
  periods: DashboardPeriod[];
  selectedPeriod: DashboardPeriod;
  selectedPeriodIndex: number;
  onSelectPeriod: (index: number) => void;
}

function formatCompactPeriodLabel(period: DashboardPeriod) {
  return new Intl.DateTimeFormat("es-PE", {
    month: "short",
    year: "numeric",
  }).format(new Date(period.year, period.month, 1));
}

export default function DashboardPeriodPicker({
  periods,
  selectedPeriod,
  selectedPeriodIndex,
  onSelectPeriod,
}: DashboardPeriodPickerProps) {
  const canGoBackward = selectedPeriodIndex > 0;
  const canGoForward = selectedPeriodIndex < periods.length - 1;
  const periodOptions = useMemo<CompactSelectOption[]>(
    () =>
      periods.map((period) => ({
        value: period.key,
        label: period.label,
        mobileLabel: period.sirePeriodCode
          ? `${period.sirePeriodCode} - ${formatCompactPeriodLabel(period)}`
          : formatCompactPeriodLabel(period),
        triggerLabel: period.sirePeriodCode
          ? `${period.sirePeriodCode} - ${period.label}`
          : period.label,
        menuLabel: period.sirePeriodCode ?? "Periodo",
        description: period.label,
      })),
    [periods]
  );

  return (
    <div className="relative flex w-full items-center gap-2 sm:w-auto">
      <button
        type="button"
        onClick={() => onSelectPeriod(Math.max(0, selectedPeriodIndex - 1))}
        disabled={!canGoBackward}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Periodo anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <CompactSelect
        ariaLabel="Seleccionar periodo"
        options={periodOptions}
        value={selectedPeriod.key}
        onChange={(nextValue) => {
          const nextIndex = periods.findIndex((period) => period.key === nextValue);

          if (nextIndex >= 0) {
            onSelectPeriod(nextIndex);
          }
        }}
        placeholder="Selecciona un periodo"
        containerClassName="min-w-0 flex-1 sm:min-w-[260px] sm:flex-none"
        triggerClassName="h-10 rounded-xl text-sm font-medium text-slate-700"
        menuClassName="sm:left-auto sm:right-12 sm:w-[340px]"
      />

      <button
        type="button"
        onClick={() =>
          onSelectPeriod(Math.min(periods.length - 1, selectedPeriodIndex + 1))
        }
        disabled={!canGoForward}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Periodo siguiente"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
