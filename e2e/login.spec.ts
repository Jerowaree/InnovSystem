import { expect, test } from "@playwright/test";
import { loginThroughUi, requireEnv } from "./helpers/auth";

test.describe("Login", () => {
  test("permite iniciar sesion y entrar al dashboard", async ({ page }) => {
    const email = requireEnv("E2E_LOGIN_EMAIL");
    const password = requireEnv("E2E_LOGIN_PASSWORD");

    test.skip(
      !email || !password,
      "Define E2E_LOGIN_EMAIL y E2E_LOGIN_PASSWORD para ejecutar este flujo."
    );

    await loginThroughUi({
      page,
      email: email!,
      password: password!,
    });

    await expect(
      page.getByRole("heading", { name: /dashboard|reportes|configuraci/i })
    ).toBeVisible();
  });
});
