export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed';

export interface ShareEnv {
  share?: (data: { title?: string; url?: string }) => Promise<void>;
  writeText?: (text: string) => Promise<void>;
  /** Last resort for pages without the clipboard API (plain http on a LAN address, old webviews). */
  legacyCopy?: (text: string) => boolean;
}

const isCancel = (error: unknown) => error instanceof Error && (error.name === 'AbortError' || error.name === 'NotAllowedError');

/** Copies text, trying the clipboard API first. */
export async function copyText(text: string, env: ShareEnv): Promise<boolean> {
  if (env.writeText) {
    try {
      await env.writeText(text);
      return true;
    } catch {
      // fall through to the legacy path
    }
  }
  try {
    return env.legacyCopy ? env.legacyCopy(text) : false;
  } catch {
    return false;
  }
}

/**
 * "Share this menu": the phone's share sheet when there is one, otherwise the link is copied.
 * A diner who closes the share sheet has not failed, so that is `cancelled`, not an error.
 */
export async function shareMenu(data: { title: string; url: string }, env: ShareEnv): Promise<ShareResult> {
  if (env.share) {
    try {
      await env.share({ title: data.title, url: data.url });
      return 'shared';
    } catch (error) {
      if (isCancel(error)) return 'cancelled';
      // The share sheet itself failed: copying the link still helps.
    }
  }
  return (await copyText(data.url, env)) ? 'copied' : 'failed';
}

/** The sharing and clipboard features of this browser, bound so they can be passed around. */
export function browserShareEnv(): ShareEnv {
  const env: ShareEnv = {};
  if (typeof navigator !== 'undefined') {
    if (typeof navigator.share === 'function') env.share = (data) => navigator.share(data);
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      env.writeText = (text) => navigator.clipboard.writeText(text);
    }
  }
  if (typeof document !== 'undefined') {
    env.legacyCopy = (text) => {
      const field = document.createElement('textarea');
      field.value = text;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      try {
        return document.execCommand('copy');
      } finally {
        document.body.removeChild(field);
      }
    };
  }
  return env;
}
