// MENUQR PDF Native Image & Logo Extractor
// Forensic extraction of embedded raster images and logo candidate detection via pdfjs-dist and Sharp

import fs from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import sharp from 'sharp';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const LOGOS_DIR = path.join(UPLOADS_DIR, 'logos');
const DISHES_DIR = path.join(UPLOADS_DIR, 'dishes');

// Ensure destination directories exist
for (const dir of [LOGOS_DIR, DISHES_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Generates an SVG Monogram / Emblem Logo for restaurants without an embedded raster logo
 */
export async function generateMonogramLogo({
  restaurantName = 'Restaurant',
  primaryColor = '#1F2923',
  accentColor = '#D4AF37',
  backgroundColor = '#FFFFFF',
  tenantId = 'tenant',
}) {
  const cleanName = String(restaurantName).trim();
  const words = cleanName.split(/\s+/).filter(Boolean);
  const initials = words.length >= 2
    ? (words[0][0] + words[1][0]).toUpperCase()
    : cleanName.slice(0, 2).toUpperCase();

  const fileHash = randomBytes(6).toString('hex');
  const filename = `${tenantId.replace(/[^a-zA-Z0-9_-]/g, '_')}_monogram_${Date.now()}_${fileHash}.svg`;
  const filePath = path.join(LOGOS_DIR, filename);

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="crestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primaryColor}"/>
      <stop offset="100%" stop-color="${accentColor}"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.15"/>
    </filter>
  </defs>
  <rect width="200" height="200" rx="40" fill="${backgroundColor}" stroke="${accentColor}" stroke-width="3" filter="url(#shadow)"/>
  <circle cx="100" cy="100" r="75" fill="none" stroke="${accentColor}" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.6"/>
  <circle cx="100" cy="100" r="65" fill="none" stroke="${primaryColor}" stroke-width="1" opacity="0.3"/>
  <text x="100" y="112" font-family="'Cinzel', 'Playfair Display', 'Plus Jakarta Sans', serif" font-size="44" font-weight="bold" fill="url(#crestGrad)" text-anchor="middle" dominant-baseline="middle" letter-spacing="2">
    ${initials}
  </text>
  <text x="100" y="148" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" font-weight="600" fill="${primaryColor}" text-anchor="middle" letter-spacing="3" opacity="0.7" text-transform="uppercase">
    AUTHENTIC
  </text>
</svg>`;

  fs.writeFileSync(filePath, svgContent, 'utf-8');
  return `/uploads/logos/${filename}`;
}

/**
 * Extracts embedded image XObjects from a PDF buffer and analyzes them for logo and dish photos.
 */
export async function extractImagesFromPdf(pdfBuffer, tenantId = 'default', restaurantName = 'Restaurant') {
  if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer) || pdfBuffer.length === 0) {
    return { logoUrl: null, candidateLogos: [], dishImages: [] };
  }

  const cleanTenant = String(tenantId).replace(/[^a-zA-Z0-9_-]/g, '_');
  const candidateLogos = [];
  const dishImages = [];

  try {
    const data = new Uint8Array(pdfBuffer);
    const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
    const maxPagesToScan = Math.min(doc.numPages, 5); // Scan up to first 5 pages for media

    for (let pageNum = 1; pageNum <= maxPagesToScan; pageNum++) {
      const page = await doc.getPage(pageNum);
      const ops = await page.getOperatorList();
      const pageView = page.view || [0, 0, 612, 792];
      const pageWidth = Math.max(pageView[2] - pageView[0], 1);
      const pageHeight = Math.max(pageView[3] - pageView[1], 1);

      // Track Current Transformation Matrix (CTM)
      let ctmStack = [[1, 0, 0, 1, 0, 0]];
      let currentCtm = [1, 0, 0, 1, 0, 0];

      for (let i = 0; i < ops.fnArray.length; i++) {
        const fn = ops.fnArray[i];
        const args = ops.argsArray[i];

        if (fn === pdfjs.OPS.save) {
          ctmStack.push([...currentCtm]);
        } else if (fn === pdfjs.OPS.restore) {
          if (ctmStack.length > 1) {
            currentCtm = ctmStack.pop();
          }
        } else if (fn === pdfjs.OPS.transform) {
          // Multiply matrix: [a, b, c, d, e, f]
          const [a, b, c, d, e, f] = args;
          const [ca, cb, cc, cd, ce, cf] = currentCtm;
          currentCtm = [
            ca * a + cc * b,
            cb * a + cd * b,
            ca * c + cc * d,
            cb * c + cd * d,
            ca * e + cc * f + ce,
            cb * e + cd * f + cf,
          ];
        } else if (fn === pdfjs.OPS.paintImageXObject) {
          const imgKey = args[0];

          // Retrieve image object safely with timeout to avoid deadlocks
          const imgObj = await new Promise((resolve) => {
            let settled = false;
            const timer = setTimeout(() => {
              if (!settled) {
                settled = true;
                try {
                  resolve(page.commonObjs?.get(imgKey) || null);
                } catch {
                  resolve(null);
                }
              }
            }, 250);

            try {
              if (page.objs.has(imgKey)) {
                page.objs.get(imgKey, (obj) => {
                  if (!settled) {
                    settled = true;
                    clearTimeout(timer);
                    resolve(obj || null);
                  }
                });
              } else if (page.commonObjs?.has(imgKey)) {
                settled = true;
                clearTimeout(timer);
                resolve(page.commonObjs.get(imgKey) || null);
              } else {
                page.objs.get(imgKey, (obj) => {
                  if (!settled) {
                    settled = true;
                    clearTimeout(timer);
                    resolve(obj || page.commonObjs?.get(imgKey) || null);
                  }
                });
              }
            } catch {
              if (!settled) {
                settled = true;
                clearTimeout(timer);
                resolve(null);
              }
            }
          });

          if (!imgObj || !imgObj.data || !imgObj.width || !imgObj.height) {
            continue;
          }

          // Ignore tiny tracking pixels (< 16x16)
          if (imgObj.width < 16 || imgObj.height < 16) {
            continue;
          }

          // Calculate approximate render coordinates on the page
          const renderedWidth = Math.abs(currentCtm[0]) || imgObj.width;
          const renderedHeight = Math.abs(currentCtm[3]) || imgObj.height;
          const renderedX = currentCtm[4] || 0;
          const renderedY = currentCtm[5] || 0;

          // Distance from top of page (0 = top, 1 = bottom)
          const topFraction = Math.max(0, Math.min(1, (pageHeight - (renderedY + renderedHeight)) / pageHeight));
          const widthRatio = renderedWidth / pageWidth;
          const heightRatio = renderedHeight / pageHeight;

          // Convert raw pixel data to Sharp buffer
          let sharpBuffer = null;
          try {
            const rawData = Buffer.from(imgObj.data);
            const numPixels = imgObj.width * imgObj.height;
            let channels = 3;

            if (rawData.length === numPixels) {
              channels = 1;
            } else if (rawData.length === numPixels * 4) {
              channels = 4;
            } else if (rawData.length === numPixels * 3) {
              channels = 3;
            } else {
              // Non-standard pixel packing, fallback to jpeg/png if wrapped
              continue;
            }

            sharpBuffer = await sharp(rawData, {
              raw: {
                width: imgObj.width,
                height: imgObj.height,
                channels,
              },
            })
              .trim({ background: '#FFFFFF', threshold: 12 })
              .webp({ quality: 85 })
              .toBuffer();
          } catch (sharpErr) {
            // Raw pixel conversion failed, skip this image
            continue;
          }

          if (!sharpBuffer || sharpBuffer.length < 500) {
            continue;
          }

          const aspectRatio = imgObj.width / Math.max(imgObj.height, 1);
          const isPage1 = pageNum === 1;

          // Logo Scoring Algorithm
          let logoScore = 0;
          if (isPage1) logoScore += 40;
          if (isPage1 && topFraction <= 0.40) logoScore += 45; // Top 40% of first page
          if (isPage1 && topFraction <= 0.25) logoScore += 20; // Top 25% header region
          if (aspectRatio >= 0.5 && aspectRatio <= 3.5) logoScore += 25; // Reasonable logo proportions
          if (widthRatio >= 0.10 && widthRatio <= 0.70) logoScore += 20; // Not a full-page background wallpaper
          if (widthRatio > 0.85 && heightRatio > 0.85) logoScore -= 80; // Full background image penalty

          const fileHash = randomBytes(6).toString('hex');

          if (logoScore >= 60) {
            const logoFilename = `${cleanTenant}_logo_p${pageNum}_${fileHash}.webp`;
            const logoPath = path.join(LOGOS_DIR, logoFilename);
            fs.writeFileSync(logoPath, sharpBuffer);
            const logoUrl = `/uploads/logos/${logoFilename}`;

            candidateLogos.push({
              url: logoUrl,
              score: logoScore,
              width: imgObj.width,
              height: imgObj.height,
              aspectRatio: Number(aspectRatio.toFixed(2)),
              page: pageNum,
            });
          } else {
            // Food / Dish photo candidate
            // Dishes typically have width > 100px, aspect ratio between 0.6 and 1.8
            if (imgObj.width >= 100 && imgObj.height >= 100 && aspectRatio >= 0.6 && aspectRatio <= 2.2) {
              const dishFilename = `${cleanTenant}_dish_p${pageNum}_${fileHash}.webp`;
              const dishPath = path.join(DISHES_DIR, dishFilename);
              fs.writeFileSync(dishPath, sharpBuffer);
              const dishUrl = `/uploads/dishes/${dishFilename}`;

              dishImages.push({
                url: dishUrl,
                width: imgObj.width,
                height: imgObj.height,
                page: pageNum,
                topFraction: Number(topFraction.toFixed(2)),
              });
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('[pdfImageExtractor] Error traversing PDF images:', err.message);
  }

  // Sort candidate logos by score descending
  candidateLogos.sort((a, b) => b.score - a.score);
  const bestLogo = candidateLogos[0] || null;

  return {
    logoUrl: bestLogo ? bestLogo.url : null,
    candidateLogos,
    dishImages,
  };
}
