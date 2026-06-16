import { supabase } from "@/lib/supabaseClient";
import type { Company } from "@/types/db";

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
