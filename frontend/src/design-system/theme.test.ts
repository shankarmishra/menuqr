import test from 'node:test';
import assert from 'node:assert/strict';
import { contrastRatio } from './color.ts';
import { FONT_PAIRING_IDS, FONT_PAIRINGS, allFontFamilies, fontAssetsFor, fontPreloadsFor } from './fonts.ts';
import { resolveTheme, TOKEN_PREFIX, tokensToCssText } from './resolveTheme.ts';
import { buildTexture } from './textures.ts';
import {
  COVER_SLOTS,
  DISH_CARD_SLOTS,
  FOOTER_SLOTS,
  NAV_SLOTS,
  SECTION_SLOTS,
  TEXTURE_IDS,
  THEME_VERSION,
  type MenuTheme,
} from './theme.types.ts';
import { coerceTheme, FALLBACK_THEME, sanitizeImageUrl, validateTheme } from './validateTheme.ts';

const theme = (overrides: Partial<MenuTheme> = {}): MenuTheme => ({ ...FALLBACK_THEME, ...overrides });

test('fonts: pairing catalogue', async (t) => {
  await t.test('every pairing has a display and body stack with a system fallback', () => {
    for (const id of FONT_PAIRING_IDS) {
      const pairing = FONT_PAIRINGS[id];
      assert.equal(pairing.id, id, 'id must match its key');
      for (const face of [pairing.display, pairing.body]) {
        assert.ok(face.stack.includes(face.family), `${id}: stack must name its family`);
        assert.ok(face.stack.split(',').length >= 2, `${id}: ${face.family} has no fallback`);
        assert.ok(face.weights.length > 0, `${id}: ${face.family} ships no weights`);
        assert.ok(face.subsets.length > 0, `${id}: ${face.family} ships no subsets`);
      }
    }
  });

  await t.test('every family is OFL licensed, so all can be self-hosted', () => {
    for (const face of allFontFamilies()) {
      assert.equal(face.license, 'OFL-1.1', `${face.family} is not OFL`);
    }
  });

  await t.test('the catalogue is far smaller than the thirteen CDN families it replaces', () => {
    const families = allFontFamilies();
    assert.ok(families.length <= 6, `expected at most 6 families, found ${families.length}`);
  });

  await t.test('declares a deduplicated, well-formed asset manifest', () => {
    for (const id of FONT_PAIRING_IDS) {
      const assets = fontAssetsFor(id);
      assert.ok(assets.length > 0, `${id} resolves no font assets`);
      assert.equal(new Set(assets.map((a) => a.href)).size, assets.length, `${id} has duplicate hrefs`);
      for (const asset of assets) {
        assert.match(asset.href, /^\/fonts\/[a-z0-9-]+-\d+-(latin|latin-ext|devanagari)\.woff2$/);
      }
    }
  });

  await t.test('preloads at most two files, to hold the performance budget', () => {
    for (const id of FONT_PAIRING_IDS) {
      const preloads = fontPreloadsFor(id);
      assert.ok(preloads.length >= 1, `${id} preloads nothing`);
      assert.ok(preloads.length <= 2, `${id} would preload ${preloads.length} files`);

      // Everything preloaded must also be declared, or the preload is a wasted request.
      const declared = new Set(fontAssetsFor(id).map((a) => a.href));
      for (const preload of preloads) {
        assert.ok(declared.has(preload.href), `${id}: ${preload.href} is preloaded but not declared`);
      }
    }
  });

  await t.test('a Devanagari pairing preloads its Devanagari subset, not latin', () => {
    for (const preload of fontPreloadsFor('devanagari-pro')) {
      assert.equal(preload.subset, 'devanagari', `${preload.family} preloaded the wrong subset`);
    }
  });

  await t.test('a single-family pairing preloads one file, not the same file twice', () => {
    // modern-sans uses Plus Jakarta Sans for both roles.
    const preloads = fontPreloadsFor('modern-sans');
    assert.equal(new Set(preloads.map((p) => p.href)).size, preloads.length);
  });

  await t.test('exactly one pairing covers Devanagari, for Hindi and Marathi menus', () => {
    const devanagari = FONT_PAIRING_IDS.filter((id) => FONT_PAIRINGS[id].supportsDevanagari);
    assert.ok(devanagari.length >= 1, 'no pairing supports Devanagari');
    for (const id of devanagari) {
      for (const face of [FONT_PAIRINGS[id].display, FONT_PAIRINGS[id].body]) {
        assert.ok(face.subsets.includes('devanagari'), `${id}: ${face.family} lacks the devanagari subset`);
      }
    }
  });
});

