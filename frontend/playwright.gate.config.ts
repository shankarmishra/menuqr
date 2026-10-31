import { defineConfig } from '@playwright/test';
import { join } from 'node:path';
import { outDir, urls } from './e2e-gate/lib/gate-env.mjs';

/**
 * The MENUQR end-to-end gate. Run it through `node e2e-gate/run-gate.mjs` (starts the scratch DB, the backend and Vite,
 * runs this config, prints the summary and tears down). Running `playwright test -c playwright.gate.config.ts` directly
 * works only when BASE_URL, API_URL and E2E_DATABASE_URL already point at a running stack.
 */
const results = join(outDir(), 'results');

export default defineConfig({
  testDir: './e2e-gate/specs',
  globalSetup: './e2e-gate/global-setup.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['json', { outputFile: process.env.PLAYWRIGHT_JSON_OUTPUT_NAME || join(results, 'playwright.json') }]],
  outputDir: join(results, 'artifacts'),
  use: {
    baseURL: urls().base,
    browserName: 'chromium',
    viewport: { width: 1280, height: 800 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ignoreHTTPSErrors: true,
  },
  projects: [{ name: 'gate' }],
});
