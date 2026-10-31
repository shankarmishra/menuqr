/**
 * Turns a restaurant's stored contact details into links that are safe to render.
 *
 * Stored values come in two generations. Values saved through the settings endpoint since the
 * profile rules were added are already normalised (an Instagram handle, a canonical Facebook URL,
 * an https website, "+91 xxxxx xxxxx" numbers). Older values are whatever the owner typed: "@name",
 * "instagram.com/name", "https://www.facebook.com/page/", a bare domain, several numbers in one
 * string. Every function here accepts both and returns `null` when it cannot produce a valid link,
 * so a caller renders nothing rather than a broken or placeholder link.
 *
 * Keep the accepted forms in step with backend/profileRules.js; the fixtures in
 * backend/test/fixtures/profile-rules.json are run against both.
 */

const INSTAGRAM_HOSTS = new Set(['instagram.com', 'www.instagram.com', 'm.instagram.com', 'instagr.am', 'www.instagr.am']);
const INSTAGRAM_RESERVED = new Set([
  'p', 'reel', 'reels', 'tv', 'stories', 'explore', 'accounts', 'direct', 'about', 'legal', 'developer',
  'web', 'directory', 'privacy', 'press', 'api', 'challenge', 'oauth', 'emails', 'session', 'login',
  'download', 'topics', 'locations',
]);
const INSTAGRAM_HANDLE = /^(?!.*\.\.)[a-z0-9._]{1,30}$/;
const INSTAGRAM_LOOKS_LIKE_URL = /^(https?:\/\/|www\.|(m\.)?instagram\.com|instagr\.am)/i;

const FACEBOOK_HOSTS = new Set(['facebook.com', 'www.facebook.com', 'm.facebook.com', 'web.facebook.com', 'fb.com', 'www.fb.com', 'fb.me']);
const FACEBOOK_BLOCKED = new Set(['sharer', 'sharer.php', 'share', 'share.php', 'dialog', 'login', 'login.php', 'plugins', 'tr', 'l.php', 'policies', 'help']);
const FACEBOOK_LOOKS_LIKE_URL = /^(https?:\/\/|www\.|m\.|web\.|(facebook|fb)\.com|fb\.me)/i;
const FACEBOOK_NAME = /^[A-Za-z0-9.\-]{5,50}$/;
const FACEBOOK_SEGMENT = /^[A-Za-z0-9._\-%]{1,120}$/;

const hasScheme = (text: string) => /^https?:\/\//i.test(text);

function parseUrl(text: string): URL | null {
  try {
    return new URL(hasScheme(text) ? text : `https://${text}`);
  } catch {
    return null;
  }
}

