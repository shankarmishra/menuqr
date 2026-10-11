import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 12_000 },
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5174',
    browserName: 'chromium',
    trace: 'off',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'Mobile Chrome',
      use: {
        browserName: 'chromium',
        viewport: { width: 375, height: 812 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'Desktop Chrome',
      use: {
        browserName: 'chromium',
        viewport: { width: 1280, height: 720 },
        isMobile: false,
        hasTouch: false,
      },
    }
  ],
  webServer: [
    {
      command: 'node backend/server.js',
      cwd: '..',
      url: 'http://127.0.0.1:3311/api/health',
      env: {
        PORT: '3311',
        API_PORT: '3311',
        NODE_ENV: 'test',
        JWT_SECRET: process.env.JWT_SECRET || 'super_secret_jwt_key_12345',
        DATABASE_URL: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/menuqr',
        OTP_SECRET: process.env.OTP_SECRET || 'test-otp-secret-key-12345678901234567890',
        ADMIN_OTP_PEPPER: process.env.ADMIN_OTP_PEPPER || 'test-otp-secret-key-12345678901234567890',
      },
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: 'npx vite --host 0.0.0.0 --port 5174 --strictPort',
      cwd: '.',
      url: 'http://127.0.0.1:5174',
      env: {
        MENUSQR_API_PROXY: 'http://127.0.0.1:3311',
        VITE_ADMIN_HOSTNAME: 'localhost',
        VITE_API_BASE_URL: '',
      },
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
});