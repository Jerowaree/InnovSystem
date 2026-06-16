import { FileText, MapPin, Layers, TrendingUp } from "lucide-react";

const solutionItems = [
  {
    title: "Gestión de flota",
    text: "Control total de tus unidades, conductores y documentos.",
    icon: <Layers className="h-6 w-6" />,
  },
  {
    title: "Monitoreo en tiempo real",
    text: "Ubica tus vehículos y visualiza rutas en tiempo real.",
    icon: <MapPin className="h-6 w-6" />,
  },
  {
    title: "Control de costos",
    text: "Analiza gastos y mejora la rentabilidad por viaje.",
    icon: <TrendingUp className="h-6 w-6" />,
  },
  {
    title: "Reportes inteligentes",
    text: "Genera reportes automáticos y toma mejores decisiones.",
    icon: <FileText className="h-6 w-6" />,
  },
];

export default function SolutionSection() {
  return (
    <section className="mt-16 rounded-[2rem] bg-slate-50 px-6 py-10 shadow-soft sm:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">La solución integral para tu operación de transporte</p>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl mx-auto">La solución integral para tu operación de transporte</h2>
          <p className="mt-4 max-w-xl mx-auto text-slate-600">Gestiona tu flota, obtén visibilidad en tiempo real, controla costos y genera reportes inteligentes desde un mismo lugar.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {solutionItems.map((item) => (
            <div key={item.title} className="flex items-start gap-4 rounded-[2rem] border border-slate-200/80 bg-white p-5 shadow-sm shadow-blue-100/50">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-50 text-blue-700 shadow-sm shadow-blue-100/70">
                {item.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
