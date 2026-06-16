"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Building2, ChevronDown, Search, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import Logo from "@/components/Logo";
import DashboardLogoutButton from "@/components/dashboard/DashboardLogoutButton";
import DashboardNavigation, {
  dashboardNavigationItems,
} from "@/components/dashboard/DashboardNavigation";
import type { DashboardViewModel } from "@/features/dashboard/lib/dashboardViewModel";

interface DashboardShellProps {
  children: React.ReactNode;
  viewModel: DashboardViewModel;
  dateSelector?: {
    label: string;
    canGoBackward: boolean;
    canGoForward: boolean;
    onPrevious?: () => void;
    onNext?: () => void;
  };
}

export default function DashboardShell({
  children,
  viewModel,
  dateSelector,
}: DashboardShellProps) {
  void dateSelector;
  const pathname = usePathname();
  const [moduleSearchQuery, setModuleSearchQuery] = useState("");
  const normalizedQuery = moduleSearchQuery.trim().toLowerCase();
  const userNameParts = viewModel.profile.full_name
    .split(" ")
    .map((value) => value.trim())
    .filter(Boolean);
  const displayName =
    userNameParts.slice(0, 2).join(" ") || viewModel.profile.full_name;
  const userInitials = userNameParts
    .slice(0, 2)
    .map((value) => value[0]?.toUpperCase() ?? "")
    .join("");

  const currentModule = useMemo(() => {
    if (pathname === "/dashboard/reportes") {
      return {
        title: "Reportes",
        description: "Genera y descarga reportes financieros en formato Excel.",
      };
    }

    if (pathname === "/dashboard/configuracion") {
      return {
        title: "Configuración",
        description: "Gestiona credenciales, conexión SUNAT y preferencias.",
      };
    }

    return {
      title: "Dashboard",
      description:
        "Visualiza indicadores, movimientos y reportes de tu empresa.",
    };
  }, [pathname]);

  const searchResults = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return dashboardNavigationItems.filter((item) =>
      item.label.toLowerCase().includes(normalizedQuery)
    );
  }, [normalizedQuery]);

  return (
    <div className="min-h-screen bg-[#FBFCFF] text-slate-950">
      <div className="flex min-h-screen w-full">
        <aside className="hidden h-screen w-[236px] shrink-0 border-r border-slate-200/80 bg-white px-5 py-6 lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:flex-col">
          <div className="flex items-center">
            <Logo size="lg" />
          </div>

          <DashboardNavigation searchQuery={moduleSearchQuery} />

          <div className="mt-auto space-y-4">
            <div className="rounded-[14px] border border-slate-200 bg-slate-50/70 px-4 py-4 shadow-[0_18px_36px_-34px_rgba(15,23,42,0.35)]">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-200/70 text-slate-700">
                  <Truck className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-5 font-semibold break-words text-slate-950">
                    {viewModel.company.business_name}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    RUC: {viewModel.company.ruc}
                  </p>
                </div>
              </div>

              <button className="mt-3 inline-flex w-auto items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700">
                Ver SUNAT
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-3 pt-28 pb-3 sm:px-5 sm:pt-28 lg:ml-[236px] lg:px-6 lg:pt-28 lg:pb-5">
          <header className="fixed top-0 right-0 left-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur lg:left-[236px]">
            <div className="flex px-3 py-3 sm:px-5 lg:px-6">
              <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0 xl:flex-1">
                  <p className="truncate text-[1.35rem] font-semibold tracking-[-0.03em] text-slate-950">
                    {currentModule.title}
                  </p>
                  <p className="truncate text-xs text-slate-500 sm:text-sm">
                    {currentModule.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 xl:flex-nowrap">
                  <div className="relative min-w-0 xl:w-[280px]">
                    <label className="relative block">
                      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="search"
                        value={moduleSearchQuery}
                        onChange={(event) =>
                          setModuleSearchQuery(event.target.value)
                        }
                        placeholder="Buscar"
                        className="h-10 w-full rounded-xl border border-[#BFD4FF] bg-[#FCFDFE] pr-4 pl-10 text-sm text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-[#2F6BFF] focus:bg-white focus:ring-4 focus:ring-[#2F6BFF]/10"
                      />
                    </label>

                    {normalizedQuery ? (
                      <div className="absolute top-[calc(100%+0.5rem)] right-0 left-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_24px_48px_-32px_rgba(15,23,42,0.28)]">
                        {searchResults.length > 0 ? (
                          <div className="py-2">
                            {searchResults.map((item) => (
                              <Link
                                key={item.id}
                                href={item.href}
                                className="flex items-start gap-3 px-4 py-3 text-slate-700 transition hover:bg-[#F8FBFF] hover:text-[#2F6BFF]"
                              >
                                <item.icon className="mt-0.5 h-4 w-4 shrink-0" />
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium">
                                    {item.label}
                                  </p>
                                  <p className="truncate text-xs text-slate-500">
                                    {item.description}
                                  </p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 px-4 py-3 text-sm text-slate-500">
                            <Search className="h-4 w-4 text-slate-300" />
                            <span>No encontramos módulos con ese nombre.</span>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>

                  <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-700">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-[#FF4D6D]" />
                  </button>

                  <div className="hidden min-w-[185px] items-center justify-between bg-white px-2 py-1.5 md:flex">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF4FF] text-[#2F6BFF]">
                        <Building2 className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium text-slate-500">
                          Empresa actual
                        </p>
                        <p className="truncate text-[11px] font-semibold text-slate-900">
                          {viewModel.company.business_name}
                        </p>
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>

                  <div className="flex min-w-[155px] items-center justify-between bg-white px-2 py-1.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#34548C] text-xs font-semibold text-white">
                        {userInitials || "US"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-semibold text-slate-900">
                          {displayName}
                        </p>
                        <p className="truncate text-[10px] text-slate-500">
                          Administrador
                        </p>
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </div>

                  <DashboardLogoutButton />
                </div>
              </div>
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}
