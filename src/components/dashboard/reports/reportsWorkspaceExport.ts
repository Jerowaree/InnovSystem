import type { DashboardPeriod } from "@/features/dashboard/lib/dashboardPeriods";
import type { Movement, Report } from "@/types/db";
import type { WorkspaceReportType } from "@/components/dashboard/reports/reportsWorkspaceUtils";
import {
  getEffectivePeriodLabel,
  getExportFileName,
  getReportSheetTitle,
  isPurchaseMovement,
  isSaleMovement,
} from "@/components/dashboard/reports/reportsWorkspaceUtils";

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function formatCurrencyAmount(value: number) {
  return Number(value.toFixed(2));
}

function filterMovementsForExport(
  type: WorkspaceReportType,
  movements: Movement[]
) {
  if (type === "sales") {
    return movements.filter(isSaleMovement);
  }

  if (type === "purchases") {
    return movements.filter(isPurchaseMovement);
  }

  return movements;
}

export async function exportWorkspaceReport(input: {
  type: WorkspaceReportType;
  selectedPeriod: DashboardPeriod;
  companyName: string;
  companyRuc: string;
  movements: Movement[];
  reports: Report[];
  totalSalesLabel: string;
  totalPurchasesLabel: string;
  estimatedProfitLabel: string;
  igvLabel: string;
  totalSalesAmount?: number;
  totalPurchasesAmount?: number;
  estimatedProfitAmount?: number;
  igvAmount?: number;
}) {
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();

  workbook.creator = "InnovSystem";
  workbook.created = new Date();
  workbook.modified = new Date();

  const summarySheet = workbook.addWorksheet("Resumen general");
  const detailSheetName = getReportSheetTitle(input.type);
  const detailSheet = workbook.addWorksheet(detailSheetName);
  const selectedMovements = filterMovementsForExport(
    input.type,
    input.movements
  );
  const estimatedProfitAmount = input.estimatedProfitAmount ?? 0;
  const statusTone =
    estimatedProfitAmount > 0
      ? {
          label: "Ganando",
          color: "FF166534",
          fill: "FFDCFCE7",
          indicator: "VERDE",
        }
      : estimatedProfitAmount < 0
        ? {
            label: "Perdiendo",
            color: "FFB91C1C",
            fill: "FFFEE2E2",
            indicator: "ROJO",
          }
        : {
            label: "En equilibrio",
            color: "FFB45309",
            fill: "FFFEF3C7",
            indicator: "AMARILLO",
          };

  summarySheet.columns = [
    { header: "Campo", key: "field", width: 28 },
    { header: "Valor", key: "value", width: 42 },
  ];

  summarySheet.addRows([
    { field: "Empresa", value: input.companyName },
    { field: "RUC", value: input.companyRuc },
    { field: "Periodo", value: getEffectivePeriodLabel(input.selectedPeriod) },
    { field: "Tipo de reporte", value: getReportSheetTitle(input.type) },
    { field: "Ventas del periodo", value: input.totalSalesLabel },
    { field: "Compras del periodo", value: input.totalPurchasesLabel },
    { field: "Utilidad estimada", value: input.estimatedProfitLabel },
    { field: "IGV referencial", value: input.igvLabel },
    { field: "Movimientos incluidos", value: String(selectedMovements.length) },
    { field: "Reportes guardados", value: String(input.reports.length) },
  ]);

  if (input.type === "balance") {
    summarySheet.insertRows(1, [
      { field: "BALANCE GENERAL DE CUENTA", value: "" },
      { field: "Estado ejecutivo", value: statusTone.label },
      { field: "Semaforo visual", value: statusTone.indicator },
      { field: "", value: "" },
    ]);
    summarySheet.mergeCells("A1:B1");
    summarySheet.getCell("A1").font = {
      bold: true,
      size: 15,
      color: { argb: "FF0F172A" },
    };
    summarySheet.getCell("A1").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEFF6FF" },
    };
    summarySheet.getCell("A2").font = { bold: true };
    summarySheet.getCell("B2").font = {
      bold: true,
      color: { argb: statusTone.color },
    };
    summarySheet.getCell("B2").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: statusTone.fill },
    };
    summarySheet.getCell("A3").font = { bold: true };
    summarySheet.getCell("B3").font = {
      bold: true,
      color: { argb: statusTone.color },
    };
    summarySheet.getCell("B3").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: statusTone.fill },
    };
  }

  detailSheet.columns = [
    { header: "Fecha", key: "movement_date", width: 16 },
    { header: "Tipo", key: "movement_type", width: 18 },
    { header: "Documento", key: "document_type", width: 18 },
    { header: "Descripcion", key: "description", width: 42 },
    { header: "Monto", key: "amount", width: 16 },
  ];

  if (input.type === "balance") {
    detailSheet.insertRows(1, [
      {
        movement_date: "Panel ejecutivo",
        movement_type: "Estado",
        document_type: statusTone.indicator,
        description: statusTone.label,
        amount: formatCurrencyAmount(Math.abs(estimatedProfitAmount)),
      },
    ]);
    detailSheet.addRow({
      movement_date: "Resumen",
      movement_type: "Ventas",
      document_type: "",
      description: "Total de ingresos del periodo",
      amount: input.totalSalesLabel,
    });
    detailSheet.addRow({
      movement_date: "Resumen",
      movement_type: "Compras",
      document_type: "",
      description: "Total de compras y egresos del periodo",
      amount: input.totalPurchasesLabel,
    });
    detailSheet.addRow({
      movement_date: "Resumen",
      movement_type: "Utilidad",
      document_type: "",
      description: "Resultado estimado del periodo",
      amount: input.estimatedProfitLabel,
    });
    detailSheet.addRow({
      movement_date: "Resumen",
      movement_type: "IGV",
      document_type: "",
      description: "IGV referencial del periodo",
      amount: input.igvLabel,
    });
  }

  selectedMovements.forEach((movement) => {
    detailSheet.addRow({
      movement_date: movement.movement_date,
      movement_type: movement.movement_type,
      document_type: movement.document_type,
      description: movement.description,
      amount: formatCurrencyAmount(movement.amount),
    });
  });

  summarySheet.getRow(1).font = { bold: true };
  detailSheet.getRow(input.type === "balance" ? 2 : 1).font = { bold: true };

  if (input.type === "balance") {
    detailSheet.getRow(1).font = {
      bold: true,
      color: { argb: statusTone.color },
    };
    detailSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: statusTone.fill },
    };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  downloadBlob(blob, getExportFileName(input.type, input.selectedPeriod));
}
