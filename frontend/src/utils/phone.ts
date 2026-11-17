// Phone numbers in restaurant settings: a country code plus the local number, stored as one value.
// Indian mobiles are saved as +91XXXXXXXXXX; Indian landlines and toll-free numbers are saved as
// typed (the server understands STD codes); other countries are accepted for mobiles only, in
// E.164 form. The server applies the same rules (backend/validation.js).

export const COUNTRY_CODES = [
  { code: '91', label: 'India (+91)' },
  { code: '971', label: 'UAE (+971)' },
  { code: '977', label: 'Nepal (+977)' },
  { code: '880', label: 'Bangladesh (+880)' },
  { code: '94', label: 'Sri Lanka (+94)' },
  { code: '65', label: 'Singapore (+65)' },
  { code: '44', label: 'United Kingdom (+44)' },
  { code: '1', label: 'USA / Canada (+1)' },
  { code: '61', label: 'Australia (+61)' },
] as const;

export type PhoneKind = 'mobile' | 'landline' | 'toll_free';

/** Splits a stored number into country code and local part for editing. */
export function splitPhone(stored: string): { code: string; local: string } {
  const value = String(stored || '').trim();
  if (value.startsWith('+')) {
    const digits = value.slice(1).replace(/\D/g, '');
    const match = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length).find((c) => digits.startsWith(c.code));
    if (match) return { code: match.code, local: digits.slice(match.code.length) };
  }
  return { code: '91', local: value.replace(/^\+?91(?=\d{10}$)/, '') };
}

/** Joins a country code and local number into the stored value. */
export function joinPhone(code: string, local: string, kind: PhoneKind = 'mobile'): string {
  const digits = String(local || '').replace(/\D/g, '');
  if (!digits) return '';
  if (code === '91') {
    if (kind === 'mobile') return `+91${digits.replace(/^0/, '')}`;
    return String(local).trim();
  }
  return `+${code}${digits.replace(/^0+/, '')}`;
}

/** Returns null when the number is valid (or empty), otherwise a message for the owner. */
export function phoneError(code: string, local: string, kind: PhoneKind = 'mobile'): string | null {
  const digits = String(local || '').replace(/\D/g, '');
  if (!digits) return null;
  if (code === '91') {
    if (kind === 'mobile') {
      const d = digits.replace(/^0/, '');
      if (d.length !== 10) return 'An Indian mobile number has 10 digits.';
      if (!/^[6-9]/.test(d)) return 'An Indian mobile number starts with 6, 7, 8 or 9.';
      return null;
    }
    if (kind === 'toll_free') {
      return /^18[06]0\d{6,7}$/.test(digits) ? null : 'A toll-free number starts with 1800 or 1860.';
    }
    return digits.length >= 9 && digits.length <= 11 ? null : 'Enter the landline with its STD code, for example 011-23456789.';
  }
  if (kind !== 'mobile') return 'Numbers outside India can only be added as mobile numbers.';
  const total = code.length + digits.replace(/^0+/, '').length;
  return total >= 8 && total <= 15 ? null : 'This number is too short or too long for that country.';
}

/** wa.me link for a stored number, or null when it cannot receive WhatsApp. */
export function whatsAppLink(stored: string, message = ''): string | null {
  const value = String(stored || '').trim();
  let digits = value.replace(/\D/g, '');
  if (!value.startsWith('+')) {
    if (digits.length === 10 && /^[6-9]/.test(digits)) digits = `91${digits}`;
    else return null;
  }
  if (digits.length < 8 || digits.length > 15 || /^91(1800|1860)/.test(digits)) return null;
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}
