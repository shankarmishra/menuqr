/**
 * Turns the free-text contact values that live on the legacy `clients` row into the structured
 * shapes of the canonical profile (`restaurant_profiles.contacts` / `.links`).
 *
 * One place on purpose: the backfill, the profile service (first-time initialisation) and the
 * owner-facing fallback all read legacy values through these functions, so a value that is
 * understood in one of them is understood in all of them.
 *
 * Nothing here ever invents data. A value that cannot be understood is reported in `unparsed`
 * and left out of the structured list; the legacy column itself is never touched, and the public
 * menu keeps showing it (see `resolvePublicPhone` in publicMenuPayload.js).
 */

import {
  normalizeInstagram,
  normalizeFacebook,
  normalizeWebsite,
  normalizePhoneNumber,
} from './validation.js';

/** The profile holds at most this many contacts (same cap as validateContacts). */
export const MAX_CONTACTS = 4;

// Owners put several numbers in one field in many ways: "98.. , 97..", "98.. / 011-..", "a; b",
// "a & b", "a or b", "a and b", or one per line.
const PHONE_SEPARATORS = /\s*(?:[,;/&|\r\n]+|\s(?:or|and)\s)\s*/i;

/**
 * Splits one legacy phone field into normalised numbers.
 * The whole field is tried first so a single number that merely contains a separator character
 * (for example "0120/4567890") is not torn apart.
 *
 * @returns {{ numbers: string[], unparsed: string[] }} `numbers` are E.164 (+91...), de-duplicated,
 *   in the owner's order; `unparsed` are the pieces that were not a valid phone number.
 */
export function parsePhoneField(raw) {
  const text = typeof raw === 'string' ? raw.trim() : '';
  if (!text) return { numbers: [], unparsed: [] };

  const whole = normalizePhoneNumber(text);
  if (whole) return { numbers: [whole], unparsed: [] };

  const numbers = [];
  const unparsed = [];
  for (const piece of text.split(PHONE_SEPARATORS).map((p) => p.trim()).filter(Boolean)) {
    const normalised = normalizePhoneNumber(piece);
    if (!normalised) {
      unparsed.push(piece);
    } else if (!numbers.includes(normalised)) {
      numbers.push(normalised);
    }
  }
  if (numbers.length > MAX_CONTACTS) {
    unparsed.push(...numbers.slice(MAX_CONTACTS));
    numbers.length = MAX_CONTACTS;
  }
  return { numbers, unparsed };
}

function contactKind(number) {
  if (/^\+91[6-9]\d{9}$/.test(number)) return 'mobile';
  if (/^\+911800/.test(number)) return 'toll_free';
  return 'landline';
}

/**
 * Builds the public contact list for a legacy phone field. Today every legacy number is shown on
 * the public menu, so every migrated number is public; the first one is the primary.
 * Labels stay empty and WhatsApp stays off: the legacy row says neither, and a menu must not
 * claim what the owner never said.
 *
 * @returns {{ contacts: object[], unparsed: string[] }}
 */
export function contactsFromLegacyPhone(rawPhone) {
  const { numbers, unparsed } = parsePhoneField(rawPhone);
  const contacts = numbers.map((number, index) => ({
    id: `phone_${index + 1}`,
    label: '',
    kind: contactKind(number),
    number,
    public: true,
    whatsapp: false,
    whatsappMessage: '',
    primary: index === 0,
  }));
  return { contacts, unparsed };
}

/**
 * Builds the link list from the legacy social columns. Placements match what the blueprint
 * defaults to (Instagram on the cover; website and Facebook only in the Info sheet and print).
 * Values that do not parse are listed in `unparsed` and are NOT dropped from the public menu:
 * the payload falls back to the legacy column for any link the profile does not hold.
 *
 * @returns {{ links: object[], unparsed: string[] }}
 */
export function linksFromLegacyClient(client) {
  const links = [];
  const unparsed = [];
  const add = (type, raw, normalise, cover) => {
    if (!raw || typeof raw !== 'string' || !raw.trim()) return;
    const value = normalise(raw);
    if (!value) {
      unparsed.push(`${type}: ${raw.trim()}`);
      return;
    }
    links.push({ type, value, label: '', placements: { cover, about: true, print: true }, paused: false });
  };
  add('instagram', client?.instagram, normalizeInstagram, true);
  add('facebook', client?.facebook, normalizeFacebook, false);
  add('website', client?.website, normalizeWebsite, false);
  return { links, unparsed };
}
