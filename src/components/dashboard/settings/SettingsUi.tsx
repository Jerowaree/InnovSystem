"use client";

import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { inputClassName } from "@/components/dashboard/settings/settingsUtils";
import type {
  BookCardProps,
  InputProps,
  PasswordFieldProps,
} from "@/components/dashboard/settings/settingsTypes";

export function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
        ok
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      {ok ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : (
        <AlertCircle className="h-3.5 w-3.5" />
      )}
      {label}
    </span>
  );
}

export function FieldError({ error }: InputProps) {
  if (!error) {
    return null;
  }

  return <p className="mt-2 text-xs text-rose-600">{error}</p>;
}

export function PasswordField({
  id,
  label,
  placeholder,
  helper,
  visible,
  onToggleVisibility,
  register,
  error,
}: PasswordFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 inline-flex text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete="off"
          {...register(id)}
          className={`${inputClassName(error)} pr-11`}
          aria-invalid={error ? "true" : "false"}
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          className="absolute top-1/2 right-3 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label={visible ? `Ocultar ${label}` : `Mostrar ${label}`}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      {helper ? <p className="mt-2 text-xs text-slate-500">{helper}</p> : null}
      <FieldError error={error} />
    </div>
  );
}

export function BookCard({
  title,
  code,
  ok,
  years,
  periods,
  message,
  accessState,
}: BookCardProps) {
  const statusLabel = ok
    ? "Disponible"
    : accessState === "unauthorized"
      ? "No habilitado"
      : "Pendiente";

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
          <p className="mt-1 text-xs text-slate-500">Codigo de libro {code}</p>
        </div>
        <StatusPill ok={ok} label={statusLabel} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white p-3">
          <p className="text-xs text-slate-500">Ejercicios</p>
          <p className="mt-1 text-lg font-semibold text-slate-950">{years}</p>
        </div>
        <div className="rounded-xl bg-white p-3">
          <p className="text-xs text-slate-500">Periodos</p>
          <p className="mt-1 text-lg font-semibold text-slate-950">
            {periods}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">{message}</p>
    </div>
  );
}
