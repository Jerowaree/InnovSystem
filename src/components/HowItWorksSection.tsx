import { ArrowRight, Clock, Truck, FileText } from "lucide-react";

const steps = [
  {
    title: "Registra tu flota",
    description: "Agrega tus unidades, conductores y datos asociados.",
    icon: <Truck className="h-6 w-6 text-blue-700" />,
  },
  {
    title: "Planifica y asigna viajes",
    description: "Crea viajes, asigna rutas y conductores.",
    icon: <Clock className="h-6 w-6 text-blue-700" />,
  },
  {
    title: "Monitorea en tiempo real",
    description: "Sigue el estado de tus viajes y unidades.",
    icon: <Truck className="h-6 w-6 text-blue-700" />,
  },
  {
    title: "Controla costos",
    description: "Registra gastos y analiza la rentabilidad.",
    icon: <ArrowRight className="h-6 w-6 text-blue-700" />,
  },
  {
    title: "Genera reportes",
    description: "Obtén reportes automáticos y exporta a Excel o PDF.",
    icon: <FileText className="h-6 w-6 text-blue-700" />,
  },
];

export default function HowItWorksSection() {
  return (
    <section className="mt-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold tracking-[0.24em] text-slate-500 uppercase">
            ¿Cómo funciona InnovSystem?
          </p>
        </div>

        <div className="mt-8 flex items-start justify-center gap-6 overflow-x-auto py-6">
          {steps.map((step, idx) => (
            <div key={step.title} className="flex items-start gap-6">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                      {step.icon}
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                    {idx + 1}
                  </div>
                </div>
                <div className="mt-4 w-44 text-center">
                  <p className="text-sm font-semibold text-slate-950">
                    {step.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {step.description}
                  </p>
                </div>
              </div>

              {idx !== steps.length - 1 && (
                <div className="hidden items-center md:flex">
                  <div className="mx-4 h-px w-28 rounded-full border-t-2 border-dashed border-slate-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
