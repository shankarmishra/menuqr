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
  return `https://${normalizeHostname(adminHostname)}${path}${suffix}`;
}