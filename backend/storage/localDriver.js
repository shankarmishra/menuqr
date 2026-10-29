// MENUQR Storage — Local Filesystem Driver
// Development / single-host fallback. NOT durable on ephemeral hosts (Render, Fly, Heroku):
// the uploads directory is wiped on every deploy. Use the s3 driver in production.

import fs from 'node:fs';
import path from 'node:path';

const UPLOAD_ROOT = () => path.join(process.cwd(), 'uploads');

/**
 * Resolve a storage key to an absolute path, rejecting anything that escapes the uploads root.
 * path.resolve collapses "..", and the separator-aware prefix check prevents a sibling
 * directory such as "uploads-evil" from passing a bare startsWith test.
 */
function resolveSafe(key) {
  const root = UPLOAD_ROOT();
  const full = path.resolve(root, String(key));
  if (full !== root && !full.startsWith(root + path.sep)) {
    throw new Error('Rejected storage key outside the uploads root.');
  }
  return full;
}

export function createLocalDriver() {
  return {
    name: 'local',
    isRemote: false,

    async put(key, buffer, _contentType) {
      const full = resolveSafe(key);
      fs.mkdirSync(path.dirname(full), { recursive: true });
      fs.writeFileSync(full, buffer);
      return { key, url: `/uploads/${key}` };
    },

    async get(key) {
      const full = resolveSafe(key);
      if (!fs.existsSync(full) || !fs.statSync(full).isFile()) return null;
      return fs.readFileSync(full);
    },

    async delete(key) {
      const full = resolveSafe(key);
      if (fs.existsSync(full)) fs.unlinkSync(full);
    },

    url(key) {
      return `/uploads/${key}`;
    },
  };
}
