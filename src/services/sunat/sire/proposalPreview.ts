import ExcelJS from "exceljs";
import JSZip from "jszip";
import {
  SireServiceError,
} from "@/services/sunat/sire/shared";
import type {
  SireSalesProposalPreview,
  SireSalesProposalPreviewPage,
  SireSalesProposalPreviewRow,
} from "@/types/sire";

function buildGenericColumns(totalColumns: number) {
  return Array.from({ length: totalColumns }, (_, index) => `Campo ${index + 1}`);
}

function normalizeCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object" && "text" in (value as Record<string, unknown>)) {
    const textValue = (value as { text?: unknown }).text;
    return typeof textValue === "string" ? textValue.trim() : String(textValue ?? "");
  }

  return String(value).trim();
}

function looksLikeHeaderRow(values: string[]) {
  const meaningfulValues = values.filter(Boolean);

  if (meaningfulValues.length === 0) {
    return false;
  }

  const alphaLikeCount = meaningfulValues.filter((value) =>
    /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(value)
  ).length;

  return alphaLikeCount >= Math.max(2, Math.ceil(meaningfulValues.length * 0.6));
}

function toPreviewRows(
  rows: string[][],
  totalColumns: number
): SireSalesProposalPreviewRow[] {
  return rows.map((values, index) => ({
    id: `row-${index + 1}`,
    values: Array.from({ length: totalColumns }, (_, columnIndex) => {
      return values[columnIndex] ?? "";
    }),
  }));
}

function parseDelimitedText(
  text: string,
  sourceFileName: string
): SireSalesProposalPreview {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    throw new SireServiceError("SUNAT devolvio un archivo vacio para esta propuesta.");
  }

  const delimiter = lines.some((line) => line.includes("|"))
    ? "|"
    : lines.some((line) => line.includes(";"))
      ? ";"
      : "\t";

  const parsedLines = lines.map((line) =>
    line
      .split(delimiter)
      .map((value) => value.trim())
      .filter((value, index, values) => {
        if (delimiter !== "|" || index < values.length - 1) {
          return true;
        }

        return value.length > 0;
      })
  );

  const firstRow = parsedLines[0] ?? [];
  const dataRows = [...parsedLines];
  const columns = looksLikeHeaderRow(firstRow)
    ? firstRow.map((value, index) => value || `Campo ${index + 1}`)
    : buildGenericColumns(
        parsedLines.reduce((max, row) => Math.max(max, row.length), 0)
      );

  if (looksLikeHeaderRow(firstRow)) {
    dataRows.shift();
  }

  const totalColumns = columns.length;
  const previewRows = toPreviewRows(dataRows, totalColumns);

  return {
    sourceFileName,
    sourceType: "txt",
    columns,
    rows: previewRows,
    totalRows: dataRows.length,
    truncated: false,
    notes: ["Vista previa generada desde los datos de la SUNAT."],
  };
}

async function parseWorkbook(
  bytes: Buffer,
  sourceFileName: string
): Promise<SireSalesProposalPreview> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(bytes as never);

  const worksheet = workbook.worksheets[0];

  if (!worksheet) {
    throw new SireServiceError("SUNAT devolvio un archivo Excel sin hojas para mostrar.");
  }

  const rows = worksheet.getSheetValues().slice(1);
  const normalizedRows = rows
    .map((row) => {
      if (!Array.isArray(row)) {
        return [];
      }

      return row.slice(1).map(normalizeCellValue);
    })
    .filter((row) => row.some(Boolean));

  if (normalizedRows.length === 0) {
    throw new SireServiceError("SUNAT devolvio una hoja Excel sin filas para mostrar.");
  }

  const firstRow = normalizedRows[0] ?? [];
  const dataRows = [...normalizedRows];
  const columns = looksLikeHeaderRow(firstRow)
    ? firstRow.map((value, index) => value || `Campo ${index + 1}`)
    : buildGenericColumns(
        normalizedRows.reduce((max, row) => Math.max(max, row.length), 0)
      );

  if (looksLikeHeaderRow(firstRow)) {
    dataRows.shift();
  }

  return {
    sourceFileName,
    sourceType: "xlsx",
    columns,
    rows: toPreviewRows(dataRows, columns.length),
    totalRows: dataRows.length,
    truncated: false,
    notes: ["Vista previa generada desde los datos de la SUNAT."],
  };
}

async function parseInnerFile(
  fileName: string,
  bytes: Buffer
): Promise<SireSalesProposalPreview> {
  const lowerFileName = fileName.toLowerCase();

  if (lowerFileName.endsWith(".txt") || lowerFileName.endsWith(".csv")) {
    return parseDelimitedText(new TextDecoder("utf-8").decode(bytes), fileName);
  }

  if (
    lowerFileName.endsWith(".xlsx") ||
    bytes.subarray(0, 2).toString("hex").toLowerCase() === "504b"
  ) {
    return parseWorkbook(bytes, fileName);
  }

  if (lowerFileName.endsWith(".xls")) {
    throw new SireServiceError(
      "SUNAT devolvio un archivo XLS clasico. Para ver la propuesta en pantalla, solicita el archivo en formato TXT."
    );
  }

  throw new SireServiceError(
    "SUNAT devolvio un formato de archivo que aun no podemos mostrar en pantalla."
  );
}

export async function parseSireSalesProposalPreview(input: {
  fileName: string;
  bytes: Buffer;
}): Promise<SireSalesProposalPreview> {
  const lowerFileName = input.fileName.toLowerCase();

  if (lowerFileName.endsWith(".zip")) {
    const zip = await JSZip.loadAsync(input.bytes);
    const files = Object.values(zip.files).filter((file) => !file.dir);
    const preferredFile =
      files.find((file) => /\.(txt|csv)$/i.test(file.name)) ??
      files.find((file) => /\.(xlsx|xls)$/i.test(file.name)) ??
      files[0];

    if (!preferredFile) {
      throw new SireServiceError("SUNAT devolvio un ZIP sin archivos para mostrar.");
    }

    const innerBytes = await preferredFile.async("nodebuffer");
    return parseInnerFile(preferredFile.name, innerBytes);
  }

  return parseInnerFile(input.fileName, input.bytes);
}

export function buildSireSalesProposalPreviewPage(input: {
  preview: SireSalesProposalPreview;
  page: number;
  perPage: number;
  query: string;
}): SireSalesProposalPreviewPage {
  const safePage = Math.max(1, input.page);
  const safePerPage = Math.min(100, Math.max(1, input.perPage));
  const normalizedQuery = input.query.trim().toLowerCase();
  const filteredRows = normalizedQuery
    ? input.preview.rows.filter((row) =>
        row.values.some((value) => value.toLowerCase().includes(normalizedQuery))
      )
    : input.preview.rows;
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / safePerPage));
  const currentPage = Math.min(safePage, totalPages);
  const startIndex = (currentPage - 1) * safePerPage;
  const paginatedRows = filteredRows.slice(startIndex, startIndex + safePerPage);

  return {
    sourceFileName: input.preview.sourceFileName,
    sourceType: input.preview.sourceType,
    columns: input.preview.columns,
    rows: paginatedRows,
    totalRows: input.preview.totalRows,
    filteredRows: filteredRows.length,
    notes: input.preview.notes,
    page: currentPage,
    perPage: safePerPage,
    totalPages,
    query: input.query,
  };
}
