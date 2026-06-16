import Image from "next/image";
import Link from "next/link";
import { Clock3, Cloud, ShieldCheck, Play } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative p-8 lg:grid lg:grid-cols-[0.48fr_2.16fr] lg:items-start lg:gap-32 lg:pl-6 lg:pr-1">
      <div className="relative z-10 max-w-xl -translate-y-1 justify-self-start lg:-translate-y-3">
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-5xl lg:text-[3.7rem] lg:leading-[1.04]">
          <span className="block whitespace-nowrap">Control total de tu</span>
          <span className="block whitespace-nowrap">
            operación de <span className="text-blue-600">transporte</span>
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 lg:mt-5 lg:text-[1.15rem] lg:leading-[1.75]">
          Gestiona tus viajes, costos y resultados desde una sola plataforma.
          Toma decisiones basadas en datos y mejora la rentabilidad de tu
          empresa.
        </p>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link
            href="/register"
            className="inline-flex min-w-[170px] items-center justify-center rounded-2xl bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(37,99,235,0.22)] transition hover:bg-blue-700"
          >
            Comenzar ahora
          </Link>
          <a
            className="inline-flex min-w-[170px] items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/95 px-7 py-3 text-sm font-semibold text-slate-950 shadow-[0_8px_18px_rgba(15,23,42,0.06)] transition hover:border-blue-300 hover:bg-blue-50"
            href="#"
          >
            <Play className="h-4 w-4 text-blue-600" />
            Ver demo
          </a>
        </div>

        <div className="mt-7 grid gap-4 text-sm text-slate-600 sm:grid-cols-3 sm:gap-4">
          <div className="inline-flex h-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_10px_22px_rgba(15,23,42,0.05)]">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Clock3 className="h-5 w-5" />
            </span>
            <span className="font-semibold text-slate-950">
              Datos en tiempo real
            </span>
          </div>
          <div className="inline-flex h-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_10px_22px_rgba(15,23,42,0.05)]">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Cloud className="h-5 w-5" />
            </span>
            <span className="font-semibold text-slate-950">
              100% en la nube
            </span>
          </div>
          <div className="inline-flex h-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_10px_22px_rgba(15,23,42,0.05)]">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="font-semibold text-slate-950">
              Seguro y confiable
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-10 justify-self-end lg:-mt-1 lg:w-full lg:max-w-[1640px]">
        <div className="relative rounded-[1rem] border border-slate-200/80 bg-white shadow-[0_24px_55px_rgba(15,23,42,0.08)] ring-1 ring-white/80 lg:ml-auto lg:p-1">
          <Image
            src="/dashboardhero.png"
            alt="Dashboard hero"
            width={2000}
            height={1750}
            className="h-auto w-full rounded-[0.7rem] object-contain lg:scale-[1.2]"
            priority
          />
        </div>
      </div>
    </section>
  );
}
