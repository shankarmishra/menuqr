import { test, expect, loadWorld } from '../lib/gate';

// Proves the harness itself: real backend on a scratch DB, Vite proxy, seeded world, one diner page and one owner login.
test('stack is up: health, seeded world, public API, owner login cookie', async ({ request, g }) => {
  const world = loadWorld();
  const lab = world.tenants.lab;

  await g.check('STACK-01-health', 'GET /api/health is ok and the database is connected', async () => {
    const response = await request.get(`${world.base}/api/health`); // through the Vite proxy
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.dbConnected).toBe(true);
  });

  await g.check('STACK-02-public-menu-by-slug', 'public menu API returns the 220 seeded dishes in 20 categories', async () => {
    const response = await request.get(`${world.base}/api/public/menus/${lab.slug}`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.items).toHaveLength(220);
    expect(body.categories).toHaveLength(20);
  });

  await g.check('STACK-03-public-menu-by-qr', 'permanent QR id resolves to the same menu', async () => {
    const response = await request.get(`${world.base}/api/public/qr/${lab.qrId}`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.restaurant.name).toBe(lab.businessName);
  });

  await g.check('STACK-04-owner-password-login', 'owner can sign in with the real /api/auth/login (no OTP step for password login)', async () => {
    const response = await request.post(`${world.base}/api/auth/login`, { data: { email: lab.email, password: lab.password } });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.authenticated).toBe(true);
    expect(body.role).toBe('RESTAURANT_OWNER');
    expect(body.onboardingState).toBe('COMPLETED');
  });
});
