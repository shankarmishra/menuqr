/**
 * backend/subscriptionService.js
 *
 * Core Domain Service for System 1 (Subscription, Renewal & Billing Engine).
 * Encapsulates:
 * 1. Deterministic Indian Financial Year calculations (April 1 cutoff).
 * 2. Atomic sequence number generation formatted as MQR/YYYY-YY/XXXXX using nextval with defensive CREATE SEQUENCE.
 * 3. Server-authoritative proration calculations with 100 paise minimum floor and 18% GST (CGST+SGST vs IGST).
 * 4. Zero-loss renewal date stacking (baseDate = max(currentExpiry, now), newExpiry = baseDate + 1 year).
 * 5. Production PDF generation service (PDF-1.4 binary stream, SAC 997331, tax breakdown).
 * 6. Atomic GST invoice generation linked to orders and subscription audit events.
 */

import { randomUUID } from 'node:crypto';

// ---------------------------------------------------------------------------
// Constants & Plan Configurations
// ---------------------------------------------------------------------------
export const PLANS = {
  basic:        { price: 1999, monthlyPrice: 559,  yearlyPrice: 1999, label: 'Basic' },
  intermediate: { price: 3199, monthlyPrice: 959,  yearlyPrice: 3199, label: 'Intermediate' },
  premium:      { price: 6799, monthlyPrice: 1119, yearlyPrice: 6799, label: 'Premium' },
};

export const PLAN_HIERARCHY = {
  basic: 1,
  intermediate: 2,
  premium: 3,
};

export const SAC_CODE = '997331'; // Software licensing / SaaS services in India
export const SELLER_STATE = 'Maharashtra';
export const SELLER_STATE_CODE = '27';
export const SELLER_NAME = 'MenuSQR Technologies';
export const SELLER_GSTIN = '27AABCU9603R1ZM';
export const SELLER_ADDRESS = 'Level 4, Cyber City, Pune, Maharashtra - 411028';

// ---------------------------------------------------------------------------
// 1. Indian Financial Year Helpers
// ---------------------------------------------------------------------------

/**
 * Deterministically calculates Indian Financial Year (April 1 to March 31 cutoff).
 * Returns 'YYYY-YY' (e.g. '2026-27') using Asia/Kolkata timezone.
 *
 * @param {Date|string|number} date
 * @returns {string} Financial Year string (e.g. '2026-27')
 */
export function getCurrentFinancialYear(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'numeric',
  }).formatToParts(d);

  let year = 0;
  let month = 0;
  for (const part of parts) {
    if (part.type === 'year') year = parseInt(part.value, 10);
    if (part.type === 'month') month = parseInt(part.value, 10);
  }

  let startYear, endYear;
  if (month >= 4) {
    startYear = year;
    endYear = year + 1;
  } else {
    startYear = year - 1;
    endYear = year;
  }

  const endSuffix = String(endYear).slice(-2);
  return `${startYear}-${endSuffix}`;
}

export const getFinancialYear = getCurrentFinancialYear;

// ---------------------------------------------------------------------------
// 2. Atomic Sequence Generation & Invoice Formatting
// ---------------------------------------------------------------------------

/**
 * Atomically retrieves the next sequence number for a given Financial Year
 * using PostgreSQL's native nextval with a defensive CREATE SEQUENCE IF NOT EXISTS.
 *
 * @param {object} clientOrPool PostgreSQL client or pool
 * @param {string} fy Financial year string (e.g. '2026-27')
 * @returns {Promise<number>} Sequence integer
 */
export async function getNextInvoiceSequence(clientOrPool, fy) {
  if (!fy || !/^\d{4}-\d{2}$/.test(fy)) {
    throw new Error(`Invalid financial year format: ${fy}. Expected YYYY-YY (e.g. 2026-27).`);
  }
  const cleanFy = fy.replace(/-/g, '_');
  const seqName = `gst_invoice_seq_${cleanFy}`;

  // Defensive fallback: ensure sequence exists for future fiscal years
  try {
    await clientOrPool.query(`CREATE SEQUENCE IF NOT EXISTS ${seqName} START WITH 1 INCREMENT BY 1;`);
  } catch (err) {
    // Under high concurrency bursts on new FY sequences, PostgreSQL's catalog insert
    // can throw 23505 (unique_violation on pg_class_relname_nsp_index) or 42P07 (duplicate_table)
    if (err?.code !== '23505' && err?.code !== '42P07') {
      throw err;
    }
  }

  // Query atomic nextval
  const res = await clientOrPool.query(`SELECT nextval('${seqName}') AS seq;`);
  return parseInt(res.rows[0].seq, 10);
}

/**
 * Formats financial year and sequence number into standard GST invoice ID: MQR/YYYY-YY/XXXXX
 *
 * @param {string} fy Financial year (e.g. '2026-27')
 * @param {number} seq Sequence integer
 * @returns {string} Formatted invoice number (e.g. 'MQR/2026-27/00001')
 */
