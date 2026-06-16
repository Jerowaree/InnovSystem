import type { Movement, Report } from "@/types/db";

export interface DashboardPeriod {
  key: string;
  label: string;
  month: number;
  year: number;
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
      } satisfies DashboardPeriod;
    });

  return periods.length > 0
    ? periods
    : [
        {
          key: "all",
          month: new Date().getMonth(),
          year: new Date().getFullYear(),
          label: formatMonthLabel(
            new Date().getFullYear(),
            new Date().getMonth()
          ),
        },
      ];
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
