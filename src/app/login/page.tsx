"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import AuthLeftPanel from "@/components/AuthLeftPanel";
import { canSubmit, pushAttempt } from "@/lib/rateLimit";
import { loginSchema, type LoginFormValues } from "@/schemas/authSchemas";
import { loginUser } from "@/services/authService";

const RATE_KEY = "rate_login";

export default function LoginPage() {
  const router = useRouter();
  const [blocked, setBlocked] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: yupResolver(loginSchema) });

  const onSubmit = async (data: LoginFormValues) => {
    const check = canSubmit(RATE_KEY);
    if (!check.allowed) {
      setBlocked("Demasiados intentos. Intenta de nuevo en un minuto.");
      return;
    }

    pushAttempt(RATE_KEY);
    setBlocked(null);

    const { error } = await loginUser(data.email, data.password);

    if (error) {
      setBlocked(error.message);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
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

      <div className="flex w-full flex-1 items-center justify-center bg-white p-8 md:h-screen md:w-1/2">
        <div className="w-full max-w-md">
          <h3 className="text-2xl font-semibold text-slate-900">
            Iniciar sesión
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Accede a tu cuenta con tu correo electrónico y contraseña.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="no-validate mt-6 space-y-4"
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Correo electrónico
              </label>
              <input
                {...register("email")}
                className={`w-full rounded-md border px-3 py-2 text-sm ${errors.email ? "border-red-400" : "border-slate-200"}`}
                type="email"
                placeholder="tucorreo@empresa.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  className={`w-full rounded-md border px-3 py-2 pr-11 text-sm ${errors.password ? "border-red-400" : "border-slate-200"}`}
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input id="remember" type="checkbox" className="h-4 w-4" />
                <label htmlFor="remember" className="text-sm text-slate-600">
                  Recordarme
                </label>
              </div>
              <Link
                href="/login/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {blocked && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                {blocked}
              </div>
            )}

            <div>
              <button
                disabled={isSubmitting}
                type="submit"
                className="w-full rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                Iniciar sesión
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            ¿No tienes una cuenta?{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
