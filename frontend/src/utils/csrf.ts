import { parseApiResponse } from './api';
import { getApiBaseUrl } from './apiBaseUrl';

let activeCsrfToken: string | null = null;

export function setCsrfToken(token: string | null | undefined): void {
  if (typeof token === 'string' && token.length > 0) {
    activeCsrfToken = token;
  } else if (token === null) {
    activeCsrfToken = null;
  }
}

export function getCsrfToken(): string | null {
  if (activeCsrfToken) return activeCsrfToken;
  if (typeof document !== 'undefined' && document.cookie) {
    const match = document.cookie.match(/(?:^|;\s*)menusqr_csrf=([^;]*)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
  }
  return null;
}

export async function ensureCsrfToken(): Promise<string | null> {
  const existing = getCsrfToken();
  if (existing) return existing;

  try {
    const apiBaseUrl = getApiBaseUrl();
    let authToken: string | null = null;
    try {
      authToken = localStorage.getItem('menusqr_auth_token') || sessionStorage.getItem('menusqr_auth_token');
    } catch {}
    const authHeaders: Record<string, string> = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};

    const res = await fetch(`${apiBaseUrl}/api/auth/session`, {
      credentials: 'include',
      headers: authHeaders,
    });
    if (res.ok) {
      const data = await parseApiResponse<{ csrfToken?: string }>(res);
      if (data && typeof data.csrfToken === 'string') {
        setCsrfToken(data.csrfToken);
        return data.csrfToken;
      }
    }
  } catch (err) {
    console.error('Failed to bootstrap CSRF token:', err);
  }
  return null;
}
