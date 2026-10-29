// MENUQR Backend Theme Validator & Sanitizer
//
// Server-side twin of frontend/src/design-system/validateTheme.ts. The two must stay in step —
// frontend/src/design-system/theme.contract.test.ts asserts the allowlists agree — because the
// Design Studio PUT and this file are the actual trust boundary: a theme JSON document ends up
// interpolated into `style` attributes on the public menu, so a mismatch here is a stored-XSS
// surface, not just a cosmetic inconsistency.
//
// Written as plain predicate functions with no schema dependency, matching the existing
// backend/designSpecValidator.js style rather than introducing a schema library.

export const THEME_VERSION = 2;

const MODES = ['light', 'dark'];
const DENSITIES = ['compact', 'balanced', 'spacious'];
const RADII = ['none', 'sm', 'md', 'lg', 'xl', 'full'];
const SHADOWS = ['none', 'subtle', 'elevated', 'glass'];
const COVER_SLOTS = ['hero-photo', 'monogram', 'heritage-arch', 'bento-collage'];
const NAV_SLOTS = ['capsule-pills', 'underline-tabs', 'sidebar-index'];
const DISH_CARD_SLOTS = ['magazine', 'michelin-leader', 'compact-row', 'bento-tile'];
const SECTION_SLOTS = ['ribbon', 'hairline-caps', 'arch-title'];
const FOOTER_SLOTS = ['contact-block', 'minimal-mark'];
const TEXTURE_IDS = ['none', 'grain', 'parchment', 'slate', 'silk', 'dots'];
const LOGO_SHAPES = ['circle', 'square', 'wordmark'];
const FONT_PAIRING_IDS = ['royal-serif', 'modern-sans', 'warm-editorial', 'bold-street', 'devanagari-pro'];

export const MAX_ANNOUNCEMENT_LENGTH = 120;
export const MAX_URL_LENGTH = 2048;
export const MAX_PRESET_ID_LENGTH = 64;

const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

export function isValidHex(value) {
  return typeof value === 'string' && HEX_PATTERN.test(value.trim());
}

function pick(value, allowed, fallback) {
  return typeof value === 'string' && allowed.includes(value) ? value : fallback;
}

function pickHex(value, fallback) {
  return typeof value === 'string' && isValidHex(value) ? value.trim().toLowerCase() : fallback;
}

/**
 * Accept only same-origin absolute paths and http(s) URLs.
 *
 * Rejects `javascript:`, `data:` and `vbscript:` outright: these values are interpolated into
 * `src` and `background-image` on the rendered menu, so a permissive check here is a stored-XSS
 * vector reachable by anyone who can reach the Design Studio save endpoint.
 */
export function sanitizeImageUrl(value) {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_URL_LENGTH) return null;

  // Reject control characters, used to smuggle a scheme past naive prefix checks.
  for (let i = 0; i < trimmed.length; i += 1) {
    const code = trimmed.charCodeAt(i);
    if (code < 0x20 || code === 0x7f) return null;
  }

  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed;

  try {
    const url = new URL(trimmed);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}

function pickUnitInterval(value, fallback) {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(1, Math.max(0, parsed));
}

/**
 * Strip control characters and collapse whitespace, so an announcement cannot inject line breaks
 * or bidirectional-override characters into the rendered strip.
 *
 * Filtered by code point rather than a regex range: a regex range here is easy to get subtly
 * wrong (see frontend/src/design-system/validateTheme.ts for the specific mistake it replaced),
 * and a wrong range silently eats ordinary punctuation out of a restaurant's own copy.
 */
function pickText(value, maxLength) {
  if (typeof value !== 'string') return null;

  let cleaned = '';
  for (const char of value) {
    const code = char.codePointAt(0);
    const isC0 = code <= 0x1f;
    const isC1 = code >= 0x7f && code <= 0x9f;
    const isLineSeparator = code === 0x2028 || code === 0x2029;
    const isBidiOverride = (code >= 0x202a && code <= 0x202e) || (code >= 0x2066 && code <= 0x2069);

    cleaned += isC0 || isC1 || isLineSeparator || isBidiOverride ? ' ' : char;
  }

  const collapsed = cleaned.replace(/\s+/g, ' ').trim();
  return collapsed ? collapsed.slice(0, maxLength) : null;
}

function pickPresetId(value, fallback) {
  if (typeof value !== 'string') return fallback;
  const cleaned = value.trim().toLowerCase();
  return /^[a-z0-9][a-z0-9-]{0,63}$/.test(cleaned) ? cleaned.slice(0, MAX_PRESET_ID_LENGTH) : fallback;
}

export const FALLBACK_THEME = {
  version: THEME_VERSION,
  presetId: 'the-reserve',
  mode: 'dark',
  brand: { seedColor: '#d4af37', logoUrl: null, logoShape: 'circle' },
  slots: {
    cover: 'monogram',
    nav: 'capsule-pills',
    dishCard: 'michelin-leader',
    section: 'hairline-caps',
    footer: 'contact-block',
  },
  typePair: 'warm-editorial',
  texture: 'none',
  density: 'balanced',
  radius: 'md',
  shadow: 'subtle',
  cover: { imageUrl: null, focal: { x: 0.5, y: 0.5 }, overlayStrength: 0.55, showCoverPage: true },
  announcement: null,
};

