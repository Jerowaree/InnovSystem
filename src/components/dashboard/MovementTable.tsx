import type { Movement } from "@/types/db";

interface MovementTableProps {
  movements: Movement[];
}

function getMovementTone(movementType: string) {
  const value = movementType.toLowerCase();

  if (value.includes("venta") || value.includes("ingreso")) {
    return "bg-[#EAF7EF] text-[#16A34A]";
  }

  return "bg-[#FFF1F2] text-[#E11D48]";
}

export default function MovementTable({ movements }: MovementTableProps) {
  return (
    <section className="min-w-0 overflow-hidden rounded-[28px] border border-white/80 bg-white px-5 py-5 shadow-[0_30px_60px_-45px_rgba(15,23,42,0.35)]">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-slate-950">
            Ultimos Movimientos
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Resumen operativo reciente de tu empresa.
          </p>
        </div>
        <span className="max-w-full break-words text-sm font-semibold text-[#2F6BFF]">
          Ver todos los movimientos
        </span>
      </div>

      <div className="grid gap-3 md:hidden">
        {movements.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-6 text-center text-slate-500">
            No hay movimientos disponibles.
          </div>
        ) : (
          movements.map((movement) => (
            <article
              key={movement.id}
              className="min-w-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm font-semibold text-slate-900">
                    {movement.document_type}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {movement.movement_date}
                  </p>
                </div>
                <span
                  className={`inline-flex max-w-[7rem] shrink-0 justify-center rounded-full px-2.5 py-1 text-center text-xs font-semibold ${getMovementTone(
                    movement.movement_type
                  )}`}
                >
                  {movement.movement_type}
                </span>
              </div>

              <div className="mt-3 grid min-w-0 gap-2 text-sm text-slate-600">
                <p className="break-words leading-6">{movement.description}</p>
                <p className="break-words font-semibold text-slate-950">
                  S/ {movement.amount.toLocaleString("en-US")}
                </p>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-[0.18em] text-slate-400">
              <th className="pr-4 pb-3 font-medium">Fecha</th>
              <th className="pr-4 pb-3 font-medium">Documento</th>
              <th className="pr-4 pb-3 font-medium">Proveedor / Cliente</th>
              <th className="pr-4 pb-3 font-medium">Tipo</th>
              <th className="pb-3 text-right font-medium">Monto</th>
            </tr>
          </thead>
          <tbody>
            {movements.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  No hay movimientos disponibles.
                </td>
              </tr>
            ) : (
              movements.map((movement) => (
                <tr key={movement.id} className="border-b border-slate-100/80">
                  <td className="py-4 pr-4 text-slate-700">
                    {movement.movement_date}
                  </td>
                  <td className="py-4 pr-4 font-medium text-slate-800">
                    {movement.document_type}
                  </td>
                  <td className="py-4 pr-4 text-slate-600">
                    {movement.description}
                  </td>
                  <td className="py-4 pr-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getMovementTone(
                        movement.movement_type
                      )}`}
                    >
                      {movement.movement_type}
                    </span>
                  </td>
                  <td className="py-4 text-right font-semibold text-slate-950">
                    S/ {movement.amount.toLocaleString("en-US")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