function clean(value: string | null | undefined): string {
  return typeof value === 'string'
    ? value.replace(/[​-‍﻿⁠]/g, '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
    : '';
}

/** The Instagram handle without "@", or null. */
export function instagramHandle(value?: string | null): string | null {
  const raw = clean(value);
  if (!raw) return null;

  let candidate = raw;
  if (INSTAGRAM_LOOKS_LIKE_URL.test(raw)) {
    const url = parseUrl(raw);
    if (!url || !INSTAGRAM_HOSTS.has(url.hostname.toLowerCase())) return null;
    const [first] = url.pathname.split('/').filter(Boolean);
    if (!first || INSTAGRAM_RESERVED.has(first.toLowerCase())) return null;
    candidate = first;
  }
  const handle = candidate.replace(/^@+/, '').replace(/[/?#].*$/, '').toLowerCase();
  return INSTAGRAM_HANDLE.test(handle) ? handle : null;
}

/** `https://www.instagram.com/<handle>/`, or null. */
export function instagramUrl(value?: string | null): string | null {
  const handle = instagramHandle(value);
  return handle ? `https://www.instagram.com/${handle}/` : null;
}

/** The canonical Facebook page URL, or null. */
export function facebookUrl(value?: string | null): string | null {
  const raw = clean(value);
  if (!raw) return null;

  if (FACEBOOK_LOOKS_LIKE_URL.test(raw)) {
    const url = parseUrl(raw);
    if (!url || !FACEBOOK_HOSTS.has(url.hostname.toLowerCase())) return null;
    const segments = url.pathname.split('/').filter(Boolean);
    if (segments.length === 0 || FACEBOOK_BLOCKED.has(segments[0].toLowerCase())) return null;
    if (segments[0].toLowerCase() === 'profile.php') {
      const id = url.searchParams.get('id') || '';
      return /^\d{5,20}$/.test(id) ? `https://www.facebook.com/profile.php?id=${id}` : null;
    }
    return segments.every((segment) => FACEBOOK_SEGMENT.test(segment)) ? `https://www.facebook.com/${segments.join('/')}` : null;
  }
  const name = raw.replace(/^@+/, '');
  return FACEBOOK_NAME.test(name) ? `https://www.facebook.com/${name}` : null;
}

/** An https website address, or null. */
export function websiteUrl(value?: string | null): string | null {
  const raw = clean(value);
  if (!raw || raw.length > 2048) return null;
  if (/^(javascript|data|vbscript|file|ftp|mailto|tel|blob):/i.test(raw) || (raw.includes('://') && !hasScheme(raw))) return null;

  const url = parseUrl(raw);
  if (!url || url.username || url.password) return null;
  const host = url.hostname.toLowerCase();
  const isIpAddress = /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.startsWith('[');
  const isInternal = host === 'localhost' || /\.(localhost|local|internal|test|invalid|example)$/.test(host);
  if (!host.includes('.') || host.startsWith('.') || host.endsWith('.') || isIpAddress || isInternal) return null;
  if (host.split('.').some((label) => label.startsWith('xn--'))) return null;
  if (url.port && url.port !== '80' && url.port !== '443') return null;

  const path = url.pathname === '/' ? '' : url.pathname.replace(/\/+$/, '');
  return `https://${host}${path}${url.search}`;
}

/** What to show for a website link: the address without the scheme or a leading "www.". */
export function websiteLabel(value?: string | null): string | null {
  const url = websiteUrl(value);
  return url ? url.replace(/^https:\/\/(www\.)?/, '') : null;
}

export interface PhoneLink {
  /** As it should be read: "+91 95480 89761". */
  display: string;
  /** For `tel:` links. */
  tel: string;
  /** For `https://wa.me/<digits>`; empty for toll-free numbers, which cannot receive WhatsApp. */
  whatsapp: string;
}

function parsePhone(token: string): PhoneLink | null {
  const digits = token.replace(/[^\d+]/g, '');
  if (!digits) return null;

  let national: string;
  if (digits.startsWith('+')) {
    if (!digits.startsWith('+91')) return null;
    national = digits.slice(3);
  } else if (digits.startsWith('91') && digits.length === 12) {
    national = digits.slice(2);
  } else if (digits.startsWith('0')) {
    national = digits.slice(1);
  } else {
    national = digits;
  }

  if (/^1(?:800|860)\d{6,7}$/.test(national)) {
    return { display: `${national.slice(0, 4)} ${national.slice(4)}`, tel: national, whatsapp: '' };
  }
  if (/^\d{10}$/.test(national)) {
    return {
      display: `+91 ${national.slice(0, 5)} ${national.slice(5)}`,
      tel: `+91${national}`,
      whatsapp: `91${national}`,
    };
  }
  return null;
}

/**
 * Every valid number in a stored phone string, in order. A string such as
 * "+91 95480 89761, +91 90689 35364" is two numbers; joining its digits makes one invalid one,
 * which is what the older `tel:` links did.
 */
export function phoneLinks(value?: string | null): PhoneLink[] {
  const raw = clean(value);
  if (!raw) return [];
  const seen = new Set<string>();
  const links: PhoneLink[] = [];
  for (const token of raw.split(/\s*(?:[,;]|\s\/\s|\sor\s|\s&\s)\s*/i)) {
    const parsed = parsePhone(token);
    if (parsed && !seen.has(parsed.tel)) {
      seen.add(parsed.tel);
      links.push(parsed);
    }
  }
  return links;
}

/** The first valid number, or null. */
export function firstPhone(value?: string | null): PhoneLink | null {
  return phoneLinks(value)[0] ?? null;
}
