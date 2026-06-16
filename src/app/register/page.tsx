"use client";

import Link from "next/link";
import AuthLeftPanel from "@/components/AuthLeftPanel";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const schema = yup.object({
  name: yup.string().required("El nombre es obligatorio").min(2, "Nombre muy corto"),
  email: yup.string().required("El correo es obligatorio").email("Correo no válido"),
  password: yup.string().required("La contraseña es obligatoria").min(8, "Mínimo 8 caracteres"),
  confirm: yup.string().oneOf([yup.ref('password')], 'Las contraseñas no coinciden').required('Confirmar contraseña es obligatorio'),
  ruc: yup.string().required('RUC es obligatorio').matches(/^\d{11}$/, 'RUC debe tener 11 dígitos'),
  accepted: yup.boolean().oneOf([true], 'Debes aceptar los términos'),
}).required();

const RATE_KEY = "rate_register";
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

type FormValues = { name: string; email: string; password: string; confirm: string; ruc: string; accepted: boolean };

export default function RegisterPage() {
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

    // Aquí normalmente llamarías a la API para registrar al usuario.
    console.log("Register form valid — enviar a API:", data);
    await new Promise((r) => setTimeout(r, 600));
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="md:w-1/2">
        <div className="min-h-[520px] md:h-screen">
          <AuthLeftPanel
            title="Crea tu cuenta"
            subtitle="Registra tu empresa y administra tu operación con datos claros y reportes al instante."
            imageSrc="/truckregister.png"
            features={[
              "Accede a tu panel de gestión empresarial",
              "Crea reportes en Excel y PDF",
              "Consulta información oficial desde SUNAT",
            ]}
          />
        </div>
      </div>

      <div className="flex w-full flex-1 items-center justify-center bg-white p-8 md:w-1/2 md:h-screen">
        <div className="w-full max-w-md">
          <h3 className="text-2xl font-semibold text-slate-900">Registro</h3>
          <p className="mt-2 text-sm text-slate-600">Completa los datos para crear tu cuenta.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4 no-validate">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Nombre completo</label>
              <input {...register('name')} className={`w-full rounded-md border px-3 py-2 text-sm ${errors.name ? 'border-red-400' : 'border-slate-200'}`} type="text" placeholder="Tu nombre completo" />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Correo electrónico</label>
              <input {...register('email')} className={`w-full rounded-md border px-3 py-2 text-sm ${errors.email ? 'border-red-400' : 'border-slate-200'}`} type="email" placeholder="tucorreo@empresa.com" />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Contraseña</label>
                <input {...register('password')} className={`w-full rounded-md border px-3 py-2 text-sm ${errors.password ? 'border-red-400' : 'border-slate-200'}`} type="password" placeholder="********" />
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Confirmar contraseña</label>
                <input {...register('confirm')} className={`w-full rounded-md border px-3 py-2 text-sm ${errors.confirm ? 'border-red-400' : 'border-slate-200'}`} type="password" placeholder="********" />
                {errors.confirm && <p className="mt-1 text-xs text-red-600">{errors.confirm.message}</p>}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">RUC de la empresa</label>
              <input {...register('ruc')} className={`w-full rounded-md border px-3 py-2 text-sm ${errors.ruc ? 'border-red-400' : 'border-slate-200'}`} type="text" placeholder="20123456789" />
              {errors.ruc && <p className="mt-1 text-xs text-red-600">{errors.ruc.message}</p>}
            </div>

            <div className="flex items-start gap-3">
              <input id="terms" {...register('accepted')} type="checkbox" className="h-4 w-4" />
              <label htmlFor="terms" className="text-sm text-slate-600">Acepto los términos y condiciones</label>
            </div>

            {blocked && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{blocked}</div>}

            <div>
              <button type="submit" disabled={isSubmitting} className="w-full rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">Crear cuenta</button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">¿Ya tienes una cuenta? <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-700">Iniciar sesión</Link></div>
        </div>
      </div>
    </div>
  );
}
