import { getProfileByUserId } from "@/services/userService";
import { supabase } from "@/lib/supabaseClient";

export async function fetchAuthenticatedProfile() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      profile: null,
      error: userError || new Error("Usuario no autenticado"),
    };
  }

  const profileResult = await getProfileByUserId(user.id);

  if (profileResult.error) {
    return { profile: null, error: profileResult.error };
  }

  if (!profileResult.data) {
    return {
      profile: null,
      error: new Error("Perfil de usuario no encontrado"),
    };
  }

  return { profile: profileResult.data, user };
}
