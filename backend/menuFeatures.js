/**
 * MENUQR — Menu Features toggle set
 *
 * One consolidated on/off panel the owner uses to control which customer-facing menu features
 * are live — including the existing Call Waiter button, down to its individual request types.
 * Stored in `appearance_settings.accent_configuration.menuFeatures`, the same JSONB column and
 * merge convention already used for `voiceGreeting` (see `routes/app.js`'s
 * `POST /api/app/voice-greeting` handler) — no migration.
 *
 * Defaults below intentionally reproduce today's hardcoded behaviour exactly (Call Waiter on,
 * all three request types, gated only by the existing `isPremium` plan check on the frontend) so
 * shipping this panel changes nothing for an existing client until they touch a toggle.
 */

import { normalizePhone } from './sms.js';

export const SERVICE_REQUEST_TYPES = ['WATER', 'WAITER', 'BILL'];

export const DEFAULT_MENU_FEATURES = {
  callWaiter: { enabled: true, types: [...SERVICE_REQUEST_TYPES] },
  whatsappChat: { enabled: false, number: null },
  allergenFilter: { enabled: true },
  spiceFilter: { enabled: true },
  trending: { enabled: true },
  multiLanguage: { enabled: false },
  accessibilityControls: { enabled: true },
};

/** Validates and whitelists owner-submitted menu-feature toggles before they're stored. */
export function inputMenuFeatures(value) {
  const v = value && typeof value === 'object' ? value : {};

  const rawTypes = Array.isArray(v.callWaiter?.types) ? v.callWaiter.types : null;
  const callWaiterTypes = rawTypes
    ? [...new Set(rawTypes.map((t) => String(t).toUpperCase()).filter((t) => SERVICE_REQUEST_TYPES.includes(t)))]
    : [...SERVICE_REQUEST_TYPES];

  return {
    callWaiter: {
      enabled: v.callWaiter?.enabled !== false,
      types: callWaiterTypes.length > 0 ? callWaiterTypes : [...SERVICE_REQUEST_TYPES],
    },
    whatsappChat: {
      enabled: v.whatsappChat?.enabled === true,
      number: v.whatsappChat?.number ? String(v.whatsappChat.number).trim().slice(0, 30) : null,
    },
    allergenFilter: { enabled: v.allergenFilter?.enabled !== false },
    spiceFilter: { enabled: v.spiceFilter?.enabled !== false },
    trending: { enabled: v.trending?.enabled !== false },
    multiLanguage: { enabled: v.multiLanguage?.enabled === true },
    accessibilityControls: { enabled: v.accessibilityControls?.enabled !== false },
  };
}

/**
 * Merges stored menu-feature toggles (or their absence) with the defaults, and resolves the
 * WhatsApp chat number — the owner's explicit override, or `clients.phone` as a fallback — into
 * the E.164 shape `wa.me` needs. Called once per public menu read, so the resolution happens
 * server-side and the frontend never re-derives a phone format.
 */
export function resolveMenuFeatures(accentConfiguration, clientPhone) {
  const stored = accentConfiguration && typeof accentConfiguration === 'object' ? accentConfiguration.menuFeatures : null;
  const merged = stored ? inputMenuFeatures(stored) : DEFAULT_MENU_FEATURES;

  const resolvedNumber = merged.whatsappChat.enabled
    ? normalizePhone(merged.whatsappChat.number || clientPhone || '')
    : '';

  return {
    ...merged,
    whatsappChat: { ...merged.whatsappChat, resolvedNumber: resolvedNumber || null },
  };
}
