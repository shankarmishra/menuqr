import { expect, test } from '@playwright/test';

test('main hostname redirects direct admin paths to the configured admin hostname', async ({ page, baseURL }) => {
  const mainOrigin = new URL(baseURL!);
  const adminOrigin = 'https://localhost';

  await page.route(`${adminOrigin}/**`, async (route) => {
    await route.fulfill({ status: 200, contentType: 'text/plain', body: 'Admin host reached' });
  });

  await page.goto(`${mainOrigin.origin}/admin/dashboard`);

  await expect(page).toHaveURL(`${adminOrigin}/admin/dashboard`);
  await expect(page.getByText('Admin host reached')).toBeVisible();
});

test('dedicated hostname shows OTP-only admin login while the main hostname keeps client login', async ({ page, baseURL }) => {
  const adminOrigin = new URL(baseURL!);
  const mainOrigin = new URL(baseURL!);
  adminOrigin.hostname = 'localhost';
  const ownerSessionRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/api/auth/session') ownerSessionRequests.push(request.url());
  });

  await page.goto(`${adminOrigin.origin}/`);
  await expect(page.getByRole('heading', { name: 'Administrator sign in' })).toBeVisible();
  await expect(page.getByLabel('Email Address')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
  await expect(page.getByLabel('6-Digit Verification Code')).toHaveCount(0);

  await page.goto(`${mainOrigin.origin}/login`);
  await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Forgot password?' })).toBeVisible();
  expect(ownerSessionRequests).toHaveLength(0);
});

test('admin email field and delivery error use clear, professional copy', async ({ page, baseURL }) => {
  const adminOrigin = new URL(baseURL!);
  adminOrigin.hostname = 'localhost';
  await page.route('**/api/auth/admin/request-otp', (route) => route.fulfill({
    status: 503,
    contentType: 'application/json',
    body: JSON.stringify({ error: 'Server SMTP connection timed out.' }),
  }));

  await page.goto(`${adminOrigin.origin}/login`);
  const email = page.getByLabel('Email Address');
  await expect(email).toHaveAttribute('placeholder', 'Administrator email address');
  await email.fill('xshankarmishra@gmail.com');
  await page.getByRole('button', { name: 'Request sign-in code' }).click();

  await expect(page.getByRole('alert')).toHaveText(
    'We could not send a sign-in code. Please try again shortly. If the problem continues, contact support.',
  );
  await expect(page.getByRole('alert')).not.toContainText('SMTP');
});