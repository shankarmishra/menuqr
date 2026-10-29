import test from 'node:test';
import assert from 'node:assert/strict';
import {
  adjust,
  alpha,
  contrastRatio,
  ensureContrast,
  hexToOklch,
  isDark,
  isValidHex,
  mix,
  oklchToHex,
  parseHex,
  readableOn,
  relativeLuminance,
  rgbToOklch,
  toHex,
} from './color.ts';

/** A spread of hues wide enough to catch hue-specific maths errors. */
const HUE_SWEEP = Array.from({ length: 24 }, (_, i) => {
  const h = i * 15;
  return oklchToHex({ l: 0.62, c: 0.16, h });
});

/** Brand colours a real restaurant owner would plausibly pick, including hostile ones. */
const SEED_COLOURS = [
  '#D4AF37', // gold
  '#064F43', // emerald
  '#C62828', // red
  '#38BDF8', // sky
  '#FFC928', // yellow — worst case for light backgrounds
  '#000000', // black
  '#FFFFFF', // white
  '#808080', // mid grey — worst case overall
  '#4ADE80', // mint
  '#8D1436', // maroon
];

test('colour: hex parsing', async (t) => {
  await t.test('accepts 3, 4, 6 and 8 digit forms with or without the hash', () => {
    assert.deepEqual(parseHex('#abc'), { r: 0xaa, g: 0xbb, b: 0xcc });
    assert.deepEqual(parseHex('abc'), { r: 0xaa, g: 0xbb, b: 0xcc });
    assert.deepEqual(parseHex('#AABBCC'), { r: 0xaa, g: 0xbb, b: 0xcc });
    assert.deepEqual(parseHex('#aabbccdd'), { r: 0xaa, g: 0xbb, b: 0xcc }, 'alpha is dropped');
    assert.deepEqual(parseHex('  #fff  '), { r: 255, g: 255, b: 255 }, 'whitespace tolerated');
  });

  await t.test('rejects anything that is not a hex colour', () => {
    for (const bad of ['', 'red', '#12345', '#gggggg', 'rgb(1,2,3)', 'javascript:alert(1)']) {
      assert.equal(parseHex(bad), null, `must reject ${JSON.stringify(bad)}`);
      assert.equal(isValidHex(bad), false);
    }
    assert.equal(parseHex(null as unknown as string), null);
  });

  await t.test('hash-less input is accepted, so some 3-letter words are valid colours', () => {
    // Deliberate: owners paste "D4AF37" without the hash. The cost is that hex-only words such
    // as "bad" or "fad" parse as colours. Harmless — the value is always re-serialised to a
    // canonical #rrggbb, and the only entry point is a colour field.
    assert.deepEqual(parseHex('bad'), { r: 0xbb, g: 0xaa, b: 0xdd });
    assert.deepEqual(parseHex('D4AF37'), { r: 0xd4, g: 0xaf, b: 0x37 });
    assert.equal(parseHex('red'), null, 'r is not a hex digit');
  });

  await t.test('toHex is lowercase, hash-prefixed and clamped', () => {
    assert.equal(toHex({ r: 255, g: 255, b: 255 }), '#ffffff');
    assert.equal(toHex({ r: 0, g: 0, b: 0 }), '#000000');
    assert.equal(toHex({ r: 300, g: -20, b: 128 }), '#ff0080');
  });
});

test('colour: OKLCH conversion', async (t) => {
  await t.test('white and black sit at the lightness extremes with no chroma', () => {
    const white = hexToOklch('#ffffff')!;
    assert.ok(Math.abs(white.l - 1) < 1e-4, `white L should be 1, got ${white.l}`);
    assert.ok(white.c < 1e-4, `white should have no chroma, got ${white.c}`);

    const black = hexToOklch('#000000')!;
    assert.ok(Math.abs(black.l) < 1e-4, `black L should be 0, got ${black.l}`);
    assert.ok(black.c < 1e-4);
  });

  await t.test('hex round-trips through OKLCH within one 8-bit step', () => {
    for (const hex of [...SEED_COLOURS, ...HUE_SWEEP]) {
      const back = oklchToHex(hexToOklch(hex)!);
      const a = parseHex(hex)!;
      const b = parseHex(back)!;
      for (const channel of ['r', 'g', 'b'] as const) {
        assert.ok(
          Math.abs(a[channel] - b[channel]) <= 1,
          `${hex} -> ${back}: channel ${channel} drifted by ${Math.abs(a[channel] - b[channel])}`
        );
      }
    }
  });

  await t.test('lightness ordering is perceptually monotonic for every hue', () => {
    for (let h = 0; h < 360; h += 30) {
      let previous = -1;
      for (const l of [0.2, 0.4, 0.6, 0.8]) {
        const luminance = relativeLuminance(parseHex(oklchToHex({ l, c: 0.1, h }))!);
        assert.ok(luminance > previous, `hue ${h}: L=${l} must be lighter than the step below`);
        previous = luminance;
      }
    }
  });

  await t.test('out-of-gamut chroma is reduced rather than channel-clamped, preserving hue', () => {
    // c = 0.37 is far outside sRGB for most hues; the result must still be a valid colour whose
    // hue is close to what was asked for.
    for (let h = 0; h < 360; h += 45) {
      const hex = oklchToHex({ l: 0.55, c: 0.37, h });
      assert.ok(isValidHex(hex), `hue ${h} produced invalid hex ${hex}`);

      const actual = rgbToOklch(parseHex(hex)!);
      const drift = Math.min(Math.abs(actual.h - h), 360 - Math.abs(actual.h - h));
      assert.ok(drift < 6, `hue ${h} drifted to ${actual.h.toFixed(1)} (${drift.toFixed(1)} deg)`);
    }
  });

  await t.test('adjust clamps lightness and chroma and normalises hue', () => {
    const base = hexToOklch('#D4AF37')!;
    assert.equal(adjust(base, { l: 5 }).l, 1);
    assert.equal(adjust(base, { l: -5 }).l, 0);
    assert.equal(adjust(base, { c: 99 }).c, 0.37);
    assert.equal(adjust(base, { c: -1 }).c, 0);
    assert.equal(adjust(base, { h: 420 }).h, 60);
    assert.equal(adjust(base, { h: -30 }).h, 330);
  });
});

