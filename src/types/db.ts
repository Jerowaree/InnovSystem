export type Role = "admin" | "user";

export interface Company {
  id: string;
  ruc: string;
  business_name: string;
  email: string;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  company_id: string;
  full_name: string;
  role: Role;
  created_at: string;
}

export interface Movement {
  id: string;
  company_id: string;
  movement_type: string;
  document_type: string;
  description: string;
  amount: number;
  movement_date: string;
  created_at: string;
}

export interface Report {
  id: string;
  company_id: string;
  report_type: string;
  file_url: string;
  generated_at: string;
}

export interface SunatQuery {
  id: string;
  company_id: string;
  ruc: string;
  response: string;
  queried_at: string;
}
