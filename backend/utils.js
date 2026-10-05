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

export async function readJson(request) {
  const chunks = [];
  let size = 0;
  const maxBodyBytes = 20 * 1024 * 1024;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBodyBytes) throw apiError(413, 'Request body is too large.');
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw apiError(400, 'Request body must contain valid JSON.');
  }
}
