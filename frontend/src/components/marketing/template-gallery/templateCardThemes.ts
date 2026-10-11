import type { MenuTemplate } from '../../../data/menuTemplates';

export interface TemplateCardTheme {
  // Main container styles
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  
  // Left column (Phone stage)
  stageBg: string;
  stageGlow: string;
  floorReflection: string;
  phoneScreenBg: string;

  // Right column (Editorial specs)
  editorialBg: string;
  indexColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  categoryPillBg: string;
  categoryPillText: string;
  categoryPillBorder: string;
  headingColor: string;
  subtitleColor: string;
  descriptionColor: string;
  specsLabelColor: string;
  specsValueColor: string;
  specsBorder: string;
  paletteLabelColor: string;

  // CTA Button
  ctaBg: string;
  ctaText: string;
  ctaHoverBg: string;
  ctaBorder?: string;
}

const THEME_MAP: Record<string, Partial<TemplateCardTheme>> = {
  // 01. Mughal Luxe (Emerald & Antique Gold)
  'mughal-luxe': {
    cardBg: 'linear-gradient(135deg, #064F43 0%, #032A24 100%)',
    cardBorder: 'rgba(215, 182, 109, 0.45)',
    cardShadow: '0 24px 70px rgba(6, 79, 67, 0.45)',
    stageBg: 'linear-gradient(135deg, #021810 0%, #042A24 60%, #031A14 100%)',
    stageGlow: '#D7B66D',
    floorReflection: 'rgba(215, 182, 109, 0.12)',
    phoneScreenBg: '#064F43',
    editorialBg: 'linear-gradient(135deg, rgba(6,79,67,0.96) 0%, rgba(7,61,52,0.96) 50%, rgba(4,40,33,0.98) 100%)',
    indexColor: '#D7B66D',
    badgeBg: 'rgba(215, 182, 109, 0.15)',
    badgeText: '#D7B66D',
    badgeBorder: 'rgba(215, 182, 109, 0.45)',
    categoryPillBg: 'rgba(6, 79, 67, 0.85)',
    categoryPillText: '#EBD69A',
    categoryPillBorder: 'rgba(215, 182, 109, 0.4)',
    headingColor: '#F5EBDD',
    subtitleColor: '#D7B66D',
    descriptionColor: 'rgba(245, 235, 221, 0.9)',
    specsLabelColor: 'rgba(215, 182, 109, 0.85)',
    specsValueColor: '#F5EBDD',
    specsBorder: 'rgba(215, 182, 109, 0.3)',
    paletteLabelColor: 'rgba(215, 182, 109, 0.75)',
    ctaBg: '#D7B66D',
    ctaText: '#064F43',
    ctaHoverBg: '#EBD69A',
  },

  // 02. Royal Maharaja (Palace Wine & Double Gold)
  'royal-maharaja': {
    cardBg: 'linear-gradient(135deg, #2A081A 0%, #17040F 100%)',
    cardBorder: 'rgba(212, 175, 55, 0.45)',
    cardShadow: '0 24px 70px rgba(42, 8, 26, 0.55)',
    stageBg: 'linear-gradient(135deg, #12030B 0%, #220615 60%, #0F0209 100%)',
    stageGlow: '#D4AF37',
    floorReflection: 'rgba(212, 175, 55, 0.12)',
    phoneScreenBg: '#2A081A',
    editorialBg: 'linear-gradient(135deg, rgba(42,8,26,0.96) 0%, rgba(30,6,18,0.96) 50%, rgba(18,3,11,0.98) 100%)',
    indexColor: '#D4AF37',
    badgeBg: 'rgba(212, 175, 55, 0.15)',
    badgeText: '#D4AF37',
    badgeBorder: 'rgba(212, 175, 55, 0.4)',
    categoryPillBg: 'rgba(42, 8, 26, 0.85)',
    categoryPillText: '#F3D882',
    categoryPillBorder: 'rgba(212, 175, 55, 0.4)',
    headingColor: '#FAF3E0',
    subtitleColor: '#D4AF37',
    descriptionColor: 'rgba(250, 243, 224, 0.9)',
    specsLabelColor: 'rgba(212, 175, 55, 0.85)',
    specsValueColor: '#FAF3E0',
    specsBorder: 'rgba(212, 175, 55, 0.3)',
    paletteLabelColor: 'rgba(212, 175, 55, 0.75)',
    ctaBg: '#D4AF37',
    ctaText: '#2A081A',
    ctaHoverBg: '#F3D882',
  },

  // 03. Rajasthani Heritage (Botanical Parchment & Deep Teal / Terracotta)
  'rajasthani-heritage': {
    cardBg: 'linear-gradient(135deg, #203A34 0%, #122420 100%)',
    cardBorder: 'rgba(215, 108, 60, 0.55)',
    cardShadow: '0 24px 70px rgba(32, 58, 52, 0.5)',
    stageBg: 'linear-gradient(135deg, #0D1A17 0%, #1A2F2B 60%, #0A1412 100%)',
    stageGlow: '#D76C3C',
    floorReflection: 'rgba(215, 108, 60, 0.12)',
    phoneScreenBg: '#F7EBD7',
    editorialBg: 'linear-gradient(135deg, rgba(32,58,52,0.96) 0%, rgba(24,44,40,0.96) 50%, rgba(16,30,27,0.98) 100%)',
    indexColor: '#FFA57D',
    badgeBg: 'rgba(215, 108, 60, 0.2)',
    badgeText: '#FFA57D',
    badgeBorder: 'rgba(215, 108, 60, 0.55)',
    categoryPillBg: 'rgba(49, 90, 83, 0.85)',
    categoryPillText: '#F7EBD7',
    categoryPillBorder: 'rgba(215, 108, 60, 0.45)',
    headingColor: '#F7EBD7',
    subtitleColor: '#FFA57D',
    descriptionColor: 'rgba(247, 235, 215, 0.92)',
    specsLabelColor: 'rgba(255, 165, 125, 0.9)',
    specsValueColor: '#F7EBD7',
    specsBorder: 'rgba(215, 108, 60, 0.35)',
    paletteLabelColor: 'rgba(255, 165, 125, 0.75)',
    ctaBg: '#D76C3C',
    ctaText: '#FFFFFF',
    ctaHoverBg: '#E87D50',
  },

  // 04. Banarasi Gold (Burgundy Silk Canvas & Zari Gold)
  'banarasi-gold': {
    cardBg: 'linear-gradient(135deg, #28081B 0%, #170410 100%)',
    cardBorder: 'rgba(255, 215, 0, 0.45)',
    cardShadow: '0 24px 70px rgba(40, 8, 27, 0.6)',
    stageBg: 'linear-gradient(135deg, #13030D 0%, #200615 60%, #10020B 100%)',
    stageGlow: '#FFD700',
    floorReflection: 'rgba(255, 215, 0, 0.12)',
    phoneScreenBg: '#28081B',
    editorialBg: 'linear-gradient(135deg, rgba(40,8,27,0.96) 0%, rgba(30,6,20,0.96) 50%, rgba(18,3,12,0.98) 100%)',
    indexColor: '#FFD700',
    badgeBg: 'rgba(255, 215, 0, 0.15)',
    badgeText: '#FFD700',
    badgeBorder: 'rgba(255, 215, 0, 0.45)',
    categoryPillBg: 'rgba(40, 8, 27, 0.85)',
    categoryPillText: '#FFE47A',
    categoryPillBorder: 'rgba(255, 215, 0, 0.4)',
    headingColor: '#FFD700',
    subtitleColor: '#E0A96D',
    descriptionColor: 'rgba(255, 249, 239, 0.9)',
    specsLabelColor: 'rgba(255, 215, 0, 0.85)',
    specsValueColor: '#FFF9EF',
    specsBorder: 'rgba(255, 215, 0, 0.3)',
    paletteLabelColor: 'rgba(255, 215, 0, 0.75)',
    ctaBg: '#FFD700',
    ctaText: '#28081B',
    ctaHoverBg: '#FFE24D',
  },

  // 05. South Indian Heritage (Temple Crimson & Brass Gold)
  'south-indian-heritage': {
    cardBg: 'linear-gradient(135deg, #380E0E 0%, #1E0606 100%)',
    cardBorder: 'rgba(194, 136, 56, 0.45)',
    cardShadow: '0 24px 70px rgba(56, 14, 14, 0.55)',
    stageBg: 'linear-gradient(135deg, #160404 0%, #290909 60%, #120303 100%)',
    stageGlow: '#C28838',
    floorReflection: 'rgba(194, 136, 56, 0.12)',
    phoneScreenBg: '#FFFDF7',
    editorialBg: 'linear-gradient(135deg, rgba(56,14,14,0.96) 0%, rgba(42,10,10,0.96) 50%, rgba(24,5,5,0.98) 100%)',
    indexColor: '#E5AB5B',
    badgeBg: 'rgba(194, 136, 56, 0.18)',
    badgeText: '#E5AB5B',
    badgeBorder: 'rgba(194, 136, 56, 0.45)',
    categoryPillBg: 'rgba(56, 14, 14, 0.85)',
    categoryPillText: '#F0C988',
    categoryPillBorder: 'rgba(194, 136, 56, 0.4)',
    headingColor: '#FFFDF7',
    subtitleColor: '#E5AB5B',
    descriptionColor: 'rgba(255, 253, 247, 0.9)',
    specsLabelColor: 'rgba(229, 171, 91, 0.85)',
    specsValueColor: '#FFFDF7',
    specsBorder: 'rgba(194, 136, 56, 0.3)',
    paletteLabelColor: 'rgba(229, 171, 91, 0.75)',
    ctaBg: '#C28838',
    ctaText: '#1E0606',
    ctaHoverBg: '#E5AB5B',
  },

  // 06. Indian Street Kitchen (High-Impact Street Orange & Chili Red)
  'indian-street-kitchen': {
    cardBg: 'linear-gradient(135deg, #24140E 0%, #140A07 100%)',
    cardBorder: 'rgba(232, 90, 42, 0.55)',
    cardShadow: '0 24px 70px rgba(232, 90, 42, 0.25)',
    stageBg: 'linear-gradient(135deg, #140905 0%, #220F09 60%, #110704 100%)',
    stageGlow: '#E85A2A',
    floorReflection: 'rgba(232, 90, 42, 0.12)',
    phoneScreenBg: '#FFF9F2',
    editorialBg: 'linear-gradient(135deg, rgba(36,20,14,0.96) 0%, rgba(26,14,10,0.96) 50%, rgba(18,9,6,0.98) 100%)',
    indexColor: '#E85A2A',
    badgeBg: 'rgba(232, 90, 42, 0.2)',
    badgeText: '#FF7A4D',
    badgeBorder: 'rgba(232, 90, 42, 0.55)',
    categoryPillBg: 'rgba(36, 20, 14, 0.85)',
    categoryPillText: '#FFA07A',
    categoryPillBorder: 'rgba(232, 90, 42, 0.45)',
    headingColor: '#FF6E38',
    subtitleColor: '#FFA07A',
    descriptionColor: 'rgba(255, 249, 242, 0.92)',
    specsLabelColor: 'rgba(255, 122, 77, 0.85)',
    specsValueColor: '#FFF9F2',
    specsBorder: 'rgba(232, 90, 42, 0.3)',
    paletteLabelColor: 'rgba(255, 122, 77, 0.75)',
    ctaBg: '#E85A2A',
    ctaText: '#FFFFFF',
    ctaHoverBg: '#FF7547',
  },

  // 07. Modern India (Fashion Editorial Slate & Tangerine)
  'modern-india': {
    cardBg: 'linear-gradient(135deg, #1C1E24 0%, #0F1014 100%)',
    cardBorder: 'rgba(232, 120, 60, 0.45)',
    cardShadow: '0 24px 70px rgba(15, 16, 20, 0.6)',
    stageBg: 'linear-gradient(135deg, #0C0D10 0%, #18191E 60%, #0A0B0D 100%)',
    stageGlow: '#E8783C',
    floorReflection: 'rgba(232, 120, 60, 0.12)',
    phoneScreenBg: '#F6F4F0',
    editorialBg: 'linear-gradient(135deg, rgba(28,30,36,0.96) 0%, rgba(20,22,26,0.96) 50%, rgba(13,14,17,0.98) 100%)',
    indexColor: '#E8783C',
    badgeBg: 'rgba(232, 120, 60, 0.16)',
    badgeText: '#FFA066',
    badgeBorder: 'rgba(232, 120, 60, 0.4)',
    categoryPillBg: 'rgba(28, 30, 36, 0.85)',
    categoryPillText: '#E2E8F0',
    categoryPillBorder: 'rgba(232, 120, 60, 0.35)',
    headingColor: '#FFFFFF',
    subtitleColor: '#FFA066',
    descriptionColor: 'rgba(246, 244, 240, 0.88)',
    specsLabelColor: 'rgba(232, 120, 60, 0.85)',
    specsValueColor: '#F6F4F0',
    specsBorder: 'rgba(232, 120, 60, 0.25)',
    paletteLabelColor: 'rgba(232, 120, 60, 0.75)',
    ctaBg: '#E8783C',
    ctaText: '#FFFFFF',
    ctaHoverBg: '#FF8C4D',
  },

  // 08. Bombay Street (Mumbai Irani Red & Chai Spices)
  'bombay-street': {
    cardBg: 'linear-gradient(135deg, #261214 0%, #140809 100%)',
    cardBorder: 'rgba(200, 35, 35, 0.55)',
    cardShadow: '0 24px 70px rgba(200, 35, 35, 0.25)',
    stageBg: 'linear-gradient(135deg, #140708 0%, #200C0E 60%, #100506 100%)',
    stageGlow: '#F26522',
    floorReflection: 'rgba(200, 35, 35, 0.12)',
    phoneScreenBg: '#FFFDF2',
    editorialBg: 'linear-gradient(135deg, rgba(38,18,20,0.96) 0%, rgba(26,12,14,0.96) 50%, rgba(18,7,8,0.98) 100%)',
    indexColor: '#F26522',
    badgeBg: 'rgba(242, 101, 34, 0.2)',
    badgeText: '#FF8246',
    badgeBorder: 'rgba(242, 101, 34, 0.5)',
    categoryPillBg: 'rgba(38, 18, 20, 0.85)',
    categoryPillText: '#FFAB82',
    categoryPillBorder: 'rgba(200, 35, 35, 0.45)',
    headingColor: '#FF4D4D',
    subtitleColor: '#FF8C5A',
    descriptionColor: 'rgba(255, 253, 242, 0.9)',
    specsLabelColor: 'rgba(242, 101, 34, 0.85)',
    specsValueColor: '#FFFDF2',
    specsBorder: 'rgba(200, 35, 35, 0.3)',
    paletteLabelColor: 'rgba(242, 101, 34, 0.75)',
    ctaBg: '#C82323',
    ctaText: '#FFFFFF',
    ctaHoverBg: '#E03232',
  },

  // 09. Coffee House (Artisanal Roasted Espresso & Caramel)
  'coffee-house': {
    cardBg: 'linear-gradient(135deg, #2E1C14 0%, #1A0F0A 100%)',
    cardBorder: 'rgba(224, 169, 109, 0.45)',
    cardShadow: '0 24px 70px rgba(46, 28, 20, 0.6)',
    stageBg: 'linear-gradient(135deg, #160D09 0%, #24160F 60%, #130B07 100%)',
    stageGlow: '#E0A96D',
    floorReflection: 'rgba(224, 169, 109, 0.12)',
    phoneScreenBg: '#2E1C14',
    editorialBg: 'linear-gradient(135deg, rgba(46,28,20,0.96) 0%, rgba(34,20,14,0.96) 50%, rgba(22,12,8,0.98) 100%)',
    indexColor: '#E0A96D',
    badgeBg: 'rgba(224, 169, 109, 0.16)',
    badgeText: '#F0BD84',
    badgeBorder: 'rgba(224, 169, 109, 0.4)',
    categoryPillBg: 'rgba(46, 28, 20, 0.85)',
    categoryPillText: '#F2D3AF',
    categoryPillBorder: 'rgba(224, 169, 109, 0.35)',
    headingColor: '#FFFDF7',
    subtitleColor: '#F0BD84',
    descriptionColor: 'rgba(255, 253, 247, 0.88)',
    specsLabelColor: 'rgba(224, 169, 109, 0.85)',
    specsValueColor: '#FFFDF7',
    specsBorder: 'rgba(224, 169, 109, 0.3)',
    paletteLabelColor: 'rgba(224, 169, 109, 0.75)',
    ctaBg: '#E0A96D',
    ctaText: '#2E1C14',
    ctaHoverBg: '#EFC492',
  },

  // 10. Minimal Editorial (Obsidian Architectural Luxury)
  'minimal-editorial': {
    cardBg: 'linear-gradient(135deg, #16171B 0%, #0C0D0E 100%)',
    cardBorder: 'rgba(255, 255, 255, 0.22)',
    cardShadow: '0 24px 70px rgba(0, 0, 0, 0.7)',
    stageBg: 'linear-gradient(135deg, #090A0B 0%, #131417 60%, #080809 100%)',
    stageGlow: '#E8783C',
    floorReflection: 'rgba(255, 255, 255, 0.08)',
    phoneScreenBg: '#FAFAF8',
    editorialBg: 'linear-gradient(135deg, rgba(22,23,27,0.96) 0%, rgba(16,17,20,0.96) 50%, rgba(10,10,12,0.98) 100%)',
    indexColor: '#E8783C',
    badgeBg: 'rgba(255, 255, 255, 0.08)',
    badgeText: '#E4E4E7',
    badgeBorder: 'rgba(255, 255, 255, 0.25)',
    categoryPillBg: 'rgba(22, 23, 27, 0.85)',
    categoryPillText: '#E4E4E7',
    categoryPillBorder: 'rgba(255, 255, 255, 0.2)',
    headingColor: '#FFFFFF',
    subtitleColor: '#A1A1AA',
    descriptionColor: 'rgba(250, 250, 248, 0.88)',
    specsLabelColor: 'rgba(232, 120, 60, 0.85)',
    specsValueColor: '#FAFAF8',
    specsBorder: 'rgba(255, 255, 255, 0.15)',
    paletteLabelColor: 'rgba(232, 120, 60, 0.75)',
    ctaBg: '#FFFFFF',
    ctaText: '#18181B',
    ctaHoverBg: '#E4E4E7',
  },
};

