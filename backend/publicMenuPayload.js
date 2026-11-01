/**
 * Pure pieces of the public menu payload: the rules that decide what a diner may see before
 * any database row exists for the new tables.
 *
 * Why this file exists: the schema for profiles and ordering settings was added after live
 * restaurants were created, so on the first deploy those tables are empty. Every default below
 * therefore equals what the menu did before the tables existed:
 *   - a restaurant with no `ordering_settings` row offers dine-in and delivery (not takeaway),
 *   - a restaurant with no public contact keeps showing its legacy `clients.phone`,
 *   - Instagram / Facebook / website fall back to the legacy columns.
 * Keeping them here (no database access) lets tests pin them down without a database.
 */

import { apiError } from './utils.js';

// ── Ordering ────────────────────────────────────────────────────────────────

/** What a restaurant without an `ordering_settings` row has always offered. */
export function legacyOrderingSettings() {
  return {
    dineIn: true,
    takeaway: false,
    delivery: true,
    accepting: true,
    autoByHours: false,
    deliveryMinOrder: 0,
    deliveryFee: 0,
    deliveryAreaNote: '',
    payNotes: ['Pay at counter'],
  };
}

/** Maps an `ordering_settings` row (or its absence) to the payload shape. */
export function orderingSettingsFromRow(row) {
  if (!row) return legacyOrderingSettings();
  return {
    dineIn: Boolean(row.dine_in_enabled),
    takeaway: Boolean(row.takeaway_enabled),
    delivery: Boolean(row.delivery_enabled),
    accepting: Boolean(row.accepting_orders),
    autoByHours: Boolean(row.auto_by_hours),
    deliveryMinOrder: Number(row.delivery_min_order || 0),
    deliveryFee: Number(row.delivery_fee || 0),
    deliveryAreaNote: row.delivery_area_note || '',
    payNotes: row.pay_notes || ['Pay at counter'],
  };
}

/**
 * The order endpoint uses the same mapping as the payload, so it can never accept an order type
 * the menu does not offer (and never refuses one it does offer).
 * @param {object|null|undefined} settingsRow raw `ordering_settings` row, or none
 * @param {'DINE_IN'|'TAKEAWAY'|'DELIVERY'} orderType
 */
export function assertOrderTypeAllowed(settingsRow, orderType) {
  const settings = orderingSettingsFromRow(settingsRow);
  if (!settings.accepting) {
    throw apiError(400, 'This restaurant is currently not accepting online orders.');
  }
  if (orderType === 'DINE_IN' && !settings.dineIn) {
    throw apiError(400, 'Dine-in table ordering is currently disabled by the restaurant.');
  }
  if (orderType === 'TAKEAWAY' && !settings.takeaway) {
    throw apiError(400, 'Takeaway pickup ordering is currently disabled by the restaurant.');
  }
  if (orderType === 'DELIVERY' && !settings.delivery) {
    throw apiError(400, 'Delivery ordering is currently disabled by the restaurant.');
  }
}

// ── Public phone ────────────────────────────────────────────────────────────

/**
 * The one rule for which phone number a diner sees. Used by the menu payload and by the order
 * tracking page, so a number the owner hid can never leak through the other door.
 *
 *  1. The owner's contact list is authoritative once it holds a number. The public number is the
 *     primary public contact, else the first public one.
 *  2. A list that holds numbers but none public means the owner chose to show no phone: null.
 *  3. With no usable contact (no profile yet, or the legacy value could not be parsed) the legacy
 *     `clients.phone` stays visible, exactly as before profiles existed, UNLESS the owner
 *     explicitly hid it (`review_flags.phone_hidden`, set by the "Hide" answer or by saving a
 *     contact list with nothing public).
 *
 * `review_flags.phone_privacy_pending` only drives the one-time "Keep / Edit / Hide" prompt on
 * the dashboard. It never hides a number by itself: hiding needs the owner's explicit choice.
 *
 * @param {object|null|undefined} profile `restaurant_profiles` row (snake_case) or none
 * @param {object|null|undefined} client `clients` row (needs `phone`, `review_flags`)
 * @returns {string|null}
 */
export function resolvePublicPhone(profile, client) {
  const contacts = Array.isArray(profile?.contacts) ? profile.contacts : [];
  const withNumber = contacts.filter((c) => c && typeof c.number === 'string' && c.number.trim());
  const publicOnes = withNumber.filter((c) => c.public);
  if (publicOnes.length > 0) {
    const chosen = publicOnes.find((c) => c.primary) || publicOnes[0];
    return chosen.number.trim();
  }
  if (withNumber.length > 0) return null;
  if (profile?.review_flags?.phone_hidden === true || client?.review_flags?.phone_hidden === true) return null;
  const legacy = typeof client?.phone === 'string' ? client.phone.trim() : '';
  return legacy || null;
}

