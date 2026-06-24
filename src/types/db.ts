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
  customer_name?: string;
  currency_code?: string;
  operation_type?: string;
  taxable_base_amount?: number;
  tax_amount?: number;
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

export interface SunatSireConfig {
  id: string;
  company_id: string;
  ruc: string;
  sol_user: string;
  sol_password_encrypted: string;
  client_id: string;
  client_secret_encrypted: string;
  security_base_url: string;
  api_base_url: string;
  last_tested_at: string | null;
  last_test_status: "success" | "error" | null;
  last_test_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface SunatSireSalesTicket {
  id: string;
  company_id: string;
  periodo: string;
  ticket_number: string;
  file_type_code: "0" | "1";
  process_status: string | null;
  report_file_name: string | null;
  report_file_type_code: string | null;
  last_response: unknown | null;
  created_at: string;
  updated_at: string;
}
