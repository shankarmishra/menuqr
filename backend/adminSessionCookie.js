const ADMIN_SESSION_COOKIE_NAME = 'menusqr_admin_session';
// Short on purpose: an admin session reaches every tenant's data. Override with ADMIN_SESSION_HOURS.
export function getAdminSessionTtlSeconds(environment = process.env) {
  const hours = Number(environment.ADMIN_SESSION_HOURS);
  return (Number.isFinite(hours) && hours > 0 ? Math.min(hours, 72) : 12) * 60 * 60;
}

function isSecureCookie(environment) {
  return environment.NODE_ENV === 'production' || environment.COOKIE_SECURE === 'true';
}

function getAdminSessionCookieAttributes(environment) {
  const secure = isSecureCookie(environment);
  return {
    name: ADMIN_SESSION_COOKIE_NAME,
    httpOnly: true,
    secure,
    // admin.menusqr.in and api.menusqr.in are the same site, so Strict works and means the cookie
    // is never sent on a cross-site request at all.
    sameSite: secure ? 'strict' : 'lax',
    path: '/',
    ...(environment.COOKIE_DOMAIN ? { domain: environment.COOKIE_DOMAIN } : {}),
  };
}

export function createAdminSessionCookieOptions(value, environment = process.env) {
  return {
    ...getAdminSessionCookieAttributes(environment),
    value,
    maxAge: getAdminSessionTtlSeconds(environment),
  };
}

export function createClearedAdminSessionCookieOptions(environment = process.env) {
  return {
    ...getAdminSessionCookieAttributes(environment),
    value: '',
    maxAge: 0,
  };
}