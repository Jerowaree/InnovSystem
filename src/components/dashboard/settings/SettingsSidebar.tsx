"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { SireConfigSummary } from "@/types/sire";

interface SettingsSidebarProps {
  savedConfig: SireConfigSummary | null;
}

export function SettingsSidebar({ savedConfig }: SettingsSidebarProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-base font-semibold text-slate-950">
          Cómo sacar tus datos en SUNAT
        </h3>
        <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
          <li>1. Entra a SUNAT Operaciones en Línea con tu RUC y tu clave SOL.</li>
          <li>2. Busca la opción de credenciales API y registra tu aplicación.</li>
          <li>3. Activa el servicio MIGE RCE y RVIE - SIRE.</li>
          <li>4. Guarda tu Client ID, tu Client Secret, tu usuario SOL y tu clave SOL.</li>
          <li>5. Luego vuelve aquí, guarda los datos y revisa que todo esté listo.</li>
        </ol>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-base font-semibold text-slate-950">
          Tu información queda protegida
        </h3>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Tus claves no se vuelven a mostrar en pantalla. Si ya las guardaste
          una vez, puedes dejar esos campos vacíos cuando solo quieras cambiar
          el resto de la información.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {savedConfig?.hasSolPassword ? (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              Clave SOL protegida
            </span>
          ) : null}
          {savedConfig?.hasClientSecret ? (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              Client secret protegido
            </span>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-[#D9E7FF] bg-[#F5F9FF] p-5">
        <h3 className="text-base font-semibold text-slate-950">
          Ayuda oficial
        </h3>
        <div className="mt-4 space-y-3 text-sm">
          <Link
            href="https://cpe.sunat.gob.pe/node/158"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
          >
            Formas de acceso al SIRE
            <ExternalLink className="h-4 w-4" />
          </Link>
          <Link
            href="https://cpe.sunat.gob.pe/sites/default/files/inline-files/Manual%20de%20servicios%20Web%20Api%20-%20SIRE_Ventas%20v29.pdf"
            target="_blank"
            rel="noreferrer"
            className="block font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
          >
            Manual API SIRE Ventas
          </Link>
          <Link
            href="https://cpe.sunat.gob.pe/sites/default/files/inline-files/Manual%20de%20servicios%20Web%20Api%20-%20SIRE_Compras%20v28_0.pdf"
            target="_blank"
            rel="noreferrer"
            className="block font-semibold text-[#2563EB] hover:text-[#1D4ED8]"
          >
            Manual API SIRE Compras
          </Link>
        </div>
      </div>
    </div>
  );
}
