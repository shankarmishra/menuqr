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
  // 01. Mughal Luxe (Imperial Emerald Green & Antique Gold Foil)
  'mughal-luxe': {
    cardBg: 'linear-gradient(135deg, #07483D 0%, #032A24 100%)',
    cardBorder: 'rgba(215, 182, 109, 0.45)',
    cardShadow: '0 24px 60px -15px rgba(6, 79, 67, 0.45), 0 8px 24px -6px rgba(6, 79, 67, 0.2)',
    stageBg: 'linear-gradient(135deg, #021E18 0%, #063C33 100%)',
    stageGlow: '#D7B66D',
    floorReflection: 'rgba(215, 182, 109, 0.14)',
    phoneScreenBg: '#064F43',
    editorialBg: 'linear-gradient(135deg, #07483D 0%, #032A24 100%)',
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

  // 02. Royal Maharaja (Regal Velvet Palace Wine & Imperial Double Gold)
  'royal-maharaja': {
    cardBg: 'linear-gradient(135deg, #3B0D28 0%, #200515 100%)',
    cardBorder: 'rgba(212, 175, 55, 0.45)',
    cardShadow: '0 24px 60px -15px rgba(59, 13, 40, 0.5), 0 8px 24px -6px rgba(59, 13, 40, 0.25)',
    stageBg: 'linear-gradient(135deg, #220516 0%, #350A23 100%)',
    stageGlow: '#D4AF37',
    floorReflection: 'rgba(212, 175, 55, 0.14)',
    phoneScreenBg: '#2A081A',
    editorialBg: 'linear-gradient(135deg, #3B0D28 0%, #200515 100%)',
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

  // 03. Rajasthani Heritage (Warm Antique Botanical Parchment & Deep Teal / Terracotta)
  'rajasthani-heritage': {
    cardBg: 'linear-gradient(135deg, #FAF2E3 0%, #F3E3CB 100%)',
    cardBorder: 'rgba(215, 108, 60, 0.4)',
    cardShadow: '0 24px 60px -15px rgba(49, 90, 83, 0.2), 0 8px 24px -6px rgba(49, 90, 83, 0.1)',
    stageBg: 'linear-gradient(135deg, #F4E7D0 0%, #E9D5BC 100%)',
    stageGlow: '#D76C3C',
    floorReflection: 'rgba(215, 108, 60, 0.15)',
    phoneScreenBg: '#F7EBD7',
    editorialBg: 'linear-gradient(135deg, #FAF2E3 0%, #F5E5D0 100%)',
    indexColor: '#D76C3C',
    badgeBg: 'rgba(215, 108, 60, 0.15)',
    badgeText: '#B64A1C',
    badgeBorder: 'rgba(215, 108, 60, 0.4)',
    categoryPillBg: 'rgba(49, 90, 83, 0.1)',
    categoryPillText: '#1E3F39',
    categoryPillBorder: 'rgba(49, 90, 83, 0.25)',
    headingColor: '#1D3F37',
    subtitleColor: '#B64A1C',
    descriptionColor: '#3E4D47',
    specsLabelColor: '#6E5646',
    specsValueColor: '#1D3F37',
    specsBorder: 'rgba(49, 90, 83, 0.15)',
    paletteLabelColor: '#6E5646',
    ctaBg: '#D76C3C',
    ctaText: '#FFFFFF',
    ctaHoverBg: '#C45424',
  },

  // 04. Banarasi Gold (Varanasi Silk Brocade & Radiant Pure Zari Gold)
  'banarasi-gold': {
    cardBg: 'linear-gradient(135deg, #320722 0%, #190311 100%)',
    cardBorder: 'rgba(255, 215, 0, 0.45)',
    cardShadow: '0 24px 60px -15px rgba(50, 7, 34, 0.55), 0 8px 24px -6px rgba(50, 7, 34, 0.25)',
    stageBg: 'linear-gradient(135deg, #1C0313 0%, #2E061F 100%)',
    stageGlow: '#FFD700',
    floorReflection: 'rgba(255, 215, 0, 0.14)',
    phoneScreenBg: '#28081B',
    editorialBg: 'linear-gradient(135deg, #320722 0%, #190311 100%)',
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

  // 05. South Indian Heritage (Temple Chettinad Ivory & Crimson / Brass Gold)
  'south-indian-heritage': {
    cardBg: 'linear-gradient(135deg, #FFFDF7 0%, #F5EDE0 100%)',
    cardBorder: 'rgba(122, 26, 26, 0.28)',
    cardShadow: '0 24px 60px -15px rgba(122, 26, 26, 0.16), 0 8px 24px -6px rgba(122, 26, 26, 0.08)',
    stageBg: 'linear-gradient(135deg, #F8EEE0 0%, #ECDCBE 100%)',
    stageGlow: '#C28838',
    floorReflection: 'rgba(194, 136, 56, 0.15)',
    phoneScreenBg: '#FFFDF7',
    editorialBg: 'linear-gradient(135deg, #FFFDF7 0%, #F7EFE3 100%)',
    indexColor: '#8C2222',
    badgeBg: 'rgba(122, 26, 26, 0.1)',
    badgeText: '#8C2222',
    badgeBorder: 'rgba(122, 26, 26, 0.3)',
    categoryPillBg: 'rgba(194, 136, 56, 0.12)',
    categoryPillText: '#684514',
    categoryPillBorder: 'rgba(194, 136, 56, 0.3)',
    headingColor: '#7A1A1A',
    subtitleColor: '#8C5919',
    descriptionColor: '#3A342E',
    specsLabelColor: '#786656',
    specsValueColor: '#7A1A1A',
    specsBorder: 'rgba(122, 26, 26, 0.12)',
    paletteLabelColor: '#786656',
    ctaBg: '#7A1A1A',
    ctaText: '#FFFDF7',
    ctaHoverBg: '#611212',
  },

  // 06. Indian Street Kitchen (High-Impact Warm White & Street Food Orange)
  'indian-street-kitchen': {
    cardBg: 'linear-gradient(135deg, #FFF8EE 0%, #FDE9D3 100%)',
    cardBorder: 'rgba(232, 90, 42, 0.4)',
    cardShadow: '0 24px 60px -15px rgba(232, 90, 42, 0.2), 0 8px 24px -6px rgba(232, 90, 42, 0.1)',
    stageBg: 'linear-gradient(135deg, #FBE6D1 0%, #F5CEAE 100%)',
    stageGlow: '#E85A2A',
    floorReflection: 'rgba(232, 90, 42, 0.18)',
    phoneScreenBg: '#FFF9F2',
    editorialBg: 'linear-gradient(135deg, #FFF8EE 0%, #FEE8D2 100%)',
    indexColor: '#E85A2A',
    badgeBg: '#E85A2A',
    badgeText: '#FFFFFF',
    badgeBorder: '#E85A2A',
    categoryPillBg: 'rgba(232, 90, 42, 0.12)',
    categoryPillText: '#B83E15',
    categoryPillBorder: 'rgba(232, 90, 42, 0.3)',
    headingColor: '#C43C12',
    subtitleColor: '#8C3011',
    descriptionColor: '#382C25',
    specsLabelColor: '#7C5C4B',
    specsValueColor: '#B83E15',
    specsBorder: 'rgba(232, 90, 42, 0.18)',
    paletteLabelColor: '#7C5C4B',
    ctaBg: '#E85A2A',
    ctaText: '#FFFFFF',
    ctaHoverBg: '#D2481A',
  },

  // 07. Modern India (Contemporary Fashion Editorial Slate Navy & Tangerine)
  'modern-india': {
    cardBg: 'linear-gradient(135deg, #1C222C 0%, #0E1217 100%)',
    cardBorder: 'rgba(232, 120, 60, 0.45)',
    cardShadow: '0 24px 60px -15px rgba(14, 18, 23, 0.6), 0 8px 24px -6px rgba(14, 18, 23, 0.3)',
    stageBg: 'linear-gradient(135deg, #10141A 0%, #1E2530 100%)',
    stageGlow: '#E8783C',
    floorReflection: 'rgba(232, 120, 60, 0.14)',
    phoneScreenBg: '#F6F4F0',
    editorialBg: 'linear-gradient(135deg, #1C222C 0%, #0E1217 100%)',
    indexColor: '#E8783C',
    badgeBg: 'rgba(232, 120, 60, 0.18)',
    badgeText: '#FFA066',
    badgeBorder: 'rgba(232, 120, 60, 0.45)',
    categoryPillBg: 'rgba(255, 255, 255, 0.08)',
    categoryPillText: '#E2E8F0',
    categoryPillBorder: 'rgba(232, 120, 60, 0.35)',
    headingColor: '#FFFFFF',
    subtitleColor: '#FFA066',
    descriptionColor: '#D9E0E8',
    specsLabelColor: 'rgba(232, 120, 60, 0.9)',
    specsValueColor: '#F6F4F0',
    specsBorder: 'rgba(232, 120, 60, 0.25)',
    paletteLabelColor: 'rgba(232, 120, 60, 0.75)',
    ctaBg: '#E8783C',
    ctaText: '#FFFFFF',
    ctaHoverBg: '#FF8C4D',
  },

  // 08. Bombay Street (Mumbai Irani Cafe Cream & Vibrant Chili Red / Turmeric)
  'bombay-street': {
    cardBg: 'linear-gradient(135deg, #FFFDF2 0%, #F5ECCF 100%)',
    cardBorder: 'rgba(200, 35, 35, 0.35)',
    cardShadow: '0 24px 60px -15px rgba(200, 35, 35, 0.18), 0 8px 24px -6px rgba(200, 35, 35, 0.08)',
    stageBg: 'linear-gradient(135deg, #F9F2D7 0%, #EBDAB1 100%)',
    stageGlow: '#C82323',
    floorReflection: 'rgba(200, 35, 35, 0.15)',
    phoneScreenBg: '#FFFDF2',
    editorialBg: 'linear-gradient(135deg, #FFFDF2 0%, #F7EFD4 100%)',
    indexColor: '#C82323',
    badgeBg: 'rgba(200, 35, 35, 0.12)',
    badgeText: '#C82323',
    badgeBorder: 'rgba(200, 35, 35, 0.35)',
    categoryPillBg: 'rgba(242, 101, 34, 0.12)',
    categoryPillText: '#A73C0C',
    categoryPillBorder: 'rgba(242, 101, 34, 0.3)',
    headingColor: '#B31818',
    subtitleColor: '#D45214',
    descriptionColor: '#362C24',
    specsLabelColor: '#785F4D',
    specsValueColor: '#B31818',
    specsBorder: 'rgba(200, 35, 35, 0.18)',
    paletteLabelColor: '#785F4D',
    ctaBg: '#C82323',
    ctaText: '#FFFFFF',
    ctaHoverBg: '#AA1515',
  },

  // 09. Coffee House (Artisanal Roasted Espresso Brown & Warm Caramel)
  'coffee-house': {
    cardBg: 'linear-gradient(135deg, #321A11 0%, #1A0D07 100%)',
    cardBorder: 'rgba(224, 169, 109, 0.45)',
    cardShadow: '0 24px 60px -15px rgba(50, 26, 17, 0.55), 0 8px 24px -6px rgba(50, 26, 17, 0.25)',
    stageBg: 'linear-gradient(135deg, #1C0D07 0%, #2B160E 100%)',
    stageGlow: '#E0A96D',
    floorReflection: 'rgba(224, 169, 109, 0.14)',
    phoneScreenBg: '#2E1C14',
    editorialBg: 'linear-gradient(135deg, #321A11 0%, #1A0D07 100%)',
    indexColor: '#E0A96D',
    badgeBg: 'rgba(224, 169, 109, 0.16)',
    badgeText: '#F0BD84',
    badgeBorder: 'rgba(224, 169, 109, 0.4)',
    categoryPillBg: 'rgba(46, 28, 20, 0.85)',
    categoryPillText: '#F2D3AF',
    categoryPillBorder: 'rgba(224, 169, 109, 0.35)',
    headingColor: '#FFFDF7',
    subtitleColor: '#E0A96D',
    descriptionColor: '#F4E7DA',
    specsLabelColor: 'rgba(224, 169, 109, 0.85)',
    specsValueColor: '#FFFDF7',
    specsBorder: 'rgba(224, 169, 109, 0.3)',
    paletteLabelColor: 'rgba(224, 169, 109, 0.75)',
    ctaBg: '#E0A96D',
    ctaText: '#2E1C14',
    ctaHoverBg: '#EFC492',
  },

  // 10. Minimal Editorial (Swiss Modernist Pure Warm White & Razor Charcoal)
  'minimal-editorial': {
    cardBg: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F3 100%)',
    cardBorder: 'rgba(24, 24, 27, 0.2)',
    cardShadow: '0 24px 60px -15px rgba(24, 24, 27, 0.15), 0 8px 24px -6px rgba(24, 24, 27, 0.08)',
    stageBg: 'linear-gradient(135deg, #F8F8F6 0%, #EDEDEB 100%)',
    stageGlow: '#E8783C',
    floorReflection: 'rgba(24, 24, 27, 0.08)',
    phoneScreenBg: '#FAFAF8',
    editorialBg: 'linear-gradient(135deg, #FFFFFF 0%, #F7F7F5 100%)',
    indexColor: '#18181B',
    badgeBg: '#18181B',
    badgeText: '#FFFFFF',
    badgeBorder: '#18181B',
    categoryPillBg: 'rgba(24, 24, 27, 0.06)',
    categoryPillText: '#18181B',
    categoryPillBorder: 'rgba(24, 24, 27, 0.15)',
    headingColor: '#18181B',
    subtitleColor: '#E8783C',
    descriptionColor: '#4A4A52',
    specsLabelColor: '#787882',
    specsValueColor: '#18181B',
    specsBorder: 'rgba(24, 24, 27, 0.12)',
    paletteLabelColor: '#787882',
    ctaBg: '#18181B',
    ctaText: '#FFFFFF',
    ctaHoverBg: '#333338',
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
