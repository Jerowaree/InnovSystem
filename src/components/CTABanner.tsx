import Image from "next/image";
import Link from "next/link";
import { MapPin, ShieldCheck, Sparkles } from "lucide-react";

export default function CTABanner() {
  return (
    <section className="px-6 pb-20 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[1.2rem] bg-[linear-gradient(90deg,_#2563eb_0%,_#2f6ff0_42%,_#3b82f6_100%)] shadow-[0_20px_50px_rgba(37,99,235,0.22)]">
        <div className="flex min-h-[132px] items-center gap-5 px-5 py-4 sm:px-6 lg:gap-8 lg:px-10">
          <div className="relative hidden h-[92px] w-[210px] shrink-0 md:block">
            <Image
              src="/truckimg-cutout.png"
              alt="Operación de transporte"
              fill
              className="object-contain object-left"
              priority
            />
          </div>

          <div className="min-w-0 flex-1 text-white">
            <p className="text-[1.05rem] font-semibold tracking-[-0.02em] sm:text-[1.2rem]">
              Lleva tu operación de transporte
            </p>
            <h3 className="mt-0.5 text-[1.15rem] leading-tight font-semibold tracking-[-0.03em] text-white sm:text-[1.4rem]">
              al siguiente nivel
            </h3>
            <p className="mt-1.5 max-w-2xl text-xs leading-6 text-blue-100/90 sm:text-sm">
              InnovSystem centraliza tu gestión con reportes, control y
              visibilidad operativa.
            </p>
          </div>

          <div className="hidden items-center gap-2 text-blue-100/90 lg:flex">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/18 bg-white/10">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/18 bg-white/10">
              <MapPin className="h-4 w-4" />
            </span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/18 bg-white/10">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>

          <Link
            href="/register"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-[0_12px_24px_rgba(255,255,255,0.14)] transition hover:bg-blue-50 sm:px-5"
          >
            Comenzar ahora
          </Link>
        </div>
      </div>
    </section>
  );
}
