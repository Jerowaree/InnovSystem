"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  Menu,
  Search,
  Truck,
  X,
} from "lucide-react";
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
  dateSelector: _dateSelector,
}: DashboardShellProps) {
  void _dateSelector;
  const pathname = usePathname();
  const [moduleSearchQuery, setModuleSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
        {isSidebarOpen ? (
          <button
            type="button"
            aria-label="Cerrar menú lateral"
            className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[1px] lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        ) : null}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[272px] max-w-[82vw] flex-col border-r border-slate-200/80 bg-white px-5 py-6 transition-transform duration-200 lg:fixed lg:w-[236px] lg:max-w-none ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
        >
          <div className="flex items-center justify-between lg:block">
            <Logo size="lg" />
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Cerrar menú lateral"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <DashboardNavigation searchQuery={moduleSearchQuery} />

          <div className="mt-auto space-y-4">
            <div className="overflow-hidden bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fbff_100%)] shadow-[0_20px_45px_-34px_rgba(37,99,235,0.35)]">
              <div className="h-1.5 w-full bg-[linear-gradient(90deg,_#2563EB_0%,_#60A5FA_100%)]" />
              <div className="px-4 py-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EAF2FF] text-[#2563EB] shadow-inner">
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

                <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/90 px-3 py-2">
                  <div>
                    <p className="text-[10px] font-medium text-slate-400 uppercase">
                      Estado
                    </p>
                    <p className="text-xs font-semibold text-slate-700">
                      Datos Sincronizados
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-x-hidden px-3 py-4 sm:px-5 sm:py-5 lg:ml-[236px] lg:px-6 lg:pt-28 lg:pb-5">
          <header className="sticky top-0 z-30 mb-4 w-full max-w-full overflow-x-clip border-b border-slate-200/80 bg-white/95 backdrop-blur lg:fixed lg:top-0 lg:left-[236px] lg:mb-0 lg:w-[calc(100vw-236px)] lg:max-w-[calc(100vw-236px)]">
            <div className="px-3 py-3 sm:px-5 lg:px-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-3 lg:flex-1">
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
                    onClick={() => setIsSidebarOpen(true)}
                    aria-label="Abrir menú lateral"
                  >
                    <Menu className="h-5 w-5" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[1.2rem] font-semibold tracking-[-0.03em] text-slate-950 sm:text-[1.35rem]">
                      {currentModule.title}
                    </p>
                    <p className="line-clamp-2 text-xs text-slate-500 sm:text-sm">
                      {currentModule.description}
                    </p>
                  </div>
                </div>

                <div className="flex w-full max-w-full min-w-0 flex-col gap-2 sm:gap-3 lg:w-auto lg:min-w-0 lg:flex-row lg:flex-nowrap lg:items-center">
                  <div className="relative w-full min-w-0 lg:w-[280px] lg:flex-none">
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
                      <div className="absolute top-[calc(100%+0.5rem)] right-0 left-0 z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_24px_48px_-32px_rgba(15,23,42,0.28)]">
                        {searchResults.length > 0 ? (
                          <div className="py-2">
                            {searchResults.map((item) => (
                              <Link
                                key={item.id}
                                href={item.href}
                                className="flex items-start gap-3 px-4 py-3 text-slate-700 transition hover:bg-[#F8FBFF] hover:text-[#2F6BFF]"
                                onClick={() => setModuleSearchQuery("")}
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

                  <div className="flex w-full max-w-full min-w-0 flex-col gap-2 lg:ml-auto lg:w-auto lg:flex-row lg:flex-nowrap lg:items-center">
                    <div className="grid w-full max-w-full min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2 lg:w-auto lg:max-w-none">
                      <button className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:text-slate-700">
                        <Bell className="h-4 w-4" />
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-[#FF4D6D]" />
                      </button>

                      <div className="flex w-full max-w-full min-w-0 items-center justify-between rounded-xl border border-slate-200 bg-white px-2 py-1.5 lg:min-w-[170px] lg:flex-none">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#34548C] text-xs font-semibold text-white">
                            {userInitials || "US"}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-[10px] font-semibold text-slate-900 sm:text-[11px]">
                              {displayName}
                            </p>
                            <p className="truncate text-[9px] text-slate-500 sm:text-[10px]">
                              Administrador
                            </p>
                          </div>
                        </div>
                        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                      </div>
                    </div>

                    <DashboardLogoutButton className="w-full max-w-full min-w-0 px-2 text-xs lg:w-auto lg:flex-none lg:px-3 lg:text-sm" />
                  </div>
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
