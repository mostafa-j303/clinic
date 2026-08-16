import { test, expect } from "./fixtures";

test.describe("Products & cart", () => {
  test("adding a product updates the cart badge and drawer", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => {
      const el = document.querySelector("#Products");
      window.scrollTo(0, el!.getBoundingClientRect().top + window.scrollY);
    });
    await page.waitForTimeout(500);

    const firstProductName = await page
      .locator("h3")
      .filter({ hasText: /.+/ })
      .first()
      .textContent();

    await page.locator('button:has-text("Add")').first().click();
    await expect(page.getByLabel("Shopping cart")).toContainText("1");

    await page.getByLabel("Shopping cart").click();
    if (firstProductName) {
      await expect(page.getByText(firstProductName.trim())).toBeVisible();
    }
  });

  test("View Full Cart navigates to the checkout page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => {
      const el = document.querySelector("#Products");
      window.scrollTo(0, el!.getBoundingClientRect().top + window.scrollY);
    });
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Add")').first().click();
    await page.getByLabel("Shopping cart").click();
    await page.getByRole("link", { name: "View Full Cart" }).click();
    // Cart is in-memory-only React state (no persistence) — navigate via the
    // in-app link, never page.goto(), or the cart empties on reload. Assert
    // via toHaveURL (auto-retrying) rather than a one-shot page.url() read,
    // which raced the client-side navigation and read the URL too early.
    await expect(page).toHaveURL(/\/Cart$/);
    await expect(
      page.getByRole("heading", { name: "Shopping Cart" })
    ).toBeVisible();
  });

  test("checkout button stays disabled until required fields + location are filled", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => {
      const el = document.querySelector("#Products");
      window.scrollTo(0, el!.getBoundingClientRect().top + window.scrollY);
    });
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Add")').first().click();
    // Navigate via the in-app link (not page.goto) — the cart is in-memory
    // React state with no persistence, so a hard navigation would empty it.
    await page.getByLabel("Shopping cart").click();
    await page.getByRole("link", { name: "View Full Cart" }).click();
    await expect(page).toHaveURL(/\/Cart$/);

    const checkoutButton = page.getByRole("button", {
      name: /Send Order via WhatsApp/,
    });
    await expect(checkoutButton).toBeDisabled();

    await page.getByPlaceholder("Enter your first name").fill("Test");
    await page.getByPlaceholder("Enter your last name").fill("User");
    await page
      .getByPlaceholder("Enter your complete address with details")
      .fill("123 Test St");
    // Location was never fetched (geolocation isn't granted in a headless
    // test run) — the button must remain disabled without it.
    await expect(checkoutButton).toBeDisabled();
  });
});
