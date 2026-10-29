/**
 * MENUQR Design System — Theme Validation
 *
 * Themes arrive from the network (the Design Studio PUT, and the public menu GET), so they are
 * untrusted input that ends up in `style` attributes. Validation is therefore a security
 * boundary, not a convenience: every field is checked against an allowlist and anything unknown
 * is replaced with a default rather than passed through.
 *
 * Written as plain predicate functions with no schema dependency, mirroring the existing
 * `backend/designSpecValidator.js` so the client and server rules stay readable side by side.
 * `backend/themeValidator.js` is the server-side twin of this file and must be kept in step —
 * `theme.contract.test.ts` asserts the two allowlists agree.
 */

import { isValidHex } from './color.ts';
import { DEFAULT_FONT_PAIRING, FONT_PAIRING_IDS, type FontPairingId } from './fonts.ts';
import { DEFAULT_SEED } from './palette.ts';
import {
  CENTRE_FOCAL,
  COVER_SLOTS,
  DISH_CARD_SLOTS,
  FOOTER_SLOTS,
  LOGO_SHAPES,
  NAV_SLOTS,
  SECTION_SLOTS,
  SIGNATURE_COMPOSITION_IDS,
  TEXTURE_IDS,
  THEME_VERSION,
  type MenuTheme,
  type SignatureCompositionId,
} from './theme.types.ts';

const MODES = ['light', 'dark'] as const;
const DENSITIES = ['compact', 'balanced', 'spacious'] as const;
const RADII = ['none', 'sm', 'md', 'lg', 'xl', 'full'] as const;
const SHADOWS = ['none', 'subtle', 'elevated', 'glass'] as const;

export const MAX_ANNOUNCEMENT_LENGTH = 120;
export const MAX_URL_LENGTH = 2048;
export const MAX_PRESET_ID_LENGTH = 64;

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function pickHex(value: unknown, fallback: string): string {
  return typeof value === 'string' && isValidHex(value) ? value.trim().toLowerCase() : fallback;
}

/**
 * Accept only same-origin absolute paths and http(s) URLs.
 *
 * Rejects `javascript:`, `data:` and `vbscript:` outright: these values are interpolated into
 * `src` and `background-image`, so a permissive check here would be a stored-XSS vector.
 */
export function sanitizeImageUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_URL_LENGTH) return null;

  // Reject control characters, which are used to smuggle a scheme past naive prefix checks.
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

function pickUnitInterval(value: unknown, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(1, Math.max(0, parsed));
}

/**
 * Strip control characters and collapse whitespace, so an announcement cannot inject line
 * breaks or bidirectional-override characters into the rendered strip.
 *
 * Filtered by code point rather than a regex range: writing the range literally puts raw
 * control bytes in the source (git then treats the file as binary), and a mistyped range
 * silently eats ordinary punctuation out of a restaurant's own copy.
 */
function pickText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;

  let cleaned = '';
  for (const char of value) {
    const code = char.codePointAt(0)!;
    const isC0 = code <= 0x1f;
    const isC1 = code >= 0x7f && code <= 0x9f;
    const isLineSeparator = code === 0x2028 || code === 0x2029;
    const isBidiOverride = (code >= 0x202a && code <= 0x202e) || (code >= 0x2066 && code <= 0x2069);

    cleaned += isC0 || isC1 || isLineSeparator || isBidiOverride ? ' ' : char;
  }

  const collapsed = cleaned.replace(/\s+/g, ' ').trim();
  return collapsed ? collapsed.slice(0, maxLength) : null;
}

function pickPresetId(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const cleaned = value.trim().toLowerCase();
  return /^[a-z0-9][a-z0-9-]{0,63}$/.test(cleaned) ? cleaned.slice(0, MAX_PRESET_ID_LENGTH) : fallback;
}

function pickSignatureId(
  value: unknown,
  fallback: SignatureCompositionId | null
): SignatureCompositionId | null {
  if (value === null) return null;
  return typeof value === 'string' &&
    (SIGNATURE_COMPOSITION_IDS as readonly string[]).includes(value)
    ? (value as SignatureCompositionId)
    : fallback;
}

export const FALLBACK_THEME: MenuTheme = {
  version: THEME_VERSION,
  presetId: 'the-reserve',
  mode: 'dark',
  brand: { seedColor: DEFAULT_SEED.toLowerCase(), logoUrl: null, logoShape: 'circle' },
  slots: {
    cover: 'monogram',
    nav: 'capsule-pills',
    dishCard: 'michelin-leader',
    section: 'hairline-caps',
    footer: 'contact-block',
  },
  signatureId: null,
  typePair: DEFAULT_FONT_PAIRING,
  texture: 'none',
  density: 'balanced',
  radius: 'md',
  shadow: 'subtle',
  cover: { imageUrl: null, focal: CENTRE_FOCAL, overlayStrength: 0.55, showCoverPage: true },
  announcement: null,
};