export function formatInvoiceNumber(fy, seq) {
  return `MQR/${fy}/${String(seq).padStart(5, '0')}`;
}

// ---------------------------------------------------------------------------
// 3. Tax & State Identification
// ---------------------------------------------------------------------------

/**
 * Checks whether customer state is intra-state (Maharashtra) or inter-state.
 *
 * @param {string} customerState
 * @param {string} sellerState
 * @returns {boolean} True if intra-state
 */
export function isSameState(customerState, sellerState = SELLER_STATE) {
  if (!customerState || !sellerState) return false;
  const normCustomer = String(customerState).trim().toLowerCase();
  const normSeller = String(sellerState).trim().toLowerCase();
  if (normCustomer === normSeller) return true;
  if ((normCustomer === 'mh' || normCustomer === 'maharashtra') && (normSeller === 'mh' || normSeller === 'maharashtra')) {
    return true;
  }
  return false;
}

/**
 * Calculates 18% GST tax breakdown (Intra-state CGST 9% + SGST 9% vs Inter-state IGST 18%).
 *
 * @param {object} options
 * @param {number} options.subtotalPaise Taxable value in paise
 * @param {string} options.customerState Customer state string
 * @param {string} options.sellerState Seller state string (defaults to Maharashtra)
 * @returns {object} Tax breakdown
 */
export function calculateGstTax({ subtotalPaise, customerState = 'Maharashtra', sellerState = SELLER_STATE }) {
  const intraState = isSameState(customerState, sellerState);
  let cgstRate = 0.00;
  let sgstRate = 0.00;
  let igstRate = 0.00;
  let cgstPaise = 0;
  let sgstPaise = 0;
  let igstPaise = 0;

  if (intraState) {
    cgstRate = 9.00;
    sgstRate = 9.00;
    cgstPaise = Math.round(subtotalPaise * 0.09);
    sgstPaise = Math.round(subtotalPaise * 0.09);
  } else {
    igstRate = 18.00;
    igstPaise = Math.round(subtotalPaise * 0.18);
  }

  const taxPaise = cgstPaise + sgstPaise + igstPaise;
  const totalPaise = subtotalPaise + taxPaise;

  return {
    intraState,
    cgstRate,
    sgstRate,
    igstRate,
    cgstPaise,
    sgstPaise,
    igstPaise,
    taxPaise,
    totalPaise,
  };
}

// ---------------------------------------------------------------------------
// 4. Proration Calculation Engine
// ---------------------------------------------------------------------------

/**
 * Low-level proration calculator in paise.
 *
 * @param {number} currentPricePaise
 * @param {number} remainingDays
 * @param {number} targetPricePaise
 * @param {string} customerState
 * @returns {object}
 */
export function calculateProrationPaise(currentPricePaise, remainingDays, targetPricePaise, customerState = 'Maharashtra') {
  const dailyRatePaise = Math.round(currentPricePaise / 365);
  const validRemainingDays = Math.max(0, remainingDays || 0);
  const creditPaise = validRemainingDays * dailyRatePaise;

  // Minimum floor of Rs. 1 (100 paise)
  const subtotalPaise = Math.max(100, targetPricePaise - creditPaise);

  const tax = calculateGstTax({ subtotalPaise, customerState });

  return {
    dailyRatePaise,
    creditPaise,
    prorationCreditPaise: creditPaise,
    subtotalPaise,
    gstPaise: tax.taxPaise,
    taxPaise: tax.taxPaise,
    cgstPaise: tax.cgstPaise,
    sgstPaise: tax.sgstPaise,
    igstPaise: tax.igstPaise,
    cgstRate: tax.cgstRate,
    sgstRate: tax.sgstRate,
    igstRate: tax.igstRate,
    totalDuePaise: tax.totalPaise,
    totalPaise: tax.totalPaise,
  };
}

/**
 * Server-authoritative upgrade proration calculator with guard rules.
 *
 * @param {object} params
 * @param {string} params.currentPlanId
 * @param {Date|string} params.currentExpiresAt
 * @param {string} params.targetPlanId
 * @param {string} [params.customerState='Maharashtra']
 * @param {string} [params.sellerState='Maharashtra']
 * @param {Date|number} [params.now=new Date()]
 * @returns {object} Full proration preview breakdown
 */
