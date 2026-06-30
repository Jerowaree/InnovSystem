"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useAsyncGuards } from "@/hooks/useAsyncGuards";
import { createSireConfigSchema } from "@/schemas/sireSchemas";
import type {
  SireConfigFormData,
  SireConfigSummary,
  SireStatusResponse,
} from "@/types/sire";
import { emptyStatus, getDefaultValues } from "./settingsUtils";

const FEEDBACK_TIMEOUT_MS = 5_000;

export function useSireSettingsForm(
  companyRuc: string,
  initialSireConfig: SireConfigSummary | null
) {
  const [savedConfig, setSavedConfig] = useState<SireConfigSummary | null>(
    initialSireConfig
  );
  const [status, setStatus] = useState<SireStatusResponse>(emptyStatus);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [showSolPassword, setShowSolPassword] = useState(false);
  const [showClientSecret, setShowClientSecret] = useState(false);
  const {
    createAbortController,
    finalizeAbortController,
    isAbortControllerError,
    runIfMounted,
  } = useAsyncGuards();

  const schema = useMemo(
    () =>
      createSireConfigSchema({
        hasStoredSolPassword: Boolean(savedConfig?.hasSolPassword),
        hasStoredClientSecret: Boolean(savedConfig?.hasClientSecret),
      }),
    [savedConfig?.hasClientSecret, savedConfig?.hasSolPassword]
  );

  const form = useForm<SireConfigFormData>({
    resolver: yupResolver(schema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: getDefaultValues(companyRuc, savedConfig),
  });

  const clearMessages = () => {
    setServerError(null);
    setSuccessMessage(null);
  };

  useEffect(() => {
    if (!serverError && !successMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      clearMessages();
    }, FEEDBACK_TIMEOUT_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [serverError, successMessage]);

  const restoreForm = () => {
    form.reset(getDefaultValues(companyRuc, savedConfig));
    clearMessages();
  };

  const saveConfig = form.handleSubmit(async (values) => {
    const abortController = createAbortController();

    try {
      runIfMounted(clearMessages);

      const response = await fetch("/api/sunat/sire/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
        signal: abortController.signal,
      });

      const payload = (await response.json()) as
        | { config: SireConfigSummary }
        | { error?: string };

      if (!response.ok || !("config" in payload)) {
        throw new Error(
          "error" in payload && payload.error
            ? payload.error
            : "No se pudo guardar la configuracion."
        );
      }

      runIfMounted(() => {
        setSavedConfig(payload.config);
        setSuccessMessage(
          "Listo. Tu RUC, tu usuario SOL y tus claves quedaron guardados de forma segura."
        );
        form.reset(getDefaultValues(companyRuc, payload.config));
      });
    } catch (error) {
      if (!isAbortControllerError(error)) {
        runIfMounted(() => {
          setServerError(
            error instanceof Error
              ? error.message
              : "No se pudo guardar la configuracion."
          );
        });
      }
    } finally {
      finalizeAbortController(abortController);
    }
  });

  const testConnection = async () => {
    const abortController = createAbortController();

    try {
      runIfMounted(clearMessages);

      const valid = await form.trigger();
      if (!valid) {
        return;
      }

      runIfMounted(() => {
        setIsTesting(true);
      });

      const response = await fetch("/api/sunat/sire/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form.getValues()),
        signal: abortController.signal,
      });

      const payload = (await response.json()) as
        | SireStatusResponse
        | { error?: string };

      if (!response.ok || !("configured" in payload)) {
        throw new Error(
          "error" in payload && payload.error
            ? payload.error
            : "No se pudo probar la conexion."
        );
      }

      if (process.env.NODE_ENV !== "production") {
        console.info("[SIRE TEST RESULT]", {
          tokenOk: payload.diagnostics?.tokenOk ?? false,
          rvieOk: payload.diagnostics?.moduleAccess.rvie ?? false,
          rceOk: payload.diagnostics?.moduleAccess.rce ?? false,
          authMessage: payload.auth.message,
          rvieMessage: payload.books.rvie.message,
          rceMessage: payload.books.rce.message,
        });
      }

      const hasSireModuleAccess =
        payload.diagnostics?.moduleAccess.rvie === true ||
        payload.diagnostics?.moduleAccess.rce === true;

      runIfMounted(() => {
        setStatus(payload);
        setSavedConfig((current) =>
          current
            ? {
                ...current,
                lastTestedAt: payload.checkedAt,
                lastTestStatus:
                  payload.auth.ok && hasSireModuleAccess ? "success" : "error",
                lastTestMessage: payload.auth.message,
              }
            : current
        );
        setSuccessMessage(
          payload.auth.ok
            ? hasSireModuleAccess
              ? "Listo. Pudimos entrar a SUNAT y tu empresa ya tiene acceso a SIRE."
              : "Tus datos fueron aceptados. Solo falta que SUNAT habilite SIRE para tu empresa."
            : null
        );
      });
    } catch (error) {
      if (!isAbortControllerError(error)) {
        runIfMounted(() => {
          setServerError(
            error instanceof Error
              ? error.message
              : "No se pudo probar la conexion."
          );
        });
      }
    } finally {
      finalizeAbortController(abortController);
      runIfMounted(() => {
        setIsTesting(false);
      });
    }
  };

  return {
    form,
    savedConfig,
    status,
    serverError,
    successMessage,
    isTesting,
    showSolPassword,
    showClientSecret,
    setShowSolPassword,
    setShowClientSecret,
    restoreForm,
    saveConfig,
    testConnection,
  };
}
