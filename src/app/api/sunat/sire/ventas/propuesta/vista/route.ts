import { getAuthorizedCompanyForSunatRequest } from "@/app/api/sunat/sire/_lib/companyAccess";
import {
  privateJson,
  toPublicErrorMessage,
} from "@/app/api/sunat/sire/_lib/http";
import { getSireSalesProposalPreviewPageForCompany } from "@/services/sunat/sireService";

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
    "sunat-sire-preview",
    1200,
    10 * 60 * 1000
  );

  if (!access.ok) {
    return access.response;
  }

  const { searchParams } = new URL(request.url);
  const periodo = searchParams.get("periodo") ?? "";
  const ticketNumber = searchParams.get("numTicket") ?? "";
  const page = parsePositiveInt(searchParams.get("page"), 1);
  const perPage = parsePositiveInt(searchParams.get("perPage"), 10);
  const query = searchParams.get("query") ?? "";

  try {
    const previewPage = await getSireSalesProposalPreviewPageForCompany(
      access.companyId,
      periodo,
      ticketNumber,
      {
        page,
        perPage,
        query,
      }
    );

    return privateJson({ previewPage });
  } catch (error) {
    return privateJson(
      {
        error: toPublicErrorMessage(
          error,
          "No pudimos preparar la vista previa de la propuesta."
        ),
      },
      { status: 400 }
    );
  }
}
