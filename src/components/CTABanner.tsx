import Image from "next/image";
import { MapPin } from "lucide-react";

export default function CTABanner() {
  return (
    <section className="px-4 pb-0 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[1.2rem] bg-[#2563eb] shadow-[0_20px_50px_rgba(37,99,235,0.22)]">
        <div className="relative flex flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row md:gap-12 md:px-12 md:py-6 lg:px-16">
          <div className="relative flex h-[130px] w-full max-w-[280px] shrink-0 items-center justify-center md:h-[150px] md:max-w-[320px] lg:h-[160px] lg:max-w-[360px]">
            <Image
              src="/trucklogin.png"
              alt="Operación de transporte"
              fill
              sizes="(min-width: 1024px) 360px, (min-width: 768px) 320px, 280px"
              className="object-contain object-left md:object-center"
              priority
            />
          </div>

          <div className="flex-1 text-center text-white md:max-w-xl md:text-left">
            <h3 className="text-xl leading-snug font-bold tracking-tight sm:text-2xl lg:text-[1.8rem]">
              Lleva tu operación de transporte al siguiente nivel
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-blue-100/90 sm:text-sm">
              Únete a InnovSystem y transforma la gestión de tu flota con datos
              y tecnología.
            </p>
          </div>

          <div className="relative hidden h-20 w-36 shrink-0 opacity-80 md:block lg:h-24 lg:w-44">
            <svg
              viewBox="0 0 200 100"
              fill="none"
              className="h-full w-full stroke-white/40 stroke-[2]"
              strokeDasharray="6 6"
            >
              <path d="M 20 75 C 60 75, 50 30, 95 30 C 140 30, 130 75, 175 75" />
            </svg>
            <div className="absolute top-[28px] left-[45px] text-white/50 lg:top-[38px] lg:left-[55px]">
              <MapPin className="h-6 w-6 lg:h-7 lg:w-7" />
            </div>
            <div className="absolute top-[5px] right-[15px] text-white/50 lg:top-[12px] lg:right-[20px]">
              <MapPin className="h-6 w-6 lg:h-7 lg:w-7" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
