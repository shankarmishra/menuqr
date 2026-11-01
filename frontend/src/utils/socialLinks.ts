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

import { firstDialNumber } from './dialNumber.ts';

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

/** `tel:` link for the first number of a phone field, or null when there is nothing dialable. */
export function telHref(value?: string | null): string | null {
  const dial = firstDialNumber(value);
  return dial.length >= 6 ? `tel:${dial}` : null;
}

/**
 * `https://wa.me/<digits>` for an Indian number, or for an explicit international "+..." number,
 * with an optional pre-filled message. Null for toll-free numbers and anything unreadable.
 */
export function whatsappUrl(value?: string | null, message?: string | null): string | null {
  const first = firstPhone(value);
  let digits = first?.whatsapp ?? '';
  if (!first) {
    const international = clean(value).replace(/[\s().-]/g, '');
    if (/^\+\d{8,15}$/.test(international)) digits = international.slice(1);
  }
  if (!digits) return null;
  const text = clean(message);
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

/**
 * A saved Google Maps link, or null. Only real map links qualify: a `google.com/url?q=` redirect or
 * a shortened `goo.gl` link to anywhere else is refused, because the page opens this link for guests.
 */
export function mapsUrl(value?: string | null): string | null {
  const raw = clean(value);
  if (!raw || raw.length > 2048) return null;
  const url = parseUrl(raw);
  if (!url || url.username || url.password) return null;
  const host = url.hostname.toLowerCase();
  const isGoogle = host === 'google.com' || host.endsWith('.google.com');
  const isMapsPath = url.pathname === '/maps' || url.pathname.startsWith('/maps/');
  const ok =
    host === 'maps.app.goo.gl' ||
    (host === 'goo.gl' && isMapsPath) ||
    (isGoogle && (isMapsPath || host === 'maps.google.com'));
  return ok ? `https://${host}${url.pathname}${url.search}` : null;
}

/**
 * Where "Get directions" goes: the saved Maps link when it is valid, otherwise a Google Maps search
 * for the name, address and city. Null when there is no link and no address to search for.
 */
export function directionsUrl(input: {
  mapsUrl?: string | null;
  directionsUrl?: string | null;
  name?: string | null;
  address?: string | null;
  city?: string | null;
}): string | null {
  const saved = mapsUrl(input.mapsUrl) ?? mapsUrl(input.directionsUrl);
  if (saved) return saved;
  const address = clean(input.address);
  const city = clean(input.city);
  if (!address && !city) return null;
  const query = [clean(input.name), address, city].filter(Boolean).join(' ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export interface StoredLinkTarget {
  href: string;
  /** What to show beside the icon: "@handle", the address without its scheme, or the platform name. */
  text: string;
}

const hostIs = (href: string, allowed: string[]) => {
  const host = new URL(href).hostname.toLowerCase();
  return allowed.some((name) => host === name || host.endsWith(`.${name}`));
};

/**
 * The link for one entry of the restaurant's saved links (`links[]`: instagram, facebook, youtube,
 * website, zomato, swiggy, custom), or null when the value is not a valid link for that type.
 */
export function storedLinkTarget(type: string, value?: string | null): StoredLinkTarget | null {
  switch (type) {
    case 'instagram': {
      const handle = instagramHandle(value);
      return handle ? { href: `https://www.instagram.com/${handle}/`, text: `@${handle}` } : null;
    }
    case 'facebook': {
      const href = facebookUrl(value);
      return href ? { href, text: websiteLabel(href) ?? 'Facebook' } : null;
    }
    case 'website':
    case 'custom': {
      const href = websiteUrl(value);
      return href ? { href, text: websiteLabel(href) ?? href } : null;
    }
    case 'youtube':
    case 'zomato':
    case 'swiggy': {
      const href = websiteUrl(value);
      const hosts = type === 'youtube' ? ['youtube.com', 'youtu.be'] : [`${type}.com`];
      if (!href || !hostIs(href, hosts)) return null;
      return { href, text: type === 'youtube' ? websiteLabel(href) ?? href : type === 'zomato' ? 'Zomato' : 'Swiggy' };
    }
    default:
      return null;
  }
}

/** The link an announcement banner points to: a web address or a WhatsApp number, nothing else. */
export function announcementHref(linkType?: string | null, linkTarget?: string | null): string | null {
  if (linkType === 'url') return websiteUrl(linkTarget);
  if (linkType === 'whatsapp') return whatsappUrl(linkTarget);
  return null;
}
