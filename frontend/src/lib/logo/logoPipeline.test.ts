import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import { classifyAspect, detectRoundBadge } from './analysis.ts';
import { detectBackground } from './background.ts';
import { processLogoFile } from './browserAdapter.ts';
import {
  contrastBetween,
  contrastRatio,
  deltaE,
  oklabRToSrgb8,
  parseCssColor,
  relativeLuminance,
  srgb8ToOklabR,
} from './color.ts';
import { cutOutBackground } from './cutout.ts';
import { assertValidImage, processLogoPixels } from './pipeline.ts';
import {
  alreadyTransparent,
  decodeToRgba,
  emblemWithBay,
  lightOnBlack,
  maskIou,
  onColouredFlat,
  onGradient,
  onPhotoNoise,
  realLogoDir,
  resultMaskInSourceFrame,
  roundBadge,
  solidOnWhite,
  tinyIcon,
  wordmarkWithCounters,
} from './testing/fixtures.ts';

describe('logoPipeline: background detection', () => {
  it('detects flat white background with high ring coverage', async () => {
    const fixture = await solidOnWhite();
    const det = detectBackground(fixture.image);
    assert.equal(det.kind, 'flat');
    assert.equal(det.colorHex, '#ffffff');
    assert.ok(det.coverage >= 0.85, `Coverage ${det.coverage} should be >= 0.85`);
  });

  it('detects flat black background on dark logo fixture', async () => {
    const fixture = await lightOnBlack();
    const det = detectBackground(fixture.image);
    assert.equal(det.kind, 'flat');
    assert.equal(det.colorHex, '#000000');
    assert.ok(det.coverage >= 0.85);
  });

  it('detects flat coloured background (teal)', async () => {
    const fixture = await onColouredFlat();
    const det = detectBackground(fixture.image);
    assert.equal(det.kind, 'flat');
    assert.ok(det.coverage >= 0.85);
  });

  it('detects already-transparent images', async () => {
    const fixture = await alreadyTransparent();
    const det = detectBackground(fixture.image);
    assert.equal(det.kind, 'transparent');
  });

  it('detects gradient background without misclassifying as flat', async () => {
    const fixture = await onGradient(true);
    const det = detectBackground(fixture.image);
    assert.notEqual(det.kind, 'flat');
  });

  it('detects photo/noisy background and refuses to classify as flat', async () => {
    const fixture = await onPhotoNoise();
    const det = detectBackground(fixture.image);
    assert.ok(det.kind === 'photo' || det.kind === 'complex');
    assert.ok(det.roughness >= 0.01, `Roughness should be high on noise, got ${det.roughness}`);
  });
});

describe('logoPipeline: cutout and flood fill', () => {
  it('removes flat white background with high IoU against truth mask', async () => {
    const fixture = await solidOnWhite();
    const res = processLogoPixels(fixture.image);
    assert.equal(res.analysis.background.removed, true);
    assert.ok(res.analysis.background.removedShare > 0.4);

    const mask = resultMaskInSourceFrame(res, fixture.image.width, fixture.image.height);
    const iou = maskIou(mask, fixture.truth!);
    assert.ok(iou >= 0.95, `IoU ${iou} should be >= 0.95 against synthetic ground truth`);
  });

  it('removes flat black background from light shapes with high IoU', async () => {
    const fixture = await lightOnBlack();
    const res = processLogoPixels(fixture.image);
    assert.equal(res.analysis.background.removed, true);

    const mask = resultMaskInSourceFrame(res, fixture.image.width, fixture.image.height);
    const iou = maskIou(mask, fixture.truth!);
    assert.ok(iou >= 0.95, `IoU ${iou} should be >= 0.95`);
  });

  it('protects open white apron bays in emblem mode', async () => {
    const fixture = await emblemWithBay();
    const det = detectBackground(fixture.image);
    const cut = cutOutBackground(fixture.image, { lab: det.lab!, rgb: det.rgb! }, {
      tolBg: 0.03,
      tolStep: 0.035,
      tolCap: 0.08,
      keepEnclosed: true,
    });
    assert.equal(cut.mode, 'emblem');
    assert.ok(cut.bayPixels > 0, `Expected bayPixels > 0 to protect open apron, got ${cut.bayPixels}`);
  });

  it('punches small letter counters in wordmark mode', async () => {
    const fixture = await wordmarkWithCounters();
    const det = detectBackground(fixture.image);
    const cut = cutOutBackground(fixture.image, { lab: det.lab!, rgb: det.rgb! }, {
      tolBg: 0.03,
      tolStep: 0.035,
      tolCap: 0.08,
      keepEnclosed: true,
    });
    assert.equal(cut.mode, 'wordmark');
    assert.ok(cut.holesPunched > 0, `Expected holesPunched > 0 for wordmark counters, got ${cut.holesPunched}`);
  });
});

