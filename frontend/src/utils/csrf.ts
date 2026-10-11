import { parseApiResponse } from './api';

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
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
    const res = await fetch(`${apiBaseUrl}/api/auth/session`, { credentials: 'include' });
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
