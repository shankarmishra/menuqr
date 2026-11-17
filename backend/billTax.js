// GST on a restaurant's table bills, in one place.
//
// The restaurant chooses its GST status in Settings (restaurant_profiles.gst_mode):
//   UNSET           not chosen yet: the historical 5% is kept so existing bills do not change.
//   NOT_REGISTERED  no GST on the bill.
//   COMPOSITION     no GST on the bill (composition dealers cannot collect tax).
//   REGULAR         GST at gst_rate_bps, split equally into CGST and SGST.
//
// A bill freezes the rule it was created with (table_tokens.tax_mode / tax_rate_bps), so a later
// change of setting never rewrites an existing bill.
import { pool } from './db.js';

export const DEFAULT_TAX_SETTINGS = Object.freeze({ mode: 'UNSET', rateBps: 500 });
const MODES = new Set(['UNSET', 'NOT_REGISTERED', 'COMPOSITION', 'REGULAR']);
const RATES = new Set([0, 500, 1200, 1800]);

export function normalizeTaxSettings(mode, rateBps) {
  const m = MODES.has(String(mode || '').toUpperCase()) ? String(mode).toUpperCase() : 'UNSET';
  const r = Number(rateBps);
  if (m === 'NOT_REGISTERED' || m === 'COMPOSITION') return { mode: m, rateBps: 0 };
  if (m === 'UNSET') return { mode: m, rateBps: 500 };
  return { mode: m, rateBps: RATES.has(r) ? r : 500 };
}

/**
 * Reads the restaurant's current GST setting. Uses the pool, not a transaction client, so a
 * database without migration 027 falls back to the default instead of aborting the caller's
 * transaction.
 */
export async function loadTenantTaxSettings(tenantId, db = pool) {
  try {
    const res = await db.query('SELECT gst_mode, gst_rate_bps FROM restaurant_profiles WHERE tenant_id = $1', [tenantId]);
    const row = res.rows?.[0];
    return row ? normalizeTaxSettings(row.gst_mode, row.gst_rate_bps) : { ...DEFAULT_TAX_SETTINGS };
  } catch {
    return { ...DEFAULT_TAX_SETTINGS };
  }
}

/**
 * The rule an existing bill follows. Bills created before migration 027 have no frozen rule;
 * they keep the old behaviour: 5% if tax was already charged on them, otherwise none.
 */
export function taxSettingsOfToken(row) {
  if (row?.tax_mode) return normalizeTaxSettings(row.tax_mode, row.tax_rate_bps);
  return Number(row?.tax_paise || 0) > 0 ? { mode: 'UNSET', rateBps: 500 } : { mode: 'NOT_REGISTERED', rateBps: 0 };
}

/**
 * GST for a bill subtotal (integer paise). CGST and SGST are each rounded to the paisa, so
 * taxPaise always equals cgstPaise + sgstPaise.
 */
export function computeBillTax(subtotalPaise, settings = DEFAULT_TAX_SETTINGS) {
  const { mode, rateBps } = normalizeTaxSettings(settings.mode, settings.rateBps);
  const base = Math.max(0, Math.round(Number(subtotalPaise) || 0));
  const halfPaise = rateBps > 0 ? Math.round((base * rateBps) / 20000) : 0;
  return {
    mode,
    rateBps,
    cgstPaise: halfPaise,
    sgstPaise: halfPaise,
    taxPaise: halfPaise * 2,
  };
}
