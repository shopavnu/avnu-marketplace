import { defineConfig, devices } from '@playwright/test';

// Playwright configuration for Avnu Marketplace
// See https://playwright.dev/docs/test-configuration
export default defineConfig({
  /* Automatically start Next.js dev server */
  webServer: [
    {
      // Start NestJS backend (GraphQL + Socket.IO)
      command: 'DISABLE_EXT_SERVICES=1 PORT=8081 npm --workspace backend run start:e2e',
      url: 'http://localhost:8081/graphql',
      timeout: 300_000,
      reuseExistingServer: true,
    },
    {
      // Start Next.js frontend
      command: 'NEXT_PUBLIC_DISABLE_STRIPE=true NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_12345 NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8081/graphql NEXT_PUBLIC_API_BASE_URL=http://localhost:8081 PORT=3000 npm --workspace frontend run dev',
      url: 'http://localhost:3000',
      timeout: 120_000,
      reuseExistingServer: true,
    },
  ],
  testDir: './e2e',
  /* Maximum time one test can run for. */
  timeout: 90_000,
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
