import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createLocalDriver } from '../storage/localDriver.js';
import { createS3Driver } from '../storage/s3Driver.js';
import { buildKey, sanitizeCategory } from '../storage/index.js';

const SHA256_EMPTY = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
const SHA256_HELLO = '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824';

test('Storage: key namespacing', async (t) => {
  await t.test('sanitizeCategory allows only known prefixes', () => {
    for (const ok of ['dishes', 'logos', 'covers', 'library']) {
      assert.equal(sanitizeCategory(ok), ok);
    }
    assert.equal(sanitizeCategory('../etc'), 'dishes');
    assert.equal(sanitizeCategory('anything-else'), 'dishes');
    assert.equal(sanitizeCategory(undefined), 'dishes');
  });

  await t.test('buildKey produces category/filename and cannot be escaped', () => {
    assert.equal(buildKey('logos', 'a.webp'), 'logos/a.webp');
    assert.equal(buildKey('../../evil', 'a.webp'), 'dishes/a.webp');
  });
});

test('Storage: local driver', async (t) => {
  const driver = createLocalDriver();
  const key = `dishes/__storage_test_${Date.now()}.txt`;

  t.after(() => {
    try {
      const full = path.join(process.cwd(), 'uploads', key);
      if (fs.existsSync(full)) fs.unlinkSync(full);
    } catch {
      // Ignore Windows file lock during teardown
    }
  });

  await t.test('round-trips a buffer and returns a legacy-compatible URL', async () => {
    const payload = Buffer.from('menuqr-storage-roundtrip');
    const { url } = await driver.put(key, payload, 'text/plain');
    assert.equal(url, `/uploads/${key}`);
    assert.deepEqual(await driver.get(key), payload);
  });

  await t.test('get returns null for a missing key rather than throwing', async () => {
    assert.equal(await driver.get('dishes/definitely-not-here-9f3a.webp'), null);
  });

  await t.test('delete is idempotent', async () => {
    await driver.delete(key);
    await driver.delete(key); // second call must not throw
    assert.equal(await driver.get(key), null);
  });

  await t.test('rejects keys that escape the uploads root', async () => {
    for (const bad of ['../../etc/passwd', '/etc/passwd', 'dishes/../../../secret', '..']) {
      await assert.rejects(
        () => driver.put(bad, Buffer.from('x'), 'text/plain'),
        /outside the uploads root/,
        `must reject ${bad}`
      );
    }
  });
});

test('Storage: S3 driver request signing', async (t) => {
  const config = {
    endpoint: 'https://acct123.r2.cloudflarestorage.com',
    bucket: 'menuqr-assets',
    region: 'auto',
    accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
    secretAccessKey: 'wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY',
    assetBaseUrl: 'https://cdn.example.com',
    clock: () => new Date('2026-01-15T10:30:00.000Z'),
  };
  const driver = createS3Driver(config);

  const signPut = () =>
    driver.buildSignedRequest('PUT', 'dishes/tenant_1_ab12.webp', {
      body: Buffer.from('hello'),
      contentType: 'image/webp',
      cacheControl: 'public, max-age=31536000, immutable',
    });

  await t.test('requires full configuration', () => {
    assert.throws(() => createS3Driver({ ...config, bucket: undefined }), /S3_BUCKET/);
    assert.throws(() => createS3Driver({ ...config, assetBaseUrl: '' }), /ASSET_BASE_URL/);
  });

  await t.test('canonical request has the six SigV4 sections with sorted lowercase headers', () => {
    const { canonicalRequest } = signPut();
    const lines = canonicalRequest.split('\n');
    assert.equal(lines[0], 'PUT');
    assert.equal(lines[1], '/menuqr-assets/dishes/tenant_1_ab12.webp', 'path-style addressing');
    assert.equal(lines[2], '', 'no query string');

    const signedHeaders = lines[lines.length - 2];
    assert.equal(signedHeaders, 'cache-control;content-type;host;x-amz-content-sha256;x-amz-date');
    assert.deepEqual([...signedHeaders.split(';')].sort(), signedHeaders.split(';'), 'headers must be sorted');
    assert.equal(lines[lines.length - 1], SHA256_HELLO, 'payload hash must be sha256 of the body');
  });

  await t.test('empty body hashes to the canonical empty-string digest', () => {
    const { canonicalRequest } = driver.buildSignedRequest('DELETE', 'dishes/x.webp');
    assert.ok(canonicalRequest.endsWith(SHA256_EMPTY), 'DELETE has no payload');
  });

  await t.test('string-to-sign carries the correct algorithm, timestamp and credential scope', () => {
    const { stringToSign } = signPut();
    const [algorithm, amzDate, scope, hashedRequest] = stringToSign.split('\n');
    assert.equal(algorithm, 'AWS4-HMAC-SHA256');
    assert.equal(amzDate, '20260115T103000Z');
    assert.equal(scope, '20260115/auto/s3/aws4_request');
    assert.match(hashedRequest, /^[0-9a-f]{64}$/);
  });

  await t.test('Authorization header is well formed', () => {
    const { headers } = signPut();
    assert.match(
      headers.Authorization,
      /^AWS4-HMAC-SHA256 Credential=AKIAIOSFODNN7EXAMPLE\/20260115\/auto\/s3\/aws4_request, SignedHeaders=[a-z0-9;-]+, Signature=[0-9a-f]{64}$/
    );
  });

  // Regression lock, not an AWS-published vector: this pins the signing algorithm so a future
  // refactor of the canonical request, header set or HMAC chain cannot change it silently.
  // Live end-to-end verification still requires real bucket credentials.
  await t.test('signature is deterministic and secret-dependent', () => {
    assert.equal(signPut().signature, '3fe35bb1d264ce77937d75070aeb83940d554757d2d18837ebd2b802558f4f84');
    assert.equal(signPut().signature, signPut().signature, 'same inputs must sign identically');

    const other = createS3Driver({ ...config, secretAccessKey: 'a-different-secret-key-entirely' });
    assert.notEqual(
      other.buildSignedRequest('PUT', 'dishes/tenant_1_ab12.webp', {
        body: Buffer.from('hello'),
        contentType: 'image/webp',
        cacheControl: 'public, max-age=31536000, immutable',
      }).signature,
      signPut().signature,
      'a different secret must produce a different signature'
    );
  });

  await t.test('an endpoint with a path prefix (Supabase) is signed and requested with that prefix', () => {
    const supabase = createS3Driver({ ...config, endpoint: 'https://proj.storage.supabase.co/storage/v1/s3/', region: 'ap-southeast-1' });
    const req = supabase.buildSignedRequest('PUT', 'dishes/a.webp', { body: Buffer.from('x'), contentType: 'image/webp' });
    assert.equal(req.url, 'https://proj.storage.supabase.co/storage/v1/s3/menuqr-assets/dishes/a.webp');
    assert.equal(req.canonicalRequest.split('\n')[1], '/storage/v1/s3/menuqr-assets/dishes/a.webp');
    assert.equal(req.headers.host, 'proj.storage.supabase.co');
  });

  await t.test('public URLs encode path segments per RFC 3986', () => {
    assert.equal(driver.url('dishes/a b~c.webp'), 'https://cdn.example.com/dishes/a%20b~c.webp');
    assert.ok(!driver.url('dishes/a b.webp').includes('+'), 'space must encode as %20, never +');
    assert.equal(driver.url('logos/plain.webp'), 'https://cdn.example.com/logos/plain.webp');
  });
});
