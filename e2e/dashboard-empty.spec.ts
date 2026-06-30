import { expect, test } from "@playwright/test";
import { loginThroughUi, requireEnv } from "./helpers/auth";

test.describe("Dashboard vacio", () => {
  test("muestra estados vacios sin romper la vista principal", async ({
    page,
  }) => {
    const email = requireEnv("E2E_EMPTY_DASHBOARD_EMAIL");
    const password = requireEnv("E2E_EMPTY_DASHBOARD_PASSWORD");

    test.skip(
      !email || !password,
      "Define E2E_EMPTY_DASHBOARD_EMAIL y E2E_EMPTY_DASHBOARD_PASSWORD para validar el dashboard vacio."
    );

    await loginThroughUi({
      page,
      email: email!,
      password: password!,
      expectedPath: /\/dashboard(?:\/)?$/,
    });

    await expect(
      page.getByRole("heading", { name: /Dashboard/i })
    ).toBeVisible();
    await expect(page.getByText("Periodo del dashboard")).toBeVisible();
    await expect(page.getByText("No hay movimientos disponibles.")).toBeVisible();
    await expect(
      page.getByText("Aun no hay reportes generados para esta empresa.")
    ).toBeVisible();
  });
});
