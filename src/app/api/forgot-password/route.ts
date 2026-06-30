import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { readJsonBody } from "@/lib/readJsonBody";
import { assertRateLimit } from "@/services/server/auth/authRateLimitService";
import { getRequestFingerprint } from "@/services/server/auth/requestFingerprint";

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "No pudimos procesar la solicitud." },
      { status: 500 }
    );
  }

  const bodyResult = await readJsonBody<{ email?: unknown }>(
    request,
    "No pudimos leer el correo enviado. Revisa el formulario y vuelve a intentarlo."
  );

  if (!bodyResult.ok) {
    return NextResponse.json({ error: bodyResult.error }, { status: 400 });
  }

  const body = bodyResult.data;
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email) {
    return NextResponse.json(
      { error: "El correo es obligatorio." },
      { status: 400 }
    );
  }

  const rateLimitResult = await assertRateLimit({
    action: "forgot-password",
    identifier: getRequestFingerprint(request, email),
    limit: 3,
    windowMs: 15 * 60 * 1000,
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

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const origin = new URL(request.url).origin;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/login`,
  });

  if (error) {
    console.error("Forgot password request failed", error);

    return NextResponse.json(
      { error: "No pudimos procesar la solicitud." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message:
      "Si el correo existe, recibirás instrucciones para restablecer tu contraseña.",
  });
}
