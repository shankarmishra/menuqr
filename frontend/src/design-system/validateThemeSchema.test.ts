import test from 'node:test';
import assert from 'node:assert/strict';
import { FALLBACK_THEME } from './validateTheme.ts';
import { validateThemeSchema } from './validateThemeSchema.ts';

test('validateThemeSchema: strict Zod validation', async (t) => {
  await t.test('accepts the canonical fallback theme', () => {
    const result = validateThemeSchema(FALLBACK_THEME);
    assert.equal(result.ok, true);
    assert.deepEqual(result.data, FALLBACK_THEME);
  });

  await t.test('rejects arbitrary CSS injection attempts', () => {
    const maliciousTheme = {
      ...FALLBACK_THEME,
      customCss: 'body { display: none !important; }',
    };
    const result = validateThemeSchema(maliciousTheme);
    assert.equal(result.ok, false);
    assert.ok(result.errors?.some((e) => e.includes('unrecognized_keys') || e.includes('customCss')));
  });

  await t.test('rejects hex colors containing CSS injection attempts', () => {
    const maliciousColorTheme = {
      ...FALLBACK_THEME,
      brand: {
        ...FALLBACK_THEME.brand,
        seedColor: '#d4af37; background: red;',
      },
    };
    const result = validateThemeSchema(maliciousColorTheme);
    assert.equal(result.ok, false);
    assert.ok(result.errors?.some((e) => e.includes('seedColor')));
  });

  await t.test('rejects javascript: and data: URLs in brand logo and cover image', () => {
    const jsUrlTheme = {
      ...FALLBACK_THEME,
      brand: {
        ...FALLBACK_THEME.brand,
        logoUrl: 'javascript:alert(1)',
      },
    };
    const result = validateThemeSchema(jsUrlTheme);
    assert.equal(result.ok, false);
    assert.ok(result.errors?.some((e) => e.includes('logoUrl')));
  });

  await t.test('rejects out of range unit interval values', () => {
    const badFocal = {
      ...FALLBACK_THEME,
      cover: {
        ...FALLBACK_THEME.cover,
        focal: { x: 1.5, y: -0.2 },
      },
    };
    const result = validateThemeSchema(badFocal);
    assert.equal(result.ok, false);
    assert.ok(result.errors?.some((e) => e.includes('focal.x') || e.includes('focal.y')));
  });
});
