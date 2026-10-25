// MENUQR Backend Design Specification Validator & Sanitizer

const SAFE_COLOR_REGEX = /^(#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)|hsl\([^)]+\)|transparent)$/;

export function isValidColor(val) {
  if (typeof val !== 'string') return false;
  return SAFE_COLOR_REGEX.test(val.trim());
}

const ALLOWED_COMPOSITIONS = ['editorial', 'image-showcase', 'compact-bistro', 'heritage-artboard', 'chalkboard-artboard', 'parametric-artboard'];
const ALLOWED_TYPOGRAPHY_STYLES = ['serif', 'sans', 'display', 'editorial'];
const ALLOWED_WEIGHTS = ['light', 'normal', 'bold', 'black'];
const ALLOWED_HEADER_STYLES = ['centered-crest', 'split-masthead', 'minimal-stacked', 'banner-hero'];
const ALLOWED_DECORATIVE_ELEMENTS = ['crest', 'minimal-line', 'botanical', 'dots', 'none'];
const ALLOWED_CREST_TYPES = ['crown', 'lotus', 'coffee', 'star', 'none'];
const ALLOWED_NAV_STYLES = ['pills', 'underline', 'chips', 'floating-glass'];
const ALLOWED_CATEGORY_HEADER_STYLES = ['divider-line', 'arch', 'badge', 'minimal-subtle'];
const ALLOWED_CARD_STYLES = ['classic-leader', 'photo-hero', 'modern-card', 'compact-row'];
const ALLOWED_IMAGE_POSITIONS = ['top', 'right', 'left', 'none'];
const ALLOWED_PRICE_STYLES = ['aligned-right', 'pill-badge', 'bold-inline'];
const ALLOWED_TEXTURES = ['subtle-grain', 'silk-lattice', 'parchment', 'clean', 'dots'];
const ALLOWED_RADII = ['none', 'sm', 'md', 'lg', 'xl', 'full'];
const ALLOWED_BORDER_STYLES = ['none', 'hairline', 'solid', 'double'];
const ALLOWED_SHADOWS = ['none', 'subtle', 'elevated', 'glass'];

const ALLOWED_FONTS = [
  "'Playfair Display', serif",
  "'Cinzel', serif",
  "'Bodoni Moda', serif",
  "'Cormorant Garamond', serif",
  "'Plus Jakarta Sans', sans-serif",
  "'Montserrat', sans-serif",
  "'Inter', sans-serif",
  "'Oswald', sans-serif",
  "'Bebas Neue', sans-serif",
  "'Anton', sans-serif",
  "'Philosopher', sans-serif",
  "'Caveat', cursive",
  "'Amatic SC', cursive",
  "'Rozha One', serif",
];

export function sanitizeFont(font, fallback) {
  if (typeof font !== 'string') return fallback;
  const clean = font.trim();
  // Check if it matches an allowed font or is a safe standard web font declaration
  if (ALLOWED_FONTS.includes(clean)) return clean;
  // If clean contains only safe font characters: letters, quotes, spaces, comma
  if (/^[a-zA-Z0-9\s,'"-]+$/.test(clean) && !/[<>{}\\]/.test(clean)) {
    return clean;
  }
  return fallback;
}

export function validateDesignSpecification(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const data = raw;
  if (data.version !== '1.0') return null;

  if (!data.composition || !ALLOWED_COMPOSITIONS.includes(data.composition)) {
    return null;
  }

  if (!data.colors || typeof data.colors !== 'object') return null;
  const c = data.colors;
  if (
    !isValidColor(c.bg) ||
    !isValidColor(c.surface) ||
    !isValidColor(c.text) ||
    !isValidColor(c.heading) ||
    !isValidColor(c.accent) ||
    !isValidColor(c.border)
  ) {
    return null;
  }

  const composition = data.composition;

  return {
    version: '1.0',
    composition,
    themeId: typeof data.themeId === 'string' ? data.themeId.slice(0, 100) : undefined,
    colors: {
      bg: c.bg,
      surface: c.surface,
      surfaceAlt: isValidColor(c.surfaceAlt) ? c.surfaceAlt : c.surface,
      text: c.text,
      textMuted: isValidColor(c.textMuted) ? c.textMuted : c.text,
      heading: c.heading,
      accent: c.accent,
      border: c.border,
      badgeBg: isValidColor(c.badgeBg) ? c.badgeBg : c.accent,
      badgeText: isValidColor(c.badgeText) ? c.badgeText : '#FFFFFF',
    },
    typography: {
      headingFont: sanitizeFont(data.typography?.headingFont, composition === 'editorial' ? "'Playfair Display', serif" : composition === 'image-showcase' ? "'Montserrat', sans-serif" : "'Oswald', sans-serif"),
      bodyFont: sanitizeFont(data.typography?.bodyFont, "'Plus Jakarta Sans', sans-serif"),
      style: ALLOWED_TYPOGRAPHY_STYLES.includes(data.typography?.style) ? data.typography.style : 'serif',
      headingWeight: ALLOWED_WEIGHTS.includes(data.typography?.headingWeight) ? data.typography.headingWeight : 'bold',
    },
    header: {
      style: ALLOWED_HEADER_STYLES.includes(data.header?.style) ? data.header.style : (composition === 'editorial' ? 'centered-crest' : composition === 'image-showcase' ? 'split-masthead' : 'minimal-stacked'),
      showLogo: Boolean(data.header?.showLogo ?? true),
      decorativeElement: ALLOWED_DECORATIVE_ELEMENTS.includes(data.header?.decorativeElement) ? data.header.decorativeElement : 'crest',
      crestType: ALLOWED_CREST_TYPES.includes(data.header?.crestType) ? data.header.crestType : 'none',
    },
    categories: {
      navStyle: ALLOWED_NAV_STYLES.includes(data.categories?.navStyle) ? data.categories.navStyle : 'pills',
      headerStyle: ALLOWED_CATEGORY_HEADER_STYLES.includes(data.categories?.headerStyle) ? data.categories.headerStyle : 'divider-line',
    },
    items: {
      cardStyle: ALLOWED_CARD_STYLES.includes(data.items?.cardStyle) ? data.items.cardStyle : (composition === 'image-showcase' ? 'photo-hero' : composition === 'compact-bistro' ? 'compact-row' : 'classic-leader'),
      imagePosition: ALLOWED_IMAGE_POSITIONS.includes(data.items?.imagePosition) ? data.items.imagePosition : (composition === 'image-showcase' ? 'top' : 'right'),
      priceStyle: ALLOWED_PRICE_STYLES.includes(data.items?.priceStyle) ? data.items.priceStyle : 'aligned-right',
    },
    decorations: {
      texture: ALLOWED_TEXTURES.includes(data.decorations?.texture) ? data.decorations.texture : 'clean',
      borderRadius: ALLOWED_RADII.includes(data.decorations?.borderRadius) ? data.decorations.borderRadius : (composition === 'image-showcase' ? 'xl' : 'md'),
      borderStyle: ALLOWED_BORDER_STYLES.includes(data.decorations?.borderStyle) ? data.decorations.borderStyle : 'hairline',
      shadow: ALLOWED_SHADOWS.includes(data.decorations?.shadow) ? data.decorations.shadow : 'subtle',
    },
    layoutGrammar: sanitizeLayoutGrammar(data.layoutGrammar, composition),
  };
}

function sanitizeLayoutGrammar(g, composition) {
  if (!g || typeof g !== 'object') {
    if (composition === 'chalkboard-artboard') {
      return {
        containerMetaphor: 'clipboard',
        pageLayout: { columns: 2, columnBalance: 'equal' },
        categoryStyle: { badgeType: 'banner-ribbon' },
        itemStyle: { presentation: 'dotted-leader', pricePlacement: 'dotted-end', showImages: false },
      };
    }
    return undefined;
  }

  const validMetaphors = ['clipboard', 'leather-folio', 'parchment', 'newspaper', 'minimal-sheet', 'glassmorphism'];
  const metaphor = validMetaphors.includes(g.containerMetaphor)
    ? g.containerMetaphor
    : (composition === 'chalkboard-artboard' ? 'clipboard' : 'minimal-sheet');

  return {
    containerMetaphor: metaphor,
    containerTexture: typeof g.containerTexture === 'string' ? g.containerTexture.slice(0, 50) : undefined,
    coverPage: g.coverPage && typeof g.coverPage === 'object' ? {
      enabled: Boolean(g.coverPage.enabled),
      titleLayout: ['stamp-ribbon', 'crest-centered', 'split-masthead', 'minimal-clean'].includes(g.coverPage.titleLayout) ? g.coverPage.titleLayout : 'stamp-ribbon',
      ribbonText: typeof g.coverPage.ribbonText === 'string' ? g.coverPage.ribbonText.slice(0, 50) : undefined,
      heroPlatter: Boolean(g.coverPage.heroPlatter),
      badges: Array.isArray(g.coverPage.badges) ? g.coverPage.badges.slice(0, 6).map(b => ({ label: String(b?.label || '').slice(0, 30), value: String(b?.value || '').slice(0, 30) })) : [],
      footerText: typeof g.coverPage.footerText === 'string' ? g.coverPage.footerText.slice(0, 200) : undefined,
    } : undefined,
    pageLayout: {
      columns: [1, 2, 3].includes(g.pageLayout?.columns) ? g.pageLayout.columns : 2,
      columnBalance: ['equal', 'featured-left', 'featured-right'].includes(g.pageLayout?.columnBalance) ? g.pageLayout.columnBalance : 'equal',
    },
    categoryStyle: {
      badgeType: ['banner-ribbon', 'chalk-badge', 'minimal-underline', 'royal-crest', 'solid-chip'].includes(g.categoryStyle?.badgeType) ? g.categoryStyle.badgeType : 'banner-ribbon',
      badgeColor: isValidColor(g.categoryStyle?.badgeColor) ? g.categoryStyle.badgeColor : undefined,
      badgeTextColor: isValidColor(g.categoryStyle?.badgeTextColor) ? g.categoryStyle.badgeTextColor : undefined,
    },
    itemStyle: {
      presentation: ['dotted-leader', 'modern-card', 'compact-row', 'framed-box'].includes(g.itemStyle?.presentation) ? g.itemStyle.presentation : 'dotted-leader',
      pricePlacement: ['dotted-end', 'boxed-right', 'subhead-pill'].includes(g.itemStyle?.pricePlacement) ? g.itemStyle.pricePlacement : 'dotted-end',
      showImages: Boolean(g.itemStyle?.showImages),
      imageShape: ['round', 'rounded-rect', 'thumbnail'].includes(g.itemStyle?.imageShape) ? g.itemStyle.imageShape : 'rounded-rect',
    },
    calloutBoxes: Array.isArray(g.calloutBoxes) ? g.calloutBoxes.slice(0, 10).map(cb => ({
      categoryMatch: String(cb?.categoryMatch || '').slice(0, 60),
      style: ['double-border', 'chalk-frame', 'gold-foil', 'tinted-card'].includes(cb?.style) ? cb.style : 'double-border',
      badgeText: typeof cb?.badgeText === 'string' ? cb.badgeText.slice(0, 40) : undefined,
    })) : [],
  };
}
