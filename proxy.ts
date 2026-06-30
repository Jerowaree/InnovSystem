import type { NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/authProxy";

export async function proxy(request: NextRequest) {
  return updateSupabaseSession(request);
}

export const proxyConfig = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/login/forgot-password",
    "/register",
    "/api/sunat/:path*",
  ],
};
