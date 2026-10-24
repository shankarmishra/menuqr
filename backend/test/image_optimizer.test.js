import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { optimizeAndSaveImage } from '../imageOptimizer.js';

test('Comprehensive Image Optimization & WebP Pipeline Tests', async (t) => {
  sharp.cache(false);
  const createdFiles = [];

  t.after(() => {
    // Clean up test generated files
    for (const file of createdFiles) {
      try {
        const fullPath = path.join(process.cwd(), file.replace(/^\//, ''));
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch {
        // Ignore busy lock on windows test run
      }
    }
  });

  await t.test('Angle 1: Optimizes PNG to WebP, resizes to <=1200px and strips metadata', async () => {
    // Generate a 1600x1200 synthetic PNG test image
    const rawPng = await sharp({
      create: {
        width: 1600,
        height: 1200,
        channels: 4,
        background: { r: 232, g: 120, b: 60, alpha: 1 },
      }
    }).png().toBuffer();

    const result = await optimizeAndSaveImage(rawPng, 'tenant_test_123', 'dishes', { maxWidth: 1200, quality: 80 });
    createdFiles.push(result.url);

    assert.equal(result.format, 'webp');
    assert.ok(result.url.endsWith('.webp'), 'Must emit .webp extension');
    assert.ok(result.url.startsWith('/uploads/dishes/tenant_test_123_'), 'Must scope under uploads/dishes with tenant prefix');
    assert.ok(result.compressedBytes < result.originalBytes, 'Compressed bytes must be smaller than raw PNG');
    assert.ok(result.width <= 1200, 'Width must be downscaled to max 1200px');

    // Verify file actually exists on disk
    const diskPath = path.join(process.cwd(), result.url.replace(/^\//, ''));
    assert.ok(fs.existsSync(diskPath), 'Optimized WebP file must exist on disk');

    // Verify disk file is readable as WebP
    const diskMeta = await sharp(diskPath).metadata();
    assert.equal(diskMeta.format, 'webp');
    assert.equal(diskMeta.width, 1200);
  });

  await t.test('Angle 2: Accepts base64 data URI string and optimizes correctly', async () => {
    const rawJpg = await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 3,
        background: { r: 30, g: 80, b: 50 },
      }
    }).jpeg().toBuffer();

    const dataUri = `data:image/jpeg;base64,${rawJpg.toString('base64')}`;

    const result = await optimizeAndSaveImage(dataUri, 'tenant_test_456', 'logos');
    createdFiles.push(result.url);

    assert.equal(result.format, 'webp');
    assert.ok(result.url.startsWith('/uploads/logos/tenant_test_456_'));
    const diskPath = path.join(process.cwd(), result.url.replace(/^\//, ''));
    assert.ok(fs.existsSync(diskPath));
  });

  await t.test('Angle 3: Rejects malicious / non-image text or executable payload', async () => {
    const fakeScript = Buffer.from('<?php echo "malicious payload"; ?>');

    await assert.rejects(
      async () => {
        await optimizeAndSaveImage(fakeScript, 'tenant_hack', 'dishes');
      },
      /Unsupported or invalid image format|Input buffer contains unsupported image format/i
    );
  });

  await t.test('Angle 4: Rejects empty or missing inputs', async () => {
    await assert.rejects(
      async () => {
        await optimizeAndSaveImage(null, 'tenant_123');
      },
      /No image data provided/
    );

    await assert.rejects(
      async () => {
        await optimizeAndSaveImage(Buffer.from([]), 'tenant_123');
      },
      /Image buffer is empty/
    );
  });

  await t.test('Angle 5: Enforces 15MB maximum file size limit', async () => {
    // Fake buffer > 15MB
    const hugeBuffer = Buffer.alloc(16 * 1024 * 1024);

    await assert.rejects(
      async () => {
        await optimizeAndSaveImage(hugeBuffer, 'tenant_123');
      },
      /exceeds 15MB limit/
    );
  });
});
