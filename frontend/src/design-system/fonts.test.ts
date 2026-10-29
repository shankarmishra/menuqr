import test from 'node:test';
import assert from 'node:assert';
import { existsSync } from 'node:fs';
import path from 'node:path';
import {
  FONT_PAIRING_IDS,
  FONT_PAIRINGS,
  allFontFamilies,
  fontAssetsFor,
  fontPreloadsFor,
  getFontPairing,
} from './fonts.ts';

const PUBLIC_FONTS_DIR = path.resolve(import.meta.dirname, '../../public/fonts');

test('every pairing preloads at most two faces', () => {
  for (const id of FONT_PAIRING_IDS) {
    const preloads = fontPreloadsFor(id);
    assert.ok(preloads.length <= 2, `${id} preloads ${preloads.length} faces`);
    assert.ok(preloads.length >= 1, `${id} preloads zero faces`);
  }
});

test('preloaded hrefs are a subset of the declared asset manifest', () => {
  for (const id of FONT_PAIRING_IDS) {
    const assetHrefs = new Set(fontAssetsFor(id).map((a) => a.href));
    for (const preload of fontPreloadsFor(id)) {
      assert.ok(assetHrefs.has(preload.href), `${preload.href} missing from fontAssetsFor(${id})`);
    }
  }
});

test('getFontPairing falls back to the default for an unknown id', () => {
  assert.strictEqual(getFontPairing('not-a-real-pairing'), FONT_PAIRINGS['warm-editorial']);
  assert.strictEqual(getFontPairing(undefined), FONT_PAIRINGS['warm-editorial']);
});

test('only devanagari-pro claims Devanagari support', () => {
  for (const [id, pairing] of Object.entries(FONT_PAIRINGS)) {
    assert.strictEqual(pairing.supportsDevanagari, id === 'devanagari-pro');
  }
});

// This is the contract check: every file the manifest declares must actually be shipped under
// public/fonts, named exactly as `assetHref` derives it. A drift here means a family's weights
// or subsets changed in fonts.ts without re-running scripts/fetch-fonts.mjs.
test('every declared font asset file exists on disk', () => {
  const missing: string[] = [];
  for (const id of FONT_PAIRING_IDS) {
    for (const asset of fontAssetsFor(id)) {
      const filePath = path.join(PUBLIC_FONTS_DIR, path.basename(asset.href));
      if (!existsSync(filePath)) missing.push(asset.href);
    }
  }
  assert.deepStrictEqual(missing, []);
});

test('allFontFamilies merges weights and subsets across pairings without losing any', () => {
  const families = allFontFamilies();
  const jakarta = families.find((f) => f.family === 'Plus Jakarta Sans');
  assert.ok(jakarta, 'Plus Jakarta Sans should be present (used by every pairing as the body face)');
  // royal-serif/warm-editorial/bold-street use weights [400,500,700]; modern-sans adds [700,800].
  assert.deepStrictEqual(jakarta.weights, [400, 500, 700, 800]);
  assert.deepStrictEqual(jakarta.subsets, ['latin', 'latin-ext']);

  // Every family must declare the OFL-1.1 licence this phase's self-hosting relies on.
  for (const family of families) {
    assert.strictEqual(family.license, 'OFL-1.1');
  }
});
