import { supabase } from "@/lib/supabaseClient";
import type { Movement } from "@/types/db";

export async function getMovementsByCompanyId(companyId: string) {
  const { data, error } = await supabase
    .from("movements")
    .select("*")
    .eq("company_id", companyId)
    .order("movement_date", { ascending: false });

  return { data: data as Movement[] | null, error };
}

export async function createMovement(
  movement: Omit<Movement, "id" | "created_at">
) {
  const { data, error } = await supabase
    .from("movements")
    .insert([{ ...movement, created_at: new Date().toISOString() }])
    .select()
    .single<Movement>();

  return { data, error };
}
