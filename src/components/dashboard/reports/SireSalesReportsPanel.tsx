"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  SireSalesProposalForm,
  SireSalesTicketActions,
} from "@/components/dashboard/reports/SireSalesForms";
import { SireSalesProposalPreviewTable } from "@/components/dashboard/reports/SireSalesProposalPreviewTable";
import { SireSalesTicketHistory } from "@/components/dashboard/reports/SireSalesTicketHistory";
import { useAsyncGuards } from "@/hooks/useAsyncGuards";
import {
  sireSalesProposalSchema,
  type SireSalesWorkflowFormValues,
} from "@/schemas/sireSalesSchemas";
import type {
  SireConfigSummary,
  SirePeriodYear,
  SireSalesProposalPreviewPage,
  SireSalesTicketHistoryPage,
  SireSalesTicketStatusItem,
  SireSalesTicketSummary,
} from "@/types/sire";

interface SireSalesReportsPanelProps {
  initialSireConfig: SireConfigSummary | null;
}

interface PeriodOption {
  value: string;
  label: string;
  status: string;
}

interface FeedbackState {
  type: "success" | "error" | "info" | null;
  message: string;
}

const FEEDBACK_TIMEOUT_MS = 5_000;
const TICKET_HISTORY_PAGE_SIZE = 8;
const TICKET_HISTORY_AUTO_REFRESH_MS = 60_000;
const PROPOSAL_PREVIEW_PAGE_SIZE = 10;

function isReadyTicketStatus(status: SireSalesTicketStatusItem | null) {
  if (!status) {
    return false;
  }

  const normalizedCode = status.codEstadoProceso?.trim();
  const normalizedLabel = status.desEstadoProceso?.trim().toLowerCase() ?? "";

  return normalizedCode === "06" || normalizedLabel.includes("terminado");
}

function buildTicketFeedback(status: SireSalesTicketStatusItem | null): FeedbackState {
  if (!status) {
    return {
      type: "info",
      message: "SUNAT respondio, pero no devolvio un detalle legible para este ticket.",
    };
  }

  const statusLabel = status.desEstadoProceso ?? status.codEstadoProceso;

  if (isReadyTicketStatus(status)) {
    if (status.nomArchivoReporte && status.codTipoArchivoReporte) {
      return {
        type: "success",
        message: `SUNAT ya dejo listo tu archivo. Estado actual: ${statusLabel}.`,
      };
    }

    return {
      type: "info",
      message:
        "SUNAT marco el ticket como terminado, pero todavia no nos devolvio el nombre del archivo. Intenta nuevamente en unos segundos.",
    };
  }

  return {
    type: "info",
    message: `SUNAT sigue procesando este ticket. Estado actual: ${statusLabel}.`,
  };
}

