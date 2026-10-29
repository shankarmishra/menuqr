export type TableQrCard = { table: number; dataUrl: string };

/** Parses the "number of tables" input; returns null unless it is a whole number from 1 to 200. */
export function clampTableCount(raw: string): number | null {
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > 200) return null;
  return value;
}

/** Adds `?table=N` to the permanent QR link, preserving any existing query string. */
export function buildTableQrUrl(baseUrl: string, table: number): string {
  const url = new URL(baseUrl);
  url.searchParams.set('table', String(table));
  return url.toString();
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch] as string
  ));
}

/** A self-contained, print-ready A4 sheet: six QR cards per page. */
export function buildTablePrintHtml(cards: TableQrCard[], restaurantName: string, label: string): string {
  const name = escapeHtml(restaurantName);
  const safeLabel = escapeHtml(label);
  const body = cards
    .map(
      (card) => `<section class="card">
  <div class="name">${name}</div>
  <img src="${card.dataUrl}" alt="QR for ${safeLabel} ${card.table}" />
  <div class="table">${safeLabel} ${card.table}</div>
  <div class="hint">Scan to view the menu &amp; order</div>
</section>`
    )
    .join('\n');

  return `<!doctype html><html><head><meta charset="utf-8"><title>${name} table QR codes</title>
<style>
  @page { size: A4; margin: 10mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #111; }
  .sheet { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6mm; }
  .card { border: 1.5px dashed #999; border-radius: 4mm; padding: 6mm 4mm; text-align: center; break-inside: avoid; height: 86mm; display: flex; flex-direction: column; align-items: center; justify-content: space-between; }
  .name { font-size: 15pt; font-weight: 700; }
  img { width: 52mm; height: 52mm; }
  .table { font-size: 20pt; font-weight: 800; }
  .hint { font-size: 9pt; color: #555; }
</style></head><body><div class="sheet">
${body}
</div></body></html>`;
}
