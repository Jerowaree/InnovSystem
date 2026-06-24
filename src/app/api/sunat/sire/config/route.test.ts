import { PUT } from "@/app/api/sunat/sire/config/route";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { assertRateLimit } from "@/services/server/auth/authRateLimitService";
import { canManageCompanySettings, getAuthorizedProfileForUser } from "@/services/server/auth/accountLinkingService";
import { saveSireConfigForCompany } from "@/services/sunat/sireService";
import type { SireConfigFormData, SireConfigSummary } from "@/types/sire";

jest.mock("@/lib/supabaseServer", () => ({
  createSupabaseServerClient: jest.fn(),
}));

jest.mock("@/services/server/auth/accountLinkingService", () => ({
  canManageCompanySettings: jest.fn(),
  getAuthorizedProfileForUser: jest.fn(),
}));

jest.mock("@/services/server/auth/authRateLimitService", () => ({
  assertRateLimit: jest.fn(),
}));

jest.mock("@/services/sunat/sireService", () => ({
  getSireConfigSummary: jest.fn(),
  saveSireConfigForCompany: jest.fn(),
}));

const mockedCreateSupabaseServerClient = jest.mocked(createSupabaseServerClient);
const mockedGetAuthorizedProfileForUser = jest.mocked(
  getAuthorizedProfileForUser
);
const mockedCanManageCompanySettings = jest.mocked(canManageCompanySettings);
const mockedAssertRateLimit = jest.mocked(assertRateLimit);
const mockedSaveSireConfigForCompany = jest.mocked(saveSireConfigForCompany);

const formPayload: SireConfigFormData = {
  ruc: "20123456789",
  solUser: "MODDATOS",
  solPassword: "sol-password-123",
  clientId: "4334e440-4f1c-4d49-9645-ef0f528c9c87",
  clientSecret: "myC6GNsFv0amz2gy8r5Zrw==",
  securityBaseUrl: "https://api-seguridad.sunat.gob.pe",
  apiBaseUrl: "https://api-sire.sunat.gob.pe",
};

const savedConfig: SireConfigSummary = {
  id: "cfg-1",
  companyId: "company-123",
  ruc: formPayload.ruc,
  solUser: formPayload.solUser,
  clientId: formPayload.clientId,
  securityBaseUrl: formPayload.securityBaseUrl,
  apiBaseUrl: formPayload.apiBaseUrl,
  hasSolPassword: true,
  hasClientSecret: true,
  createdAt: "2026-06-22T10:00:00.000Z",
  updatedAt: "2026-06-22T10:05:00.000Z",
  lastTestedAt: null,
  lastTestStatus: null,
  lastTestMessage: null,
};

describe("PUT /api/sunat/sire/config", () => {
  beforeEach(() => {
    mockedCreateSupabaseServerClient.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: {
            user: {
              id: "user-123",
            },
          },
          error: null,
        }),
      },
    } as never);

    mockedGetAuthorizedProfileForUser.mockResolvedValue({
      data: {
        company_id: "company-123",
      },
      error: null,
    } as never);

    mockedCanManageCompanySettings.mockResolvedValue({
      allowed: true,
      error: null,
      data: {
        company_id: "company-123",
        role: "admin",
      },
    } as never);

    mockedAssertRateLimit.mockResolvedValue({
      allowed: true,
      error: null,
    });
  });

  it("recibe el payload del formulario SUNAT y lo envia al servicio de guardado", async () => {
    mockedSaveSireConfigForCompany.mockResolvedValue(savedConfig);

    const request = new Request("http://localhost/api/sunat/sire/config", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formPayload),
    });

    const response = await PUT(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockedSaveSireConfigForCompany).toHaveBeenCalledWith(
      "company-123",
      formPayload
    );
    expect(body).toEqual({ config: savedConfig });
  });

  it("devuelve 403 si el usuario no puede administrar credenciales", async () => {
    mockedCanManageCompanySettings.mockResolvedValue({
      allowed: false,
      error: new Error(
        "Solo los administradores pueden modificar las credenciales de SUNAT."
      ),
      data: null,
    } as never);

    const request = new Request("http://localhost/api/sunat/sire/config", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formPayload),
    });

    const response = await PUT(request);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body).toEqual({
      error:
        "Solo los administradores pueden modificar las credenciales de SUNAT.",
    });
  });

  it("devuelve 429 cuando supera el rate limit", async () => {
    mockedAssertRateLimit.mockResolvedValue({
      allowed: false,
      error: new Error("Demasiados intentos. Intenta de nuevo en unos minutos."),
    });

    const request = new Request("http://localhost/api/sunat/sire/config", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formPayload),
    });

    const response = await PUT(request);
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body).toEqual({
      error: "Demasiados intentos. Intenta de nuevo en unos minutos.",
    });
  });

  it("devuelve 400 cuando el payload falla en la capa de servicio", async () => {
    mockedSaveSireConfigForCompany.mockRejectedValue(
      new Error("El RUC debe tener 11 digitos.")
    );

    const request = new Request("http://localhost/api/sunat/sire/config", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...formPayload,
        ruc: "123",
      }),
    });

    const response = await PUT(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "El RUC debe tener 11 digitos." });
  });

  it("devuelve 413 cuando el body supera el limite permitido", async () => {
    const hugePayload = JSON.stringify({
      ...formPayload,
      clientSecret: "x".repeat(20_000),
    });

    const request = new Request("http://localhost/api/sunat/sire/config", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: hugePayload,
    });

    const response = await PUT(request);
    const body = await response.json();

    expect(response.status).toBe(413);
    expect(body).toEqual({ error: "La solicitud es demasiado grande." });
    expect(mockedSaveSireConfigForCompany).not.toHaveBeenCalled();
  });
});
