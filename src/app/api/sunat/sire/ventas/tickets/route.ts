import { getAuthorizedCompanyForSunatRequest } from "@/app/api/sunat/sire/_lib/companyAccess";
import { privateJson } from "@/app/api/sunat/sire/_lib/http";
import { listSireSalesTicketsPageForCompany } from "@/services/sunat/sireService";

function parsePositiveInt(value: string | null, fallback: number) {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return Math.trunc(parsedValue);
}

export async function GET(request: Request) {
  const access = await getAuthorizedCompanyForSunatRequest(
    request,
    "sunat-sire-test",
    300,
    10 * 60 * 1000
  );

  if (!access.ok) {
    return access.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parsePositiveInt(searchParams.get("page"), 1);
    const perPage = parsePositiveInt(searchParams.get("perPage"), 8);
    const historyPage = await listSireSalesTicketsPageForCompany(
      access.companyId,
      {
        page,
        perPage,
      }
    );

    return privateJson(historyPage);
  } catch (error) {
    console.error("Failed to load SIRE sales tickets", {
      companyId: access.companyId,
      error,
    });

    return privateJson({
      tickets: [],
      page: 1,
      perPage: 8,
      totalCount: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  }
}
