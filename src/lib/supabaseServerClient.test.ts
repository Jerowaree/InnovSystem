jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({ marker: "supabase-client" })),
}));

describe("getSupabaseServerClient", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("no falla al importar el modulo sin variables de entorno", async () => {
    await expect(import("@/lib/supabaseServerClient")).resolves.toBeTruthy();
  });

  it("falla solo cuando se intenta inicializar sin configuracion", async () => {
    const { getSupabaseServerClient } = await import("@/lib/supabaseServerClient");

    expect(() => getSupabaseServerClient()).toThrow(
      "Falta configurar Supabase en el servidor. Define NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY."
    );
  });

  it("crea el cliente una sola vez y lo reutiliza", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://demo.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";

    const { createClient } = await import("@supabase/supabase-js");
    const { getSupabaseServerClient } = await import(
      "@/lib/supabaseServerClient"
    );

    const first = getSupabaseServerClient();
    const second = getSupabaseServerClient();

    expect(first).toBe(second);
    expect(createClient).toHaveBeenCalledTimes(1);
  });
});
