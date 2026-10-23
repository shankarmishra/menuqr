import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import type { MenuTemplate } from '../../../data/menuTemplates';
import { DEMO_RESTAURANT, isTemplateDark } from '../../../data/menuTemplates';
import PremiumIPhoneMockup from '../PremiumIPhoneMockup';
import MenuTemplateRenderer from '../../menu-builder/MenuTemplateRenderer';
import {
  getTemplateCardTheme,
  getLayoutLabel,
  getItemStyleLabel,
  getTypographyLabel,
} from './templateCardThemes';

interface TemplateCardProps {
  template: MenuTemplate;
  index: number;
  total: number;
  className?: string;
  style?: React.CSSProperties;
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
              <div
                className="h-full w-full overflow-y-auto overflow-x-hidden p-0.5 pointer-events-none md:pointer-events-auto scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] antialiased"
                style={{ backgroundColor: theme.phoneScreenBg }}
              >
                <MenuTemplateRenderer
                  templateId={template.id}
                  restaurant={DEMO_RESTAURANT}
                  categories={DEMO_RESTAURANT.categories}
                  items={DEMO_RESTAURANT.items}
                  compact={true}
                />
              </div>
            </PremiumIPhoneMockup>
          </motion.div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          RIGHT / BOTTOM: Editorial Narrative & Specifications
          ═══════════════════════════════════════════════════════════════════ */}
      <div
        className="template-card-editorial flex flex-col justify-between p-4 sm:p-5 md:p-6 lg:p-7 xl:p-8 h-full"
        style={{ background: 'var(--editorial-bg)' }}
      >
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
            className="mt-1 sm:mt-2 md:mt-2.5 max-w-xl text-[10.5px] sm:text-xs md:text-xs lg:text-sm leading-relaxed font-normal line-clamp-2 md:line-clamp-2 lg:line-clamp-3"
            style={{ color: 'var(--desc-color)' }}
          >
            {template.description}
          </p>

          {/* Design Specs Grid */}
          <dl
            className="template-card-specs mt-1.5 sm:mt-2.5 md:mt-3 lg:mt-3.5 grid grid-cols-2 gap-x-3 sm:gap-x-4 md:gap-x-4 lg:gap-x-5 gap-y-1 sm:gap-y-1.5 md:gap-y-2 border-t pt-1.5 sm:pt-2 md:pt-2.5 text-[9.5px] sm:text-xs md:text-xs lg:text-sm"
            style={{ borderColor: 'var(--specs-border)' }}
          >
            <div>
              <dt
                className="mb-0.5 text-[8.5px] sm:text-[9.5px] md:text-[10px] font-bold uppercase tracking-wider"
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
                className="mb-0.5 text-[8.5px] sm:text-[9.5px] md:text-[10px] font-bold uppercase tracking-wider"
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
                className="mb-0.5 text-[8.5px] sm:text-[9.5px] md:text-[10px] font-bold uppercase tracking-wider"
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
                className="mb-0.5 text-[8.5px] sm:text-[9.5px] md:text-[10px] font-bold uppercase tracking-wider"
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
          className="template-card-footer mt-1.5 sm:mt-2.5 md:mt-3 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 md:gap-2 lg:gap-3 pt-1.5 sm:pt-2 md:pt-2 border-t"
          style={{ borderColor: 'var(--specs-border)' }}
        >
          <div className="flex items-center gap-1.5 sm:gap-2" aria-label="Template color palette">
            <span
              className="text-[8.5px] sm:text-[9.5px] md:text-[10px] font-mono font-bold uppercase mr-0.5 sm:mr-1"
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 md:px-3.5 md:py-2 lg:px-4 lg:py-2 rounded-full text-[9.5px] sm:text-[10.5px] md:text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 shadow-md shadow-black/20 font-sans cursor-pointer shrink-0"
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