/**
 * Coerce arbitrary input into a valid theme. Always returns a usable theme: a partially corrupt
 * record yields a menu with defaults in the damaged fields rather than a blank page.
 */
export function coerceTheme(input, base = FALLBACK_THEME) {
  const raw = input && typeof input === 'object' ? input : {};
  const brand = raw.brand && typeof raw.brand === 'object' ? raw.brand : {};
  const slots = raw.slots && typeof raw.slots === 'object' ? raw.slots : {};
  const cover = raw.cover && typeof raw.cover === 'object' ? raw.cover : {};
  const focal = cover.focal && typeof cover.focal === 'object' ? cover.focal : {};

  return {
    version: THEME_VERSION,
    presetId: pickPresetId(raw.presetId, base.presetId),
    mode: pick(raw.mode, MODES, base.mode),
    brand: {
      seedColor: pickHex(brand.seedColor, base.brand.seedColor),
      logoUrl: sanitizeImageUrl(brand.logoUrl) ?? null,
      logoShape: pick(brand.logoShape, LOGO_SHAPES, base.brand.logoShape),
    },
    slots: {
      cover: pick(slots.cover, COVER_SLOTS, base.slots.cover),
      nav: pick(slots.nav, NAV_SLOTS, base.slots.nav),
      dishCard: pick(slots.dishCard, DISH_CARD_SLOTS, base.slots.dishCard),
      section: pick(slots.section, SECTION_SLOTS, base.slots.section),
      footer: pick(slots.footer, FOOTER_SLOTS, base.slots.footer),
    },
    typePair: pick(raw.typePair, FONT_PAIRING_IDS, base.typePair),
    texture: pick(raw.texture, TEXTURE_IDS, base.texture),
    density: pick(raw.density, DENSITIES, base.density),
    radius: pick(raw.radius, RADII, base.radius),
    shadow: pick(raw.shadow, SHADOWS, base.shadow),
    cover: {
      imageUrl: sanitizeImageUrl(cover.imageUrl) ?? null,
      focal: {
        x: pickUnitInterval(focal.x, base.cover.focal.x),
        y: pickUnitInterval(focal.y, base.cover.focal.y),
      },
      overlayStrength: pickUnitInterval(cover.overlayStrength, base.cover.overlayStrength),
      showCoverPage: typeof cover.showCoverPage === 'boolean' ? cover.showCoverPage : base.cover.showCoverPage,
    },
    announcement: pickText(raw.announcement, MAX_ANNOUNCEMENT_LENGTH),
  };
}

/**
 * Strict check used by the Design Studio publish endpoint.
 *
 * Reports what was wrong *and* returns the coerced theme, so a caller can choose to reject the
 * request (publish does) or accept the repaired value (a draft autosave might, to stay lenient
 * while the owner is mid-edit).
 */
export function validateTheme(input) {
  const errors = [];

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, theme: FALLBACK_THEME, errors: ['theme must be an object'] };
  }

  const coerced = coerceTheme(input);

  if (input.version !== THEME_VERSION) {
    errors.push(`version must be ${THEME_VERSION}, received ${JSON.stringify(input.version)}`);
  }

  const brand = input.brand && typeof input.brand === 'object' ? input.brand : {};
  if (!isValidHex(String(brand.seedColor ?? ''))) {
    errors.push(`brand.seedColor must be a hex colour, received ${JSON.stringify(brand.seedColor)}`);
  }
  if (brand.logoUrl != null && sanitizeImageUrl(brand.logoUrl) === null) {
    errors.push('brand.logoUrl must be a same-origin path or an http(s) URL');
  }

  const cover = input.cover && typeof input.cover === 'object' ? input.cover : {};
  if (cover.imageUrl != null && sanitizeImageUrl(cover.imageUrl) === null) {
    errors.push('cover.imageUrl must be a same-origin path or an http(s) URL');
  }

  const slots = input.slots && typeof input.slots === 'object' ? input.slots : {};
  const enumChecks = [
    ['mode', input.mode, MODES],
    ['typePair', input.typePair, FONT_PAIRING_IDS],
    ['texture', input.texture, TEXTURE_IDS],
    ['density', input.density, DENSITIES],
    ['radius', input.radius, RADII],
    ['shadow', input.shadow, SHADOWS],
    ['slots.cover', slots.cover, COVER_SLOTS],
    ['slots.nav', slots.nav, NAV_SLOTS],
    ['slots.dishCard', slots.dishCard, DISH_CARD_SLOTS],
    ['slots.section', slots.section, SECTION_SLOTS],
    ['slots.footer', slots.footer, FOOTER_SLOTS],
  ];

  for (const [field, value, allowed] of enumChecks) {
    if (!allowed.includes(value)) {
      errors.push(`${field} must be one of [${allowed.join(', ')}], received ${JSON.stringify(value)}`);
    }
  }

  return errors.length === 0 ? { ok: true, theme: coerced } : { ok: false, theme: coerced, errors };
}
