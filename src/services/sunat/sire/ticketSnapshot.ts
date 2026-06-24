import type {
  SireSalesProposalPreview,
  SireSalesTicketStoredPayload,
} from "@/types/sire";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStoredProposalPreview(value: unknown): value is SireSalesProposalPreview {
  return (
    isRecord(value) &&
    typeof value.sourceFileName === "string" &&
    (value.sourceType === "txt" || value.sourceType === "xlsx") &&
    Array.isArray(value.columns) &&
    Array.isArray(value.rows) &&
    typeof value.totalRows === "number" &&
    typeof value.truncated === "boolean" &&
    Array.isArray(value.notes)
  );
}

export function readStoredTicketPayload(
  value: unknown
): SireSalesTicketStoredPayload {
  if (!isRecord(value)) {
    return {};
  }

  return {
    proposalTicket: value.proposalTicket,
    ticketStatus: value.ticketStatus,
    proposalPreview: isStoredProposalPreview(value.proposalPreview)
      ? value.proposalPreview
      : null,
    proposalPreviewCapturedAt:
      typeof value.proposalPreviewCapturedAt === "string"
        ? value.proposalPreviewCapturedAt
        : null,
  };
}

export function mergeStoredTicketPayload(
  currentValue: unknown,
  patch: Partial<SireSalesTicketStoredPayload>
): SireSalesTicketStoredPayload {
  return {
    ...readStoredTicketPayload(currentValue),
    ...patch,
  };
}

export function getStoredProposalPreview(value: unknown) {
  return readStoredTicketPayload(value).proposalPreview ?? null;
}
