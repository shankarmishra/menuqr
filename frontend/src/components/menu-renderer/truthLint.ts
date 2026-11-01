/**
 * The truth rule as code (blueprint 7.3).
 *
 * A menu may print three kinds of text and nothing else:
 *   1. owner data: the restaurant profile, category names, dish names, descriptions and prices;
 *   2. computed facts: counts, positions, initials of the name;
 *   3. a small allowlist of neutral interface labels ("Menu", "Half", "Sold out today", ...).
 *
 * `findInventions` takes the markup a design rendered and the data it was given, and returns every
 * word or number that is none of those. The designs used to print "ESTD. 1953", fictional chef
 * brigades and euro prices; every one of those is a word or number that is not in the data.
 *
 * Pure functions only, so the rule is unit tested without a browser. `truth.test.ts` renders every
 * preset and feeds the result through here.
 */

/** Words that may appear without being in the data: interface labels, never claims. */
export const NEUTRAL_WORDS: readonly string[] = [
  // navigation and structure
  'menu', 'contents', 'all', 'search', 'clear', 'filter', 'view', 'open', 'close', 'back', 'top', 'page', 'section', 'sections', 'category', 'categories',
  // dishes and counts
  'dish', 'dishes', 'item', 'items', 'no', 'has', 'have', 'this', 'that', 'yet', 'match', 'matches', 'results', 'result', 'found', 'for', 'with', 'and', 'or', 'of', 'in', 'on', 'to', 'from', 'the', 'a', 'your', 'you',
  // diet
  'veg', 'vegetarian', 'vegan', 'non', 'nonveg', 'pure',
  // portions and prices
  'half', 'full', 'regular', 'medium', 'large', 'small', 'option', 'options', 'add', 'addon', 'addons', 'ons', 'extra', 'extras', 'price', 'prices', 'pc', 'pcs', 'piece', 'pieces',
  // availability
  'sold', 'out', 'today', 'currently', 'unavailable', 'available', 'now',
  // owner flags
  'bestseller', 'bestsellers', 'chef', 'chefs', 's', 'special', 'new', 'trending', 'jain', 'eggless', 'contains', 'spice', 'spicy', 'level', 'allergens', 'allergen',
  // ordering controls
  'order', 'increase', 'reduce', 'remove', 'quantity', 'customise', 'customize', 'cart', 'qty',
  // illustration note (allowed by the blueprint)
  'pictures', 'are', 'illustration', 'photo', 'photos', 'image', 'logo',
  // names of regions and controls, used for headings and screen-reader labels
  'by', 'diet', 'milder', 'featured', 'food', 'course', 'chapter', 'cover', 'board', 'front', 'hero', 'notes', 'tags', 'details', 'navigation', 'location', 'cuisine',
  // contact actions; they appear only next to a contact the owner supplied
  'call', 'find', 'us', 'chat', 'follow', 'whatsapp', 'facebook', 'instagram', 'website', 'explore',
];

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&#x27;': "'",
  '&#39;': "'",
  '&nbsp;': ' ',
  '&rsquo;': '’',
  '&lsquo;': '‘',
  '&ldquo;': '“',
  '&rdquo;': '”',
  '&middot;': '·',
  '&bull;': '•',
  '&mdash;': '—',
  '&ndash;': '–',
  '&eacute;': 'é',
  '&egrave;': 'è',
  '&ecirc;': 'ê',
  '&ccedil;': 'ç',
  '&agrave;': 'à',
  '&hellip;': '…',
};

export function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_m, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_m, dec: string) => String.fromCodePoint(Number(dec)))
    .replace(/&[a-z]+;/gi, (entity) => ENTITIES[entity.toLowerCase()] ?? entity);
}

/** Everything a person can read or hear in a block of markup: text nodes and the text attributes. */
export function visibleStrings(html: string): string[] {
  const markup = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '');
  const found: string[] = [];
  for (const match of markup.matchAll(/\s(?:alt|aria-label|title|placeholder)="([^"]*)"/g)) {
    const text = decodeEntities(match[1]).trim();
    if (text) found.push(text);
  }
  for (const piece of markup.replace(/<[^>]*>/g, '\n').split('\n')) {
    const text = decodeEntities(piece).trim();
    if (text) found.push(text);
  }
  return found;
}

/** First code point of each Indic digit block, so a numeral in Devanagari, Gurmukhi or Tamil reads as its number. */
const DIGIT_BLOCKS = [0x660, 0x6f0, 0x966, 0x9e6, 0xa66, 0xae6, 0xb66, 0xbe6, 0xc66, 0xce6, 0xd66];

/** Rewrites native-script digits as ASCII, so "१२" (12) is compared as a number, not as foreign words. */
export function asciiDigits(text: string): string {
  return text.replace(/\p{Nd}/gu, (char) => {
    const code = char.codePointAt(0) as number;
    const start = DIGIT_BLOCKS.find((block) => code >= block && code < block + 10);
    return start === undefined ? char : String(code - start);
  });
}

