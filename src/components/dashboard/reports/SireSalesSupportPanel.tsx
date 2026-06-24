"use client";

interface SireSalesSupportPanelProps {
  latestTicketPeriod: string;
}

export function SireSalesSupportPanel({
  latestTicketPeriod,
}: SireSalesSupportPanelProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-[18px] border border-slate-200 bg-slate-50/70 p-5">
        <h3 className="text-base font-semibold text-slate-950">
          Antes de empezar
        </h3>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
          <li>- Tener guardados tu RUC, usuario SOL y clave SOL.</li>
          <li>- Confirmar que tu empresa ya puede usar SIRE Ventas.</li>
          <li>- Elegir el periodo que quieres revisar o descargar.</li>
        </ul>
      </div>

      <div className="rounded-[18px] border border-slate-200 bg-slate-50/70 p-5">
        <h3 className="text-base font-semibold text-slate-950">
          Flujo recomendado
        </h3>
        <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
          <li>1. Carga los periodos que SUNAT tenga disponibles.</li>
          <li>2. Elige el periodo y el formato del archivo.</li>
          <li>3. Pide la propuesta de ventas a SUNAT.</li>
          <li>4. Revisa el ticket hasta que el proceso termine.</li>
          <li>5. Descarga el archivo apenas aparezca como listo.</li>
        </ol>
        {latestTicketPeriod ? (
          <p className="mt-4 rounded-xl bg-white px-3 py-2 text-xs text-slate-600">
            Ultimo periodo consultado: {latestTicketPeriod}
          </p>
        ) : null}
      </div>

      <div className="rounded-[18px] border border-blue-100 bg-blue-50/70 p-5">
        <h3 className="text-base font-semibold text-slate-950">
          Cuando usar este bloque
        </h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Este panel sirve para trabajar directamente con la informacion de
          SUNAT. Si solo quieres revisar tu operacion interna o sacar un Excel
          de control, puedes usar tambien las tarjetas de reportes que estan
          arriba.
        </p>
      </div>
    </div>
  );
}
