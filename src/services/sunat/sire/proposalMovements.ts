import type { Movement, Report, SunatSireSalesTicket } from "@/types/db";
import type { SireSalesProposalPreview } from "@/types/sire";
import { getStoredProposalPreview } from "@/services/sunat/sire/ticketSnapshot";

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  "01": "Factura",
  "03": "Boleta",
  "07": "Nota de credito",
  "08": "Nota de debito",
  "12": "Ticket",
  "13": "Documento bancario",
  "14": "Recibo publico",
  "18": "Documento de transporte",
  "23": "Poliza",
  "34": "Pasaje aereo",
};

const DATE_HEADER_ALIASES = [
  "fechaemision",
  "fechadeemision",
  "fechaemisio",
  "fechaemision",
  "fechadeemision",
  "fecemision",
  "fechadocumento",
  "fecdocumento",
  "fecha",
];

const AMOUNT_HEADER_ALIASES = [
  "totalcp",
  "totaldocumento",
  "importetotal",
  "montototal",
  "mtototal",
  "mtototalcp",
  "mtototaldocumentoemitido",
  "mtototaldocumento",
  "importetotaldocumento",
  "importetotalcomprobante",
  "importetotalcp",
  "montocomprobante",
  "mnttotal",
  "importeventa",
  "valordeventa",
  "mtooperacion",
];

const DOCUMENT_TYPE_HEADER_ALIASES = [
  "tipocpdoc",
  "tipocpdocumento",
  "codtipocdp",
  "tipocdp",
  "tipocomprobante",
  "tipodocumento",
  "codtipodocumento",
];

const SERIES_HEADER_ALIASES = [
  "numseriecdp",
  "seriecdp",
  "serie",
];

const NUMBER_HEADER_ALIASES = [
  "numcdp",
  "numerocdp",
  "numerodocumento",
  "correlativo",
  "numero",
];

const CUSTOMER_HEADER_ALIASES = [
  "apellidosnombresrazonsocial",
  "apellidosnombresrazonsocialcliente",
  "numrucadquiriente",
  "numdocadquiriente",
  "numdocidentidadadquiriente",
  "apellidoynombreodenominacionadquiriente",
  "razonsocialadquiriente",
  "denominacionadquiriente",
  "nomrazonsocialadquiriente",
  "nomrazonsocialcliente",
  "apellidosnombresdenominacion",
  "cliente",
];

const TAXABLE_BASE_HEADER_ALIASES = [
  "bigravada",
  "baseimponible",
  "basegravada",
  "valorfacturadoexportacion",
];

const TAX_HEADER_ALIASES = [
  "igvipm",
  "igv",
  "montoigv",
  "impuesto",
];

const CURRENCY_HEADER_ALIASES = [
  "moneda",
  "codmoneda",
  "tipomoneda",
];

const OPERATION_TYPE_HEADER_ALIASES = [
  "tipooperacion",
  "codtipooperacion",
  "operacion",
];

const DATE_VALUE_PATTERN = /^\d{2}\/\d{2}\/\d{4}$|^\d{4}-\d{2}-\d{2}$|^\d{8}$/;
const DOCUMENT_TYPE_VALUE_PATTERN =
  /^(01|03|07|08|12|13|14|18|23|34)$/;

function normalizeHeaderValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function buildHeaderIndex(columns: string[]) {
  return new Map(
    columns.map((column, index) => [normalizeHeaderValue(column), index])
  );
}

function findColumnIndex(
  headerIndex: Map<string, number>,
  aliases: string[]
): number {
  for (const alias of aliases) {
    const exactIndex = headerIndex.get(alias);

    if (exactIndex !== undefined) {
      return exactIndex;
    }
  }

  for (const [header, index] of headerIndex.entries()) {
    if (aliases.some((alias) => header.includes(alias))) {
      return index;
    }
  }

  return -1;
}

