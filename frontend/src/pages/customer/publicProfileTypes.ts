import type { HoursException, WeeklyHours } from '../../utils/openingHours';

/**
 * The canonical restaurant profile fields of the public menu payload (blueprint section 9.2), after
 * `publicMenuMapper` has checked them. Every field is optional: an older backend sends none of them,
 * and a restaurant only has the ones its owner filled in.
 */

export interface PublicContact {
  id?: string;
  label: string;
  kind: string;
  /** Stored form, normally "+919548089761". */
  number: string;
  /** As it should be read, when the server provides it. */
  display?: string;
  whatsapp: boolean;
  whatsappMessage: string;
  primary: boolean;
}

export interface PublicLink {
  /** instagram, facebook, youtube, website, zomato, swiggy or custom. */
  type: string;
  value: string;
  label: string;
  placements?: { cover?: boolean; about?: boolean; print?: boolean };
}

export interface PublicMaps {
  url?: string;
  directionsUrl?: string;
  lat?: number;
  lng?: number;
}

export interface PublicReservations {
  mode: 'call' | 'whatsapp' | 'link';
  url?: string;
}

export interface PublicOffer {
  id: string;
  title: string;
  details: string;
  priceText: string;
  /** Days, times and dates as the owner saved them; not interpreted by the page. */
  schedule: unknown;
  itemIds: string[];
  mediaId: string | null;
  i18n: Record<string, unknown>;
}

export interface PublicAnnouncement {
  text: string;
  linkType?: string;
  linkTarget?: string | null;
  i18n?: Record<string, unknown>;
}

export type DietDeclaration = 'PURE_VEG' | 'VEG_AND_NON_VEG';

export interface PublicProfileFields {
  story?: string;
  establishedYear?: number;
  dietDeclaration?: DietDeclaration;
  highlights?: string[];
  payments?: string[];
  priceNote?: string;
  serviceChargeNote?: string;
  fssai?: string;
  maps?: PublicMaps;
  contacts?: PublicContact[];
  links?: PublicLink[];
  weeklyHours?: WeeklyHours;
  hoursExceptions?: HoursException[];
  lastOrderMinutes?: number;
  reservations?: PublicReservations;
  i18n?: Record<string, unknown>;
  pincode?: string;
  landmark?: string;
  cuisineTags?: string[];
  /** The server's clock when it answered, to correct a phone whose clock is wrong. */
  serverNow?: string;
  /** Set when the menu was opened through an old link name; the page moves to the current one. */
  redirectToSlug?: string;
}
