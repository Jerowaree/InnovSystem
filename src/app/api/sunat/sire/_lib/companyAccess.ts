import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { canManageCompanySettings } from "@/services/server/auth/accountLinkingService";
import { assertRateLimit } from "@/services/server/auth/authRateLimitService";
import { getRequestFingerprint } from "@/services/server/auth/requestFingerprint";

export async function getAuthorizedCompanyForSunatRequest(
  request: Request,
  action: "sunat-sire-config" | "sunat-sire-test" | "sunat-sire-preview",
  limit: number,
  windowMs = 10 * 60 * 1000
) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Tu sesión terminó. Vuelve a ingresar para continuar." },
        { status: 401 }
      ),
    };
  }

  const accessResult = await canManageCompanySettings(user.id);

  if (accessResult.error || !accessResult.allowed || !accessResult.data) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error:
            accessResult.error?.message ||
            "Solo el responsable de la cuenta puede continuar con esta operación de SUNAT.",
        },
        { status: 403 }
      ),
    };
  }

  const rateLimitResult = await assertRateLimit({
    action,
    identifier: getRequestFingerprint(
      request,
      `${user.id}|${accessResult.data.company_id}`
    ),
    limit,
    windowMs,
  });

  if (!rateLimitResult.allowed) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error:
            rateLimitResult.error?.message ||
            "Hiciste muchos intentos en poco tiempo. Espera unos minutos e inténtalo de nuevo.",
        },
        { status: 429 }
      ),
    };
  }

  return {
    ok: true as const,
    companyId: accessResult.data.company_id,
  };
}