function inferColumnIndex(
  rows: SireSalesProposalPreview["rows"],
  totalColumns: number,
  matcher: (value: string) => boolean
) {
  let bestIndex = -1;
  let bestScore = 0;
  const minimumMatches = Math.max(
    1,
    Math.min(3, Math.ceil(rows.length * 0.15))
  );

  for (let columnIndex = 0; columnIndex < totalColumns; columnIndex += 1) {
    const score = rows.reduce((total, row) => {
      return total + (matcher(row.values[columnIndex] ?? "") ? 1 : 0);
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      bestIndex = columnIndex;
    }
  }

  return bestScore >= minimumMatches ? bestIndex : -1;
}

function scoreAmountValue(value: string) {
  const trimmedValue = value.trim();
  const parsedAmount = parseSunatAmount(trimmedValue);
  const digitsOnlyValue = trimmedValue.replace(/[^\d]/g, "");

  if (
    !trimmedValue ||
    /[a-z]/i.test(trimmedValue) ||
    DATE_VALUE_PATTERN.test(trimmedValue) ||
    DOCUMENT_TYPE_VALUE_PATTERN.test(trimmedValue)
  ) {
    return Number.NEGATIVE_INFINITY;
  }

  let score = 0;

  if (!(parsedAmount > 0)) {
    return Number.NEGATIVE_INFINITY;
  }

  if (/[,.]\d{1,2}$/.test(trimmedValue)) {
    score += 5;
  }

  if (
    /^\d{1,3}([.,]\d{3})+([.,]\d{1,2})?$/.test(trimmedValue) ||
    /^\d+[.,]\d{1,2}$/.test(trimmedValue)
  ) {
    score += 4;
  }

  if (parsedAmount > 0 && parsedAmount <= 1_000_000) {
    score += 2;
  }

  if (/^\d+$/.test(trimmedValue) && digitsOnlyValue.length >= 8) {
    score -= 6;
  }

  if (/[-/]/.test(trimmedValue) && !/[,.]\d{1,2}$/.test(trimmedValue)) {
    score -= 3;
  }

  if (parsedAmount >= 100_000_000) {
    score -= 6;
  }

  return score;
}

function inferAmountColumnIndex(
  rows: SireSalesProposalPreview["rows"],
  totalColumns: number
) {
  let bestIndex = -1;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (let columnIndex = 0; columnIndex < totalColumns; columnIndex += 1) {
    const columnScore = rows.reduce((total, row) => {
      return total + scoreAmountValue(row.values[columnIndex] ?? "");
    }, 0);

    if (columnScore > bestScore) {
      bestScore = columnScore;
      bestIndex = columnIndex;
    }
  }

  return bestScore > 0 ? bestIndex : -1;
}

function parseSunatDate(value: string, periodo: string) {
  const trimmedValue = value.trim();

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmedValue)) {
    const [day, month, year] = trimmedValue.split("/");
    return `${year}-${month}-${day}`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
    return trimmedValue;
  }

  if (/^\d{8}$/.test(trimmedValue)) {
    const year = trimmedValue.slice(0, 4);
    const month = trimmedValue.slice(4, 6);
    const day = trimmedValue.slice(6, 8);
    return `${year}-${month}-${day}`;
  }

  return `${periodo.slice(0, 4)}-${periodo.slice(4, 6)}-01`;
}

function parseSunatAmount(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return 0;
  }

  const sanitizedValue = trimmedValue.replace(/[^\d,.-]/g, "");
  const lastCommaIndex = sanitizedValue.lastIndexOf(",");
  const lastDotIndex = sanitizedValue.lastIndexOf(".");

  if (lastCommaIndex >= 0 && lastDotIndex >= 0) {
    const decimalSeparator = lastCommaIndex > lastDotIndex ? "," : ".";
    const normalizedValue =
      decimalSeparator === ","
        ? sanitizedValue.replace(/\./g, "").replace(",", ".")
        : sanitizedValue.replace(/,/g, "");

    return Number.parseFloat(normalizedValue) || 0;
  }

  if (lastCommaIndex >= 0) {
    return Number.parseFloat(sanitizedValue.replace(/\./g, "").replace(",", ".")) || 0;
  }

  return Number.parseFloat(sanitizedValue.replace(/,/g, "")) || 0;
}

function looksLikeDateValue(value: string) {
  return DATE_VALUE_PATTERN.test(value.trim());
}

