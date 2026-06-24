import { NextResponse } from "next/server";
import { getAuthorizedCompanyForSunatRequest } from "@/app/api/sunat/sire/_lib/companyAccess";
import {
  privateJson,
  toPublicErrorMessage,
  withPrivateHeaders,
} from "@/app/api/sunat/sire/_lib/http";
import { downloadSireSalesReportForCompany } from "@/services/sunat/sireService";

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
    const file = await downloadSireSalesReportForCompany(
      access.companyId,
      periodo,
      ticketNumber
    );

    return withPrivateHeaders(
      new NextResponse(file.bytes, {
        status: 200,
        headers: {
          "Content-Type": file.contentType,
          ...(file.contentDisposition
            ? { "Content-Disposition": file.contentDisposition }
            : {}),
        },
      })
    );
  } catch (error) {
    return privateJson(
      {
        error: toPublicErrorMessage(
          error,
          "No pudimos descargar el archivo generado por SUNAT."
        ),
      },
      { status: 400 }
    );
  }
}
