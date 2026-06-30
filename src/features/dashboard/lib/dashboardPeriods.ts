import type { Movement, Report } from "@/types/db";

export interface DashboardPeriod {
  key: string;
  label: string;
  month: number;
  year: number;
  sirePeriodCode?: string;
}

function createDashboardFallbackPeriod(): DashboardPeriod {
  const now = new Date();

  return {
    key: "all",
    month: now.getMonth(),
    year: now.getFullYear(),
    label: formatMonthLabel(now.getFullYear(), now.getMonth()),
    sirePeriodCode: undefined,
  };
}

function formatMonthLabel(year: number, month: number) {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  const formatter = new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
}

function getPeriodKeyFromDate(value: string) {
  const [year, month] = value.split("-").map(Number);
  return `${year}-${String(month).padStart(2, "0")}`;
}

function getPeriodKeyFromSireCode(value: string) {
  const year = value.slice(0, 4);
  const month = value.slice(4, 6);
  return `${year}-${month}`;
}

function isValidSirePeriodCode(periodCode: string) {
  if (!/^\d{6}$/.test(periodCode)) {
    return false;
  }

  const monthNumber = Number(periodCode.slice(4, 6));
  return monthNumber >= 1 && monthNumber <= 12;
}

export function buildDashboardPeriodsFromSire(periodCodes: string[]) {
  return [...new Set(periodCodes)]
    .filter(isValidSirePeriodCode)
    .sort()
    .map((periodCode) => {
      const yearNumber = Number(periodCode.slice(0, 4));
      const monthNumber = Number(periodCode.slice(4, 6)) - 1;

      return {
        key: getPeriodKeyFromSireCode(periodCode),
        month: monthNumber,
        year: yearNumber,
        label: formatMonthLabel(yearNumber, monthNumber),
        sirePeriodCode: periodCode,
      } satisfies DashboardPeriod;
    });
}

export function mergeDashboardPeriods(
  movementPeriods: DashboardPeriod[],
  sirePeriods: DashboardPeriod[]
) {
  const mergedPeriods = new Map<string, DashboardPeriod>();

  for (const period of [...movementPeriods, ...sirePeriods]) {
    if (period.key === "all") {
      continue;
    }

    const currentValue = mergedPeriods.get(period.key);

    if (!currentValue || (!currentValue.sirePeriodCode && period.sirePeriodCode)) {
      mergedPeriods.set(period.key, period);
    }
  }

  const result = Array.from(mergedPeriods.values()).sort((left, right) =>
    left.key.localeCompare(right.key)
  );

  return result.length > 0 ? result : ensureDashboardPeriods(movementPeriods);
}

export function buildDashboardPeriods(movements: Movement[]) {
  const uniquePeriods = new Set<string>();

  for (const movement of movements) {
    uniquePeriods.add(getPeriodKeyFromDate(movement.movement_date));
  }

  const periods = Array.from(uniquePeriods)
    .sort()
    .map((key) => {
      const [year, monthString] = key.split("-");
      const yearNumber = Number(year);
      const monthNumber = Number(monthString) - 1;

      return {
        key,
        month: monthNumber,
        year: yearNumber,
        label: formatMonthLabel(yearNumber, monthNumber),
        sirePeriodCode: `${year}${monthString}`,
      } satisfies DashboardPeriod;
    });

  return ensureDashboardPeriods(periods);
}

export function ensureDashboardPeriods(periods: DashboardPeriod[]) {
  return periods.length > 0 ? periods : [createDashboardFallbackPeriod()];
}

export function filterMovementsByPeriod(
  movements: Movement[],
  period: DashboardPeriod
) {
  if (period.key === "all") {
    return movements;
  }

  return movements.filter(
    (movement) => getPeriodKeyFromDate(movement.movement_date) === period.key
  );
}

export function filterReportsByPeriod(
  reports: Report[],
  period: DashboardPeriod
) {
  if (period.key === "all") {
    return reports;
  }

  return reports.filter(
    (report) => getPeriodKeyFromDate(report.generated_at) === period.key
  );
}