function looksLikeDocumentTypeValue(value: string) {
  return DOCUMENT_TYPE_VALUE_PATTERN.test(value.trim());
}

function resolveDocumentTypeLabel(rawValue: string) {
  const trimmedValue = rawValue.trim();
  return (DOCUMENT_TYPE_LABELS[trimmedValue] ?? trimmedValue) || "Comprobante";
}

function buildMovementDescription(input: {
  documentType: string;
  series: string;
  number: string;
  customer: string;
  currency: string;
  operationType: string;
}) {
  const segments = [input.documentType];
  const serialValue = [input.series, input.number].filter(Boolean).join("-");

  if (serialValue) {
    segments.push(serialValue);
  }

  if (input.customer) {
    segments.push(input.customer);
  }

  if (input.currency) {
    segments.push(input.currency);
  }

  if (input.operationType) {
    segments.push(input.operationType);
  }

  return segments.join(" | ");
}

export function buildMovementsFromSireSalesPreview(input: {
  companyId: string;
  periodo: string;
  ticketNumber: string;
  preview: SireSalesProposalPreview;
}): Movement[] {
  const headerIndex = buildHeaderIndex(input.preview.columns);
  const dateIndex = findColumnIndex(headerIndex, DATE_HEADER_ALIASES);
  const amountIndex = findColumnIndex(headerIndex, AMOUNT_HEADER_ALIASES);
  const documentTypeIndex = findColumnIndex(
    headerIndex,
    DOCUMENT_TYPE_HEADER_ALIASES
  );
  const seriesIndex = findColumnIndex(headerIndex, SERIES_HEADER_ALIASES);
  const numberIndex = findColumnIndex(headerIndex, NUMBER_HEADER_ALIASES);
  const customerIndex = findColumnIndex(headerIndex, CUSTOMER_HEADER_ALIASES);
  const taxableBaseIndex = findColumnIndex(
    headerIndex,
    TAXABLE_BASE_HEADER_ALIASES
  );
  const taxIndex = findColumnIndex(headerIndex, TAX_HEADER_ALIASES);
  const currencyIndex = findColumnIndex(headerIndex, CURRENCY_HEADER_ALIASES);
  const operationTypeIndex = findColumnIndex(
    headerIndex,
    OPERATION_TYPE_HEADER_ALIASES
  );

  const resolvedDateIndex =
    dateIndex >= 0
      ? dateIndex
      : inferColumnIndex(
          input.preview.rows,
          input.preview.columns.length,
          looksLikeDateValue
        );
  const resolvedAmountIndex =
    amountIndex >= 0
      ? amountIndex
      : inferAmountColumnIndex(input.preview.rows, input.preview.columns.length);
  const resolvedDocumentTypeIndex =
    documentTypeIndex >= 0
      ? documentTypeIndex
      : inferColumnIndex(
          input.preview.rows,
          input.preview.columns.length,
          looksLikeDocumentTypeValue
        );

  if (resolvedAmountIndex < 0) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[SIRE MAP DEBUG]", {
        companyId: input.companyId,
        periodo: input.periodo,
        ticketNumber: input.ticketNumber,
        columns: input.preview.columns,
        sampleRow: input.preview.rows[0]?.values ?? [],
        reason: "amount-column-not-found",
      });
    }

    return [];
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("[SIRE MAP DEBUG]", {
      companyId: input.companyId,
      periodo: input.periodo,
      ticketNumber: input.ticketNumber,
      mappedRows: input.preview.rows.length,
      columns: input.preview.columns,
      resolvedDateIndex,
      resolvedAmountIndex,
      resolvedDocumentTypeIndex,
      sampleRow: input.preview.rows[0]?.values ?? [],
    });
  }

  return input.preview.rows
    .map<Movement | null>((row, rowIndex) => {
      const amountValue = parseSunatAmount(
        row.values[resolvedAmountIndex] ?? ""
      );

      if (!(amountValue > 0)) {
        return null;
      }

      const documentType = resolveDocumentTypeLabel(
        resolvedDocumentTypeIndex >= 0
          ? row.values[resolvedDocumentTypeIndex] ?? ""
          : ""
      );
      const movementDate = parseSunatDate(
        resolvedDateIndex >= 0 ? row.values[resolvedDateIndex] ?? "" : "",
        input.periodo
      );
      const customerName =
        customerIndex >= 0 ? row.values[customerIndex]?.trim() ?? "" : "";
      const currencyCode =
        currencyIndex >= 0 ? row.values[currencyIndex]?.trim() ?? "" : "";
      const operationType =
        operationTypeIndex >= 0
          ? row.values[operationTypeIndex]?.trim() ?? ""
          : "";
      const taxableBaseAmount =
        taxableBaseIndex >= 0
          ? parseSunatAmount(row.values[taxableBaseIndex] ?? "")
          : 0;
      const taxAmount =
        taxIndex >= 0 ? parseSunatAmount(row.values[taxIndex] ?? "") : 0;
      const description = buildMovementDescription({
        documentType,
        series: seriesIndex >= 0 ? row.values[seriesIndex] ?? "" : "",
        number: numberIndex >= 0 ? row.values[numberIndex] ?? "" : "",
        customer: customerName,
        currency: currencyCode,
        operationType,
      });

      return {
        id: `sire-${input.periodo}-${input.ticketNumber}-${rowIndex + 1}`,
        company_id: input.companyId,
        movement_type: "Venta",
        document_type: documentType,
        description: description || "Movimiento obtenido desde la propuesta SUNAT",
        amount: amountValue,
        movement_date: movementDate,
        created_at: new Date(`${movementDate}T00:00:00.000Z`).toISOString(),
        customer_name: customerName || undefined,
        currency_code: currencyCode || undefined,
        operation_type: operationType || undefined,
        taxable_base_amount:
          taxableBaseAmount > 0 ? taxableBaseAmount : undefined,
        tax_amount: taxAmount > 0 ? taxAmount : undefined,
      } satisfies Movement;
    })
    .filter((movement): movement is Movement => movement !== null);
}

