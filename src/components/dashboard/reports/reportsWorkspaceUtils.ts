import {
  BarChart3,
  FileSpreadsheet,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import type { DashboardKpi } from "@/features/dashboard/lib/dashboardViewModel";
import type { DashboardPeriod } from "@/features/dashboard/lib/dashboardPeriods";
import type { Movement, Report } from "@/types/db";
import type { LucideIcon } from "lucide-react";
import type { SireDashboardContext } from "@/types/sire";

export type WorkspaceReportType = "sales" | "purchases" | "balance";

export interface WorkspaceReportCard {
  type: WorkspaceReportType;
  title: string;
  description: string;
  helperText: string;
  icon: LucideIcon;
  iconTone: string;
  actionTone: string;
  metricLabel: string;
  metricValue: string;
  secondaryLabel: string;
  secondaryValue: string;
}

export interface WorkspaceSummaryItem {
  label: string;
  description: string;
  value: string;
  tone: string;
}

export interface ReportSourceState {
  label: string;
  detail: string;
}

export function isSaleMovement(movement: Movement) {
  const value = movement.movement_type.trim().toLowerCase();
  return value.includes("venta") || value.includes("ingreso");
}

export function isPurchaseMovement(movement: Movement) {
  const value = movement.movement_type.trim().toLowerCase();
  return (
    value.includes("compra") ||
    value.includes("gasto") ||
    value.includes("egreso")
  );
}

export function buildReportSourceState(input: {
  hasRealData: boolean;
  shouldUseSirePeriods: boolean;
  sireContext: SireDashboardContext;
  usesSireProposalData: boolean;
}) {
  if (!input.hasRealData) {
    return {
      label: "Vista de ejemplo",
      detail: "Estamos mostrando una demostracion para que el panel no quede vacio.",
    } satisfies ReportSourceState;
  }

  if (input.usesSireProposalData) {
    return {
      label: "Datos traidos desde SUNAT",
      detail: "Los montos y movimientos visibles salen de la propuesta de ventas ya revisada en SUNAT.",
    } satisfies ReportSourceState;
  }

  if (input.shouldUseSirePeriods) {
    return {
      label: "Periodo segun SUNAT",
      detail: "El selector usa los periodos devueltos por SIRE para esta empresa.",
    } satisfies ReportSourceState;
  }

  if (input.sireContext.availability === "unavailable") {
    return {
      label: "Periodo interno del sistema",
      detail: "Tomamos los periodos de tus movimientos porque SUNAT no los entrego en este momento.",
    } satisfies ReportSourceState;
  }

  return {
    label: "Periodo interno del sistema",
    detail: "Tomamos los periodos desde los movimientos registrados en tu empresa.",
  } satisfies ReportSourceState;
}

export function buildReportsExperienceMessage(input: {
  hasRealData: boolean;
  sourceState: ReportSourceState;
  sireContext: SireDashboardContext;
  usesSireProposalData: boolean;
}) {
  if (!input.hasRealData) {
    return "Aun no hay movimientos o reportes reales. Por eso ves un ejemplo de trabajo, y se retirara solo cuando ingresen datos reales.";
  }

  if (input.usesSireProposalData) {
    return "Este modulo ya esta usando la propuesta de ventas descargada desde SUNAT para llenar el periodo y preparar tus exportaciones.";
  }

  if (input.sireContext.message) {
    return input.sireContext.message;
  }

  return input.sourceState.detail;
}

export function buildReportCards(input: {
  filteredMovements: Movement[];
  filteredReports: Report[];
  kpis: DashboardKpi[];
}) {
  const salesCount = input.filteredMovements.filter(isSaleMovement).length;
  const purchasesCount = input.filteredMovements.filter(isPurchaseMovement).length;

  return [
    {
      type: "sales",
      title: "Ventas del periodo",
      description:
        "Prepara un archivo con ingresos, ventas y detalle del periodo elegido.",
      helperText: "Ideal para revisar tu base antes de contrastarla con SUNAT.",
      icon: BarChart3,
      iconTone: "bg-emerald-50 text-emerald-600",
      actionTone:
        "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
      metricLabel: "Monto vendido",
      metricValue: input.kpis[0]?.value ?? "S/ 0",
      secondaryLabel: "Movimientos",
      secondaryValue: `${salesCount}`,
    },
    {
      type: "purchases",
      title: "Compras y gastos",
      description:
        "Exporta compras, egresos y consumos del periodo para tu control interno.",
      helperText: "Te ayuda a revisar costo, gasto y respaldo de operaciones.",
      icon: ShoppingCart,
      iconTone: "bg-blue-50 text-blue-600",
      actionTone:
        "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
      metricLabel: "Monto comprado",
      metricValue: input.kpis[1]?.value ?? "S/ 0",
      secondaryLabel: "Movimientos",
      secondaryValue: `${purchasesCount}`,
    },
    {
      type: "balance",
      title: "Resumen financiero",
      description:
        "Genera una vista ejecutiva con ventas, compras, utilidad estimada e IGV.",
      helperText: "Pensado para gerencia, seguimiento mensual y toma de decisiones.",
      icon: Wallet,
      iconTone: "bg-violet-50 text-violet-600",
      actionTone:
        "border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100",
      metricLabel: "Resultado estimado",
      metricValue: input.kpis[2]?.value ?? "S/ 0",
      secondaryLabel: "Reportes guardados",
      secondaryValue: `${input.filteredReports.length}`,
    },
  ] satisfies WorkspaceReportCard[];
}

export function buildSummaryItems(input: {
  kpis: DashboardKpi[];
  filteredReports: Report[];
}) {
  return [
    {
      label: "Ventas del periodo",
      description: "Ingresos registrados dentro del periodo seleccionado.",
      value: input.kpis[0]?.value ?? "S/ 0",
      tone: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Compras y gastos",
      description: "Egresos operativos y compras cargadas en el sistema.",
      value: input.kpis[1]?.value ?? "S/ 0",
      tone: "bg-rose-50 text-rose-600",
    },
    {
      label: "Utilidad estimada",
      description: "Diferencia referencial entre ingresos y egresos.",
      value: input.kpis[2]?.value ?? "S/ 0",
      tone: "bg-violet-50 text-violet-600",
    },
    {
      label: "IGV referencial",
      description: "Calculo rapido para tener una lectura tributaria del periodo.",
      value: input.kpis[3]?.value ?? "S/ 0",
      tone: "bg-amber-50 text-amber-600",
    },
    {
      label: "Archivos del sistema",
      description: "Reportes generados y guardados en este periodo.",
      value: `${input.filteredReports.length}`,
      tone: "bg-blue-50 text-blue-600",
    },
  ] satisfies WorkspaceSummaryItem[];
}

export function getEffectivePeriodLabel(period: DashboardPeriod) {
  return period.sirePeriodCode
    ? `${period.label} (${period.sirePeriodCode})`
    : period.label;
}

export function buildGeneratedByLabel(report: Report) {
  return report.report_type.toLowerCase().includes("sunat")
    ? "SUNAT"
    : "Sistema";
}

export function buildReportStatusLabel(report: Report) {
  return report.file_url ? "Disponible" : "Pendiente";
}

export function getHistoryEmptyState(hasRealData: boolean) {
  return hasRealData
    ? "Todavia no se han guardado reportes para este periodo."
    : "Aun no hay reportes reales. Cuando tu empresa genere archivos, apareceran aqui.";
}

export function getExportFileName(
  type: WorkspaceReportType,
  period: DashboardPeriod
) {
  const periodCode = period.sirePeriodCode ?? period.key;
  const prefix =
    type === "sales"
      ? "ventas"
      : type === "purchases"
        ? "compras"
        : "resumen-financiero";

  return `${prefix}-${periodCode}.xlsx`;
}

export function getReportSheetTitle(type: WorkspaceReportType) {
  if (type === "sales") {
    return "Ventas";
  }

  if (type === "purchases") {
    return "Compras";
  }

  return "Resumen";
}

export function getReportIconForHistory() {
  return FileSpreadsheet;
}
