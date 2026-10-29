import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FALLBACK_THEME,
  MAX_ANNOUNCEMENT_LENGTH,
  MAX_PRESET_ID_LENGTH,
  MAX_URL_LENGTH,
  THEME_VERSION,
  coerceTheme,
  isValidHex,
  sanitizeImageUrl,
  validateTheme,
} from '../themeValidator.js';

// Imported directly from the frontend package — Node strips TypeScript types natively (no
// esbuild/ts-node in this repo), so both validators run in the same process. That is what makes
// the "agreement" tests below a mechanical guarantee rather than a comment promising two files
// are kept in sync by hand.
import * as clientValidator from '../../frontend/src/design-system/validateTheme.ts';
import { THEME_VERSION as CLIENT_THEME_VERSION } from '../../frontend/src/design-system/theme.types.ts';
import { isValidHex as clientIsValidHex } from '../../frontend/src/design-system/color.ts';

const HOSTILE_URLS = [
  'javascript:alert(1)',
  'JaVaScRiPt:alert(1)',
  'vbscript:msgbox(1)',
  'data:text/html;base64,PHNjcmlwdD4=',
  'data:image/svg+xml,<svg onload=alert(1)>',
  '//evil.example.com/x.webp',
  'file:///etc/passwd',
  'java\tscript:alert(1)',
  ' javascript:alert(1)',
];

const VALID_PARTIAL_THEME = {
  version: THEME_VERSION,
  presetId: 'grand-haveli',
  mode: 'light',
  brand: { seedColor: '#D4AF37', logoUrl: '/uploads/logos/a.webp', logoShape: 'circle' },
  slots: { cover: 'hero-photo', nav: 'capsule-pills', dishCard: 'magazine', section: 'ribbon', footer: 'contact-block' },
  typePair: 'warm-editorial',
  texture: 'grain',
  density: 'balanced',
  radius: 'lg',
  shadow: 'subtle',
  cover: { imageUrl: null, focal: { x: 0.4, y: 0.6 }, overlayStrength: 0.5, showCoverPage: true },
  announcement: 'Happy Hours 4-7 PM',
};

test('themeValidator: security boundary', async (t) => {
  await t.test('rejects every hostile image URL', () => {
    for (const url of HOSTILE_URLS) {
      assert.equal(sanitizeImageUrl(url), null, `must reject ${JSON.stringify(url)}`);
    }
  });

  await t.test('accepts same-origin paths and http(s) URLs', () => {
    assert.equal(sanitizeImageUrl('/uploads/dishes/a.webp'), '/uploads/dishes/a.webp');
    assert.equal(sanitizeImageUrl('https://cdn.menusqr.in/x.webp'), 'https://cdn.menusqr.in/x.webp');
  });

  await t.test('a hostile logo or cover URL never survives into the coerced theme', () => {
    const coerced = coerceTheme({
      brand: { seedColor: '#d4af37', logoUrl: 'javascript:alert(1)' },
      cover: { imageUrl: 'data:text/html,<script>alert(1)</script>' },
    });
    assert.equal(coerced.brand.logoUrl, null);
    assert.equal(coerced.cover.imageUrl, null);

    const serialised = JSON.stringify(coerced);
    assert.ok(!serialised.includes('javascript:'));
    assert.ok(!serialised.includes('<script'));
  });

  await t.test('rejects non-objects outright', () => {
    for (const bad of [null, undefined, 'theme', 42, []]) {
      assert.equal(validateTheme(bad).ok, false);
    }
  });

  await t.test('coerces unknown enum values back to defaults rather than passing them through', () => {
    const coerced = coerceTheme({ mode: 'sepia', density: 'enormous', slots: { dishCard: 'carousel' } });
    assert.equal(coerced.mode, FALLBACK_THEME.mode);
    assert.equal(coerced.density, FALLBACK_THEME.density);
    assert.equal(coerced.slots.dishCard, FALLBACK_THEME.slots.dishCard);
  });

  await t.test('strips control characters from the announcement without eating real punctuation', () => {
    assert.equal(
      coerceTheme({ announcement: '20% off! Call: 98-765 (today)' }).announcement,
      '20% off! Call: 98-765 (today)'
    );
    assert.equal(coerceTheme({ announcement: 'line\nbreak' }).announcement, 'line break');
  });

  await t.test('a fully valid theme passes strict validation unchanged', () => {
    const result = validateTheme(VALID_PARTIAL_THEME);
    assert.equal(result.ok, true, result.ok ? '' : result.errors.join('; '));
    assert.equal(result.theme.presetId, 'grand-haveli');
    assert.equal(result.theme.brand.seedColor, '#d4af37');
  });

  await t.test('reports every invalid field rather than stopping at the first', () => {
    const result = validateTheme({
      ...VALID_PARTIAL_THEME,
      version: 1,
      mode: 'sepia',
      typePair: 'comic-sans',
      slots: { ...VALID_PARTIAL_THEME.slots, dishCard: 'carousel' },
      brand: { ...VALID_PARTIAL_THEME.brand, seedColor: 'octarine' },
    });
    assert.equal(result.ok, false);
    assert.ok(result.errors.length >= 5, `expected several errors, got ${JSON.stringify(result.errors)}`);
  });

  await t.test('isValidHex agrees with the client-side colour engine on a representative set', () => {
    for (const value of ['#fff', '#FFFFFF', 'D4AF37', 'bad-input', '', 'red', '#12345', '#aabbccdd']) {
      assert.equal(
        isValidHex(value),
        clientIsValidHex(value),
        `disagreement on ${JSON.stringify(value)}: server=${isValidHex(value)} client=${clientIsValidHex(value)}`
      );
    }
  });
});

