import Image from "next/image";
import Link from "next/link";
import { Clock3, Cloud, ShieldCheck, Play } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative max-w-full overflow-hidden pt-2 pb-10 lg:grid lg:grid-cols-12 lg:items-center lg:gap-16 lg:pt-18 lg:pb-12">
      
      {/* Left: Text and CTA */}
      <div className="relative z-10 min-w-0 lg:col-span-5 space-y-6 lg:-translate-y-4">
        <h1 className="text-[2.25rem] font-bold leading-[1.15] tracking-[-0.04em] text-slate-900 sm:text-5xl lg:text-[3.5rem]">
          <span className="block">Control total de tu</span>
          <span className="block mt-1">
            operación de <span className="text-blue-600">transporte</span>
          </span>
        </h1>
        
        <p className="max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
          Gestiona tus viajes, costos y resultados desde una sola plataforma.
          Toma decisiones basadas en datos y mejora la rentabilidad de tu empresa.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-none bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(37,99,235,0.15)] transition hover:bg-blue-700 sm:min-w-[160px]"
          >
            Comenzar ahora
          </Link>
          <a
            className="inline-flex items-center justify-center gap-2 rounded-none border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:min-w-[160px]"
            href="#"
          >
            <Play className="h-4 w-4 text-blue-600" />
            Ver demo
          </a>
        </div>

        {/* Icons below buttons - borderless and grey styled */}
        <div className="pt-4 grid gap-4 text-sm font-medium text-slate-500 sm:grid-cols-3 sm:gap-6">
          <div className="flex items-center gap-3">
            <Clock3 className="h-6 w-6 text-slate-400 shrink-0" />
            <span>Datos en tiempo real</span>
          </div>
          <div className="flex items-center gap-3">
            <Cloud className="h-6 w-6 text-slate-400 shrink-0" />
            <span>100% en la nube</span>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-slate-400 shrink-0" />
            <span>Seguro y confiable</span>
          </div>
        </div>
      </div>

      {/* Right: Dashboard Image - sharp edges and uncropped */}
      <div className="relative z-10 mt-10 lg:mt-0 lg:col-span-7 w-full lg:-translate-y-4">
        <div className="relative w-full overflow-hidden rounded-none border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          <Image
            src="/dashboardhero.png"
            alt="Dashboard preview"
            width={1400}
            height={950}
            className="h-auto w-full max-w-full rounded-none object-contain"
            priority
          />
        </div>
      </div>

    </section>
  );
}



