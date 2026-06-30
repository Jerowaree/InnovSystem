"use client";

import { RouteErrorFallback } from "@/components/errors/RouteErrorFallback";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorFallback
      error={error}
      reset={reset}
      contextLabel="DASHBOARD_ERROR_BOUNDARY"
      title="El panel encontro un problema temporal."
      description="Tus datos no se pudieron mostrar en este momento, pero tu sesion sigue protegida. Puedes volver al dashboard principal o regresar al inicio mientras reintentamos la carga."
      primaryActionLabel="Volver al dashboard"
      secondaryActionLabel="Ir al inicio"
      primaryHref="/dashboard"
      secondaryHref="/"
    />
  );
}
