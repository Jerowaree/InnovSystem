import type { Company, Movement, Profile, Report } from "@/types/db";

export interface DashboardKpi {
  label: string;
  value: string;
  changeLabel: string;
  tone: "blue" | "green" | "violet" | "amber";
}

export interface DashboardSeriesPoint {
  label: string;
  sales: number;
  purchases: number;
}

export interface DashboardDistributionItem {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

export interface DashboardReportItem {
  id: string;
  title: string;
  generatedAt: string;
  fileUrl: string;
}

export interface DashboardViewModel {
  welcomeTitle: string;
  subtitle: string;
  dateRangeLabel: string;
  kpis: DashboardKpi[];
  chartSeries: DashboardSeriesPoint[];
  lineChartTitle: string;
  showPurchasesSeries: boolean;
  expenseDistribution: DashboardDistributionItem[];
  distributionTitle: string;
  distributionTotal: string;
  distributionEmptyTitle: string;
  distributionEmptyDescription: string;
  recentMovements: Movement[];
  reports: DashboardReportItem[];
  company: Company;
  profile: Profile;
}

const DISTRIBUTION_COLORS = [
  "#2F6BFF",
  "#56A3FF",
  "#7B6CFF",
  "#55C6A9",
  "#FF7AD9",
  "#FFBE3D",
];

function formatCurrency(value: number) {
  return `S/ ${value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function formatLongDate(value: string) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function isSale(movement: Movement) {
  const value = movement.movement_type.trim().toLowerCase();
  return value.includes("venta") || value.includes("ingreso");
}

function isPurchase(movement: Movement) {
  const value = movement.movement_type.trim().toLowerCase();
  return (
    value.includes("compra") ||
    value.includes("gasto") ||
    value.includes("egreso")
  );
}

function isSireSalesMovement(movement: Movement) {
  return (
    movement.taxable_base_amount !== undefined ||
    movement.tax_amount !== undefined ||
    movement.customer_name !== undefined ||
    movement.currency_code !== undefined ||
    movement.operation_type !== undefined
  );
}

function groupByDate(movements: Movement[]) {
  const grouped = new Map<string, { sales: number; purchases: number }>();

  for (const movement of movements) {
    const current = grouped.get(movement.movement_date) ?? {
      sales: 0,
      purchases: 0,
    };

    if (isSale(movement)) {
      current.sales += movement.amount;
    } else if (isPurchase(movement)) {
      current.purchases += movement.amount;
    }

    grouped.set(movement.movement_date, current);
  }

  return Array.from(grouped.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, totals]) => ({
      label: formatDateLabel(date),
      sales: totals.sales,
      purchases: totals.purchases,
    }));
}

function sumAmounts(
  movements: Movement[],
  matcher: (movement: Movement) => boolean
) {
  return movements.reduce(
    (total, movement) => total + (matcher(movement) ? movement.amount : 0),
    0
  );
}

function buildDistribution(movements: Movement[]) {
  const purchases = movements.filter(isPurchase);
  const sourceMovements =
    purchases.length > 0 ? purchases : movements.filter(isSale);
  const totals = new Map<string, number>();

  for (const movement of sourceMovements) {
    const key = movement.document_type || "Otros";
    totals.set(key, (totals.get(key) ?? 0) + movement.amount);
  }

  const totalAmount = Array.from(totals.values()).reduce(
    (sum, value) => sum + value,
    0
  );

  return Array.from(totals.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6)
    .map(([label, value], index) => ({
      label,
      value,
      percentage: totalAmount > 0 ? Math.round((value / totalAmount) * 100) : 0,
      color: DISTRIBUTION_COLORS[index % DISTRIBUTION_COLORS.length],
    }));
}

function formatCount(value: number) {
  return value.toLocaleString("en-US");
}

function getChangeLabel(current: number, previous: number) {
  if (previous <= 0) {
    return "+0% vs periodo anterior";
  }

  const delta = ((current - previous) / previous) * 100;
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)}% vs periodo anterior`;
}

function splitPeriods(movements: Movement[]) {
  const sorted = [...movements].sort((left, right) =>
    left.movement_date.localeCompare(right.movement_date)
  );
  const midpoint = Math.max(1, Math.floor(sorted.length / 2));

  return {
    previous: sorted.slice(0, midpoint),
    current: sorted.slice(midpoint),
  };
}

function buildReportItems(reports: Report[]) {
  return reports.slice(0, 3).map((report) => ({
    id: report.id,
    title: `${report.report_type} (${formatLongDate(report.generated_at)})`,
    generatedAt: formatLongDate(report.generated_at),
    fileUrl: report.file_url,
  }));
}

export function buildDashboardViewModel(input: {
  company: Company;
  profile: Profile;
  movements: Movement[];
  reports: Report[];
}) {
  const { company, profile, movements, reports } = input;
  const { previous, current } = splitPeriods(movements);

  const totalSales = sumAmounts(movements, isSale);
  const totalPurchases = sumAmounts(movements, isPurchase);
  const hasPurchases = movements.some(isPurchase);
  const usesSireSalesMetrics = movements.some(isSireSalesMovement);
  const totalTaxableBase = movements.reduce(
    (total, movement) => total + (movement.taxable_base_amount ?? 0),
    0
  );
  const totalTaxAmount = movements.reduce(
    (total, movement) => total + (movement.tax_amount ?? 0),
    0
  );
  const totalDocuments = movements.length;
  const currentSales = sumAmounts(current, isSale);
  const previousSales = sumAmounts(previous, isSale);
  const currentPurchases = sumAmounts(current, isPurchase);
  const previousPurchases = sumAmounts(previous, isPurchase);
  const currentTaxableBase = current.reduce(
    (total, movement) => total + (movement.taxable_base_amount ?? 0),
    0
  );
  const previousTaxableBase = previous.reduce(
    (total, movement) => total + (movement.taxable_base_amount ?? 0),
    0
  );
  const currentTaxAmount = current.reduce(
    (total, movement) => total + (movement.tax_amount ?? 0),
    0
  );
  const previousTaxAmount = previous.reduce(
    (total, movement) => total + (movement.tax_amount ?? 0),
    0
  );
  const currentDocuments = current.length;
  const previousDocuments = previous.length;
  const estimatedProfit = totalSales - totalPurchases;
  const previousProfit = previousSales - previousPurchases;
  const igv = totalSales * 0.18;
  const previousIgv = previousSales * 0.18;
  const sortedDates = [...movements]
    .map((movement) => movement.movement_date)
    .sort();

  const dateRangeLabel =
    sortedDates.length > 0
      ? `${formatLongDate(sortedDates[0])} - ${formatLongDate(
          sortedDates[sortedDates.length - 1]
        )}`
      : "Sin movimientos registrados";

  return {
    welcomeTitle: `Bienvenido, ${profile.full_name.split(" ")[0] ?? profile.full_name}`,
    subtitle: "Resumen general de tu empresa",
    dateRangeLabel,
    kpis: usesSireSalesMetrics
      ? [
          {
            label: "Ventas Totales",
            value: formatCurrency(totalSales),
            changeLabel: getChangeLabel(currentSales, previousSales),
            tone: "blue",
          },
          {
            label: "Base Imponible",
            value: formatCurrency(totalTaxableBase),
            changeLabel: getChangeLabel(currentTaxableBase, previousTaxableBase),
            tone: "green",
          },
          {
            label: "Impuestos",
            value: formatCurrency(totalTaxAmount),
            changeLabel: getChangeLabel(currentTaxAmount, previousTaxAmount),
            tone: "violet",
          },
          {
            label: "Comprobantes",
            value: formatCount(totalDocuments),
            changeLabel: getChangeLabel(currentDocuments, previousDocuments),
            tone: "amber",
          },
        ]
      : [
          {
            label: "Ventas Totales",
            value: formatCurrency(totalSales),
            changeLabel: getChangeLabel(currentSales, previousSales),
            tone: "blue",
          },
          {
            label: "Compras Totales",
            value: formatCurrency(totalPurchases),
            changeLabel: getChangeLabel(currentPurchases, previousPurchases),
            tone: "green",
          },
          {
            label: "Utilidad Estimada",
            value: formatCurrency(estimatedProfit),
            changeLabel: getChangeLabel(
              currentSales - currentPurchases,
              previousProfit
            ),
            tone: "violet",
          },
          {
            label: "IGV",
            value: formatCurrency(igv),
            changeLabel: getChangeLabel(igv, previousIgv),
            tone: "amber",
          },
        ],
    chartSeries: groupByDate(movements),
    lineChartTitle: usesSireSalesMetrics ? "Ventas por dia" : "Ventas vs Compras",
    showPurchasesSeries: !usesSireSalesMetrics,
    expenseDistribution: buildDistribution(movements),
    distributionTitle: usesSireSalesMetrics
      ? "Ventas por tipo de comprobante"
      : hasPurchases
      ? "Distribucion de gastos"
      : "Distribucion de ventas",
    distributionTotal: formatCurrency(
      usesSireSalesMetrics ? totalSales : hasPurchases ? totalPurchases : totalSales
    ),
    distributionEmptyTitle: usesSireSalesMetrics
      ? "Aun no hay ventas para distribuir"
      : hasPurchases
      ? "Aun no hay gastos para distribuir"
      : "Aun no hay ventas para distribuir",
    distributionEmptyDescription: usesSireSalesMetrics
      ? "Cuando tengamos el archivo de ventas de SUNAT, aqui veras la distribucion por tipo de comprobante."
      : hasPurchases
      ? "Cuando registres compras o egresos, aqui veras como se reparten por categoria."
      : "Cuando tengamos ventas reales del periodo, aqui veras como se reparten por tipo de comprobante.",
    recentMovements: movements.slice(0, 5),
    reports: buildReportItems(reports),
    company,
    profile,
  } satisfies DashboardViewModel;
}
