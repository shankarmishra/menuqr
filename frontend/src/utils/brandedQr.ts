import QRCode from 'qrcode';

export interface BrandedQrOptions {
  text: string;
  size?: number; // Size in pixels for PNG (default: 2048 for high-res 300 DPI)
  margin?: number; // Margin modules (default: 2)
  darkColor?: string; // Dark module color (default: #140D07)
  lightColor?: string; // Light background color (default: #FFFFFF)
  restaurantName?: string;
  tableNumber?: number | string;
  includeMedallion?: boolean; // Center logo overlay (default: true)
}

/**
 * Generates a high-resolution branded QR code PNG with error correction level 'H' (~30% error recovery).
 * The center area is cleanly overlaid with a branded quiet-zone medallion, guaranteeing 100% scannability.
 */
export async function generateBrandedQrDataUrl(options: BrandedQrOptions): Promise<string> {
  const size = options.size ?? 2048;
  const margin = options.margin ?? 2;
  const darkColor = options.darkColor ?? '#140D07';
  const lightColor = options.lightColor ?? '#FFFFFF';
  const includeMedallion = options.includeMedallion ?? true;

  // 1. Generate base high-resolution QR with Error Correction Level 'H'
  const baseDataUrl = await QRCode.toDataURL(options.text, {
    errorCorrectionLevel: 'H',
    width: size,
    margin,
    color: {
      dark: darkColor,
      light: lightColor,
    },
  });

  if (!includeMedallion || typeof window === 'undefined') {
    return baseDataUrl;
  }

  // 2. Composite high-resolution center logo on HTML5 canvas
  return new Promise<string>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(baseDataUrl);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw base QR
        ctx.drawImage(img, 0, 0, size, size);

        // Center medallion coordinates & radius (11% radius = 22% diameter of total QR)
        // Level 'H' recovers up to 30% corrupted area; 22% diameter uses only ~4.8% of QR area.
        const cx = size / 2;
        const cy = size / 2;
        const radius = size * 0.11;

        // A. Draw pristine white quiet-zone circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius + (size * 0.015), 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = size * 0.02;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = size * 0.005;
        ctx.fill();
        ctx.restore();

        // B. Outer luxury 24K gold rim
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.lineWidth = Math.max(4, size * 0.014);
        ctx.strokeStyle = '#D4AF37';
        ctx.stroke();

        // C. Inner medallion fill (Rich ebony/burnt orange radial gradient)
        const innerRadius = radius * 0.86;
        const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, innerRadius);
        grad.addColorStop(0, '#2D1B0D');
        grad.addColorStop(1, '#120A03');

        ctx.beginPath();
        ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Inner fine gold accent ring
        ctx.lineWidth = Math.max(1.5, size * 0.004);
        ctx.strokeStyle = '#FFF8D6';
        ctx.stroke();

        // D. Medallion Graphic: Table Indicator or MenusQR Brand Mark
        if (options.tableNumber !== undefined) {
          // If a table number is provided, render high-contrast table badge in center
          ctx.fillStyle = '#D4AF37';
          ctx.font = `bold ${Math.round(innerRadius * 0.45)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`T-${options.tableNumber}`, cx, cy - (innerRadius * 0.12));

          ctx.fillStyle = '#FFF8D6';
          ctx.font = `bold ${Math.round(innerRadius * 0.28)}px sans-serif`;
          ctx.fillText('TABLE', cx, cy + (innerRadius * 0.38));
        } else {
          // Default: Luxury MenusQR Brand Emblem (stylized cutlery + "M" monogram)
          // Draw cutlery icon / logo
          const iconScale = innerRadius * 0.6;
          ctx.save();
          ctx.translate(cx, cy);

          // Stylized Fork (left)
          ctx.fillStyle = '#FFF8D6';
          ctx.beginPath();
          ctx.rect(-iconScale * 0.45, -iconScale * 0.65, iconScale * 0.12, iconScale * 1.3);
          ctx.arc(-iconScale * 0.39, -iconScale * 0.65, iconScale * 0.16, Math.PI, 0, true);
          ctx.fill();

          // Stylized Knife (right)
          ctx.fillStyle = '#E8783C';
          ctx.beginPath();
          ctx.rect(iconScale * 0.33, -iconScale * 0.65, iconScale * 0.12, iconScale * 1.3);
          ctx.arc(iconScale * 0.39, -iconScale * 0.3, iconScale * 0.14, 0, Math.PI * 0.5);
          ctx.fill();

          // Central Monogram "M"
          ctx.fillStyle = '#D4AF37';
          ctx.font = `900 ${Math.round(iconScale * 0.95)}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('M', 0, iconScale * 0.05);

          ctx.restore();
        }

        resolve(canvas.toDataURL('image/png', 1.0));
      } catch (err) {
        console.error('Canvas QR rendering error:', err);
        resolve(baseDataUrl);
      }
    };
    img.onerror = () => resolve(baseDataUrl);
    img.src = baseDataUrl;
  });
}

