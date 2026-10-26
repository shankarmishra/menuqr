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
