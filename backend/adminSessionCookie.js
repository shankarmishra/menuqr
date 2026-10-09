const ADMIN_SESSION_COOKIE_NAME = 'menusqr_admin_session';
const ADMIN_SESSION_TTL_SECONDS = 8 * 60 * 60;

function isSecureCookie(environment) {
  return environment.NODE_ENV === 'production' || environment.COOKIE_SECURE === 'true';
}

function getAdminSessionCookieAttributes(environment) {
  const secure = isSecureCookie(environment);
  return {
    name: ADMIN_SESSION_COOKIE_NAME,
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
    path: '/',
    ...(environment.COOKIE_DOMAIN ? { domain: environment.COOKIE_DOMAIN } : {}),
  };
}

export function createAdminSessionCookieOptions(value, environment = process.env) {
  return {
    ...getAdminSessionCookieAttributes(environment),
    value,
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  };
}

export function createClearedAdminSessionCookieOptions(environment = process.env) {
  return {
    ...getAdminSessionCookieAttributes(environment),
    value: '',
    maxAge: 0,
  };
}