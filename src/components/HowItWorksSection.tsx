"use client";

import { Binary, Radar, Route, ScanSearch, WalletCards } from "lucide-react";
import { motion } from "motion/react";

const steps = [
  {
    title: "Registra tu flota",
    description: "Agrega unidades, conductores y documentos.",
    icon: <Binary className="h-5 w-5" />,
  },
  {
    title: "Recibe viajes y rutas",
    description: "Organiza recorridos y asignaciones.",
    icon: <Route className="h-5 w-5" />,
  },
  {
    title: "Monitorea en tiempo real",
    description: "Sigue el estado operativo de cada viaje.",
    icon: <Radar className="h-5 w-5" />,
  },
  {
    title: "Controla costos",
    description: "Registra gastos y revisa rentabilidad.",
    icon: <WalletCards className="h-5 w-5" />,
  },
  {
    title: "Genera reportes",
    description: "Exporta reportes automáticos en segundos.",
    icon: <ScanSearch className="h-5 w-5" />,
  },
];

export default function HowItWorksSection() {
  return (
    <section className="mt-16">
      <div className="text-center">
        <p className="text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase sm:text-sm sm:tracking-[0.24em]">
          ¿Cómo funciona la plataforma?
        </p>
      </div>

      <div className="relative right-1/2 left-1/2 mt-8 w-screen -translate-x-1/2 overflow-hidden bg-[linear-gradient(135deg,_#0b2a76_0%,_#1550d0_48%,_#2c76ff_100%)] py-8 shadow-[0_24px_60px_rgba(37,99,235,0.20)] sm:py-10 lg:py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,_rgba(255,255,255,0.16),_transparent_24%),radial-gradient(circle_at_84%_30%,_rgba(255,255,255,0.10),_transparent_20%)]"
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:hidden">
            {steps.map((step, idx) => (
              <article
                key={step.title}
                className="rounded-[1.4rem] border border-white/12 bg-white/8 px-5 py-4 text-white backdrop-blur-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-white text-[#1550d0] shadow-[0_12px_28px_rgba(255,255,255,0.18)]">
                      {step.icon}
                    </div>
                    <div className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#8fc2ff] text-[10px] font-bold text-[#0b2a76]">
                      {idx + 1}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold">{step.title}</p>
                    <p className="mt-1.5 text-sm leading-6 text-blue-100/88">
                      {step.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden items-start justify-between gap-4 md:flex">
            {steps.map((step, idx) => (
              <div
                key={step.title}
                className="flex min-w-0 flex-1 items-start gap-4"
              >
                <div className="flex flex-1 flex-col items-center text-center text-white">
                  <div className="relative mb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-white text-[#1550d0] shadow-[0_14px_30px_rgba(255,255,255,0.16)] lg:h-18 lg:w-18">
                      {step.icon}
                    </div>
                    <div className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#8fc2ff] text-[10px] font-bold text-[#0b2a76]">
                      {idx + 1}
                    </div>
                  </div>
                  <p className="text-[15px] leading-5 font-semibold lg:text-[16px]">
                    {step.title}
                  </p>
                  <p className="mt-2 max-w-[170px] text-xs leading-5 text-blue-100/84 lg:max-w-[190px]">
                    {step.description}
                  </p>
                </div>

                {idx !== steps.length - 1 && (
                  <div className="mt-8 hidden flex-1 lg:block">
                    <div className="relative h-px w-full overflow-hidden rounded-full bg-white/18">
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(255,255,255,0.5)_0%,_rgba(255,255,255,0.18)_100%)]" />
                      <motion.span
                        aria-hidden="true"
                        className="absolute inset-y-0 left-[-35%] w-[34%] rounded-full bg-[linear-gradient(90deg,_rgba(255,255,255,0)_0%,_rgba(255,255,255,0.95)_50%,_rgba(255,255,255,0)_100%)] blur-[0.5px]"
                        animate={{ x: ["0%", "400%"] }}
                        transition={{
                          duration: 2.6,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "linear",
                          delay: idx * 0.22,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
