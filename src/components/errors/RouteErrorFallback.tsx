"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, Home, LayoutDashboard, RefreshCw } from "lucide-react";
import { useEffect } from "react";

interface RouteErrorFallbackProps {
  error: Error & { digest?: string };
  reset: () => void;
  title: string;
  description: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  primaryHref: string;
  secondaryHref: string;
  contextLabel: string;
}

export function RouteErrorFallback({
  error,
  reset,
  title,
  description,
  primaryActionLabel,
  secondaryActionLabel,
  primaryHref,
  secondaryHref,
  contextLabel,
}: RouteErrorFallbackProps) {
  useEffect(() => {
    console.error(`[${contextLabel}]`, error);
  }, [contextLabel, error]);

  const errorCode = error.digest ?? "sin-codigo";
  const primaryIcon =
    primaryHref === "/dashboard" ? (
      <LayoutDashboard className="h-4 w-4" />
    ) : (
      <Home className="h-4 w-4" />
    );

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.12),_transparent_42%),linear-gradient(180deg,_#f8fbff_0%,_#fcfdff_48%,_#f3f7fd_100%)] px-4 py-10">
      <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,_rgba(255,255,255,0.88)_0%,_rgba(255,255,255,0)_100%)]" />

      <div className="relative w-full max-w-3xl overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 shadow-[0_32px_90px_-52px_rgba(15,23,42,0.35)] backdrop-blur">
        <div className="h-1.5 w-full bg-[linear-gradient(90deg,_#2563EB_0%,_#60A5FA_55%,_#BFDBFE_100%)]" />

        <div className="grid gap-8 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(260px,0.75fr)] lg:items-start">
          <div className="space-y-6">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
                Continuidad del servicio
              </p>
              <h1 className="max-w-xl text-3xl leading-tight font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                {title}
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                {description}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
              >
                <RefreshCw className="h-4 w-4" />
                Intentar nuevamente
              </button>
              <Link
                href={primaryHref}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                {primaryIcon}
                {primaryActionLabel}
              </Link>
              <Link
                href={secondaryHref}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-transparent px-5 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
              >
                <ArrowLeft className="h-4 w-4" />
                {secondaryActionLabel}
              </Link>
            </div>
          </div>

          <aside className="rounded-[24px] border border-slate-200 bg-slate-50/90 p-5">
            <p className="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">
              Que puedes hacer ahora
            </p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <p>
                Si estabas cargando datos, espera unos segundos y vuelve a
                intentarlo. A veces el problema se resuelve solo al recargar.
              </p>
              <p>
                Si el error se repite, usa una ruta segura para volver al flujo
                principal sin perder tiempo.
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                Codigo de referencia
              </p>
              <p className="mt-1 break-all font-mono text-xs text-slate-700">
                {errorCode}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
