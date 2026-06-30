import { expect, test } from "@playwright/test";
import { requireEnv } from "./helpers/auth";

function createUniqueRegisterData() {
  const timestamp = Date.now();
  const suffix = String(timestamp).slice(-8);

  return {
    name: `QA Transporte ${suffix}`,
    companyName: `InnovSystem E2E ${suffix}`,
    email: `qa+${suffix}@example.com`,
    password: requireEnv("E2E_REGISTER_PASSWORD") ?? "InnovSystem123!",
    ruc: `20${suffix.padStart(9, "0")}`,
  };
}

test.describe("Register", () => {
  test("crea una cuenta nueva y redirige al login", async ({ page }) => {
    test.skip(
      process.env.E2E_RUN_REGISTER !== "true",
      "Define E2E_RUN_REGISTER=true para ejecutar el flujo de registro real."
    );

    const registerData = createUniqueRegisterData();

    await page.goto("/register");
    await page.getByLabel(/Nombre completo/i).fill(registerData.name);
    await page
      .getByLabel(/Nombre de la empresa/i)
      .fill(registerData.companyName);
    await page.getByLabel(/Correo electronico/i).fill(registerData.email);
    await page.getByLabel(/^Contrase/i).first().fill(registerData.password);
    await page
      .getByLabel(/Confirmar contrase/i)
      .fill(registerData.password);
    await page.getByLabel(/RUC de la empresa/i).fill(registerData.ruc);
    await page.getByLabel(/Acepto los t/i).check();
    await page.getByRole("button", { name: /Crear cuenta/i }).click();

    await expect(page).toHaveURL(/\/login(?:\?.*)?$/);
    await expect(
      page.getByRole("heading", { name: /Iniciar sesion/i })
    ).toBeVisible();
  });
});
