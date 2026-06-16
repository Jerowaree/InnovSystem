"use client";

import {
  Building2,
  FileText,
  LayoutGrid,
  Receipt,
  SearchCheck,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const dashboardNavigationItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Resumen de indicadores y actividad reciente.",
    icon: LayoutGrid,
    href: "/dashboard",
  },
  {
    id: "movimientos",
    label: "Movimientos",
    description: "Consulta ingresos, compras y egresos registrados.",
    icon: Receipt,
    href: "/dashboard",
  },
  {
    id: "reportes",
    label: "Reportes",
    description: "Genera y descarga reportes financieros.",
    icon: FileText,
    href: "/dashboard/reportes",
  },
  {
    id: "sunat",
    label: "SUNAT",
    description: "Revisa información oficial y estado tributario.",
    icon: SearchCheck,
    href: "/dashboard",
  },
  {
    id: "empresas",
    label: "Empresas",
    description: "Administra la información principal de la empresa.",
    icon: Building2,
    href: "/dashboard",
  },
  {
    id: "configuracion",
    label: "Configuración",
    description: "Configura credenciales, SUNAT y preferencias.",
    icon: Settings,
    href: "/dashboard/configuracion",
  },
];

interface DashboardNavigationProps {
  searchQuery?: string;
}

export default function DashboardNavigation({
  searchQuery = "",
}: DashboardNavigationProps) {
  const pathname = usePathname();
  void searchQuery;

  return (
    <nav className="mt-8 space-y-1.5">
      {dashboardNavigationItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.id}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg bg-white px-4 py-3 text-sm font-medium transition ${
              isActive ? "text-slate-900" : "text-slate-700"
            } hover:bg-[#EEF4FF] hover:text-[#2F6BFF]`}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
