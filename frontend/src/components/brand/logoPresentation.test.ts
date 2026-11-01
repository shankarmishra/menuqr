import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { LogoAnalysis } from '../../lib/logo/types.ts';
import {
  calculatePlateScale,
  choosePresentation,
  fitInCircle,
  getBrandInitials,
  resolveLogoSize,
} from './logoPresentation.ts';

describe('logoPresentation: choosePresentation', () => {
  const dummyAnalysis = (overrides: Partial<LogoAnalysis> = {}): LogoAnalysis => ({
    version: 1,
    source: { width: 400, height: 400, hadTransparency: false },
    background: { kind: 'flat', colorHex: '#000000', ringCoverage: 0.95, removed: true, removedShare: 0.8 },
    crop: { x: 50, y: 50, width: 300, height: 300 },
    padding: 12,
    output: { width: 324, height: 324 },
    content: { x: 12, y: 12, width: 300, height: 300 },
    contentPixels: 45000,
    aspect: 'square',
    ratio: 1.0,
    isRoundBadge: false,
    structure: { mode: 'emblem', holesKept: 0, holesPunched: 0, bayPixels: 0 },
    tone: 'dark',
    luminance: 0.05,
    isPhoto: false,
    palette: [{ hex: '#111111', weight: 0.9, lightness: 0.05, chroma: 0.01 }],
    dominantHex: '#111111',
    brandHex: null,
    monoSuitable: true,
    luma: {
      area: [{ y: 0.01, w: 1.0 }],
      rim: [{ y: 0.01, w: 1.0 }],
    },
    warnings: [],
    ...overrides,
  });

  it('chooses plain presentation when dark logo sits on light surface with contrast >= 3:1', () => {
    const analysis = dummyAnalysis({ luminance: 0.02, tone: 'dark', luma: { area: [{ y: 0.02, w: 1.0 }], rim: [] } });
    const decision = choosePresentation(analysis, { surfaceColor: '#ffffff' });
    assert.equal(decision.mode, 'plain');
    assert.equal(decision.variant, 'full');
    assert.ok(decision.contrast >= 3.0, `Expected contrast >= 3, got ${decision.contrast}`);
  });

  it('switches to mono-light when dark logo sits on dark surface and mono is suitable', () => {
    const analysis = dummyAnalysis({
      luminance: 0.02,
      tone: 'dark',
      monoSuitable: true,
      luma: { area: [{ y: 0.02, w: 1.0 }], rim: [] },
    });
    const decision = choosePresentation(analysis, {
      surfaceColor: '#1a1a1a',
      allowedModes: ['plain', 'mono', 'plate'],
    });
    assert.equal(decision.mode, 'mono');
    assert.equal(decision.variant, 'mono-light');
    assert.ok(decision.contrast >= 3.0);
  });

  it('switches to plate when plain contrast is low and mono is not allowed', () => {
    const analysis = dummyAnalysis({
      luminance: 0.02,
      tone: 'dark',
      luma: { area: [{ y: 0.02, w: 1.0 }], rim: [] },
    });
    const decision = choosePresentation(analysis, {
      surfaceColor: '#111111',
      allowedModes: ['plain', 'plate'],
    });
    assert.equal(decision.mode, 'plate');
    assert.equal(decision.variant, 'full');
    assert.equal(decision.plateBg, '#ffffff'); // dark logo gets white plate
    assert.ok(decision.contrast >= 3.0);
  });

  it('assigns dark plate background to light logos', () => {
    const analysis = dummyAnalysis({
      luminance: 0.85,
      tone: 'light',
      luma: { area: [{ y: 0.85, w: 1.0 }], rim: [] },
    });
    const decision = choosePresentation(analysis, {
      surfaceColor: '#ffffff',
      allowedModes: ['plate'],
    });
    assert.equal(decision.mode, 'plate');
    assert.equal(decision.plateBg, '#121212');
  });
});