function flattenPeriods(periodYears: SirePeriodYear[]): PeriodOption[] {
  return periodYears.flatMap((year) =>
    year.lisPeriodos.map((period) => ({
      value: period.perTributario,
      label: period.perTributario,
      status: period.desEstado,
    }))
  );
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export function SireSalesReportsPanel({
  initialSireConfig,
}: SireSalesReportsPanelProps) {
  const {
    createAbortController,
    finalizeAbortController,
    isAbortControllerError,
    runIfMounted,
  } = useAsyncGuards();
  const [periods, setPeriods] = useState<PeriodOption[]>([]);
  const [latestTicket, setLatestTicket] = useState("");
  const [latestTicketStatus, setLatestTicketStatus] =
    useState<SireSalesTicketStatusItem | null>(null);
  const [ticketHistory, setTicketHistory] = useState<SireSalesTicketSummary[]>(
    []
  );
  const [ticketHistoryPage, setTicketHistoryPage] = useState(1);
  const [ticketHistoryTotalCount, setTicketHistoryTotalCount] = useState(0);
  const [ticketHistoryTotalPages, setTicketHistoryTotalPages] = useState(1);
  const [ticketHistoryHasNextPage, setTicketHistoryHasNextPage] =
    useState(false);
  const [ticketHistoryHasPreviousPage, setTicketHistoryHasPreviousPage] =
    useState(false);
  const [proposalPreviewPage, setProposalPreviewPage] =
    useState<SireSalesProposalPreviewPage | null>(null);
  const [proposalPreviewFilter, setProposalPreviewFilter] = useState("");
  const [proposalPreviewPageNumber, setProposalPreviewPageNumber] = useState(1);
  const [isFilteringPreview, setIsFilteringPreview] = useState(false);
  const [hasAttemptedInitialPeriodsLoad, setHasAttemptedInitialPeriodsLoad] =
    useState(false);
  const [isLoadingPeriods, setIsLoadingPeriods] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isRequestingProposal, setIsRequestingProposal] = useState(false);
  const [isCheckingTicket, setIsCheckingTicket] = useState(false);
  const [isDownloadingFile, setIsDownloadingFile] = useState(false);
  const [isPreviewingFile, setIsPreviewingFile] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>({
    type: null,
    message: "",
  });

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    control,
    formState: { errors, isValid },
  } = useForm<SireSalesWorkflowFormValues>({
    resolver: yupResolver(sireSalesProposalSchema),
    mode: "onChange",
    defaultValues: {
      periodo: "",
      fileType: "0",
      ticketNumber: "",
    },
  });

  const selectedPeriod = useWatch({
    control,
    name: "periodo",
  });

  const isConfigured =
    Boolean(initialSireConfig?.hasSolPassword) &&
    Boolean(initialSireConfig?.hasClientSecret) &&
    Boolean(initialSireConfig?.solUser) &&
    Boolean(initialSireConfig?.ruc);

  const canDownloadFile = Boolean(
    latestTicket &&
      latestTicketStatus?.nomArchivoReporte &&
      latestTicketStatus?.codTipoArchivoReporte
  );
  const canPreviewFile = canDownloadFile;

  const selectedPeriodStatus = useMemo(() => {
    const found = periods.find((period) => period.value === selectedPeriod);
    return found?.status ?? "Selecciona un periodo para continuar";
  }, [periods, selectedPeriod]);
  const proposalPreviewFilterRef = useRef(proposalPreviewFilter);
  const proposalPreviewPageNumberRef = useRef(proposalPreviewPageNumber);
  const proposalPreviewRequestIdRef = useRef(0);
  const hasProposalPreviewRef = useRef(false);

  useEffect(() => {
    proposalPreviewFilterRef.current = proposalPreviewFilter;
  }, [proposalPreviewFilter]);

  useEffect(() => {
    proposalPreviewPageNumberRef.current = proposalPreviewPageNumber;
  }, [proposalPreviewPageNumber]);

  useEffect(() => {
    hasProposalPreviewRef.current = proposalPreviewPage !== null;
  }, [proposalPreviewPage]);

  const clearFeedback = useCallback(() => {
    setFeedback({ type: null, message: "" });
  }, []);

  useEffect(() => {
    if (!feedback.type) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      clearFeedback();
    }, FEEDBACK_TIMEOUT_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [clearFeedback, feedback.type, feedback.message]);

  const loadTicketHistory = useCallback(async (
    showErrorAsBanner = true,
    page = ticketHistoryPage
  ) => {
    const abortController = createAbortController();

    try {
      runIfMounted(() => {
        setIsLoadingHistory(true);
      });

      const params = new URLSearchParams({
        page: String(page),
        perPage: String(TICKET_HISTORY_PAGE_SIZE),
      });
      const response = await fetch(
        `/api/sunat/sire/ventas/tickets?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
          signal: abortController.signal,
        }
      );

      const payload = await parseJsonResponse<
        SireSalesTicketHistoryPage | { error?: string }
      >(response);

      if (!response.ok || !("tickets" in payload)) {
        throw new Error(
          "error" in payload && payload.error
            ? payload.error
            : "No pudimos cargar tu historial de solicitudes."
        );
      }

      runIfMounted(() => {
        setTicketHistory(payload.tickets);
        setTicketHistoryPage(payload.page);
        setTicketHistoryTotalCount(payload.totalCount);
        setTicketHistoryTotalPages(payload.totalPages);
        setTicketHistoryHasNextPage(payload.hasNextPage);
        setTicketHistoryHasPreviousPage(payload.hasPreviousPage);
      });
    } catch (error) {
      if (!isAbortControllerError(error) && showErrorAsBanner) {
        runIfMounted(() => {
          setFeedback({
            type: "error",
            message:
              error instanceof Error
                ? error.message
                : "No pudimos cargar tu historial de solicitudes.",
          });
        });
      }
    } finally {
      finalizeAbortController(abortController);
      runIfMounted(() => {
        setIsLoadingHistory(false);
      });
    }
  }, [
    createAbortController,
    finalizeAbortController,
    isAbortControllerError,
    runIfMounted,
    ticketHistoryPage,
  ]);

  const loadPeriods = useCallback(async () => {
    const abortController = createAbortController();

    try {
      runIfMounted(() => {
        setIsLoadingPeriods(true);
        clearFeedback();
      });

      const response = await fetch("/api/sunat/sire/ventas/periodos", {
        method: "GET",
        cache: "no-store",
        signal: abortController.signal,
      });

      const payload = await parseJsonResponse<
        { periods: SirePeriodYear[] } | { error?: string }
      >(response);

      if (!response.ok || !("periods" in payload)) {
        throw new Error(
          "error" in payload && payload.error
            ? payload.error
            : "No pudimos cargar los periodos de SUNAT."
        );
      }

      const nextPeriods = flattenPeriods(payload.periods);
      runIfMounted(() => {
        setPeriods(nextPeriods);
        setHasAttemptedInitialPeriodsLoad(true);

        if (nextPeriods.length > 0 && !getValues("periodo")) {
          setValue("periodo", nextPeriods[0].value, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
      });

      await loadTicketHistory(false, 1);

      runIfMounted(() => {
        setFeedback({
          type: nextPeriods.length > 0 ? "success" : "error",
          message:
            nextPeriods.length > 0
              ? "Listo. Ya cargamos los periodos disponibles."
              : "SUNAT respondio correctamente, pero no devolvio periodos disponibles para esta empresa.",
        });
      });
    } catch (error) {
      if (!isAbortControllerError(error)) {
        runIfMounted(() => {
          setHasAttemptedInitialPeriodsLoad(true);
          setFeedback({
            type: "error",
            message:
              error instanceof Error
                ? error.message
                : "No pudimos cargar los periodos de SUNAT.",
          });
        });
      }
    } finally {
      finalizeAbortController(abortController);
      runIfMounted(() => {
        setIsLoadingPeriods(false);
      });
    }
  }, [
    clearFeedback,
    createAbortController,
    finalizeAbortController,
    getValues,
    isAbortControllerError,
    loadTicketHistory,
    runIfMounted,
    setValue,
  ]);

  const requestProposal = handleSubmit(async (values) => {
    const abortController = createAbortController();

    try {
      runIfMounted(() => {
        setIsRequestingProposal(true);
        clearFeedback();
      });

      const response = await fetch("/api/sunat/sire/ventas/propuesta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          periodo: values.periodo,
          fileType: values.fileType,
        }),
        signal: abortController.signal,
      });

      const payload = await parseJsonResponse<
        { numTicket: string } | { error?: string }
      >(response);

      if (!response.ok || !("numTicket" in payload)) {
        throw new Error(
          "error" in payload && payload.error
            ? payload.error
            : "No pudimos enviar la solicitud a SUNAT."
        );
      }

      runIfMounted(() => {
        const normalizedTicket = payload.numTicket.trim();
        setTicketHistoryPage(1);
        setLatestTicket(normalizedTicket);
        setLatestTicketStatus(null);
        setProposalPreviewPage(null);
        setProposalPreviewFilter("");
        setProposalPreviewPageNumber(1);
        setValue("ticketNumber", normalizedTicket, {
          shouldDirty: true,
          shouldValidate: true,
        });
      });

      await loadTicketHistory(false, 1);

      runIfMounted(() => {
        setTicketHistoryPage(1);
        setFeedback({
          type: "success",
          message:
            "SUNAT recibio tu solicitud y te devolvio un numero de ticket.",
        });
      });
    } catch (error) {
      if (!isAbortControllerError(error)) {
        runIfMounted(() => {
          setFeedback({
            type: "error",
            message:
              error instanceof Error
                ? error.message
                : "No pudimos enviar la solicitud a SUNAT.",
          });
        });
      }
    } finally {
      finalizeAbortController(abortController);
      runIfMounted(() => {
        setIsRequestingProposal(false);
      });
    }
  });

  const loadProposalPreview = useCallback(
    async (
      periodoFromArgs?: string,
      ticketNumberFromArgs?: string,
      showSuccessMessage = true,
      pageFromArgs?: number,
      queryFromArgs?: string
    ) => {
      const requestId = proposalPreviewRequestIdRef.current + 1;
      proposalPreviewRequestIdRef.current = requestId;
      const abortController = createAbortController();

      try {
        runIfMounted(() => {
          setIsPreviewingFile(true);
          setIsFilteringPreview(Boolean(queryFromArgs !== undefined));
          clearFeedback();
        });

        const periodo = periodoFromArgs ?? getValues("periodo");
        const ticketNumber = (
          ticketNumberFromArgs ?? getValues("ticketNumber")
        )
          .trim()
          .replace(/\s+/g, "");
        const params = new URLSearchParams({
          periodo,
          numTicket: ticketNumber,
          page: String(pageFromArgs ?? proposalPreviewPageNumberRef.current),
          perPage: String(PROPOSAL_PREVIEW_PAGE_SIZE),
          query: queryFromArgs ?? proposalPreviewFilterRef.current,
        });

        const response = await fetch(
          `/api/sunat/sire/ventas/propuesta/vista?${params.toString()}`,
          {
            method: "GET",
            cache: "no-store",
            signal: abortController.signal,
          }
        );

        const payload = await parseJsonResponse<
          { previewPage: SireSalesProposalPreviewPage } | { error?: string }
        >(response);

        if (!response.ok || !("previewPage" in payload)) {
          throw new Error(
            "error" in payload && payload.error
              ? payload.error
              : "No pudimos abrir la propuesta de SUNAT."
          );
        }

        runIfMounted(() => {
          if (proposalPreviewRequestIdRef.current !== requestId) {
            return;
          }

          setProposalPreviewPage(payload.previewPage);
          setProposalPreviewPageNumber(payload.previewPage.page);
          if (queryFromArgs !== undefined) {
            setProposalPreviewFilter(queryFromArgs);
          }
          if (showSuccessMessage) {
            setFeedback({
              type: "success",
              message: "La propuesta ya esta lista para revisarla en pantalla.",
            });
          }
        });
      } catch (error) {
        if (!isAbortControllerError(error)) {
          runIfMounted(() => {
            if (proposalPreviewRequestIdRef.current !== requestId) {
              return;
            }

            setFeedback({
              type: "error",
              message:
                error instanceof Error
                  ? error.message
                  : "No pudimos abrir la propuesta de SUNAT.",
            });
          });
        }
      } finally {
      finalizeAbortController(abortController);
      runIfMounted(() => {
        if (proposalPreviewRequestIdRef.current !== requestId) {
          return;
        }

        setIsPreviewingFile(false);
        setIsFilteringPreview(false);
      });
      }
    },
    [
      clearFeedback,
      createAbortController,
      finalizeAbortController,
      getValues,
      isAbortControllerError,
      runIfMounted,
    ]
  );

  const checkTicket = useCallback(async () => {
    const abortController = createAbortController();
    const valid = await trigger(["periodo", "ticketNumber"]);
    if (!valid) {
      finalizeAbortController(abortController);
      return;
    }

    try {
      runIfMounted(() => {
        setIsCheckingTicket(true);
        clearFeedback();
      });

      const { periodo, ticketNumber } = getValues();
      const normalizedTicketNumber = ticketNumber.trim().replace(/\s+/g, "");
      const params = new URLSearchParams({
        periodo,
        numTicket: normalizedTicketNumber,
      });

      const response = await fetch(
        `/api/sunat/sire/ventas/ticket?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
          signal: abortController.signal,
        }
      );

      const payload = await parseJsonResponse<
        { items: SireSalesTicketStatusItem[] } | { error?: string }
      >(response);

      if (!response.ok || !("items" in payload)) {
        throw new Error(
          "error" in payload && payload.error
            ? payload.error
            : "No pudimos revisar el ticket en SUNAT."
        );
      }

      const nextStatus =
        payload.items.find((item) => item.numTicket === normalizedTicketNumber) ??
        payload.items[0] ??
        null;

      runIfMounted(() => {
        setLatestTicket(normalizedTicketNumber);
        setLatestTicketStatus(nextStatus);
        setValue("ticketNumber", normalizedTicketNumber, {
          shouldDirty: true,
          shouldValidate: true,
        });
      });

      if (
        nextStatus?.nomArchivoReporte &&
        nextStatus?.codTipoArchivoReporte
      ) {
        await loadProposalPreview(periodo, normalizedTicketNumber, false);
      }

      await loadTicketHistory(false, 1);

      runIfMounted(() => {
        setFeedback(buildTicketFeedback(nextStatus));
      });
    } catch (error) {
      if (!isAbortControllerError(error)) {
        runIfMounted(() => {
          setFeedback({
            type: "error",
            message:
              error instanceof Error
                ? error.message
                : "No pudimos revisar el ticket en SUNAT.",
          });
        });
      }
    } finally {
      finalizeAbortController(abortController);
      runIfMounted(() => {
        setIsCheckingTicket(false);
      });
    }
  }, [
    clearFeedback,
    createAbortController,
    finalizeAbortController,
    getValues,
    isAbortControllerError,
    loadProposalPreview,
    loadTicketHistory,
    runIfMounted,
    setValue,
    trigger,
  ]);

  const downloadFile = async () => {
    const abortController = createAbortController();
    const valid = await trigger(["periodo", "ticketNumber"]);
    if (!valid) {
      finalizeAbortController(abortController);
      return;
    }

    try {
      runIfMounted(() => {
        setIsDownloadingFile(true);
        clearFeedback();
      });

      const { periodo, ticketNumber } = getValues();
      const normalizedTicketNumber = ticketNumber.trim().replace(/\s+/g, "");
      const params = new URLSearchParams({
        periodo,
        numTicket: normalizedTicketNumber,
      });

      const response = await fetch(
        `/api/sunat/sire/ventas/archivo?${params.toString()}`,
        {
          method: "GET",
          signal: abortController.signal,
        }
      );

      if (!response.ok) {
        const payload = await parseJsonResponse<{ error?: string }>(response);
        throw new Error(
          payload.error ?? "No pudimos descargar el archivo de SUNAT."
        );
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const contentDisposition = response.headers.get("content-disposition");
      const fileNameMatch = contentDisposition?.match(/filename="?([^"]+)"?/i);
      const downloadName =
        fileNameMatch?.[1] ??
        `sire-ventas-${periodo}-${normalizedTicketNumber}.zip`;

      link.href = downloadUrl;
      link.download = downloadName;
      link.click();
      URL.revokeObjectURL(downloadUrl);

      runIfMounted(() => {
        setFeedback({
          type: "success",
          message: "Archivo descargado correctamente.",
        });
      });
    } catch (error) {
      if (!isAbortControllerError(error)) {
        runIfMounted(() => {
          setFeedback({
            type: "error",
            message:
              error instanceof Error
                ? error.message
                : "No pudimos descargar el archivo de SUNAT.",
          });
        });
      }
    } finally {
      finalizeAbortController(abortController);
      runIfMounted(() => {
        setIsDownloadingFile(false);
      });
    }
  };

  useEffect(() => {
    if (
      !isConfigured ||
      periods.length > 0 ||
      isLoadingPeriods ||
      hasAttemptedInitialPeriodsLoad
    ) {
      return;
    }

    const startInitialLoad = async () => {
      await loadPeriods();
    };

    void startInitialLoad();
  }, [
    hasAttemptedInitialPeriodsLoad,
    isConfigured,
    isLoadingPeriods,
    loadPeriods,
    periods.length,
  ]);

  useEffect(() => {
    if (!isConfigured) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void loadTicketHistory(false, ticketHistoryPage);
    }, TICKET_HISTORY_AUTO_REFRESH_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isConfigured, loadTicketHistory, ticketHistoryPage]);

  useEffect(() => {
    if (!isConfigured || !latestTicket) {
      return;
    }

    const activePeriod = getValues("periodo");
    const activeTicket = getValues("ticketNumber").trim().replace(/\s+/g, "");

    if (!activePeriod || !activeTicket) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void checkTicket();
    }, TICKET_HISTORY_AUTO_REFRESH_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [checkTicket, getValues, isConfigured, latestTicket]);

  useEffect(() => {
    if (!latestTicket || !hasProposalPreviewRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void loadProposalPreview(
        undefined,
        undefined,
        false,
        1,
        proposalPreviewFilter
      );
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    loadProposalPreview,
    latestTicket,
    proposalPreviewFilter,
  ]);

  if (!isConfigured) {
    return (
      <section className="rounded-[20px] border border-amber-200 bg-amber-50 px-5 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-amber-900">
              Antes de usar SIRE Ventas
            </h2>
            <p className="mt-2 text-sm leading-6 text-amber-800">
              Primero guarda tu RUC, tu usuario SOL, tu clave SOL y tus datos de
              acceso de SUNAT en configuracion.
            </p>
          </div>

          <Link
            href="/dashboard/configuracion"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-amber-900 px-4 text-sm font-semibold text-white transition hover:bg-amber-950"
          >
            Ir a configuracion
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[20px] border border-white/80 bg-white px-5 py-5 shadow-[0_24px_48px_-42px_rgba(15,23,42,0.28)]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            SUNAT | SIRE Ventas
          </div>
          <h2 className="mt-4 text-xl font-semibold text-slate-950">
            Propuesta de ventas en SUNAT
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Elige un periodo, solicita la propuesta, revisa el ticket y
            descarga el archivo cuando SUNAT lo deje listo.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadPeriods()}
          disabled={isLoadingPeriods}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoadingPeriods ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {isLoadingPeriods ? "Cargando..." : "Cargar periodos SUNAT"}
        </button>
      </div>

      {feedback.type ? (
        <div
          className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : feedback.type === "info"
                ? "border border-blue-200 bg-blue-50 text-blue-700"
              : "border border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <div className="mt-5 space-y-5">
        <SireSalesProposalForm
          errors={errors}
          isRequestingProposal={isRequestingProposal}
          isValid={isValid}
          onSubmit={requestProposal}
          periods={periods}
          register={register}
          selectedPeriodStatus={selectedPeriodStatus}
        />

        <SireSalesTicketActions
          canDownloadFile={canDownloadFile}
          canPreviewFile={canPreviewFile}
          errors={errors}
          isCheckingTicket={isCheckingTicket}
          isDownloadingFile={isDownloadingFile}
          isPreviewingFile={isPreviewingFile}
          latestTicket={latestTicket}
          latestTicketStatus={latestTicketStatus}
          onCheckTicket={() => void checkTicket()}
          onDownloadFile={() => void downloadFile()}
          onPreviewFile={() => void loadProposalPreview()}
          register={register}
        />

        <SireSalesProposalPreviewTable
          filterValue={proposalPreviewFilter}
          isFiltering={isFilteringPreview}
          isLoading={isPreviewingFile}
          onFilterChange={(value) => {
            setProposalPreviewFilter(value);
          }}
          onNextPage={() =>
            void loadProposalPreview(
              undefined,
              undefined,
              false,
              proposalPreviewPageNumber + 1
            )
          }
          onPreviousPage={() =>
            void loadProposalPreview(
              undefined,
              undefined,
              false,
              Math.max(1, proposalPreviewPageNumber - 1)
            )
          }
          previewPage={proposalPreviewPage}
        />

        <SireSalesTicketHistory
          currentPage={ticketHistoryPage}
          hasNextPage={ticketHistoryHasNextPage}
          hasPreviousPage={ticketHistoryHasPreviousPage}
          isLoadingHistory={isLoadingHistory}
          onDownloadTicket={(ticket) => {
            setValue("periodo", ticket.periodo, {
              shouldDirty: true,
              shouldValidate: true,
            });
            setValue("ticketNumber", ticket.ticketNumber, {
              shouldDirty: true,
              shouldValidate: true,
            });
            setLatestTicket(ticket.ticketNumber);
            void downloadFile();
          }}
          onNextPage={() => void loadTicketHistory(true, ticketHistoryPage + 1)}
          onPreviousPage={() =>
            void loadTicketHistory(true, Math.max(1, ticketHistoryPage - 1))
          }
          onRefreshHistory={() => void loadTicketHistory()}
          totalCount={ticketHistoryTotalCount}
          totalPages={ticketHistoryTotalPages}
          tickets={ticketHistory}
        />
      </div>
    </section>
  );
}
