import { getSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function updateAuthUserMetadataServer(
  userId: string,
  metadata: Record<string, unknown>
) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.auth.admin.updateUserById(
    userId,
    {
      user_metadata: metadata,
    }
  );

  return { data, error };
}

export async function deleteAuthUserServer(userId: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.auth.admin.deleteUser(userId);

  return { data, error };
}
