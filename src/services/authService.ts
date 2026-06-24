import { getAuthErrorMessage } from "@/lib/authErrorMessages";
import { supabase } from "@/lib/supabaseClient";

export async function loginUser(email: string, password: string) {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      data: null,
      error: new Error(data.error || "No pudimos iniciar sesion."),
    };
  }

  const session = data.session;

  if (!session?.access_token || !session?.refresh_token) {
    return {
      data: null,
      error: new Error("No pudimos completar el ingreso a tu cuenta."),
    };
  }

  const sessionResult = await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });

  if (sessionResult.error) {
    return {
      data: null,
      error: new Error(getAuthErrorMessage(sessionResult.error.message)),
    };
  }

  return { data: sessionResult.data, error: null };
}

export async function logoutUser() {
  return supabase.auth.signOut();
}

export async function getAuthenticatedUser() {
  return supabase.auth.getUser();
}

export async function sendPasswordResetEmail(email: string) {
  const response = await fetch("/api/forgot-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      data: null,
      error: new Error(data.error || "No pudimos procesar la solicitud."),
    };
  }

  return { data, error: null };
}
