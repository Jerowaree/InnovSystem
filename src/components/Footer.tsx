import { FiFacebook, FiInstagram, FiLinkedin } from "react-icons/fi";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="mt-16 bg-[#071A4E] text-white">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.8fr_1fr_1fr_1fr_1fr_1fr]">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Logo variant="light" />
            </div>
            <p className="max-w-xs text-sm leading-6 text-slate-200">Soluciones para gestión de transporte, reportes financieros y cumplimiento tributario.</p>
            <div className="flex items-center gap-3">
              <a href="#" aria-label="Facebook" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-100 transition hover:bg-white/10 hover:text-white">
                <FiFacebook className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Instagram" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-100 transition hover:bg-white/10 hover:text-white">
                <FiInstagram className="h-5 w-5" />
              </a>
              <a href="#" aria-label="LinkedIn" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-100 transition hover:bg-white/10 hover:text-white">
                <FiLinkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.24em] text-white/95">Producto</p>
            <ul className="space-y-3 text-sm text-slate-300">
              <li><a href="#" className="transition hover:text-white">Dashboard</a></li>
              <li><a href="#" className="transition hover:text-white">Flota</a></li>
              <li><a href="#" className="transition hover:text-white">Viajes</a></li>
              <li><a href="#" className="transition hover:text-white">Reportes</a></li>
            </ul>
          </div>

          <div>
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.24em] text-white/95">Soluciones</p>
            <ul className="space-y-3 text-sm text-slate-300">
              <li><a href="#" className="transition hover:text-white">Transporte de carga</a></li>
              <li><a href="#" className="transition hover:text-white">Distribución</a></li>
              <li><a href="#" className="transition hover:text-white">Logística</a></li>
              <li><a href="#" className="transition hover:text-white">Empresas 3PL</a></li>
            </ul>
          </div>

          <div>
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.24em] text-white/95">Recursos</p>
            <ul className="space-y-3 text-sm text-slate-300">
              <li><a href="#" className="transition hover:text-white">Centro de ayuda</a></li>
              <li><a href="#" className="transition hover:text-white">Blog</a></li>
              <li><a href="#" className="transition hover:text-white">Guías</a></li>
              <li><a href="#" className="transition hover:text-white">Novedades</a></li>
            </ul>
          </div>

          <div>
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.24em] text-white/95">Empresa</p>
            <ul className="space-y-3 text-sm text-slate-300">
              <li><a href="#" className="transition hover:text-white">Nosotros</a></li>
              <li><a href="#" className="transition hover:text-white">Contacto</a></li>
              <li><a href="#" className="transition hover:text-white">Trabaja con nosotros</a></li>
            </ul>
          </div>

          <div>
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.24em] text-white/95">Legal</p>
            <ul className="space-y-3 text-sm text-slate-300">
              <li><a href="#" className="transition hover:text-white">Política de privacidad</a></li>
              <li><a href="#" className="transition hover:text-white">Términos y condiciones</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-700 pt-6 text-sm text-slate-300 sm:flex sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} InnovSystem Transporte. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
