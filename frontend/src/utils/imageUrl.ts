/**
 * A dish photo must be a link to an image file. Spreadsheets often hold a *search page* instead
 * (e.g. `https://www.google.com/search?tbm=isch&q=Paneer+Tikka`): it is a valid URL, but the
 * browser receives an HTML page, so the photo can never load and the card shows an empty box.
 */
const SEARCH_ENGINE_HOSTS = /(^|\.)(google|bing|duckduckgo|yahoo|yandex|baidu|ecosia|pinterest)\.[a-z.]+$/i;

export function isUsableImageUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const url = value.trim();
  if (!url) return false;
  if (url.startsWith('data:image/') || url.startsWith('/')) return true;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
  const host = parsed.hostname;
  const path = parsed.pathname.toLowerCase();
  const isSearchPage =
    /\/(search|images\/search|imgres|url)$/.test(path) ||
    parsed.searchParams.has('tbm') ||
    (parsed.searchParams.has('q') && /\/(search|images)/.test(path));
  // Google/Bing/... host real image CDNs (googleusercontent, gstatic) on other hostnames; only the
  // search-result pages on the engines' main hosts are rejected.
  if (SEARCH_ENGINE_HOSTS.test(host) && isSearchPage) return false;
  return true;
}