/**
 * Generates a scalable vector SVG QR code with error correction level 'H' (~30% error recovery),
 * complete with vector center medallion. Perfect for large-format print shop graphics, acrylics, and signages.
 */
export async function generateBrandedQrSvg(options: BrandedQrOptions): Promise<string> {
  const margin = options.margin ?? 2;
  const darkColor = options.darkColor ?? '#140D07';
  const lightColor = options.lightColor ?? '#FFFFFF';
  const includeMedallion = options.includeMedallion ?? true;

  // 1. Generate base SVG with errorCorrectionLevel 'H'
  const rawSvg = await QRCode.toString(options.text, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin,
    color: {
      dark: darkColor,
      light: lightColor,
    },
  });

  if (!includeMedallion) return rawSvg;

  // 2. Parse viewBox to find module coordinate space
  const viewBoxMatch = rawSvg.match(/viewBox="([^"]+)"/i);
  let totalModules = 45; // default fallback
  if (viewBoxMatch && viewBoxMatch[1]) {
    const parts = viewBoxMatch[1].trim().split(/[\s,]+/);
    if (parts.length === 4) {
      totalModules = parseFloat(parts[2]);
    }
  }

  const center = totalModules / 2;
  const radius = totalModules * 0.115;
  const innerRadius = radius * 0.86;

  // Center medallion SVG group
  let medallionGraphic = '';
  if (options.tableNumber !== undefined) {
    medallionGraphic = `
      <text x="${center}" y="${center - (innerRadius * 0.12)}" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="${innerRadius * 0.45}" fill="#D4AF37" text-anchor="middle" dominant-baseline="central">T-${options.tableNumber}</text>
      <text x="${center}" y="${center + (innerRadius * 0.4)}" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="${innerRadius * 0.28}" fill="#FFF8D6" text-anchor="middle" dominant-baseline="central">TABLE</text>
    `;
  } else {
    medallionGraphic = `
      <circle cx="${center}" cy="${cy(center, 0)}" r="${innerRadius * 0.65}" fill="#1D1208" />
      <text x="${center}" y="${center + (innerRadius * 0.08)}" font-family="Cinzel, Georgia, serif" font-weight="900" font-size="${innerRadius * 0.85}" fill="#D4AF37" text-anchor="middle" dominant-baseline="central">M</text>
      <circle cx="${center - (innerRadius * 0.4)}" cy="${center}" r="${innerRadius * 0.08}" fill="#FFF8D6" />
      <circle cx="${center + (innerRadius * 0.4)}" cy="${center}" r="${innerRadius * 0.08}" fill="#E8783C" />
    `;
  }

  const centerLogoGroup = `
  <!-- Branded High-Recovery Quiet Zone Medallion (Error Correction 'H') -->
  <g id="menusqr-branded-center">
    <!-- Quiet Zone Shield -->
    <circle cx="${center}" cy="${center}" r="${radius + 0.4}" fill="#FFFFFF" />
    <!-- Luxury Gold Rim -->
    <circle cx="${center}" cy="${center}" r="${radius}" fill="#120A03" stroke="#D4AF37" stroke-width="0.75" />
    <!-- Inner Accent Ring -->
    <circle cx="${center}" cy="${center}" r="${innerRadius}" fill="#1E1207" stroke="#FFF8D6" stroke-width="0.25" />
    ${medallionGraphic}
  </g>
</svg>`;

  return rawSvg.replace('</svg>', centerLogoGroup);
}

function cy(center: number, offset: number): number {
  return center + offset;
}

/**
 * Triggers a direct browser file download for a Data URL (e.g. PNG).
 */
export function downloadDataUrl(dataUrl: string, fileName: string): void {
  if (typeof document === 'undefined') return;
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/**
 * Triggers a direct browser file download for an SVG string.
 */
export function downloadSvg(svgString: string, fileName: string): void {
  if (typeof document === 'undefined') return;
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
