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
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
  } finally {
    URL.revokeObjectURL(url);
  }
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
  try {
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

    summarySheet.views = [{ showGridLines: true }];
    summarySheet.getColumn(1).width = 62;
    summarySheet.getColumn(2).width = 24;

    // Header block mimicking Formato 3.20
    summarySheet.getCell("A1").value = 'FORMATO 3.20: "LIBRO DE INVENTARIOS Y BALANCES - ESTADO DE GANANCIAS Y PÉRDIDAS POR FUNCIÓN DEL 01.01 AL 31.12" (1)';
    summarySheet.getCell("A1").font = { bold: true, size: 10, name: "Calibri" };

    summarySheet.getCell("A3").value = 'EJERCICIO:';
    summarySheet.getCell("A3").font = { bold: true, size: 10, name: "Calibri" };
    summarySheet.getCell("B3").value = getEffectivePeriodLabel(input.selectedPeriod);
    summarySheet.getCell("B3").font = { size: 10, name: "Calibri", bold: true };
    summarySheet.getCell("B3").alignment = { horizontal: 'right' };

    summarySheet.getCell("A4").value = 'RUC:';
    summarySheet.getCell("A4").font = { bold: true, size: 10, name: "Calibri" };
    summarySheet.getCell("B4").value = input.companyRuc;
    summarySheet.getCell("B4").font = { size: 10, name: "Calibri" };

    summarySheet.getCell("A5").value = 'APELLIDOS Y NOMBRES, DENOMINACIÓN O RAZÓN SOCIAL:';
    summarySheet.getCell("A5").font = { bold: true, size: 10, name: "Calibri" };
    summarySheet.getCell("B5").value = input.companyName;
    summarySheet.getCell("B5").font = { size: 10, name: "Calibri" };

    // Column Headers
    summarySheet.getCell("A7").value = 'DESCRIPCIÓN';
    summarySheet.getCell("A7").font = { bold: true, size: 10, name: "Calibri" };
    summarySheet.getCell("A7").alignment = { horizontal: 'center', vertical: 'middle' };
    summarySheet.getCell("B7").value = 'EJERCICIO O PERÍODO';
    summarySheet.getCell("B7").font = { bold: true, size: 10, name: "Calibri" };
    summarySheet.getCell("B7").alignment = { horizontal: 'center', vertical: 'middle' };

    const doubleBorder = {
      top: { style: 'thin' as const, color: { argb: 'FF000000' } },
      bottom: { style: 'double' as const, color: { argb: 'FF000000' } },
      left: { style: 'thin' as const, color: { argb: 'FFBBBBBB' } },
      right: { style: 'thin' as const, color: { argb: 'FFBBBBBB' } },
    };

    const thinBorder = {
      top: { style: 'thin' as const, color: { argb: 'FFBBBBBB' } },
      bottom: { style: 'thin' as const, color: { argb: 'FFBBBBBB' } },
      left: { style: 'thin' as const, color: { argb: 'FFBBBBBB' } },
      right: { style: 'thin' as const, color: { argb: 'FFBBBBBB' } },
    };

    const headerBorder = {
      top: { style: 'medium' as const, color: { argb: 'FF000000' } },
      bottom: { style: 'medium' as const, color: { argb: 'FF000000' } },
      left: { style: 'medium' as const, color: { argb: 'FF000000' } },
      right: { style: 'medium' as const, color: { argb: 'FF000000' } },
    };

    summarySheet.getCell("A7").border = headerBorder;
    summarySheet.getCell("B7").border = headerBorder;

    const totalSales = input.totalSalesAmount ?? 0;
    const totalExpenses = input.totalPurchasesAmount ?? 0;
    const totalTaxes = input.igvAmount ?? 0;

    const formatRow = (
      rowNum: number,
      desc: string,
      val: number | string | null,
      opts?: { bold?: boolean; isHeader?: boolean; isTotal?: boolean; isNegative?: boolean; colorCell?: boolean }
    ) => {
      const cellA = summarySheet.getCell(`A${rowNum}`);
      const cellB = summarySheet.getCell(`B${rowNum}`);

      cellA.value = desc;
      cellA.font = {
        name: "Calibri",
        size: 10,
        bold: opts?.bold || opts?.isHeader || opts?.isTotal,
        italic: opts?.isHeader,
      };

      if (opts?.isHeader) {
        cellA.alignment = { horizontal: 'left' };
      } else if (opts?.isTotal) {
        cellA.alignment = { horizontal: 'center' };
      } else {
        cellA.alignment = { horizontal: 'left' };
      }

      if (val !== null) {
        cellB.value = val;
        cellB.font = {
          name: "Calibri",
          size: 10,
          bold: opts?.bold || opts?.isTotal,
          color: opts?.isNegative ? { argb: "FFFF0000" } : undefined,
        };
        if (typeof val === 'number') {
          cellB.numFmt = '#,##0.00;[Red](#,##0.00);0.00';
          cellB.alignment = { horizontal: 'right' };
        } else {
          cellB.alignment = { horizontal: 'right' };
        }
      }

      const borderToUse = opts?.isTotal ? doubleBorder : thinBorder;
      cellA.border = borderToUse;
      cellB.border = borderToUse;

      if (opts?.colorCell) {
        cellB.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: statusTone.fill },
        };
        cellB.font = {
          name: "Calibri",
          size: 10,
          bold: true,
          color: { argb: statusTone.color },
        };
      }
    };

    // Row definitions based on the image format
    formatRow(9, "Ventas Netas (ingresos operacionales)", totalSales);
    formatRow(10, "Otros Ingresos Operacionales", 0);
    formatRow(11, "Total de Ingresos Brutos", totalSales, { isTotal: true });
    
    formatRow(13, "Costo de ventas", -totalExpenses, { isNegative: totalExpenses > 0 });
    formatRow(14, "Utilidad Bruta", totalSales - totalExpenses, { isTotal: true });

    formatRow(16, "Gastos Operacionales", null, { isHeader: true });
    formatRow(17, "Gastos de Administración", 0);
    formatRow(18, "Gastos de Venta", 0);
    formatRow(19, "Utilidad Operativa", totalSales - totalExpenses, { isTotal: true });

    formatRow(21, "Otros Ingresos (gastos)", null, { isHeader: true });
    formatRow(22, "Ingresos Financieros", 0);
    formatRow(23, "Gastos Financieros", 0);
    formatRow(24, "Otros Ingresos", 0);
    formatRow(25, "Otros Gastos", 0);
    formatRow(26, "Resultados por Exposición a la Inflación", 0);
    formatRow(27, "Resultados antes de Participaciones, Impuesto a la Renta y Partidas Extraordinarias", totalSales - totalExpenses, { isTotal: true });

    formatRow(29, "Participaciones", 0);
    formatRow(30, "Impuesto a la Renta", -totalTaxes, { isNegative: totalTaxes > 0 });
    formatRow(31, "Resultados antes de Partidas Extraordinarias", totalSales - totalExpenses - totalTaxes, { isTotal: true });

    formatRow(33, "Ingresos Extraordinarios", 0);
    formatRow(34, "Gastos Extraordinarios", 0);
    formatRow(35, "Resultado Antes de Interés Minoritario", totalSales - totalExpenses - totalTaxes, { isTotal: true });

    formatRow(37, "Interés Minoritario", 0);
    formatRow(38, "Utilidad (Pérdida) Neta del Ejercicio", totalSales - totalExpenses - totalTaxes, { isTotal: true, colorCell: true });

    detailSheet.views = [{ showGridLines: true }];
    detailSheet.columns = [
      { header: "Fecha", key: "movement_date", width: 16 },
      { header: "Tipo", key: "movement_type", width: 18 },
      { header: "Documento", key: "document_type", width: 18 },
      { header: "Descripcion", key: "description", width: 42 },
      { header: "Monto", key: "amount", width: 16 },
    ];

    if (input.type === "balance") {
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

    detailSheet.getRow(1).font = { bold: true };

    detailSheet.eachRow((row) => {
      const cellA = row.getCell(1);
      const cellB = row.getCell(2);
      if (cellA.value === "Resumen" && cellB.value === "Utilidad") {
        row.getCell(5).font = {
          bold: true,
          color: { argb: statusTone.color },
        };
        row.getCell(5).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: statusTone.fill },
        };
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    downloadBlob(blob, getExportFileName(input.type, input.selectedPeriod));
  } catch (error) {
    throw new Error(
      error instanceof Error && error.message
        ? error.message
        : "No pudimos generar el archivo Excel. Vuelve a intentarlo en unos segundos."
    );
  }
}
