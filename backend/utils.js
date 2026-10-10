export function apiError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export function sendJson(response, status, value, headers = {}) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers,
  });
  response.end(JSON.stringify(value));
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

export function getClientIp(request) {
  const forwarded = request.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.socket.remoteAddress || 'unknown';
}

export function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}
