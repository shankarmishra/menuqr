// MENUQR Storage — Driver Selection
//
// One interface over local disk and S3-compatible object storage so the provider is a config
// change rather than a code change:
//
//   put(key, buffer, contentType) -> { key, url }
//   get(key)                      -> Buffer | null
//   delete(key)                   -> void
//   url(key)                      -> public URL string
//
// Keys are always `<category>/<filename>` (e.g. `dishes/tenant_1730_ab12cd.webp`), which keeps
// remote URLs structurally identical to the legacy `/uploads/<category>/<filename>` paths.
//
// STORAGE_DRIVER=local  (default) — development only; data is lost on every deploy on Render.
// STORAGE_DRIVER=s3               — durable; required in production.

import { createLocalDriver } from './localDriver.js';
import { createS3Driver } from './s3Driver.js';

const VALID_CATEGORIES = new Set(['dishes', 'logos', 'covers', 'library']);

let activeDriver = null;

function buildDriver() {
  const requested = String(process.env.STORAGE_DRIVER || 'local').toLowerCase();

  if (requested === 's3') {
    return createS3Driver({
      endpoint: process.env.S3_ENDPOINT,
      bucket: process.env.S3_BUCKET,
      region: process.env.S3_REGION || 'auto',
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      assetBaseUrl: process.env.ASSET_BASE_URL,
    });
  }

  if (requested !== 'local') {
    console.warn(`[storage] Unknown STORAGE_DRIVER "${requested}"; falling back to local disk.`);
  }

  if (process.env.NODE_ENV === 'production') {
    console.warn(
      '[storage] Running in production on the LOCAL driver. Uploaded images will be deleted on the next deploy. Set STORAGE_DRIVER=s3.'
    );
  }

  return createLocalDriver();
}

export function getStorage() {
  if (!activeDriver) activeDriver = buildDriver();
  return activeDriver;
}

/** Test seam: forces the next getStorage() call to re-read the environment. */
export function resetStorage() {
  activeDriver = null;
}

export function sanitizeCategory(category) {
  return VALID_CATEGORIES.has(category) ? category : 'dishes';
}

export function buildKey(category, filename) {
  return `${sanitizeCategory(category)}/${filename}`;
}

export function putObject(key, buffer, contentType) {
  return getStorage().put(key, buffer, contentType);
}

export function getObject(key) {
  return getStorage().get(key);
}

export function deleteObject(key) {
  return getStorage().delete(key);
}

export function objectUrl(key) {
  return getStorage().url(key);
}

export function storageInfo() {
  const driver = getStorage();
  return { driver: driver.name, remote: driver.isRemote };
}
