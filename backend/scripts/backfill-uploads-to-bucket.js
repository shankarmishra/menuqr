#!/usr/bin/env node
// MENUQR — One-time backfill of legacy local uploads into object storage.
//
// Copies every file under backend/uploads/{dishes,logos,covers} to the configured S3-compatible
// bucket using the same object key, so URLs already stored in the database keep resolving after
// STORAGE_DRIVER is switched to s3.
//
// Only backend/uploads is migrated. frontend/public/uploads ships inside the static frontend
// build, which is already durable, so it is deliberately left alone.
//
//   node backend/scripts/backfill-uploads-to-bucket.js --dry-run
//   node backend/scripts/backfill-uploads-to-bucket.js
//
// Safe to re-run: existing objects are overwritten with identical bytes.

import '../env.js';
import fs from 'node:fs';
import path from 'node:path';
import { createS3Driver } from '../storage/s3Driver.js';

const CATEGORIES = ['dishes', 'logos', 'covers'];

const CONTENT_TYPES = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
};

const dryRun = process.argv.includes('--dry-run');

function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);
}

async function main() {
  const driver = createS3Driver({
    endpoint: process.env.S3_ENDPOINT,
    bucket: process.env.S3_BUCKET,
    region: process.env.S3_REGION || 'auto',
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    assetBaseUrl: process.env.ASSET_BASE_URL,
  });

  const uploadsRoot = path.join(process.cwd(), 'uploads');
  console.log(`[backfill] source: ${uploadsRoot}`);
  console.log(`[backfill] target: ${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}`);
  console.log(`[backfill] public: ${process.env.ASSET_BASE_URL}`);
  if (dryRun) console.log('[backfill] DRY RUN — nothing will be uploaded.\n');

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;
  let bytes = 0;

  for (const category of CATEGORIES) {
    const dir = path.join(uploadsRoot, category);
    const files = listFiles(dir);
    console.log(`[backfill] ${category}: ${files.length} file(s)`);

    for (const filename of files) {
      const key = `${category}/${filename}`;
      const ext = path.extname(filename).toLowerCase();
      const contentType = CONTENT_TYPES[ext];

      if (!contentType) {
        console.warn(`  skip (unsupported type): ${key}`);
        skipped += 1;
        continue;
      }

      const buffer = fs.readFileSync(path.join(dir, filename));

      if (dryRun) {
        console.log(`  would upload: ${key} (${buffer.length} bytes)`);
        uploaded += 1;
        bytes += buffer.length;
        continue;
      }

      try {
        await driver.put(key, buffer, contentType);
        uploaded += 1;
        bytes += buffer.length;
        if (uploaded % 25 === 0) console.log(`  ...${uploaded} uploaded`);
      } catch (error) {
        console.error(`  FAILED: ${key} — ${error.message}`);
        failed += 1;
      }
    }
  }

  console.log(
    `\n[backfill] done — ${uploaded} uploaded, ${skipped} skipped, ${failed} failed, ${(bytes / 1024 / 1024).toFixed(2)} MB`
  );

  if (failed > 0) {
    console.error('[backfill] Some objects failed. Re-run to retry; the operation is idempotent.');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`[backfill] fatal: ${error.message}`);
  process.exit(1);
});
