import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_PAGE_PATHS = new Set([
  "/login",
  "/register",
  "/login/forgot-password",
]);

const PROTECTED_PAGE_PREFIXES = ["/dashboard"];
const PROTECTED_API_PREFIXES = ["/api/sunat"];

function createAuthRedirectUrl(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);

  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
  }

  return loginUrl;
}

function isProtectedPagePath(pathname: string) {
  return PROTECTED_PAGE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function isProtectedApiPath(pathname: string) {
  return PROTECTED_API_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function isAuthPagePath(pathname: string) {
  return AUTH_PAGE_PATHS.has(pathname);
}

export async function updateSupabaseSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({
      request,
    });
  }

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  if (!user && isProtectedApiPath(pathname)) {
    return NextResponse.json(
      {
        error: "Tu sesion vencio o no pudimos validarla. Vuelve a iniciar sesion para continuar.",
      },
      {
        status: 401,
      }
    );
  }

  if (!user && isProtectedPagePath(pathname)) {
    return NextResponse.redirect(createAuthRedirectUrl(request));
  }

  if (user && isAuthPagePath(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}
