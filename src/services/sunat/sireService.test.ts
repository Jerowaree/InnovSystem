import {
  saveSireConfigForCompany,
  toFriendlySunatMessage,
  validateSireConfigPayload,
} from "@/services/sunat/sireService";
import {
  getSunatSireConfigByCompanyIdServer,
  upsertSunatSireConfigServer,
} from "@/services/server/repositories/sunatSireConfigRepository";
import { decryptSecret } from "@/lib/server/secretCipher";
import type { SunatSireConfig } from "@/types/db";
import type { SireConfigFormData } from "@/types/sire";

jest.mock("@/services/server/repositories/sunatSireConfigRepository", () => ({
  getSunatSireConfigByCompanyIdServer: jest.fn(),
  updateSunatSireConfigTestResultServer: jest.fn(),
  upsertSunatSireConfigServer: jest.fn(),
}));

jest.mock("@/services/server/repositories/sunatSireSalesTicketRepository", () => ({
  getSunatSireSalesTicketByCompanyAndNumberServer: jest.fn(),
  upsertSunatSireSalesTicketServer: jest.fn(),
}));

const mockedGetSunatSireConfigByCompanyIdServer = jest.mocked(
  getSunatSireConfigByCompanyIdServer
);
const mockedUpsertSunatSireConfigServer = jest.mocked(
  upsertSunatSireConfigServer
);

const validPayload: SireConfigFormData = {
  ruc: "20123456789",
  solUser: "MODDATOS",
  solPassword: "sol-password-123",
  clientId: "4334e440-4f1c-4d49-9645-ef0f528c9c87",
  clientSecret: "myC6GNsFv0amz2gy8r5Zrw==",
  securityBaseUrl: "https://api-seguridad.sunat.gob.pe",
  apiBaseUrl: "https://api-sire.sunat.gob.pe",
};

const storedConfig: SunatSireConfig = {
  id: "cfg-1",
  company_id: "company-123",
  ruc: "20123456789",
  sol_user: "MODDATOS",
  sol_password_encrypted: "encrypted-sol-password",
  client_id: "4334e440-4f1c-4d49-9645-ef0f528c9c87",
  client_secret_encrypted: "encrypted-client-secret",
  security_base_url: "https://api-seguridad.sunat.gob.pe",
  api_base_url: "https://api-sire.sunat.gob.pe",
  last_tested_at: null,
  last_test_status: null,
  last_test_message: null,
  created_at: "2026-06-22T10:00:00.000Z",
  updated_at: "2026-06-22T10:05:00.000Z",
};

describe("validateSireConfigPayload", () => {
  beforeEach(() => {
    process.env.SUNAT_CREDENTIALS_MASTER_KEY = "test-master-key";
    jest.clearAllMocks();
  });

  it("normaliza y acepta un payload valido del formulario SUNAT", async () => {
    const result = await validateSireConfigPayload(
      {
        ...validPayload,
        ruc: " 20123456789 ",
        solUser: " MODDATOS ",
        clientId: " 4334e440-4f1c-4d49-9645-ef0f528c9c87 ",
        securityBaseUrl: "https://api-seguridad.sunat.gob.pe/",
        apiBaseUrl: "https://api-sire.sunat.gob.pe/",
      },
      null
    );

    expect(result).toEqual({
      ...validPayload,
      securityBaseUrl: "https://api-seguridad.sunat.gob.pe",
      apiBaseUrl: "https://api-sire.sunat.gob.pe",
    });
  });

  it("rechaza un RUC invalido", async () => {
    await expect(
      validateSireConfigPayload(
        {
          ...validPayload,
          ruc: "123",
        },
        null
      )
    ).rejects.toThrow("El RUC debe tener 11 digitos");
  });

  it("rechaza una URL invalida", async () => {
    await expect(
      validateSireConfigPayload(
        {
          ...validPayload,
          apiBaseUrl: "no-es-una-url",
        },
        null
      )
    ).rejects.toThrow("La URL base de SIRE no es valida");
  });

  it("rechaza dominios que no son oficiales de SUNAT", async () => {
    await expect(
      validateSireConfigPayload(
        {
          ...validPayload,
          apiBaseUrl: "https://evil.example.com",
        },
        null
      )
    ).rejects.toThrow(
      "La URL base de SIRE debe apuntar a un dominio oficial de SUNAT."
    );
  });

  it("rechaza URLs sin HTTPS", async () => {
    await expect(
      validateSireConfigPayload(
        {
          ...validPayload,
          securityBaseUrl: "http://api-seguridad.sunat.gob.pe",
        },
        null
      )
    ).rejects.toThrow("La URL de seguridad debe usar HTTPS.");
  });

  it("permite dejar secretos vacios cuando ya existen credenciales guardadas", async () => {
    const result = await validateSireConfigPayload(
      {
        ...validPayload,
        solPassword: "",
        clientSecret: "",
      },
      storedConfig
    );

    expect(result.solPassword).toBe("");
    expect(result.clientSecret).toBe("");
  });

  it("exige los secretos cuando no hay credenciales guardadas", async () => {
    await expect(
      validateSireConfigPayload(
        {
          ...validPayload,
          solPassword: "",
          clientSecret: "",
        },
        null
      )
    ).rejects.toThrow("La clave SOL es obligatorio");
  });
});

