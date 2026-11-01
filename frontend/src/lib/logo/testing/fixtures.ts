/**
 * Test and tooling helpers for the logo pipeline: decode files with sharp, and generate synthetic
 * logos with known ground truth so CI can run without the owner's real files.
 *
 * Nothing here is imported by app code, so sharp never reaches the browser bundle.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import type { RgbaImage } from '../types.ts';

export async function decodeToRgba(input: Buffer | string): Promise<RgbaImage> {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { width: info.width, height: info.height, data: new Uint8ClampedArray(data.buffer, data.byteOffset, data.length) };
}

export async function encodePng(img: RgbaImage): Promise<Buffer> {
  return sharp(Buffer.from(img.data.buffer, img.data.byteOffset, img.width * img.height * 4), {
    raw: { width: img.width, height: img.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

export function svgDoc(width: number, height: number, body: string, background?: string): string {
  const bg = background ? `<rect width="${width}" height="${height}" fill="${background}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${bg}${body}</svg>`;
}

export async function rasterize(svg: string, jpegQuality?: number): Promise<RgbaImage> {
  const source = Buffer.from(svg);
  if (jpegQuality === undefined) return decodeToRgba(source);
  const jpeg = await sharp(source).jpeg({ quality: jpegQuality, chromaSubsampling: '4:2:0' }).toBuffer();
  return decodeToRgba(jpeg);
}

/** Per-pixel "is part of the logo" truth (alpha >= 128 of the shapes alone on a transparent canvas). */
export async function truthMask(width: number, height: number, body: string): Promise<Uint8Array> {
  const img = await rasterize(svgDoc(width, height, body));
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < mask.length; i++) mask[i] = img.data[i * 4 + 3] >= 128 ? 1 : 0;
  return mask;
}

/** Four solid shapes, no holes: a circle, a rounded rectangle, a bar and a triangle. Content box 100..540 x 160..468. */
export const SOLID_SHAPES = `
  <circle cx="200" cy="260" r="100" fill="#d62d20"/>
  <rect x="330" y="170" width="170" height="130" rx="22" fill="#1b4f9c"/>
  <rect x="150" y="440" width="300" height="28" fill="#111111"/>
  <polygon points="470,420 540,420 505,360" fill="#e0a800"/>`;

/** The same layout in light colours, for dark backgrounds. */
export const LIGHT_SHAPES = `
  <circle cx="200" cy="260" r="100" fill="#f5c000"/>
  <rect x="330" y="170" width="170" height="130" rx="22" fill="#f6ecd9"/>
  <rect x="150" y="440" width="300" height="28" fill="#f6ecd9"/>
  <polygon points="470,420 540,420 505,360" fill="#ff8a1f"/>`;

/** Letter-like rings with small enclosed counters ("o" and "e" style): the counters must become transparent. */
export const WORDMARK_SHAPES = `
  <circle cx="70" cy="300" r="15" fill="none" stroke="#161616" stroke-width="10"/>
  <circle cx="116" cy="300" r="15" fill="none" stroke="#161616" stroke-width="10"/>
  <circle cx="162" cy="300" r="15" fill="none" stroke="#161616" stroke-width="10"/>
  <circle cx="208" cy="300" r="15" fill="none" stroke="#161616" stroke-width="10"/>
  <circle cx="254" cy="300" r="15" fill="none" stroke="#161616" stroke-width="10"/>
  <circle cx="300" cy="300" r="15" fill="none" stroke="#161616" stroke-width="10"/>
  <circle cx="346" cy="300" r="15" fill="none" stroke="#161616" stroke-width="10"/>
  <circle cx="392" cy="300" r="15" fill="none" stroke="#161616" stroke-width="10"/>
  <circle cx="438" cy="300" r="15" fill="none" stroke="#161616" stroke-width="10"/>
  <circle cx="484" cy="300" r="15" fill="none" stroke="#161616" stroke-width="10"/>
  <circle cx="530" cy="300" r="15" fill="none" stroke="#161616" stroke-width="10"/>
  <circle cx="576" cy="300" r="15" fill="none" stroke="#161616" stroke-width="10"/>
  <rect x="30" y="270" width="8" height="60" fill="#161616"/>`;