test('textures: procedural tiles', async (t) => {
  await t.test('every texture resolves to a usable CSS background', () => {
    for (const id of TEXTURE_IDS) {
      const texture = buildTexture(id, '#635a41');
      if (id === 'none') {
        assert.equal(texture.backgroundImage, 'none');
        continue;
      }
      assert.match(texture.backgroundImage, /^url\("data:image\/svg\+xml,/, `${id} is not a data URI`);
      assert.match(texture.backgroundSize, /^\d+px \d+px$/, `${id} has no tile size`);
      // A double quote inside the url("...") wrapper would terminate it early.
      assert.ok(!texture.backgroundImage.slice(5, -2).includes('"'), `${id} contains an unescaped quote`);
      assert.ok(!texture.backgroundImage.includes('<'), `${id} contains an unencoded angle bracket`);
    }
  });

  await t.test('tiles stay small enough to be inlined without bloating the payload', () => {
    for (const id of TEXTURE_IDS) {
      const { backgroundImage } = buildTexture(id, '#635a41');
      assert.ok(backgroundImage.length < 1200, `${id} is ${backgroundImage.length} bytes`);
    }
  });

  await t.test('the tile picks up the ink colour it is given', () => {
    const gold = buildTexture('silk', '#d4af37').backgroundImage;
    const green = buildTexture('silk', '#0b6e4f').backgroundImage;
    assert.notEqual(gold, green, 'texture must be tinted by the palette, not hardcoded');
  });
});

test('resolveTheme: token emission', async (t) => {
  await t.test('emits a prefixed, non-empty value for every variable', () => {
    const tokens = resolveTheme(theme());
    assert.ok(Object.keys(tokens.cssVariables).length >= 45, 'suspiciously few tokens');

    for (const [name, value] of Object.entries(tokens.cssVariables)) {
      assert.ok(name.startsWith(`${TOKEN_PREFIX}-`), `${name} is not namespaced`);
      assert.ok(String(value).trim().length > 0, `${name} is empty`);
      assert.ok(!String(value).includes('undefined'), `${name} contains "undefined"`);
      assert.ok(!String(value).includes('NaN'), `${name} contains "NaN"`);
    }
  });

  await t.test('camelCase palette tokens become kebab-case custom properties', () => {
    const { cssVariables } = resolveTheme(theme());
    assert.ok(`${TOKEN_PREFIX}-color-surface-alt` in cssVariables);
    assert.ok(`${TOKEN_PREFIX}-color-accent-contrast` in cssVariables);
    assert.ok(`${TOKEN_PREFIX}-color-non-veg` in cssVariables);
    assert.ok(`${TOKEN_PREFIX}-color-focus-on-accent` in cssVariables);
  });

  await t.test('is deterministic and independent of slot choices', () => {
    const a = resolveTheme(theme());
    const b = resolveTheme(theme());
    assert.deepEqual(a.cssVariables, b.cssVariables);

    // Slot selection changes which components render, never the token values.
    const otherSlots = resolveTheme(
      theme({ slots: { ...FALLBACK_THEME.slots, dishCard: 'bento-tile', cover: 'bento-collage' } })
    );
    assert.deepEqual(otherSlots.cssVariables, a.cssVariables);
    assert.equal(otherSlots.slots.dishCard, 'bento-tile');
  });

  await t.test('density changes spacing but never type sizes', () => {
    const compact = resolveTheme(theme({ density: 'compact' })).cssVariables;
    const spacious = resolveTheme(theme({ density: 'spacious' })).cssVariables;

    assert.notEqual(compact[`${TOKEN_PREFIX}-space-4`], spacious[`${TOKEN_PREFIX}-space-4`]);
    assert.equal(compact[`${TOKEN_PREFIX}-text-base`], spacious[`${TOKEN_PREFIX}-text-base`]);
  });

  await t.test('the display scale tracks the pairing optical adjustment', () => {
    const cinzel = resolveTheme(theme({ typePair: 'royal-serif' })).cssVariables;
    const oswald = resolveTheme(theme({ typePair: 'bold-street' })).cssVariables;

    // Cinzel is trimmed (0.92) and Oswald lifted (1.08), so their display sizes must differ
    // while the body scale stays identical.
    assert.notEqual(cinzel[`${TOKEN_PREFIX}-display-2xl`], oswald[`${TOKEN_PREFIX}-display-2xl`]);
    assert.equal(cinzel[`${TOKEN_PREFIX}-text-2xl`], oswald[`${TOKEN_PREFIX}-text-2xl`]);
  });

  await t.test('cover focal point and scrim are derived from the stored values', () => {
    const { cssVariables } = resolveTheme(
      theme({ cover: { imageUrl: '/uploads/covers/x.webp', focal: { x: 0.25, y: 0.8 }, overlayStrength: 0.6, showCoverPage: true } })
    );
    assert.equal(cssVariables[`${TOKEN_PREFIX}-cover-position`], '25% 80%');
    assert.match(cssVariables[`${TOKEN_PREFIX}-cover-scrim`], /^linear-gradient\(to top,/);
  });

  await t.test('out-of-range focal values are clamped rather than emitted raw', () => {
    const { cssVariables } = resolveTheme(
      theme({ cover: { imageUrl: null, focal: { x: -3, y: 42 }, overlayStrength: 9, showCoverPage: false } })
    );
    assert.equal(cssVariables[`${TOKEN_PREFIX}-cover-position`], '0% 100%');
  });

  await t.test('ink on the cover scrim stays legible', () => {
    const { cssVariables } = resolveTheme(theme({ cover: { ...FALLBACK_THEME.cover, overlayStrength: 1 } }));
    // The scrim is anchored near-black in both modes, so cover ink is white either way.
    assert.ok(contrastRatio(cssVariables[`${TOKEN_PREFIX}-color-on-cover`], '#05070a') >= 7);
  });

  await t.test('tokensToCssText produces a parseable rule', () => {
    const css = tokensToCssText(resolveTheme(theme()), '.mq-menu');
    assert.ok(css.startsWith('.mq-menu {'));
    assert.ok(css.trimEnd().endsWith('}'));
    assert.ok(css.includes(`${TOKEN_PREFIX}-color-bg:`));
  });

  await t.test('resolves for every slot and texture combination without throwing', () => {
    for (const cover of COVER_SLOTS) {
      for (const nav of NAV_SLOTS) {
        for (const dishCard of DISH_CARD_SLOTS) {
          for (const section of SECTION_SLOTS) {
            for (const footer of FOOTER_SLOTS) {
              const tokens = resolveTheme(theme({ slots: { cover, nav, dishCard, section, footer } }));
              assert.equal(tokens.slots.cover, cover);
              assert.equal(tokens.slots.footer, footer);
            }
          }
        }
      }
    }
    for (const texture of TEXTURE_IDS) {
      assert.ok(resolveTheme(theme({ texture })).cssVariables[`${TOKEN_PREFIX}-texture-image`]);
    }
  });
});

test('validateTheme: untrusted input', async (t) => {
  await t.test('rejects non-objects', () => {
    for (const bad of [null, undefined, 'theme', 42, []]) {
      const result = validateTheme(bad);
      assert.equal(result.ok, false, `${JSON.stringify(bad)} must not validate`);
    }
  });

  await t.test('accepts the fallback theme as valid', () => {
    const result = validateTheme(FALLBACK_THEME);
    assert.equal(result.ok, true, result.ok ? '' : result.errors.join('; '));
  });

  await t.test('reports each invalid field rather than failing on the first', () => {
    const result = validateTheme({
      ...FALLBACK_THEME,
      version: 1,
      mode: 'sepia',
      typePair: 'comic',
      density: 'enormous',
      slots: { ...FALLBACK_THEME.slots, dishCard: 'carousel' },
      brand: { ...FALLBACK_THEME.brand, seedColor: 'octarine' },
    });

    assert.equal(result.ok, false);
    assert.ok(!result.ok && result.errors.length >= 6, `expected several errors, got ${JSON.stringify(result)}`);
  });

  await t.test('coerces unknown enum values back to defaults instead of passing them through', () => {
    const coerced = coerceTheme({
      mode: 'sepia',
      typePair: 'comic-sans',
      texture: 'lava',
      density: 'enormous',
      radius: 'spiky',
      shadow: 'dramatic',
      slots: { cover: 'carousel', nav: 'hamburger', dishCard: 'table', section: 'marquee', footer: 'sitemap' },
    });

    assert.equal(coerced.mode, FALLBACK_THEME.mode);
    assert.equal(coerced.typePair, FALLBACK_THEME.typePair);
    assert.equal(coerced.texture, FALLBACK_THEME.texture);
    assert.equal(coerced.density, FALLBACK_THEME.density);
    assert.deepEqual(coerced.slots, FALLBACK_THEME.slots);
    assert.equal(coerced.version, THEME_VERSION);
  });

  await t.test('always returns a renderable theme, even from garbage', () => {
    for (const garbage of [{}, { brand: 'nope' }, { slots: 7 }, { cover: { focal: 'middle' } }]) {
      const coerced = coerceTheme(garbage);
      assert.doesNotThrow(() => resolveTheme(coerced), `resolve failed for ${JSON.stringify(garbage)}`);
    }
  });

  await t.test('clamps focal and overlay values into the unit interval', () => {
    const coerced = coerceTheme({ cover: { focal: { x: -10, y: 10 }, overlayStrength: 50 } });
    assert.equal(coerced.cover.focal.x, 0);
    assert.equal(coerced.cover.focal.y, 1);
    assert.equal(coerced.cover.overlayStrength, 1);
  });

  await t.test('strips control characters and truncates the announcement', () => {
    assert.equal(coerceTheme({ announcement: 'Happy  Hours\n4-7 PM' }).announcement, 'Happy Hours 4-7 PM');
    assert.equal(coerceTheme({ announcement: '   ' }).announcement, null);
    assert.equal(coerceTheme({ announcement: 'x'.repeat(500) }).announcement!.length, 120);
    // Ordinary punctuation must survive — a regex range mistake here would eat a real ticker.
    assert.equal(coerceTheme({ announcement: '20% off! Call: 98-765 (today)' }).announcement, '20% off! Call: 98-765 (today)');
  });

  await t.test('preset ids are restricted to a slug shape', () => {
    assert.equal(coerceTheme({ presetId: 'grand-haveli' }).presetId, 'grand-haveli');
    assert.equal(coerceTheme({ presetId: 'The Reserve' }).presetId, FALLBACK_THEME.presetId);
    assert.equal(coerceTheme({ presetId: '../../etc/passwd' }).presetId, FALLBACK_THEME.presetId);
  });
});

test('validateTheme: image URL is a security boundary', async (t) => {
  await t.test('accepts same-origin paths and http(s) URLs', () => {
    assert.equal(sanitizeImageUrl('/uploads/logos/a.webp'), '/uploads/logos/a.webp');
    assert.equal(sanitizeImageUrl('https://cdn.menusqr.in/dishes/a.webp'), 'https://cdn.menusqr.in/dishes/a.webp');
    assert.equal(sanitizeImageUrl('  /uploads/x.webp  '), '/uploads/x.webp');
  });

  await t.test('rejects script-bearing and protocol-relative values', () => {
    const hostile = [
      'javascript:alert(1)',
      'JaVaScRiPt:alert(1)',
      'vbscript:msgbox(1)',
      'data:text/html;base64,PHNjcmlwdD4=',
      'data:image/svg+xml,<svg onload=alert(1)>',
      '//evil.example.com/x.webp',
      'file:///etc/passwd',
      '',
      '   ',
    ];

    for (const value of hostile) {
      assert.equal(sanitizeImageUrl(value), null, `must reject ${JSON.stringify(value)}`);
    }
  });

  await t.test('rejects a scheme smuggled past a prefix check with control characters', () => {
    assert.equal(sanitizeImageUrl('java\tscript:alert(1)'), null);
    assert.equal(sanitizeImageUrl('java\nscript:alert(1)'), null);
    assert.equal(sanitizeImageUrl(' javascript:alert(1)'), null);
  });

  await t.test('rejects absurdly long values', () => {
    assert.equal(sanitizeImageUrl(`/uploads/${'a'.repeat(3000)}.webp`), null);
  });

  await t.test('a hostile URL never survives into the resolved theme', () => {
    const coerced = coerceTheme({
      brand: { seedColor: '#d4af37', logoUrl: 'javascript:alert(1)', logoShape: 'circle' },
      cover: { imageUrl: 'data:text/html,<script>alert(1)</script>', focal: { x: 0.5, y: 0.5 }, overlayStrength: 0.5, showCoverPage: true },
    });

    assert.equal(coerced.brand.logoUrl, null);
    assert.equal(coerced.cover.imageUrl, null);

    const serialised = JSON.stringify(resolveTheme(coerced));
    assert.ok(!serialised.includes('javascript:'), 'javascript: leaked into resolved tokens');
    assert.ok(!serialised.includes('<script'), 'script tag leaked into resolved tokens');
  });
});
