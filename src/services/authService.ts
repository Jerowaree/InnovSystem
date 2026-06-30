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

  return { data, error: null };
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