describe('logoPipeline: edge feathering and decontaminating', () => {
  it('unmixes edge pixels from the background color without hard aliased steps', async () => {
    const fixture = await solidOnWhite();
    const res = processLogoPixels(fixture.image);

    // Scan edge pixels (alpha between 32 and 224)
    let fringePixels = 0;
    const { data } = res.image;
    for (let i = 3; i < data.length; i += 4) {
      const a = data[i];
      if (a >= 32 && a <= 224) {
        fringePixels++;
      }
    }
    assert.ok(fringePixels > 0, `Expected anti-aliased feathered edge pixels, found ${fringePixels}`);
  });
});

describe('logoPipeline: aspect and badge classification', () => {
  it('classifies aspect ratios accurately', () => {
    assert.equal(classifyAspect(2.5), 'wide');
    assert.equal(classifyAspect(2.2), 'wide');
    assert.equal(classifyAspect(1.6), 'landscape');
    assert.equal(classifyAspect(1.33), 'landscape');
    assert.equal(classifyAspect(1.0), 'square');
    assert.equal(classifyAspect(0.8), 'square');
    assert.equal(classifyAspect(0.6), 'tall');
  });

  it('identifies circular badge emblem as isRoundBadge = true', async () => {
    const fixture = await roundBadge();
    const res = processLogoPixels(fixture.image);
    assert.equal(res.analysis.isRoundBadge, true);
  });

  it('identifies non-circular shapes as isRoundBadge = false', async () => {
    const fixture = await solidOnWhite();
    const res = processLogoPixels(fixture.image);
    assert.equal(res.analysis.isRoundBadge, false);

    // direct detectRoundBadge call with tiny content box
    assert.equal(detectRoundBadge(fixture.image, { x: 0, y: 0, width: 10, height: 10 }), false);
  });
});

describe('logoPipeline: colour maths and WCAG contrast', () => {
  it('round-trips sRGB -> OKLab -> sRGB within 1 8-bit step', () => {
    const samples: [number, number, number][] = [
      [255, 255, 255],
      [0, 0, 0],
      [214, 45, 32],
      [27, 79, 156],
      [245, 192, 0],
    ];
    for (const [r, g, b] of samples) {
      const [l, a, oklabB] = srgb8ToOklabR(r, g, b);
      const [r2, g2, b2] = oklabRToSrgb8(l, a, oklabB);
      assert.ok(Math.abs(r - r2) <= 1);
      assert.ok(Math.abs(g - g2) <= 1);
      assert.ok(Math.abs(b - b2) <= 1);
    }

    const [lWhite, aWhite, bWhite] = srgb8ToOklabR(255, 255, 255);
    const [lBlack, aBlack, bBlack] = srgb8ToOklabR(0, 0, 0);
    const whiteBlackDelta = deltaE([lWhite, aWhite, bWhite], [lBlack, aBlack, bBlack]);
    assert.ok(whiteBlackDelta > 0.9, `deltaE between white and black should be ~1, got ${whiteBlackDelta}`);
  });

  it('calculates WCAG relative luminance and contrast ratio', () => {
    const lumaWhite = relativeLuminance(255, 255, 255);
    const lumaBlack = relativeLuminance(0, 0, 0);
    assert.equal(Math.round(lumaWhite * 100) / 100, 1.0);
    assert.equal(lumaBlack, 0.0);

    const cr = contrastRatio(lumaWhite, lumaBlack);
    assert.equal(Math.round(cr), 21);

    const crSame = contrastRatio(lumaWhite, lumaWhite);
    assert.equal(crSame, 1);

    const cBetween = contrastBetween({ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 });
    assert.equal(Math.round(cBetween), 21);
  });

  it('parses diverse CSS colour formats without throwing', () => {
    const c1 = parseCssColor('#fff');
    assert.deepEqual(c1, { r: 255, g: 255, b: 255, a: 1 });

    const c2 = parseCssColor('#112233');
    assert.deepEqual(c2, { r: 17, g: 34, b: 51, a: 1 });

    const c3 = parseCssColor('rgb(100, 150, 200)');
    assert.deepEqual(c3, { r: 100, g: 150, b: 200, a: 1 });

    const c4 = parseCssColor('transparent');
    assert.equal(c4?.a, 0);

    assert.equal(parseCssColor('invalid'), null);
    assert.equal(parseCssColor(null), null);
  });
});

