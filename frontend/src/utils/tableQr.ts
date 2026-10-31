export type TableQrFormat = 'tent' | 'acrylic' | 'stickers';

export type TableQrCard = {
  table: number;
  url: string;
  dataUrl: string;
  svgString?: string;
};

/** Parses single table count; returns null unless it is a whole number from 1 to 200. */
export function clampTableCount(raw: string | number): number | null {
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > 200) return null;
  return value;
}

/** Parses table range (e.g. 1 to 20); returns null if invalid. */
export function clampTableRange(
  startRaw: string | number,
  endRaw: string | number
): { start: number; end: number; count: number } | null {
  const start = Number(startRaw);
  const end = Number(endRaw);
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end > 300 || start > end) {
    return null;
  }
  const count = end - start + 1;
  if (count > 200) return null; // Reasonable safety limit per batch
  return { start, end, count };
}

/** Adds `?table=N` to the permanent QR link, preserving any existing query string. */
export function buildTableQrUrl(baseUrl: string, table: number): string {
  try {
    const url = new URL(baseUrl);
    url.searchParams.set('table', String(table));
    return url.toString();
  } catch {
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}table=${table}`;
  }
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch] as string
  ));
}

/**
 * Builds standalone, print-ready HTML for:
 * - 'tent': Foldable Double-Sided Table Tents (with central fold line & perimeter cut guides)
 * - 'acrylic': Acrylic Stand Inserts (A6 / 4"x6" portrait with corner crop marks)
 * - 'stickers': Multi-Up Table Stickers (6 per page with dashed cutting guides)
 */
export function buildTablePrintHtml(
  cards: TableQrCard[],
  restaurantName: string,
  label: string,
  format: TableQrFormat = 'tent',
  showCuttingGuides: boolean = true
): string {
  const name = escapeHtml(restaurantName);
  const safeLabel = escapeHtml(label.trim() || 'Table');

  let bodyContent = '';
  let formatSpecificStyles = '';

  if (format === 'tent') {
    // Foldable Double-Sided Table Tent (2 panels per card: Front & Back)
    formatSpecificStyles = `
      @page { size: A4 landscape; margin: 8mm; }
      .sheet { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10mm; }
      .tent-card {
        border: ${showCuttingGuides ? '1px dashed #777' : 'none'};
        border-radius: 4mm;
        background: #ffffff;
        page-break-inside: avoid;
        break-inside: avoid;
        margin-bottom: 8mm;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        overflow: hidden;
      }
      .tent-panel {
        padding: 6mm 8mm;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        min-height: 80mm;
      }
      .tent-fold-divider {
        border-top: ${showCuttingGuides ? '1.5px dashed #C89B3C' : '1px solid transparent'};
        position: relative;
        text-align: center;
        margin: 2mm 0;
      }
      .tent-fold-label {
        position: absolute;
        top: -7px;
        left: 50%;
        transform: translateX(-50%);
        background: #ffffff;
        padding: 0 4mm;
        font-size: 7pt;
        color: #888;
        font-weight: bold;
        letter-spacing: 1px;
        text-transform: uppercase;
      }
      .guide-badge {
        font-size: 7pt;
        color: #888;
        margin-top: 1mm;
      }
      .tent-panel.mirrored {
        transform: rotate(180deg);
      }
    `;

    bodyContent = cards
      .map(
        (card) => `
      <section class="tent-card">
        <!-- Front Panel -->
        <div class="tent-panel">
          <div class="brand-header">
            <div class="name">${name}</div>
            <div class="tagline">DIGITAL MENU &amp; CONTACTLESS ORDERING</div>
          </div>
          <div class="qr-box">
            <img src="${card.dataUrl}" alt="QR for ${safeLabel} ${card.table}" />
          </div>
          <div class="table-badge">${safeLabel} ${card.table}</div>
          <div class="hint">Point your phone camera to view menu &amp; order</div>
        </div>

        <!-- Central Fold Axis -->
        <div class="tent-fold-divider">
          ${showCuttingGuides ? '<span class="tent-fold-label">&#x2702; - - - FOLD HERE TO STAND - - -</span>' : ''}
        </div>

        <!-- Back Panel (Mirrored so both sides face viewers when folded) -->
        <div class="tent-panel mirrored">
          <div class="brand-header">
            <div class="name">${name}</div>
            <div class="tagline">DIGITAL MENU &amp; CONTACTLESS ORDERING</div>
          </div>
          <div class="qr-box">
            <img src="${card.dataUrl}" alt="QR for ${safeLabel} ${card.table}" />
          </div>
          <div class="table-badge">${safeLabel} ${card.table}</div>
          <div class="hint">Point your phone camera to view menu &amp; order</div>
        </div>
      </section>
    `
      )
      .join('\n');
  } else if (format === 'acrylic') {
    // Acrylic Stand Inserts (A6 / 4"x6" portrait inserts with corner crop marks)
    formatSpecificStyles = `
      @page { size: A4 portrait; margin: 10mm; }
      .sheet { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8mm; }
      .acrylic-card {
        border: ${showCuttingGuides ? '1px dashed #888' : 'none'};
        border-radius: 4mm;
        padding: 8mm 6mm;
        text-align: center;
        background: #ffffff;
        page-break-inside: avoid;
        break-inside: avoid;
        height: 125mm;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        position: relative;
        box-sizing: border-box;
      }
      .crop-mark {
        position: absolute;
        width: 10mm;
        height: 10mm;
        pointer-events: none;
      }
      .crop-tl { top: -2px; left: -2px; border-top: 1.5px solid #333; border-left: 1.5px solid #333; }
      .crop-tr { top: -2px; right: -2px; border-top: 1.5px solid #333; border-right: 1.5px solid #333; }
      .crop-bl { bottom: -2px; left: -2px; border-bottom: 1.5px solid #333; border-left: 1.5px solid #333; }
      .crop-br { bottom: -2px; right: -2px; border-bottom: 1.5px solid #333; border-right: 1.5px solid #333; }
    `;

    bodyContent = cards
      .map(
        (card) => `
      <section class="acrylic-card">
        ${showCuttingGuides ? `
          <div class="crop-mark crop-tl"></div>
          <div class="crop-mark crop-tr"></div>
          <div class="crop-mark crop-bl"></div>
          <div class="crop-mark crop-br"></div>
        ` : ''}
        <div class="brand-header">
          <div class="gold-accent-line"></div>
          <div class="name">${name}</div>
          <div class="tagline">FINE FOOD &amp; HOSPITALITY</div>
        </div>
        <div class="qr-box">
          <img src="${card.dataUrl}" alt="QR for ${safeLabel} ${card.table}" />
        </div>
        <div>
          <div class="table-badge">${safeLabel} ${card.table}</div>
          <div class="hint">Scan with camera to browse dishes &amp; order</div>
        </div>
        <div class="footer-note">MenusQR &bull; Instant Digital Ordering</div>
      </section>
    `
      )
      .join('\n');
  } else {
    // Multi-Up Table Stickers / Mini Cards (6 per page)
    formatSpecificStyles = `
      @page { size: A4 portrait; margin: 8mm; }
      .sheet { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6mm; }
      .sticker-card {
        border: ${showCuttingGuides ? '1.5px dashed #999' : '1px solid #eee'};
        border-radius: 4mm;
        padding: 5mm 4mm;
        text-align: center;
        background: #ffffff;
        page-break-inside: avoid;
        break-inside: avoid;
        height: 86mm;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        box-sizing: border-box;
      }
    `;

    bodyContent = cards
      .map(
        (card) => `
      <section class="sticker-card">
        <div class="name">${name}</div>
        <div class="qr-box">
          <img src="${card.dataUrl}" alt="QR for ${safeLabel} ${card.table}" />
        </div>
        <div class="table-badge">${safeLabel} ${card.table}</div>
        <div class="hint">Scan to view menu &amp; order</div>
      </section>
    `
      )
      .join('\n');
  }

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${name} - ${safeLabel} QR Print Sheet</title>
  <style>
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      color: #111111;
      background: #ffffff;
    }
    .brand-header { margin-bottom: 2mm; }
    .name {
      font-size: 15pt;
      font-weight: 800;
      color: #120A03;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .tagline {
      font-size: 6.5pt;
      font-weight: 700;
      color: #855716;
      letter-spacing: 1.5px;
      margin-top: 1mm;
      text-transform: uppercase;
    }
    .gold-accent-line {
      width: 25mm;
      height: 1.5px;
      background: #C89B3C;
      margin: 0 auto 2mm auto;
    }
    .qr-box {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5mm;
      background: #ffffff;
    }
    img {
      width: 46mm;
      height: 46mm;
      display: block;
      image-rendering: pixelated;
    }
    .table-badge {
      display: inline-block;
      font-size: 17pt;
      font-weight: 900;
      color: #120A03;
      background: #FAF7F0;
      border: 1.5px solid #C89B3C;
      border-radius: 3mm;
      padding: 1mm 6mm;
      margin-top: 2mm;
      letter-spacing: 0.5px;
    }
    .hint {
      font-size: 8pt;
      font-weight: 600;
      color: #555555;
      margin-top: 1.5mm;
    }
    .footer-note {
      font-size: 6.5pt;
      color: #888888;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      font-weight: 600;
    }
    ${formatSpecificStyles}
  </style>
</head>
<body>
  <div class="sheet">
    ${bodyContent}
  </div>
</body>
</html>`;
}