/**
 * Coerce arbitrary input into a valid `MenuTheme`.
 *
 * Always returns a usable theme: a partially corrupt record yields a menu with defaults in the
 * damaged fields rather than a blank page. Use `validateTheme` when you need to know whether the
 * input was actually well formed.
 */
export function coerceTheme(input: unknown, base: MenuTheme = FALLBACK_THEME): MenuTheme {
  const raw = (input ?? {}) as Partial<MenuTheme> & Record<string, unknown>;
  const brand = (raw.brand ?? {}) as Record<string, unknown>;
  const slots = (raw.slots ?? {}) as Record<string, unknown>;
  const cover = (raw.cover ?? {}) as Record<string, unknown>;
  const focal = (cover.focal ?? {}) as Record<string, unknown>;

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
    signatureId: pickSignatureId(raw.signatureId, base.signatureId),
    typePair: pick(raw.typePair, FONT_PAIRING_IDS as readonly FontPairingId[], base.typePair),
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
      showCoverPage:
        typeof cover.showCoverPage === 'boolean' ? cover.showCoverPage : base.cover.showCoverPage,
    },
    announcement: pickText(raw.announcement, MAX_ANNOUNCEMENT_LENGTH),
  };
}

export type ThemeValidationResult =
  | { ok: true; theme: MenuTheme }
  | { ok: false; theme: MenuTheme; errors: string[] };

/**
 * Strict check used by the Design Studio save path and the preset lint.
 *
 * Reports what was wrong *and* returns the coerced theme, so a caller can either reject the
 * request or accept the repaired value depending on how much it trusts the source.
 */
export function validateTheme(input: unknown): ThemeValidationResult {
  const errors: string[] = [];

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, theme: FALLBACK_THEME, errors: ['theme must be an object'] };
  }

  const raw = input as Record<string, unknown>;
  const coerced = coerceTheme(raw);

  if (raw.version !== THEME_VERSION) {
    errors.push(`version must be ${THEME_VERSION}, received ${JSON.stringify(raw.version)}`);
  }

  const brand = (raw.brand ?? {}) as Record<string, unknown>;
  if (!isValidHex(String(brand.seedColor ?? ''))) {
    errors.push(`brand.seedColor must be a hex colour, received ${JSON.stringify(brand.seedColor)}`);
  }
  if (brand.logoUrl != null && sanitizeImageUrl(brand.logoUrl) === null) {
    errors.push('brand.logoUrl must be a same-origin path or an http(s) URL');
  }

  const cover = (raw.cover ?? {}) as Record<string, unknown>;
  if (cover.imageUrl != null && sanitizeImageUrl(cover.imageUrl) === null) {
    errors.push('cover.imageUrl must be a same-origin path or an http(s) URL');
  }

  if (
    raw.signatureId != null &&
    !(SIGNATURE_COMPOSITION_IDS as readonly string[]).includes(String(raw.signatureId))
  ) {
    errors.push(
      `signatureId must be null or one of [${SIGNATURE_COMPOSITION_IDS.join(', ')}], received ${JSON.stringify(raw.signatureId)}`
    );
  }

  const enumChecks: Array<[string, unknown, readonly string[]]> = [
    ['mode', raw.mode, MODES],
    ['typePair', raw.typePair, FONT_PAIRING_IDS],
    ['texture', raw.texture, TEXTURE_IDS],
    ['density', raw.density, DENSITIES],
    ['radius', raw.radius, RADII],
    ['shadow', raw.shadow, SHADOWS],
    ['slots.cover', (raw.slots as Record<string, unknown>)?.cover, COVER_SLOTS],
    ['slots.nav', (raw.slots as Record<string, unknown>)?.nav, NAV_SLOTS],
    ['slots.dishCard', (raw.slots as Record<string, unknown>)?.dishCard, DISH_CARD_SLOTS],
    ['slots.section', (raw.slots as Record<string, unknown>)?.section, SECTION_SLOTS],
    ['slots.footer', (raw.slots as Record<string, unknown>)?.footer, FOOTER_SLOTS],
  ];

  for (const [field, value, allowed] of enumChecks) {
    if (!allowed.includes(String(value))) {
      errors.push(`${field} must be one of [${allowed.join(', ')}], received ${JSON.stringify(value)}`);
    }
  }

  return errors.length === 0 ? { ok: true, theme: coerced } : { ok: false, theme: coerced, errors };
}
