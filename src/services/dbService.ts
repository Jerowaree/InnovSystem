import { supabase } from "@/lib/supabaseClient";
import type { Company, Profile, Movement } from "@/types/db";

export async function queryCompanies() {
  return supabase.from("companies").select("*");
}

export async function getCompanyById(companyId: string) {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .single<Company>();

  return { data, error };
}

export async function getCompanyByRuc(ruc: string) {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("ruc", ruc)
    .single<Company>();

  return { data, error };
}

export async function createCompanyRecord(
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

export async function queryProfiles() {
  return supabase.from("profiles").select("*");
}

export async function getProfileByUserId(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle<Profile>();

  return { data, error };
}

export async function createProfileRecord(
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

export async function queryMovementsByCompany(companyId: string) {
  return supabase
    .from("movements")
    .select("*")
    .eq("company_id", companyId)
    .order("movement_date", { ascending: false });
}

export async function getMovementsByCompanyId(companyId: string) {
  const { data, error } = await queryMovementsByCompany(companyId);

  return { data: data as Movement[] | null, error };
}

export async function createMovementRecord(
  movement: Omit<Movement, "id" | "created_at">
) {
  const { data, error } = await supabase
    .from("movements")
    .insert([{ ...movement, created_at: new Date().toISOString() }])
    .select()
    .single<Movement>();

  return { data, error };
}
