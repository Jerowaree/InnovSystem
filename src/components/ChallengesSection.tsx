import Image from "next/image";
import { CheckCircle2, Circle, DollarSign, Truck } from "lucide-react";

const challenges = [
  {
    title: "Falta de visibilidad en tiempo real",
    description:
      "No sabes dónde están tus unidades ni el estado de tus viajes.",
  },
  {
    title: "Costos fuera de control",
    description: "Combustible, peajes y mantenimiento sin un control adecuado.",
  },
  {
    title: "Documentación y cumplimiento",
    description:
      "Riesgo de multas por vencimientos y documentos no gestionados.",
  },
  {
    title: "Reportes manuales y lentos",
    description: "Pierdes tiempo consolidando datos en Excel.",
  },
];

export default function ChallengesSection() {
  return (
    <section className="mt-16 grid min-w-0 gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
      <div className="min-w-0 space-y-6">
        <div className="max-w-xl">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            ¿Qué desafíos enfrentan las empresas de transporte?
          </h2>
        </div>
        <div className="space-y-2.5">
          {challenges.map((challenge) => (
            <div
              key={challenge.title}
              className="flex min-w-0 gap-4 rounded-xl px-4 py-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
            >
              <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900">
                  {challenge.title}
                </p>
                <p className="mt-0.5 text-xs leading-normal text-slate-500">
                  {challenge.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="shadow-soft relative min-w-0 overflow-hidden rounded-[2rem] bg-white p-5 sm:p-8">
        <div className="absolute top-6 left-6 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-100 text-slate-700">
          <Truck className="h-6 w-6" />
        </div>
        <div className="absolute top-10 right-6 hidden h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-700 sm:inline-flex">
          <Circle className="h-6 w-6" />
        </div>
        <div className="absolute right-6 bottom-10 hidden h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-700 sm:inline-flex">
          <DollarSign className="h-6 w-6" />
        </div>
        <Image
          src="/truckimg.png"
          alt="Truck illustration"
          width={980}
          height={640}
          className="mx-auto h-auto w-full max-w-full rounded-[1.5rem] object-contain"
          priority
        />
      </div>
    </section>
  );
}
