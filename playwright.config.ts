import { defineConfig, devices } from '@playwright/test';

const port = 4322;

export default defineConfig({
  testDir: 'test',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // A flaky test fails the run (standards/testing.md): the one retry in CI is
  // only there to tell "flaky" from "broken" in the report.
  retries: process.env.CI ? 1 : 0,
  failOnFlakyTests: true,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: `http://localhost:${port}` },
  // The browser tests (`npm run test:e2e`). mailto.spec.ts and react.spec.ts
  // need no browser or server: playwright.unit.config.ts runs them.
  testMatch: /link\.spec\.ts/,
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  // Serves the fixture pages and the built dist/ (npm test builds first).
  webServer: { command: `node test/serve.mjs ${port}`, port, reuseExistingServer: false },
});
