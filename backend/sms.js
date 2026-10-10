import { apiError } from './utils.js';

export function normalizePhone(rawPhone) {
  if (!rawPhone || typeof rawPhone !== 'string') return '';
  let cleaned = rawPhone.replace(/[^\d+]/g, '');
  if (!cleaned) return '';
  // If 10 digits without leading +, default to Indian E.164 format (+91)
  if (/^\d{10}$/.test(cleaned)) {
    cleaned = `+91${cleaned}`;
  } else if (!cleaned.startsWith('+') && cleaned.length > 10) {
    cleaned = `+${cleaned}`;
  }
  return cleaned;
}

export function isValidPhone(phone) {
  const normalized = normalizePhone(phone);
  // Valid E.164: + followed by 10 to 15 digits
  return /^\+[1-9]\d{9,14}$/.test(normalized);
}

/**
 * Pluggable SMS Sender (Disabled for Email-Only Verification)
 */
export async function sendSmsMessage({ phone, message }) {
  return { ok: false, error: 'SMS API delivery is disabled. Account verification is handled via Email.' };
}

export async function requestPhoneOtp(rawPhone, ipAddress = '') {
  throw apiError(400, 'SMS OTP verification is disabled. Please verify your account using Email verification.');
}

export async function verifyPhoneOtp(rawPhone, otp, ipAddress = '') {
  throw apiError(400, 'SMS OTP verification is disabled. Please verify your account using Email verification.');
}
