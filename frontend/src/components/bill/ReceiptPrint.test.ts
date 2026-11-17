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
let ReceiptPrint: React.ComponentType<any>;
let ReceiptStamp: React.ComponentType<any>;
let KotReceipt: React.ComponentType<any>;
let kotTargetLabel: (o: any) => string;

before(async () => {
  const stubCss = {
    name: 'receipt-stub-css',
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
    cacheDir: path.join(frontendRoot, 'node_modules', '.vite_test_receipt'),
    server: { middlewareMode: true, hmr: false, watch: null, ws: false },
    optimizeDeps: { disabled: true, noDiscovery: true, include: [] },
    plugins: [stubCss, react()],
  });
  const mod = await vite.ssrLoadModule('/src/components/bill/ReceiptPrint.tsx');
  ReceiptPrint = mod.default;
  ReceiptStamp = mod.ReceiptStamp;
  const kot = await vite.ssrLoadModule('/src/components/bill/KotReceipt.tsx');
  KotReceipt = kot.default;
  kotTargetLabel = kot.kotTargetLabel;
});

after(async () => {
  await vite?.close();
});

async function toHtml(element: React.ReactElement): Promise<string> {
  const { prelude } = await prerender(element);
  return (await new Response(prelude).text()).replace(/<!--.*?-->/g, '');
}

test('ReceiptPrint wraps any receipt lines in the printer frame', async () => {
  const html = await toHtml(
    React.createElement(ReceiptPrint, { ariaLabel: 'Test receipt', machineLabel: 'TEST-80' },
      React.createElement('p', null, 'Masala Dosa x2'))
  );
  assert.ok(html.includes('Masala Dosa x2'), 'renders the lines it was given');
  assert.ok(html.includes('TEST-80'), 'shows the printer label');
  assert.ok(html.includes('aria-label="Test receipt"'), 'names the paper for screen readers');
  assert.ok(html.includes('pos-machine-head'), 'has the printer head');
  assert.ok(html.includes('thermal-card-clipped'), 'uses the torn paper');
});

test('ReceiptPrint: FEED button can be hidden; narrow paper for 58 mm', async () => {
  const html = await toHtml(
    React.createElement(ReceiptPrint, { ariaLabel: 'x', showFeedButton: false, narrow: true }, 'line')
  );
  assert.ok(!html.includes('FEED'), 'no FEED button');
  assert.ok(html.includes('is-narrow'), '58 mm class');
});

test('ReceiptStamp: approved is green ink, declined is red ink', async () => {
  const approved = await toHtml(React.createElement(ReceiptStamp, { kind: 'approved', title: 'APPROVED', sub: 'PAYMENT VERIFIED' }));
  assert.ok(approved.includes('APPROVED'));
  assert.ok(approved.includes('data-stamp="approved"'));
  assert.ok(!approved.includes('declined'));
  const declined = await toHtml(React.createElement(ReceiptStamp, { kind: 'declined', title: 'DECLINED' }));
  assert.ok(declined.includes('thermal-rubber-stamp declined'));
});

test('KOT preview shows dishes and quantities, never prices', async () => {
  const order = {
    id: 'ab12cd34ef', time: '2026-11-12T10:30:00.000Z', orderType: 'DINE_IN', tableNumber: '4', tableSource: 'legacy',
    customerName: 'Asha', notes: 'Less spicy',
    items: [
      { id: '1', name: 'Paneer Tikka', quantity: 2, price: 260 },
      { id: '2', name: 'Butter Naan', quantity: 3, price: 50, variant: 'Garlic' },
    ],
  };
  const html = await toHtml(React.createElement(KotReceipt, { order, restaurantName: 'Spice Route', paperWidth: '80mm' }));
  assert.ok(html.includes('TABLE 4'));
  assert.ok(html.includes('Paneer Tikka') && html.includes('Butter Naan') && html.includes('Garlic'));
  assert.ok(html.includes('Less spicy'));
  assert.ok(html.includes('OLD STICKER'), 'old-sticker orders are flagged for the kitchen');
  assert.ok(html.includes('>5<'), 'total quantity 2 + 3');
  assert.ok(!html.includes('₹'), 'a KOT carries no prices');
});

test('KOT target label covers delivery and takeaway', () => {
  assert.equal(kotTargetLabel({ orderType: 'DELIVERY', tableNumber: null }), 'DELIVERY');
  assert.equal(kotTargetLabel({ orderType: 'TAKEAWAY', tableNumber: 'TAKEAWAY' }), 'TAKEAWAY');
  assert.equal(kotTargetLabel({ orderType: 'DINE_IN', tableNumber: '7' }), 'TABLE 7');
});
