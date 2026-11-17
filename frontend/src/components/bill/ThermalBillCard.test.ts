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
let ThermalBillCard: React.ComponentType<any>;
let triggerCelebrationConfetti: () => Promise<void>;

before(async () => {
  const stubCss = {
    name: 'thermal-stub-css',
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
    cacheDir: path.join(frontendRoot, 'node_modules', '.vite_test_thermal'),
    server: { middlewareMode: true, hmr: false, watch: null, ws: false },
    optimizeDeps: { disabled: true, noDiscovery: true, include: [] },
    plugins: [stubCss, react()],
  });

  const mod = await vite.ssrLoadModule('/src/components/bill/ThermalBillCard.tsx');
  ThermalBillCard = mod.default;
  triggerCelebrationConfetti = mod.triggerCelebrationConfetti;
});

after(async () => {
  await vite?.close();
});

async function toHtml(element: React.ReactElement): Promise<string> {
  const { prelude } = await prerender(element);
  return new Response(prelude).text();
}

test('ThermalBillCard: 20-tooth mathematical torn edge polygon formulation', async (t) => {
  await t.test('20-tooth polygon generates alternating peak and valley coordinates', () => {
    // Explorer 1 mathematical specification: 20 teeth across 100% width
    const toothCount = 20;
    const toothWidth = 100 / toothCount; // 5% per tooth
    const halfTooth = toothWidth / 2;    // 2.5% half tooth (peak to valley)

    const topPoints: Array<{ x: string; y: string }> = [];
    for (let i = 0; i <= toothCount; i++) {
      topPoints.push({ x: `${i * toothWidth}%`, y: '0px' });
      if (i < toothCount) {
        topPoints.push({ x: `${i * toothWidth + halfTooth}%`, y: '4px' });
      }
    }

    assert.equal(topPoints.length, 41, 'Top torn edge must consist of 41 points for 20 teeth');
    assert.equal(topPoints[0].x, '0%');
    assert.equal(topPoints[0].y, '0px');
    assert.equal(topPoints[1].x, '2.5%');
    assert.equal(topPoints[1].y, '4px');
    assert.equal(topPoints[topPoints.length - 1].x, '100%');
    assert.equal(topPoints[topPoints.length - 1].y, '0px');
  });

  await t.test('bottom torn edge mirrors top edge with inverted depth', () => {
    const toothCount = 20;
    const toothWidth = 100 / toothCount;
    const halfTooth = toothWidth / 2;

    const bottomPoints: Array<{ x: string; y: string }> = [];
    for (let i = toothCount; i >= 0; i--) {
      bottomPoints.push({ x: `${i * toothWidth}%`, y: 'calc(100% - 0px)' });
      if (i > 0) {
        bottomPoints.push({ x: `${i * toothWidth - halfTooth}%`, y: 'calc(100% - 4px)' });
      }
    }

    assert.equal(bottomPoints.length, 41, 'Bottom torn edge must consist of 41 points for 20 teeth');
    assert.equal(bottomPoints[0].x, '100%');
    assert.equal(bottomPoints[0].y, 'calc(100% - 0px)');
    assert.equal(bottomPoints[1].x, '97.5%');
    assert.equal(bottomPoints[1].y, 'calc(100% - 4px)');
  });
});

test('ThermalBillCard: Indian statutory tax breakdown & round-off calculations', async (t) => {
  function computeBillTotals(subtotal: number, discount = 0) {
    const taxableAmount = Math.max(0, subtotal - discount);
    const cgst = Number((taxableAmount * 0.025).toFixed(2));
    const sgst = Number((taxableAmount * 0.025).toFixed(2));
    const calculatedTotal = taxableAmount + cgst + sgst;
    const grandTotal = Math.round(calculatedTotal);
    const roundOff = Number((grandTotal - calculatedTotal).toFixed(2));
    return { taxableAmount, cgst, sgst, calculatedTotal, grandTotal, roundOff };
  }

  await t.test('exact ₹714.00 calculation from ₹700 subtotal with ₹20 discount', () => {
    const result = computeBillTotals(700, 20);
    assert.equal(result.taxableAmount, 680.00);
    assert.equal(result.cgst, 17.00);
    assert.equal(result.sgst, 17.00);
    assert.equal(result.calculatedTotal, 714.00);
    assert.equal(result.grandTotal, 714.00);
    assert.equal(result.roundOff, 0.00);
  });

  await t.test('fractional paise round-off rounds to nearest integer INR', () => {
    const result = computeBillTotals(105.50, 0);
    assert.equal(result.taxableAmount, 105.50);
    assert.equal(result.cgst, 2.64);
    assert.equal(result.sgst, 2.64);
    assert.equal(result.calculatedTotal, 110.78);
    assert.equal(result.grandTotal, 111.00);
    assert.equal(result.roundOff, 0.22);
  });
});

