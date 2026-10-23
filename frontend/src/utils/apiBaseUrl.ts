/**
 * Resolves the appropriate API base URL.
 * In local development (localhost / 127.0.0.1), returns empty string to route
 * requests through Vite's local dev proxy, avoiding CORS preflight errors.
 * In production, returns VITE_API_BASE_URL.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '[::1]') {
      return '';
    }
  }
  return import.meta.env.VITE_API_BASE_URL ?? '';
}
