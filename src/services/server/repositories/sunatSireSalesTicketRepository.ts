import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
import type { SunatSireSalesTicket } from "@/types/db";

export async function upsertSunatSireSalesTicketServer(
  ticket: Omit<SunatSireSalesTicket, "id" | "created_at" | "updated_at">
) {
  const timestamp = new Date().toISOString();
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("sunat_sire_sales_tickets")
    .upsert(
      [
        {
          ...ticket,
          updated_at: timestamp,
        },
      ],
      {
        onConflict: "company_id,ticket_number",
      }
    )
    .select("*")
    .single<SunatSireSalesTicket>();

  return { data, error };
}

export async function getSunatSireSalesTicketByCompanyAndNumberServer(
  companyId: string,
  ticketNumber: string
) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("sunat_sire_sales_tickets")
    .select("*")
    .eq("company_id", companyId)
    .eq("ticket_number", ticketNumber)
    .maybeSingle<SunatSireSalesTicket>();

  return { data, error };
}

export async function listSunatSireSalesTicketsByCompanyServer(companyId: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("sunat_sire_sales_tickets")
    .select("*")
    .eq("company_id", companyId)
    .order("updated_at", { ascending: false });

  return {
    data: (data as SunatSireSalesTicket[] | null) ?? [],
    error,
  };
}

export async function listSunatSireSalesTicketsByCompanyPaginatedServer(
  companyId: string,
  input: {
    page: number;
    perPage: number;
  }
) {
  const safePage = Math.max(1, input.page);
  const safePerPage = Math.min(50, Math.max(1, input.perPage));
  const from = (safePage - 1) * safePerPage;
  const to = from + safePerPage - 1;
  const supabase = getSupabaseServerClient();

  const { data, error, count } = await supabase
    .from("sunat_sire_sales_tickets")
    .select("*", { count: "exact" })
    .eq("company_id", companyId)
    .order("updated_at", { ascending: false })
    .range(from, to);

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / safePerPage));

  return {
    data: (data as SunatSireSalesTicket[] | null) ?? [],
    count: totalCount,
    page: safePage,
    perPage: safePerPage,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
    error,
  };
}
