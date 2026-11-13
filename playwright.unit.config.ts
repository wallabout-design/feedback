import { defineConfig } from '@playwright/test';

// The unit layer (`npm run test:unit`): mailto.spec.ts, react.spec.ts and tag-check.spec.ts
// dist/ and need no server and no browser. The browser tests are in
// playwright.config.ts.
export default defineConfig({
  testDir: 'test',
  testMatch: /(mailto|react|tag-check)\.spec\.ts/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
});