export function calculateProration({
  currentPlanId,
  currentExpiresAt,
  targetPlanId,
  customerState = 'Maharashtra',
  sellerState = SELLER_STATE,
  now = new Date(),
}) {
  const currentKey = (currentPlanId || 'basic').toLowerCase().trim();
  const targetKey = (targetPlanId || '').toLowerCase().trim();

  const currentPlan = (Object.hasOwn(PLANS, currentKey) ? PLANS[currentKey] : PLANS.basic);
  const targetPlan = Object.hasOwn(PLANS, targetKey) ? PLANS[targetKey] : undefined;

  if (!targetPlan) {
    throw new Error(`Invalid target plan: ${targetPlanId}`);
  }

  const currentRank = (Object.hasOwn(PLAN_HIERARCHY, currentKey) ? PLAN_HIERARCHY[currentKey] : 0);
  const targetRank = (Object.hasOwn(PLAN_HIERARCHY, targetKey) ? PLAN_HIERARCHY[targetKey] : 0);

  if (currentRank >= targetRank) {
    if (currentRank === targetRank) {
      return {
        isUpgradeAllowed: false,
        reason: 'You are already on the highest plan or target plan is identical to your current plan.',
        currentPlanId: currentKey,
        targetPlanId: targetKey,
      };
    }
    return {
      isUpgradeAllowed: false,
      reason: 'Downgrades are not supported via the upgrade flow.',
      currentPlanId: currentKey,
      targetPlanId: targetKey,
    };
  }

  const nowMs = new Date(now).getTime();
  const expiresMs = currentExpiresAt ? new Date(currentExpiresAt).getTime() : 0;
  const remainingDays = Math.max(0, Math.ceil((expiresMs - nowMs) / 86400000));

  const currentYearlyPricePaise = (currentPlan.yearlyPrice || currentPlan.price) * 100;
  const targetPlanPricePaise = (targetPlan.yearlyPrice || targetPlan.price) * 100;

  const lowLevel = calculateProrationPaise(
    currentYearlyPricePaise,
    remainingDays,
    targetPlanPricePaise,
    customerState
  );

  return {
    isUpgradeAllowed: true,
    reason: null,
    targetPlanId: targetKey,
    targetPlanName: targetPlan.label,
    targetPlan: targetKey,
    currentPlanId: currentKey,
    currentPlanName: currentPlan.label,
    currentPlan: currentKey,
    fullPricePaise: targetPlanPricePaise,
    newPlanPricePaise: targetPlanPricePaise,
    remainingDays,
    dailyRatePaise: lowLevel.dailyRatePaise,
    oldDailyRatePaise: lowLevel.dailyRatePaise,
    creditPaise: lowLevel.creditPaise,
    prorationCreditPaise: lowLevel.creditPaise,
    creditAmountPaise: lowLevel.creditPaise,
    subtotalPaise: lowLevel.subtotalPaise,
    subtotal: lowLevel.subtotalPaise,
    cgstPaise: lowLevel.cgstPaise,
    sgstPaise: lowLevel.sgstPaise,
    igstPaise: lowLevel.igstPaise,
    cgstRate: lowLevel.cgstRate,
    sgstRate: lowLevel.sgstRate,
    igstRate: lowLevel.igstRate,
    taxPaise: lowLevel.taxPaise,
    gstPaise: lowLevel.taxPaise,
    totalPaise: lowLevel.totalPaise,
    totalDuePaise: lowLevel.totalDuePaise,
    totalDue: lowLevel.totalDuePaise,
    breakdown: `${remainingDays} remaining days × Rs. ${(lowLevel.dailyRatePaise / 100).toFixed(2)}/day = Rs. ${(lowLevel.creditPaise / 100).toFixed(2)} credit`,
  };
}

// ---------------------------------------------------------------------------
// 5. Zero-Loss Renewal Date Stacking
// ---------------------------------------------------------------------------

/**
 * Days-loss prevention renewal calculator.
 * Calculates new expiry by adding 1 year (365 days) strictly from max(currentExpiry, now).
 * Returns a Date object extended with baseDate, newExpiry, and daysExtended properties.
 *
 * @param {Date|string|number} currentExpiry
 * @param {Date|string|number} [now=Date.now()]
 * @returns {Date} Extended expiry date
 */
export function calculateRenewalExpiry(currentExpiry, now = Date.now()) {
  const currentMs = currentExpiry ? new Date(currentExpiry).getTime() : 0;
  const nowMs = typeof now === 'number' ? now : new Date(now).getTime();
  const baseDateMs = Math.max(currentMs, nowMs);

  const baseDate = new Date(baseDateMs);
  const newExpiry = new Date(baseDate);
  newExpiry.setFullYear(newExpiry.getFullYear() + 1);

  // Attach metadata properties
  newExpiry.baseDate = baseDate;
  newExpiry.newExpiry = new Date(newExpiry.getTime());
  newExpiry.daysExtended = 365;

  return newExpiry;
}

// ---------------------------------------------------------------------------
// 6. Formatting & Words Conversion Helpers
// ---------------------------------------------------------------------------

