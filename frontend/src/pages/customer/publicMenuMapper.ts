import type { ItemTags } from '../../components/menu-renderer/types';
import type { ClientCategory, MenuDietType, MenuItemRecord, PublicMenuRecord, ResolvedMenuFeatures } from '../admin/clientStore';
import { isPlaceholderMenu } from '../../utils/menuPlaceholder.ts';
import { normalizeHoursExceptions, normalizeLastOrderMinutes, normalizeWeeklyHours } from '../../utils/openingHours.ts';
import type {
  DietDeclaration,
  PublicAnnouncement,
  PublicContact,
  PublicLink,
  PublicMaps,
  PublicOffer,
  PublicProfileFields,
  PublicReservations,
} from './publicProfileTypes';

/**
 * Turns the answer of GET /api/public/menus/:slug (or /api/public/qr/:id) into the record the menu
 * page renders. Kept in a plain module, apart from clientStore, so it can be unit tested.
 *
 * Two generations of backend answer this call:
 * - the live one sends a flat restaurant block (name, phone, address, instagram, ...) and no
 *   profile fields at all; it must map exactly as it always has, and the new keys are then absent;
 * - the new one adds the canonical profile (`weeklyHours`, `contacts`, `links`, `maps`, `story`, ...),
 *   `announcement`, `offers` and `orderingSettings`.
 * Anything missing, empty or malformed is left out rather than replaced by a default, so the page
 * never shows a value the owner did not enter.
 */

