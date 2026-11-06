import { defineConfig, devices } from '@playwright/test';

const port = 4322;

export default defineConfig({
  testDir: 'test',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: `http://localhost:${port}` },
  projects: [
    // mailto.spec.ts and react.spec.ts need no browser.
    { name: 'unit', testMatch: /(mailto|react)\.spec\.ts/ },
    { name: 'chromium', testMatch: /link\.spec\.ts/, use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', testMatch: /link\.spec\.ts/, use: { ...devices['Desktop Safari'] } },
  ],
  // Serves the fixture pages and the built dist/ (npm test builds first).
  webServer: { command: `node test/serve.mjs ${port}`, port, reuseExistingServer: false },
});
