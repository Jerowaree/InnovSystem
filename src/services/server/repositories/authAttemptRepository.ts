import { supabaseServerClient } from "@/lib/supabaseServerClient";

export async function countRecentAuthAttempts(input: {
  action: string;
  subject: string;
  sinceIso: string;
}) {
  const { count, error } = await supabaseServerClient
    .from("auth_attempts")
    .select("*", { count: "exact", head: true })
    .eq("action", input.action)
    .eq("subject", input.subject)
    .gte("created_at", input.sinceIso);

  return { count: count ?? 0, error };
}

export async function createAuthAttempt(input: {
  action: string;
  subject: string;
}) {
  const { data, error } = await supabaseServerClient
    .from("auth_attempts")
    .insert([
      {
        action: input.action,
        subject: input.subject,
      },
    ])
    .select("*")
    .single();

  return { data, error };
}

export async function deleteOldAuthAttempts(beforeIso: string) {
  const { error } = await supabaseServerClient
    .from("auth_attempts")
    .delete()
    .lt("created_at", beforeIso);

  return { error };
}
