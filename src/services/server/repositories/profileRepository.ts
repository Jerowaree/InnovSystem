import { supabaseServerClient } from "@/lib/supabaseServerClient";
import type { Profile } from "@/types/db";

export async function getProfileByUserIdServer(userId: string) {
  const { data, error } = await supabaseServerClient
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle<Profile>();

  return { data, error };
}

export async function createProfileServer(
  profile: Omit<Profile, "id" | "created_at">
) {
  const { data, error } = await supabaseServerClient
    .from("profiles")
    .insert([
      {
        ...profile,
        role: profile.role ?? "user",
        created_at: new Date().toISOString(),
      },
    ])
    .select("*")
    .single<Profile>();

  return { data, error };
}

export async function deleteProfileByUserIdServer(userId: string) {
  const { error } = await supabaseServerClient
    .from("profiles")
    .delete()
    .eq("user_id", userId);

  return { error };
}
