"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Check,
  CircleHelp,
  Eye,
  EyeOff,
  Globe,
  Link2,
  ShieldCheck,
} from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { applyDashboardMockData } from "@/features/dashboard/lib/dashboardMockData";
import {
  buildDashboardPeriods,
  filterMovementsByPeriod,
  filterReportsByPeriod,
} from "@/features/dashboard/lib/dashboardPeriods";
import { buildDashboardViewModel } from "@/features/dashboard/lib/dashboardViewModel";
import type { DashboardData } from "@/services/dashboardServiceServer";

interface SettingsWorkspaceProps {
  data: DashboardData;
}

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggleVisibility: () => void;
  placeholder: string;
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  visible,
  onToggleVisibility,
  placeholder,
}: PasswordFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-slate-700"
      >
        {label}
        <CircleHelp className="h-3.5 w-3.5 text-slate-400" />
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 pr-11 text-sm text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-[#2F6BFF] focus:ring-4 focus:ring-[#2F6BFF]/10"
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
    </div>
  );
}

export default function SettingsWorkspace({ data }: SettingsWorkspaceProps) {
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

  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [solUser, setSolUser] = useState("");
  const [solPassword, setSolPassword] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [showSolPassword, setShowSolPassword] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");
  const [connectionState, setConnectionState] = useState<
    "idle" | "testing" | "success"
  >("success");

  const resetFeedback = () => {
    setSaveState("idle");
    if (connectionState !== "testing") {
      setConnectionState("idle");
    }
  };

  const handleSave = () => {
    setSaveState("saved");
  };

  const handleTestConnection = () => {
    setConnectionState("testing");

    window.setTimeout(() => {
      setConnectionState("success");
    }, 900);
  };

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
          <div className="flex flex-col gap-5 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-[1.65rem] font-semibold tracking-[-0.03em] text-slate-950">
                Credenciales SUNAT
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Configura las credenciales de API para conectarte con los
                servicios de SUNAT y consultar información de comprobantes, RUC
                y más.
              </p>
            </div>

            <div className="flex items-center rounded-2xl bg-white px-4 py-3">
              <Image
                src="/sunatlogo1.png"
                alt="SUNAT"
                width={112}
                height={36}
                className="h-auto w-auto object-contain"
                priority
              />
            </div>
          </div>

          <div className="border-t border-slate-200/80 px-6 py-6">
            <div className="space-y-6">
              <section>
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-slate-950">
                    Datos de conexión
                  </h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="client-id"
                      className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-slate-700"
                    >
                      Cliente ID
                      <CircleHelp className="h-3.5 w-3.5 text-slate-400" />
                    </label>
                    <input
                      id="client-id"
                      type="text"
                      value={clientId}
                      onChange={(event) => {
                        setClientId(event.target.value);
                        resetFeedback();
                      }}
                      placeholder="Ingresa tu cliente ID"
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-[#2F6BFF] focus:ring-4 focus:ring-[#2F6BFF]/10"
                    />
                  </div>

                  <PasswordField
                    id="client-secret"
                    label="Cliente Secret"
                    value={clientSecret}
                    onChange={(value) => {
                      setClientSecret(value);
                      resetFeedback();
                    }}
                    visible={showClientSecret}
                    onToggleVisibility={() =>
                      setShowClientSecret((current) => !current)
                    }
                    placeholder="Ingresa tu client secret"
                  />

                  <div>
                    <label
                      htmlFor="sol-user"
                      className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-slate-700"
                    >
                      Usuario SOL
                      <CircleHelp className="h-3.5 w-3.5 text-slate-400" />
                    </label>
                    <input
                      id="sol-user"
                      type="text"
                      value={solUser}
                      onChange={(event) => {
                        setSolUser(event.target.value);
                        resetFeedback();
                      }}
                      placeholder="Ingresa tu usuario SOL"
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-[#2F6BFF] focus:ring-4 focus:ring-[#2F6BFF]/10"
                    />
                  </div>

                  <PasswordField
                    id="sol-password"
                    label="Contraseña SOL"
                    value={solPassword}
                    onChange={(value) => {
                      setSolPassword(value);
                      resetFeedback();
                    }}
                    visible={showSolPassword}
                    onToggleVisibility={() =>
                      setShowSolPassword((current) => !current)
                    }
                    placeholder="Ingresa tu contraseña SOL"
                  />

                  <div className="md:col-span-2">
                    <label
                      htmlFor="api-url"
                      className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-slate-700"
                    >
                      URL de API SUNAT
                      <CircleHelp className="h-3.5 w-3.5 text-slate-400" />
                    </label>
                    <input
                      id="api-url"
                      type="text"
                      value={apiUrl}
                      onChange={(event) => {
                        setApiUrl(event.target.value);
                        resetFeedback();
                      }}
                      placeholder="https://api-seguridad.sunat.gob.pe/v1/contribuyente"
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 transition outline-none focus:border-[#2F6BFF] focus:ring-4 focus:ring-[#2F6BFF]/10"
                    />
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-[#D9E7FF] bg-[#F5F9FF] px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#2F6BFF]">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-slate-700">
                        Asegúrate de tener habilitado tu usuario SOL para
                        consumo de API y de contar con los permisos necesarios.
                      </p>
                      <Link
                        href="#"
                        className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#2F6BFF] transition hover:text-[#2558D9]"
                      >
                        Ver documentación de SUNAT
                        <Link2 className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </section>

              <section className="border-t border-slate-200/80 pt-6">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
                  <div>
                    <h3 className="text-base font-semibold text-slate-950">
                      Probar conexión
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">
                      Verifica que las credenciales ingresadas sean correctas.
                    </p>
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Globe className="h-4 w-4" />
                      {connectionState === "testing"
                        ? "Probando..."
                        : "Probar conexión"}
                    </button>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EAF7EF] text-[#16A34A]">
                        <Check className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {connectionState === "testing"
                            ? "Validando conexión"
                            : "Última prueba exitosa"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {connectionState === "testing"
                            ? "Estamos comprobando el acceso al servicio."
                            : "07/05/2024 · 10:24 a. m."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200/80 bg-slate-50/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setClientId("");
                setClientSecret("");
                setSolUser("");
                setSolPassword("");
                setApiUrl("");
                setSaveState("idle");
                setConnectionState("idle");
              }}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[#2F6BFF] px-5 text-sm font-semibold text-white transition hover:bg-[#2558D9]"
            >
              Guardar cambios
            </button>
          </div>
        </section>

        {saveState === "saved" ? (
          <div className="rounded-2xl border border-[#D8F0DF] bg-[#F3FBF6] px-4 py-3 text-sm font-medium text-[#15803D]">
            Los cambios quedaron listos en esta sesión. Cuando conectemos el
            backend, podremos persistirlos de forma segura.
          </div>
        ) : null}
      </div>
    </DashboardShell>
  );
}
