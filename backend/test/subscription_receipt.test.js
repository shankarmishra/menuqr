// MenusQR's own subscription documents: no GST and a payment receipt until a real seller GSTIN
// is configured; document totals always equal the amount actually charged. No database needed.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getSellerConfig,
  calculateGstTax,
  calculateProrationPaise,
  computeSubscriptionDocumentAmounts,
  generateInvoicePdfBuffer,
} from '../subscriptionService.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const REGISTERED_ENV = { SELLER_GSTIN: '27AAPFU0939F1ZV', SELLER_NAME: 'Example Seller', SELLER_STATE: 'Maharashtra' };
const UNREGISTERED = { name: 'MenusQR', address: null, state: null, gstin: null, registered: false };
const REGISTERED = getSellerConfig(REGISTERED_ENV);

test('seller config: no GSTIN means not registered, with no invented details', () => {
  const seller = getSellerConfig({});
  assert.equal(seller.registered, false);
  assert.equal(seller.gstin, null);
  assert.equal(seller.address, null);
  assert.equal(seller.state, null);
  assert.equal(seller.name, 'MenusQR');
});

test('seller config: a malformed GSTIN is ignored, a well-formed one is used', () => {
  assert.equal(getSellerConfig({ SELLER_GSTIN: 'PENDING_GSTIN' }).registered, false);
  assert.equal(getSellerConfig({ SELLER_GSTIN: '27aapfu0939f1zv' }).gstin, '27AAPFU0939F1ZV');
  assert.equal(REGISTERED.registered, true);
});

test('no GST is charged when the seller is not registered', () => {
  const tax = calculateGstTax({ subtotalPaise: 100000, customerState: 'Maharashtra', sellerState: 'Maharashtra', registered: false });
  assert.deepEqual(
    [tax.cgstPaise, tax.sgstPaise, tax.igstPaise, tax.taxPaise, tax.totalPaise],
    [0, 0, 0, 0, 100000],
  );
});

test('upgrade proration adds no GST when the seller is not registered', () => {
  const res = calculateProrationPaise(199900, 200, 319900, 'Maharashtra', { registered: false });
  assert.equal(res.taxPaise, 0);
  assert.equal(res.totalDuePaise, res.subtotalPaise);
});

test('receipt for a monthly plan uses the monthly price actually paid', () => {
  const amounts = computeSubscriptionDocumentAmounts({
    order: { plan_id: 'BASIC', amount: '559.00', original_amount: '559.00' },
    orderMeta: { billing_cycle: 'monthly' },
    seller: UNREGISTERED,
  });
  assert.equal(amounts.totalPaise, 55900);
  assert.equal(amounts.subtotalPaise, 55900);
  assert.equal(amounts.tax.taxPaise, 0);
  assert.equal(amounts.billingPeriod, '1 Month');
  assert.equal(amounts.discountPaise, 0);
});

test('receipt for a yearly plan with a coupon shows the discount and the amount paid', () => {
  const amounts = computeSubscriptionDocumentAmounts({
    order: { plan_id: 'PREMIUM', amount: '6000.00', original_amount: '6799.00' },
    orderMeta: { billing_cycle: 'yearly' },
    seller: UNREGISTERED,
  });
  assert.equal(amounts.planAmountPaise, 679900);
  assert.equal(amounts.discountPaise, 79900);
  assert.equal(amounts.totalPaise, 600000);
  assert.equal(amounts.billingPeriod, '1 Year');
});

test('upgrade receipt total equals the prorated amount charged', () => {
  const amounts = computeSubscriptionDocumentAmounts({
    order: { plan_id: 'PREMIUM', amount: '4302.40', original_amount: '6799.00', order_subtype: 'UPGRADE' },
    orderMeta: {},
    seller: UNREGISTERED,
  });
  assert.equal(amounts.totalPaise, 430240);
  assert.equal(amounts.billingPeriod, 'Upgrade (prorated)');
});

test('tax invoice (registered seller): paid amount is GST-inclusive and the parts add up exactly', () => {
  for (const amount of ['559.00', '1999.00', '6799.00', '4302.40', '1.00']) {
    const amounts = computeSubscriptionDocumentAmounts({
      order: { plan_id: 'BASIC', amount, original_amount: amount },
      orderMeta: { billing_cycle: 'yearly' },
      seller: REGISTERED,
      buyerState: 'Maharashtra',
    });
    const paid = Math.round(Number(amount) * 100);
    assert.equal(amounts.totalPaise, paid, `${amount}: total equals paid`);
    assert.equal(amounts.subtotalPaise + amounts.tax.taxPaise, paid, `${amount}: taxable + GST equals paid`);
    assert.ok(amounts.tax.cgstPaise > 0 || paid < 10, `${amount}: CGST charged`);
  }
});

test('receipt PDF says it is not a tax invoice and prints no GSTIN', () => {
  const pdf = generateInvoicePdfBuffer({
    invoice_number: 'MQR/2026-27/00001',
    document_type: 'RECEIPT',
    seller_name: 'MenusQR',
    seller_gstin: null,
    seller_address: 'India',
    plan_label: 'Basic',
    billing_period: '1 Month',
    plan_amount_paise: 55900,
    discount_paise: 0,
    subtotal_paise: 55900,
    total_paise: 55900,
  }).toString('latin1');
  assert.match(pdf, /PAYMENT RECEIPT/);
  assert.match(pdf, /not a tax invoice/i);
  assert.doesNotMatch(pdf, /TAX INVOICE/);
  assert.doesNotMatch(pdf, /GSTIN/);
  assert.doesNotMatch(pdf, /Cyber City|Pune/);
});

test('tax invoice PDF prints the configured GSTIN', () => {
  const pdf = generateInvoicePdfBuffer({
    invoice_number: 'MQR/2026-27/00002',
    document_type: 'TAX_INVOICE',
    seller_name: 'Example Seller',
    seller_gstin: '27AAPFU0939F1ZV',
    plan_label: 'Basic',
    subtotal_paise: 169407,
    cgst_paise: 15247,
    sgst_paise: 15246,
    cgst_rate: 9,
    sgst_rate: 9,
    total_paise: 199900,
  }).toString('latin1');
  assert.match(pdf, /TAX INVOICE/);
  assert.match(pdf, /GSTIN: 27AAPFU0939F1ZV/);
});

test('no seller details are hard-coded in the service', () => {
  const source = fs.readFileSync(path.join(here, '..', 'subscriptionService.js'), 'utf8');
  assert.doesNotMatch(source, /27AABCU9603R1ZM/);
  assert.doesNotMatch(source, /Cyber City/);
  assert.doesNotMatch(source, /MenuSQR Technologies/);
});