describe('logoPresentation: geometric plate scaling', () => {
  it('scales rectangular logo so bounding box diagonal fits within circle diameter', () => {
    const diameter = 100;
    const w = 100;
    const h = 100;
    const fitted = fitInCircle(w, h, diameter, false);
    // diagonal of square = sqrt(2) * 100 ~ 141.42
    // scale = 100 / 141.42 ~ 0.7071
    // fitted width and height ~ 71px
    assert.ok(fitted.width <= 72 && fitted.width >= 70, `Width should be ~71, got ${fitted.width}`);
    assert.ok(fitted.height <= 72 && fitted.height >= 70, `Height should be ~71, got ${fitted.height}`);

    const diagonal = Math.hypot(fitted.width, fitted.height);
    assert.ok(diagonal <= diameter + 1, `Fitted diagonal ${diagonal} should be <= diameter ${diameter}`);
  });

  it('inscribes wide aspect logo inside circle without clipping', () => {
    const diameter = 120;
    const w = 300;
    const h = 100;
    const fitted = fitInCircle(w, h, diameter, false);
    const diagonal = Math.hypot(fitted.width, fitted.height);
    assert.ok(diagonal <= diameter + 1, `Diagonal ${diagonal} must not exceed circle diameter ${diameter}`);
    assert.ok(fitted.width <= diameter);
    assert.ok(fitted.height <= diameter);
  });

  it('allows round badges to scale edge-to-edge (isRoundBadge = true)', () => {
    const diameter = 100;
    const w = 100;
    const h = 100;
    const fitted = fitInCircle(w, h, diameter, true);
    assert.equal(fitted.width, 100);
    assert.equal(fitted.height, 100);
    assert.equal(fitted.scale, 1.0);
  });

  it('calculatePlateScale matches theoretical scale factor', () => {
    const scaleRect = calculatePlateScale(80, 60, false);
    // sqrt(80^2 + 60^2) = 100
    assert.equal(scaleRect, 1 / 100);

    const scaleBadge = calculatePlateScale(80, 60, true);
    assert.equal(scaleBadge, 1 / 80);
  });
});

describe('logoPresentation: getBrandInitials fallback lockup', () => {
  it('extracts two uppercase letters from multi-word names', () => {
    assert.equal(getBrandInitials('Midnight Masala'), 'MM');
    assert.equal(getBrandInitials('Shankar Da Dhaba'), 'SD');
    assert.equal(getBrandInitials('Rang E Punjab'), 'RE');
  });

  it('extracts first two letters from single-word names', () => {
    assert.equal(getBrandInitials('Mannat'), 'MA');
    assert.equal(getBrandInitials('Bazaar'), 'BA');
  });

  it('cleans punctuation and special characters gracefully', () => {
    assert.equal(getBrandInitials("@Shobha_Ram's"), 'SR');
    assert.equal(getBrandInitials('Café & Lounge'), 'CL');
  });

  it('handles empty or blank names safely without throwing', () => {
    assert.equal(getBrandInitials(''), '');
    assert.equal(getBrandInitials('   '), '');
  });
});

describe('LogoMark: resolveLogoSize tokens and props', () => {
  it('maps standard size tokens to exact pixel dimensions', () => {
    assert.equal(resolveLogoSize('xs'), 32);
    assert.equal(resolveLogoSize('sm'), 40);
    assert.equal(resolveLogoSize('md'), 56);
    assert.equal(resolveLogoSize('lg'), 72);
    assert.equal(resolveLogoSize('xl'), 96);
  });

  it('preserves numeric sizes directly', () => {
    assert.equal(resolveLogoSize(64), 64);
    assert.equal(resolveLogoSize(120), 120);
  });

  it('defaults to 72 when size is omitted or unknown', () => {
    assert.equal(resolveLogoSize(undefined), 72);
    assert.equal(resolveLogoSize('invalid' as any), 72);
  });
});
