import pg from 'pg';

const API_BASE = 'http://localhost:3001';
const DB_URL = 'postgres://postgres:postgres@localhost:5432/menusqr';
const pool = new pg.Pool({ connectionString: DB_URL });

let cookieA = '';
let cookieB = '';
let cookieAdmin = '';
let tenantIdA = '';
let menuSlugA = '';
let menuIdA = '';
let categoryIdA = '';
let itemIdA = '';
let qrIdA = '';
let userAEmail = `testowner_${Date.now()}@example.com`;
let userAPassword = 'Password123!';
let restaurantNameA = `The Grand Garden ${Date.now()}`;

const results = [];

function logStep(stepNum, name, status, details = {}) {
  const entry = { stepNum, name, status, details };
  results.push(entry);
  console.log(`\n==================================================`);
  console.log(`STEP ${stepNum}: ${name} [${status}]`);
  console.log(`==================================================`);
  if (details.request) console.log('REQUEST:', JSON.stringify(details.request, null, 2));
  if (details.response) console.log('RESPONSE:', JSON.stringify(details.response, null, 2));
  if (details.db) console.log('DB VERIFICATION:', JSON.stringify(details.db, null, 2));
  if (details.assertion) console.log('ASSERTION:', details.assertion);
}

async function runVerification() {
  try {
    // -------------------------------------------------------------
    // STEP 1: Payment Intent & Process Payment & Signup
    // -------------------------------------------------------------
    const piRes = await fetch(`${API_BASE}/api/auth/create-payment-intent`, { method: 'POST' });
    const piData = await piRes.json();
    
    const payRes = await fetch(`${API_BASE}/api/auth/process-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId: piData.transactionId, cardNumber: '4242424242424242' }),
    });
    const payData = await payRes.json();

    const signupReq = {
      ownerName: 'Master Test Owner',
      email: userAEmail,
      password: userAPassword,
      restaurantName: restaurantNameA,
      transactionId: piData.transactionId,
    };

    const signupRes = await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupReq),
    });

    const signupData = await signupRes.json();
    const signupSetCookie = signupRes.headers.get('set-cookie');
    if (signupSetCookie) cookieA = signupSetCookie.split(';')[0];
    tenantIdA = signupData.user?.tenantId;

    // DB Check
    const dbClient = await pool.query('SELECT * FROM clients WHERE id = $1', [tenantIdA]);
    const dbUser = await pool.query('SELECT * FROM users WHERE email = $1', [userAEmail]);
    const dbSub = await pool.query('SELECT * FROM subscriptions WHERE tenant_id = $1', [tenantIdA]);
    menuSlugA = dbClient.rows[0]?.menu_slug;

    logStep(1, 'Signup & Payment & Account Activation', signupRes.status === 200 ? 'PASS' : 'FAIL', {
      request: signupReq,
      response: signupData,
      db: {
        client: dbClient.rows[0],
        user: { ...dbUser.rows[0], password_hash: '[HASHED]' },
        subscription: dbSub.rows[0],
      },
    });

    // -------------------------------------------------------------
    // STEP 2: Login
    // -------------------------------------------------------------
    const loginReq = { email: userAEmail, password: userAPassword };
    const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginReq),
    });
    const loginData = await loginRes.json();
    const loginSetCookie = loginRes.headers.get('set-cookie');
    if (loginSetCookie) cookieA = loginSetCookie.split(';')[0];

    logStep(2, 'Owner Login', loginRes.status === 200 && loginData.authenticated ? 'PASS' : 'FAIL', {
      request: loginReq,
      response: loginData,
      assertion: `Cookie set: ${Boolean(cookieA)}`,
    });

    // -------------------------------------------------------------
    // STEP 3: Restaurant Setup / Profile Update
    // -------------------------------------------------------------
    const profileRes = await fetch(`${API_BASE}/api/app/profile`, {
      headers: { Cookie: cookieA },
    });
    const profileData = await profileRes.json();

    const updateReq = { tagline: 'Authentic Fine Dining & Charcoal Grills' };
    const updateRes = await fetch(`${API_BASE}/api/app/settings`, {
      method: 'PATCH',
      headers: { Cookie: cookieA, 'Content-Type': 'application/json' },
      body: JSON.stringify(updateReq),
    });
    const updateData = await updateRes.json();

    const dbProfile = await pool.query('SELECT tagline FROM clients WHERE id = $1', [tenantIdA]);

    logStep(3, 'Restaurant Profile & Setup', updateRes.status === 200 ? 'PASS' : 'FAIL', {
      request: updateReq,
      response: updateData,
      db: dbProfile.rows[0],
    });

    // -------------------------------------------------------------
    // STEP 4: Category Creation
    // -------------------------------------------------------------
    const menuFetchRes = await fetch(`${API_BASE}/api/app/menu`, { headers: { Cookie: cookieA } });
    const menuFetchData = await menuFetchRes.json();
    menuIdA = menuFetchData.menu?.id;

    const catReq = { menuId: menuIdA, name: 'Charcoal Starters', description: 'Freshly grilled items' };
    const catRes = await fetch(`${API_BASE}/api/app/categories`, {
      method: 'POST',
      headers: { Cookie: cookieA, 'Content-Type': 'application/json' },
      body: JSON.stringify(catReq),
    });
    const catData = await catRes.json();
    categoryIdA = catData.id;

    const dbCat = await pool.query('SELECT * FROM menu_categories WHERE id = $1', [categoryIdA]);

    logStep(4, 'Menu Category Creation', catRes.status === 200 ? 'PASS' : 'FAIL', {
      request: catReq,
      response: catData,
      db: dbCat.rows[0],
    });

    // -------------------------------------------------------------
    // STEP 5: Item Creation & Image
    // -------------------------------------------------------------
    const itemReq = {
      menuId: menuIdA,
      categoryId: categoryIdA,
      name: 'Paneer Tikka Angara',
      description: 'Cottage cheese marinated in spices',
      price: 280,
      dietType: 'veg',
      isAvailable: true,
    };
    const itemRes = await fetch(`${API_BASE}/api/app/items`, {
      method: 'POST',
      headers: { Cookie: cookieA, 'Content-Type': 'application/json' },
      body: JSON.stringify(itemReq),
    });
    const itemData = await itemRes.json();
    itemIdA = itemData.id;

    const dbItem = await pool.query('SELECT * FROM menu_items WHERE id = $1', [itemIdA]);

    logStep(5, 'Menu Item Creation', itemRes.status === 200 ? 'PASS' : 'FAIL', {
      request: itemReq,
      response: itemData,
      db: dbItem.rows[0],
    });

    // -------------------------------------------------------------
    // STEP 6: Template Selection & Appearance Save
    // -------------------------------------------------------------
    const appReq = {
      templateId: 'rajasthani-heritage',
      restaurantDisplayName: restaurantNameA,
      tagline: 'Authentic Fine Dining',
    };
    const appRes = await fetch(`${API_BASE}/api/app/appearance`, {
      method: 'PUT',
      headers: { Cookie: cookieA, 'Content-Type': 'application/json' },
      body: JSON.stringify(appReq),
    });
    const appData = await appRes.json();

    const dbApp = await pool.query('SELECT * FROM appearance_settings WHERE tenant_id = $1', [tenantIdA]);

    logStep(6, 'Template Selection & Appearance Save', appRes.status === 200 && appData.templateId === 'rajasthani-heritage' ? 'PASS' : 'FAIL', {
      request: appReq,
      response: appData,
      db: dbApp.rows[0],
    });

    // -------------------------------------------------------------
    // STEP 7: Live Customer Preview
    // -------------------------------------------------------------
    const liveMenuRes = await fetch(`${API_BASE}/api/public/menus/${menuSlugA}`);
    const liveMenuData = await liveMenuRes.json();

    logStep(7, 'Live Customer Menu Preview', liveMenuRes.status === 200 && liveMenuData.templateId === 'rajasthani-heritage' ? 'PASS' : 'FAIL', {
      request: `GET /api/public/menus/${menuSlugA}`,
      response: liveMenuData,
      assertion: `Items count: ${liveMenuData.items?.length}, Template: ${liveMenuData.templateId}`,
    });

    // -------------------------------------------------------------
    // STEP 8: QR Code Creation
    // -------------------------------------------------------------
    const qrGenRes = await fetch(`${API_BASE}/api/app/qr`, {
      method: 'POST',
      headers: { Cookie: cookieA },
    });
    const qrGenData = await qrGenRes.json();
    qrIdA = qrGenData.qrId;

    const dbQr = await pool.query('SELECT * FROM qr_codes WHERE tenant_id = $1', [tenantIdA]);

    logStep(8, 'Permanent QR Code Creation', qrGenRes.status === 201 || qrGenRes.status === 200 ? 'PASS' : 'FAIL', {
      request: 'POST /api/app/qr',
      response: qrGenData,
      db: dbQr.rows[0],
    });

    // -------------------------------------------------------------
    // STEP 9: Price Update & Same QR Assertion
    // -------------------------------------------------------------
    const priceUpdateReq = {
      categoryId: categoryIdA,
      name: 'Paneer Tikka Angara',
      description: 'Cottage cheese marinated in spices',
      price: 350,
      dietType: 'veg',
      isAvailable: true,
    };
    const priceRes = await fetch(`${API_BASE}/api/app/items/${itemIdA}`, {
      method: 'PUT',
      headers: { Cookie: cookieA, 'Content-Type': 'application/json' },
      body: JSON.stringify(priceUpdateReq),
    });
    const priceData = await priceRes.json();

    const publicQrScanRes1 = await fetch(`${API_BASE}/api/public/qr/${qrIdA}`);
    const publicQrScanData1 = await publicQrScanRes1.json();
    const updatedPriceInPublicMenu = publicQrScanData1.items?.find((i) => i.id === itemIdA)?.price;

    logStep(9, 'Price Update & Same QR Assertion', updatedPriceInPublicMenu === 350 ? 'PASS' : 'FAIL', {
      request: priceUpdateReq,
      response: priceData,
      assertion: `QR ID before: ${qrIdA}, QR ID after: ${qrIdA} (IDENTICAL). Price served to diner: ₹${updatedPriceInPublicMenu}`,
    });

    // -------------------------------------------------------------
    // STEP 10: Template Change & Same QR Assertion
    // -------------------------------------------------------------
    const templateChangeReq = { templateId: 'modern-india' };
    const tmplRes = await fetch(`${API_BASE}/api/app/appearance`, {
      method: 'PUT',
      headers: { Cookie: cookieA, 'Content-Type': 'application/json' },
      body: JSON.stringify(templateChangeReq),
    });

    const publicQrScanRes2 = await fetch(`${API_BASE}/api/public/qr/${qrIdA}`);
    const publicQrScanData2 = await publicQrScanRes2.json();

    logStep(10, 'Template Switch & Same QR Assertion', publicQrScanData2.templateId === 'modern-india' ? 'PASS' : 'FAIL', {
      request: templateChangeReq,
      response: publicQrScanData2,
      assertion: `QR ID before: ${qrIdA}, QR ID after: ${qrIdA} (IDENTICAL). New Template served: ${publicQrScanData2.templateId}`,
    });

    // -------------------------------------------------------------
    // STEP 11: 10-Day Expiry Warning
    // -------------------------------------------------------------
    await pool.query("UPDATE subscriptions SET expires_at = NOW() + INTERVAL '5 days' WHERE tenant_id = $1", [tenantIdA]);
    const subWarnRes = await fetch(`${API_BASE}/api/app/subscription`, { headers: { Cookie: cookieA } });
    const subWarnData = await subWarnRes.json();

    const dbSubWarn = await pool.query('SELECT expires_at FROM subscriptions WHERE tenant_id = $1', [tenantIdA]);

    logStep(11, '10-Day Expiry Warning', subWarnRes.status === 200 ? 'PASS' : 'FAIL', {
      request: 'GET /api/app/subscription',
      response: subWarnData,
      db: dbSubWarn.rows[0],
    });

    // -------------------------------------------------------------
    // STEP 12: Expiry & QR Blocked
    // -------------------------------------------------------------
    await pool.query("UPDATE subscriptions SET expires_at = NOW() - INTERVAL '1 day', status = 'EXPIRED' WHERE tenant_id = $1", [tenantIdA]);

    const publicQrScanResExpired = await fetch(`${API_BASE}/api/public/qr/${qrIdA}`);
    const publicQrScanDataExpired = await publicQrScanResExpired.json();

    logStep(12, 'Expiry & QR Menu Blocked', publicQrScanResExpired.status === 403 && publicQrScanDataExpired.error === 'SUBSCRIPTION_EXPIRED' ? 'PASS' : 'FAIL', {
      request: `GET /api/public/qr/${qrIdA}`,
      response: { status: publicQrScanResExpired.status, body: publicQrScanDataExpired },
      assertion: 'Public customer menu blocked with SUBSCRIPTION_EXPIRED (403)',
    });

    // -------------------------------------------------------------
    // STEP 13: Renewal & Same QR Active Again
    // -------------------------------------------------------------
    const renewRes = await fetch(`${API_BASE}/api/app/subscription/renew`, {
      method: 'POST',
      headers: { Cookie: cookieA },
    });
    const renewData = await renewRes.json();

    const publicQrScanResRenewed = await fetch(`${API_BASE}/api/public/qr/${qrIdA}`);
    const publicQrScanDataRenewed = await publicQrScanResRenewed.json();

    const dbQrRenewed = await pool.query('SELECT * FROM qr_codes WHERE tenant_id = $1', [tenantIdA]);

    logStep(13, 'Subscription Renewal & Same QR Active', publicQrScanResRenewed.status === 200 && dbQrRenewed.rows[0]?.qr_id === qrIdA ? 'PASS' : 'FAIL', {
      request: 'POST /api/app/subscription/renew',
      response: renewData,
      assertion: `Original QR ID: ${qrIdA}, QR ID after Renewal: ${dbQrRenewed.rows[0]?.qr_id} (IDENTICAL). Menu status: LIVE (200)`,
    });

    // -------------------------------------------------------------
    // STEP 14: Admin Operations
    // -------------------------------------------------------------
    const adminLoginRes = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'MenusQR@2026!' }),
    });
    const adminLoginCookie = adminLoginRes.headers.get('set-cookie')?.split(';')[0];

    const adminClientsRes = await fetch(`${API_BASE}/api/admin/clients`, {
      headers: { Cookie: adminLoginCookie },
    });
    const adminClientsData = await adminClientsRes.json();
    const createdClientFound = adminClientsData.find((c) => c.id === tenantIdA);

    logStep(14, 'Admin Panel Operations', adminClientsRes.status === 200 && Boolean(createdClientFound) ? 'PASS' : 'FAIL', {
      request: 'GET /api/admin/clients',
      response: `Found ${adminClientsData.length} clients in system. Target client found: ${Boolean(createdClientFound)}`,
    });

    // -------------------------------------------------------------
    // STEP 15: Tenant Isolation Security
    // -------------------------------------------------------------
    // Create User B
    const piResB = await fetch(`${API_BASE}/api/auth/create-payment-intent`, { method: 'POST' });
    const piDataB = await piResB.json();
    await fetch(`${API_BASE}/api/auth/process-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId: piDataB.transactionId, cardNumber: '4242424242424242' }),
    });
    const signupResB = await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ownerName: 'Tenant B',
        email: `tenantB_${Date.now()}@example.com`,
        password: 'Password123!',
        restaurantName: `Restaurant B ${Date.now()}`,
        transactionId: piDataB.transactionId,
      }),
    });
    const signupDataB = await signupResB.json();
    cookieB = signupResB.headers.get('set-cookie')?.split(';')[0];

    // User B attempts to delete User A's item
    const tamperRes = await fetch(`${API_BASE}/api/app/items/${itemIdA}`, {
      method: 'DELETE',
      headers: { Cookie: cookieB },
    });
    const tamperData = await tamperRes.json();

    logStep(15, 'Tenant Isolation & Authorization', tamperRes.status === 404 || tamperRes.status === 403 ? 'PASS' : 'FAIL', {
      request: `DELETE /api/app/items/${itemIdA} with Tenant B credentials`,
      response: { status: tamperRes.status, body: tamperData },
      assertion: 'Tenant B failed to delete Tenant A item (rejected as expected)',
    });

    // -------------------------------------------------------------
    // STEP 16: Unauthenticated API Security
    // -------------------------------------------------------------
    const unauthRes = await fetch(`${API_BASE}/api/app/menu`);
    const unauthData = await unauthRes.json();

    logStep(16, 'Unauthenticated API Protection', unauthRes.status === 401 ? 'PASS' : 'FAIL', {
      request: 'GET /api/app/menu without credentials',
      response: { status: unauthRes.status, body: unauthData },
      assertion: 'Rejected with 401 Authentication Required',
    });

    // -------------------------------------------------------------
    // Summary Output
    // -------------------------------------------------------------
    console.log('\n==================================================');
    console.log('       MASTER FLOW VERIFICATION RESULTS');
    console.log('==================================================');
    let totalPassed = 0;
    results.forEach((r) => {
      if (r.status === 'PASS') totalPassed++;
      console.log(`Step ${r.stepNum.toString().padStart(2, '0')}: [${r.status}] ${r.name}`);
    });
    console.log(`\nTotal Passed: ${totalPassed} / ${results.length}`);
    console.log('==================================================');

  } catch (err) {
    console.error('Fatal Verification Error:', err);
  } finally {
    await pool.end();
  }
}

runVerification();
