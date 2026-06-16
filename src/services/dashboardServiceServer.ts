import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { getAuthorizedProfileForUser } from "@/services/server/auth/accountLinkingService";
import type { Company, Movement, Profile, Report } from "@/types/db";
import type { User } from "@supabase/supabase-js";

export interface DashboardData {
  user: User;
  profile: Profile;
  company: Company;
  movements: Movement[];
  reports: Report[];
}

export async function loadDashboardDataServer(): Promise<{
  data: DashboardData | null;
  error: Error | null;
}> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      data: null,
      error: userError || new Error("Usuario no autenticado"),
    };
  }

  const profileResult = await getAuthorizedProfileForUser(user.id);
  if (profileResult.error || !profileResult.data) {
    return {
      data: null,
      error:
        profileResult.error ||
        new Error("No se encontró un perfil autorizado para este usuario"),
    };
  }

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("*")
    .eq("id", profileResult.data.company_id)
    .maybeSingle<Company>();

  if (companyError || !company) {
    return {
      data: null,
      error:
        companyError ||
        new Error("No se encontró la empresa asociada a este usuario"),
    };
  }

  const { data: movements, error: movementsError } = await supabase
    .from("movements")
    .select("*")
    .eq("company_id", profileResult.data.company_id)
    .order("movement_date", { ascending: false });

  if (movementsError) {
    return { data: null, error: movementsError };
  }

  const { data: reports, error: reportsError } = await supabase
    .from("reports")
    .select("*")
    .eq("company_id", profileResult.data.company_id)
    .order("generated_at", { ascending: false });

  if (reportsError) {
    return { data: null, error: reportsError };
  }

  return {
    data: {
      user,
      profile: profileResult.data,
      company,
      movements: (movements as Movement[] | null) ?? [],
      reports: (reports as Report[] | null) ?? [],
    },
    error: null,
  };
}
