import { test, expect } from "./fixtures";

test.describe("Client portal", () => {
  test("shows the login form by default and can switch to register", async ({
    page,
  }) => {
    await page.goto("/client-portal");
    await page.waitForLoadState("networkidle");

    await expect(page.getByRole("heading", { name: "Client Portal" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Continue with Google" })
    ).toBeVisible();

    await page.getByRole("button", { name: "Register" }).click();
    await expect(
      page.getByPlaceholder("Full Name")
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Create Account" })).toBeVisible();
  });

  test("intake-form redirects an unauthenticated visitor to the client portal", async ({
    page,
  }) => {
    await page.goto("/intake-form");
    await page.waitForLoadState("networkidle");
    expect(new URL(page.url()).pathname).toBe("/client-portal");
  });
});