/** Emoji variation selectors and joiners: invisible marks that are not words. */
const INVISIBLE = new RegExp(`[${String.fromCharCode(0xfe0e, 0xfe0f, 0x200d)}]`, 'g');

/** Words and numbers, lower-cased. A possessive "'s" is dropped so "Chef's" is the word "chef". */
export function tokenize(text: string): string[] {
  return asciiDigits(text)
    .replace(INVISIBLE, '')
    .toLowerCase()
    .replace(/['’]s\b/g, '')
    .split(/[^\p{L}\p{N}\p{M}]+/u)
    .filter(Boolean);
}

const isNumber = (token: string) => /^\d+$/.test(token);
/** "007" is 7 and "000" is 0 (a zero-padded count). */
const normaliseNumber = (token: string) => token.replace(/^0+(?=[0-9])/, '');
const isAllZeros = (token: string) => /^0+$/.test(token);

export type TruthFixture = {
  restaurant: Record<string, string | undefined>;
  categories: Array<{
    id: string;
    name: string;
    description?: string;
    items: Array<{
      name: string;
      description?: string;
      price?: number | string;
      halfPrice?: number | string;
      fullPrice?: number | string;
      spicyLevel?: number;
      variants?: Array<{ name: string; price: number | string }>;
    }>;
  }>;
};

export type Allowed = { words: Set<string>; numbers: Set<string>; letters: Set<string> };

/** Everything the data and the arithmetic on it can legitimately put on a page. */
export function allowedFor(fixture: TruthFixture, extraWords: readonly string[] = []): Allowed {
  const words = new Set<string>(NEUTRAL_WORDS);
  for (const word of extraWords) words.add(word.toLowerCase());
  const numbers = new Set<string>();
  const dataText: string[] = [];

  const take = (value: unknown) => {
    if (value === undefined || value === null || value === '') return;
    dataText.push(String(value));
  };

  for (const value of Object.values(fixture.restaurant)) take(value);
  let itemCount = 0;
  for (const category of fixture.categories) {
    take(category.name);
    take(category.description);
    itemCount += category.items.length;
    numbers.add(String(category.items.length));
    for (const item of category.items) {
      take(item.name);
      take(item.description);
      take(item.price);
      take(item.halfPrice);
      take(item.fullPrice);
      take(item.spicyLevel);
      for (const variant of item.variants ?? []) {
        take(variant.name);
        take(variant.price);
      }
    }
  }

  const letters = new Set<string>();
  for (const text of dataText) {
    for (const token of tokenize(text)) {
      if (isNumber(token)) {
        // "00" in "10:00" is written as is; it must not also license a stray "0".
        numbers.add(token);
        if (!isAllZeros(token)) numbers.add(normaliseNumber(token));
      }
      else words.add(token);
    }
    for (const char of text.toLowerCase()) if (/\p{L}/u.test(char)) letters.add(char);
  }

  // Computed facts: how many dishes and categories there are, and the position of each one.
  numbers.add(String(itemCount));
  numbers.add(String(fixture.categories.length));
  const highest = Math.max(itemCount, fixture.categories.length) + 1;
  for (let n = 1; n <= highest; n += 1) numbers.add(String(n));

  // Initials of the name ("Shankar Dhaba" -> "s", "sd") and its first letters ("sh", "sha"), used by monogram marks.
  const nameWords = tokenize(fixture.restaurant.name ?? '');
  const initials = nameWords.map((word) => word[0]);
  for (let length = 1; length <= initials.length; length += 1) words.add(initials.slice(0, length).join(''));
  const squashed = nameWords.join('');
  for (let length = 1; length <= Math.min(3, squashed.length); length += 1) words.add(squashed.slice(0, length));

  // Roman numerals for positions ("Section II"): a computed count, spelled the way the design spells it.
  const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi', 'xvii', 'xviii', 'xix', 'xx'];
  for (let n = 1; n <= Math.min(highest, ROMAN.length); n += 1) words.add(ROMAN[n - 1]);

  return { words, numbers, letters };
}

export type Invention = { token: string; context: string };

/** Every word or number in `html` that is not in the data, not computed from it and not a neutral label. */
export function findInventions(html: string, allowed: Allowed): Invention[] {
  const found: Invention[] = [];
  const seen = new Set<string>();
  for (const text of visibleStrings(html)) {
    for (const token of tokenize(text)) {
      if (seen.has(token)) continue;
      let ok: boolean;
      if (isNumber(token)) ok = allowed.numbers.has(token) || allowed.numbers.has(normaliseNumber(token));
      else if (token.length === 1) ok = allowed.letters.has(token) || allowed.words.has(token);
      else ok = allowed.words.has(token);
      if (!ok) {
        seen.add(token);
        found.push({ token, context: text.slice(0, 90) });
      }
    }
  }
  return found;
}