export function getTemplateCardTheme(template: MenuTemplate): TemplateCardTheme {
  const custom = THEME_MAP[template.id];
  const accent = template.colors.accent || '#D7B66D';
  const bg = template.colors.bg || '#064F43';

  // Fallback defaults for any unanticipated template ID
  const defaults: TemplateCardTheme = {
    cardBg: `linear-gradient(135deg, ${bg} 0%, #0A0D0C 100%)`,
    cardBorder: 'rgba(255, 255, 255, 0.2)',
    cardShadow: '0 24px 70px rgba(0,0,0,0.5)',
    stageBg: 'linear-gradient(135deg, #090B0A 0%, #141A17 60%, #0A0D0C 100%)',
    stageGlow: accent,
    floorReflection: 'rgba(255, 255, 255, 0.08)',
    phoneScreenBg: bg,
    editorialBg: 'linear-gradient(135deg, rgba(20,26,24,0.96) 0%, rgba(10,13,12,0.98) 100%)',
    indexColor: accent,
    badgeBg: 'rgba(255, 255, 255, 0.1)',
    badgeText: '#FFFFFF',
    badgeBorder: 'rgba(255, 255, 255, 0.25)',
    categoryPillBg: 'rgba(255, 255, 255, 0.08)',
    categoryPillText: '#FFFFFF',
    categoryPillBorder: 'rgba(255, 255, 255, 0.2)',
    headingColor: '#FFFFFF',
    subtitleColor: accent,
    descriptionColor: 'rgba(255, 255, 255, 0.88)',
    specsLabelColor: accent,
    specsValueColor: '#FFFFFF',
    specsBorder: 'rgba(255, 255, 255, 0.2)',
    paletteLabelColor: accent,
    ctaBg: accent,
    ctaText: '#000000',
    ctaHoverBg: '#FFFFFF',
  };

  return { ...defaults, ...custom };
}