export function formatInrPaise(paise) {
  const p = Number(paise) || 0;
  const isNegative = p < 0;
  const abs = Math.abs(p);
  const rupees = (abs / 100).toFixed(2);
  const parts = rupees.split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  if (integerPart.length > 3) {
    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    integerPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }
  return `${isNegative ? '-' : ''}Rs. ${integerPart}.${decimalPart}`;
}

export function numberToWordsINR(amountPaise) {
  const amount = Math.floor(Math.abs(amountPaise) / 100);
  const paise = Math.abs(amountPaise) % 100;
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertGroup(n) {
    let out = '';
    if (n >= 100) {
      out += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      out += tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    } else if (n > 0) {
      out += ones[n];
    }
    return out.trim();
  }

  let words = '';
  let rem = amount;
  const crore = Math.floor(rem / 10000000);
  rem %= 10000000;
  const lakh = Math.floor(rem / 100000);
  rem %= 100000;
  const thousand = Math.floor(rem / 1000);
  rem %= 1000;
  const hundredGroup = rem;

  if (crore) words += convertGroup(crore) + ' Crore ';
  if (lakh) words += convertGroup(lakh) + ' Lakh ';
  if (thousand) words += convertGroup(thousand) + ' Thousand ';
  if (hundredGroup) words += convertGroup(hundredGroup);
  words = words.trim() || 'Zero';
  let result = 'INR ' + words + ' Rupees';
  if (paise > 0) {
    result += ' and ' + convertGroup(paise) + ' Paise';
  }
  return result + ' Only';
}

