import Image from "next/image";
import Link from "next/link";
import { Clock3, Cloud, ShieldCheck, Play } from "lucide-react";

export default function Hero() {
  return (
    <section className="grid gap-10 rounded-[2rem] bg-slate-50/90 p-8 lg:grid-cols-[0.78fr_1.72fr] lg:items-center">
      <div className="max-w-2xl">
        <h1 className="mt-6 text-4xl font-semibold tracking-[0.02em] text-slate-950 sm:text-5xl lg:text-6xl">
          <span className="block">Control total de tu</span>
          <span className="block">
            operación de <span className="text-blue-600">transporte</span>
          </span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
          Gestiona tus viajes, costos y resultados desde una sola plataforma.
          Toma decisiones basadas en datos y mejora la rentabilidad de tu
          empresa.
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link
            href="/register"
            className="inline-flex min-w-[170px] items-center justify-center rounded-2xl bg-blue-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Comenzar ahora
          </Link>
          <a
            className="inline-flex min-w-[170px] items-center justify-center gap-2 rounded-2xl border border-blue-300 bg-white px-7 py-3 text-sm font-semibold text-slate-950 transition hover:border-blue-400 hover:bg-blue-50"
            href="#"
          >
            <Play className="h-4 w-4 text-blue-600" />
            Ver demo
          </a>
        </div>

        <div className="mt-8 flex flex-col gap-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:gap-8">
          <div className="inline-flex items-center gap-2 sm:gap-3">
            <Clock3 className="h-6 w-6 text-slate-500" />
            <span className="font-semibold text-slate-950">
              Datos en tiempo real
            </span>
          </div>
          <div className="inline-flex items-center gap-2 sm:gap-3">
            <Cloud className="h-6 w-6 text-slate-500" />
            <span className="font-semibold text-slate-950">
              100% en la nube
            </span>
          </div>
          <div className="inline-flex items-center gap-2 sm:gap-3">
            <ShieldCheck className="h-6 w-6 text-slate-500" />
            <span className="font-semibold text-slate-950">
              Seguro y confiable
            </span>
          </div>
        </div>
      </div>

      <div className="relative lg:self-stretch">
        <div className="overflow-hidden rounded-[1rem] border border-slate-200 bg-white shadow-sm lg:p-4 lg:shadow-md">
          <Image
            src="/dashboardhero.png"
            alt="Dashboard hero"
            width={2000}
            height={1750}
            className="h-auto w-full object-contain"
            priority
          />
        </div>
      </div>
    </section>
  );
}
