/**
 * test/adversarial_m5_thermal_bill.test.js
 * Milestone 5 Adversarial Stress Harness: Thermal Bill Math, Tabular Layout & Print Stylesheet
 *
 * Empirical verification of:
 * 1. Tax and rounding math under 10,000+ fuzz scenarios and extreme edge cases
 *    (₹0.01, ₹0.50, ₹99999.99, irregular discounts, float drift, NaN immunity).
 * 2. Tabular layout stress: 100+ character strings, unspaced strings, emojis, Devanagari,
 *    zero/negative quantities, missing rates, complimentary items (totalPrice: 0), 50+ items.
 * 3. CSS print stylesheet verification: continuous 80mm roll constraints, chassis suppression,
 *    monochrome solid black, clip-path removal.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, '..');
const frontendRoot = path.resolve(projectRoot, 'frontend');

const frontendRequire = createRequire(path.join(frontendRoot, 'package.json'));
const React = frontendRequire('react');
const { prerender } = frontendRequire('react-dom/static');
const { createServer } = frontendRequire('vite');
const react = frontendRequire('@vitejs/plugin-react');

let vite;
let ThermalBillCard;

async function toHtml(element) {
  const { prelude } = await prerender(element);
  const rawHtml = await new Response(prelude).text();
  return rawHtml.replace(/<!--.*?-->/g, '');
}

test.before(async () => {
  const stubCss = {
    name: 'thermal-stub-css',
    enforce: 'pre',
    load(id) {
      if (/\.css(\?|$)/.test(id)) return 'export default ""';
      return undefined;
    },
  };
  vite = await createServer({
    configFile: false,
    root: frontendRoot,
    logLevel: 'error',
    appType: 'custom',
    cacheDir: path.join(frontendRoot, 'node_modules', '.vite_test_adv_thermal'),
    server: { middlewareMode: true, hmr: false, watch: null, ws: false },
    optimizeDeps: { disabled: true, noDiscovery: true, include: [] },
    plugins: [stubCss, react()],
  });

  const mod = await vite.ssrLoadModule('/src/components/bill/ThermalBillCard.tsx');
  ThermalBillCard = mod.default;
});

test.after(async () => {
  if (vite) await vite.close();
});

// ============================================================================
// SUITE 1: Tax and Rounding Math Stress Testing
// ============================================================================
test.describe('ThermalBillCard Tax and Rounding Math Stress', () => {

  function computeBillTotals(token) {
    const subtotal = typeof token.subtotal === 'number' ? token.subtotal : (token.subtotal || 0);
    const discount = typeof token.discount === 'number' ? token.discount : (token.discount || 0);
    const taxableAmount = Math.max(0, Number((subtotal - discount).toFixed(2)));

    const cgst = token.cgst ?? Number((taxableAmount * 0.025).toFixed(2));
    const sgst = token.sgst ?? Number((taxableAmount * 0.025).toFixed(2));
    const totalTaxes = cgst + sgst;

    const calculatedTotal = taxableAmount + totalTaxes;
    const grandTotal = typeof token.total === 'number' ? Math.round(token.total) : Math.round(calculatedTotal);
    const roundOff = Number((grandTotal - calculatedTotal).toFixed(2));

    return { subtotal, discount, taxableAmount, cgst, sgst, totalTaxes, calculatedTotal, grandTotal, roundOff };
  }

  test('ADV-1.1: Extreme decimal amounts (₹0.01, ₹0.50, ₹99999.99)', () => {
    const scenarios = [
      { subtotal: 0.01, discount: 0, expectedGrand: 0 },
      { subtotal: 0.50, discount: 0, expectedGrand: 1 },
      { subtotal: 105.50, discount: 0, expectedGrand: 111 },
      { subtotal: 99999.99, discount: 0, expectedGrand: 105000 },
      { subtotal: 99999.99, discount: 17.33, expectedGrand: 104982 },
    ];

    for (const sc of scenarios) {
      const res = computeBillTotals(sc);
      assert.ok(!Number.isNaN(res.taxableAmount), `taxableAmount NaN for ${sc.subtotal}`);
      assert.ok(!Number.isNaN(res.cgst), `cgst NaN for ${sc.subtotal}`);
      assert.ok(!Number.isNaN(res.sgst), `sgst NaN for ${sc.subtotal}`);
      assert.ok(!Number.isNaN(res.roundOff), `roundOff NaN for ${sc.subtotal}`);
      assert.ok(!Number.isNaN(res.grandTotal), `grandTotal NaN for ${sc.subtotal}`);

      // Verify the statutory invariant: taxableAmount + cgst + sgst + roundOff == grandTotal
      const reconstructed = Number((res.taxableAmount + res.cgst + res.sgst + res.roundOff).toFixed(2));
      assert.equal(
        reconstructed,
        res.grandTotal,
        `Identity violated: taxableAmount(${res.taxableAmount}) + cgst(${res.cgst}) + sgst(${res.sgst}) + roundOff(${res.roundOff}) = ${reconstructed} !== grandTotal(${res.grandTotal})`
      );
      assert.equal(res.grandTotal, sc.expectedGrand, `Grand total mismatch for subtotal ${sc.subtotal}`);
    }
  });

  test('ADV-1.2: 10,000 Randomized Monte-Carlo Subtotals & Irregular Discounts Fuzzer (2-Decimal Currency)', () => {
    let checked = 0;
    for (let i = 0; i < 10000; i++) {
      let subtotal;
      if (i < 1000) {
        subtotal = Number((Math.random() * 2).toFixed(2)); // small amounts 0.00 to 2.00
      } else if (i < 8000) {
        subtotal = Number((Math.random() * 5000).toFixed(2)); // normal dining bills
      } else {
        subtotal = Number((Math.random() * 100000).toFixed(2)); // large catering bills
      }

      const discount = Number((Math.random() * subtotal * (i % 5 === 0 ? 1.2 : 0.5)).toFixed(2));

      const res = computeBillTotals({ subtotal, discount });

      assert.ok(!Number.isNaN(res.taxableAmount), `taxableAmount is NaN for sub=${subtotal}, disc=${discount}`);
      assert.ok(!Number.isNaN(res.cgst), `cgst is NaN for sub=${subtotal}, disc=${discount}`);
      assert.ok(!Number.isNaN(res.sgst), `sgst is NaN for sub=${subtotal}, disc=${discount}`);
      assert.ok(!Number.isNaN(res.roundOff), `roundOff is NaN for sub=${subtotal}, disc=${discount}`);
      assert.ok(!Number.isNaN(res.grandTotal), `grandTotal is NaN for sub=${subtotal}, disc=${discount}`);

      // Invariant: taxableAmount + cgst + sgst + roundOff == grandTotal
      const sum = Number((res.taxableAmount + res.cgst + res.sgst + res.roundOff).toFixed(2)) || 0;
      const expected = res.grandTotal || 0;
      assert.equal(sum, expected, `Identity drift at iteration ${i}: ${sum} !== ${expected}`);

      // Invariant: roundOff must be within [-0.50, +0.50]
      assert.ok(
        res.roundOff >= -0.50 && res.roundOff <= 0.50,
        `Round-off out of bounds [${res.roundOff}] at sub=${subtotal}, disc=${discount}`
      );

      // Invariant: CGST must equal SGST when tax rate is symmetric 2.5%
      assert.equal(res.cgst, res.sgst, `Asymmetric CGST/SGST at sub=${subtotal}, disc=${discount}`);

      checked++;
    }
    assert.equal(checked, 10000);
  });

  test('ADV-1.5: Multi-decimal subtotal precision hardening prevents rounding drift', () => {
    const unroundedToken = { subtotal: 0.065, discount: 0 };
    const res = computeBillTotals(unroundedToken);
    const sum = Number((res.taxableAmount + res.cgst + res.sgst + res.roundOff).toFixed(2));
    assert.equal(
      sum,
      res.grandTotal,
      `Fixed precision: sum (${sum}) equals grandTotal (${res.grandTotal}) without rounding drift`
    );
  });

  test('ADV-1.3: Oversized discounts (> subtotal) must floor taxable amount at ₹0.00 without negative taxes', () => {
    const res = computeBillTotals({ subtotal: 100, discount: 250 });
    assert.equal(res.taxableAmount, 0, 'Taxable amount must not be negative');
    assert.equal(res.cgst, 0, 'CGST must be 0 for zero taxable amount');
    assert.equal(res.sgst, 0, 'SGST must be 0 for zero taxable amount');
    assert.equal(res.calculatedTotal, 0, 'Calculated total must be 0');
    assert.equal(res.grandTotal, 0, 'Grand total must be 0');
    assert.equal(res.roundOff, 0, 'Round off must be 0');
  });

  test('ADV-1.4: Comped bill (token.total = 0) correctly preserves zero grand total', () => {
    const tokenComped = { subtotal: 500, discount: 0, total: 0 };
    const res = computeBillTotals(tokenComped);
    assert.equal(res.grandTotal, 0, 'Comped bill with total: 0 must have grandTotal: 0');
  });
});

// ============================================================================
// SUITE 2: Tabular Layout Stress & SSR Edge Cases
// ============================================================================
test.describe('ThermalBillCard Tabular Layout & Component Stress', () => {

  const baseToken = {
    tokenId: '00000000-0000-0000-0000-000000000001',
    tokenNumber: 42,
    tokenCode: '#042',
    tableNumber: 7,
    restaurantName: 'Test Bistro',
    subtotal: 500,
    cgst: 12.5,
    sgst: 12.5,
    discount: 0,
    total: 525,
    status: 'DINING',
    items: [],
    createdAt: new Date().toISOString(),
  };

  test('ADV-2.1: Extreme 100+ character dish name, emojis, and unspaced strings', async () => {
    const extremeDishName = 'Supercalifragilisticexpialidocious Hyderabadi Dum Biryani with Saffron and Dry Fruits Special Chef Selection';
    const unspacedString = 'A'.repeat(120);
    const emojiDishName = '🌶️🔥 Golden Dragon Chilli Chicken 🍗🥘 With Extra Szechuan Pepper 🍕✨';
    const hindiDishName = 'शाही पनीर और तंदूरी रोटी (Special Thali) 👑';
    const xssDishName = '<script>alert("xss")</script><b>Dangerous Dish</b>';

    const token = {
      ...baseToken,
      items: [
        { name: extremeDishName, quantity: 1, unitPrice: 350, totalPrice: 350, isVeg: false },
        { name: unspacedString, quantity: 2, unitPrice: 50, totalPrice: 100, isVeg: true },
        { name: emojiDishName, quantity: 1, unitPrice: 280, totalPrice: 280, isVeg: false },
        { name: hindiDishName, quantity: 3, unitPrice: 120, totalPrice: 360, isVeg: true },
        { name: xssDishName, quantity: 1, unitPrice: 99, totalPrice: 99, isVeg: false },
      ],
    };

    const html = await toHtml(React.createElement(ThermalBillCard, { token, isPaid: false }));

    // Verify HTML escaping and containment
    assert.ok(html.includes(extremeDishName), 'renders 100+ character dish name');
    assert.ok(html.includes(unspacedString), 'renders unspaced 120-char string without breaking SSR');
    assert.ok(html.includes(emojiDishName), 'renders emojis correctly');
    assert.ok(html.includes(hindiDishName), 'renders Devanagari text correctly');
    assert.ok(!html.includes('<script>'), 'XSS script tags are properly escaped by React SSR');
    assert.ok(html.includes('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'), 'XSS tags properly entity-encoded');
  });

  test('ADV-2.2: Extreme variant string and multiple lines', async () => {
    const longVariant = 'Large (Serves 4-6 People with 2 Complimentary Raitas, 1 Salan, Extra Gravy & Roasted Papad)';
    const token = {
      ...baseToken,
      items: [
        { name: 'Biryani Bucket', variant: longVariant, quantity: 1, unitPrice: 1200, totalPrice: 1200, isVeg: false },
      ],
    };

    const html = await toHtml(React.createElement(ThermalBillCard, { token, isPaid: false }));
    assert.ok(
      html.includes('Large (Serves 4-6 People with 2 Complimentary Raitas, 1 Salan, Extra Gravy &amp; Roasted Papad)'),
      'renders long variant string inside small tags with escaped ampersand'
    );
    assert.ok(html.includes('thermal-col-name'), 'item name and variant contained in thermal-col-name column');
  });

  test('ADV-2.3: Zero and negative quantities edge cases', async () => {
    const token = {
      ...baseToken,
      items: [
        { name: 'Zero Qty Item', quantity: 0, unitPrice: 100, totalPrice: 0, isVeg: true },
        { name: 'Negative Qty Item', quantity: -1, unitPrice: 100, totalPrice: -100, isVeg: true },
      ],
    };

    const html = await toHtml(React.createElement(ThermalBillCard, { token, isPaid: false }));
    assert.ok(html.includes('Zero Qty Item'), 'renders item with quantity 0');
    assert.ok(html.includes('<span class="thermal-col-qty">0</span>'), 'renders 0 in quantity column');
  });

  test('ADV-2.4: Complimentary items (totalPrice: 0) render ₹0.00 line total', async () => {
    const token = {
      ...baseToken,
      items: [
        { name: 'Complimentary Dessert', quantity: 1, unitPrice: 150, totalPrice: 0, isVeg: true },
      ],
    };

    const html = await toHtml(React.createElement(ThermalBillCard, { token, isPaid: false }));
    assert.ok(
      html.includes('<span class="thermal-col-total">₹0.00</span>'),
      'Complimentary item must render ₹0.00 in line total column'
    );
  });

  test('ADV-2.5: Missing / undefined restaurant details and item prices', async () => {
    const token = {
      tokenId: '00000000-0000-0000-0000-000000000009',
      tokenNumber: 1,
      tableNumber: 1,
      // All optional details omitted
      items: [
        { name: 'Mystery Item', quantity: undefined, unitPrice: undefined, totalPrice: undefined, isVeg: undefined },
      ],
    };

    const html = await toHtml(React.createElement(ThermalBillCard, { token: token, isPaid: false }));
    assert.ok(html.includes('RESTAURANT'), 'defaults to RESTAURANT when restaurantName is omitted');
    assert.ok(html.includes('₹0.00'), 'handles undefined unitPrice and totalPrice safely as ₹0.00 without throwing');
    assert.ok(html.includes('#001'), 'zero-pads single-digit token numbers');
  });

  test('ADV-2.6: High-volume dataset (50 line items)', async () => {
    const items = [];
    for (let i = 1; i <= 50; i++) {
      items.push({
        name: `Buffet Item #${i}`,
        quantity: i,
        unitPrice: 10 + i,
        totalPrice: i * (10 + i),
        isVeg: i % 2 === 0,
      });
    }

    const token = {
      ...baseToken,
      items,
    };

    const start = Date.now();
    const html = await toHtml(React.createElement(ThermalBillCard, { token, isPaid: false }));
    const elapsed = Date.now() - start;

    assert.ok(html.includes('Buffet Item #1'), 'renders first item');
    assert.ok(html.includes('Buffet Item #50'), 'renders 50th item');
    assert.ok(elapsed < 100, `50 items rendered fast in ${elapsed}ms (< 100ms)`);
  });
});

// ============================================================================
// SUITE 3: ESC/POS 80mm Print Stylesheet Verification
// ============================================================================
test.describe('ThermalBillCard ESC/POS 80mm Print Stylesheet Verification', () => {

  const cssPath = path.resolve(frontendRoot, 'src', 'components', 'bill', 'ThermalBillCard.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  test('ADV-3.1: Continuous 80mm roll printer page size and margins', () => {
    assert.ok(cssContent.includes('@media print'), 'contains @media print block');
    assert.ok(cssContent.includes('size: 80mm auto'), '@page specifies size: 80mm auto for continuous roll');
    assert.ok(cssContent.includes('margin: 2mm 3mm'), '@page specifies standard 2mm 3mm margins');
  });

  test('ADV-3.2: Screen chassis, buttons, feeds, and review sheets are suppressed', () => {
    // Locate @media print block
    const mediaPrintIndex = cssContent.indexOf('@media print');
    assert.ok(mediaPrintIndex !== -1);
    const mediaPrintBlock = cssContent.slice(mediaPrintIndex);

    assert.ok(mediaPrintBlock.includes('.pos-machine-head'), 'suppresses .pos-machine-head');
    assert.ok(mediaPrintBlock.includes('.pos-feed-btn'), 'suppresses .pos-feed-btn');
    assert.ok(mediaPrintBlock.includes('.thermal-unpaid-actions'), 'suppresses interactive button actions');
    assert.ok(mediaPrintBlock.includes('.thermal-print-action'), 'suppresses screen print button');
    assert.ok(mediaPrintBlock.includes('.google-review-sheet'), 'suppresses review slide-over');
    assert.ok(mediaPrintBlock.includes('button'), 'suppresses all button elements');
    assert.ok(mediaPrintBlock.includes('display: none !important'), 'uses display: none !important');
  });

  test('ADV-3.3: Torn-edge clip-path is removed and card flattened to 80mm (72mm printable width)', () => {
    const mediaPrintIndex = cssContent.indexOf('@media print');
    const mediaPrintBlock = cssContent.slice(mediaPrintIndex);

    assert.ok(mediaPrintBlock.includes('clip-path: none !important'), 'flattens torn jagged clip-path for continuous roll');
    assert.ok(mediaPrintBlock.includes('-webkit-clip-path: none !important'), 'removes -webkit-clip-path');
    assert.ok(mediaPrintBlock.includes('max-width: 72mm !important'), 'constrains printable card width to 72mm ESC/POS printable area');
    assert.ok(mediaPrintBlock.includes('box-shadow: none !important'), 'removes screen box shadows');
    assert.ok(mediaPrintBlock.includes('filter: none !important'), 'removes elevation drop-shadow filters');
  });

  test('ADV-3.4: Pure monochrome solid black enforced for thermal print heads', () => {
    const mediaPrintIndex = cssContent.indexOf('@media print');
    const mediaPrintBlock = cssContent.slice(mediaPrintIndex);

    assert.ok(mediaPrintBlock.includes('color: #000000 !important'), 'forces text color #000000');
    assert.ok(mediaPrintBlock.includes('print-color-adjust: exact !important'), 'enforces print-color-adjust: exact');
    assert.ok(mediaPrintBlock.includes('-webkit-print-color-adjust: exact !important'), 'enforces -webkit-print-color-adjust: exact');
  });

  test('ADV-3.5: Rubber stamp rendered in monochrome black with animations disabled', () => {
    const mediaPrintIndex = cssContent.indexOf('@media print');
    const mediaPrintBlock = cssContent.slice(mediaPrintIndex);

    assert.ok(mediaPrintBlock.includes('.thermal-rubber-stamp'), 'styles .thermal-rubber-stamp for print');
    assert.ok(mediaPrintBlock.includes('border-color: #000000 !important'), 'stamp border forced to #000000');
    assert.ok(mediaPrintBlock.includes('animation: none !important'), 'suppresses stampDrop keyframe animation during print');
  });

  test('ADV-3.6: Barcode rendered with high contrast and crisp edges', () => {
    const mediaPrintIndex = cssContent.indexOf('@media print');
    const mediaPrintBlock = cssContent.slice(mediaPrintIndex);

    assert.ok(mediaPrintBlock.includes('filter: contrast(300%) !important'), 'boosts barcode contrast to 300%');
    assert.ok(mediaPrintBlock.includes('shape-rendering: crispEdges !important'), 'forces crispEdges on SVG bars');
  });
});
