/**
 * MENUQR Platform Validation & Normalisation Engine (§3.5)
 * 
 * Server-authoritative normalisers and validators for restaurant profile facts,
 * social links, opening hours, phones, addresses, and regulatory identifiers.
 * Guaranteed parity with frontend src/utils/socialLinks.ts via profile-rules.json.
 */

const INSTAGRAM_HOSTS = new Set(['instagram.com', 'www.instagram.com', 'm.instagram.com', 'instagr.am', 'www.instagr.am']);
const INSTAGRAM_RESERVED = new Set([
  'p', 'reel', 'reels', 'tv', 'stories', 'explore', 'accounts', 'direct', 'about', 'legal', 'developer',
  'web', 'directory', 'privacy', 'press', 'api', 'challenge', 'oauth', 'emails', 'session', 'login',
  'download', 'topics', 'locations',
]);
const INSTAGRAM_HANDLE = /^(?!.*\.\.)[a-z0-9._]{1,30}$/;

const FACEBOOK_HOSTS = new Set(['facebook.com', 'www.facebook.com', 'm.facebook.com', 'web.facebook.com', 'fb.com', 'www.fb.com', 'fb.me']);
const FACEBOOK_BLOCKED = new Set(['sharer', 'sharer.php', 'share', 'share.php', 'dialog', 'login', 'login.php', 'plugins', 'tr', 'l.php', 'policies', 'help']);
const FACEBOOK_NAME = /^[A-Za-z0-9.\-]{5,50}$/;
const FACEBOOK_SEGMENT = /^[A-Za-z0-9._\-%]{1,120}$/;

const RESERVED_SLUGS = new Set([
  'admin', 'template-1', 'demo', 'api', 'login', 'app', 'qr', 'menu', 'menus',
  'dashboard', 'settings', 'auth', 'signup', 'webhook', 'health', 'public', 'static',
]);

/** Strips HTML tags, trims whitespace, removes zero-width characters, normalises to Unicode NFC. */
export function sanitizeText(val, maxLength = 255) {
  if (typeof val !== 'string') return '';
  return val
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // strip zero-width chars
    .normalize('NFC')
    .trim()
    .slice(0, maxLength);
}

/**
 * Normalises an Instagram input into a clean handle.
 * Accepts: @handle, handle, https://instagram.com/handle, https://instagr.am/handle
 * Rejects: /p/, /reel/, /stories/, /explore/, other hostnames, >30 chars, consecutive dots.
 */
