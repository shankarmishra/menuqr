/**
 * MENUQR Platform Validation & Normalisation Engine (§3.5)
 * 
 * Server-authoritative normalisers and validators for restaurant profile facts,
 * social links, opening hours, phones, addresses, and regulatory identifiers.
 */

/** Strips HTML tags, trims whitespace, removes zero-width characters, normalises to Unicode NFC. */
export function sanitizeText(val, maxLength = 255) {
  if (typeof val !== 'string') return '';
  return val
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/<[^>]*>/g, '') // strip scripts and HTML
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // strip zero-width chars
    .normalize('NFC')
    .trim()
    .slice(0, maxLength);
}

/**
 * Normalises an Instagram input into a clean handle.
 * Accepts: @handle, handle, https://instagram.com/handle, https://www.instagram.com/handle/?hl=en
 * Rejects: /p/, /reel/, /stories/, /explore/, other hostnames, >30 chars.
 */
export function normalizeInstagram(input) {
  if (!input || typeof input !== 'string') return null;
  let str = input.trim();
  if (!str) return null;

  // If a URL was pasted:
  if (str.includes('instagram.com')) {
    try {
      if (!/^https?:\/\//i.test(str)) str = 'https://' + str;
      const url = new URL(str);
      const host = url.hostname.toLowerCase();
      if (!host.endsWith('instagram.com')) return null;

      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length === 0) return null;
      const first = parts[0].toLowerCase();
      // Reject non-profile paths
      if (['p', 'reel', 'reels', 'stories', 'explore', 'accounts', 'direct'].includes(first)) {
        return null;
      }
      str = parts[0];
    } catch {
      return null;
    }
  }

  // Strip leading @
  str = str.replace(/^@+/, '').trim();
  // Valid Instagram handle: letters, numbers, periods, underscores, 1-30 chars
  if (!/^[A-Za-z0-9._]{1,30}$/.test(str)) return null;
  return str;
}

/**
 * Normalises Facebook page URL or handle.
 */
export function normalizeFacebook(input) {
  if (!input || typeof input !== 'string') return null;
  let str = input.trim();
  if (!str) return null;

  if (str.includes('facebook.com') || str.includes('fb.me') || str.includes('fb.com')) {
    try {
      if (!/^https?:\/\//i.test(str)) str = 'https://' + str;
      const url = new URL(str);
      const host = url.hostname.toLowerCase();
      const isDomain = (h, d) => h === d || h.endsWith('.' + d);
      if (!isDomain(host, 'facebook.com') && !isDomain(host, 'fb.me') && !isDomain(host, 'fb.com')) {
        return null;
      }
      return url.origin + url.pathname;
    } catch {
      return null;
    }
  }

  const clean = str.replace(/^@+/, '').trim();
  if (/^[A-Za-z0-9.]{3,50}$/.test(clean)) {
    return `https://www.facebook.com/${clean}`;
  }
  return null;
}

/**
 * Normalises YouTube channel or handle URL.
 */
export function normalizeYouTube(input) {
  if (!input || typeof input !== 'string') return null;
  let str = input.trim();
  if (!str) return null;

  try {
    if (!/^https?:\/\//i.test(str)) str = 'https://' + str;
    const url = new URL(str);
    const host = url.hostname.toLowerCase();
    if (!host.endsWith('youtube.com') && !host.endsWith('youtu.be')) return null;
    // Reject plain watch links
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
  let str = input.trim();
  if (!str) return null;

  try {
    if (!/^https?:\/\//i.test(str)) str = 'https://' + str;
    const url = new URL(str);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    // Disallow IP addresses and localhost
    const host = url.hostname.toLowerCase();
    if (host === 'localhost' || /^127\.|^10\.|^192\.168\.|^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)) {
      return null;
    }
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) return null;
    if (url.username || url.password) return null;
    // Always upgrade to HTTPS
    url.protocol = 'https:';
    return url.href;
  } catch {
    return null;
  }
}

/**
 * Normalises Google Maps link and extracts lat/lng if present in the URL.
 */
export function normalizeMapsUrl(input) {
  if (!input || typeof input !== 'string') return null;
  let str = input.trim();
  if (!str) return null;

  try {
    if (!/^https?:\/\//i.test(str)) str = 'https://' + str;
    const url = new URL(str);
    const host = url.hostname.toLowerCase();
    const isGoogleMaps = host.endsWith('google.com') || host === 'maps.app.goo.gl' || host === 'goo.gl';
    if (!isGoogleMaps) return null;

    let lat = null;
    let lng = null;

    // Check for @lat,lng,zoom pattern in pathname
    const match = url.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) {
      lat = parseFloat(match[1]);
      lng = parseFloat(match[2]);
    } else {
      // Check query params q=lat,lng or ll=lat,lng
      const q = url.searchParams.get('q') || url.searchParams.get('ll');
      if (q) {
        const qm = q.match(/(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (qm) {
          lat = parseFloat(qm[1]);
          lng = parseFloat(qm[2]);
        }
      }
    }

    return {
      url: str,
      lat,
      lng,
    };
  } catch {
    return null;
  }
}

/**
 * Normalises Indian phone number to E.164 (+91XXXXXXXXXX) format.
 * Supports mobile and landlines.
 */
export function normalizePhoneNumber(input) {
  if (!input || typeof input !== 'string') return null;
  const digits = input.replace(/\D/g, '');

  // 10-digit mobile starting with 6, 7, 8, or 9
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return `+91${digits}`;
  }

  // 11-digit starting with 0 (e.g. 09812345678)
  if (digits.length === 11 && digits.startsWith('0') && /^[6-9]/.test(digits.slice(1))) {
    return `+91${digits.slice(1)}`;
  }

  // 12-digit starting with 91
  if (digits.length === 12 && digits.startsWith('91') && /^[6-9]/.test(digits.slice(2))) {
    return `+${digits}`;
  }

  // Toll-Free numbers (1800XXXXXXX)
  if (digits.startsWith('1800') && (digits.length === 10 || digits.length === 11)) {
    return `+91${digits}`;
  }

  // Landline with explicit STD code (e.g. 011-23456789, 0120-4567890)
  if (input.includes('-') || input.trim().startsWith('0')) {
    if (digits.length >= 9 && digits.length <= 11) {
      const rawDigits = digits.startsWith('0') ? digits.slice(1) : digits;
      return `+91${rawDigits}`;
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
  // Reject numbers with all identical digits (e.g. 11111111111111)
  if (/^(\d)\1{13}$/.test(clean)) return false;
  return true;
}

/**
 * Validates and normalises weekly opening hours.
 * Expected shape:
 * {
 *   weekly: {
 *     mon: { closed: false, shifts: [{ open: "10:00", close: "23:00", overnight: false }] },
 *     ...
 *   },
 *   exceptions: [{ date: "2026-11-12", closed: true, note: "Diwali" }],
 *   lastOrderMinutes: 30,
 *   note: "string"
 * }
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

    for (const shift of rawShifts.slice(0, 3)) { // maximum 3 shifts
      const open = String(shift.open || '').trim();
      const close = String(shift.close || '').trim();
      const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

      if (timeRegex.test(open) && timeRegex.test(close)) {
        const [oH, oM] = open.split(':').map(Number);
        const [cH, cM] = close.split(':').map(Number);
        const openMin = oH * 60 + oM;
        const closeMin = cH * 60 + cM;
        const overnight = closeMin <= openMin; // runs past midnight

        validShifts.push({
          open,
          close,
          overnight,
        });
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

  // Ensure at most one primary, default first to primary if none set
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
