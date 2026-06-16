import { Shield, MapPin, FileBarChart2 } from "lucide-react";

const solutionItems = [
  {
    title: "Gestión de flota",
    text: "Control de tus unidades, conductores y documentos.",
    icon: <Shield className="h-6 w-6 text-blue-600" />,
  },
  {
    title: "Monitoreo en tiempo real",
    text: "Ubicación de tus unidades y estado de los viajes.",
    icon: <MapPin className="h-6 w-6 text-blue-600" />,
  },
  {
    title: "Control de costos",
    text: "Detalle de gastos como peajes, viáticos y combustible.",
    icon: <span className="text-base font-bold text-blue-600">S/</span>,
  },
  {
    title: "Reportes inteligentes",
    text: "Informes financieros automáticos para tomar decisiones.",
    icon: <FileBarChart2 className="h-6 w-6 text-blue-600" />,
  },
];

export default function SolutionSection() {
  return (
    <section className="my-12 w-full border-y border-slate-200/50 bg-[#f8fafc] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h3 className="text-center text-sm font-semibold tracking-[0.2em] text-slate-900 uppercase">
          La solución integral para tu operación de transporte
        </h3>

        <div className="relative mt-10 flex flex-col items-stretch justify-between gap-6 md:flex-row">
          {solutionItems.map((item, idx) => (
            <div
              key={item.title}
              className="relative flex flex-1 items-center gap-4"
            >
              <div className="flex w-full items-start gap-4 rounded-xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(37,99,235,0.02)] transition duration-300 hover:border-blue-300 hover:shadow-[0_8px_30px_rgba(37,99,235,0.05)]">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                  {item.icon}
                </div>
                <div className="space-y-1 text-left">
                  <h4 className="text-sm font-bold text-slate-900">
                    {item.title}
                  </h4>
                  <p className="text-xs leading-relaxed text-slate-500">
                    {item.text}
                  </p>
                </div>
              </div>

              {idx !== solutionItems.length - 1 && (
                <div className="z-10 -mr-4 hidden w-8 shrink-0 items-center justify-center lg:flex">
                  <span className="text-lg font-bold text-blue-200/60 select-none">
                    →
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
