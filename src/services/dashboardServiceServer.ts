import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { getAuthorizedProfileForUser } from "@/services/server/auth/accountLinkingService";
import { getStoredSireSalesDatasetForCompany } from "@/services/sunat/sireService";
import type { Company, Movement, Profile, Report } from "@/types/db";
import type { User } from "@supabase/supabase-js";

export interface DashboardDataSource {
  hasDatabaseMovements: boolean;
  hasDatabaseReports: boolean;
  usesSireProposalData: boolean;
  sirePeriodCodes: string[];
}

export interface DashboardData {
  user: User;
  profile: Profile;
  company: Company;
  movements: Movement[];
  reports: Report[];
  source: DashboardDataSource;
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
        new Error("No se encontro un perfil autorizado para este usuario"),
    };
  }

  const companyId = profileResult.data.company_id;
  const [companyResult, movementsResult, reportsResult] = await Promise.all([
    supabase
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .maybeSingle<Company>(),
    supabase
      .from("movements")
      .select("*")
      .eq("company_id", companyId)
      .order("movement_date", { ascending: false }),
    supabase
      .from("reports")
      .select("*")
      .eq("company_id", companyId)
      .order("generated_at", { ascending: false }),
  ]);

  if (companyResult.error || !companyResult.data) {
    return {
      data: null,
      error:
        companyResult.error ||
        new Error("No se encontro la empresa asociada a este usuario"),
    };
  }

  if (movementsResult.error) {
    return { data: null, error: movementsResult.error };
  }

  if (reportsResult.error) {
    return { data: null, error: reportsResult.error };
  }

  const databaseMovements = (movementsResult.data as Movement[] | null) ?? [];
  const databaseReports = (reportsResult.data as Report[] | null) ?? [];
  let movements = databaseMovements;
  let reports = databaseReports;
  let usesSireProposalData = false;
  let sirePeriodCodes: string[] = [];

  if (databaseMovements.length === 0 || databaseReports.length === 0) {
    try {
      const sireDataset = await getStoredSireSalesDatasetForCompany(companyId);
      sirePeriodCodes = sireDataset.periods;

      if (databaseMovements.length === 0 && sireDataset.movements.length > 0) {
        movements = sireDataset.movements;
        usesSireProposalData = true;
      }

      if (databaseReports.length === 0 && sireDataset.reports.length > 0) {
        reports = sireDataset.reports;
        usesSireProposalData = true;
      }
    } catch (error) {
      console.error("Failed to load cached SIRE proposal data for dashboard", {
        companyId,
        error,
      });
    }
  }

  return {
    data: {
      user,
      profile: profileResult.data,
      company: companyResult.data,
      movements,
      reports,
      source: {
        hasDatabaseMovements: databaseMovements.length > 0,
        hasDatabaseReports: databaseReports.length > 0,
        usesSireProposalData,
        sirePeriodCodes,
      },
    },
    error: null,
  };
}