test('themeValidator: client/server contract agreement', async (t) => {
  await t.test('both sides agree on the theme version number', () => {
    assert.equal(THEME_VERSION, CLIENT_THEME_VERSION);
  });

  await t.test('both validators accept or reject the same set of representative themes', () => {
    const samples = [
      VALID_PARTIAL_THEME,
      { ...VALID_PARTIAL_THEME, version: 1 },
      { ...VALID_PARTIAL_THEME, mode: 'sepia' },
      { ...VALID_PARTIAL_THEME, brand: { ...VALID_PARTIAL_THEME.brand, seedColor: 'not-a-colour' } },
      { ...VALID_PARTIAL_THEME, slots: { ...VALID_PARTIAL_THEME.slots, nav: 'hamburger-menu' } },
      null,
      {},
      'a string, not an object',
      FALLBACK_THEME,
    ];

    for (const sample of samples) {
      const serverResult = validateTheme(sample);
      const clientResult = clientValidator.validateTheme(sample);
      assert.equal(
        serverResult.ok,
        clientResult.ok,
        `disagreement on ${JSON.stringify(sample)}: server=${serverResult.ok} client=${clientResult.ok}`
      );
    }
  });

  await t.test('both validators sanitize image URLs identically for every hostile and valid case', () => {
    const cases = [...HOSTILE_URLS, '/uploads/dishes/a.webp', 'https://cdn.menusqr.in/x.webp', '', null, 42];
    for (const value of cases) {
      assert.equal(
        sanitizeImageUrl(value),
        clientValidator.sanitizeImageUrl(value),
        `disagreement sanitizing ${JSON.stringify(value)}`
      );
    }
  });

  await t.test('both validators coerce an identical malformed theme to an identical result', () => {
    const malformed = {
      presetId: 'Not A Valid Slug!!',
      mode: 'nonsense',
      brand: { seedColor: 'octarine', logoUrl: 'javascript:alert(1)' },
      slots: { cover: 'carousel' },
      announcement: 'x'.repeat(500),
    };

    const serverCoerced = coerceTheme(malformed);
    const clientCoerced = clientValidator.coerceTheme(malformed);
    assert.deepEqual(serverCoerced, clientCoerced);
  });

  await t.test('both validators default to the identical fallback theme', () => {
    assert.deepEqual(FALLBACK_THEME, clientValidator.FALLBACK_THEME);
  });

  await t.test('both validators share the same input limits', () => {
    assert.equal(MAX_ANNOUNCEMENT_LENGTH, clientValidator.MAX_ANNOUNCEMENT_LENGTH);
    assert.equal(MAX_URL_LENGTH, clientValidator.MAX_URL_LENGTH);
    assert.equal(MAX_PRESET_ID_LENGTH, clientValidator.MAX_PRESET_ID_LENGTH);
  });
});
