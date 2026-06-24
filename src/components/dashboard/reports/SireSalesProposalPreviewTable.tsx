"use client";

import { FileSpreadsheet, Loader2, Search } from "lucide-react";
import type { ChangeEvent } from "react";
import type { SireSalesProposalPreviewPage } from "@/types/sire";

interface SireSalesProposalPreviewTableProps {
  filterValue: string;
  isFiltering: boolean;
  isLoading: boolean;
  onFilterChange: (value: string) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  previewPage: SireSalesProposalPreviewPage | null;
}

export function SireSalesProposalPreviewTable({
  filterValue,
  isFiltering,
  isLoading,
  onFilterChange,
  onNextPage,
  onPreviousPage,
  previewPage,
}: SireSalesProposalPreviewTableProps) {
  const showLoadingIndicator = isLoading || isFiltering;

  return (
    <div className="rounded-[18px] border border-slate-200 bg-slate-50/70 p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-950">
            Vista previa de la propuesta
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Aqui puedes revisar los movimientos del archivo generado por SUNAT
            antes de descargarlo.
          </p>
        </div>
        {showLoadingIndicator ? (
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            {isFiltering ? "Filtrando..." : "Preparando vista..."}
          </div>
        ) : null}
      </div>

      {previewPage ? (
        <>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {previewPage.sourceFileName}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {previewPage.totalRows} fila
                  {previewPage.totalRows === 1 ? "" : "s"} detectada
                  {previewPage.totalRows === 1 ? "" : "s"} en el archivo.
                  {previewPage.filteredRows !== previewPage.totalRows
                    ? ` ${previewPage.filteredRows} coinciden con tu busqueda.`
                    : ""}
                </p>
                {previewPage.notes.map((note) => (
                  <p key={note} className="mt-1 text-xs text-slate-500">
                    {note}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="relative block w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={filterValue}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  onFilterChange(event.target.value)
                }
                placeholder="Filtrar por texto"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
              />
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-500">
                Pagina {previewPage.page} de {previewPage.totalPages}
              </span>
              <button
                type="button"
                onClick={onPreviousPage}
                disabled={previewPage.page <= 1 || showLoadingIndicator}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={onNextPage}
                disabled={
                  previewPage.page >= previewPage.totalPages || showLoadingIndicator
                }
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Siguiente
              </button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <div className="min-w-[960px]">
              <div
                className="grid gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium uppercase tracking-[0.14em] text-slate-400"
                style={{
                  gridTemplateColumns: `repeat(${previewPage.columns.length}, minmax(140px, 1fr))`,
                }}
              >
                {previewPage.columns.map((column) => (
                  <span key={column}>{column}</span>
                ))}
              </div>

              {previewPage.rows.map((row) => (
                <div
                  key={row.id}
                  className="grid gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-700"
                  style={{
                    gridTemplateColumns: `repeat(${previewPage.columns.length}, minmax(140px, 1fr))`,
                  }}
                >
                  {row.values.map((value, index) => (
                    <span key={`${row.id}-${index}`} className="truncate">
                      {value || "-"}
                    </span>
                  ))}
                </div>
              ))}

              {previewPage.rows.length === 0 ? (
                <div className="px-4 py-6 text-sm text-slate-500">
                  No encontramos filas para ese filtro.
                </div>
              ) : null}
            </div>
          </div>
        </>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
          Cuando SUNAT deje listo el archivo del ticket, podras abrir aqui la
          propuesta y revisar sus movimientos.
        </div>
      )}
    </div>
  );
}