export function normalizeInstagram(input) {
  if (!input || typeof input !== 'string') return null;
  const raw = sanitizeText(input);
  if (!raw) return null;

  let candidate = raw;
  const isUrlLike = /^(https?:\/\/|www\.|(m\.)?instagram\.com|instagr\.am)/i.test(raw);
  if (isUrlLike || raw.includes('instagram.com') || raw.includes('instagr.am')) {
    try {
      const urlStr = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
      const url = new URL(urlStr);
      const host = url.hostname.toLowerCase();
      if (!INSTAGRAM_HOSTS.has(host)) return null;

      const segments = url.pathname.split('/').filter(Boolean);
      if (segments.length === 0) return null;
      const first = segments[0].toLowerCase();
      if (INSTAGRAM_RESERVED.has(first)) return null;
      candidate = first;
    } catch {
      return null;
    }
  }

  const handle = candidate.replace(/^@+/, '').replace(/[/?#].*$/, '').toLowerCase();
  return INSTAGRAM_HANDLE.test(handle) ? handle : null;
}

/**
 * Normalises Facebook page URL or handle into canonical https://www.facebook.com/... format.
 */
export function normalizeFacebook(input) {
  if (!input || typeof input !== 'string') return null;
  const raw = sanitizeText(input);
  if (!raw) return null;

  const isUrlLike = /^(https?:\/\/|www\.|m\.|web\.|(facebook|fb)\.com|fb\.me)/i.test(raw);
  if (isUrlLike || raw.includes('facebook.com') || raw.includes('fb.me') || raw.includes('fb.com')) {
    try {
      const urlStr = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
      const url = new URL(urlStr);
      const host = url.hostname.toLowerCase();
      if (!FACEBOOK_HOSTS.has(host)) return null;

      const segments = url.pathname.split('/').filter(Boolean);
      if (segments.length === 0 || FACEBOOK_BLOCKED.has(segments[0].toLowerCase())) return null;

      if (segments[0].toLowerCase() === 'profile.php') {
        const id = url.searchParams.get('id') || '';
        return /^\d{5,20}$/.test(id) ? `https://www.facebook.com/profile.php?id=${id}` : null;
      }

      if (segments.every((segment) => FACEBOOK_SEGMENT.test(segment))) {
        return `https://www.facebook.com/${segments.join('/')}`;
      }
      return null;
    } catch {
      return null;
    }
  }

  const name = raw.replace(/^@+/, '');
  return FACEBOOK_NAME.test(name) ? `https://www.facebook.com/${name}` : null;
}

/**
 * Normalises YouTube channel or handle URL.
 */
export function normalizeYouTube(input) {
  if (!input || typeof input !== 'string') return null;
  const raw = sanitizeText(input);
  if (!raw) return null;

  try {
    const urlStr = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const url = new URL(urlStr);
    const host = url.hostname.toLowerCase();
    if (!host.endsWith('youtube.com') && !host.endsWith('youtu.be')) return null;
    if (url.pathname.includes('/watch') || host.endsWith('youtu.be')) return null;
    return url.origin + url.pathname;
  } catch {
    return null;
  }
}

/**
 * Normalises general website URL. Must be HTTPS, no IPs, no localhost, no credentials.
 */
export function normalizeWebsite(input) {
  if (!input || typeof input !== 'string') return null;
  const raw = sanitizeText(input);
  if (!raw || raw.length > 2048) return null;

  if (/^(javascript|data|vbscript|file|ftp|mailto|tel|blob):/i.test(raw) || (raw.includes('://') && !/^https?:\/\//i.test(raw))) {
    return null;
  }

  try {
    const urlStr = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const url = new URL(urlStr);
    if (url.username || url.password) return null;

    const host = url.hostname.toLowerCase();
    const isIpAddress = /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.startsWith('[');
    const isInternal = host === 'localhost' || /\.(localhost|local|internal|test|invalid|example)$/.test(host);
    if (!host.includes('.') || host.startsWith('.') || host.endsWith('.') || isIpAddress || isInternal) return null;
    if (host.split('.').some((label) => label.startsWith('xn--'))) return null;
    if (url.port && url.port !== '80' && url.port !== '443') return null;

    const path = url.pathname === '/' ? '' : url.pathname.replace(/\/+$/, '');
    return `https://${host}${path}${url.search}`;
  } catch {
    return null;
  }
}

/**
 * Normalises Google Maps link and extracts lat/lng if present in the URL.
 */
export function normalizeMapsUrl(input) {
  if (!input || typeof input !== 'string') return null;
  const str = sanitizeText(input);
  if (!str) return null;

  try {
    const urlStr = /^https?:\/\//i.test(str) ? str : `https://${str}`;
    const url = new URL(urlStr);
    const host = url.hostname.toLowerCase();
    const isGoogleMaps = host.endsWith('google.com') || host === 'maps.app.goo.gl' || host === 'goo.gl';
    if (!isGoogleMaps) return null;

    let lat = null;
    let lng = null;

    const match = url.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) {
      lat = parseFloat(match[1]);
      lng = parseFloat(match[2]);
    } else {
      const q = url.searchParams.get('q') || url.searchParams.get('ll');
      if (q) {
        const qm = q.match(/(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (qm) {
          lat = parseFloat(qm[1]);
          lng = parseFloat(qm[2]);
        }
      }
    }

    return { url: str, lat, lng };
  } catch {
    return null;
  }
}

/**
 * Normalises an Indian phone number to E.164 (+91XXXXXXXXXX) format.
 */
export function normalizePhoneNumber(input) {
  if (!input || typeof input !== 'string') return null;
  const raw = sanitizeText(input);
  if (!raw || /[a-zA-Z]/.test(raw)) return null;

  if (raw.startsWith('+') && !raw.startsWith('+91')) return null;

  const digits = raw.replace(/\D/g, '');

  // 10-digit mobile starting with 6, 7, 8, or 9
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return `+91${digits}`;
  }

  // 11-digit starting with 0
  if (digits.length === 11 && digits.startsWith('0') && /^[6-9]/.test(digits.slice(1))) {
    return `+91${digits.slice(1)}`;
  }

  // 12-digit starting with 91
  if (digits.length === 12 && digits.startsWith('91') && /^[6-9]/.test(digits.slice(2))) {
    return `+${digits}`;
  }

  // Toll-Free numbers (1800XXXXXXX or 1860XXXXXXX)
  if ((digits.startsWith('1800') || digits.startsWith('1860')) && (digits.length === 10 || digits.length === 11)) {
    return `+91${digits}`;
  }

  // Landline with explicit STD code (e.g. 011-23456789, 0120-4567890)
  if (raw.includes('-') || raw.startsWith('0')) {
    if (digits.length >= 9 && digits.length <= 11) {
      const rawDigits = digits.startsWith('0') ? digits.slice(1) : digits;
      return `+91${rawDigits}`;
    }
  }

  return null;
}

/**
 * Normalises and formats a phone field (possibly containing multiple numbers separated by commas,
 * slashes, or 'or') into formatted display string "+91 XXXXX XXXXX, ...".
 * Validates against profile-rules.json fixtures.
 */
export function normalizePhones(input) {
  if (input === null || input === undefined) return null;
  if (typeof input !== 'string') return null;
  const raw = sanitizeText(input);
  if (!raw) return null;

  const tokens = raw.split(/\s*(?:[,;]|\s\/\s|\sor\s|\s&\s)\s*/i).filter(Boolean);
  if (tokens.length === 0) return null;

  const seen = new Set();
  const formattedList = [];

  for (const token of tokens) {
    if (/[a-zA-Z]/.test(token)) return null; // Reject strings like "Shop 12"

    const digits = token.replace(/[^\d+]/g, '');
    if (!digits) return null;

    let national = '';
    if (digits.startsWith('+')) {
      if (!digits.startsWith('+91')) return null; // Foreign numbers rejected
      national = digits.slice(3);
    } else if (digits.startsWith('91') && digits.length === 12) {
      national = digits.slice(2);
    } else if (digits.startsWith('0')) {
      national = digits.slice(1);
    } else {
      national = digits;
    }

    let formatted = '';
    if (/^1(?:800|860)\d{6,7}$/.test(national)) {
      formatted = `${national.slice(0, 4)} ${national.slice(4)}`;
    } else if (/^\d{10}$/.test(national)) {
      formatted = `+91 ${national.slice(0, 5)} ${national.slice(5)}`;
    } else if (/^11\d{8}$/.test(national)) { // 011 Delhi STD
      formatted = `+91 ${national.slice(0, 5)} ${national.slice(5)}`;
    } else {
      return null;
    }

    if (!seen.has(formatted)) {
      seen.add(formatted);
      formattedList.push(formatted);
    }
  }

  if (formattedList.length === 0 || formattedList.length > 4) return null;
  return formattedList.join(', ');
}

/**
 * Normalises a menu slug.
 * Length 3-50, lowercase alphanumeric with single hyphens, no reserved words.
 */
export function normalizeSlug(input) {
  if (!input || typeof input !== 'string') return null;
  const raw = sanitizeText(input).toLowerCase();
  if (raw.length < 3 || raw.length > 50) return null;

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(raw)) return null;
  if (RESERVED_SLUGS.has(raw)) return null;

  return raw;
}

/**
 * Normalises an image URL (either /uploads/ relative path or https:// URL).
 * Rejects path traversal and insecure protocols.
 */
export function normalizeImageUrl(input) {
  if (input === null || input === undefined) return null;
  if (typeof input !== 'string') return null;
  const raw = sanitizeText(input);
  if (!raw) return null;

  if (/^(javascript|data|vbscript|file|ftp):/i.test(raw)) return null;

  if (raw.startsWith('/uploads/')) {
    if (raw.includes('..')) return null; // Path traversal
    if (/^\/uploads\/[A-Za-z0-9._\-\/]+$/.test(raw)) return raw;
    return null;
  }

  if (raw.startsWith('http://')) return null;

  if (raw.startsWith('https://')) {
    try {
      const url = new URL(raw);
      return url.href;
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Validates 6-digit Indian PIN code.
 */
export function validatePincode(pincode) {
  if (!pincode) return false;
  return /^[1-9][0-9]{5}$/.test(String(pincode).trim());
}

/**
 * Validates 14-digit FSSAI license number.
 */
export function validateFSSAI(fssai) {
  if (!fssai) return false;
  const clean = String(fssai).trim();
  if (!/^\d{14}$/.test(clean)) return false;
  if (/^(\d)\1{13}$/.test(clean)) return false;
  return true;
}

/**
 * Validates and normalises weekly opening hours.
 */
export function validateWeeklyHours(hours) {
  if (!hours || typeof hours !== 'object') return { weekly: {}, exceptions: [], lastOrderMinutes: 0 };

  const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const cleanedWeekly = {};

  for (const day of days) {
    const dayConfig = hours.weekly?.[day];
    if (!dayConfig || dayConfig.closed) {
      cleanedWeekly[day] = { closed: true, shifts: [] };
      continue;
    }

    const rawShifts = Array.isArray(dayConfig.shifts) ? dayConfig.shifts : [];
    const validShifts = [];

    for (const shift of rawShifts.slice(0, 3)) {
      const open = String(shift.open || '').trim();
      const close = String(shift.close || '').trim();
      const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

      if (timeRegex.test(open) && timeRegex.test(close)) {
        const [oH, oM] = open.split(':').map(Number);
        const [cH, cM] = close.split(':').map(Number);
        const openMin = oH * 60 + oM;
        const closeMin = cH * 60 + cM;
        const overnight = closeMin <= openMin;

        validShifts.push({ open, close, overnight });
      }
    }

    cleanedWeekly[day] = {
      closed: validShifts.length === 0,
      shifts: validShifts,
    };
  }

  const exceptions = Array.isArray(hours.exceptions)
    ? hours.exceptions.slice(0, 30).map((ex) => ({
        date: String(ex.date || '').slice(0, 10),
        closed: Boolean(ex.closed),
        note: sanitizeText(ex.note || '', 80),
        shifts: Array.isArray(ex.shifts) ? ex.shifts.slice(0, 3) : [],
      }))
    : [];

  return {
    weekly: cleanedWeekly,
    exceptions,
    lastOrderMinutes: Math.min(120, Math.max(0, Number(hours.lastOrderMinutes || 0))),
    note: sanitizeText(hours.note || '', 120),
  };
}

/**
 * Validates contacts array (§3.2 E). Up to 4 public numbers.
 */
export function validateContacts(contacts) {
  if (!Array.isArray(contacts)) return [];
  const cleaned = [];

  for (const c of contacts.slice(0, 4)) {
    const rawNumber = String(c.number || '').trim();
    const normalized = normalizePhoneNumber(rawNumber);
    if (!normalized) continue;

    cleaned.push({
      id: c.id || `c_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      label: sanitizeText(c.label || '', 24),
      kind: ['mobile', 'landline', 'toll_free'].includes(c.kind) ? c.kind : 'mobile',
      number: normalized,
      public: Boolean(c.public),
      whatsapp: Boolean(c.whatsapp),
      whatsappMessage: sanitizeText(c.whatsappMessage || '', 120),
      primary: Boolean(c.primary),
    });
  }

  if (cleaned.length > 0) {
    const primaryCount = cleaned.filter((c) => c.primary).length;
    if (primaryCount === 0) cleaned[0].primary = true;
    else if (primaryCount > 1) {
      let found = false;
      for (const c of cleaned) {
        if (c.primary && !found) found = true;
        else c.primary = false;
      }
    }
  }

  return cleaned;
}

/**
 * Validates links array (§3.2 F).
 */
export function validateLinks(links) {
  if (!Array.isArray(links)) return [];
  const cleaned = [];

  for (const l of links.slice(0, 8)) {
    const type = String(l.type || '').toLowerCase();
    const rawVal = String(l.value || '').trim();
    let normalized = null;

    if (type === 'instagram') normalized = normalizeInstagram(rawVal);
    else if (type === 'facebook') normalized = normalizeFacebook(rawVal);
    else if (type === 'youtube') normalized = normalizeYouTube(rawVal);
    else if (type === 'website') normalized = normalizeWebsite(rawVal);
    else if (type === 'zomato' || type === 'swiggy') {
      try {
        let u = rawVal;
        if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
        const parsed = new URL(u);
        if (parsed.hostname.includes(type)) normalized = parsed.origin + parsed.pathname;
      } catch {}
    } else if (type === 'custom') {
      normalized = normalizeWebsite(rawVal);
    }

    if (normalized) {
      cleaned.push({
        type,
        value: normalized,
        label: sanitizeText(l.label || '', 24),
        placements: {
          cover: l.placements?.cover !== false,
          about: l.placements?.about !== false,
          print: l.placements?.print !== false,
        },
        paused: Boolean(l.paused),
      });
    }
  }

  return cleaned;
}
