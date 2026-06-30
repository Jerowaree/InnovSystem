import { LoginPageClient } from "@/components/auth/LoginPageClient";

interface LoginPageProps {
  searchParams: Promise<{
    next?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;

  return <LoginPageClient nextPath={typeof next === "string" ? next : null} />;
}
