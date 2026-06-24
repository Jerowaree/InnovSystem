"use client";

import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { SireConnectionPanel } from "@/components/dashboard/settings/SireConnectionPanel";
import { SettingsSidebar } from "@/components/dashboard/settings/SettingsSidebar";
import { SireCredentialsForm } from "@/components/dashboard/settings/SireCredentialsForm";
import type { SettingsWorkspaceProps } from "@/components/dashboard/settings/settingsTypes";
import { formatDate } from "@/components/dashboard/settings/settingsUtils";
import { useSireSettingsForm } from "@/components/dashboard/settings/useSireSettingsForm";
import { applyDashboardMockData } from "@/features/dashboard/lib/dashboardMockData";
import {
  buildDashboardPeriods,
  filterMovementsByPeriod,
  filterReportsByPeriod,
} from "@/features/dashboard/lib/dashboardPeriods";
import { buildDashboardViewModel } from "@/features/dashboard/lib/dashboardViewModel";
import { useMemo } from "react";

export default function SettingsWorkspace({
  data,
  initialSireConfig,
}: SettingsWorkspaceProps) {
  const previewData = useMemo(() => applyDashboardMockData(data), [data]);
  const periods = useMemo(
    () => buildDashboardPeriods(previewData.movements),
    [previewData.movements]
  );
  const selectedPeriod = periods[Math.max(0, periods.length - 1)];
  const filteredMovements = filterMovementsByPeriod(
    previewData.movements,
    selectedPeriod
  );
  const filteredReports = filterReportsByPeriod(
    previewData.reports,
    selectedPeriod
  );
  const viewModel = buildDashboardViewModel({
    company: previewData.company,
    profile: previewData.profile,
    movements: filteredMovements,
    reports: filteredReports,
  });

  viewModel.dateRangeLabel = selectedPeriod.label;

  const sireForm = useSireSettingsForm(data.company.ruc, initialSireConfig);
  const {
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
  } = sireForm;

  return (
    <DashboardShell
      viewModel={viewModel}
      dateSelector={{
        label: selectedPeriod.label,
        canGoBackward: false,
        canGoForward: false,
      }}
    >
      <div className="space-y-5">
        <section className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white shadow-[0_24px_48px_-38px_rgba(15,23,42,0.24)]">
          <div className="flex flex-col gap-4 px-6 py-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Conexión SUNAT para tu empresa
              </div>
              <h2 className="mt-4 text-[1.65rem] font-semibold tracking-[-0.03em] text-slate-950">
                Configura tu acceso a SUNAT
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Guarda aquí tu usuario SOL, tu clave SOL y las credenciales que
                te entrega SUNAT para que el sistema pueda conectarse por ti.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <Image
                src="/sunatlogo1.png"
                alt="SUNAT"
                width={116}
                height={36}
                className="h-auto w-auto object-contain"
                priority
              />
              <p className="mt-3 text-xs text-slate-500">
                <span suppressHydrationWarning>
                  Última actualización: {formatDate(savedConfig?.updatedAt ?? null)}
                </span>
              </p>
              <div className="mt-3 space-y-1 text-xs text-slate-600">
                <p>
                  <span className="font-medium text-slate-900">RUC:</span>{" "}
                  {savedConfig?.ruc ?? data.company.ruc}
                </p>
                <p>
                  <span className="font-medium text-slate-900">
                    Usuario SOL:
                  </span>{" "}
                  {savedConfig?.solUser ?? "Aún no registrado"}
                </p>
                <p>
                  <span className="font-medium text-slate-900">
                    Estado de claves:
                  </span>{" "}
                  {savedConfig?.hasSolPassword || savedConfig?.hasClientSecret
                    ? "Guardadas de forma segura"
                    : "Pendiente"}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200/80 px-6 py-6">
            {serverError ? (
              <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {serverError}
              </div>
            ) : null}

            {successMessage ? (
              <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successMessage}
              </div>
            ) : null}

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
              <div className="space-y-5">
                <SireCredentialsForm
                  form={form}
                  savedConfig={savedConfig}
                  showSolPassword={showSolPassword}
                  showClientSecret={showClientSecret}
                  isTesting={isTesting}
                  onToggleSolPassword={() =>
                    setShowSolPassword((current) => !current)
                  }
                  onToggleClientSecret={() =>
                    setShowClientSecret((current) => !current)
                  }
                  onRestore={restoreForm}
                  onTestNow={() => void testConnection()}
                  onSubmit={saveConfig}
                />

                <SireConnectionPanel
                  status={status}
                  savedConfig={savedConfig}
                  isTesting={isTesting}
                  isSubmitting={form.formState.isSubmitting}
                  onTest={() => void testConnection()}
                />
              </div>

              <SettingsSidebar savedConfig={savedConfig} />
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
