import { useRef, useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
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
  const cardRef = useRef<HTMLElement>(null);
  const [isRevealed, setIsRevealed] = useState(true);
  const theme = getTemplateCardTheme(template);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    el.classList.add('is-revealed');
    setIsRevealed(true);
  }, []);

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
      ref={cardRef}
      data-template-id={template.id}
      data-index={index}
      aria-label={`${template.name} menu template card, ${index + 1} of ${total}`}
      className={`template-reveal-card ${isRevealed ? 'is-revealed' : ''} group relative grid w-full max-w-[1240px] mx-auto grid-cols-1 md:grid-cols-2 overflow-hidden rounded-[24px] sm:rounded-[32px] md:rounded-[36px] border shadow-2xl ${className}`}
      style={{
        background: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
        boxShadow: 'var(--card-shadow)',
        pointerEvents: 'auto',
        ...themeVariables,
      }}
    >
      {/* ═══════════════════════════════════════════════════════════════════
          LEFT / TOP: Premium iPhone Mockup
          ═══════════════════════════════════════════════════════════════════ */}
      <div
        className="relative flex min-h-[220px] sm:min-h-[300px] md:min-h-[560px] lg:min-h-[620px] w-full items-center justify-center p-2 sm:p-5 md:p-8 lg:p-10 overflow-hidden"
        style={{ background: 'var(--stage-bg)' }}
      >
        {/* Ambient Glow matching template accent */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30 filter blur-3xl scale-75"
          style={{ backgroundColor: 'var(--stage-glow)' }}
        />
        {/* Floor contact reflection */}
        <div
          className="absolute bottom-0 inset-x-0 h-20 md:h-28 pointer-events-none"
          style={{ background: 'linear-gradient(to top, var(--floor-reflection), transparent)' }}
        />

        <div className="relative z-10 flex items-center justify-center">
          <div
            className="relative shadow-[0_30px_70px_rgba(0,0,0,0.7)] rounded-[45px] sm:rounded-[50px] scale-[0.68] sm:scale-[0.82] md:scale-100 origin-center my-[-30px] sm:my-[-15px] md:my-0"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <PremiumIPhoneMockup
              className="!w-[230px] sm:!w-[260px] md:!w-[290px] lg:!w-[315px]"
              badgeText="Live Menu Preview"
              statusBarTheme={isTemplateDark(template) ? 'light' : 'dark'}
              homeIndicatorTheme={isTemplateDark(template) ? 'light' : 'dark'}
              screenStyle={{ backgroundColor: theme.phoneScreenBg }}
              screenClassName=""
            >
              <div
                className="h-full w-full overflow-y-auto overflow-x-hidden p-1 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
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
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          RIGHT / BOTTOM: Editorial Narrative & Specifications
          ═══════════════════════════════════════════════════════════════════ */}
      <div
        className="flex flex-col justify-between px-4 py-4 sm:px-8 sm:py-7 md:px-10 md:py-9 lg:px-12 lg:py-11"
        style={{ background: 'var(--editorial-bg)' }}
      >
        <div>
          {/* Top Index & Badge Header */}
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <p
              className="font-mono text-[11px] sm:text-xs md:text-[13px] font-bold uppercase tracking-widest"
              style={{ color: 'var(--index-color)' }}
            >
              Design {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </p>
            {template.badge && (
              <span
                className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-wider border shadow-sm"
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
          <div className="mb-2 sm:mb-3 flex flex-wrap gap-1 sm:gap-1.5 md:gap-2">
            {template.categories.map((category) => (
              <span
                key={category}
                className="px-2 py-0.5 text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-wider rounded-md border"
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
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight"
            style={{
              fontFamily: template.typography.heading,
              color: 'var(--heading-color)',
            }}
          >
            {template.name}
          </h3>

          <p
            className="mt-0.5 sm:mt-1 md:mt-2 text-[11px] sm:text-xs md:text-sm font-medium font-serif italic"
            style={{ color: 'var(--subtitle-color)' }}
          >
            {template.subtitle}
          </p>

          <p
            className="mt-2 sm:mt-3 md:mt-4 max-w-xl text-[11px] sm:text-xs md:text-sm lg:text-base leading-relaxed font-normal line-clamp-2 sm:line-clamp-3 md:line-clamp-none"
            style={{ color: 'var(--desc-color)' }}
          >
            {template.description}
          </p>

          {/* Design Specs Grid */}
          <dl
            className="mt-3 sm:mt-5 md:mt-6 grid grid-cols-2 gap-x-3 sm:gap-x-4 md:gap-x-5 gap-y-2 sm:gap-y-2.5 md:gap-y-3 border-t pt-2.5 sm:pt-4 md:pt-5 text-[10px] sm:text-xs md:text-sm"
            style={{ borderColor: 'var(--specs-border)' }}
          >
            <div>
              <dt
                className="mb-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider"
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
                className="mb-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider"
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
                className="mb-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider"
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
                className="mb-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider"
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
          className="mt-3 sm:mt-5 md:mt-6 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 pt-2.5 sm:pt-4 border-t"
          style={{ borderColor: 'var(--specs-border)' }}
        >
          <div className="flex items-center gap-1.5 sm:gap-2.5" aria-label="Template color palette">
            <span
              className="text-[9px] sm:text-[10px] font-mono font-bold uppercase mr-1"
              style={{ color: 'var(--palette-label)' }}
            >
              Palette
            </span>
            {colors.map((color, swatchIndex) => (
              <span
                key={`${color}-${swatchIndex}`}
                className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 rounded-full border border-white/20 shadow-sm transition-transform hover:scale-110"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>

          <Link
            to={`/templates#${template.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 shadow-md shadow-black/20 font-sans cursor-pointer"
            style={{
              backgroundColor: 'var(--cta-bg)',
              color: 'var(--cta-text)',
            }}
          >
            <span>Explore Menu</span>
            <ArrowRight size={13} className="shrink-0" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default TemplateCard;
