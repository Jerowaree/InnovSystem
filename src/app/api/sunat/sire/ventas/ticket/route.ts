import { getAuthorizedCompanyForSunatRequest } from "@/app/api/sunat/sire/_lib/companyAccess";
import {
  privateJson,
  toPublicErrorMessage,
} from "@/app/api/sunat/sire/_lib/http";
import { getSireSalesTicketStatusForCompany } from "@/services/sunat/sireService";

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

  const { searchParams } = new URL(request.url);
  const periodo = searchParams.get("periodo") ?? "";
  const ticketNumber = searchParams.get("numTicket") ?? "";

  try {
    const status = await getSireSalesTicketStatusForCompany(
      access.companyId,
      periodo,
      ticketNumber
    );

    return privateJson(status);
  } catch (error) {
    return privateJson(
      {
        error: toPublicErrorMessage(
          error,
          "No pudimos revisar el estado del ticket en SUNAT."
        ),
      },
      { status: 400 }
    );
  }
}
