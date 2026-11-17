import { defineConfig } from '@playwright/test';

/**
 * Renderer-only Playwright config.
 *
 * The main `playwright.config.ts` boots the API server and therefore needs Postgres. The menu
 * renderer is pure front-end — tokens in, markup out — so its tests run against the Vite
 * preview server alone and need no database. That keeps the design-quality gate fast enough to
 * run on every change rather than only in CI.
 *
 *   npm run build && npx playwright test --config=playwright.render.config.ts
 */
export default defineConfig({
  testDir: './e2e-render',
  fullyParallel: true,
  timeout: 45_000,
  expect: { timeout: 8_000, toHaveScreenshot: { maxDiffPixelRatio: 0.012 } },
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4317',
    browserName: 'chromium',
    trace: 'off',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'Mobile-320',
      use: { viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true },
    },
    {
      name: 'Mobile-360',
      use: { viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true },
    },
    {
      name: 'Mobile-375',
      use: { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true },
    },
    {
      name: 'Mobile-390',
      use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
    {
      name: 'Mobile-430',
      use: { viewport: { width: 430, height: 932 }, isMobile: true, hasTouch: true },
    },
    {
      name: 'Tablet-768',
      use: { viewport: { width: 768, height: 1024 }, hasTouch: true },
    },
    {
      name: 'Tablet-1024',
      use: { viewport: { width: 1024, height: 1366 } },
    },
    {
      name: 'Desktop-1280',
      use: { viewport: { width: 1280, height: 720 } },
    },
    {
      name: 'Desktop-1440',
      use: { viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'Desktop-1920',
      use: { viewport: { width: 1920, height: 1080 } },
    },
  ],
  webServer: {
    command: 'npx vite preview --port 4317 --strictPort --host 127.0.0.1',
    url: 'http://localhost:4317/',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
