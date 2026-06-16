import Image from "next/image";

const logos = [
  { src: "/logo1.png", alt: "Logo de Transandes" },
  { src: "/logo2.png", alt: "Logo de Cargarperú" },
  { src: "/logo3.png", alt: "Logo de Vía Express" },
  { src: "/logo4.png", alt: "Logo de Rutas del Sur" },
  { src: "/logo5.png", alt: "Logo de Logimovil" },
  { src: "/logo6.png", alt: "Logo de Pacífico Cargo" },
];

export default function TrustSection() {
  return (
    <section className="my-12 w-full border-y border-slate-200/50 bg-[#f4f7fc] py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
          Empresas de transporte que confían en nosotros
        </p>

        <div className="mt-8 grid grid-cols-2 items-center justify-items-center gap-x-8 gap-y-8 md:grid-cols-3 lg:grid-cols-6 lg:gap-x-10">
          {logos.map((logo) => (
            <div
              key={logo.src}
              className="relative flex h-24 w-full max-w-[220px] items-center justify-center grayscale transition hover:grayscale-0 sm:h-24 sm:max-w-[230px] lg:h-28 lg:max-w-[270px]"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                fill
                sizes="(min-width: 1024px) 180px, (min-width: 768px) 160px, 40vw"
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
