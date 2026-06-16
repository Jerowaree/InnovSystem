import Image from "next/image";
import Link from "next/link";

export default function CTABanner() {
  return (
    <section className="mt-16 w-full rounded-[1rem] bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-8 text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center gap-6">
        <div className="hidden md:block md:w-1/3 lg:w-2/5">
          <Image
            src="/truckimg.png"
            alt="Truck"
            width={640}
            height={320}
            className="h-auto w-full"
            priority
          />
        </div>

        <div className="w-full md:w-2/3 lg:w-3/5">
          <h3 className="text-2xl leading-tight font-bold">
            Lleva tu operación de transporte al siguiente nivel
          </h3>
          <p className="mt-2 text-sm text-blue-100/90">
            Únete a InnovSystem y transforma la gestión de tu flota con datos y
            tecnología.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-md bg-white px-5 py-3 text-sm font-semibold text-blue-600 shadow-sm"
            >
              Comenzar ahora
            </Link>
            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/30 px-5 py-3 text-sm font-medium text-white"
            >
              Ver demo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
