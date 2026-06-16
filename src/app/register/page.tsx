"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import AuthLeftPanel from "@/components/AuthLeftPanel";
import { canSubmit, pushAttempt } from "@/lib/rateLimit";
import { registerSchema, type RegisterFormValues } from "@/schemas/authSchemas";
import { registerUser } from "@/services/registerService";

const RATE_KEY = "rate_register";

export default function RegisterPage() {
  const router = useRouter();
  const [blocked, setBlocked] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: yupResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormValues) => {
    const check = canSubmit(RATE_KEY);
    if (!check.allowed) {
      setBlocked("Demasiados intentos. Intenta de nuevo en un minuto.");
      return;
    }

    pushAttempt(RATE_KEY);
    setBlocked(null);

    const { error } = await registerUser({
      name: data.name,
      companyName: data.companyName,
      email: data.email,
      password: data.password,
      ruc: data.ruc,
    });

    if (error) {
      setBlocked(error.message);
      return;
    }

    router.push("/login");
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
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

      <div className="flex w-full flex-1 items-center justify-center bg-white p-8 md:h-screen md:w-1/2">
        <div className="w-full max-w-md">
          <h3 className="text-2xl font-semibold text-slate-900">Registro</h3>
          <p className="mt-2 text-sm text-slate-600">
            Completa los datos para crear tu cuenta.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="no-validate mt-6 space-y-4"
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Nombre completo
              </label>
              <input
                {...register("name")}
                className={`w-full rounded-md border px-3 py-2 text-sm ${errors.name ? "border-red-400" : "border-slate-200"}`}
                type="text"
                placeholder="Tu nombre completo"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Nombre de la empresa
              </label>
              <input
                {...register("companyName")}
                className={`w-full rounded-md border px-3 py-2 text-sm ${errors.companyName ? "border-red-400" : "border-slate-200"}`}
                type="text"
                placeholder="Transportes S.A.C."
              />
              {errors.companyName && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.companyName.message}
                </p>
              )}
            </div>

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

            <div className="grid gap-4 sm:grid-cols-2">
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
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    {...register("confirm")}
                    className={`w-full rounded-md border px-3 py-2 pr-11 text-sm ${errors.confirm ? "border-red-400" : "border-slate-200"}`}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="********"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    aria-label={
                      showConfirmPassword
                        ? "Ocultar confirmación de contraseña"
                        : "Mostrar confirmación de contraseña"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirm && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.confirm.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                RUC de la empresa
              </label>
              <input
                {...register("ruc")}
                className={`w-full rounded-md border px-3 py-2 text-sm ${errors.ruc ? "border-red-400" : "border-slate-200"}`}
                type="text"
                placeholder="20123456789"
              />
              {errors.ruc && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.ruc.message}
                </p>
              )}
            </div>

            <div className="flex items-start gap-3">
              <input
                id="terms"
                {...register("accepted")}
                type="checkbox"
                className="h-4 w-4"
              />
              <label htmlFor="terms" className="text-sm text-slate-600">
                Acepto los términos y condiciones
              </label>
            </div>

            {blocked && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                {blocked}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-blue-700 disabled:opacity-60"
              >
                Crear cuenta
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            ¿Ya tienes una cuenta?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
