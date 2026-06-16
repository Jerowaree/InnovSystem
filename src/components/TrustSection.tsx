import { Globe, RefreshCw, Zap, Compass, Navigation, Shield } from "lucide-react";

export default function TrustSection() {
  return (
    <section className="w-full bg-[#f4f7fc] border-y border-slate-200/50 py-10 my-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
          Empresas de transporte que confían en nosotros
        </p>
        
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-8 md:gap-x-16 lg:gap-x-20">
          
          {/* Logo 1: Transandes */}
          <div className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition">
            <Globe className="h-6 w-6 stroke-[1.8]" />
            <div className="leading-none text-left">
              <span className="block text-sm font-bold tracking-tight text-slate-700 uppercase">Transandes</span>
              <span className="text-[10px] tracking-wider text-slate-400">LOGÍSTICA</span>
            </div>
          </div>

          {/* Logo 2: Cargarperú */}
          <div className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition">
            <RefreshCw className="h-6 w-6 stroke-[1.8]" />
            <div className="leading-none text-left">
              <span className="block text-sm font-bold tracking-tight text-slate-700 uppercase">Cargarperú</span>
              <span className="text-[10px] tracking-wider text-slate-400">TRANSPORTE</span>
            </div>
          </div>

          {/* Logo 3: Vía Express */}
          <div className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition">
            <Zap className="h-6 w-6 stroke-[1.8]" />
            <div className="leading-none text-left">
              <span className="block text-sm font-bold tracking-widest text-slate-750 uppercase">Vía Express</span>
            </div>
          </div>

          {/* Logo 4: Rutas del Sur */}
          <div className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition">
            <Compass className="h-6 w-6 stroke-[1.8]" />
            <div className="leading-none text-left">
              <span className="block text-sm font-bold tracking-tight text-slate-700 uppercase">Rutas del Sur</span>
              <span className="text-[10px] tracking-wider text-slate-400">SOLUCIONES</span>
            </div>
          </div>

          {/* Logo 5: Logimovil */}
          <div className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition">
            <Navigation className="h-6 w-6 stroke-[1.8]" />
            <div className="leading-none text-left">
              <span className="block text-sm font-bold tracking-tight text-slate-700 uppercase">Logimovil</span>
              <span className="text-[10px] tracking-wider text-slate-400">SOLUCIONES</span>
            </div>
          </div>

          {/* Logo 6: Pacífico Cargo */}
          <div className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition">
            <Shield className="h-6 w-6 stroke-[1.8]" />
            <div className="leading-none text-left">
              <span className="block text-sm font-bold tracking-tight text-slate-700 uppercase">Pacífico Cargo</span>
              <span className="text-[10px] tracking-wider text-slate-400">TRANSPORTE</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

