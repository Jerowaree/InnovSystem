import { supabaseServerClient } from "@/lib/supabaseServerClient";
import type { Company } from "@/types/db";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeRuc(ruc: string) {
  return ruc.trim();
}

export async function getCompanyByIdServer(companyId: string) {
  const { data, error } = await supabaseServerClient
    .from("companies")
    .select("*")
    .eq("id", companyId)
    .maybeSingle<Company>();

  return { data, error };
}

export async function getCompanyByEmailServer(email: string) {
  const normalizedEmail = normalizeEmail(email);

  const { data, error } = await supabaseServerClient
    .from("companies")
    .select("*")
    .ilike("email", normalizedEmail)
    .maybeSingle<Company>();

  return { data, error };
}

export async function getCompanyByRucServer(ruc: string) {
  const normalizedRuc = normalizeRuc(ruc);

  const { data, error } = await supabaseServerClient
    .from("companies")
    .select("*")
    .eq("ruc", normalizedRuc)
    .maybeSingle<Company>();

  return { data, error };
}

export async function createCompanyServer(
  company: Omit<Company, "id" | "created_at">
) {
  const { data, error } = await supabaseServerClient
    .from("companies")
    .insert([
      {
        ...company,
        email: normalizeEmail(company.email),
        ruc: normalizeRuc(company.ruc),
        created_at: new Date().toISOString(),
      },
    ])
    .select("*")
    .single<Company>();

  return { data, error };
}

export async function deleteCompanyByIdServer(companyId: string) {
  const { error } = await supabaseServerClient
    .from("companies")
    .delete()
    .eq("id", companyId);

  return { error };
}
