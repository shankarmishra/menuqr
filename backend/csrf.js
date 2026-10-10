import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { parseCookie as parse, stringifySetCookie as serialize } from 'cookie';

const CSRF_SECRET = process.env.JWT_SECRET || 'menusqr-default-csrf-secret-key';
const CSRF_COOKIE_NAME = 'menusqr_csrf';

export function generateCsrfToken(sessionId = '') {
  const nonce = randomBytes(16).toString('hex');
  const hmac = createHmac('sha256', CSRF_SECRET)
    .update(`${sessionId}:${nonce}`)
    .digest('hex');
  return `${nonce}.${hmac}`;
}

export function verifyCsrfToken(token, sessionId = '') {
  if (typeof token !== 'string' || !token.includes('.')) return false;
  const [nonce, hmac] = token.split('.');
  if (!nonce || !hmac) return false;
  try {
    const expectedHmac = createHmac('sha256', CSRF_SECRET)
      .update(`${sessionId}:${nonce}`)
      .digest('hex');
    const inputBuf = Buffer.from(hmac, 'hex');
    const expectedBuf = Buffer.from(expectedHmac, 'hex');
    return inputBuf.length === expectedBuf.length && timingSafeEqual(inputBuf, expectedBuf);
  } catch {
    return false;
  }
}

export function createCsrfCookie(csrfToken, environment = process.env) {
  const secure = environment.NODE_ENV === 'production' || environment.COOKIE_SECURE === 'true';
  return serialize({
    name: CSRF_COOKIE_NAME,
    value: csrfToken,
    httpOnly: false, // Readable by frontend JS to attach in X-CSRF-Token header
    secure,
    sameSite: secure ? 'none' : 'lax',
    path: '/',
    maxAge: 8 * 60 * 60,
    ...(environment.COOKIE_DOMAIN ? { domain: environment.COOKIE_DOMAIN } : {}),
  });
}

export function createClearedCsrfCookie(environment = process.env) {
  const secure = environment.NODE_ENV === 'production' || environment.COOKIE_SECURE === 'true';
  return serialize({
    name: CSRF_COOKIE_NAME,
    value: '',
    httpOnly: false,
    secure,
    sameSite: secure ? 'none' : 'lax',
    path: '/',
    maxAge: 0,
    ...(environment.COOKIE_DOMAIN ? { domain: environment.COOKIE_DOMAIN } : {}),
  });
}