test('colour: WCAG contrast', async (t) => {
  await t.test('matches the defined endpoints of the ratio scale', () => {
    assert.equal(Math.round(contrastRatio('#ffffff', '#000000') * 1000) / 1000, 21);
    assert.equal(contrastRatio('#000000', '#ffffff'), contrastRatio('#ffffff', '#000000'), 'symmetric');
    assert.equal(contrastRatio('#808080', '#808080'), 1, 'identical colours have no contrast');
  });

  await t.test('returns the neutral ratio for unparseable input instead of throwing', () => {
    assert.equal(contrastRatio('not-a-colour', '#ffffff'), 1);
  });

  await t.test('isDark and readableOn agree on the obvious cases', () => {
    assert.equal(isDark('#000000'), true);
    assert.equal(isDark('#160814'), true);
    assert.equal(isDark('#ffffff'), false);
    assert.equal(isDark('#F7EBD7'), false);
    assert.equal(readableOn('#000000'), '#ffffff');
    assert.equal(readableOn('#ffffff'), '#000000');
    assert.equal(readableOn('#064F43'), '#ffffff');
  });
});

test('colour: ensureContrast is a hard legibility guarantee', async (t) => {
  await t.test('every seed colour becomes legible on every seed background', () => {
    for (const fg of SEED_COLOURS) {
      for (const bg of SEED_COLOURS) {
        const fixed = ensureContrast(fg, bg, 4.5);
        assert.ok(isValidHex(fixed), `${fg} on ${bg} produced invalid hex ${fixed}`);

        const ratio = contrastRatio(fixed, bg);
        // A mid-grey background cannot reach 4.5:1 with any colour; black or white is then the
        // mathematical best available, so assert we at least matched that ceiling.
        const ceiling = contrastRatio(readableOn(bg), bg);
        const required = Math.min(4.5, ceiling);
        assert.ok(
          ratio >= required - 1e-6,
          `${fg} on ${bg} -> ${fixed} is only ${ratio.toFixed(2)}:1 (needed ${required.toFixed(2)})`
        );
      }
    }
  });

  await t.test('holds across the full hue sweep at the stricter 7:1 level', () => {
    for (const fg of HUE_SWEEP) {
      for (const bg of ['#ffffff', '#000000', '#160814', '#F7EBD7']) {
        const ratio = contrastRatio(ensureContrast(fg, bg, 7), bg);
        assert.ok(ratio >= 7 - 1e-6, `${fg} on ${bg} reached only ${ratio.toFixed(2)}:1`);
      }
    }
  });

  await t.test('leaves an already-compliant colour untouched', () => {
    assert.equal(ensureContrast('#000000', '#ffffff', 4.5), '#000000');
    assert.equal(ensureContrast('#ffffff', '#000000', 4.5), '#ffffff');
  });

  await t.test('stays as close to the brand colour as legibility allows', () => {
    // Gold on cream fails outright; the fix should darken the gold, not discard its hue.
    const fixed = ensureContrast('#D4AF37', '#F7EBD7', 4.5);
    const original = hexToOklch('#D4AF37')!;
    const result = hexToOklch(fixed)!;

    assert.ok(contrastRatio(fixed, '#F7EBD7') >= 4.5);
    assert.ok(result.l < original.l, 'must darken against a light background');
    const drift = Math.min(Math.abs(result.h - original.h), 360 - Math.abs(result.h - original.h));
    assert.ok(drift < 15, `hue drifted ${drift.toFixed(1)} degrees — brand identity lost`);
    assert.notEqual(fixed, '#000000', 'must not collapse to black when the hue can survive');
  });

  await t.test('is deterministic', () => {
    for (const fg of SEED_COLOURS) {
      assert.equal(ensureContrast(fg, '#F7EBD7', 4.5), ensureContrast(fg, '#F7EBD7', 4.5));
    }
  });
});

test('colour: mix and alpha', async (t) => {
  await t.test('mix returns the endpoints at the extremes', () => {
    assert.equal(mix('#000000', '#ffffff', 0), '#000000');
    assert.equal(mix('#000000', '#ffffff', 1), '#ffffff');
  });

  await t.test('mix midpoint sits between the endpoints in luminance', () => {
    const midpoint = mix('#000000', '#ffffff', 0.5);
    const luminance = relativeLuminance(parseHex(midpoint)!);
    assert.ok(luminance > 0.05 && luminance < 0.95, `midpoint luminance was ${luminance}`);
  });

  await t.test('mix falls back to the first colour on invalid input', () => {
    assert.equal(mix('#123456', 'nonsense', 0.5), '#123456');
  });

  await t.test('alpha emits a clamped rgba string', () => {
    assert.equal(alpha('#D4AF37', 0.3), 'rgba(212, 175, 55, 0.3)');
    assert.equal(alpha('#000000', 2), 'rgba(0, 0, 0, 1)');
    assert.equal(alpha('#000000', -1), 'rgba(0, 0, 0, 0)');
    assert.equal(alpha('zzz', 0.5), 'zzz');
  });
});
