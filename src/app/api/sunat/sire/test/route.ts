import {
  privateJson,
  readJsonBodyRequest,
  toPublicErrorMessage,
} from "@/app/api/sunat/sire/_lib/http";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { canManageCompanySettings } from "@/services/server/auth/accountLinkingService";
import { assertRateLimit } from "@/services/server/auth/authRateLimitService";
import { getRequestFingerprint } from "@/services/server/auth/requestFingerprint";
import { testSireConnectionForCompany } from "@/services/sunat/sireService";
import type { SireConfigFormData } from "@/types/sire";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return privateJson(
      { error: "Tu sesion termino. Vuelve a ingresar para continuar." },
      { status: 401 }
    );
  }

  const accessResult = await canManageCompanySettings(user.id);

  if (accessResult.error || !accessResult.allowed || !accessResult.data) {
    return privateJson(
      {
        error:
          accessResult.error?.message ||
          "Solo el responsable de la cuenta puede revisar esta conexion con SUNAT.",
      },
      { status: 403 }
    );
  }

  const rateLimitResult = await assertRateLimit({
    action: "sunat-sire-test",
    identifier: getRequestFingerprint(
      request,
      `${user.id}|${accessResult.data.company_id}`
    ),
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimitResult.allowed) {
    return privateJson(
      {
        error:
          rateLimitResult.error?.message ||
          "Hiciste muchas pruebas en poco tiempo. Espera unos minutos e intentalo de nuevo.",
      },
      { status: 429 }
    );
  }

  try {
    const payload = await readJsonBodyRequest<SireConfigFormData>(request, {
      maxBytes: 16 * 1024,
    });
    const status = await testSireConnectionForCompany(
      accessResult.data.company_id,
      payload
    );

    return privateJson(status);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "La solicitud es demasiado grande."
    ) {
      return privateJson({ error: error.message }, { status: 413 });
    }

    const isServerConfigurationError =
      error instanceof Error &&
      error.message.includes("SUNAT_CREDENTIALS_MASTER_KEY");

    if (isServerConfigurationError) {
      console.error("Encriptacion de credenciales de SUNAT faltante", {
        companyId: accessResult.data.company_id,
        error,
      });

      return privateJson(
        {
          error:
            "No pudimos revisar la conexion porque falta una configuracion interna del sistema.",
        },
        { status: 500 }
      );
    }

    const message = toPublicErrorMessage(
      error,
      "No pudimos revisar tu conexion con SUNAT en este momento."
    );

    return privateJson({ error: message }, { status: 400 });
  }
}
