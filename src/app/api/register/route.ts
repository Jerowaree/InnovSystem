import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthErrorMessage } from "@/lib/authErrorMessages";
import { getPublicServerErrorMessage } from "@/lib/publicErrorMessages";
import { assertRateLimit } from "@/services/server/auth/authRateLimitService";
import { getRequestFingerprint } from "@/services/server/auth/requestFingerprint";
import { provisionCompanyAndProfileForUser } from "@/services/server/auth/accountLinkingService";
import { deleteAuthUserServer } from "@/services/server/repositories/authUserAdminRepository";
import {
  getCompanyByEmailServer,
  getCompanyByRucServer,
} from "@/services/server/repositories/companyRepository";

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const body = await request.json();
  const { name, companyName, email, password, ruc } = body;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "No pudimos habilitar el registro en este momento." },
      { status: 500 }
    );
  }

  if (!name || !companyName || !email || !password || !ruc) {
    return NextResponse.json(
      { error: "Completa todos los datos para crear tu cuenta." },
      { status: 400 }
    );
  }

  const normalizedEmail =
    typeof email === "string" ? email.trim().toLowerCase() : "";
  const normalizedRuc = typeof ruc === "string" ? ruc.trim() : "";
  const normalizedName = typeof name === "string" ? name.trim() : "";
  const normalizedCompanyName =
    typeof companyName === "string" ? companyName.trim() : "";

  if (!/^\d{11}$/.test(normalizedRuc)) {
    return NextResponse.json(
      { error: "El RUC debe tener 11 digitos." },
      { status: 400 }
    );
  }

  if (normalizedName.length < 2 || normalizedCompanyName.length < 2) {
    return NextResponse.json(
      { error: "Revisa los datos ingresados e intentalo nuevamente." },
      { status: 400 }
    );
  }

  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "La contrasena debe tener al menos 8 caracteres." },
      { status: 400 }
    );
  }

  const rateLimitResult = await assertRateLimit({
    action: "register",
    identifier: getRequestFingerprint(
      request,
      `${normalizedEmail}|${normalizedRuc}`
    ),
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

  const existingCompanyByRucResult = await getCompanyByRucServer(normalizedRuc);
  if (existingCompanyByRucResult.error) {
    console.error(
      "Failed to validate existing company by RUC",
      existingCompanyByRucResult.error
    );

    return NextResponse.json(
      { error: getPublicServerErrorMessage() },
      { status: 500 }
    );
  }

  if (existingCompanyByRucResult.data) {
    return NextResponse.json(
      {
        error:
          "Este RUC ya se encuentra registrado. Solicita acceso a un administrador.",
      },
      { status: 409 }
    );
  }

  const existingCompanyByEmailResult =
    await getCompanyByEmailServer(normalizedEmail);
  if (existingCompanyByEmailResult.error) {
    console.error(
      "Failed to validate existing company by email",
      existingCompanyByEmailResult.error
    );

    return NextResponse.json(
      { error: getPublicServerErrorMessage() },
      { status: 500 }
    );
  }

  if (existingCompanyByEmailResult.data) {
    return NextResponse.json(
      {
        error: "Este correo ya esta asociado a una empresa registrada.",
      },
      { status: 409 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: {
        full_name: normalizedName,
        company_ruc: normalizedRuc,
      },
    },
  });

  if (error) {
    return NextResponse.json(
      { error: getAuthErrorMessage(error.message) },
      { status: 400 }
    );
  }

  const userId = data.user?.id;

  if (!userId) {
    return NextResponse.json(
      { error: "No pudimos crear tu cuenta en este momento." },
      { status: 500 }
    );
  }

  const provisioningResult = await provisionCompanyAndProfileForUser({
    userId,
    fullName: normalizedName,
    companyName: normalizedCompanyName,
    email: normalizedEmail,
    ruc: normalizedRuc,
  });

  if (provisioningResult.error || !provisioningResult.data) {
    const deleteUserResult = await deleteAuthUserServer(userId);
    if (deleteUserResult.error) {
      console.error("Failed to cleanup auth user after register error", {
        userId,
        error: deleteUserResult.error,
      });
    }

    console.error("Failed to provision company/profile during register", {
      email: normalizedEmail,
      ruc: normalizedRuc,
      error: provisioningResult.error,
    });

    return NextResponse.json(
      {
        error: getPublicServerErrorMessage(),
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    user: data.user,
    profile: provisioningResult.data,
  });
}
