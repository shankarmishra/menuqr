function normalizeHostname(hostname: string | undefined): string {
  return typeof hostname === 'string' ? hostname.trim().toLowerCase().replace(/\.$/, '') : '';
}

export function isAdminHostname(hostname: string, configuredAdminHostname: string | undefined): boolean {
  const configured = normalizeHostname(configuredAdminHostname);
  return configured !== '' && normalizeHostname(hostname) === configured;
}

export function isAdminPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

export function getAdminRedirectUrl(
  adminHostname: string,
  pathname: string,
  search = '',
  hash = '',
): string {
  const isLoginOrRootAdminPath = pathname === '/admin' || pathname === '/admin/' || pathname === '/admin/login';
  const path = isLoginOrRootAdminPath ? '/login' : pathname;
  const suffix = isLoginOrRootAdminPath ? '' : `${search}${hash}`;
  const normalized = normalizeHostname(adminHostname);
  const isLocal = normalized.includes('localhost') || normalized === '127.0.0.1';
  const protocol = isLocal ? 'http' : 'https';
  const port = (typeof window !== 'undefined' && window.location.port) ? `:${window.location.port}` : '';
  return `${protocol}://${normalized}${port}${path}${suffix}`;
}
