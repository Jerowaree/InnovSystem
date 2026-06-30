"use client";

import { Download, Loader2, RefreshCw } from "lucide-react";
import type { SireSalesTicketSummary } from "@/types/sire";

function getFriendlyFileTypeLabel(fileTypeCode: string) {
  return fileTypeCode === "1" ? "XLS" : "TXT";
}

function getFriendlyProcessStatusLabel(processStatus: string | null) {
  if (!processStatus) {
    return "Pendiente";
  }

  const normalizedValue = processStatus.trim().toLowerCase();

  if (normalizedValue === "06") {
    return "Terminado";
  }

  if (normalizedValue === "01") {
    return "Recibido";
  }

  if (normalizedValue === "02") {
    return "En proceso";
  }

  if (normalizedValue === "03") {
    return "Observado";
  }

  if (normalizedValue === "04") {
    return "Rechazado";
  }

  return processStatus;
}

interface SireSalesTicketHistoryProps {
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  historyStatusMessage?: string | null;
  isLoadingHistory: boolean;
  onDownloadTicket: (ticket: SireSalesTicketSummary) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onRefreshHistory: () => void;
  totalCount: number;
  totalPages: number;
  tickets: SireSalesTicketSummary[];
}

export function SireSalesTicketHistory({
  currentPage,
  hasNextPage,
  hasPreviousPage,
  historyStatusMessage,
  isLoadingHistory,
  onDownloadTicket,
  onNextPage,
  onPreviousPage,
  onRefreshHistory,
  totalCount,
  totalPages,
  tickets,
}: SireSalesTicketHistoryProps) {
  return (
    <div className="rounded-[18px] border border-slate-200 bg-slate-50/70 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-950">
            Historial de tickets SUNAT
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Aqui veras tus solicitudes recientes y si el archivo ya esta listo
            para descargar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onPreviousPage}
            disabled={!hasPreviousPage || isLoadingHistory}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={onNextPage}
            disabled={!hasNextPage || isLoadingHistory}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Siguiente
          </button>
          <button
            type="button"
            onClick={onRefreshHistory}
            disabled={isLoadingHistory}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoadingHistory ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Actualizar
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-1 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Pagina {currentPage} de {totalPages}
        </span>
        <span>
          {totalCount} ticket{totalCount === 1 ? "" : "s"} registrado
          {totalCount === 1 ? "" : "s"}
        </span>
      </div>

      {historyStatusMessage ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {historyStatusMessage}
        </div>
      ) : null}

      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[0.9fr_1fr_1fr_0.8fr_1.1fr_0.8fr] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
            <span>Periodo</span>
            <span>Ticket</span>
            <span>Estado</span>
            <span>Formato</span>
            <span>Archivo</span>
            <span>Accion</span>
          </div>

          {tickets.length > 0 ? (
            tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="grid grid-cols-[0.9fr_1fr_1fr_0.8fr_1.1fr_0.8fr] gap-3 border-t border-slate-100 px-4 py-4 text-sm text-slate-700"
              >
                <span>{ticket.periodo}</span>
                <span className="font-medium text-slate-900">
                  {ticket.ticketNumber}
                </span>
                <span>{getFriendlyProcessStatusLabel(ticket.processStatus)}</span>
                <span>{getFriendlyFileTypeLabel(ticket.fileTypeCode)}</span>
                <span className="truncate">
                  {ticket.reportFileName ?? "Aun no disponible"}
                </span>
                <button
                  type="button"
                  disabled={!ticket.reportFileName || !ticket.reportFileTypeCode}
                  onClick={() => onDownloadTicket(ticket)}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Download className="h-3.5 w-3.5" />
                  Descargar
                </button>
              </div>
            ))
          ) : (
            <div className="px-4 py-6 text-sm text-slate-500">
              Aun no hay tickets registrados para mostrar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
