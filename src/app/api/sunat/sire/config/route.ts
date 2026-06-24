import {
  privateJson,
  readJsonBodyRequest,
  toPublicErrorMessage,
} from "@/app/api/sunat/sire/_lib/http";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import {
  canManageCompanySettings,
  getAuthorizedProfileForUser,
} from "@/services/server/auth/accountLinkingService";
import { assertRateLimit } from "@/services/server/auth/authRateLimitService";
import { getRequestFingerprint } from "@/services/server/auth/requestFingerprint";
import {
  getSireConfigSummary,
  saveSireConfigForCompany,
} from "@/services/sunat/sireService";
import type { SireConfigFormData } from "@/types/sire";

async function getAuthorizedCompanyId() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      companyId: null,
      error: "Tu sesion termino. Vuelve a ingresar para continuar.",
      status: 401,
    };
  }

  const profileResult = await getAuthorizedProfileForUser(user.id);

  if (profileResult.error || !profileResult.data) {
    return {
      companyId: null,
      error: "No pudimos identificar tu empresa en este momento.",
      status: 403,
    };
  }

  return { companyId: profileResult.data.company_id, error: null, status: 200 };
}

export async function GET() {
  const auth = await getAuthorizedCompanyId();

  if (!auth.companyId) {
    return privateJson({ error: auth.error }, { status: auth.status });
  }

  try {
    const config = await getSireConfigSummary(auth.companyId);
    return privateJson({ config });
  } catch (error) {
    console.error("Failed to load SIRE config", error);
    return privateJson(
      { error: "No se pudo cargar la configuracion SIRE." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
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
          "Solo el responsable de la cuenta puede cambiar esta conexion con SUNAT.",
      },
      { status: 403 }
    );
  }

  const rateLimitResult = await assertRateLimit({
    action: "sunat-sire-config",
    identifier: getRequestFingerprint(
      request,
      `${user.id}|${accessResult.data.company_id}`
    ),
    limit: 10,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimitResult.allowed) {
    return privateJson(
      {
        error:
          rateLimitResult.error?.message ||
          "Hiciste muchos intentos en poco tiempo. Espera unos minutos e intentalo de nuevo.",
      },
      { status: 429 }
    );
  }

  try {
    const payload = await readJsonBodyRequest<SireConfigFormData>(request, {
      maxBytes: 16 * 1024,
    });
    const config = await saveSireConfigForCompany(
      accessResult.data.company_id,
      payload
    );

    return privateJson({ config });
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
      console.error("Missing server encryption key for SUNAT credentials", {
        companyId: accessResult.data.company_id,
        error,
      });

      return privateJson(
        {
          error:
            "No pudimos guardar tus datos porque falta una configuracion interna del sistema.",
        },
        { status: 500 }
      );
    }

    const message = toPublicErrorMessage(
      error,
      "No pudimos guardar tus datos de SUNAT. Revisa la informacion ingresada e intentalo nuevamente."
    );

    return privateJson({ error: message }, { status: 400 });
  }
}
