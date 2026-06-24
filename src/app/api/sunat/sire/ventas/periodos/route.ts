import { getAuthorizedCompanyForSunatRequest } from "@/app/api/sunat/sire/_lib/companyAccess";
import {
  privateJson,
  toPublicErrorMessage,
} from "@/app/api/sunat/sire/_lib/http";
import { getSireSalesPeriodsForCompany } from "@/services/sunat/sireService";

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
    const periods = await getSireSalesPeriodsForCompany(access.companyId);
    return privateJson({ periods });
  } catch (error) {
    return privateJson(
      {
        error: toPublicErrorMessage(
          error,
          "No pudimos consultar los periodos de ventas en SUNAT."
        ),
      },
      { status: 400 }
    );
  }
}
