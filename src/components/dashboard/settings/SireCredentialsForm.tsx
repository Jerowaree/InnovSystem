"use client";

import { Loader2, Save } from "lucide-react";
import type { FormEventHandler } from "react";
import type { UseFormReturn } from "react-hook-form";
import { FieldError, PasswordField } from "./SettingsUi";
import type { SireConfigFormData, SireConfigSummary } from "@/types/sire";
import { inputClassName } from "./settingsUtils";

interface SireCredentialsFormProps {
  form: UseFormReturn<SireConfigFormData>;
  savedConfig: SireConfigSummary | null;
  showSolPassword: boolean;
  showClientSecret: boolean;
  isTesting: boolean;
  onToggleSolPassword: () => void;
  onToggleClientSecret: () => void;
  onRestore: () => void;
  onTestNow: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

export function SireCredentialsForm({
  form,
  savedConfig,
  showSolPassword,
  showClientSecret,
  isTesting,
  onToggleSolPassword,
  onToggleClientSecret,
  onRestore,
  onTestNow,
  onSubmit,
}: SireCredentialsFormProps) {
  const {
    register,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = form;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"
    >
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-950">
          Datos de tu cuenta SUNAT
        </h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Ingresa los datos que te entrega SUNAT para que tu sistema pueda
          conectarse sin repetir este paso cada vez.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="ruc"
            className="mb-2 inline-flex text-sm font-medium text-slate-700"
          >
            RUC
          </label>
          <input
            id="ruc"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="20123456789"
            {...register("ruc")}
            className={inputClassName(errors.ruc?.message)}
            aria-invalid={errors.ruc ? "true" : "false"}
          />
          <FieldError error={errors.ruc?.message} />
        </div>

        <div>
          <label
            htmlFor="solUser"
            className="mb-2 inline-flex text-sm font-medium text-slate-700"
          >
            Usuario SOL
          </label>
          <input
            id="solUser"
            type="text"
            autoComplete="off"
            placeholder="Tu usuario SOL"
            {...register("solUser")}
            className={inputClassName(errors.solUser?.message)}
            aria-invalid={errors.solUser ? "true" : "false"}
          />
          <FieldError error={errors.solUser?.message} />
        </div>

        <PasswordField
          id="solPassword"
          label="Clave SOL"
          placeholder={
            savedConfig?.hasSolPassword
              ? "Deja en blanco para conservar la clave actual"
              : "Escribe tu clave SOL"
          }
          helper={
            savedConfig?.hasSolPassword
              ? "Tu clave ya quedó guardada de forma segura."
              : undefined
          }
          visible={showSolPassword}
          onToggleVisibility={onToggleSolPassword}
          register={register}
          error={errors.solPassword?.message}
        />

        <div>
          <label
            htmlFor="clientId"
            className="mb-2 inline-flex text-sm font-medium text-slate-700"
          >
            Client ID
          </label>
          <input
            id="clientId"
            type="text"
            autoComplete="off"
            placeholder="Código entregado por SUNAT"
            {...register("clientId")}
            className={inputClassName(errors.clientId?.message)}
            aria-invalid={errors.clientId ? "true" : "false"}
          />
          <FieldError error={errors.clientId?.message} />
        </div>

        <PasswordField
          id="clientSecret"
          label="Client Secret"
          placeholder={
            savedConfig?.hasClientSecret
              ? "Deja en blanco para conservar el secreto actual"
              : "Escribe el client secret"
          }
          helper={
            savedConfig?.hasClientSecret
              ? "Tu secret ya quedó guardado de forma segura."
              : undefined
          }
          visible={showClientSecret}
          onToggleVisibility={onToggleClientSecret}
          register={register}
          error={errors.clientSecret?.message}
        />

        <input type="hidden" {...register("securityBaseUrl")} />
        <input type="hidden" {...register("apiBaseUrl")} />
        <FieldError error={errors.securityBaseUrl?.message} />
        <FieldError error={errors.apiBaseUrl?.message} />
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onRestore}
          className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Restaurar
        </button>
        <button
          type="button"
          onClick={onTestNow}
          disabled={isSubmitting || isTesting || !isValid}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isTesting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : null}
          {isTesting ? "Probando..." : "Probar datos ahora"}
        </button>
        <button
          type="submit"
          disabled={
            isSubmitting || (!isDirty && Boolean(savedConfig)) || !isValid
          }
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSubmitting ? "Guardando..." : "Guardar datos"}
        </button>
      </div>
    </form>
  );
}