describe("saveSireConfigForCompany", () => {
  beforeEach(() => {
    process.env.SUNAT_CREDENTIALS_MASTER_KEY = "test-master-key";
    jest.clearAllMocks();
  });

  it("cifra los secretos antes de persistirlos", async () => {
    mockedGetSunatSireConfigByCompanyIdServer.mockResolvedValue({
      data: null,
      error: null,
    });

    mockedUpsertSunatSireConfigServer.mockImplementation(async (input) => ({
      data: {
        id: "cfg-1",
        company_id: input.company_id,
        ruc: input.ruc,
        sol_user: input.sol_user,
        sol_password_encrypted: input.sol_password_encrypted,
        client_id: input.client_id,
        client_secret_encrypted: input.client_secret_encrypted,
        security_base_url: input.security_base_url,
        api_base_url: input.api_base_url,
        last_tested_at: input.last_tested_at,
        last_test_status: input.last_test_status,
        last_test_message: input.last_test_message,
        created_at: "2026-06-22T10:00:00.000Z",
        updated_at: "2026-06-22T10:05:00.000Z",
      },
      error: null,
    }));

    await saveSireConfigForCompany("company-123", validPayload);

    expect(mockedUpsertSunatSireConfigServer).toHaveBeenCalledTimes(1);
    const persistedPayload =
      mockedUpsertSunatSireConfigServer.mock.calls[0]?.[0];

    expect(persistedPayload).toBeDefined();
    expect(persistedPayload?.sol_password_encrypted).not.toBe(
      validPayload.solPassword
    );
    expect(persistedPayload?.client_secret_encrypted).not.toBe(
      validPayload.clientSecret
    );
    expect(
      decryptSecret(persistedPayload?.sol_password_encrypted ?? "")
    ).toBe(validPayload.solPassword);
    expect(
      decryptSecret(persistedPayload?.client_secret_encrypted ?? "")
    ).toBe(validPayload.clientSecret);
  });
});

describe("toFriendlySunatMessage", () => {
  it("traduce el error de autenticacion de SUNAT a un mensaje entendible", () => {
    expect(toFriendlySunatMessage("Error en la autenticacion del usuario.")).toBe(
      "No pudimos entrar a SUNAT con los datos guardados. Revisa tu RUC, usuario SOL, clave SOL, client ID y client secret. Tambien confirma en SUNAT que tu aplicacion tenga acceso a SIRE Ventas."
    );
  });

  it("deja intactos los mensajes que no reconoce", () => {
    expect(toFriendlySunatMessage("Periodo no disponible")).toBe(
      "Periodo no disponible"
    );
  });

  it("traduce respuestas HTML 401 de SUNAT a un mensaje usable", () => {
    expect(
      toFriendlySunatMessage(
        "<html><head><title>401 Authorization Required</title></head><body></body></html>"
      )
    ).toBe(
      "SUNAT acepto la conexion principal, pero este modulo todavia no esta disponible para tu cuenta o falta habilitarlo en SUNAT."
    );
  });

  it("traduce tickets no encontrados a un mensaje amigable", () => {
    expect(
      toFriendlySunatMessage(
        "Unprocessable Entity - No se encontro el ticket para el periodo consultado"
      )
    ).toBe("No se encontro el ticket para el periodo seleccionado.");
  });
});
