import { NextResponse } from "next/server";
import { getAuthorizedCompanyForSunatRequest } from "@/app/api/sunat/sire/_lib/companyAccess";
import { getSireRceComprasProbeForCompany } from "@/services/sunat/sireService";

export async function GET(request: Request) {
  const access = await getAuthorizedCompanyForSunatRequest(
    request,
    "sunat-sire-test",
    20
  );

  if (!access.ok) {
    return access.response;
  }

  try {
    const probe = await getSireRceComprasProbeForCompany(access.companyId);
    return NextResponse.json(probe);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No pudimos probar el acceso a RCE Compras.",
      },
      { status: 400 }
    );
  }
}
