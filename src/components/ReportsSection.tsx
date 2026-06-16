import Image from "next/image";
import Link from "next/link";
import {
  Clock3,
  Navigation,
  ShieldCheck,
  TrendingUp,
  ChevronDown,
} from "lucide-react";

const reportRows = [
  {
    fecha: "01/05/2024",
    ruta: "Lima - Arequipa",
    vehiculo: "ABC-123",
    conductor: "Juan Pérez",
    ingreso: "S/ 2,650.00",
    gasto: "S/ 1,850.00",
    utilidad: "S/ 800.00",
  },
  {
    fecha: "02/05/2024",
    ruta: "Lima - Trujillo",
    vehiculo: "DEF-456",
    conductor: "Carlos Ruiz",
    ingreso: "S/ 1,950.00",
    gasto: "S/ 1,320.00",
    utilidad: "S/ 630.00",
  },
  {
    fecha: "03/05/2024",
    ruta: "Lima - Cusco",
    vehiculo: "GHI-789",
    conductor: "Luis Gómez",
    ingreso: "S/ 2,300.00",
    gasto: "S/ 1,150.00",
    utilidad: "S/ 1,150.00",
  },
  {
    fecha: "04/05/2024",
    ruta: "Lima - Piura",
    vehiculo: "JKL-012",
    conductor: "Pedro Flores",
    ingreso: "S/ 2,100.00",
    gasto: "S/ 1,400.00",
    utilidad: "S/ 700.00",
  },
  {
    fecha: "05/05/2024",
    ruta: "Lima - Ilo",
    vehiculo: "MNO-345",
    conductor: "Ana Torres",
    ingreso: "S/ 2,780.00",
    gasto: "S/ 1,730.00",
    utilidad: "S/ 1,050.00",
  },
];

