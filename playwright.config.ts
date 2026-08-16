import { defineConfig, devices } from "@playwright/test";

// Phase 7 of plan.md — a real, committed E2E suite (not the ad-hoc scratch
// scripts used during development). Never run against production: this
// config always points at a locally-started dev server.
export default defineConfig({
  testDir: "./e2e",
  // A single dev-server instance (Turbopack, cold-compiling routes on first
  // hit) backs every test — running fully parallel against it caused
  // spurious failures from concurrent first-hit compiles. One worker keeps
  // the suite reliable; it's a small suite, so this isn't a speed problem.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
