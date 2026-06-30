import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { getAuthorizedProfileForUser } from "@/services/server/auth/accountLinkingService";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const profileResult = await getAuthorizedProfileForUser(user.id);

  if (profileResult.error || !profileResult.data) {
    redirect("/?access=dashboard-unavailable");
  }

  return children;
}
