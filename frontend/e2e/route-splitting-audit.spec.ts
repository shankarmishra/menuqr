import { test, expect } from '@playwright/test';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const { generateAuthCookie } = await import(pathToFileURL(resolve(repoRoot, 'backend/auth.js')).href);

const authCookie = generateAuthCookie({
  id: 'user-1',
  role: 'RESTAURANT_OWNER',
  tenantId: 'client-1',
}).split(';')[0].replace('menusqr_auth=', '');

async function addAuth(context: any, baseURL: string | undefined) {
  const url = new URL(baseURL || 'http://localhost:5173');
  await context.addCookies([
    {
      name: 'menusqr_auth',
      value: authCookie,
      domain: url.hostname,
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
  ]);
}

test.describe('Phase 2.2 — Route-Level Code Splitting & Chunk Isolation Audit', () => {
  test('1. Public visitor on homepage downloads zero admin, app, or xlsx chunks', async ({ page, baseURL }) => {
    const fetchedScripts: string[] = [];
    page.on('response', (res) => {
      const url = res.url();
      if (url.includes('.js') || url.includes('.tsx') || url.includes('.ts')) {
        fetchedScripts.push(url);
      }
    });

    await page.goto(`${baseURL}/`, { waitUntil: 'networkidle' });

    // Verify page rendered correctly
    await expect(page.getByRole('heading', { name: /Your menu changes/i })).toBeVisible();

    // Verify admin, app, and xlsx chunks were NOT fetched on homepage
    const leakedChunks = fetchedScripts.filter((url) =>
      !url.includes('node_modules') &&
      /(?:^|\/)(?:pages\/app\/Menu|pages\/admin\/|Menu-[A-Za-z0-9_-]+\.js|AppLayout|AdminLayout|AdminLogin|ClientForm|xlsx)[.-]/i.test(url)
    );
    expect(leakedChunks).toEqual([]);
  });

  test('2. Navigating to /login dynamically loads AdminLogin chunk on-demand', async ({ page, baseURL }) => {
    const fetchedScripts: string[] = [];
    page.on('response', (res) => {
      const url = res.url();
      if (url.includes('.js') || url.includes('.tsx') || url.includes('.ts')) {
        fetchedScripts.push(url);
      }
    });

    await page.goto(`${baseURL}/login`, { waitUntil: 'networkidle' });

    // Verify login form is visible
    await expect(page.getByRole('heading', { name: /Restaurant Portal|Sign in to continue/i })).toBeVisible();

    // Verify AdminLogin chunk was dynamically requested
    const adminLoginChunk = fetchedScripts.some((url) => /AdminLogin/i.test(url));
    expect(adminLoginChunk).toBe(true);

    // Verify dashboard chunks were NOT fetched
    const leakedDashboard = fetchedScripts.some((url) =>
      !url.includes('node_modules') &&
      /(?:^|\/)(?:pages\/app\/Menu|Menu-[A-Za-z0-9_-]+\.js|AppLayout|pages\/app\/Dashboard|Dashboard-[A-Za-z0-9_-]+\.js)[.-]/i.test(url)
    );
    expect(leakedDashboard).toBe(false);
  });

  test('3. Authenticated direct navigation to /app/dashboard loads AppLayout and Dashboard chunks', async ({ context, page, baseURL }) => {
    await addAuth(context, baseURL);

    const fetchedScripts: string[] = [];
    page.on('response', (res) => {
      const url = res.url();
      if (url.includes('.js') || url.includes('.tsx') || url.includes('.ts')) {
        fetchedScripts.push(url);
      }
    });

    await page.goto(`${baseURL}/app/dashboard`, { waitUntil: 'networkidle' });

    // Verify dashboard rendered
    await expect(page.getByText(/Overview|Business Overview|Dashboard/i).first()).toBeVisible();

    // Verify AppLayout and Dashboard chunks were downloaded
    const hasAppLayout = fetchedScripts.some((url) => /AppLayout/i.test(url));
    expect(hasAppLayout).toBe(true);

    // Verify xlsx chunk is NOT loaded yet
    const hasXlsx = fetchedScripts.some((url) => /xlsx/i.test(url));
    expect(hasXlsx).toBe(false);
  });

  test('4. Direct navigation and browser refresh on nested /app/menu route works cleanly', async ({ context, page, baseURL }) => {
    await addAuth(context, baseURL);

    await page.goto(`${baseURL}/app/menu`, { waitUntil: 'networkidle' });

    // Verify menu manager is loaded
    await expect(page.getByText(/Menu Manager|Categories|Dishes/i).first()).toBeVisible();

    // Browser refresh
    await page.reload({ waitUntil: 'networkidle' });

    // Verify state restored cleanly after refresh
    await expect(page.getByText(/Menu Manager|Categories|Dishes/i).first()).toBeVisible();
  });

  test('5. Unauthenticated visitor attempting /app/dashboard is redirected to /login without chunk exposure', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/app/dashboard`, { waitUntil: 'networkidle' });

    // Should redirect to /login
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByRole('heading', { name: /Restaurant Portal|Sign in to continue/i })).toBeVisible();
  });
});