/** A round badge: gold ring, black interior that must stay, gold shapes inside. */
export const BADGE_SHAPES = `
  <circle cx="300" cy="300" r="240" fill="#000000" stroke="#f5c000" stroke-width="18"/>
  <rect x="190" y="270" width="220" height="40" fill="#f5c000"/>
  <circle cx="300" cy="200" r="44" fill="#fff3c4"/>
  <rect x="250" y="350" width="100" height="26" fill="#f5c000"/>`;

/**
 * An emblem like the stock chef: a disc and two arms enclose a white apron that is open to the page
 * at the bottom. The white bay must stay; the gap to the bar underneath must go.
 */
export const EMBLEM_SHAPES = `
  <circle cx="300" cy="270" r="200" fill="#ffa400"/>
  <rect x="170" y="300" width="70" height="140" fill="#d62d20"/>
  <rect x="360" y="300" width="70" height="140" fill="#d62d20"/>
  <rect x="240" y="290" width="120" height="240" fill="#ffffff"/>
  <rect x="150" y="520" width="300" height="46" rx="18" fill="#2a1a10"/>`;

export interface Fixture {
  name: string;
  image: RgbaImage;
  /** Truth mask in the source frame, when the shapes have no ambiguous holes. */
  truth?: Uint8Array;
  /** Background colour of the source. */
  background: string;
}

const SIZE = 600;

export async function solidOnWhite(jpeg?: number): Promise<Fixture> {
  return {
    name: jpeg ? 'shapes on white (jpeg)' : 'shapes on white',
    image: await rasterize(svgDoc(SIZE, SIZE, SOLID_SHAPES, '#ffffff'), jpeg),
    truth: await truthMask(SIZE, SIZE, SOLID_SHAPES),
    background: '#ffffff',
  };
}

export async function lightOnBlack(jpeg?: number): Promise<Fixture> {
  return {
    name: jpeg ? 'shapes on black (jpeg)' : 'shapes on black',
    image: await rasterize(svgDoc(SIZE, SIZE, LIGHT_SHAPES, '#000000'), jpeg),
    truth: await truthMask(SIZE, SIZE, LIGHT_SHAPES),
    background: '#000000',
  };
}

export async function onColouredFlat(): Promise<Fixture> {
  return {
    name: 'cream shapes on teal',
    image: await rasterize(svgDoc(SIZE, SIZE, LIGHT_SHAPES, '#1f6f5c'), 90),
    truth: await truthMask(SIZE, SIZE, LIGHT_SHAPES),
    background: '#1f6f5c',
  };
}

export async function onGradient(strong: boolean): Promise<Fixture> {
  const [from, to] = strong ? ['#6a11cb', '#2575fc'] : ['#ffffff', '#ececec'];
  const defs = `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>`;
  const svg = svgDoc(SIZE, SIZE, `${defs}<rect width="${SIZE}" height="${SIZE}" fill="url(#bg)"/>${SOLID_SHAPES}`);
  return {
    name: strong ? 'shapes on a strong gradient' : 'shapes on a gentle gradient',
    image: await rasterize(svg),
    truth: await truthMask(SIZE, SIZE, SOLID_SHAPES),
    background: from,
  };
}

export async function alreadyTransparent(): Promise<Fixture> {
  const shadow = `<defs><filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter></defs>
    <g filter="url(#s)" opacity="0.35" transform="translate(6 8)">${SOLID_SHAPES.replace(/fill="#[0-9a-f]{6}"/g, 'fill="#000000"')}</g>`;
  return {
    name: 'transparent png with a soft shadow',
    image: await rasterize(svgDoc(SIZE, SIZE, shadow + SOLID_SHAPES)),
    truth: await truthMask(SIZE, SIZE, SOLID_SHAPES),
    background: 'transparent',
  };
}

