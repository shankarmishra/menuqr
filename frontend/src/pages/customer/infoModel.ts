import type { PublicMenuRecord } from '../admin/clientStore';
import { getOpenStatus, weekRows, type OpenStatus, type OpeningHours, type WeekRow } from '../../utils/openingHours.ts';
import { directionsUrl, firstPhone, storedLinkTarget, telHref, whatsappUrl } from '../../utils/socialLinks.ts';
import type { TrackKind } from '../../utils/trackClick.ts';

/**
 * What the Info sheet shows, worked out from the public menu record. Every entry exists only when the
 * owner saved the data behind it and the value is a valid link; nothing here is a default or a
 * placeholder. All links go through utils/socialLinks.ts.
 */

export type InfoIcon = 'phone' | 'whatsapp' | 'directions' | 'instagram' | 'facebook' | 'youtube' | 'website' | 'link';

export interface InfoAction {
  kind: TrackKind;
  icon: InfoIcon;
  href: string;
  label: string;
  /** Smaller text beside the label: a number, a handle or a web address. */
  detail?: string;
  /** Opens in a new tab (everything except `tel:`). */
  external: boolean;
  /** Set on call buttons: the number to copy on a computer, where `tel:` does nothing. */
  copyText?: string;
}

export interface InfoModel {
  status: OpenStatus | null;
  /** Today's line of the week table, e.g. "10 AM – 11 PM". */
  today: string | null;
  week: WeekRow[] | null;
  /** The owner's free-text hours; only when there are no structured hours. */
  hoursText: string | null;
  addressLines: string[];
  directions: InfoAction | null;
  calls: InfoAction[];
  whatsapp: InfoAction | null;
  links: InfoAction[];
  /** "Also on" chips: Zomato and Swiggy. */
  partners: InfoAction[];
  diet: string | null;
  fssai: string | null;
  hasContent: boolean;
}

export type InfoSource = Pick<
  PublicMenuRecord,
  | 'businessName'
  | 'phone'
  | 'address'
  | 'city'
  | 'state'
  | 'website'
  | 'instagram'
  | 'facebook'
  | 'openingHours'
  | 'menuItems'
  | 'contacts'
  | 'links'
  | 'maps'
  | 'weeklyHours'
  | 'hoursExceptions'
  | 'lastOrderMinutes'
  | 'fssai'
  | 'pincode'
  | 'landmark'
  | 'dietDeclaration'
>;

const tidy = (value: string | null | undefined) => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '');

const KIND_FOR_TYPE: Record<string, TrackKind> = {
  instagram: 'instagram',
  website: 'website',
  zomato: 'zomato',
  swiggy: 'swiggy',
};

const LABEL_FOR_TYPE: Record<string, { label: string; icon: InfoIcon }> = {
  instagram: { label: 'Instagram', icon: 'instagram' },
  facebook: { label: 'Facebook', icon: 'facebook' },
  youtube: { label: 'YouTube', icon: 'youtube' },
  website: { label: 'Website', icon: 'website' },
};

/** Instagram, Facebook, YouTube, website, then the owner's own links; "Also on" partners come separately. */
const LINK_ORDER = ['instagram', 'facebook', 'youtube', 'website', 'custom'];

function addressLines(source: InfoSource): string[] {
  const lines: string[] = [];
  const street = tidy(source.address);
  if (street) lines.push(street);
  const place = [tidy(source.city), tidy(source.state)]
    .filter((part) => part && !street.toLowerCase().includes(part.toLowerCase()))
    .join(', ');
  const placeLine = [place, source.pincode ?? ''].filter(Boolean).join(' ');
  if (placeLine) lines.push(placeLine);
  const landmark = tidy(source.landmark);
  if (landmark) lines.push(`Landmark: ${landmark}`);
  return lines;
}

function callActions(source: InfoSource): InfoAction[] {
  const contacts = source.contacts ?? [];
  if (contacts.length > 0) {
    const actions: InfoAction[] = [];
    for (const contact of contacts) {
      const href = telHref(contact.number);
      if (!href) continue;
      const shown = contact.display || firstPhone(contact.number)?.display || tidy(contact.number);
      actions.push({
        kind: 'call',
        icon: 'phone',
        href,
        label: contact.label ? `Call ${contact.label}` : 'Call',
        detail: shown,
        external: false,
        copyText: shown,
      });
    }
    return actions;
  }
  // An older backend sends one phone field, which can hold several numbers: dial the first.
  const href = telHref(source.phone);
  if (!href) return [];
  const shown = firstPhone(source.phone)?.display || tidy(source.phone).split(/[,;/&]/)[0].trim();
  return [{ kind: 'call', icon: 'phone', href, label: 'Call', detail: shown, external: false, copyText: shown }];
}

