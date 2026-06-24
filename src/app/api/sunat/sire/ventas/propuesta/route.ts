import {
  privateJson,
  readJsonBodyRequest,
  toPublicErrorMessage,
} from "@/app/api/sunat/sire/_lib/http";
import { getAuthorizedCompanyForSunatRequest } from "@/app/api/sunat/sire/_lib/companyAccess";
import { requestSireSalesProposalForCompany } from "@/services/sunat/sireService";
import type { SireSalesProposalRequest } from "@/types/sire";

export async function POST(request: Request) {
  const access = await getAuthorizedCompanyForSunatRequest(
    request,
    "sunat-sire-config",
    60
  );

  if (!access.ok) {
    return access.response;
  }

  try {
    const payload = await readJsonBodyRequest<SireSalesProposalRequest>(
      request,
      { maxBytes: 8 * 1024 }
    );
    const ticket = await requestSireSalesProposalForCompany(
      access.companyId,
      payload
    );

    return privateJson(ticket);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "La solicitud es demasiado grande."
    ) {
      return privateJson({ error: error.message }, { status: 413 });
    }

    return privateJson(
      {
        error: toPublicErrorMessage(
          error,
          "No pudimos solicitar la propuesta de ventas a SUNAT."
        ),
      },
      { status: 400 }
    );
  }
}
