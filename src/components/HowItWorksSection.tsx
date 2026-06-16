import { Truck, MapPin, Activity, DollarSign, FileBarChart2, ArrowRight } from "lucide-react";

const steps = [
  {
    title: "Registra tu flota",
    description: "Agrega tus vehículos, conductores y saldos iniciales.",
    icon: <Truck className="h-6 w-6 text-blue-600" />,
  },
  {
    title: "Planifica y asigna viajes",
    description: "Crea viajes, asigna rutas y combustible.",
    icon: <MapPin className="h-6 w-6 text-blue-600" />,
  },
  {
    title: "Monitorea en tiempo real",
    description: "Sigue el estado de tus viajes y unidades.",
    icon: <Activity className="h-6 w-6 text-blue-600" />,
  },
  {
    title: "Controla costos",
    description: "Registra gastos y analiza la rentabilidad.",
    icon: <DollarSign className="h-6 w-6 text-blue-600" />,
  },
  {
    title: "Genera reportes",
    description: "Obtén reportes automáticos y exporta a Excel o PDF.",
    icon: <FileBarChart2 className="h-6 w-6 text-blue-600" />,
  },
];

export default function HowItWorksSection() {
  return (
    <section className="w-full bg-[#06183a] py-16 my-12 shadow-[0_20px_50px_rgba(6,24,58,0.2)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h3 className="text-sm font-semibold tracking-[0.2em] text-blue-300 uppercase">
            ¿Cómo funciona InnovSystem?
          </h3>
        </div>

        {/* Steps for mobile - vertical list */}
        <div className="mt-10 space-y-6 md:hidden">
          {steps.map((step, idx) => (
            <div
              key={step.title}
              className="flex items-center gap-4 rounded-xl bg-white/5 p-4 border border-white/5"
            >
              <div className="relative shrink-0">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md">
                  {step.icon}
                </div>
                <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-2xs font-bold text-white">
                  {idx + 1}
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-white">
                  {step.title}
                </p>
                <p className="mt-1 text-xs text-blue-200/70 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Steps for desktop - horizontal connected row */}
        <div className="mt-12 hidden items-start justify-between gap-4 md:flex">
          {steps.map((step, idx) => (
            <div key={step.title} className="flex flex-1 items-start justify-center">
              
              <div className="flex flex-col items-center text-center">
                {/* Circle Container */}
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg transition-transform duration-300 hover:scale-105">
                    {step.icon}
                  </div>
                  {/* Overlapping small number badge */}
                  <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-extrabold text-white shadow-sm">
                    {idx + 1}
                  </div>
                </div>

                {/* Text Content */}
                <div className="mt-4 max-w-[160px]">
                  <p className="text-xs font-bold text-white tracking-wide">
                    {step.title}
                  </p>
                  <p className="mt-2 text-[10px] text-blue-200/60 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Dotted connector with arrow */}
              {idx !== steps.length - 1 && (
                <div className="flex flex-1 items-center justify-center pt-6 px-1">
                  <span className="text-blue-500/30 text-xs tracking-widest font-mono select-none">••••➔</span>
                </div>
              )}

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


