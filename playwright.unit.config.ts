import { defineConfig } from '@playwright/test';

// The unit layer (`npm run test:unit`): mailto.spec.ts and react.spec.ts import
// dist/ and need no server and no browser. The browser tests are in
// playwright.config.ts.
export default defineConfig({
  testDir: 'test',
  testMatch: /(mailto|react)\.spec\.ts/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
});
