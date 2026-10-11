import { useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { menuTemplates, type MenuTemplate } from '../../data/menuTemplates';
import ScrollStack, { ScrollStackItem } from '../ui/ScrollStack';
import { Sparkles, ArrowRight, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

// The 15 core signature templates as defined by the product architecture
const SIGNATURE_TEMPLATE_IDS = [
  'royal-maharaja',
  'rajasthani-heritage',
  'mughal-luxe',
  'banarasi-gold',
  'south-indian-heritage',
  'indian-street-kitchen',
  'modern-india',
  'spice-house',
  'maison-noir',
  'ivory-dining',
  'grand-table',
  'coffee-house',
  'paper-cafe',
  'bombay-street',
  'minimal-editorial',
];

function TemplateCard({
  template,
  index,
  total,
}: {
  template: MenuTemplate;
  index: number;
  total: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const colors = [
    template.colors.bg,
    template.colors.surface,
    template.colors.heading,
    template.colors.accent,
  ];

  return (
    <ScrollStackItem itemClassName="mx-auto w-full max-w-[1180px] px-4 sm:px-6">
      <motion.article
        initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        data-template-id={template.id}
        className="group relative grid min-h-[520px] grid-cols-1 overflow-hidden rounded-3xl border shadow-[0_24px_60px_rgba(0,0,0,0.35)] transition-shadow duration-300 hover:shadow-[0_32px_80px_rgba(0,0,0,0.45)] md:grid-cols-2"
        style={{
          backgroundColor: template.colors.bg,
          color: template.colors.text,
          borderColor: template.colors.border,
        }}
      >
        {/* Left: Authentic Menu Preview Showcase */}
        <div className="relative flex min-h-[400px] sm:min-h-[460px] md:min-h-[540px] items-center justify-center p-6 sm:p-8 bg-black/15 overflow-hidden">
          {/* Subtle Ambient Glow matching template accent */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20 filter blur-3xl scale-75"
            style={{ backgroundColor: template.colors.accent }}
          />

          <img
            src={`/marketing/templates/${template.id}.webp`}
            alt={`${template.name} Indian restaurant menu design`}
            loading={index < 2 ? 'eager' : 'lazy'}
            decoding="async"
            className="relative z-10 max-h-[480px] w-full rounded-lg object-contain shadow-[0_16px_40px_rgba(0,0,0,0.4)] transition-transform duration-500 group-hover:scale-[1.02]"
          />

          {/* Quick Floating Badge */}
          <div className="absolute bottom-4 right-4 z-20 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold border border-white/10 shadow-lg">
            <Eye size={12} className="text-[#E8783C]" />
            <span>Signature Preview</span>
          </div>
        </div>

        {/* Right: Editorial Narrative & Specifications */}
        <div className="flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-12">
          {/* Top Index & Motif Header */}
          <div className="flex items-center justify-between mb-4">
            <p
              className="font-mono text-xs font-bold uppercase tracking-widest"
              style={{ color: template.colors.accent }}
            >
              Design {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </p>
            {template.badge && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E8783C]/20 text-[#E8783C] border border-[#E8783C]/30">
                {template.badge}
              </span>
            )}
          </div>

          {/* Categories */}
          <div className="mb-4 flex flex-wrap gap-2">
            {template.categories.map((category) => (
              <span
                key={category}
                className="border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md"
                style={{ color: template.colors.accent, borderColor: template.colors.border }}
              >
                {category}
              </span>
            ))}
          </div>

          {/* Title in Signature Heading Typography */}
          <h3
            className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight"
            style={{ color: template.colors.heading, fontFamily: template.typography.heading }}
          >
            {template.name}
          </h3>

          <p className="mt-2 text-sm font-medium opacity-75">{template.subtitle}</p>

          <p className="mt-4 max-w-lg text-sm leading-relaxed opacity-85 sm:text-base font-normal">
            {template.description}
          </p>

          {/* Design Specs Grid */}
          <dl
            className="mt-6 grid grid-cols-2 gap-x-5 gap-y-3.5 border-t pt-5 text-xs sm:text-sm"
            style={{ borderColor: template.colors.border }}
          >
            <div>
              <dt className="mb-0.5 text-[10px] font-bold uppercase tracking-wider opacity-60">Menu layout</dt>
              <dd className="capitalize font-medium">{template.layout.type.replace('-', ' ')}</dd>
            </div>
            <div>
              <dt className="mb-0.5 text-[10px] font-bold uppercase tracking-wider opacity-60">Item style</dt>
              <dd className="capitalize font-medium">{template.layout.itemStyle.replace('-', ' ')}</dd>
            </div>
            <div>
              <dt className="mb-0.5 text-[10px] font-bold uppercase tracking-wider opacity-60">Typography</dt>
              <dd className="capitalize font-medium">{template.typography.style}</dd>
            </div>
            <div>
              <dt className="mb-0.5 text-[10px] font-bold uppercase tracking-wider opacity-60">Craft motif</dt>
              <dd className="line-clamp-1 font-medium">{template.decorations.motif}</dd>
            </div>
          </dl>

          {/* Palette & CTA Footer */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-2.5" aria-label="Template color palette">
              <span className="text-[10px] font-mono font-bold uppercase opacity-50 mr-1">Palette</span>
              {colors.map((color, swatchIndex) => (
                <span
                  key={`${color}-${swatchIndex}`}
                  className="h-5 w-5 rounded-full border border-white/20 shadow-sm"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>

            <Link
              to={`/templates#${template.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: template.colors.accent,
                color: template.colors.bg === '#FFFFFF' || template.colors.bg === '#FAF3E0' ? '#151C19' : '#FFFFFF',
              }}
            >
              <span>Explore Menu</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </motion.article>
    </ScrollStackItem>
  );
}

export default function TemplateGallerySection() {
  // Use the 15 signature templates as the primary curated collection
  const signatureTemplates = useMemo(() => {
    return SIGNATURE_TEMPLATE_IDS.map((id) => menuTemplates.find((t) => t.id === id)).filter(
      Boolean
    ) as MenuTemplate[];
  }, []);

  // Extract all unique categories across signature templates
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    signatureTemplates.forEach((t) => t.categories?.forEach((c) => cats.add(c)));
    return ['All', ...Array.from(cats)];
  }, [signatureTemplates]);

  const [activeCategory, setActiveCategory] = useState('All');

  const filteredTemplates = useMemo(() => {
    if (activeCategory === 'All') return signatureTemplates;
    return signatureTemplates.filter((t) => t.categories?.includes(activeCategory));
  }, [activeCategory, signatureTemplates]);

  return (
    <section id="templates" className="relative overflow-clip bg-[#050807] py-16 md:py-24">
      {/* Ambient luxury glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-[10%] w-[60vw] h-[60vw] bg-[#E8783C]/5 blur-[160px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-[10%] w-[50vw] h-[50vw] bg-[#2D5A3D]/10 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="max-w-[1800px] mx-auto w-full relative z-10">
        {/* HEADER & FILTER OPTIONS */}
        <div className="px-6 md:px-16 flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-12 md:mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-[#E8783C] text-[12px] font-bold uppercase tracking-widest border border-[#E8783C]/20 mb-6 backdrop-blur-md shadow-lg shadow-[#E8783C]/5">
              <Sparkles size={14} className="text-[#E8783C]" />
              <span>Premium Collection</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight mb-5">
              Menus with a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E8783C] to-[#F1A679] font-serif italic font-normal pr-4">
                point of view.
              </span>
            </h2>
            <p className="text-white/60 text-lg sm:text-xl max-w-xl font-light leading-relaxed">
              15 signature templates. Each structurally re-renders your menu with unique typography, spacing, and layout logic.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 max-w-[560px] justify-start xl:justify-end">
            {allCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-[13px] font-bold tracking-wide uppercase transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-[#E8783C] text-white shadow-[0_8px_20px_-6px_rgba(232,120,60,0.5)] scale-105'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* TEMPLATE SHOWCASE LIST */}
        <ScrollStack
          key={activeCategory}
          className="scroll-stack-scroller--window relative z-10"
          useWindowScroll
        >
          {filteredTemplates.map((template, index) => (
            <TemplateCard
              key={template.id}
              template={template}
              index={index}
              total={filteredTemplates.length}
            />
          ))}
        </ScrollStack>
      </div>
    </section>
  );
}
