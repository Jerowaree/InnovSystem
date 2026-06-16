"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { logoutUser } from "@/services/authService";

interface DashboardLogoutButtonProps {
  className?: string;
}

export default function DashboardLogoutButton({
  className = "",
}: DashboardLogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

    await logoutUser();

    router.replace("/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-100 hover:text-red-700 disabled:opacity-60 ${className}`}
    >
      <LogOut className="h-4 w-4" />
      {isLoading ? "Saliendo..." : "Cerrar Sesión"}
    </button>
  );
}
