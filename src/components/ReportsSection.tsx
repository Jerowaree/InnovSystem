const reportRows = [
  ["01/05/2024", "Lima - Arequipa", "ABC-123", "Juan Pérez", "S/ 2,650.00"],
  ["02/05/2024", "Lima - Trujillo", "DEF-456", "Carlos Ruiz", "S/ 1,950.00"],
  ["03/05/2024", "Lima - Cusco", "GHI-789", "Luis Gómez", "S/ 2,300.00"],
  ["04/05/2024", "Lima - Piura", "JKL-012", "Pedro Flores", "S/ 2,100.00"],
];

export default function ReportsSection() {
  return (
    <section className="mt-16 space-y-6 sm:space-y-8">
      <div className="grid gap-6 lg:grid-cols-[0.45fr_1fr] lg:items-start">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 sm:p-8">
          <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase sm:text-sm sm:tracking-[0.24em]">
            Reportes automáticos
          </p>
          <h2 className="mt-4 text-2xl font-semibold text-slate-950">
            Listos para descargar
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Genera reportes en Excel o PDF con un solo clic. Ahorra tiempo y
            trabaja con información confiable y actualizada.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-3 rounded-md bg-slate-50 px-3 py-2">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="20" height="20" rx="2" fill="#107C10" />
                <path d="M6 8h12v8H6z" fill="#fff" />
              </svg>
              <span className="text-sm font-medium text-slate-800">Excel</span>
            </div>
            <div className="inline-flex items-center gap-3 rounded-md bg-slate-50 px-3 py-2">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="20" height="20" rx="2" fill="#E53E3E" />
                <path d="M6 7h12v10H6z" fill="#fff" />
              </svg>
              <span className="text-sm font-medium text-slate-800">PDF</span>
            </div>
          </div>
        </div>

        <div className="shadow-soft rounded-[1.5rem] border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              Reporte de viajes
            </h3>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                Exportar Excel
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                Exportar PDF
              </button>
            </div>
          </div>

          <div className="mt-4 hidden overflow-hidden rounded-xl border border-slate-100 md:block">
            <div className="grid grid-cols-6 gap-2 bg-slate-50 px-5 py-3 text-sm tracking-[0.12em] text-slate-500 uppercase">
              <span className="col-span-2">Fecha</span>
              <span>Ruta</span>
              <span>Vehículo</span>
              <span>Conductor</span>
              <span>Ingreso</span>
            </div>

            {reportRows.map((r) => (
              <div
                key={r.join("-")}
                className="grid grid-cols-6 gap-2 border-t border-slate-100 px-5 py-4 text-sm text-slate-700"
              >
                <span className="col-span-2">{r[0]}</span>
                <span>{r[1]}</span>
                <span>{r[2]}</span>
                <span>{r[3]}</span>
                <span className="font-semibold">{r[4]}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 md:hidden">
            {reportRows.map((r) => (
              <div
                key={r.join("-")}
                className="rounded-xl border border-slate-100 bg-slate-50/60 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">
                    {r[0]}
                  </span>
                  <span className="text-sm font-semibold text-slate-950">
                    {r[4]}
                  </span>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-slate-700">
                  <p>
                    <span className="font-medium text-slate-500">Ruta:</span>{" "}
                    {r[1]}
                  </p>
                  <p>
                    <span className="font-medium text-slate-500">
                      Vehículo:
                    </span>{" "}
                    {r[2]}
                  </p>
                  <p>
                    <span className="font-medium text-slate-500">
                      Conductor:
                    </span>{" "}
                    {r[3]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.45fr_1fr] lg:items-start">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 sm:p-8">
          <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase sm:text-sm sm:tracking-[0.24em]">
            Información confiable con SUNAT
          </p>
          <h3 className="mt-4 text-2xl font-semibold text-slate-950">
            Consulta la información oficial de tu empresa
          </h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Valida tus datos y cumple con tus obligaciones consultando
            directamente con SUNAT.
          </p>
          <a
            href="#"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
          >
            Consultar mi empresa
          </a>
        </div>

        <div className="shadow-soft rounded-[1.5rem] border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs tracking-[0.18em] text-slate-400 uppercase">
                Información de la empresa
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                TRANSPORTES DEL SUR S.A.C.
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                ACTIVO
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-400">RUC</p>
              <p className="mt-1 font-semibold text-slate-900">20123456789</p>
              <p className="mt-2 text-xs text-slate-500">Domicilio Fiscal</p>
              <p className="mt-1 text-sm text-slate-700">
                AV. LOS TRANSPORTISTAS 123, LIMA - LIMA - LIMA
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-400">Condición</p>
              <p className="mt-1 font-semibold text-slate-900">HABIDO</p>
              <p className="mt-2 text-xs text-slate-500">Actividad Económica</p>
              <p className="mt-1 text-sm text-slate-700">
                4923 - TRANSPORTE DE CARGA POR CARRETERA
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
