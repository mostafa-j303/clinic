import { test, expect, loginAsAdmin } from "./fixtures";

const ADMIN_ROUTES = ["/Setting", "/Orders", "/IntakeForms", "/Appointments"];

test.describe("Admin route protection", () => {
  for (const route of ADMIN_ROUTES) {
    test(`${route} redirects an unauthenticated visitor to the homepage`, async ({
      page,
    }) => {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      expect(new URL(page.url()).pathname).toBe("/");
    });
  }

  test("logged-in admin can reach all 4 admin pages", async ({ page }) => {
    await loginAsAdmin(page);
    for (const route of ADMIN_ROUTES) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      expect(new URL(page.url()).pathname).toBe(route);
    }
  });

  test("admin shell shows the logged-in nav and Logout works", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto("/Orders");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("link", { name: "Settings" })).toBeVisible();
    // The Logout button fires an async fetch to destroy the session cookie —
    // wait for that response before navigating away, or the next goto races
    // ahead of the cookie actually being cleared.
    await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/admin/logout")),
      page.getByRole("button", { name: "Logout" }).click(),
    ]);
    // After logout, the admin route should no longer be reachable.
    await page.goto("/Orders");
    await expect(page).toHaveURL(/\/$/);
  });
});
