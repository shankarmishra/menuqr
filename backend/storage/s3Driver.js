// MENUQR Storage — S3-Compatible Driver (Cloudflare R2 / Backblaze B2 / MinIO / AWS S3)
//
// Durable object storage so client logos, covers and dish photos survive deploys.
// AWS Signature V4 is signed here with node:crypto — no SDK dependency is added.
// Uses path-style addressing (`<endpoint>/<bucket>/<key>`), which R2, B2 and MinIO all accept.

import { createHash, createHmac } from 'node:crypto';

const SERVICE = 's3';
const ALGORITHM = 'AWS4-HMAC-SHA256';

function sha256Hex(data) {
  return createHash('sha256').update(data).digest('hex');
}

function hmac(key, data) {
  return createHmac('sha256', key).update(data, 'utf8').digest();
}

/** RFC 3986 encoding; AWS requires `~` unescaped and does NOT accept `!*'()` escaping differences. */
function uriEncode(value) {
  return encodeURIComponent(value)
    .replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

/** Encode each path segment but preserve the `/` separators. */
function encodePath(objectPath) {
  return objectPath.split('/').map(uriEncode).join('/');
}

/** `20260129T104500Z` and `20260129` */
function amzDates(now) {
  const iso = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  return { amzDate: iso, dateStamp: iso.slice(0, 8) };
}

function signingKey(secret, dateStamp, region) {
  const kDate = hmac(`AWS4${secret}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, SERVICE);
  return hmac(kService, 'aws4_request');
}

export function createS3Driver(config) {
  const endpoint = String(config.endpoint || '').replace(/\/+$/, '');
  const bucket = config.bucket;
  const region = config.region || 'auto';
  const accessKeyId = config.accessKeyId;
  const secretAccessKey = config.secretAccessKey;
  const assetBaseUrl = String(config.assetBaseUrl || '').replace(/\/+$/, '');

  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'S3 storage driver requires S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY.'
    );
  }
  if (!assetBaseUrl) {
    throw new Error('S3 storage driver requires ASSET_BASE_URL (the public read URL for the bucket).');
  }

  const endpointUrl = new URL(endpoint);
  const host = endpointUrl.host;
  // Some providers (Supabase: /storage/v1/s3) serve the S3 API under a path prefix. That prefix is
  // part of the request path, so it must be part of the signed canonical URI too.
  const basePath = endpointUrl.pathname.replace(/\/+$/, '');
  // Injectable so request signing is verifiable against fixed AWS test vectors.
  const clock = config.clock || (() => new Date());

  /** Builds the signed request without issuing it — the unit-testable core of the driver. */
  function buildSignedRequest(method, key, { body, contentType, cacheControl } = {}) {
    const canonicalUri = `${basePath}/${encodePath(bucket)}/${encodePath(key)}`;
    const payloadHash = body ? sha256Hex(body) : sha256Hex('');
    const { amzDate, dateStamp } = amzDates(clock());

    // Header names must be lowercase and sorted for the canonical request.
    const headers = {
      host,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
    };
    if (contentType) headers['content-type'] = contentType;
    if (cacheControl) headers['cache-control'] = cacheControl;

    const sortedKeys = Object.keys(headers).sort();
    const canonicalHeaders = sortedKeys.map((h) => `${h}:${String(headers[h]).trim()}\n`).join('');
    const signedHeaders = sortedKeys.join(';');

    const canonicalRequest = [
      method,
      canonicalUri,
      '', // no query string
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join('\n');

    const scope = `${dateStamp}/${region}/${SERVICE}/aws4_request`;
    const stringToSign = [ALGORITHM, amzDate, scope, sha256Hex(canonicalRequest)].join('\n');
    const signature = createHmac('sha256', signingKey(secretAccessKey, dateStamp, region))
      .update(stringToSign, 'utf8')
      .digest('hex');

    headers.Authorization =
      `${ALGORITHM} Credential=${accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    return { url: `${endpointUrl.origin}${canonicalUri}`, method, headers, body, canonicalRequest, stringToSign, signature };
  }

  async function signedFetch(method, key, opts = {}) {
    const req = buildSignedRequest(method, key, opts);
    return fetch(req.url, { method: req.method, headers: req.headers, body: req.body });
  }

  return {
    name: 's3',
    isRemote: true,
    buildSignedRequest,

    async put(key, buffer, contentType) {
      const response = await signedFetch('PUT', key, {
        body: buffer,
        contentType: contentType || 'application/octet-stream',
        // Keys embed a content hash, so objects are immutable and can be cached for a year.
        cacheControl: 'public, max-age=31536000, immutable',
      });
      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        throw new Error(`Object storage upload failed (${response.status}): ${detail.slice(0, 300)}`);
      }
      return { key, url: this.url(key) };
    },

    async get(key) {
      const response = await signedFetch('GET', key);
      if (response.status === 404) return null;
      if (!response.ok) {
        throw new Error(`Object storage read failed (${response.status}).`);
      }
      return Buffer.from(await response.arrayBuffer());
    },

    async delete(key) {
      const response = await signedFetch('DELETE', key);
      // S3 returns 204 on success and 404 when already absent — both are a no-op success.
      if (!response.ok && response.status !== 404) {
        throw new Error(`Object storage delete failed (${response.status}).`);
      }
    },

    url(key) {
      return `${assetBaseUrl}/${encodePath(key)}`;
    },
  };
}
