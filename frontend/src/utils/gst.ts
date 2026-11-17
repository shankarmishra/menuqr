// GST helpers shared by the restaurant settings, the printed bill and the free GST calculator.
// The backend applies the same rules (backend/validation.js, backend/billTax.js).

export type GstMode = 'UNSET' | 'NOT_REGISTERED' | 'COMPOSITION' | 'REGULAR';
export const GST_RATES_BPS = [0, 500, 1200, 1800] as const;

const GSTIN_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const GSTIN_SHAPE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

function gstinCheckCharacter(first14: string): string {
  let factor = 2;
  let sum = 0;
  for (let i = first14.length - 1; i >= 0; i--) {
    const product = factor * GSTIN_CHARS.indexOf(first14[i]);
    factor = factor === 2 ? 1 : 2;
    sum += Math.floor(product / 36) + (product % 36);
  }
  return GSTIN_CHARS[(36 - (sum % 36)) % 36];
}

/** Returns null when the GSTIN is valid, otherwise a message the owner can act on. */
export function gstinError(input: string): string | null {
  const value = String(input || '').replace(/\s+/g, '').toUpperCase();
  if (!value) return 'Enter your 15-character GSTIN.';
  if (value.length !== 15) return 'A GSTIN has exactly 15 characters.';
  if (!GSTIN_SHAPE.test(value)) return 'This does not look like a GSTIN. Check it against your GST certificate.';
  const state = Number(value.slice(0, 2));
  if (!((state >= 1 && state <= 38) || state === 97 || state === 99)) return 'The first two digits must be a valid state code.';
  if (gstinCheckCharacter(value.slice(0, 14)) !== value[14]) return 'The last character does not match. Check for a typing mistake.';
  return null;
}

/** Returns null when the FSSAI number is valid or empty, otherwise a message. */
export function fssaiError(input: string): string | null {
  const value = String(input || '').replace(/\s+/g, '');
  if (!value) return null;
  if (!/^\d{14}$/.test(value) || /^(\d)\1{13}$/.test(value)) return 'An FSSAI number has exactly 14 digits.';
  return null;
}

/** "5%" or "2.5%" from basis points. */
export function formatRate(bps: number): string {
  const pct = bps / 100;
  return `${Number.isInteger(pct) ? pct : pct.toFixed(1)}%`;
}

/** Which tax lines a bill prints, from the GST rule it was created under. */
export function billTaxLines(mode: string | null | undefined, rateBps: number | null | undefined, cgstPaise: number, sgstPaise: number) {
  const m = (mode || 'UNSET').toUpperCase();
  if (m === 'NOT_REGISTERED' || m === 'COMPOSITION' || cgstPaise + sgstPaise <= 0) return [];
  const half = (rateBps ?? 500) / 2;
  return [
    { label: `CGST (${formatRate(half)})`, paise: cgstPaise },
    { label: `SGST (${formatRate(half)})`, paise: sgstPaise },
  ];
}

export const COMPOSITION_DECLARATION = 'Composition taxable person, not eligible to collect tax on supplies.';

export interface GstBreakdown {
  taxablePaise: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  taxPaise: number;
  totalPaise: number;
}

/**
 * GST on an amount in paise. `inclusive` means the amount already contains GST (back-calculated);
 * `interState` gives IGST in place of CGST + SGST. Halves are rounded to the paisa so the parts
 * always add up to the total.
 */
export function calculateGst(amountPaise: number, rateBps: number, { inclusive = false, interState = false } = {}): GstBreakdown {
  const amount = Math.max(0, Math.round(amountPaise || 0));
  const rate = Math.max(0, rateBps || 0);
  let taxable = inclusive ? Math.round((amount * 10000) / (10000 + rate)) : amount;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  if (interState) {
    igst = Math.round((taxable * rate) / 10000);
  } else {
    cgst = Math.round((taxable * rate) / 20000);
    sgst = cgst;
  }
  let tax = cgst + sgst + igst;
  if (inclusive) {
    // Keep the total equal to what was entered; the rounding paisa sits in the taxable value.
    taxable = amount - tax;
  }
  return { taxablePaise: taxable, cgstPaise: cgst, sgstPaise: sgst, igstPaise: igst, taxPaise: tax, totalPaise: taxable + tax };
}

export const RESTAURANT_TYPE_OPTIONS = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'cafe', label: 'Café' },
  { value: 'dhaba', label: 'Dhaba' },
  { value: 'bar', label: 'Bar / Restro-bar' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'sweet_shop', label: 'Sweet shop' },
  { value: 'cloud_kitchen', label: 'Cloud kitchen' },
  { value: 'food_truck', label: 'Food truck' },
  { value: 'hotel_restaurant', label: 'Restaurant in a hotel' },
  { value: 'canteen', label: 'Canteen' },
  { value: 'other', label: 'Other' },
] as const;
