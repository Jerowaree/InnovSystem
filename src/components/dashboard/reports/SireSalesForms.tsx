"use client";

import { Download, FileDown, Loader2, Search } from "lucide-react";
import type { FormEventHandler } from "react";
import CompactSelect, {
  type CompactSelectOption,
} from "@/components/CompactSelect";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { SireSalesWorkflowFormValues } from "@/schemas/sireSalesSchemas";
import type { SireSalesTicketStatusItem } from "@/types/sire";

interface PeriodOption {
  value: string;
  label: string;
  status: string;
}

interface SireSalesProposalFormProps {
  errors: FieldErrors<SireSalesWorkflowFormValues>;
  isRequestingProposal: boolean;
  isValid: boolean;
  onPeriodChange: (value: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  periods: PeriodOption[];
  register: UseFormRegister<SireSalesWorkflowFormValues>;
  selectedPeriod: string;
  selectedPeriodStatus: string;
}

interface SireSalesTicketActionsProps {
  canDownloadFile: boolean;
  canPreviewFile: boolean;
  errors: FieldErrors<SireSalesWorkflowFormValues>;
  isCheckingTicket: boolean;
  isDownloadingFile: boolean;
  isPreviewingFile: boolean;
  latestTicket: string;
  latestTicketStatus: SireSalesTicketStatusItem | null;
  onCheckTicket: () => void;
  onDownloadFile: () => void;
  onPreviewFile: () => void;
  register: UseFormRegister<SireSalesWorkflowFormValues>;
}

function getTicketStateLabel(item: SireSalesTicketStatusItem | null) {
  if (!item) {
    return "Aun no revisas un ticket.";
  }

  return item.desEstadoProceso ?? item.codEstadoProceso ?? "Estado recibido";
}

export function SireSalesProposalForm({
  errors,
  isRequestingProposal,
  isValid,
  onPeriodChange,
  onSubmit,
  periods,
  register,
  selectedPeriod,
  selectedPeriodStatus,
}: SireSalesProposalFormProps) {
  const periodOptions: CompactSelectOption[] = [
    {
      value: "",
      label: "Selecciona un periodo",
      menuLabel: "Selecciona un periodo",
    },
    ...periods.map((period) => ({
      value: period.value,
      label: period.label,
      menuLabel: period.label,
      description: period.status,
    })),
  ];

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-[18px] border border-slate-200 bg-slate-50/70 p-5"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <label
            htmlFor="periodo"
            className="mb-2 inline-flex text-sm font-medium text-slate-700"
          >
            Periodo tributario
          </label>
          <input
            id="periodo"
            {...register("periodo")}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          />
          <CompactSelect
            ariaLabel="Seleccionar periodo tributario"
            options={periodOptions}
            value={selectedPeriod}
            onChange={onPeriodChange}
            placeholder="Selecciona un periodo"
          />
          {errors.periodo ? (
            <p className="mt-2 text-xs text-rose-600">
              {errors.periodo.message}
            </p>
          ) : (
            <p className="mt-2 text-xs text-slate-500">
              Estado informado por SUNAT: {selectedPeriodStatus}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="fileType"
            className="mb-2 inline-flex text-sm font-medium text-slate-700"
          >
            Formato
          </label>
          <select
            id="fileType"
            {...register("fileType")}
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
          >
            <option value="0">TXT</option>
            <option value="1">XLS</option>
          </select>
          {errors.fileType ? (
            <p className="mt-2 text-xs text-rose-600">
              {errors.fileType.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="submit"
          disabled={!isValid || isRequestingProposal}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isRequestingProposal ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4" />
          )}
          {isRequestingProposal ? "Solicitando..." : "Pedir propuesta a SUNAT"}
        </button>
      </div>
    </form>
  );
}

export function SireSalesTicketActions({
  canDownloadFile,
  canPreviewFile,
  errors,
  isCheckingTicket,
  isDownloadingFile,
  isPreviewingFile,
  latestTicket,
  latestTicketStatus,
  onCheckTicket,
  onDownloadFile,
  onPreviewFile,
  register,
}: SireSalesTicketActionsProps) {
  return (
    <div className="rounded-[18px] border border-slate-200 bg-slate-50/70 p-5">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto_auto_auto] xl:items-end">
        <div className="min-w-0">
          <label
            htmlFor="ticketNumber"
            className="mb-2 inline-flex text-sm font-medium text-slate-700"
          >
            Numero de ticket
          </label>
          <input
            id="ticketNumber"
            type="text"
            autoComplete="off"
            placeholder="Aqui aparecera el ticket"
            {...register("ticketNumber")}
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
          />
          {errors.ticketNumber ? (
            <p className="mt-2 text-xs text-rose-600">
              {errors.ticketNumber.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2 xl:col-span-3">
          <button
            type="button"
            onClick={onCheckTicket}
            disabled={isCheckingTicket}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isCheckingTicket ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Consultar ticket
          </button>

          <button
            type="button"
            onClick={onDownloadFile}
            disabled={!canDownloadFile || isDownloadingFile}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isDownloadingFile ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Descargar archivo
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
            Ticket actual
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {latestTicket || "Pendiente"}
          </p>
        </div>

        <div className="rounded-xl bg-white p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
            Estado
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {getTicketStateLabel(latestTicketStatus)}
          </p>
        </div>

        <div className="rounded-xl bg-white p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
            Archivo
          </p>
          <p className="mt-2 truncate text-sm font-semibold text-slate-900">
            {latestTicketStatus?.nomArchivoReporte ?? "Pendiente"}
          </p>
          <button
            type="button"
            onClick={onPreviewFile}
            disabled={!canPreviewFile || isPreviewingFile}
            className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPreviewingFile ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Ver propuesta
          </button>
        </div>
      </div>
    </div>
  );
}
