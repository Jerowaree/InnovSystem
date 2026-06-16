"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import AuthLeftPanel from "@/components/AuthLeftPanel";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/schemas/authSchemas";
import { sendPasswordResetEmail } from "@/services/authService";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: yupResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setError(null);
    setMessage(null);

    const { error: resetError } = await sendPasswordResetEmail(data.email);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setMessage("Revisa tu correo para restablecer tu contraseña.");
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="md:w-1/2">
        <div className="min-h-[520px] md:h-screen">
          <AuthLeftPanel
            title="Recupera el acceso a tu cuenta"
            subtitle="Te ayudamos a restablecer tu contraseña para que vuelvas a gestionar tu empresa sin fricciones."
            imageSrc="/trucklogin.png"
            features={[
              "Recibe un enlace seguro en tu correo",
              "Restablece tu contraseña en pocos pasos",
              "Vuelve a ingresar a tu panel rápidamente",
            ]}
          />
        </div>
      </div>

      <div className="flex w-full flex-1 items-center justify-center bg-white p-8 md:h-screen md:w-1/2">
        <div className="w-full max-w-md">
          <h3 className="text-2xl font-semibold text-slate-900">
            Recuperar contraseña
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Ingresa tu correo electrónico y te enviaremos un enlace para
            restablecer tu contraseña.
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

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">
                {message}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                Enviar enlace de recuperación
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Volver a iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