export async function tinyIcon(): Promise<Fixture> {
  const body = '<rect x="6" y="6" width="12" height="12" fill="#d62d20"/>';
  return { name: 'tiny 24px icon', image: await rasterize(svgDoc(24, 24, body, '#ffffff')), truth: await truthMask(24, 24, body), background: '#ffffff' };
}

export async function hugeOnWhite(): Promise<Fixture> {
  const scale = 4;
  const body = `<g transform="scale(${scale})">${SOLID_SHAPES}</g>`;
  const w = 3000;
  const h = 2400;
  const svg = svgDoc(w, h, body, '#ffffff');
  return { name: 'huge 3000x2400 on white', image: await rasterize(svg), truth: await truthMask(w, h, body), background: '#ffffff' };
}

/** A noisy, photo-like background (blurred Gaussian noise) behind flat shapes. */
export async function onPhotoNoise(): Promise<Fixture> {
  const noise = await sharp({
    create: { width: SIZE, height: SIZE, channels: 3, background: '#808080', noise: { type: 'gaussian', mean: 128, sigma: 46 } },
  })
    .blur(1.4)
    .png()
    .toBuffer();
  const shapes = await sharp(Buffer.from(svgDoc(SIZE, SIZE, SOLID_SHAPES))).png().toBuffer();
  const image = await decodeToRgba(await sharp(noise).composite([{ input: shapes }]).png().toBuffer());
  return { name: 'shapes on a noisy photo-like background', image, background: '#808080' };
}

export async function roundBadge(): Promise<Fixture> {
  return { name: 'round badge on black', image: await rasterize(svgDoc(SIZE, SIZE, BADGE_SHAPES, '#000000'), 92), background: '#000000' };
}

export async function emblemWithBay(): Promise<Fixture> {
  return { name: 'emblem with an open white apron', image: await rasterize(svgDoc(SIZE, SIZE, EMBLEM_SHAPES, '#ffffff')), background: '#ffffff' };
}

export async function wordmarkWithCounters(): Promise<Fixture> {
  return { name: 'wordmark with small counters', image: await rasterize(svgDoc(SIZE, SIZE, WORDMARK_SHAPES, '#ffffff')), background: '#ffffff' };
}

/** Places the processed (cropped, padded) result back into the source frame as a visible-pixel mask. */
export function resultMaskInSourceFrame(
  result: { image: RgbaImage; analysis: { crop: { x: number; y: number } | null; padding: number } },
  sourceWidth: number,
  sourceHeight: number,
  alphaMin = 128
): Uint8Array {
  const mask = new Uint8Array(sourceWidth * sourceHeight);
  const { image, analysis } = result;
  const ox = (analysis.crop?.x ?? 0) - analysis.padding;
  const oy = (analysis.crop?.y ?? 0) - analysis.padding;
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const sx = x + ox;
      const sy = y + oy;
      if (sx < 0 || sy < 0 || sx >= sourceWidth || sy >= sourceHeight) continue;
      if (image.data[(y * image.width + x) * 4 + 3] >= alphaMin) mask[sy * sourceWidth + sx] = 1;
    }
  }
  return mask;
}

export function maskIou(a: Uint8Array, b: Uint8Array): number {
  let inter = 0;
  let union = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] && b[i]) inter++;
    if (a[i] || b[i]) union++;
  }
  return union === 0 ? 1 : inter / union;
}

/** Folder with the owner's three real logos; null when absent, so tests can skip. */
export function realLogoDir(): string | null {
  const candidates = [
    process.env.MENUQR_LOGO_FIXTURES,
    'C:/Users/xshan/Desktop/menuqr/docs/reference-assets/client-logos',
    path.resolve(import.meta.dirname, '../../../../../docs/reference-assets/client-logos'),
  ].filter((c): c is string => Boolean(c));
  return candidates.find((c) => fs.existsSync(c)) ?? null;
}
