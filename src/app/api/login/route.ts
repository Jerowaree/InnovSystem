import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthErrorMessage } from "@/lib/authErrorMessages";
import { assertRateLimit } from "@/services/server/auth/authRateLimitService";
import { getRequestFingerprint } from "@/services/server/auth/requestFingerprint";

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "No pudimos procesar el ingreso en este momento." },
      { status: 500 }
    );
  }

  const body = await request.json();
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Ingresa tu correo y tu contrasena para continuar." },
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

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const result = await supabase.auth.signInWithPassword({ email, password });

  if (result.error || !result.data.session) {
    return NextResponse.json(
      {
        error: getAuthErrorMessage(result.error?.message),
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    session: {
      access_token: result.data.session.access_token,
      refresh_token: result.data.session.refresh_token,
    },
  });
}
