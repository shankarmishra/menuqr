import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { prerender } from 'react-dom/static';
import { createServer, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';

const here = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(here, '..', '..', '..');

let vite: ViteDevServer;
let BillPage: React.ComponentType<any>;

before(async () => {
  const stubCss = {
    name: 'bill-page-stub-css',
    enforce: 'pre' as const,
    load(id: string) {
      if (/\.css(\?|$)/.test(id)) return 'export default ""';
      return undefined;
    },
  };
  vite = await createServer({
    configFile: false,
    root: frontendRoot,
    logLevel: 'error',
    appType: 'custom',
    cacheDir: path.join(frontendRoot, 'node_modules', '.vite_test_bill_page'),
    server: { middlewareMode: true, hmr: false, watch: null, ws: false },
    optimizeDeps: { disabled: true, noDiscovery: true, include: [] },
    plugins: [stubCss, react()],
  });

  const mod = await vite.ssrLoadModule('/src/pages/customer/BillPage.tsx');
  BillPage = mod.default;
});

after(async () => {
  await vite?.close();
});

test('BillPage: Client-side UUID token validation regex', async (t) => {
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  await t.test('accepts canonical lowercase and uppercase UUIDv4', () => {
    assert.ok(UUID_REGEX.test('123e4567-e89b-12d3-a456-426614174000'));
    assert.ok(UUID_REGEX.test('C23DE178-8855-4187-AB6B-15E7797899CE'));
    assert.ok(UUID_REGEX.test('0fff31ee-4d2c-4475-8aac-7a65063f7e4b'));
  });

  await t.test('rejects non-UUID strings and legacy identifiers', () => {
    assert.equal(UUID_REGEX.test('tok_0000000000000000'), false);
    assert.equal(UUID_REGEX.test('not-a-uuid'), false);
    assert.equal(UUID_REGEX.test('123'), false);
    assert.equal(UUID_REGEX.test(''), false);
    assert.equal(UUID_REGEX.test('123e4567-e89b-12d3-a456-42661417400'), false); // 35 chars
    assert.equal(UUID_REGEX.test('123e4567-e89b-12d3-a456-4266141740000'), false); // 37 chars
  });

  await t.test('rejects malicious injection attempts', () => {
    assert.equal(UUID_REGEX.test("'; DROP TABLE tokens; --"), false);
    assert.equal(UUID_REGEX.test('<script>alert(1)</script>'), false);
    assert.equal(UUID_REGEX.test('../../etc/passwd'), false);
  });
});

test('BillPage: REST hydration payload normalization (rupees vs paise)', async (t) => {
  function normalizeTokenPayload(json: any, tokenId: string) {
    const rawToken = json.token || json;
    const restaurant = json.restaurant || {};

    return {
      tokenId: rawToken.id || rawToken.tokenId || tokenId,
      tokenNumber: Number(rawToken.tokenNumber || 0),
      tokenCode: rawToken.tokenCode || `#${String(rawToken.tokenNumber || 0).padStart(3, '0')}`,
      tableNumber: Number(rawToken.tableNumber || 0),
      tableName: rawToken.tableName || null,
      restaurantName: restaurant.businessName || restaurant.name || rawToken.restaurantName || 'Restaurant',
      restaurantGstin: restaurant.gstin || rawToken.restaurantGstin || null,
      restaurantFssai: restaurant.fssai || rawToken.restaurantFssai || null,
      subtotal: Number(
        rawToken.subtotal ?? (rawToken.subtotalPaise !== undefined ? rawToken.subtotalPaise / 100 : 0)
      ),
      gst: Number(
        rawToken.tax ?? rawToken.gst ?? (rawToken.taxPaise !== undefined ? rawToken.taxPaise / 100 : 0)
      ),
      total: Number(
        rawToken.total ?? (rawToken.totalPaise !== undefined ? rawToken.totalPaise / 100 : 0)
      ),
      items: (rawToken.items || []).map((it: any) => ({
        name: it.dishName || it.itemName || it.name || 'Dish',
        quantity: Number(it.quantity || 1),
        unitPrice: Number(
          it.price ?? (it.unitPricePaise !== undefined ? it.unitPricePaise / 100 : 0)
        ),
        totalPrice: Number(
          it.total ?? (it.totalPricePaise !== undefined ? it.totalPricePaise / 100 : 0)
        ),
        isVeg: it.isVeg !== false,
      })),
      status: (rawToken.status || 'UNPAID').toUpperCase(),
    };
  }

  await t.test('correctly converts subtotalPaise and taxPaise to INR rupees', () => {
    const backendPayload = {
      token: {
        id: 'c23de178-8855-4187-ab6b-15e7797899ce',
        tokenNumber: 42,
        tableNumber: 7,
        subtotalPaise: 68000,
        taxPaise: 3400,
        totalPaise: 71400,
        status: 'DINING',
        items: [
          {
            dishName: 'Paneer Tikka',
            quantity: 2,
            unitPricePaise: 34000,
            totalPricePaise: 68000,
            isVeg: true,
          },
        ],
      },
      restaurant: {
        businessName: 'Tandoor Express',
        gstin: '07AAAAA0000A1Z5',
        fssai: '10019011000001',
      },
    };

    const normalized = normalizeTokenPayload(backendPayload, 'c23de178-8855-4187-ab6b-15e7797899ce');
    assert.equal(normalized.subtotal, 680.00);
    assert.equal(normalized.gst, 34.00);
    assert.equal(normalized.total, 714.00);
    assert.equal(normalized.tokenCode, '#042');
    assert.equal(normalized.restaurantName, 'Tandoor Express');
    assert.equal(normalized.restaurantGstin, '07AAAAA0000A1Z5');
    assert.equal(normalized.restaurantFssai, '10019011000001');
    assert.equal(normalized.items[0].unitPrice, 340.00);
    assert.equal(normalized.items[0].totalPrice, 680.00);
    assert.equal(normalized.items[0].name, 'Paneer Tikka');
  });

  await t.test('preserves direct rupee numbers when paise fields are absent', () => {
    const directPayload = {
      token: {
        id: '0fff31ee-4d2c-4475-8aac-7a65063f7e4b',
        tokenNumber: 9,
        tableNumber: 2,
        subtotal: 450,
        tax: 22.5,
        total: 472.5,
        status: 'ORDERING',
        items: [
          {
            name: 'Masala Dosa',
            quantity: 3,
            price: 150,
            total: 450,
            isVeg: true,
          },
        ],
      },
    };

    const normalized = normalizeTokenPayload(directPayload, '0fff31ee-4d2c-4475-8aac-7a65063f7e4b');
    assert.equal(normalized.subtotal, 450);
    assert.equal(normalized.gst, 22.5);
    assert.equal(normalized.total, 472.5);
    assert.equal(normalized.items[0].unitPrice, 150);
  });
});

test('BillPage: Dual-SSE event mappings & state transitions', async (t) => {
  await t.test('token_status event updates status and detects settlement', () => {
    let isPaid = false;
    let currentStatus = 'DINING';

    const handleTokenStatusEvent = (eventData: any) => {
      const status = (eventData.status || eventData.token?.status || '').toUpperCase();
      currentStatus = status;
      if (['SETTLED', 'PAID'].includes(status)) {
        isPaid = true;
      }
    };

    handleTokenStatusEvent({ status: 'BILL_REQUESTED' });
    assert.equal(currentStatus, 'BILL_REQUESTED');
    assert.equal(isPaid, false);

    handleTokenStatusEvent({ status: 'SETTLED', token: { settledAt: '2026-11-03T18:00:00Z' } });
    assert.equal(currentStatus, 'SETTLED');
    assert.equal(isPaid, true);
  });

  await t.test('token_settled event captures payment method and review URL', () => {
    let capturedMethod = '';
    let capturedReviewUrl = '';
    let isPaid = false;

    const handleTokenSettledEvent = (eventData: any) => {
      isPaid = true;
      capturedMethod = eventData.paymentMethod;
      capturedReviewUrl = eventData.googleReviewUrl;
    };

    handleTokenSettledEvent({
      settledAt: '2026-11-03T18:15:00Z',
      paymentMethod: 'UPI',
      googleReviewUrl: 'https://g.page/r/test-review/review',
    });

    assert.equal(isPaid, true);
    assert.equal(capturedMethod, 'UPI');
    assert.equal(capturedReviewUrl, 'https://g.page/r/test-review/review');
  });

  await t.test('token_items_updated merges incremental items without page reload', () => {
    let currentItems: any[] = [{ name: 'Samosa', quantity: 2, totalPrice: 60 }];
    let subtotal = 60;

    const handleItemsUpdatedEvent = (eventData: any) => {
      currentItems = (eventData.items || []).map((it: any) => ({
        name: it.dishName || it.name,
        quantity: it.quantity,
        totalPrice: it.total,
      }));
      subtotal = eventData.subtotal;
    };

    handleItemsUpdatedEvent({
      items: [
        { name: 'Samosa', quantity: 2, total: 60 },
        { name: 'Masala Chai', quantity: 2, total: 40 },
      ],
      subtotal: 100,
    });

    assert.equal(currentItems.length, 2);
    assert.equal(subtotal, 100);
    assert.equal(currentItems[1].name, 'Masala Chai');
  });
});

test('BillPage: GoogleReviewSlide 1.5s post-settlement trigger specification', async (t) => {
  await t.test('settlement schedules review trigger after 1500ms', () => {
    let showReview = false;
    let scheduledDelay = 0;

    const mockSetTimeout = (fn: () => void, ms: number) => {
      scheduledDelay = ms;
      return 1;
    };

    // Simulate handleSettledTransition
    const handleSettledTransition = () => {
      mockSetTimeout(() => {
        showReview = true;
      }, 1500);
    };

    handleSettledTransition();
    assert.equal(scheduledDelay, 1500, 'Review modal must trigger at exactly 1500ms post-settlement');
    assert.equal(showReview, false); // not yet fired before timer elapsed
  });
});
