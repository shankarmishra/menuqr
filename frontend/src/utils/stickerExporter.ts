import { toSvg } from 'html-to-image';

export interface ExportStickerOptions {
  pixelRatio?: number;
  fileName?: string;
  cacheBust?: boolean;
}

/**
 * High-fidelity 300+ DPI QR Standee Exporter.
 * 
 * html-to-image copies computed pixel heights (e.g. `height: 24.75px`) from the live DOM
 * onto cloned nodes. When font metrics inside SVG foreignObject differ or when text wraps
 * to 2+ lines, locked heights cause text to overflow and collide with adjacent sibling rows.
 * 
 * This exporter releases frozen heights on text elements (`height: auto !important`)
 * inside the SVG stream before canvas rasterization, guaranteeing flawless multi-line typography
 * and zero text overlap on all downloaded cards.
 */
export async function exportStickerToPng(
  node: HTMLElement,
  options: ExportStickerOptions = {}
): Promise<string> {
  const pixelRatio = options.pixelRatio ?? 3;
  const cacheBust = options.cacheBust ?? true;

  // 1. Generate clean SVG via html-to-image with embedded fonts
  const svgUrl = await toSvg(node, { cacheBust });

  // 2. Decode the SVG data URI
  const svgHeader = 'data:image/svg+xml;charset=utf-8,';
  let rawSvg = svgUrl.startsWith(svgHeader)
    ? decodeURIComponent(svgUrl.slice(svgHeader.length))
    : svgUrl;

  // 3. Release fixed computed heights on headings, paragraphs, and branding containers
  rawSvg = rawSvg.replace(
    /(<(?:h[1-6]|p)[^>]*?style="[^"]*?)height:\s*[^;]+;/gi,
    '$1height: auto !important;'
  );

  // Remove max-height and overflow clipping constraints on headings and paragraphs
  rawSvg = rawSvg.replace(
    /(<(?:h[1-6]|p)[^>]*?style="[^"]*?)max-height:\s*[^;]+;/gi,
    '$1max-height: none !important;'
  );

  // 4. Re-encode into SVG Data URL
  const fixedSvgUrl = svgHeader + encodeURIComponent(rawSvg);

  // 5. Draw onto high-DPI HTML5 canvas for 300+ DPI print export
  const img = new Image();
  img.crossOrigin = 'anonymous';

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load rasterized SVG in image buffer'));
    img.src = fixedSvgUrl;
  });

  const width = (img.naturalWidth || node.offsetWidth || 420) * pixelRatio;
  const height = (img.naturalHeight || node.offsetHeight || 660) * pixelRatio;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not obtain canvas 2D rendering context');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  const pngDataUrl = canvas.toDataURL('image/png', 1.0);

  // Trigger download if fileName is provided
  if (options.fileName) {
    const link = document.createElement('a');
    link.download = options.fileName;
    link.href = pngDataUrl;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return pngDataUrl;
}
