import { readJsonBody } from "@/lib/readJsonBody";

describe("readJsonBody", () => {
  it("devuelve el body cuando el JSON es valido", async () => {
    const request = new Request("https://example.com", {
      method: "POST",
      body: JSON.stringify({ email: "demo@example.com" }),
      headers: {
        "content-type": "application/json",
      },
    });

    const result = await readJsonBody<{ email: string }>(request);

    expect(result).toEqual({
      ok: true,
      data: { email: "demo@example.com" },
      error: null,
    });
  });

  it("devuelve un mensaje amigable cuando el JSON es invalido", async () => {
    const request = new Request("https://example.com", {
      method: "POST",
      body: "{ email: }",
      headers: {
        "content-type": "application/json",
      },
    });

    const result = await readJsonBody<{ email: string }>(
      request,
      "No pudimos leer el formulario enviado. Vuelve a intentarlo."
    );

    expect(result).toEqual({
      ok: false,
      data: null,
      error: "No pudimos leer el formulario enviado. Vuelve a intentarlo.",
    });
  });
});