export default function ReportsSection() {
  return (
    <section className="mt-20 space-y-24">
      {/* SECTION 1: Showcase - Toda tu operación en una sola vista */}
      <div className="space-y-12">
        <div className="grid gap-10 lg:grid-cols-[0.4fr_1fr] lg:items-center">
          <div className="space-y-6">
            <h2 className="sm:text-4.5xl text-3xl leading-[1.1] font-bold tracking-tight text-slate-900">
              Toda tu operación en una sola vista
            </h2>
            <p className="text-sm leading-relaxed text-slate-500">
              Indicadores clave de tu operación de transporte en tiempo real
              para tomar decisiones más rápidas y efectivas.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-600 bg-transparent px-5 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
            >
              Pruébalo gratis
              <ChevronDown className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-[0_12px_40px_rgba(0,0,0,0.03)]">
            <Image
              src="/dashboardhero.png"
              alt="Showcase Dashboard"
              width={1400}
              height={900}
              className="h-auto w-full max-w-full rounded-lg object-contain"
              priority
            />
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 items-center gap-6 rounded-xl border border-slate-200 bg-white px-8 py-6 md:grid-cols-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Clock3 className="h-5.5 w-5.5" />
            </div>
            <div>
              <p className="text-lg leading-none font-bold text-slate-900">
                25%
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Reducción de costos operativos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Navigation className="h-5.5 w-5.5" />
            </div>
            <div>
              <p className="text-lg leading-none font-bold text-slate-900">
                30%
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Más eficiencia en rutas y recorridos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <ShieldCheck className="h-5.5 w-5.5" />
            </div>
            <div>
              <p className="text-lg leading-none font-bold text-slate-900">
                100%
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Cumplimiento y documentación al día
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <TrendingUp className="h-5.5 w-5.5" />
            </div>
            <div>
              <p className="text-lg leading-none font-bold text-slate-900">
                +40%
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Incremento de rentabilidad
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Reportes automáticos */}
      <div className="grid gap-10 lg:grid-cols-[0.4fr_1fr] lg:items-start">
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Reportes automáticos
            </h3>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Listos para descargar
            </h3>
          </div>
          <p className="text-sm leading-relaxed text-slate-500">
            Genera reportes en Excel o PDF con un solo clic. Ahorra tiempo y
            trabaja con información confiable y actualizada.
          </p>

          {/* Format Badges */}
          <div className="flex items-center gap-3 pt-2">
            <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
              <div className="relative h-6 w-6 shrink-0">
                <Image
                  src="/excel.png"
                  alt="Excel"
                  fill
                  sizes="24px"
                  className="object-contain"
                />
              </div>
              <span className="text-xs font-bold text-slate-700">Excel</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
              <div className="relative h-6 w-6 shrink-0">
                <Image
                  src="/pdf.png"
                  alt="PDF"
                  fill
                  sizes="24px"
                  className="object-contain"
                />
              </div>
              <span className="text-xs font-bold text-slate-700">PDF</span>
            </div>
          </div>
        </div>

        {/* Reports Table Card */}
        <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.02)]">
          <div className="mb-4 flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <h4 className="text-sm font-bold text-slate-900">
              Reporte de viajes
            </h4>
            <div className="flex flex-wrap items-center gap-3">
              <button className="inline-flex items-center gap-1 text-[11px] font-bold text-[#107C41] hover:underline">
                <span className="relative h-3.5 w-3.5 shrink-0">
                  <Image
                    src="/excel.png"
                    alt="Excel"
                    fill
                    sizes="14px"
                    className="object-contain"
                  />
                </span>
                Exportar Excel
              </button>
              <button className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E81123] hover:underline">
                <span className="relative h-3.5 w-3.5 shrink-0">
                  <Image
                    src="/pdf.png"
                    alt="PDF"
                    fill
                    sizes="14px"
                    className="object-contain"
                  />
                </span>
                Exportar PDF
              </button>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="min-w-[760px] border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-50 font-bold tracking-wider text-slate-400 uppercase">
                  <th className="rounded-l px-4 py-2.5">Fecha</th>
                  <th className="px-4 py-2.5">Ruta</th>
                  <th className="px-4 py-2.5">Vehículo</th>
                  <th className="px-4 py-2.5">Conductor</th>
                  <th className="px-4 py-2.5">Ingresos</th>
                  <th className="px-4 py-2.5">Gastos</th>
                  <th className="rounded-r px-4 py-2.5">Utilidad</th>
                </tr>
              </thead>
              <tbody className="font-medium text-slate-600">
                {reportRows.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-slate-100 transition hover:bg-slate-50/50"
                  >
                    <td className="px-4 py-3">{row.fecha}</td>
                    <td className="px-4 py-3">{row.ruta}</td>
                    <td className="px-4 py-3">{row.vehiculo}</td>
                    <td className="px-4 py-3">{row.conductor}</td>
                    <td className="px-4 py-3 font-bold text-slate-950">
                      {row.ingreso}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-950">
                      {row.gasto}
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-600">
                      {row.utilidad}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 3: Información confiable con SUNAT */}
      <div className="grid gap-10 lg:grid-cols-[0.4fr_1fr] lg:items-start">
        <div className="space-y-6">
          <h3 className="text-2xl leading-snug font-bold tracking-tight text-slate-900 sm:text-3xl">
            Información confiable con SUNAT
          </h3>
          <p className="text-sm leading-relaxed text-slate-500">
            Consulta la información oficial de tu empresa directamente desde
            SUNAT para validar tus datos y cumplir con tus obligaciones.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-lg border border-blue-600 bg-transparent px-5 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            Consultar mi empresa
          </Link>
        </div>

        {/* SUNAT Company card */}
        <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <p className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
                Información de la empresa
              </p>
              <h4 className="mt-1 text-sm font-bold text-slate-900">
                TRANSPORTES DEL SUR S.A.C.
              </h4>
            </div>
            <div className="relative h-7 w-20">
              <Image
                src="/sunatlogo1.png"
                alt="SUNAT Logo"
                fill
                sizes="80px"
                className="object-contain"
              />
            </div>
          </div>

          <div className="grid gap-6 text-xs sm:grid-cols-2">
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase">
                  RUC
                </p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">
                  20123456789
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase">
                  Estado
                </p>
                <p className="mt-1 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                  ACTIVO
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase">
                  Domicilio Fiscal
                </p>
                <p className="mt-0.5 leading-relaxed text-slate-600">
                  AV. LOS TRANSPORTISTAS 123, LIMA - LIMA - LIMA
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase">
                  Condición
                </p>
                <p className="mt-1 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                  HABIDO
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase">
                  Actividad Económica
                </p>
                <p className="mt-0.5 leading-relaxed text-slate-600">
                  4923 - TRANSPORTE DE CARGA POR CARRETERA
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
