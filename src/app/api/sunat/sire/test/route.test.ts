import { POST } from "@/app/api/sunat/sire/test/route";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { assertRateLimit } from "@/services/server/auth/authRateLimitService";
import { canManageCompanySettings, getAuthorizedProfileForUser } from "@/services/server/auth/accountLinkingService";
import { testSireConnectionForCompany } from "@/services/sunat/sireService";
import type { SireConfigFormData, SireStatusResponse } from "@/types/sire";

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
  testSireConnectionForCompany: jest.fn(),
}));

const mockedCreateSupabaseServerClient = jest.mocked(createSupabaseServerClient);
const mockedGetAuthorizedProfileForUser = jest.mocked(
  getAuthorizedProfileForUser
);
const mockedCanManageCompanySettings = jest.mocked(canManageCompanySettings);
const mockedAssertRateLimit = jest.mocked(assertRateLimit);
const mockedTestSireConnectionForCompany = jest.mocked(
  testSireConnectionForCompany
);

const formPayload: SireConfigFormData = {
  ruc: "20123456789",
  solUser: "MODDATOS",
  solPassword: "sol-password-123",
  clientId: "4334e440-4f1c-4d49-9645-ef0f528c9c87",
  clientSecret: "myC6GNsFv0amz2gy8r5Zrw==",
  securityBaseUrl: "https://api-seguridad.sunat.gob.pe",
  apiBaseUrl: "https://api-sire.sunat.gob.pe",
};

const connectionStatus: SireStatusResponse = {
  configured: true,
  checkedAt: "2026-06-22T11:20:00.000Z",
  message: "Conexion SIRE validada con SUNAT.",
  missingFields: [],
  auth: {
    ok: true,
    message: "Autenticacion correcta.",
  },
  books: {
    rvie: {
      code: "140000",
      ok: true,
      years: 2,
      periods: 24,
      message: "Consulta disponible.",
    },
    rce: {
      code: "080000",
      ok: true,
      years: 2,
      periods: 24,
      message: "Consulta disponible.",
    },
  },
};

describe("POST /api/sunat/sire/test", () => {
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

  it("recibe el payload del formulario y lo envia al servicio de prueba de conexion", async () => {
    mockedTestSireConnectionForCompany.mockResolvedValue(connectionStatus);

    const request = new Request("http://localhost/api/sunat/sire/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formPayload),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockedTestSireConnectionForCompany).toHaveBeenCalledWith(
      "company-123",
      formPayload
    );
    expect(body).toEqual(connectionStatus);
  });

  it("devuelve 403 si el usuario no puede probar credenciales", async () => {
    mockedCanManageCompanySettings.mockResolvedValue({
      allowed: false,
      error: new Error(
        "Solo los administradores pueden modificar las credenciales de SUNAT."
      ),
      data: null,
    } as never);

    const request = new Request("http://localhost/api/sunat/sire/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formPayload),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body).toEqual({
      error:
        "Solo los administradores pueden modificar las credenciales de SUNAT.",
    });
  });

  it("devuelve 413 cuando el body supera el limite permitido", async () => {
    const hugePayload = JSON.stringify({
      ...formPayload,
      clientSecret: "x".repeat(20_000),
    });

    const request = new Request("http://localhost/api/sunat/sire/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: hugePayload,
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(413);
    expect(body).toEqual({ error: "La solicitud es demasiado grande." });
    expect(mockedTestSireConnectionForCompany).not.toHaveBeenCalled();
  });
});
