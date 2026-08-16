import { test, expect } from "./fixtures";

test.describe("Appointment booking", () => {
  test("opens the booking modal and validates required fields", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => {
      const el = document.querySelector("#appointment");
      window.scrollTo(0, el!.getBoundingClientRect().top + window.scrollY);
    });
    await page.waitForTimeout(500);

    await page.locator('button:has-text("Book Now")').first().click();
    await expect(page.getByRole("heading", { name: /Book:/ })).toBeVisible();

    const sendButton = page.getByRole("button", { name: "Send Request" });
    await expect(sendButton).toBeDisabled();

    await page.getByPlaceholder("Enter your first name").fill("Test");
    await page.getByPlaceholder("Enter your last name").fill("User");
    await page.locator('input[type="date"]').fill("2026-12-01");
    // Phone left empty — button should still be disabled without a valid number.
    await expect(sendButton).toBeDisabled();
  });

  test("closing the modal clears it from the page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => {
      const el = document.querySelector("#appointment");
      window.scrollTo(0, el!.getBoundingClientRect().top + window.scrollY);
    });
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Book Now")').first().click();
    await expect(page.getByRole("heading", { name: /Book:/ })).toBeVisible();

    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("heading", { name: /Book:/ })).toHaveCount(0);
  });
});
