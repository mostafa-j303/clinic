import { test, expect } from "./fixtures";

// Booking now requires a logged-in client account (see CLAUDE.md, "Appointment
// booking & scheduling system"). The full logged-in booking flow (pick a
// date, pick a 30-min slot, submit) isn't covered here because it requires
// registering a real client — this project has no isolated test database, so
// specs never call data-writing endpoints like /api/client/register. That
// flow was verified manually; see the CLAUDE.md entry for how it was checked.
test.describe("Appointment booking", () => {
  test("Book Now shows a login prompt and redirects an unauthenticated visitor", async ({
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
    await expect(page.getByText("Please log in to book an appointment.")).toBeVisible();
    await expect(page).toHaveURL(/\/client-portal$/, { timeout: 5000 });
  });
});