export function getLayoutLabel(template: MenuTemplate): string {
  const map: Record<string, string> = {
    editorial: 'Editorial Spread & Arch',
    centered: 'Royal Centered Spread',
    'two-column': 'Asymmetric 2-Column',
    'card-grid': 'High-Impact Card Grid',
    'left-aligned': 'Left-Aligned Architecture',
    magazine: 'Food Magazine Spread',
  };
  return map[template.layout.type] || `${template.layout.type} ${template.layout.headerStyle}`;
}

export function getItemStyleLabel(template: MenuTemplate): string {
  const map: Record<string, string> = {
    'detailed-card': 'Detailed Heritage Cards',
    card: 'Gold-Framed Cards',
    'compact-badge': 'Badges & Action Tags',
    list: 'Editorial Line List',
    'image-card': 'Curated Food Collages',
    michelin: 'Minimal Tasting Spacing',
    inline: 'Artisanal Inline Notes',
  };
  return map[template.layout.itemStyle] || template.layout.itemStyle;
}

export function getTypographyLabel(template: MenuTemplate): string {
  const primaryFont = template.typography.heading.split(',')[0].replace(/['"]/g, '').trim();
  const style = template.typography.style;
  return `${primaryFont} • ${style.charAt(0).toUpperCase() + style.slice(1)}`;
}
