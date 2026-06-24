import { supabaseServerClient } from "@/lib/supabaseServerClient";
import type { SunatSireConfig } from "@/types/db";

export async function getSunatSireConfigByCompanyIdServer(companyId: string) {
  const { data, error } = await supabaseServerClient
    .from("sunat_sire_configs")
    .select("*")
    .eq("company_id", companyId)
    .maybeSingle<SunatSireConfig>();

  return { data, error };
}

export async function upsertSunatSireConfigServer(
  config: Omit<SunatSireConfig, "id" | "created_at" | "updated_at">
) {
  const timestamp = new Date().toISOString();
  const { data, error } = await supabaseServerClient
    .from("sunat_sire_configs")
    .upsert(
      [
        {
          ...config,
          updated_at: timestamp,
        },
      ],
      {
        onConflict: "company_id",
      }
    )
    .select("*")
    .single<SunatSireConfig>();

  return { data, error };
}

export async function updateSunatSireConfigTestResultServer(input: {
  companyId: string;
  lastTestStatus: "success" | "error";
  lastTestMessage: string;
  lastTestedAt: string;
}) {
  const { data, error } = await supabaseServerClient
    .from("sunat_sire_configs")
    .update({
      last_test_status: input.lastTestStatus,
      last_test_message: input.lastTestMessage,
      last_tested_at: input.lastTestedAt,
      updated_at: input.lastTestedAt,
    })
    .eq("company_id", input.companyId)
    .select("*")
    .single<SunatSireConfig>();

  return { data, error };
}
