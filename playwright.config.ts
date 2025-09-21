import type { PlaywrightTestConfig } from "@playwright/test";

const isCI = process.env.CI === "1" || process.env.CI === "true";

const config: PlaywrightTestConfig = {
  testDir: "./tests/e2e",
  timeout: 120_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    headless: true,
  },
  webServer: {
    command: "pnpm exec next dev --turbopack --port 3000",
    url: "http://127.0.0.1:3000",
    timeout: 120_000,
    reuseExistingServer: !isCI,
  },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
        channel: "chrome",
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
};

export default config;
