import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import type { MenuTemplate } from '../../../data/menuTemplates';
import { isTemplateDark } from '../../../data/menuTemplates';
import PremiumIPhoneMockup from '../PremiumIPhoneMockup';
import {
  getTemplateCardTheme,
  getLayoutLabel,
  getItemStyleLabel,
  getTypographyLabel,
  type TemplateCardTheme,
} from './templateCardThemes';

interface TemplateCardProps {
  template: MenuTemplate;
  index: number;
  total: number;
  className?: string;
  style?: React.CSSProperties;
}

function TemplatePhonePreview({
  template,
  theme,
  isDark,
}: {
  template: MenuTemplate;
  theme: TemplateCardTheme;
  isDark: boolean;
}) {
  const dishes = theme.signatureDishes || [
    {
      name: 'Paneer Tikka Royale',
      category: 'Starters',
      price: 280,
      dietType: 'veg' as const,
      description: 'Charcoal-smoked organic cottage cheese, hung yogurt, roasted cumin.',
      image: '/uploads/mannat/hero_chaap.png',
      badge: 'Bestseller',
    },
    {
      name: 'Murgh Makhani Royale',
      category: 'Curries',
      price: 380,
      dietType: 'non-veg' as const,
      description: 'Velvety slow-simmered tomato reduction with pulled tandoori chicken.',
      image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=300&auto=format&fit=crop&q=80',
      badge: 'Chef Special',
    },
  ];

  return (
    <div
      className="h-full w-full flex flex-col font-sans select-none overflow-hidden text-left"
      style={{
        backgroundColor: theme.phoneScreenBg,
        color: isDark ? '#FAF3E0' : '#1F2925',
      }}
    >
      {/* Phone Header / Masthead */}
      <div
        className="px-2.5 pt-[38px] pb-2 shrink-0 border-b backdrop-blur-md relative"
        style={{
          backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.85)',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
        }}
      >
        <div className="flex items-center justify-between gap-1 mb-1">
          <div className="min-w-0 flex-1">
            <h4
              className="text-[11px] font-black tracking-tight leading-tight truncate"
              style={{
                fontFamily: template.typography.heading,
                color: theme.headingColor,
              }}
            >
              {template.name}
            </h4>
            <p
              className="text-[6.5px] font-bold uppercase tracking-wider truncate mt-0.5"
              style={{ color: theme.subtitleColor }}
            >
              Table 12 • Live Guest Menu
            </p>
          </div>
          <span
            className="text-[6px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border shrink-0"
            style={{
              backgroundColor: theme.badgeBg,
              color: theme.badgeText,
              borderColor: theme.badgeBorder,
            }}
          >
            ● Live
          </span>
        </div>

        {/* Category Pills */}
        <div className="flex gap-1 overflow-x-auto scrollbar-none pt-1">
          {template.categories.slice(0, 3).map((cat, idx) => (
            <span
              key={cat}
              className={`text-[7px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                idx === 0 ? 'shadow-xs' : 'opacity-80'
              }`}
              style={{
                backgroundColor: idx === 0 ? theme.ctaBg : theme.categoryPillBg,
                color: idx === 0 ? theme.ctaText : theme.categoryPillText,
                border: `1px solid ${theme.categoryPillBorder}`,
              }}
            >
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Dishes List with Authentic Photography */}
      <div className="flex-1 p-1.5 space-y-1.5 overflow-y-auto scrollbar-none">
        {dishes.map((dish) => (
          <div
            key={dish.name}
            className="p-1.5 rounded-xl border flex gap-1.5 items-center transition-colors shadow-xs"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.92)',
              borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
            }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-0.5 flex-wrap">
                <span
                  className={`w-2 h-2 border flex items-center justify-center rounded-[2px] shrink-0 ${
                    dish.dietType === 'veg' ? 'border-emerald-600' : 'border-rose-600'
                  }`}
                >
                  <span
                    className={`w-1 h-1 rounded-full ${
                      dish.dietType === 'veg' ? 'bg-emerald-600' : 'bg-rose-600'
                    }`}
                  />
                </span>
                <span className="font-bold text-[8.5px] leading-tight truncate">
                  {dish.name}
                </span>
                {dish.badge && (
                  <span
                    className="text-[5.5px] font-bold uppercase tracking-wider px-1 py-0.2 rounded"
                    style={{
                      backgroundColor: theme.badgeBg,
                      color: theme.badgeText,
                    }}
                  >
                    {dish.badge}
                  </span>
                )}
              </div>
              <p className="text-[6.5px] opacity-75 line-clamp-1 leading-snug">
                {dish.description}
              </p>
              <div className="flex items-center justify-between mt-1 pt-0.5 border-t border-black/5 dark:border-white/5">
                <span className="font-extrabold text-[8.5px]">₹{dish.price}</span>
                <span
                  className="px-1.5 py-0.5 rounded text-[6.5px] font-bold uppercase tracking-wider shadow-2xs"
                  style={{
                    backgroundColor: theme.ctaBg,
                    color: theme.ctaText,
                  }}
                >
                  + Add
                </span>
              </div>
            </div>
            <div className="w-[44px] h-[44px] rounded-lg overflow-hidden shrink-0 bg-stone-200 border border-black/5 dark:border-white/10 relative shadow-2xs">
              <img
                src={dish.image}
                alt={dish.name}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=200&auto=format&fit=crop&q=80';
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Floating Bottom Cart Bar */}
      <div
        className="p-1.5 px-2.5 flex items-center justify-between shrink-0 border-t shadow-sm"
        style={{
          backgroundColor: isDark ? '#080A09' : '#FFFFFF',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
        }}
      >
        <div>
          <p className="text-[5.5px] font-mono font-bold uppercase tracking-wider opacity-70">
            ORDER TOTAL
          </p>
          <p className="text-[8px] font-extrabold">2 items • ₹660</p>
        </div>
        <span
          className="text-[6.5px] font-bold px-2 py-0.5 rounded-full shadow-xs"
          style={{
            backgroundColor: theme.ctaBg,
            color: theme.ctaText,
          }}
        >
          View Order →
        </span>
      </div>
    </div>
  );
}

export function TemplateCard({
  template,
  index,
  total,
  className = '',
  style,
}: TemplateCardProps) {
  const theme = getTemplateCardTheme(template);
  const isDark = isTemplateDark(template);
  const shouldReduceMotion = useReducedMotion();

  const colors = [
    template.colors.bg,
    template.colors.accent,
    template.colors.surface,
    template.colors.secondary || '#073D34',
  ];

  // CSS Custom Properties mapped for template-specific identity across the whole card
  const themeVariables: React.CSSProperties = {
    '--card-bg': theme.cardBg,
    '--card-border': theme.cardBorder,
    '--card-shadow': theme.cardShadow,
    '--card-scrim': isDark ? 'rgba(6, 15, 12, 0.88)' : 'rgba(38, 30, 20, 0.72)',
    '--stage-bg': theme.stageBg,
    '--stage-glow': theme.stageGlow,
    '--floor-reflection': theme.floorReflection,
    '--phone-screen-bg': theme.phoneScreenBg,
    '--editorial-bg': theme.editorialBg,
    '--index-color': theme.indexColor,
    '--badge-bg': theme.badgeBg,
    '--badge-text': theme.badgeText,
    '--badge-border': theme.badgeBorder,
    '--pill-bg': theme.categoryPillBg,
    '--pill-text': theme.categoryPillText,
    '--pill-border': theme.categoryPillBorder,
    '--heading-color': theme.headingColor,
    '--subtitle-color': theme.subtitleColor,
    '--desc-color': theme.descriptionColor,
    '--specs-label': theme.specsLabelColor,
    '--specs-value': theme.specsValueColor,
    '--specs-border': theme.specsBorder,
    '--palette-label': theme.paletteLabelColor,
    '--cta-bg': theme.ctaBg,
    '--cta-text': theme.ctaText,
    '--cta-hover-bg': theme.ctaHoverBg,
    ...style,
  } as React.CSSProperties;

  return (
    <article
      data-template-id={template.id}
      data-index={index}
      aria-label={`${template.name} menu template card, ${index + 1} of ${total}`}
      className={`template-reveal-card is-revealed group relative flex flex-col md:grid md:grid-cols-[44fr_56fr] w-full max-w-[440px] md:max-w-none md:w-[780px] lg:w-[860px] xl:w-[920px] md:h-[480px] lg:h-[510px] xl:h-[530px] shrink-0 overflow-hidden rounded-[24px] sm:rounded-[28px] md:rounded-[36px] border shadow-2xl transition-all duration-300 ${className}`}
      style={{
        background: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
        boxShadow: 'var(--card-shadow)',
        pointerEvents: 'auto',
        ...themeVariables,
      }}
    >
      {/* ═══════════════════════════════════════════════════════════════════
          LEFT / TOP: Premium iPhone Mockup Stage
          ═══════════════════════════════════════════════════════════════════ */}
      <div
        className="template-card-stage relative flex min-h-[320px] sm:min-h-[350px] md:min-h-0 w-full h-full items-center justify-center py-4 px-3 sm:py-5 sm:px-4 md:p-6 lg:p-7 overflow-hidden"
        style={{ background: 'var(--stage-bg)', isolation: 'isolate' }}
      >
        {/* Ambient Glow matching template accent */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30 filter blur-3xl scale-75"
          style={{ backgroundColor: 'var(--stage-glow)' }}
        />
        {/* Floor contact reflection */}
        <div
          className="absolute bottom-0 inset-x-0 h-14 md:h-24 pointer-events-none"
          style={{ background: 'linear-gradient(to top, var(--floor-reflection), transparent)' }}
        />

        <div className="relative z-10 flex items-center justify-center w-full">
          <motion.div
            initial={shouldReduceMotion ? false : { scale: 0.96, opacity: 0.92 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="template-card-phone-wrap relative shadow-[0_24px_60px_-12px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.08)] rounded-[40px] sm:rounded-[45px] md:rounded-[50px]"
            style={{ isolation: 'isolate' }}
          >
            <PremiumIPhoneMockup
              className="template-card-phone w-[140px] sm:w-[155px] md:w-[180px] lg:w-[195px] xl:w-[205px]"
              badgeText="Live Menu Preview"
              statusBarTheme={isDark ? 'light' : 'dark'}
              statusBarMode="overlay"
              homeIndicatorTheme={isDark ? 'light' : 'dark'}
              screenStyle={{ backgroundColor: theme.phoneScreenBg }}
              screenClassName=""
            >
              <TemplatePhonePreview
                template={template}
                theme={theme}
                isDark={isDark}
              />
            </PremiumIPhoneMockup>
          </motion.div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          RIGHT / BOTTOM: Editorial Narrative & Specifications
          ═══════════════════════════════════════════════════════════════════ */}
      <div
        className="template-card-editorial relative flex flex-col justify-between p-4 sm:p-5 md:p-6 lg:p-7 xl:p-8 h-full overflow-hidden"
        style={{ background: 'var(--editorial-bg)' }}
      >
        {/* Subtle Watermark Craft Motif in background */}
        <div
          className="absolute right-4 bottom-14 opacity-[0.04] pointer-events-none text-8xl font-serif select-none"
          aria-hidden="true"
        >
          {template.decorations.motif.slice(0, 2)}
        </div>

        <div>
          {/* Top Index & Badge Header */}
          <div className="flex items-center justify-between mb-1.5 sm:mb-2 md:mb-2.5">
            <p
              className="font-mono text-[10px] sm:text-xs md:text-[13px] font-bold uppercase tracking-widest"
              style={{ color: 'var(--index-color)' }}
            >
              Design {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </p>
            {template.badge && (
              <span
                className="px-2 py-0.5 rounded-full text-[8.5px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-wider border shadow-xs"
                style={{
                  backgroundColor: 'var(--badge-bg)',
                  color: 'var(--badge-text)',
                  borderColor: 'var(--badge-border)',
                }}
              >
                {template.badge}
              </span>
            )}
          </div>

          {/* Categories */}
          <div className="mb-1.5 sm:mb-2 md:mb-2.5 flex flex-wrap gap-1 sm:gap-1.5 md:gap-2">
            {template.categories.map((category) => (
              <span
                key={category}
                className="px-1.5 sm:px-2 py-0.5 text-[8.5px] sm:text-[9.5px] md:text-[11px] font-bold uppercase tracking-wider rounded-md border"
                style={{
                  backgroundColor: 'var(--pill-bg)',
                  color: 'var(--pill-text)',
                  borderColor: 'var(--pill-border)',
                }}
              >
                {category}
              </span>
            ))}
          </div>

          {/* Title in Signature Heading Typography */}
          <h3
            className="text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight"
            style={{
              fontFamily: template.typography.heading,
              color: 'var(--heading-color)',
            }}
          >
            {template.name}
          </h3>

          <p
            className="mt-0.5 text-[10px] sm:text-xs md:text-xs lg:text-sm font-medium font-serif italic"
            style={{ color: 'var(--subtitle-color)' }}
          >
            {template.subtitle}
          </p>

          <p
            className="mt-1 sm:mt-1.5 md:mt-2 max-w-xl text-[10.5px] sm:text-xs md:text-xs lg:text-sm leading-relaxed font-normal line-clamp-2"
            style={{ color: 'var(--desc-color)' }}
          >
            {template.description}
          </p>

          {/* Studio Signature Dishes Showcase Row */}
          {theme.signatureDishes && (
            <div
              className="mt-2 sm:mt-2.5 p-2 rounded-xl border backdrop-blur-xs shadow-2xs"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                borderColor: 'var(--specs-border)',
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className="text-[7.5px] sm:text-[8.5px] font-mono font-bold uppercase tracking-wider"
                  style={{ color: 'var(--specs-label)' }}
                >
                  Featured Signatures
                </span>
                <span
                  className="text-[7px] sm:text-[8px] font-mono font-bold uppercase tracking-widest opacity-80"
                  style={{ color: 'var(--index-color)' }}
                >
                  Authentic Pricing
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {theme.signatureDishes.map((dish) => (
                  <div
                    key={dish.name}
                    className="flex items-center gap-1.5 min-w-0"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        dish.dietType === 'veg' ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    <span
                      className="text-[9px] sm:text-[10px] font-semibold truncate"
                      style={{ color: 'var(--specs-value)' }}
                    >
                      {dish.name}
                    </span>
                    <span
                      className="text-[9px] sm:text-[10px] font-extrabold ml-auto shrink-0"
                      style={{ color: 'var(--index-color)' }}
                    >
                      ₹{dish.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Design Specs Grid */}
          <dl
            className="template-card-specs mt-1.5 sm:mt-2 md:mt-2.5 grid grid-cols-2 gap-x-3 sm:gap-x-4 md:gap-x-4 lg:gap-x-5 gap-y-1 sm:gap-y-1.5 border-t pt-1.5 sm:pt-2 text-[9.5px] sm:text-xs md:text-xs"
            style={{ borderColor: 'var(--specs-border)' }}
          >
            <div>
              <dt
                className="mb-0.5 text-[8px] sm:text-[9px] md:text-[9.5px] font-bold uppercase tracking-wider"
                style={{ color: 'var(--specs-label)' }}
              >
                Menu layout
              </dt>
              <dd className="font-medium truncate" style={{ color: 'var(--specs-value)' }}>
                {getLayoutLabel(template)}
              </dd>
            </div>
            <div>
              <dt
                className="mb-0.5 text-[8px] sm:text-[9px] md:text-[9.5px] font-bold uppercase tracking-wider"
                style={{ color: 'var(--specs-label)' }}
              >
                Item style
              </dt>
              <dd className="font-medium truncate" style={{ color: 'var(--specs-value)' }}>
                {getItemStyleLabel(template)}
              </dd>
            </div>
            <div>
              <dt
                className="mb-0.5 text-[8px] sm:text-[9px] md:text-[9.5px] font-bold uppercase tracking-wider"
                style={{ color: 'var(--specs-label)' }}
              >
                Typography
              </dt>
              <dd className="font-medium truncate" style={{ color: 'var(--specs-value)' }}>
                {getTypographyLabel(template)}
              </dd>
            </div>
            <div>
              <dt
                className="mb-0.5 text-[8px] sm:text-[9px] md:text-[9.5px] font-bold uppercase tracking-wider"
                style={{ color: 'var(--specs-label)' }}
              >
                Craft motif
              </dt>
              <dd className="font-medium truncate" style={{ color: 'var(--specs-value)' }}>
                {template.decorations.motif}
              </dd>
            </div>
          </dl>
        </div>

        {/* Palette & CTA Footer */}
        <div
          className="template-card-footer mt-1.5 sm:mt-2 md:mt-2.5 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 md:gap-2 lg:gap-3 pt-1.5 sm:pt-2 border-t"
          style={{ borderColor: 'var(--specs-border)' }}
        >
          <div className="flex items-center gap-1.5 sm:gap-2" aria-label="Template color palette">
            <span
              className="text-[8px] sm:text-[9px] md:text-[9.5px] font-mono font-bold uppercase mr-0.5 sm:mr-1"
              style={{ color: 'var(--palette-label)' }}
            >
              Palette
            </span>
            {colors.map((color, swatchIndex) => (
              <span
                key={`${color}-${swatchIndex}`}
                className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 rounded-full border border-white/20 shadow-xs transition-transform hover:scale-110"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>

          <Link
            to={`/templates#${template.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 md:px-3.5 md:py-2 lg:px-4 lg:py-2 rounded-full text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 shadow-md shadow-black/20 font-sans cursor-pointer shrink-0"
            style={{
              backgroundColor: 'var(--cta-bg)',
              color: 'var(--cta-text)',
            }}
          >
            <span>Explore Menu</span>
            <ArrowRight size={12} className="shrink-0" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default TemplateCard;