function whatsappAction(source: InfoSource, chatNumber: string | null | undefined): InfoAction | null {
  const candidates: Array<{ number: string; message: string }> = [];
  const fallbackMessage = `Hi, I'm looking at the ${tidy(source.businessName)} menu`;
  // The number the owner chose for menu chat comes first, then any public number marked WhatsApp.
  if (chatNumber) candidates.push({ number: chatNumber, message: fallbackMessage });
  for (const contact of source.contacts ?? []) {
    if (contact.whatsapp) candidates.push({ number: contact.number, message: contact.whatsappMessage || fallbackMessage });
  }
  for (const candidate of candidates) {
    const href = whatsappUrl(candidate.number, candidate.message);
    if (href) return { kind: 'whatsapp', icon: 'whatsapp', href, label: 'WhatsApp', external: true };
  }
  return null;
}

function linkActions(source: InfoSource): { links: InfoAction[]; partners: InfoAction[] } {
  const stored = [...(source.links ?? [])];
  // Saved links win; the flat fields of an older backend fill in only the types that have none.
  const legacy: Array<[string, string | undefined]> = [
    ['instagram', source.instagram],
    ['facebook', source.facebook],
    ['website', source.website],
  ];
  for (const [type, value] of legacy) {
    if (value && !stored.some((link) => link.type === type)) stored.push({ type, value, label: '' });
  }

  const seen = new Set<string>();
  const made: Array<{ type: string; action: InfoAction }> = [];
  for (const link of stored) {
    const target = storedLinkTarget(link.type, link.value);
    if (!target || seen.has(target.href)) continue;
    seen.add(target.href);
    const known = LABEL_FOR_TYPE[link.type];
    const isPartner = link.type === 'zomato' || link.type === 'swiggy';
    made.push({
      type: link.type,
      action: {
        kind: KIND_FOR_TYPE[link.type] ?? 'custom',
        icon: known?.icon ?? 'link',
        href: target.href,
        label: isPartner ? target.text : known?.label ?? (tidy(link.label) || 'Link'),
        ...(isPartner ? {} : { detail: target.text }),
        external: true,
      },
    });
  }

  const rank = (type: string) => {
    const index = LINK_ORDER.indexOf(type);
    return index === -1 ? LINK_ORDER.length : index;
  };
  const links = made
    .filter(({ type }) => type !== 'zomato' && type !== 'swiggy')
    .sort((a, b) => rank(a.type) - rank(b.type))
    .map(({ action }) => action);
  const partners = made.filter(({ type }) => type === 'zomato' || type === 'swiggy').map(({ action }) => action);
  return { links, partners };
}

function dietLabel(source: InfoSource): string | null {
  if (source.dietDeclaration === 'VEG_AND_NON_VEG') return 'Veg and non-veg';
  if (source.dietDeclaration !== 'PURE_VEG') return null;
  // "Pure veg" is a claim about every dish: it is shown only while no dish contradicts it.
  return source.menuItems.some((item) => item.dietType === 'non-veg') ? null : 'Pure vegetarian';
}

export function buildInfoModel(source: InfoSource, options: { whatsappNumber?: string | null; now: Date }): InfoModel {
  const hours: OpeningHours | undefined = source.weeklyHours
    ? { weekly: source.weeklyHours, exceptions: source.hoursExceptions, lastOrderMinutes: source.lastOrderMinutes }
    : undefined;
  const status = getOpenStatus(hours, options.now);
  const week = weekRows(hours, options.now);
  const today = week?.find((row) => row.isToday)?.text ?? null;
  const hoursText = !week ? tidy(source.openingHours) || null : null;

  const lines = addressLines(source);
  const directionsHref = directionsUrl({
    mapsUrl: source.maps?.url,
    directionsUrl: source.maps?.directionsUrl,
    name: source.businessName,
    address: source.address,
    city: source.city,
  });
  const directions: InfoAction | null = directionsHref
    ? { kind: 'directions', icon: 'directions', href: directionsHref, label: 'Get directions', external: true }
    : null;

  const calls = callActions(source);
  const whatsapp = whatsappAction(source, options.whatsappNumber);
  const { links, partners } = linkActions(source);
  const diet = dietLabel(source);
  const fssai = /^\d{14}$/.test(tidy(source.fssai)) ? tidy(source.fssai) : null;

  return {
    status,
    today,
    week,
    hoursText,
    addressLines: lines,
    directions,
    calls,
    whatsapp,
    links,
    partners,
    diet,
    fssai,
    hasContent: Boolean(status || hoursText || lines.length || directions || calls.length || whatsapp || links.length || partners.length || diet || fssai),
  };
}
