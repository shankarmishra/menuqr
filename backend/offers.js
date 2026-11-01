/**
 * Validation and plan limits for the owner's promotional offers and announcement banner.
 * Pure functions: the routes do the database work (ownership checks, counting active offers).
 */

import { apiError } from './utils.js';
import { sanitizeText, normalizeWebsite, normalizePhoneNumber } from './validation.js';

/** Active offers a restaurant may have at the same time (Blueprint 5.10). Inactive offers are free. */
export const ACTIVE_OFFER_LIMITS = Object.freeze({ BASIC: 1, INTERMEDIATE: 5, PREMIUM: 10 });

export function activeOfferLimit(planId) {
  return ACTIVE_OFFER_LIMITS[String(planId || 'BASIC').toUpperCase()] ?? ACTIVE_OFFER_LIMITS.BASIC;
}

export const OFFER_TITLE_MAX = 40;
export const OFFER_DETAILS_MAX = 160;
export const OFFER_PRICE_TEXT_MAX = 30;
export const OFFER_ITEMS_MAX = 30;

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function isRealDate(value) {
  if (!DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

/** A string field with a hard length limit: too long is an error (never silently cut). */
function limitedText(value, max, label, { required = false } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) throw apiError(400, `${label} is required.`);
    return '';
  }
  if (typeof value !== 'string') throw apiError(400, `${label} must be text.`);
  const clean = sanitizeText(value, Number.MAX_SAFE_INTEGER);
  if (required && !clean) throw apiError(400, `${label} is required.`);
  if (clean.length > max) throw apiError(400, `${label} must be ${max} characters or fewer.`);
  return clean;
}

/** Normalises an offer schedule: {days?:0-6[], timeStart?, timeEnd?, dateStart?, dateEnd?}. Unknown keys are dropped. */
export function validateOfferSchedule(schedule) {
  if (schedule === undefined || schedule === null) return {};
  if (typeof schedule !== 'object' || Array.isArray(schedule)) throw apiError(400, 'Offer schedule must be an object.');
  const clean = {};

  if (schedule.days !== undefined && schedule.days !== null) {
    if (!Array.isArray(schedule.days) || schedule.days.length > 7 || !schedule.days.every((d) => Number.isInteger(d) && d >= 0 && d <= 6)) {
      throw apiError(400, 'Offer days must be a list of weekdays from 0 (Sunday) to 6 (Saturday).');
    }
    clean.days = [...new Set(schedule.days)].sort((a, b) => a - b);
  }

  const hasStart = schedule.timeStart !== undefined && schedule.timeStart !== null && schedule.timeStart !== '';
  const hasEnd = schedule.timeEnd !== undefined && schedule.timeEnd !== null && schedule.timeEnd !== '';
  if (hasStart !== hasEnd) throw apiError(400, 'Set both a start time and an end time, or neither.');
  if (hasStart) {
    if (!TIME.test(String(schedule.timeStart)) || !TIME.test(String(schedule.timeEnd))) {
      throw apiError(400, 'Offer times must look like 12:00 or 23:30.');
    }
    clean.timeStart = String(schedule.timeStart);
    clean.timeEnd = String(schedule.timeEnd);
  }

  for (const key of ['dateStart', 'dateEnd']) {
    const value = schedule[key];
    if (value === undefined || value === null || value === '') continue;
    if (typeof value !== 'string' || !isRealDate(value)) throw apiError(400, 'Offer dates must look like 2026-11-12.');
    clean[key] = value;
  }
  if (clean.dateStart && clean.dateEnd && clean.dateStart > clean.dateEnd) {
    throw apiError(400, 'The offer cannot end before it starts.');
  }
  return clean;
}

/**
 * Validates an owner's offer. Returns the cleaned fields; throws a 400 apiError otherwise.
 * `itemIds` and `mediaId` are only checked for shape here: the route verifies that they belong
 * to the tenant.
 */
