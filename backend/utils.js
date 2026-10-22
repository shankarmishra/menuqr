export function apiError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export function sendJson(response, status, data, headers = {}) {
  const body = JSON.stringify(data);
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    ...headers,
  });
  response.end(body);
}

export async function readRawBody(request) {
  const chunks = [];
  let size = 0;
  const maxBodyBytes = 20 * 1024 * 1024;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBodyBytes) throw apiError(413, 'Request body is too large.');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export async function readJsonWithRaw(request) {
  const rawBuffer = await readRawBody(request);
  const rawText = rawBuffer.toString('utf8');
  let parsed = {};
  if (rawText.trim()) {
    try {
      parsed = JSON.parse(rawText);
    } catch {
      throw apiError(400, 'Request body must contain valid JSON.');
    }
  }
  return { parsed, rawBuffer, rawText };
}

export async function readJson(request) {
  const { parsed } = await readJsonWithRaw(request);
  return parsed;
}

function isInternalIp(ip) {
  if (!ip) return false;
  const clean = ip.replace(/^::ffff:/, '').trim();
  if (clean === '127.0.0.1' || clean === '::1' || clean === 'localhost') return true;
  if (/^10\./.test(clean)) return true;
  if (/^192\.168\./.test(clean)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(clean)) return true;
  if (/^169\.254\./.test(clean)) return true;
  return false;
}

export function getClientIp(request) {
  const trustProxy = process.env.TRUST_PROXY === 'true';
  const remoteAddr = request.socket?.remoteAddress || '';

  if (trustProxy) {
    const trustedProxies = (process.env.TRUSTED_PROXY_IPS || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const isTrusted = trustedProxies.length === 0 || trustedProxies.includes(remoteAddr) || isInternalIp(remoteAddr);

    if (isTrusted) {
      const cfIp = request.headers['cf-connecting-ip'];
      if (cfIp) return String(cfIp).trim();

      const xRealIp = request.headers['x-real-ip'];
      if (xRealIp) return String(xRealIp).trim();

      const forwarded = request.headers['x-forwarded-for'];
      if (forwarded) {
        const ips = forwarded.split(',').map(s => s.trim()).filter(Boolean);
        // Traverse backwards from right to left, skipping internal proxy hops
        for (let i = ips.length - 1; i >= 0; i--) {
          if (!isInternalIp(ips[i])) {
            return ips[i];
          }
        }
        if (ips.length > 0) return ips[0];
      }
    }
  }

  return remoteAddr || 'unknown';
}

export function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}