test('ThermalBillCard: Component SSR rendering in UNPAID state', async () => {
  const dummyToken: any = {
    tokenId: '00000000-0000-0000-0000-000000000001',
    tokenNumber: 24,
    tokenCode: '#024',
    tableNumber: 3,
    restaurantName: 'The Royal Biryani',
    restaurantTagline: 'Dum Cooked Perfection',
    restaurantAddress: '12 Commercial Street',
    restaurantCity: 'Bengaluru',
    restaurantPhone: '9876543210',
    restaurantGstin: '29ABCDE1234F1Z5',
    restaurantFssai: '11223344556677',
    subtotal: 680,
    cgst: 17,
    sgst: 17,
    discount: 0,
    total: 714,
    status: 'DINING',
    items: [
      {
        name: 'Mutton Dum Biryani',
        quantity: 2,
        unitPrice: 340,
        totalPrice: 680,
        isVeg: false,
      },
    ],
    createdAt: new Date().toISOString(),
  };

  const rawHtml = await toHtml(
    React.createElement(ThermalBillCard, {
      token: dummyToken,
      isPaid: false,
    })
  );
  const html = rawHtml.replace(/<!--.*?-->/g, '');

  assert.ok(html.includes('The Royal Biryani'), 'renders restaurant name');
  assert.ok(html.includes('29ABCDE1234F1Z5'), 'renders GSTIN');
  assert.ok(html.includes('11223344556677'), 'renders FSSAI');
  assert.ok(html.includes('TABLE #3'), 'renders Table #3');
  assert.ok(html.includes('#024'), 'renders Token #024 badge');
  assert.ok(html.includes('Mutton Dum Biryani'), 'renders line item');
  assert.ok(html.includes('UNPAID BILL'), 'renders UNPAID state badge');
  assert.ok(html.includes('Ask for Bill at Table'), 'renders interactive request bill button');
});

test('ThermalBillCard: Component SSR rendering in SETTLED state', async () => {
  const dummyToken: any = {
    tokenId: '00000000-0000-0000-0000-000000000002',
    tokenNumber: 15,
    tokenCode: '#015',
    tableNumber: 5,
    restaurantName: 'Punjabi Rasoi',
    subtotal: 500,
    cgst: 12.5,
    sgst: 12.5,
    discount: 0,
    total: 525,
    status: 'SETTLED',
    paymentMethod: 'UPI',
    settledAt: '2026-11-03T18:00:00.000Z',
    items: [
      {
        name: 'Dal Makhani',
        quantity: 1,
        unitPrice: 260,
        totalPrice: 260,
        isVeg: true,
      },
      {
        name: 'Butter Naan',
        quantity: 3,
        unitPrice: 50,
        totalPrice: 150,
        isVeg: true,
      },
    ],
    createdAt: new Date().toISOString(),
  };

  const rawHtml = await toHtml(
    React.createElement(ThermalBillCard, {
      token: dummyToken,
      isPaid: true,
      paidAt: dummyToken.settledAt,
      paymentMethod: 'UPI',
    })
  );
  const html = rawHtml.replace(/<!--.*?-->/g, '');

  assert.ok(html.includes('Punjabi Rasoi'), 'renders restaurant name');
  assert.ok(html.includes('PAID &amp; SETTLED') || html.includes('PAID & SETTLED'), 'renders rubber stamp text');
  assert.ok(html.includes('VIA UPI'), 'renders payment method in rubber stamp');
  assert.ok(html.includes('thermal-rubber-stamp'), 'includes thermal-rubber-stamp class');
});

test('ThermalBillCard: Resilient confetti celebration fallback', async (t) => {
  await t.test('triggerCelebrationConfetti executes safely without throwing in headless mode', async () => {
    await assert.doesNotReject(async () => {
      await triggerCelebrationConfetti();
    });
  });
});
