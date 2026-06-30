import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedSupabaseServerClient: SupabaseClient | null = null;

function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Falta configurar Supabase en el servidor. Define NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
}

export function getSupabaseServerClient() {
  if (!cachedSupabaseServerClient) {
    cachedSupabaseServerClient = createSupabaseServerClient();
  }

  return cachedSupabaseServerClient;
}
