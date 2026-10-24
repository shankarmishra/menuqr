import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { randomBytes } from 'node:crypto';

const ALLOWED_FORMATS = new Set(['jpeg', 'png', 'webp', 'avif']);
const MAX_INPUT_BYTES = 15 * 1024 * 1024; // 15MB

/**
 * Optimize, resize, sanitize, and convert dish/restaurant photo to WebP
 * @param {Buffer|string} input - Raw Buffer or base64 data URI string
 * @param {string} tenantId - Restaurant tenant ID for scoped directory isolation
 * @param {'dishes'|'logos'|'covers'} category - Subfolder under uploads
 * @param {object} [opts]
 * @param {number} [opts.maxWidth=1200]
 * @param {number} [opts.quality=80]
 */
export async function optimizeAndSaveImage(input, tenantId, category = 'dishes', opts = {}) {
  if (!input) throw new Error('No image data provided.');
  if (!tenantId) throw new Error('tenantId is required for image isolation.');

  let buffer;
  if (Buffer.isBuffer(input)) {
    buffer = input;
  } else if (typeof input === 'string') {
    // Check if base64 data URI
    const match = input.match(/^data:image\/[a-zA-Z0-9+.-]+;base64,(.+)$/);
    if (match) {
      buffer = Buffer.from(match[1], 'base64');
    } else {
      buffer = Buffer.from(input, 'base64');
    }
  } else {
    throw new Error('Invalid image input format. Expected Buffer or base64 string.');
  }

  if (buffer.length === 0) {
    throw new Error('Image buffer is empty.');
  }

  if (buffer.length > MAX_INPUT_BYTES) {
    throw new Error(`Image size (${(buffer.length / (1024 * 1024)).toFixed(1)}MB) exceeds 15MB limit.`);
  }

  const maxWidth = opts.maxWidth || 1200;
  const quality = opts.quality || 80;

  // Read metadata to validate format and dimensions safely
  const image = sharp(buffer);
  const metadata = await image.metadata();

  if (!metadata.format || !ALLOWED_FORMATS.has(metadata.format.toLowerCase())) {
    throw new Error(`Unsupported or invalid image format: "${metadata.format || 'unknown'}". Allowed: JPG, PNG, WEBP, AVIF.`);
  }

  // Ensure uploads subdirectory exists
  const sanitizedCategory = ['dishes', 'logos', 'covers'].includes(category) ? category : 'dishes';
  const targetDir = path.join(process.cwd(), 'uploads', sanitizedCategory);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Generate safe non-colliding filename
  const fileHash = randomBytes(6).toString('hex');
  const filename = `${tenantId.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}_${fileHash}.webp`;
  const targetFilePath = path.join(targetDir, filename);

  // Resize, strip EXIF metadata, and encode to WebP
  const optimizedBuffer = await image
    .rotate() // Auto-orient based on EXIF before stripping
    .resize({
      width: maxWidth,
      height: maxWidth,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({
      quality,
      effort: 4,
    })
    .toBuffer();

  fs.writeFileSync(targetFilePath, optimizedBuffer);

  const outputMeta = await sharp(optimizedBuffer).metadata();
  const originalBytes = buffer.length;
  const compressedBytes = optimizedBuffer.length;
  const savedPercent = Math.max(0, Math.round(((originalBytes - compressedBytes) / originalBytes) * 100));

  return {
    url: `/uploads/${sanitizedCategory}/${filename}`,
    originalBytes,
    compressedBytes,
    savedPercent: `${savedPercent}%`,
    width: outputMeta.width,
    height: outputMeta.height,
    originalWidth: metadata.width,
    originalHeight: metadata.height,
    format: 'webp',
  };
}