function escapePdfText(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

// ---------------------------------------------------------------------------
// 7. Clean Node.js Binary PDF-1.4 Generator
// ---------------------------------------------------------------------------

/**
 * Generates an authoritative PDF-1.4 binary buffer for a GST tax invoice.
 * Completely zero-dependency using Buffer and standard Type 1 fonts.
 *
 * @param {object} invoice
 * @returns {Buffer} PDF binary buffer
 */
export function generateInvoicePdfBuffer(invoice) {
  const streamLines = [];

  const setFillRGB = (r, g, b) => streamLines.push(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg`);
  const setStrokeRGB = (r, g, b) => streamLines.push(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG`);
  const setLineWidth = (w) => streamLines.push(`${w} w`);
  const rect = (x, y, w, h, fill = false, stroke = true) => {
    streamLines.push(`${x} ${y} ${w} ${h} re`);
    if (fill && stroke) streamLines.push('B');
    else if (fill) streamLines.push('f');
    else if (stroke) streamLines.push('S');
  };
  const line = (x1, y1, x2, y2) => {
    streamLines.push(`${x1} ${y1} m ${x2} ${y2} l S`);
  };
  const text = (x, y, str, font = 'F1', size = 9, color = [0.06, 0.09, 0.16]) => {
    setFillRGB(color[0], color[1], color[2]);
    streamLines.push(`BT /${font} ${size} Tf ${x} ${y} Td (${escapePdfText(str)}) Tj ET`);
  };
  const rightText = (rightX, y, str, font = 'F1', size = 9, color = [0.06, 0.09, 0.16]) => {
    const textLen = (str || '').length;
    const estWidth = textLen * (size * 0.52);
    const startX = Math.max(40, rightX - estWidth);
    text(startX, y, str, font, size, color);
  };

  const width = 595.28;
  const height = 841.89;
  const margin = 36;
  const contentWidth = width - (margin * 2);

  // Outer Page Border
  setStrokeRGB(0.80, 0.84, 0.88);
  setLineWidth(1);
  rect(margin, margin, contentWidth, height - (margin * 2), false, true);

  // Top Header Banner
  setFillRGB(0.06, 0.18, 0.13); // dark emerald green
  rect(margin, height - margin - 75, contentWidth, 75, true, false);

  text(margin + 16, height - margin - 32, 'MenuQR', 'F2', 20, [1, 1, 1]);
  text(margin + 16, height - margin - 48, 'Digital QR Menu & Smart Restaurant OS | menusqr.in', 'F1', 9, [0.85, 0.90, 0.88]);

  text(width - margin - 150, height - margin - 30, 'TAX INVOICE', 'F2', 16, [1, 1, 1]);
  text(width - margin - 150, height - margin - 46, 'GST / B2B INVOICE', 'F2', 9, [0.85, 0.70, 0.30]);
  text(width - margin - 150, height - margin - 60, 'Original for Recipient', 'F1', 8, [0.80, 0.85, 0.82]);

  // Metadata Strip
  const metaY = height - margin - 110;
  setFillRGB(0.96, 0.97, 0.98);
  setStrokeRGB(0.85, 0.88, 0.92);
  rect(margin + 10, metaY, contentWidth - 20, 25, true, true);

  const colW = (contentWidth - 20) / 4;
  text(margin + 15, metaY + 14, 'Invoice Number:', 'F2', 7.5, [0.4, 0.45, 0.5]);
  text(margin + 15, metaY + 4, invoice.invoice_number || 'MQR/2026-27/00001', 'F2', 9, [0.06, 0.09, 0.16]);

  text(margin + 15 + colW, metaY + 14, 'Invoice Date:', 'F2', 7.5, [0.4, 0.45, 0.5]);
  const dateStr = invoice.created_at ? new Date(invoice.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '03 Nov 2026';
  text(margin + 15 + colW, metaY + 4, dateStr, 'F1', 8.5, [0.06, 0.09, 0.16]);

  text(margin + 15 + (colW * 2), metaY + 14, 'Financial Year:', 'F2', 7.5, [0.4, 0.45, 0.5]);
  text(margin + 15 + (colW * 2), metaY + 4, invoice.financial_year || '2026-27', 'F1', 8.5, [0.06, 0.09, 0.16]);

  text(margin + 15 + (colW * 3), metaY + 14, 'Place of Supply:', 'F2', 7.5, [0.4, 0.45, 0.5]);
  text(margin + 15 + (colW * 3), metaY + 4, invoice.customer_state || invoice.buyer_state || 'Maharashtra', 'F1', 8.5, [0.06, 0.09, 0.16]);

  // Party Details Box
  const partyY = metaY - 110;
  const partyBoxW = (contentWidth - 30) / 2;

  // Supplier Box
  setFillRGB(0.99, 0.99, 1.0);
  setStrokeRGB(0.85, 0.88, 0.92);
  rect(margin + 10, partyY, partyBoxW, 100, true, true);

  setFillRGB(0.12, 0.25, 0.20);
  rect(margin + 10, partyY + 82, partyBoxW, 18, true, false);
  text(margin + 16, partyY + 87, 'SUPPLIER / ISSUER DETAILS', 'F2', 8, [1, 1, 1]);

  text(margin + 16, partyY + 68, invoice.seller_name || SELLER_NAME, 'F2', 8.5, [0.1, 0.15, 0.2]);
  text(margin + 16, partyY + 54, invoice.seller_address || SELLER_ADDRESS, 'F1', 8, [0.3, 0.35, 0.4]);
  text(margin + 16, partyY + 40, `GSTIN: ${invoice.seller_gstin || SELLER_GSTIN}`, 'F2', 8, [0.1, 0.15, 0.2]);
  text(margin + 16, partyY + 26, 'State: Maharashtra (State Code: 27)', 'F1', 8, [0.3, 0.35, 0.4]);
  text(margin + 16, partyY + 12, 'Email: billing@menusqr.in | Web: menusqr.in', 'F1', 8, [0.3, 0.35, 0.4]);

  // Buyer Box
  const buyerX = margin + 20 + partyBoxW;
  setFillRGB(0.99, 0.99, 1.0);
  rect(buyerX, partyY, partyBoxW, 100, true, true);

  setFillRGB(0.12, 0.25, 0.20);
  rect(buyerX, partyY + 82, partyBoxW, 18, true, false);
  text(buyerX + 6, partyY + 87, 'BILLED TO / RECIPIENT DETAILS', 'F2', 8, [1, 1, 1]);

  const buyerName = invoice.buyer_business_name || invoice.customer_name || invoice.buyer_name || 'Valued Restaurant Partner';
  text(buyerX + 6, partyY + 68, buyerName, 'F2', 8.5, [0.1, 0.15, 0.2]);
  const buyerAddr = invoice.buyer_address || invoice.customer_state || 'Registered Address';
  text(buyerX + 6, partyY + 54, buyerAddr.substring(0, 48), 'F1', 8, [0.3, 0.35, 0.4]);
  const buyerState = invoice.customer_state || invoice.buyer_state || 'Maharashtra';
  text(buyerX + 6, partyY + 40, `State: ${buyerState}`, 'F1', 8, [0.3, 0.35, 0.4]);
  text(buyerX + 6, partyY + 26, `GSTIN: ${invoice.customer_gstin || invoice.buyer_gstin || 'Unregistered / Consumer'}`, 'F2', 8, [0.1, 0.15, 0.2]);
  text(buyerX + 6, partyY + 12, `Tenant ID: ${invoice.tenant_id || 'N/A'}`, 'F1', 7.5, [0.4, 0.45, 0.5]);

  // Services Table
  const tableY = partyY - 30;
  setFillRGB(0.92, 0.95, 0.94);
  setStrokeRGB(0.75, 0.80, 0.85);
  rect(margin + 10, tableY - 18, contentWidth - 20, 20, true, true);

  const tX = margin + 10;
  const c0 = tX + 6;
  const c1 = tX + 32;
  const c2 = tX + 220;
  const c3 = tX + 280;
  const c4 = tX + 360;
  const c5 = tX + 430;
  const c6 = tX + contentWidth - 26;

  text(c0, tableY - 12, 'S.No', 'F2', 8, [0.1, 0.2, 0.15]);
  text(c1, tableY - 12, 'Description of Cloud Service', 'F2', 8, [0.1, 0.2, 0.15]);
  text(c2, tableY - 12, 'SAC Code', 'F2', 8, [0.1, 0.2, 0.15]);
  text(c3, tableY - 12, 'Period', 'F2', 8, [0.1, 0.2, 0.15]);
  text(c4, tableY - 12, 'Plan Price', 'F2', 8, [0.1, 0.2, 0.15]);
  text(c5, tableY - 12, 'Credit', 'F2', 8, [0.1, 0.2, 0.15]);
  rightText(c6, tableY - 12, 'Taxable Value', 'F2', 8, [0.1, 0.2, 0.15]);

  const row1Y = tableY - 38;
  text(c0, row1Y, '1', 'F1', 8.5);
  const planLabel = invoice.plan_label || invoice.plan_name || invoice.plan_id || 'Subscription Plan';
  text(c1, row1Y, `MenuQR ${planLabel} (Annual Cloud License)`, 'F2', 8.5);
  text(c1, row1Y - 12, 'Includes Digital QR Menu, Real-Time Ordering & Dashboard', 'F1', 7.5, [0.45, 0.5, 0.55]);
  text(c2, row1Y, SAC_CODE, 'F1', 8.5);
  text(c3, row1Y, invoice.billing_period || '1 Year', 'F1', 8.5);

  const planAmountPaise = invoice.plan_amount_paise || (invoice.subtotal_paise + (invoice.discount_paise || 0));
  text(c4, row1Y, formatInrPaise(planAmountPaise), 'F1', 8.5);

  const discountPaise = invoice.discount_paise || 0;
  text(c5, row1Y, discountPaise > 0 ? `-${formatInrPaise(discountPaise)}` : 'Rs. 0.00', 'F1', 8.5);
  rightText(c6, row1Y, formatInrPaise(invoice.subtotal_paise), 'F2', 8.5);

  setStrokeRGB(0.85, 0.88, 0.92);
  line(tX, tableY - 60, tX + contentWidth - 20, tableY - 60);

  // Totals Box
  const totalsY = tableY - 70;
  const totalsBoxW = 230;
  const totalsX = tX + (contentWidth - 20) - totalsBoxW;

  setFillRGB(0.98, 0.99, 1.0);
  rect(totalsX, totalsY - 105, totalsBoxW, 105, true, true);

  let curY = totalsY - 16;
  text(totalsX + 10, curY, 'Taxable Subtotal:', 'F1', 8.5, [0.2, 0.25, 0.3]);
  rightText(totalsX + totalsBoxW - 10, curY, formatInrPaise(invoice.subtotal_paise), 'F2', 8.5);

  const cgst = invoice.cgst_paise || 0;
  const sgst = invoice.sgst_paise || 0;
  const igst = invoice.igst_paise || 0;

  if (cgst > 0 || sgst > 0) {
    curY -= 15;
    text(totalsX + 10, curY, `CGST @ ${Number(invoice.cgst_rate || 9).toFixed(1)}%:`, 'F1', 8, [0.3, 0.35, 0.4]);
    rightText(totalsX + totalsBoxW - 10, curY, formatInrPaise(cgst), 'F1', 8);

    curY -= 15;
    text(totalsX + 10, curY, `SGST @ ${Number(invoice.sgst_rate || 9).toFixed(1)}%:`, 'F1', 8, [0.3, 0.35, 0.4]);
    rightText(totalsX + totalsBoxW - 10, curY, formatInrPaise(sgst), 'F1', 8);
  } else if (igst > 0) {
    curY -= 15;
    text(totalsX + 10, curY, `IGST @ ${Number(invoice.igst_rate || 18).toFixed(1)}%:`, 'F1', 8, [0.3, 0.35, 0.4]);
    rightText(totalsX + totalsBoxW - 10, curY, formatInrPaise(igst), 'F1', 8);
  }

  curY -= 22;
  setFillRGB(0.06, 0.18, 0.13);
  rect(totalsX, curY - 5, totalsBoxW, 24, true, false);
  text(totalsX + 10, curY + 4, 'TOTAL AMOUNT PAYABLE:', 'F2', 9, [1, 1, 1]);
  rightText(totalsX + totalsBoxW - 10, curY + 4, formatInrPaise(invoice.total_paise), 'F2', 10, [0.95, 0.85, 0.4]);

  // Words Box
  const wordsX = tX;
  const wordsW = totalsX - tX - 15;
  setFillRGB(0.97, 0.98, 0.99);
  rect(wordsX, totalsY - 50, wordsW, 50, true, true);
  text(wordsX + 10, totalsY - 14, 'Amount in Words:', 'F2', 7.5, [0.35, 0.4, 0.45]);
  const wordsStr = numberToWordsINR(invoice.total_paise);
  text(wordsX + 10, totalsY - 28, wordsStr.substring(0, 48), 'F2', 8, [0.1, 0.15, 0.2]);
  if (wordsStr.length > 48) {
    text(wordsX + 10, totalsY - 40, wordsStr.substring(48), 'F2', 8, [0.1, 0.15, 0.2]);
  }

  // Payment Info
  const payY = totalsY - 105;
  setFillRGB(0.97, 0.98, 0.99);
  rect(wordsX, payY, wordsW, 45, true, true);
  text(wordsX + 10, payY + 30, 'Payment Information:', 'F2', 7.5, [0.35, 0.4, 0.45]);
  text(wordsX + 10, payY + 18, `Status: PAID | Gateway: ${invoice.payment_gateway || 'Cashfree'}`, 'F1', 8, [0.1, 0.15, 0.2]);
  text(wordsX + 10, payY + 6, `Order ID: ${invoice.order_id || 'N/A'}`, 'F1', 7.5, [0.4, 0.45, 0.5]);

  // Footer
  const footerY = margin + 45;
  setStrokeRGB(0.85, 0.88, 0.92);
  line(margin + 10, footerY + 30, width - margin - 10, footerY + 30);

  text(margin + 10, footerY + 18, 'Declaration: We declare that this invoice shows the actual price of the services described and that all particulars are true and correct.', 'F1', 7, [0.4, 0.45, 0.5]);
  text(margin + 10, footerY + 8, 'Terms: Software subscription services are non-refundable once activated. Governed by the laws of Maharashtra, India.', 'F1', 7, [0.4, 0.45, 0.5]);
  text(margin + 10, footerY - 4, 'This is a computer-generated tax invoice issued in terms of Rule 48 of the CGST Rules, 2017 and does not require a physical signature.', 'F2', 7.5, [0.2, 0.25, 0.3]);

  // Object Assembler
  const streamBuf = Buffer.from(streamLines.join('\n'), 'utf-8');
  const objects = [
    { id: 1, content: '<< /Type /Catalog /Pages 2 0 R >>' },
    { id: 2, content: '<< /Type /Pages /Kids [3 0 R] /Count 1 >>' },
    { id: 3, content: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>` },
    { id: 4, content: Buffer.concat([Buffer.from(`<< /Length ${streamBuf.length} >>\nstream\n`), streamBuf, Buffer.from('\nendstream')]) },
    { id: 5, content: '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>' },
    { id: 6, content: '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>' },
  ];

  const parts = [];
  const header = Buffer.from('%PDF-1.4\n');
  parts.push(header);
  let offset = header.length;
  const offsets = {};

  for (const obj of objects) {
    offsets[obj.id] = offset;
    const h = Buffer.from(`${obj.id} 0 obj\n`);
    const f = Buffer.from('\nendobj\n');
    const b = Buffer.isBuffer(obj.content) ? obj.content : Buffer.from(obj.content, 'utf-8');
    parts.push(h, b, f);
    offset += h.length + b.length + f.length;
  }

  const startxref = offset;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \r\n`;
  for (let i = 1; i <= objects.length; i++) {
    xref += String(offsets[i]).padStart(10, '0') + ' 00000 n \r\n';
  }
  xref += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;
  parts.push(Buffer.from(xref, 'utf-8'));

  return Buffer.concat(parts);
}

export const generateInvoicePdf = generateInvoicePdfBuffer;

// ---------------------------------------------------------------------------
// 8. Database Invoice Generator & Queries
// ---------------------------------------------------------------------------

/**
 * Generates GST invoice record and inserts into gst_invoices table.
 * Idempotent: returns existing invoice if orderId already has one.
 *
 * @param {object} options
 * @param {string} options.orderId
 * @param {string} options.tenantId
 * @param {object} options.client Active database transaction client
 * @returns {Promise<object>} Inserted or existing invoice row
 */
export async function generateGstInvoice({ orderId, tenantId, client }) {
  if (!client) throw new Error('Database client is required');

  // 1. Idempotency check: Return existing invoice if already created for this order
  if (orderId) {
    const existing = await client.query(
      'SELECT * FROM gst_invoices WHERE order_id = $1 LIMIT 1',
      [orderId]
    );
    if (existing.rows.length > 0) {
      return existing.rows[0];
    }
  }

  // 2. Query order
  let order = null;
  if (orderId) {
    const orderRes = await client.query('SELECT * FROM orders WHERE id = $1', [orderId]);
    order = orderRes.rows[0] || null;
  }

  // 3. Query tenant/client details
  let clientRow = null;
  if (tenantId) {
    const clientRes = await client.query('SELECT * FROM clients WHERE id = $1', [tenantId]);
    clientRow = clientRes.rows[0] || null;
  }

  const orderMeta = order?.metadata || {};

  const buyerName = order?.customer_name || clientRow?.business_name || 'Valued Customer';
  const buyerBusinessName = order?.business_name || clientRow?.business_name || null;
  const buyerAddress = order?.address || clientRow?.address || null;
  const buyerState = orderMeta.customer_state || order?.state || clientRow?.state || order?.city || clientRow?.city || 'Maharashtra';
  const buyerGstin = orderMeta.customer_gstin || null;

  const fy = getCurrentFinancialYear();
  const sequenceNo = await getNextInvoiceSequence(client, fy);
  const invoiceNumber = formatInvoiceNumber(fy, sequenceNo);

  const planKey = (order?.plan_id || 'basic').toLowerCase().trim();
  const planMeta = (Object.hasOwn(PLANS, planKey) ? PLANS[planKey] : { price: Number(order?.amount || 0), yearlyPrice: Number(order?.amount || 0), label: order?.plan_id || 'Basic' });
  const planAmountPaise = Math.round((planMeta.yearlyPrice || planMeta.price) * 100);

  const prorationCreditPaise = order?.proration_credit_paise || orderMeta.proration_credit_paise || 0;
  const discountPaise = prorationCreditPaise > 0 ? prorationCreditPaise : (order?.discount ? Math.round(Number(order.discount) * 100) : 0);
  const subtotalPaise = Math.max(100, planAmountPaise - discountPaise);

  const tax = calculateGstTax({ subtotalPaise, customerState: buyerState, sellerState: SELLER_STATE });
  const totalPaise = tax.totalPaise;
  const invoiceType = order?.order_subtype || 'SUBSCRIPTION';

  const insertRes = await client.query(`
    INSERT INTO gst_invoices (
      invoice_number,
      order_id,
      tenant_id,
      financial_year,
      sequence_no,
      sequence_number,
      seller_name,
      seller_gstin,
      seller_address,
      buyer_name,
      buyer_business_name,
      buyer_address,
      buyer_state,
      buyer_gstin,
      customer_name,
      customer_gstin,
      customer_state,
      plan_id,
      plan_name,
      plan_label,
      billing_period,
      plan_amount_paise,
      discount_paise,
      subtotal_paise,
      cgst_rate,
      sgst_rate,
      igst_rate,
      cgst_paise,
      sgst_paise,
      igst_paise,
      total_paise,
      invoice_type,
      payment_gateway,
      gateway_txn_id,
      created_at,
      pdf_generated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6,
      $7, $8, $9,
      $10, $11, $12, $13, $14,
      $15, $16, $17,
      $18, $19, $20, $21,
      $22, $23, $24,
      $25, $26, $27,
      $28, $29, $30, $31,
      $32, $33, $34,
      NOW(), NOW()
    ) RETURNING *;
  `, [
    invoiceNumber,
    orderId || null,
    tenantId,
    fy,
    sequenceNo,
    sequenceNo,
    SELLER_NAME,
    SELLER_GSTIN,
    SELLER_ADDRESS,
    buyerName,
    buyerBusinessName,
    buyerAddress,
    buyerState,
    buyerGstin,
    buyerName,
    buyerGstin,
    buyerState,
    (order?.plan_id || planKey).toUpperCase(),
    planMeta.label,
    planMeta.label,
    'Annual',
    planAmountPaise,
    discountPaise,
    subtotalPaise,
    tax.cgstRate,
    tax.sgstRate,
    tax.igstRate,
    tax.cgstPaise,
    tax.sgstPaise,
    tax.igstPaise,
    totalPaise,
    invoiceType,
    order?.payment_gateway || 'Cashfree',
    order?.gateway_payment_id || orderMeta.gateway_payment_id || null,
  ]);

  const createdInvoice = insertRes.rows[0];

  return createdInvoice;
}

/**
 * Get tenant invoices ordered by created_at DESC.
 *
 * @param {string} tenantId
 * @param {object} clientOrPool
 * @returns {Promise<Array<object>>}
 */
export async function getTenantInvoices(tenantId, clientOrPool) {
  const res = await clientOrPool.query(`
    SELECT *
    FROM gst_invoices
    WHERE tenant_id = $1
    ORDER BY created_at DESC
  `, [tenantId]);
  return res.rows;
}

/**
 * Get single tenant invoice by ID.
 *
 * @param {string} tenantId
 * @param {string} invoiceId
 * @param {object} clientOrPool
 * @returns {Promise<object|null>}
 */
export async function getTenantInvoiceById(tenantId, invoiceId, clientOrPool) {
  const res = await clientOrPool.query(`
    SELECT *
    FROM gst_invoices
    WHERE id = $1 AND tenant_id = $2
    LIMIT 1
  `, [invoiceId, tenantId]);
  return res.rows[0] || null;
}
