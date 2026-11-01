/**
 * Pure text helpers for cover slots, kept out of the .tsx files so they can be unit tested.
 */

/** Splits a restaurant name over two lines: a small top line and a large main line. */
export function splitRestaurantName(name: string): { top: string; main: string } {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return { top: '', main: words[0] ?? '' };
  if (words.length === 2) return { top: words[0], main: words[1] };
  const middle = Math.ceil(words.length / 2);
  return { top: words.slice(0, middle).join(' '), main: words.slice(middle).join(' ') };
}

/**
 * A font size in rem that shrinks once `text` is longer than `comfortableLength` characters, so a
 * long name never overflows its plaque. Never smaller than `minRem`.
 */
export function fittedSize(baseRem: number, text: string, comfortableLength: number, minRem: number): string {
  const scale = Math.min(1, comfortableLength / Math.max(text.length, comfortableLength));
  return `${Math.max(minRem, baseRem * scale).toFixed(3)}rem`;
}
