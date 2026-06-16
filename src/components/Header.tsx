"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Logo from "@/components/Logo";

const navItems = ["Características", "Soluciones", "Beneficios", "Recursos"];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-8">
        <div className="flex items-center gap-3">
          <Logo />
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="inline-flex items-center text-sm leading-none font-medium text-slate-700 transition hover:text-slate-950"
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="button-primary inline-flex min-w-[160px] items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition"
          >
            Comenzar ahora
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-sm md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-200 bg-white/95 md:hidden">
          <div className="flex flex-col gap-4 px-6 py-4">
            {navItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-base font-medium text-slate-700 transition hover:text-slate-950"
              >
                {item}
              </a>
            ))}
            <a
              href="#"
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Recursos
            </a>
            <Link
              className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              href="/login"
            >
              Iniciar sesión
            </Link>
            <Link
              className="button-primary inline-flex min-w-[160px] items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition"
              href="/register"
            >
              Comenzar ahora
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
