import { defineConfig, devices } from '@playwright/test';

// Playwright configuration for Avnu Marketplace
// See https://playwright.dev/docs/test-configuration
export default defineConfig({
  testDir: './e2e',
  /* Maximum time one test can run for. */
  timeout: 30_000,
  expect: {
    /** Maximum time expect() should wait for the condition to be met. */
    timeout: 5000,
  },
  /* Retry on CI to reduce flakiness. */
  retries: process.env.CI ? 2 : 0,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Shared settings for all the projects below. */
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    headless: true,
    viewport: { width: 1280, height: 720 },
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Add firefox/webkit if desired later
  ],
});
