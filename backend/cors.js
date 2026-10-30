const localFrontendOrigins = new Set([
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
]);

function normalizeOrigin(value) {
  if (typeof value !== 'string' || !value.trim()) return '';
  const candidate = value.trim();
  try {
    const parsed = new URL(candidate);
    return parsed.origin === candidate.replace(/\/$/, '') ? parsed.origin : '';
  } catch {
    return '';
  }
}

/**
 * Origins allowed to call the admin APIs (/api/auth/admin/*, /api/admin/*). Narrower than the
 * general CORS list on purpose: the restaurant site (menusqr.in) must never be able to drive the
 * admin API, so a script injected there cannot reach it from a browser.
 */
export function createAdminOriginChecker(environment = process.env) {
  const production = environment.NODE_ENV === 'production' || environment.COOKIE_SECURE === 'true';
  const configured = (environment.ADMIN_FRONTEND_ORIGIN || (production ? 'https://admin.menusqr.in' : ''))
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);
  const allowed = new Set(configured);
  const general = createCorsOriginChecker(environment);

  return (origin) => {
    if (!origin) return true; // non-browser callers carry no Origin; the session and CSRF checks still apply
    const normalized = normalizeOrigin(origin);
    if (!normalized) return false;
    if (allowed.size > 0) return allowed.has(normalized);
    return general(origin); // development/test with no admin origin configured
  };
}

export function createCorsOriginChecker(environment = process.env) {
  const allowedOrigins = [
    environment.FRONTEND_ORIGINS,
    environment.FRONTEND_ORIGIN,
    environment.ADMIN_FRONTEND_ORIGIN,
  ]
    .flatMap((value) => (value || '').split(','))
    .map(normalizeOrigin)
    .filter(Boolean);
  const allowed = new Set(allowedOrigins);

  return (origin) => {
    if (!origin) return true;
    const normalizedOrigin = normalizeOrigin(origin);
    if (!normalizedOrigin) return false;
    if (allowed.has(normalizedOrigin)) return true;
    const isDevelopment = ['development', 'test'].includes(environment.NODE_ENV);
    return isDevelopment && localFrontendOrigins.has(normalizedOrigin);
  };
}
