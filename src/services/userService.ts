import { supabase } from "@/lib/supabaseClient";
import type { Company, Profile, Movement } from "@/types/db";

export async function createCompany(
  company: Omit<Company, "id" | "created_at">
) {
  const { data, error } = await supabase
    .from("companies")
    .insert([
      {
        ...company,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single<Company>();

  return { data, error };
}

export async function createProfile(
  profile: Omit<Profile, "id" | "created_at">
) {
  const { data, error } = await supabase
    .from("profiles")
    .insert([
      {
        ...profile,
        role: profile.role ?? "user",
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single<Profile>();

  return { data, error };
}

export async function getProfileByUserId(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle<Profile>();

  return { data, error };
}

export async function getMovementsByCompanyId(companyId: string) {
  const { data, error } = await supabase
    .from("movements")
    .select("*")
    .eq("company_id", companyId);

  return { data: data as Movement[] | null, error };
}
