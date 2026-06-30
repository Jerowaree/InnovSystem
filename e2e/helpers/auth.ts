import { expect, type Page } from "@playwright/test";

export function requireEnv(name: string) {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : null;
}

export async function loginThroughUi(input: {
  page: Page;
  email: string;
  password: string;
  expectedPath?: string;
}) {
  await input.page.goto("/login");
  await input.page.getByLabel(/Correo electr/i).fill(input.email);
  await input.page.getByLabel(/Contrase/i).fill(input.password);
  await input.page.getByRole("button", { name: "Iniciar sesion" }).click();

  await expect(input.page).toHaveURL(
    input.expectedPath ?? /\/dashboard(?:\/)?$/
  );
}
