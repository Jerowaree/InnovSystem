export type SireBookCode = "080000" | "140000";
export type SireProposalFileTypeCode = "0" | "1";

export interface SireConfigFormData {
  ruc: string;
  solUser: string;
  solPassword: string;
  clientId: string;
  clientSecret: string;
  securityBaseUrl: string;
  apiBaseUrl: string;
}

export interface SireConfigSummary {
  id: string;
  companyId: string;
  ruc: string;
  solUser: string;
  clientId: string;
  securityBaseUrl: string;
  apiBaseUrl: string;
  hasSolPassword: boolean;
  hasClientSecret: boolean;
  createdAt: string;
  updatedAt: string;
  lastTestedAt: string | null;
  lastTestStatus: "success" | "error" | null;
  lastTestMessage: string | null;
}

export interface SireAccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

export interface SirePeriodItem {
  perTributario: string;
  codEstado: string;
  desEstado: string;
}

export interface SirePeriodYear {
  numEjercicio: string;
  desEstado: string;
  lisPeriodos: SirePeriodItem[];
}

export interface SireBookStatus {
  code: SireBookCode;
  ok: boolean;
  years: number;
  periods: number;
  message: string;
  accessState?: "available" | "unauthorized" | "error";
}

export interface SireStatusResponse {
  configured: boolean;
  checkedAt: string | null;
  message: string;
  missingFields: string[];
  auth: {
    ok: boolean;
    message: string;
  };
  diagnostics?: {
    tokenOk: boolean;
    moduleAccess: {
      rvie: boolean;
      rce: boolean;
    };
  };
  books: {
    rvie: SireBookStatus;
    rce: SireBookStatus;
  };
}

export interface SireDashboardContext {
  config: SireConfigSummary | null;
  periodCodes: string[];
  availability: "available" | "not_configured" | "unavailable" | "unknown";
  message: string | null;
}

export interface SireSalesProposalRequest {
  periodo: string;
  fileType: SireProposalFileTypeCode;
}

export interface SireSalesProposalTicketResponse {
  numTicket: string;
}

export interface SireSalesReportFile {
  nomArchivoReporte: string;
  codTipoArchivoReporte: string;
}

export interface SireSalesTicketStatusItem {
  numTicket: string;
  codEstadoProceso: string;
  desEstadoProceso: string;
  codProceso?: string;
  desProceso?: string;
  nomArchivoImportacion?: string;
  archivoReporte?: SireSalesReportFile;
  nomArchivoReporte?: string;
  codTipoArchivoReporte?: string;
  [key: string]: unknown;
}

export interface SireSalesTicketStatusResponse {
  items: SireSalesTicketStatusItem[];
  raw: unknown;
}

export interface SireSalesDownloadParams {
  reportFileName: string;
  reportFileTypeCode: string;
  periodo: string;
  processCode: string;
  ticketNumber: string;
}

export interface SireSalesTicketSummary {
  id: string;
  periodo: string;
  ticketNumber: string;
  fileTypeCode: "0" | "1";
  processStatus: string | null;
  reportFileName: string | null;
  reportFileTypeCode: string | null;
  updatedAt: string;
}

export interface SireSalesTicketHistoryPage {
  tickets: SireSalesTicketSummary[];
  page: number;
  perPage: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SireSalesProposalPreviewRow {
  id: string;
  values: string[];
}

export interface SireSalesProposalPreview {
  sourceFileName: string;
  sourceType: "txt" | "xlsx";
  columns: string[];
  rows: SireSalesProposalPreviewRow[];
  totalRows: number;
  truncated: boolean;
  notes: string[];
}

export interface SireSalesProposalPreviewPage {
  sourceFileName: string;
  sourceType: "txt" | "xlsx";
  columns: string[];
  rows: SireSalesProposalPreviewRow[];
  totalRows: number;
  filteredRows: number;
  notes: string[];
  page: number;
  perPage: number;
  totalPages: number;
  query: string;
}

export interface SireSalesTicketStoredPayload {
  proposalTicket?: unknown;
  ticketStatus?: unknown;
  proposalPreview?: SireSalesProposalPreview | null;
  proposalPreviewCapturedAt?: string | null;
}
