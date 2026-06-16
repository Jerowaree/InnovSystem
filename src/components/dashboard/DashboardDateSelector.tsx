"use client";

import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

interface DashboardDateSelectorProps {
  label: string;
  canGoBackward: boolean;
  canGoForward: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export default function DashboardDateSelector({
  label,
  canGoBackward,
  canGoForward,
  onPrevious,
  onNext,
}: DashboardDateSelectorProps) {
  return (
    <div className="inline-flex h-11 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm font-medium text-slate-700 shadow-sm">
      <button
        type="button"
        onClick={onPrevious}
        disabled={!canGoBackward}
        className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
        aria-label="Periodo anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="inline-flex items-center gap-2 px-2">
        <CalendarDays className="h-4 w-4 text-slate-400" />
        <span>{label}</span>
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!canGoForward}
        className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
        aria-label="Periodo siguiente"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
