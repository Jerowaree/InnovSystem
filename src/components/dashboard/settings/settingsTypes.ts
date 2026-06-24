import type { UseFormRegister } from "react-hook-form";
import type {
  SireConfigFormData,
  SireConfigSummary,
  SireStatusResponse,
} from "@/types/sire";

export interface SettingsWorkspaceProps {
  data: import("@/services/dashboardServiceServer").DashboardData;
  initialSireConfig: SireConfigSummary | null;
}

export interface InputProps {
  error?: string;
}

export interface PasswordFieldProps extends InputProps {
  id: keyof SireConfigFormData;
  label: string;
  placeholder: string;
  helper?: string;
  visible: boolean;
  onToggleVisibility: () => void;
  register: UseFormRegister<SireConfigFormData>;
}

export type BookCardProps = SireStatusResponse["books"]["rvie"] & {
  title: string;
};