function buildSyntheticReportFromTicket(
  companyId: string,
  ticket: SunatSireSalesTicket
): Report {
  return {
    id: `sire-report-${ticket.id}`,
    company_id: companyId,
    report_type: `Propuesta SUNAT RVIE ${ticket.periodo}`,
    file_url: ticket.report_file_name
      ? `sunat://rvie/${ticket.periodo}/${ticket.ticket_number}/${ticket.report_file_name}`
      : "",
    generated_at: ticket.updated_at,
  };
}

export function buildDatasetFromStoredSireSalesTickets(input: {
  companyId: string;
  tickets: SunatSireSalesTicket[];
}) {
  const sortedTickets = [...input.tickets].sort((left, right) =>
    right.updated_at.localeCompare(left.updated_at)
  );
  const latestTicketByPeriod = new Map<string, SunatSireSalesTicket>();

  for (const ticket of sortedTickets) {
    if (latestTicketByPeriod.has(ticket.periodo)) {
      continue;
    }

    if (!getStoredProposalPreview(ticket.last_response)) {
      continue;
    }

    latestTicketByPeriod.set(ticket.periodo, ticket);
  }

  const ticketsWithPreview = Array.from(latestTicketByPeriod.values());
  const movements = ticketsWithPreview.flatMap((ticket) => {
    const preview = getStoredProposalPreview(ticket.last_response);

    if (!preview) {
      return [];
    }

    return buildMovementsFromSireSalesPreview({
      companyId: input.companyId,
      periodo: ticket.periodo,
      ticketNumber: ticket.ticket_number,
      preview,
    });
  });

  const reports = ticketsWithPreview.map((ticket) =>
    buildSyntheticReportFromTicket(input.companyId, ticket)
  );

  if (process.env.NODE_ENV !== "production") {
    console.info("[SIRE DATASET DEBUG]", {
      companyId: input.companyId,
      totalTickets: input.tickets.length,
      ticketsWithPreview: ticketsWithPreview.length,
      mappedMovements: movements.length,
      periods: ticketsWithPreview.map((ticket) => ticket.periodo),
    });
  }

  return {
    movements,
    reports,
    periods: ticketsWithPreview.map((ticket) => ticket.periodo),
  };
}
