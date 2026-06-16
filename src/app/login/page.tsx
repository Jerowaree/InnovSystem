"use client";

import Link from "next/link";
import AuthLeftPanel from "@/components/AuthLeftPanel";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const schema = yup.object({
  email: yup.string().required("El correo es obligatorio").email("Correo no válido"),
  password: yup.string().required("La contraseña es obligatoria").min(8, "Mínimo 8 caracteres"),
}).required();

const RATE_KEY = "rate_login";
const RATE_LIMIT = 5; // attempts
const RATE_WINDOW = 60 * 1000; // 1 minute

function canSubmit(key: string) {
  try {
    const raw = localStorage.getItem(key);
    const now = Date.now();
    const arr = raw ? JSON.parse(raw) : [];
    const filtered = arr.filter((t: number) => now - t < RATE_WINDOW);
    return { allowed: filtered.length < RATE_LIMIT, timestamps: filtered };
  } catch (e) {
    return { allowed: true, timestamps: [] };
  }
}

function pushAttempt(key: string) {
  try {
    const now = Date.now();
    const raw = localStorage.getItem(key);
    const arr = raw ? JSON.parse(raw) : [];
    const filtered = arr.filter((t: number) => now - t < RATE_WINDOW);
    filtered.push(now);
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch (e) {}
}

type FormValues = { email: string; password: string };

export default function LoginPage() {
  const [blocked, setBlocked] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: yupResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    const check = canSubmit(RATE_KEY);
    if (!check.allowed) {
      setBlocked("Demasiados intentos. Intenta de nuevo en un minuto.");
      return;
    }

    pushAttempt(RATE_KEY);
    setBlocked(null);

    // Aquí normalmente llamarías a la API (Supabase / auth). En frontend solo hacemos validación.
    console.log("Login form valid — enviar a API:", data);
    // Simular delay
    await new Promise((r) => setTimeout(r, 600));
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="md:w-1/2">
        <div className="min-h-[520px] md:h-screen">
          <AuthLeftPanel
            title="¡Bienvenido de nuevo!"
            subtitle="Inicia sesión para continuar administrando tu empresa de manera eficiente."
            features={[
              "Información segura y actualizada",
              "Sincronización automatizada con SUNAT",
              "Reportes y análisis inteligentes",
            ]}
            imageSrc="/trucklogin.png"
          />
        </div>
      </div>

      <div className="flex w-full flex-1 items-center justify-center bg-white p-8 md:w-1/2 md:h-screen">
        <div className="w-full max-w-md">
          <h3 className="text-2xl font-semibold text-slate-900">Iniciar sesión</h3>
          <p className="mt-2 text-sm text-slate-600">Accede a tu cuenta con tu correo electrónico y contraseña.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4 no-validate">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Correo electrónico</label>
              <input {...register("email")} className={`w-full rounded-md border px-3 py-2 text-sm ${errors.email ? 'border-red-400' : 'border-slate-200'}`} type="email" placeholder="tucorreo@empresa.com" />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Contraseña</label>
              <input {...register("password")} className={`w-full rounded-md border px-3 py-2 text-sm ${errors.password ? 'border-red-400' : 'border-slate-200'}`} type="password" placeholder="********" />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input id="remember" type="checkbox" className="h-4 w-4" />
                <label htmlFor="remember" className="text-sm text-slate-600">Recordarme</label>
              </div>
              <a href="/" className="text-sm text-blue-600 hover:text-blue-700">¿Olvidaste tu contraseña?</a>
            </div>

            {blocked && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{blocked}</div>}

            <div>
              <button disabled={isSubmitting} type="submit" className="w-full rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">Iniciar sesión</button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">¿No tienes una cuenta? <Link href="/register" className="text-blue-600 font-semibold hover:text-blue-700">Crear cuenta</Link></div>
        </div>
      </div>
    </div>
  );
}
