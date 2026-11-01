#!/usr/bin/env node
/**
 * MENUQR — Signature Edition quality guard
 *
 * Catches the exact defect class that shipped silently across most of the ~15 Signature Edition
 * templates before this check existed: a template that quietly diverges from the shared design
 * tokens or the shared dish-flag contract. Each Edition is an independent, hand-written React
 * component, so nothing stops a new one (or an edit to an old one) from reintroducing the same
 * bugs — this script is the backstop.
 *
 * Three checks, each tied to a real bug found and fixed in this codebase:
 *   1. A dish-name/description-shaped CSS class with a font-size that isn't a design token —
 *      this is how templates ended up with mismatched text sizes for the same kind of text.
 *   2. A `minmax()` grid floor using a raw px/unwrapped rem value — this is how a dish grid
 *      overflowed on a narrow phone.
 *   3. An Edition that renders dish items but never references the shared `DishFlags` primitive
 *      (or, failing that, is missing one of the fields it covers) — this is how allergen/Jain/
 *      eggless/spice warnings and the Trending badge silently never appeared on several templates.
 *
 * Exits non-zero on any finding, so it can run in CI next to `test:unit`.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EDITIONS_DIR = join(__dirname, '..', 'src', 'components', 'menu-renderer', 'signature', 'editions');
const SIGNATURE_DIR = join(__dirname, '..', 'src', 'components', 'menu-renderer', 'signature');

const CSS_FILES = ['editions.css', 'editions-b.css', 'editions-indian.css'];

/** Registered Edition/composition files that render real dish items (own rows, not just data pass-through). */
const EDITION_TSX_FILES = readdirSync(EDITIONS_DIR).filter((f) => f.endsWith('Edition.tsx'));

let findings = [];

// ---------------------------------------------------------------------------
// Check 1 + 2: CSS static scan
// ---------------------------------------------------------------------------

const NAME_DESC_CLASS = /\.([\w-]*(?:dish-name|dish-desc|card-name|card-desc|leader-name|leader-desc)[\w-]*)\s*\{([^}]*)\}/g;
const FONT_SIZE_DECL = /font-size\s*:\s*([^;]+);/;
const TOKEN_REF = /var\(--mq-(?:text|display)-/;

const GRID_FLOOR = /grid-template-columns\s*:\s*repeat\(auto-fit,\s*minmax\(([^,]+),/g;
const SAFE_FLOOR = /min\(/;

/** Blanks out every `@media (max-width: ...) { ... }` block's contents (brace-balanced), keeping
 * everything else and every other character position unchanged — mobile-relief overrides are
 * deliberately flat px values (matching `menu-renderer.css`'s own `.mq-page` precedent), not a
 * token-compliance bug, so they are not scanned for font-size token usage. */
function blankMobileMediaBlocks(content) {
  const out = content.split('');
  const re = /@media\s*\(max-width:[^)]*\)\s*\{/g;
  let m;
  while ((m = re.exec(content))) {
    let depth = 1;
    let i = m.index + m[0].length;
    for (; i < content.length && depth > 0; i++) {
      if (content[i] === '{') depth++;
      else if (content[i] === '}') depth--;
    }
    for (let j = m.index; j < i; j++) if (content[j] !== '\n') out[j] = ' ';
  }
  return out.join('');
}

for (const cssFile of CSS_FILES) {
  const path = join(EDITIONS_DIR, cssFile);
  let rawContent;
  try {
    rawContent = readFileSync(path, 'utf8');
  } catch {
    continue;
  }
  const content = blankMobileMediaBlocks(rawContent);

  let m;
  NAME_DESC_CLASS.lastIndex = 0;
  while ((m = NAME_DESC_CLASS.exec(content))) {
    const [, className, body] = m;
    const fontSizeMatch = body.match(FONT_SIZE_DECL);
    if (fontSizeMatch && !TOKEN_REF.test(fontSizeMatch[1])) {
      findings.push(
        `[CSS][font-size] ${cssFile} .${className} — font-size: ${fontSizeMatch[1].trim()} does not reference a --mq-text-*/--mq-display-* token.`
      );
    }
  }

  GRID_FLOOR.lastIndex = 0;
  while ((m = GRID_FLOOR.exec(content))) {
    const floor = m[1].trim();
    if (!SAFE_FLOOR.test(floor)) {
      const line = content.slice(0, m.index).split('\n').length;
      findings.push(
        `[CSS][grid-floor] ${cssFile}:${line} — minmax(${floor}, ...) has no min(100%, ...) wrapper; it can overflow a narrow phone.`
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Check 3: every field-wiring manifest
// ---------------------------------------------------------------------------

/** Files that intentionally render no per-dish badges at all (checked once, not drifted silently). */
const EXEMPT = new Set([]);

const FIELD_MANIFEST = ['trending', 'isBestseller', 'tags'];

for (const file of EDITION_TSX_FILES) {
  if (EXEMPT.has(file)) continue;
  const content = readFileSync(join(EDITIONS_DIR, file), 'utf8');

  // `Leader` and `PhotoDish` (shared.tsx) both render `<DishFlags>` internally, so a file that
  // delegates to either one gets full field coverage without calling `DishFlags` itself.
  const usesDishFlags = content.includes('DishFlags') || content.includes('<Leader') || content.includes('<PhotoDish');
  if (usesDishFlags) continue;

  const rendersItems = /\.items\.map\(|\bitem\.name\b/.test(content);
  if (!rendersItems) continue; // Not a dish-row renderer (shouldn't happen for a registered Edition, but skip safely).

  const present = FIELD_MANIFEST.filter((f) => content.includes(`item.${f}`) || content.includes(`item.tags?.`));
  const missing = FIELD_MANIFEST.filter((f) => !present.includes(f));
  if (missing.length > 0 && present.length > 0) {
    findings.push(
      `[FIELD-COVERAGE] editions/${file} — references ${present.join(', ')} but not ${missing.join(', ')}; a dish tagged with a missing field renders with no visible indicator on this template. Wire in <DishFlags item={item} /> or add the missing checks explicitly.`
    );
  } else if (present.length === 0) {
    findings.push(
      `[FIELD-COVERAGE] editions/${file} — renders dish items but references none of ${FIELD_MANIFEST.join(', ')} and does not use <DishFlags>; allergen/Jain/eggless/spice/trending/bestseller data tagged by the owner will never be visible on this template.`
    );
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

if (findings.length > 0) {
  console.error(`check-editions: ${findings.length} finding(s)\n`);
  for (const f of findings) console.error(' - ' + f);
  process.exit(1);
} else {
  console.log(`check-editions: clean (${EDITION_TSX_FILES.length} Edition files, ${CSS_FILES.length} CSS files scanned)`);
}
