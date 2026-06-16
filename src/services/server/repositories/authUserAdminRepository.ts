import { supabaseServerClient } from "@/lib/supabaseServerClient";

export async function updateAuthUserMetadataServer(
  userId: string,
  metadata: Record<string, unknown>
) {
  const { data, error } = await supabaseServerClient.auth.admin.updateUserById(
    userId,
    {
      user_metadata: metadata,
    }
  );

  return { data, error };
}

export async function deleteAuthUserServer(userId: string) {
  const { data, error } =
    await supabaseServerClient.auth.admin.deleteUser(userId);

  return { data, error };
}
