import sharp from 'sharp';
import { randomBytes } from 'node:crypto';
import { buildKey, putObject, sanitizeCategory } from './storage/index.js';

const ALLOWED_FORMATS = new Set(['jpeg', 'png', 'webp', 'avif']);
const MAX_INPUT_BYTES = 15 * 1024 * 1024; // 15MB

/**
 * Responsive widths generated for every upload, matching
 * `frontend/src/components/menu-renderer/primitives/SmartImage.tsx` (`IMAGE_WIDTHS`). Keep the
 * two in step: `SmartImage` builds `srcSet` candidates purely from this naming convention, with
 * no server round trip to discover what exists.
 */
export const RESPONSIVE_WIDTHS = [160, 640, 1440];

function parseInput(input) {
  if (Buffer.isBuffer(input)) return input;
  if (typeof input === 'string') {
    const match = input.match(/^data:image\/[a-zA-Z0-9+.-]+;base64,(.+)$/);
    return Buffer.from(match ? match[1] : input, 'base64');
  }
  throw new Error('Invalid image input format. Expected Buffer or base64 string.');
}

/**
 * Optimize, resize, sanitize, and convert dish/restaurant photo to WebP, then persist it
 * through the active storage driver (local disk in dev, S3-compatible object storage in
 * production — see backend/storage/index.js).
 *
 * Alongside the primary WebP (returned as `url`, unchanged from the original single-size
 * behaviour so every existing stored URL keeps resolving), this also writes AVIF and WebP
 * variants at `RESPONSIVE_WIDTHS`, named `<stem>-<width>.<ext>`. `SmartImage` on the frontend
 * requests those variants directly; if a caller never upgrades to it, the plain `url` still
 * works exactly as before.
 *
 * @param {Buffer|string} input - Raw Buffer or base64 data URI string
 * @param {string} tenantId - Restaurant tenant ID for scoped key isolation
 * @param {'dishes'|'logos'|'covers'} category - Key prefix
 * @param {object} [opts]
 * @param {number} [opts.maxWidth=1200]
 * @param {number} [opts.quality=80]
 */
export async function optimizeAndSaveImage(input, tenantId, category = 'dishes', opts = {}) {
  if (!input) throw new Error('No image data provided.');
  if (!tenantId) throw new Error('tenantId is required for image isolation.');

  const buffer = parseInput(input);

  if (buffer.length === 0) {
    throw new Error('Image buffer is empty.');
  }

  if (buffer.length > MAX_INPUT_BYTES) {
    throw new Error(`Image size (${(buffer.length / (1024 * 1024)).toFixed(1)}MB) exceeds 15MB limit.`);
  }

  const maxWidth = opts.maxWidth || 1200;
  const quality = opts.quality || 80;

  // Read metadata to validate format and dimensions safely.
  const metadata = await sharp(buffer).metadata();

  if (!metadata.format || !ALLOWED_FORMATS.has(metadata.format.toLowerCase())) {
    throw new Error(`Unsupported or invalid image format: "${metadata.format || 'unknown'}". Allowed: JPG, PNG, WEBP, AVIF.`);
  }

  const sanitizedCategory = sanitizeCategory(category);

  // Generate a safe, non-colliding filename stem shared by the primary file and every variant,
  // so `<stem>-<width>.<ext>` is derivable from the primary URL alone.
  const fileHash = randomBytes(6).toString('hex');
  const stem = `${tenantId.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}_${fileHash}`;

  // Auto-orient from EXIF before stripping it, on a fresh sharp instance per output — sharp
  // pipelines are single-use once `.toBuffer()` resolves.
  const primaryBuffer = await sharp(buffer)
    .rotate()
    .resize({ width: maxWidth, height: maxWidth, fit: 'inside', withoutEnlargement: true })
    .webp({ quality, effort: 4 })
    .toBuffer();

  const { url } = await putObject(buildKey(sanitizedCategory, `${stem}.webp`), primaryBuffer, 'image/webp');

  // Responsive variants: width-only resize (no height cap), so a tall portrait photo is not
  // squared off the way the legacy primary file is.
  const variantResults = await Promise.all(
    RESPONSIVE_WIDTHS.flatMap((width) => [
      sharp(buffer)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality, effort: 4 })
        .toBuffer()
        .then((data) => putObject(buildKey(sanitizedCategory, `${stem}-${width}.webp`), data, 'image/webp')),
      sharp(buffer)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .avif({ quality: Math.max(35, quality - 15), effort: 4 })
        .toBuffer()
        .then((data) => putObject(buildKey(sanitizedCategory, `${stem}-${width}.avif`), data, 'image/avif')),
    ])
  );

  const outputMeta = await sharp(primaryBuffer).metadata();
  const originalBytes = buffer.length;
  const compressedBytes = primaryBuffer.length;
  const savedPercent = Math.max(0, Math.round(((originalBytes - compressedBytes) / originalBytes) * 100));

  return {
    url,
    originalBytes,
    compressedBytes,
    savedPercent: `${savedPercent}%`,
    width: outputMeta.width,
    height: outputMeta.height,
    originalWidth: metadata.width,
    originalHeight: metadata.height,
    format: 'webp',
    responsiveWidths: RESPONSIVE_WIDTHS,
    variantCount: variantResults.length,
  };
}
