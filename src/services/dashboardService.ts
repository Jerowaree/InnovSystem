import type { Company, Movement, Profile } from "@/types/db";
import type { User } from "@supabase/supabase-js";
import { fetchAuthenticatedProfile } from "@/services/profileService";
import { getCompanyById } from "@/services/companyService";
import { getMovementsByCompanyId } from "@/services/movementService";

export type DashboardData = {
  user: User;
  profile: Profile;
  company: Company;
  movements: Movement[];
};

export async function loadDashboardData() {
  const authResult = await fetchAuthenticatedProfile();

  if (authResult.error || !authResult.profile || !authResult.user) {
    return {
      data: null,
      error: authResult.error || new Error("Usuario no autenticado"),
    };
  }

  const profile = authResult.profile;
  const user = authResult.user;

  const companyResult = await getCompanyById(profile.company_id);
  if (companyResult.error || !companyResult.data) {
    return {
      data: null,
      error: companyResult.error || new Error("Compañía no encontrada"),
    };
  }

  const movementsResult = await getMovementsByCompanyId(profile.company_id);
  if (movementsResult.error) {
    return { data: null, error: movementsResult.error };
  }

  return {
    data: {
      user,
      profile,
      company: companyResult.data,
      movements: movementsResult.data ?? [],
    },
    error: null,
  };
}