describe('logoPipeline: full pipeline execution and warnings', () => {
  it('throws RangeError for invalid image buffers', () => {
    assert.throws(() => assertValidImage({ width: 0, height: 10, data: new Uint8Array() }), RangeError);
    assert.throws(() => assertValidImage({ width: 10, height: 10, data: new Uint8Array(10) }), RangeError);
  });

  it('generates low-resolution warning for tiny logo inputs', async () => {
    const fixture = await tinyIcon();
    const res = processLogoPixels(fixture.image, { minContentPx: 300 });
    const hasLowRes = res.analysis.warnings.some((w) => w.code === 'low-resolution');
    assert.ok(hasLowRes, 'Expected low-resolution warning for 24px icon');
  });

  it('refuses to cut out photo background and issues warning', async () => {
    const fixture = await onPhotoNoise();
    const res = processLogoPixels(fixture.image);
    assert.equal(res.analysis.background.removed, false);
    const hasPhotoWarn = res.analysis.warnings.some((w) => w.code === 'photo-background' || w.code === 'background-not-flat');
    assert.ok(hasPhotoWarn, 'Expected photo warning for noisy background');
  });

  it('builds mono-light and mono-dark variants', async () => {
    const fixture = await solidOnWhite();
    const res = processLogoPixels(fixture.image, { variants: true });
    assert.ok(res.variants !== null);
    assert.equal(res.variants.monoLight.width, res.image.width);
    assert.equal(res.variants.monoDark.width, res.image.width);

    // monoLight should have white RGB channels
    const ml = res.variants.monoLight.data;
    for (let i = 0; i < 400; i += 4) {
      if (ml[i + 3] > 128) {
        assert.equal(ml[i], 255);
        assert.equal(ml[i + 1], 255);
        assert.equal(ml[i + 2], 255);
        break;
      }
    }
  });

  it('browserAdapter processLogoFile never throws in non-DOM environments', async () => {
    const dummyBlob = new Blob([new Uint8Array(10)], { type: 'image/png' });
    const res = await processLogoFile(dummyBlob);
    // In Node (no createImageBitmap / canvas), it returns an error result instead of throwing
    assert.equal(res.ok, false);
    assert.ok(typeof res.error === 'string');
  });
});

describe('logoPipeline: 3 real client logos from reference-assets', () => {
  const dir = realLogoDir();

  it('real client logos directory exists', () => {
    assert.ok(dir !== null, 'Real logo reference assets directory should exist');
    assert.ok(fs.existsSync(dir), `Directory ${dir} must exist`);
  });

  it('processes real logo 1: midnight-masala gold badge on black', async () => {
    if (!dir) return;
    const filePath = path.join(dir, 'midnight-masala_gold-badge-on-black.jpeg');
    assert.ok(fs.existsSync(filePath), `File ${filePath} must exist`);

    const img = await decodeToRgba(filePath);
    const res = processLogoPixels(img);

    // 1. Black background removed
    assert.equal(res.analysis.background.kind, 'flat');
    assert.equal(res.analysis.background.colorHex, '#000000');
    assert.equal(res.analysis.background.removed, true);

    // 2. Classifications
    assert.equal(res.analysis.aspect, 'square');
    assert.equal(res.analysis.isRoundBadge, true);

    // 3. Clean trim with 4% padding
    assert.ok(res.analysis.crop !== null);
    assert.ok(res.analysis.output.width > 1000);
    assert.ok(res.analysis.output.height > 1000);

    // 4. No warnings
    assert.equal(res.analysis.warnings.length, 0);
  });

  it('processes real logo 2: midnight-masala wordmark on black', async () => {
    if (!dir) return;
    const filePath = path.join(dir, 'midnight-masala_wordmark-on-black.jpeg');
    assert.ok(fs.existsSync(filePath), `File ${filePath} must exist`);

    const img = await decodeToRgba(filePath);
    const res = processLogoPixels(img);

    // 1. Black background removed
    assert.equal(res.analysis.background.kind, 'flat');
    assert.equal(res.analysis.background.colorHex, '#000000');
    assert.equal(res.analysis.background.removed, true);

    // 2. Classifications: 3:1 wordmark classified as wide, not a round badge
    assert.equal(res.analysis.aspect, 'wide');
    assert.equal(res.analysis.isRoundBadge, false);

    // 3. Content trimmed from black square (cropped tightly around wordmark)
    assert.ok(res.analysis.crop !== null);
    assert.ok(res.analysis.crop.height < res.analysis.source.height * 0.5);

    // 4. No warnings
    assert.equal(res.analysis.warnings.length, 0);
  });

  it('processes real logo 3: shankar-dhaba stock chef menu logo on white', async () => {
    if (!dir) return;
    const filePath = path.join(dir, 'shankar-dhaba_stock-chef-menu-logo.jpg');
    assert.ok(fs.existsSync(filePath), `File ${filePath} must exist`);

    const img = await decodeToRgba(filePath);
    const res = processLogoPixels(img);

    // 1. White background removed
    assert.equal(res.analysis.background.kind, 'flat');
    assert.equal(res.analysis.background.colorHex, '#ffffff');
    assert.equal(res.analysis.background.removed, true);

    // 2. Emblem mode: white apron bay pixels protected
    assert.equal(res.analysis.structure.mode, 'emblem');
    assert.ok(res.analysis.structure.bayPixels > 1000, `Expected white apron bay pixels > 1000, got ${res.analysis.structure.bayPixels}`);

    // 3. Chef palette contains white (#fefefc or close) as a preserved colour
    const hasWhiteInPalette = res.analysis.palette.some((p) => p.lightness > 0.95);
    assert.ok(hasWhiteInPalette, 'Palette must preserve the white apron/hat interior color');

    // 4. Aspect ratio is square/portrait, not round badge
    assert.equal(res.analysis.isRoundBadge, false);
    assert.equal(res.analysis.aspect, 'square');

    // 5. No warnings
    assert.equal(res.analysis.warnings.length, 0);
  });
});
