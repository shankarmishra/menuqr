/**
 * The number to dial for a phone field that may hold several ("98765 43210, 90689 35364" or
 * "xxxxx / yyyyy"): the first one, reduced to digits and a leading +.
 */
export function firstDialNumber(phone: string | null | undefined): string {
  const first = String(phone ?? '').split(/[,;/&]|\s+(?:or|aur)\s+/i)[0] ?? '';
  return first.replace(/[^\d+]/g, '');
}
