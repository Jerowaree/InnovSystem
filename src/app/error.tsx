"use client";

import { RouteErrorFallback } from "@/components/errors/RouteErrorFallback";

export default function AppError({
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
      contextLabel="APP_ERROR_BOUNDARY"
      title="No pudimos cargar esta pagina por completo."
      description="Te llevamos a una vista segura para que puedas continuar. Si estabas navegando el sitio, prueba recargar o vuelve al inicio para retomar el flujo."
      primaryActionLabel="Volver al inicio"
      secondaryActionLabel="Ir a login"
      primaryHref="/"
      secondaryHref="/login"
    />
  );
}