// ── The `restaurant` block ──────────────────────────────────────────────────

function nonEmptyObject(value) {
  return value && typeof value === 'object' && Object.keys(value).length > 0 ? value : null;
}

/**
 * Builds `payload.restaurant` from explicit, named fields only (a whitelist: the `clients` row
 * holds owner email-adjacent and billing-adjacent columns that must never be spread into it).
 *
 * @param {{ client: object, appearance?: object, profile?: object|null }} sources raw DB rows
 */
export function buildRestaurantBlock({ client, appearance = {}, profile = null }) {
  const contactsList = Array.isArray(profile?.contacts) ? profile.contacts : [];
  const linksList = Array.isArray(profile?.links) ? profile.links : [];
  const link = (type) => linksList.find((l) => l.type === type && !l.paused)?.value;
  const weekly = nonEmptyObject(profile?.hours?.weekly);

  return {
    name: profile?.display_name || appearance.restaurant_display_name || client.business_name,
    tagline: profile?.tagline || appearance.tagline || client.tagline || '',
    category: client.category,
    phone: resolvePublicPhone(profile, client),
    address: profile?.address?.line || client.address,
    city: profile?.address?.city || client.city,
    state: profile?.address?.state || client.state,
    pincode: profile?.address?.pincode || '',
    landmark: profile?.address?.landmark || '',
    cuisine: profile?.cuisine_tags?.join(', ') || client.cuisine,
    cuisineTags: profile?.cuisine_tags || (client.cuisine ? client.cuisine.split(',').map((s) => s.trim()).filter(Boolean) : []),
    openingHours: profile?.hours?.note || client.opening_hours,
    weeklyHours: weekly,
    hoursExceptions: profile?.hours?.exceptions || [],
    lastOrderMinutes: profile?.hours?.lastOrderMinutes || 0,
    instagram: link('instagram') || client.instagram,
    facebook: link('facebook') || client.facebook,
    website: link('website') || client.website,
    logo: appearance.logo || client.logo_url || '',
    story: profile?.story || '',
    establishedYear: profile?.established_year || null,
    dietDeclaration: profile?.diet_declaration || null,
    highlights: profile?.highlights || [],
    payments: profile?.payments || [],
    priceNote: profile?.price_note || '',
    serviceChargeNote: profile?.service_charge_note || '',
    fssai: profile?.fssai || '',
    maps: profile?.maps || {},
    contacts: contactsList.filter((c) => c && c.public && c.number),
    links: linksList.filter((l) => !l.paused),
    reservations: profile?.reservations || {},
    i18n: profile?.i18n || {},
  };
}

// ── Legacy accent settings (the two pieces a diner's page still reads) ──────

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

function safeAudioUrl(value) {
  if (typeof value !== 'string' || value.length > 2048) return null;
  if (value.startsWith('/uploads/')) return value;
  try {
    return new URL(value).protocol === 'https:' ? value : null;
  } catch {
    return null;
  }
}

/**
 * The stored `accent_configuration` is a private settings blob (it also holds feature switches
 * and the WhatsApp override), so it is never published as a whole. The diner page still reads
 * exactly two things from it, and both existed in the payload before this server stopped sending
 * the blob: the bespoke page colours (`colors.bg`, `colors.text`) and an already generated voice
 * greeting that keeps playing. Only those two are passed on, checked field by field; anything
 * else in the blob is dropped. Returns null when there is nothing to publish.
 */
export function publicAccentFrom(accentConfiguration) {
  let config = accentConfiguration;
  if (typeof config === 'string') {
    try { config = JSON.parse(config); } catch { return null; }
  }
  if (!config || typeof config !== 'object') return null;

  const out = {};
  const colors = {};
  if (typeof config.colors?.bg === 'string' && HEX_COLOR.test(config.colors.bg.trim())) colors.bg = config.colors.bg.trim();
  if (typeof config.colors?.text === 'string' && HEX_COLOR.test(config.colors.text.trim())) colors.text = config.colors.text.trim();
  if (Object.keys(colors).length > 0) out.colors = colors;

  const greeting = config.voiceGreeting;
  const audioUrl = greeting && greeting.enabled === true ? safeAudioUrl(greeting.audioUrl) : null;
  if (audioUrl) {
    out.voiceGreeting = {
      enabled: true,
      audioUrl,
      ...(typeof greeting.text === 'string' ? { text: greeting.text.slice(0, 200) } : {}),
      ...(greeting.voiceGender === 'male' || greeting.voiceGender === 'female' ? { voiceGender: greeting.voiceGender } : {}),
    };
  }
  return Object.keys(out).length > 0 ? out : null;
}
