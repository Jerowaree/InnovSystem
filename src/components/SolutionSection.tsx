import { Shield, MapPin, DollarSign, FileBarChart2 } from "lucide-react";

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
    icon: <DollarSign className="h-6 w-6 text-blue-600" />,
  },
  {
    title: "Reportes inteligentes",
    text: "Informes financieros automáticos para tomar decisiones.",
    icon: <FileBarChart2 className="h-6 w-6 text-blue-600" />,
  },
];

export default function SolutionSection() {
  return (
    <section className="w-full bg-[#f8fafc] border-y border-slate-200/50 py-12 my-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h3 className="text-center text-sm font-semibold tracking-[0.2em] text-slate-900 uppercase">
          La solución integral para tu operación de transporte
        </h3>
        
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {solutionItems.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-4 rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                {item.icon}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 leading-normal">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


