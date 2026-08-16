import { test, expect } from "./fixtures";

test.describe("Homepage", () => {
  test("loads with no console errors and core sections present", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(String(err)));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#appointment")).toBeVisible();
    await expect(page.locator("#Products")).toBeAttached();
    expect(errors, `Console/page errors: ${errors.join("; ")}`).toHaveLength(0);
  });

  test("dark mode toggle switches the theme and persists across reload", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const html = page.locator("html");
    await expect(html).not.toHaveClass(/dark/);

    await page.getByRole("button", { name: /dark|theme/i }).first().click();
    await expect(html).toHaveClass(/dark/);

    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(html).toHaveClass(/dark/);
  });

  test("no horizontal overflow at mobile width", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });
});
