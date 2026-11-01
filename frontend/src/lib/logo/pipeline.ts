/**
 * The logo pipeline, end to end, on a pixel buffer. Deterministic: no randomness, no clock, no
 * platform calls, so the browser, a worker and Node produce the same bytes for the same input.
 *
 * Steps (blueprint 7.5): skip removal when already transparent; detect a flat background; remove it
 * from the border with an adaptive delta E, a 1 px feather and edge decontamination; trim plus 4
 * percent padding; classify; palette; mono variants; warnings.
 */
import { classifyAspect, cropAndPad, detectRoundBadge, extractPalette, findContentBounds, looksLikePhoto, lumaProfiles } from './analysis.ts';
import type { Rect } from './analysis.ts';
import { detectBackground } from './background.ts';
import { cutOutBackground } from './cutout.ts';
import type { CutoutResult } from './cutout.ts';
import { makeMonoVariants } from './variants.ts';
import type { LogoAnalysis, LogoPipelineOptions, LogoPipelineResult, LogoWarning, RgbaImage } from './types.ts';

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function assertValidImage(img: RgbaImage): void {
  if (!img || !Number.isInteger(img.width) || !Number.isInteger(img.height) || img.width < 1 || img.height < 1) {
    throw new RangeError('The image needs a positive integer width and height.');
  }
  if (!img.data || img.data.length < img.width * img.height * 4) {
    throw new RangeError('The pixel buffer is smaller than width x height x 4 bytes.');
  }
}

export function processLogoPixels(input: RgbaImage, options: LogoPipelineOptions = {}): LogoPipelineResult {
  assertValidImage(input);
  const paddingRatio = options.paddingRatio ?? 0.04;
  const minContentPx = options.minContentPx ?? 300;
  const keepEnclosed = options.keepEnclosed ?? true;
  const wantVariants = options.variants ?? true;
  const { width, height } = input;
  const warnings: LogoWarning[] = [];

  const det = detectBackground(input);
  let working: RgbaImage = input;
  let trimmable = false;
  let cut: CutoutResult | null = null;

  if (det.kind === 'transparent') {
    trimmable = true;
  } else if (det.kind === 'flat' || det.kind === 'gradient') {
    const flat = det.kind === 'flat';
    const tolBg = flat ? clamp(1.8 * det.noiseP95 + 0.012, 0.022, 0.055) : 0.05;
    const tolStep = flat ? 0.035 : 0.03;
    const tolCap = flat ? Math.max(0.085, tolBg + 0.03) : Math.min(0.35, det.spread + 0.05);
    cut = cutOutBackground(input, { lab: det.lab!, rgb: det.rgb! }, { tolBg, tolStep, tolCap, keepEnclosed });
    if (cut.empty || cut.mode === 'none') {
      warnings.push({
        code: cut.empty ? 'nothing-left' : 'background-not-flat',
        severity: 'warning',
        message: cut.empty
          ? 'The logo is almost the same colour as its background, so nothing could be separated. We kept your image as it is.'
          : 'We could not find the edge of this logo, so we kept your image as it is.',
      });
      cut = null;
    } else {
      working = cut.image;
      trimmable = true;
      if (cut.separation < 0.15) {
        warnings.push({
          code: 'low-contrast',
          severity: 'warning',
          message: 'The logo is very close to its background colour, so its edges may look rough. A version with a transparent background works best.',
        });
      }
    }
  } else if (det.kind === 'photo') {
    warnings.push({
      code: 'photo-background',
      severity: 'warning',
      message: 'This logo sits on a photo or a busy background, so we kept it as it is. For a clean result upload the logo with a transparent or plain background.',
    });
  } else {
    warnings.push({
      code: 'background-not-flat',
      severity: 'info',
      message: 'The background is not one flat colour, so we kept your image as it is. A logo with a transparent or plain background looks best.',
    });
  }
  if (det.kind === 'gradient' && cut === null && !warnings.some((w) => w.code === 'background-not-flat')) {
    warnings.push({ code: 'background-not-flat', severity: 'info', message: 'The background is a gradient, so we kept your image as it is.' });
  }

  let image: RgbaImage = working;
  let crop: Rect | null = null;
  let padding = 0;
  let content: Rect = { x: 0, y: 0, width, height };
  if (trimmable) {
    const bounds = findContentBounds(working);
    if (bounds === null) {
      warnings.push({ code: 'nothing-left', severity: 'warning', message: 'Nothing visible was left of this logo, so we kept your image as it is.' });
      image = input;
      cut = null;
    } else {
      crop = bounds;
      padding = Math.round(paddingRatio * Math.max(bounds.width, bounds.height));
      image = cropAndPad(working, bounds, padding);
      content = { x: padding, y: padding, width: bounds.width, height: bounds.height };
    }
  }

  let contentPixels = 0;
  for (let i = 3; i < image.width * image.height * 4; i += 4) if (image.data[i] >= 128) contentPixels++;

  const ratio = content.width / content.height;
  const { entries: palette, meanLightness } = extractPalette(image);
  const photo = looksLikePhoto(image);
  const profiles = lumaProfiles(image);
  const significant = palette.filter((p) => p.weight >= 0.06);
  const lightnessRange = significant.length === 0 ? 0 : Math.max(...significant.map((p) => p.lightness)) - Math.min(...significant.map((p) => p.lightness));
  const brand = [...palette].filter((p) => p.weight >= 0.04 && p.chroma >= 0.06).sort((a, b) => b.chroma * Math.sqrt(b.weight) - a.chroma * Math.sqrt(a.weight))[0];

  if (Math.max(content.width, content.height) < minContentPx) {
    warnings.push({
      code: 'low-resolution',
      severity: 'warning',
      message: `Your logo is only ${Math.max(content.width, content.height)} px across. It may look soft on large screens; a file of ${minContentPx} px or more looks sharper.`,
    });
  }

  let transparentSource = 0;
  if (det.kind === 'transparent') for (let i = 3; i < width * height * 4; i += 4) if (input.data[i] < 128) transparentSource++;

  const analysis: LogoAnalysis = {
    version: 1,
    source: { width, height, hadTransparency: det.kind === 'transparent' || det.transparentShare > 0 },
    background: {
      kind: det.kind,
      colorHex: det.colorHex,
      ringCoverage: Math.round(det.coverage * 1000) / 1000,
      removed: cut !== null,
      removedShare: cut !== null ? Math.round(cut.removedShare * 1000) / 1000 : Math.round((transparentSource / (width * height)) * 1000) / 1000,
    },
    crop,
    padding,
    output: { width: image.width, height: image.height },
    content,
    contentPixels,
    aspect: classifyAspect(ratio),
    ratio: Math.round(ratio * 1000) / 1000,
    isRoundBadge: trimmable ? detectRoundBadge(image, content) : false,
    structure: {
      mode: cut ? cut.mode : 'none',
      holesKept: cut ? cut.holesKept : 0,
      holesPunched: cut ? cut.holesPunched : 0,
      bayPixels: cut ? cut.bayPixels : 0,
    },
    tone: meanLightness >= 0.62 ? 'light' : 'dark',
    luminance: Math.round(meanLightness * 1000) / 1000,
    isPhoto: photo.isPhoto,
    palette,
    dominantHex: palette[0]?.hex ?? '#000000',
    brandHex: brand ? brand.hex : null,
    monoSuitable: significant.length <= 2 || lightnessRange < 0.3,
    luma: { area: profiles.area, rim: profiles.rim },
    warnings,
  };

  return { image, variants: wantVariants ? makeMonoVariants(image, cut && det.rgb ? det.rgb : null) : null, analysis };
}
