import { NextResponse } from "next/server";
import { getAuthErrorMessage } from "@/lib/authErrorMessages";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { readJsonBody } from "@/lib/readJsonBody";
import { assertRateLimit } from "@/services/server/auth/authRateLimitService";
import { getRequestFingerprint } from "@/services/server/auth/requestFingerprint";

export async function POST(request: Request) {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.json(
      { error: "No pudimos procesar el ingreso en este momento." },
      { status: 500 }
    );
  }

  const bodyResult = await readJsonBody<{
    email?: unknown;
    password?: unknown;
  }>(request);

  if (!bodyResult.ok) {
    return NextResponse.json({ error: bodyResult.error }, { status: 400 });
  }

  const body = bodyResult.data;
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Ingresa tu correo y tu contraseña para continuar." },
      { status: 400 }
    );
  }

  const rateLimitResult = await assertRateLimit({
    action: "login",
    identifier: getRequestFingerprint(request, email),
    limit: 5,
    windowMs: 5 * 60 * 1000,
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error:
          rateLimitResult.error?.message ||
          "Demasiados intentos. Intenta nuevamente.",
      },
      { status: 429 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const result = await supabase.auth.signInWithPassword({ email, password });

  if (result.error || !result.data.user) {
    return NextResponse.json(
      {
        error: getAuthErrorMessage(result.error?.message),
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    user: {
      id: result.data.user.id,
      email: result.data.user.email ?? email,
    },
  });
}