export function validateOfferInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw apiError(400, 'Offer details are required.');

  const title = limitedText(input.title, OFFER_TITLE_MAX, 'Offer title', { required: true });
  const details = limitedText(input.details, OFFER_DETAILS_MAX, 'Offer details');
  const priceText = limitedText(input.priceText, OFFER_PRICE_TEXT_MAX, 'Offer price text');
  const schedule = validateOfferSchedule(input.schedule);

  let itemIds = [];
  if (input.itemIds !== undefined && input.itemIds !== null) {
    if (!Array.isArray(input.itemIds) || input.itemIds.length > OFFER_ITEMS_MAX
      || !input.itemIds.every((id) => typeof id === 'string' && id.length > 0 && id.length <= 255)) {
      throw apiError(400, `Choose up to ${OFFER_ITEMS_MAX} dishes for an offer.`);
    }
    itemIds = [...new Set(input.itemIds)];
  }

  let mediaId = null;
  if (input.mediaId !== undefined && input.mediaId !== null && input.mediaId !== '') {
    if (typeof input.mediaId !== 'string' || input.mediaId.length > 255) throw apiError(400, 'Offer photo is not valid.');
    mediaId = input.mediaId;
  }

  if (input.isActive !== undefined && typeof input.isActive !== 'boolean') throw apiError(400, 'isActive must be true or false.');
  const isActive = input.isActive !== false;

  const i18n = {};
  const hi = input.i18n && typeof input.i18n === 'object' ? input.i18n.hi : null;
  if (hi && typeof hi === 'object') {
    const hiTitle = sanitizeText(typeof hi.title === 'string' ? hi.title : '', OFFER_TITLE_MAX);
    const hiDetails = sanitizeText(typeof hi.details === 'string' ? hi.details : '', OFFER_DETAILS_MAX);
    if (hiTitle || hiDetails) i18n.hi = { ...(hiTitle ? { title: hiTitle } : {}), ...(hiDetails ? { details: hiDetails } : {}) };
  }

  return { title, details, priceText, schedule, itemIds, mediaId, isActive, i18n };
}

export const ANNOUNCEMENT_TEXT_MAX = 120;
export const ANNOUNCEMENT_LINK_TYPES = ['none', 'category', 'url', 'whatsapp'];

function optionalTimestamp(value, label) {
  if (value === undefined || value === null || value === '') return null;
  const parsed = new Date(value);
  if (typeof value !== 'string' || Number.isNaN(parsed.getTime())) throw apiError(400, `${label} is not a valid date.`);
  return parsed.toISOString();
}

/**
 * Validates an announcement banner. The link target is shown to every diner as a link, so it is
 * checked per type: a website must be https, a WhatsApp target a phone number, a category plain
 * text. Anything else (for example a javascript: URL) is refused.
 */
export function validateAnnouncementInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw apiError(400, 'Announcement details are required.');
  const text = limitedText(input.text, ANNOUNCEMENT_TEXT_MAX, 'Announcement text', { required: true });

  const linkType = input.linkType === undefined || input.linkType === null || input.linkType === '' ? 'none' : String(input.linkType);
  if (!ANNOUNCEMENT_LINK_TYPES.includes(linkType)) throw apiError(400, 'Announcement link type is not valid.');
  let linkTarget = null;
  if (linkType !== 'none') {
    const raw = typeof input.linkTarget === 'string' ? input.linkTarget.trim() : '';
    if (!raw) throw apiError(400, 'Announcement link needs a target.');
    if (linkType === 'url') linkTarget = normalizeWebsite(raw);
    else if (linkType === 'whatsapp') linkTarget = normalizePhoneNumber(raw);
    else linkTarget = sanitizeText(raw, 100) || null;
    if (!linkTarget) throw apiError(400, 'Announcement link target is not valid.');
  }

  const startsAt = optionalTimestamp(input.startsAt, 'Start date');
  const endsAt = optionalTimestamp(input.endsAt, 'End date');
  if (startsAt && endsAt && startsAt > endsAt) throw apiError(400, 'The announcement cannot end before it starts.');

  if (input.isActive !== undefined && typeof input.isActive !== 'boolean') throw apiError(400, 'isActive must be true or false.');

  const i18n = {};
  const hiText = input.i18n && typeof input.i18n === 'object' && input.i18n.hi && typeof input.i18n.hi.text === 'string'
    ? sanitizeText(input.i18n.hi.text, ANNOUNCEMENT_TEXT_MAX)
    : '';
  if (hiText) i18n.hi = { text: hiText };

  return { text, linkType, linkTarget, startsAt, endsAt, isActive: input.isActive !== false, i18n };
}
