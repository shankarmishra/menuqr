export class ApiError extends Error {
  status: number;
  statusText: string;
  data?: any;
  isHtml?: boolean;

  constructor(message: string, status: number, statusText: string, data?: any, isHtml = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
    this.isHtml = isHtml;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export interface ParseApiOptions {
  allowEmpty?: boolean;
}

/**
 * Safely parse an HTTP Response.
 * Reads the response body stream exactly once as text, checks for empty bodies,
 * detects unexpected HTML (e.g., SPA rewrite fallbacks or gateway error pages),
 * and parses JSON payloads without throwing uncaught syntax errors.
 */
export async function parseApiResponse<T>(
  response: Response,
  options?: ParseApiOptions
): Promise<T> {
  const text = await response.text();
  const trimmed = text.trim();

  // 1. Handle HTTP 204 No Content (legitimately permits empty body)
  if (response.status === 204) {
    return undefined as T;
  }

  // 2. Handle empty response bodies on non-204 responses
  if (trimmed.length === 0) {
    if (!response.ok) {
      throw new ApiError(
        response.statusText || `Request failed (${response.status}).`,
        response.status,
        response.statusText
      );
    }
    // Only accept empty body on 2xx if caller explicitly allows it
    if (options?.allowEmpty) {
      return undefined as T;
    }
    throw new ApiError(
      'Server returned an empty response where content was expected.',
      response.status,
      response.statusText
    );
  }

  // 3. Detect HTML or non-JSON XML responses (e.g. SPA fallback rewrites or cloud proxies)
  const isHtml = trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html') || trimmed.startsWith('<?xml');
  if (isHtml) {
    if (!response.ok) {
      throw new ApiError(
        `Server returned an HTML error page (${response.status} ${response.statusText || 'Error'}). Check API availability.`,
        response.status,
        response.statusText,
        undefined,
        true
      );
    }
    throw new ApiError(
      'Expected JSON response from server, but received HTML (likely an SPA fallback rewrite or incorrect API route).',
      response.status,
      response.statusText,
      undefined,
      true
    );
  }

  // 4. Attempt JSON parse
  let data: any;
  try {
    data = JSON.parse(trimmed);
  } catch {
    const errorMsg = !response.ok
      ? `Request failed (${response.status} ${response.statusText || 'Error'}).`
      : 'Failed to parse JSON response from server.';
    throw new ApiError(errorMsg, response.status, response.statusText);
  }

  // 5. Handle non-2xx status codes with JSON error payloads
  if (!response.ok) {
    const message =
      (data && typeof data === 'object' && (data.error || data.message)) ||
      `Request failed (${response.status}).`;
    throw new ApiError(String(message), response.status, response.statusText, data);
  }

  return data as T;
}

export function safeJsonParse<T = any>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}