/** Raw shape returned by GET /api/public/menus/:slug. */
export interface RawPublicMenuApiResponse {
  isExpired?: boolean;
  menuSlug?: string;
  redirectToSlug?: string;
  serverNow?: string;
  restaurant: {
    name: string;
    tagline?: string;
    category?: string;
    phone?: string | null;
    address?: string;
    city?: string;
    logo?: string;
    state?: string;
    website?: string | null;
    openingHours?: string | null;
    instagram?: string | null;
    facebook?: string | null;
    cuisine?: string | null;
    // Canonical profile (new backend only). Typed loosely on purpose: it is parsed, not trusted.
    pincode?: unknown;
    landmark?: unknown;
    cuisineTags?: unknown;
    weeklyHours?: unknown;
    hoursExceptions?: unknown;
    lastOrderMinutes?: unknown;
    story?: unknown;
    establishedYear?: unknown;
    dietDeclaration?: unknown;
    highlights?: unknown;
    payments?: unknown;
    priceNote?: unknown;
    serviceChargeNote?: unknown;
    fssai?: unknown;
    maps?: unknown;
    contacts?: unknown;
    links?: unknown;
    reservations?: unknown;
    i18n?: unknown;
  };
  plan: string;
  orderingEnabled?: boolean;
  templateId?: string;
  accentConfiguration?: unknown;
  menuFeatures?: ResolvedMenuFeatures;
  theme?: unknown;
  googleReviews?: {
    enabled: boolean;
    reviewUrl?: string;
  };
  orderingSettings?: PublicMenuRecord['orderingSettings'];
  announcement?: unknown;
  offers?: unknown;
  categories: Array<{ id: string; name: string; order: number }>;
  items: Array<{
    id: string;
    name: string;
    description?: string;
    price: number;
    halfPrice?: number | null;
    fullPrice?: number | null;
    pricingType?: string;
    category: string;
    dietType: 'veg' | 'non-veg' | 'vegan';
    available: boolean;
    image?: string;
    focalX?: number | null;
    focalY?: number | null;
    tags?: ItemTags | null;
    soldOut?: boolean;
    availabilityNote?: string | null;
    variants?: Array<{ id?: string; name: string; price: number; variantGroup?: string }>;
    trending?: boolean;
    translations?: Record<string, { name?: string; description?: string }> | null;
  }>;
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function plainObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function textList(value: unknown, limit = 30): string[] {
  if (!Array.isArray(value)) return [];
  const list: string[] = [];
  for (const entry of value) {
    const item = text(entry);
    if (item && !list.includes(item)) list.push(item);
    if (list.length >= limit) break;
  }
  return list;
}

function mapContacts(value: unknown): PublicContact[] {
  if (!Array.isArray(value)) return [];
  const contacts: PublicContact[] = [];
  for (const entry of value) {
    const contact = plainObject(entry);
    if (!contact) continue;
    // A number the owner keeps private must never reach a diner, whatever the server sent.
    if (contact.public === false) continue;
    const number = text(contact.number);
    if (!number) continue;
    const id = text(contact.id);
    const display = text(contact.display);
    contacts.push({
      ...(id ? { id } : {}),
      label: text(contact.label),
      kind: text(contact.kind) || 'mobile',
      number,
      ...(display ? { display } : {}),
      whatsapp: contact.whatsapp === true,
      whatsappMessage: text(contact.whatsappMessage),
      primary: contact.primary === true,
    });
  }
  // The primary number first; otherwise the owner's order.
  return contacts
    .map((contact, index) => ({ contact, index }))
    .sort((a, b) => Number(b.contact.primary) - Number(a.contact.primary) || a.index - b.index)
    .map(({ contact }) => contact);
}

function mapLinks(value: unknown): PublicLink[] {
  if (!Array.isArray(value)) return [];
  const links: PublicLink[] = [];
  for (const entry of value) {
    const link = plainObject(entry);
    if (!link || link.paused === true) continue;
    const type = text(link.type).toLowerCase();
    const linkValue = text(link.value);
    if (!type || !linkValue) continue;
    if (links.some((existing) => existing.type === type && existing.value === linkValue)) continue;
    const placements = plainObject(link.placements);
    links.push({
      type,
      value: linkValue,
      label: text(link.label),
      ...(placements
        ? {
            placements: {
              ...(typeof placements.cover === 'boolean' ? { cover: placements.cover } : {}),
              ...(typeof placements.about === 'boolean' ? { about: placements.about } : {}),
              ...(typeof placements.print === 'boolean' ? { print: placements.print } : {}),
            },
          }
        : {}),
    });
  }
  return links;
}

function mapMaps(value: unknown): PublicMaps | undefined {
  const maps = plainObject(value);
  if (!maps) return undefined;
  const url = text(maps.url);
  const directionsUrl = text(maps.directionsUrl);
  if (!url && !directionsUrl) return undefined;
  const lat = typeof maps.lat === 'number' && Number.isFinite(maps.lat) ? maps.lat : undefined;
  const lng = typeof maps.lng === 'number' && Number.isFinite(maps.lng) ? maps.lng : undefined;
  return {
    ...(url ? { url } : {}),
    ...(directionsUrl ? { directionsUrl } : {}),
    ...(lat !== undefined && lng !== undefined ? { lat, lng } : {}),
  };
}

function mapReservations(value: unknown): PublicReservations | undefined {
  const reservations = plainObject(value);
  const mode = reservations ? text(reservations.mode) : '';
  if (mode !== 'call' && mode !== 'whatsapp' && mode !== 'link') return undefined;
  const url = text(reservations?.url);
  return { mode, ...(url ? { url } : {}) };
}

function mapDiet(value: unknown): DietDeclaration | undefined {
  return value === 'PURE_VEG' || value === 'VEG_AND_NON_VEG' ? value : undefined;
}

/** The canonical profile fields, with only the ones that carry something. */
function mapProfile(restaurant: RawPublicMenuApiResponse['restaurant']): PublicProfileFields {
  const profile: PublicProfileFields = {};

  const story = text(restaurant.story);
  if (story) profile.story = story;
  const year = restaurant.establishedYear;
  if (typeof year === 'number' && Number.isInteger(year) && year >= 1800 && year <= 2100) profile.establishedYear = year;
  const diet = mapDiet(restaurant.dietDeclaration);
  if (diet) profile.dietDeclaration = diet;
  const highlights = textList(restaurant.highlights, 16);
  if (highlights.length > 0) profile.highlights = highlights;
  const payments = textList(restaurant.payments, 8);
  if (payments.length > 0) profile.payments = payments;
  const priceNote = text(restaurant.priceNote);
  if (priceNote) profile.priceNote = priceNote;
  const serviceChargeNote = text(restaurant.serviceChargeNote);
  if (serviceChargeNote) profile.serviceChargeNote = serviceChargeNote;
  const fssai = text(restaurant.fssai);
  if (fssai) profile.fssai = fssai;

  const maps = mapMaps(restaurant.maps);
  if (maps) profile.maps = maps;
  const contacts = mapContacts(restaurant.contacts);
  if (contacts.length > 0) profile.contacts = contacts;
  const links = mapLinks(restaurant.links);
  if (links.length > 0) profile.links = links;
  const reservations = mapReservations(restaurant.reservations);
  if (reservations) profile.reservations = reservations;

  const weeklyHours = normalizeWeeklyHours(restaurant.weeklyHours);
  if (weeklyHours) profile.weeklyHours = weeklyHours;
  const exceptions = normalizeHoursExceptions(restaurant.hoursExceptions);
  if (exceptions.length > 0) profile.hoursExceptions = exceptions;
  const lastOrderMinutes = normalizeLastOrderMinutes(restaurant.lastOrderMinutes);
  if (lastOrderMinutes !== undefined) profile.lastOrderMinutes = lastOrderMinutes;

  const i18n = plainObject(restaurant.i18n);
  if (i18n && Object.keys(i18n).length > 0) profile.i18n = i18n;
  const pincode = text(restaurant.pincode);
  if (/^[1-9]\d{5}$/.test(pincode)) profile.pincode = pincode;
  const landmark = text(restaurant.landmark);
  if (landmark) profile.landmark = landmark;
  const cuisineTags = textList(restaurant.cuisineTags, 8);
  if (cuisineTags.length > 0) profile.cuisineTags = cuisineTags;
  return profile;
}

function mapAnnouncement(value: unknown): PublicAnnouncement | undefined {
  const announcement = plainObject(value);
  const announcementText = text(announcement?.text);
  if (!announcement || !announcementText) return undefined;
  const linkType = text(announcement.linkType);
  const linkTarget = text(announcement.linkTarget);
  const i18n = plainObject(announcement.i18n);
  return {
    text: announcementText,
    ...(linkType ? { linkType } : {}),
    ...(linkTarget ? { linkTarget } : {}),
    ...(i18n && Object.keys(i18n).length > 0 ? { i18n } : {}),
  };
}

function mapOffers(value: unknown): PublicOffer[] {
  if (!Array.isArray(value)) return [];
  const offers: PublicOffer[] = [];
  value.forEach((entry, index) => {
    const offer = plainObject(entry);
    const title = text(offer?.title);
    if (!offer || !title) return;
    offers.push({
      id: text(offer.id) || `offer-${index}`,
      title,
      details: text(offer.details),
      priceText: text(offer.priceText),
      schedule: offer.schedule ?? null,
      itemIds: textList(offer.itemIds, 12),
      mediaId: text(offer.mediaId) || null,
      i18n: plainObject(offer.i18n) ?? {},
    });
  });
  return offers;
}

export function mapPublicMenu(raw: RawPublicMenuApiResponse): PublicMenuRecord {
  if (!raw || typeof raw !== 'object' || !raw.restaurant || typeof raw.restaurant !== 'object') {
    throw new Error('MENU_PAYLOAD_INVALID');
  }
  const rawItems = Array.isArray(raw.items) ? raw.items : [];
  const rawCategories = Array.isArray(raw.categories) ? raw.categories : [];
  // An old backend invents dishes for an empty menu; such a menu is shown as empty (see isPlaceholderMenu).
  const placeholder = isPlaceholderMenu(rawItems, rawCategories);
  const menuItems: MenuItemRecord[] = (placeholder ? [] : rawItems).map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description ?? '',
    price: String(item.price),
    pricingType: (item.pricingType as MenuItemRecord['pricingType']) || (item.variants && item.variants.length > 0 ? 'variants' : (item.halfPrice || item.fullPrice ? 'half-full' : 'single')),
    halfPrice: item.halfPrice !== undefined && item.halfPrice !== null ? String(item.halfPrice) : '',
    fullPrice: item.fullPrice !== undefined && item.fullPrice !== null ? String(item.fullPrice) : '',
    regPrice: '',
    medPrice: '',
    largePrice: '',
    category: item.category,
    dietType: (item.dietType ?? 'veg') as MenuDietType,
    image: item.image ?? '',
    focalX: item.focalX ?? null,
    focalY: item.focalY ?? null,
    tags: item.tags ?? null,
    soldOut: item.soldOut ?? false,
    availabilityNote: item.availabilityNote ?? null,
    available: item.available,
    variants: item.variants,
    trending: item.trending,
    translations: item.translations ?? null,
  }));

  const record: PublicMenuRecord = {
    businessName: raw.restaurant.name,
    tagline: raw.restaurant.tagline ?? '',
    logoUrl: raw.restaurant.logo || undefined,
    category: (raw.restaurant.category ?? 'restaurants') as ClientCategory,
    phone: raw.restaurant.phone ?? '',
    address: raw.restaurant.address ?? '',
    city: raw.restaurant.city ?? '',
    state: raw.restaurant.state || '',
    website: raw.restaurant.website || '',
    openingHours: raw.restaurant.openingHours || '',
    instagram: raw.restaurant.instagram || undefined,
    facebook: raw.restaurant.facebook || undefined,
    cuisine: raw.restaurant.cuisine || undefined,
    services: [],
    heroImage: undefined,
    categories: placeholder ? [] : rawCategories,
    menuItems,
    plan: raw.plan,
    orderingEnabled: raw.orderingEnabled,
    templateId: raw.templateId,
    accentConfiguration: raw.accentConfiguration,
    menuFeatures: raw.menuFeatures,
    theme: raw.theme,
    googleReviews: raw.googleReviews,
    orderingSettings: raw.orderingSettings,
  };

  // Everything below exists only on the new backend; a legacy answer adds no keys at all.
  Object.assign(record, mapProfile(raw.restaurant));
  const announcement = mapAnnouncement(raw.announcement);
  if (announcement) record.announcement = announcement;
  const offers = mapOffers(raw.offers);
  if (offers.length > 0) record.offers = offers;
  if (Number.isFinite(Date.parse(text(raw.serverNow)))) record.serverNow = text(raw.serverNow);
  const redirectToSlug = text(raw.redirectToSlug);
  if (redirectToSlug) record.redirectToSlug = redirectToSlug;
  return record;
}
