import "dotenv/config";
import { test as base, expect, Page } from "@playwright/test";

// Shared login helper + a fixture that stubs the two outbound notification
// APIs (Brevo email, Meta WhatsApp) at the network layer, per plan.md Phase 7:
// tests verify the call was attempted with the right shape, without ever
// sending a real email/WhatsApp message.
export async function loginAsAdmin(page: Page) {
  const password = process.env.ADMIN_PASSWORD_REFERENCE;
  if (!password) {
    throw new Error(
      "ADMIN_PASSWORD_REFERENCE is not set in .env — required for admin e2e specs."
    );
  }
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.locator("header a img, header img").first().dblclick();
  await page.locator('input[type="password"]').first().fill(password);
  const [loginResponse] = await Promise.all([
    page.waitForResponse((res) => res.url().includes("/api/admin/admin-login")),
    page.keyboard.press("Enter"),
  ]);
  if (!loginResponse.ok()) {
    throw new Error(
      `Admin login failed with status ${loginResponse.status()} — check ADMIN_PASSWORD_REFERENCE in .env.`
    );
  }
  await page.waitForLoadState("networkidle");
}

export const test = base.extend<{ stubNotifications: void }>({
  stubNotifications: [
    async ({ page }, use) => {
      await page.route("**/api/send-email", (route) =>
        route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) })
      );
      await page.route("**/api/send-whatsapp", (route) =>
        route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) })
      );
      await use();
    },
    { auto: true },
  ],
});

export { expect };
