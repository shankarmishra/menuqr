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
      name: 'Mobile',
      use: { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true },
    },
    {
      name: 'Desktop',
      use: { viewport: { width: 1280, height: 720 } },
    },
  ],
  webServer: {
    command: 'npx vite preview --port 4317 --strictPort --host 127.0.0.1',
    url: 'http://localhost:4317/',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
