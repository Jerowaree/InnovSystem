import { getAuthorizedCompanyForSunatRequest } from "@/app/api/sunat/sire/_lib/companyAccess";
import { privateJson, toPublicErrorMessage } from "@/app/api/sunat/sire/_lib/http";
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
      error: toPublicErrorMessage(
        error,
        "No pudimos cargar el historial de tickets en este momento. Vuelve a intentarlo en unos segundos."
      ),
      retryable: true,
    }, { status: 503 });
  }
}
