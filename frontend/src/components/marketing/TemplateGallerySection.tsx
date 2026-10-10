import { useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { menuTemplates, type MenuTemplate } from '../../data/menuTemplates';
import ScrollStack, { ScrollStackItem } from '../ui/ScrollStack';
import { Sparkles } from 'lucide-react';

function TemplateCard({
  template,
  index,
}: {
  template: MenuTemplate;
  index: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const colors = [
    template.colors.bg,
    template.colors.surface,
    template.colors.heading,
    template.colors.accent,
  ];
  return (
    <ScrollStackItem itemClassName="mx-auto w-full max-w-[1120px] px-4 sm:px-6">
      <motion.article
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.4 }}
        data-template-id={template.id}
        className="grid min-h-[500px] grid-cols-1 overflow-hidden rounded-2xl border shadow-[0_20px_50px_rgba(0,0,0,0.3)] md:grid-cols-2"
        style={{
          backgroundColor: template.colors.bg,
          color: template.colors.text,
          borderColor: template.colors.border,
        }}
      >
        <div className="flex min-h-[380px] sm:min-h-[440px] md:min-h-[520px] items-center justify-center p-4 sm:p-6 bg-black/5">
          <img
            src={`/marketing/templates/${template.id}.webp`}
            alt={`${template.name} Indian restaurant menu design`}
            loading={index < 2 ? 'eager' : 'lazy'}
            decoding="async"
            className="max-h-[480px] w-full rounded-md object-contain shadow-sm"
          />
        </div>

        <div className="flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-12">
          <p
            className="mb-5 font-mono text-xs font-bold uppercase"
            style={{ color: template.colors.accent }}
          >
            Design {String(index + 1).padStart(2, '0')} / {menuTemplates.length}
          </p>

          <div className="mb-4 flex flex-wrap gap-2">
            {template.categories.map((category) => (
              <span
                key={category}
                className="border px-2.5 py-1 text-[10px] font-bold uppercase"
                style={{ color: template.colors.accent, borderColor: template.colors.border }}
              >
                {category}
              </span>
            ))}
          </div>

          <h3
            className="text-3xl font-bold leading-tight sm:text-4xl"
            style={{ color: template.colors.heading, fontFamily: template.typography.heading }}
          >
            {template.name}
          </h3>
          <p className="mt-2 text-sm font-medium opacity-70">{template.subtitle}</p>
          <p className="mt-5 max-w-lg text-sm leading-relaxed opacity-80 sm:text-base">
            {template.description}
          </p>

          <dl className="mt-7 grid grid-cols-2 gap-x-5 gap-y-4 border-t pt-5 text-xs sm:text-sm" style={{ borderColor: template.colors.border }}>
            <div>
              <dt className="mb-1 text-[10px] font-bold uppercase opacity-55">Menu layout</dt>
              <dd className="capitalize">{template.layout.type.replace('-', ' ')}</dd>
            </div>
            <div>
              <dt className="mb-1 text-[10px] font-bold uppercase opacity-55">Menu detail</dt>
              <dd className="capitalize">{template.layout.itemStyle.replace('-', ' ')}</dd>
            </div>
            <div>
              <dt className="mb-1 text-[10px] font-bold uppercase opacity-55">Typography</dt>
              <dd className="capitalize">{template.typography.style}</dd>
            </div>
            <div>
              <dt className="mb-1 text-[10px] font-bold uppercase opacity-55">Craft motif</dt>
              <dd className="line-clamp-1">{template.decorations.motif}</dd>
            </div>
          </dl>

          <div className="mt-6 flex items-center gap-3" aria-label="Template color palette">
            {colors.map((color, swatchIndex) => (
              <span
                key={`${color}-${swatchIndex}`}
                className="h-6 w-6 border border-white/20"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      </motion.article>
    </ScrollStackItem>
  );
}

export default function TemplateGallerySection() {
  // Extract all unique categories
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    menuTemplates.forEach(t => t.categories?.forEach(c => cats.add(c)));
    return ['All', ...Array.from(cats)];
  }, []);

  const [activeCategory, setActiveCategory] = useState('All');

  const filteredTemplates = useMemo(() => {
    if (activeCategory === 'All') return menuTemplates;
    return menuTemplates.filter(t => t.categories?.includes(activeCategory));
  }, [activeCategory]);

  return (
    <section id="templates" className="relative overflow-clip bg-[#050807] py-16 md:py-20">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-[10%] w-[60vw] h-[60vw] bg-[#E8783C]/5 blur-[160px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-[10%] w-[50vw] h-[50vw] bg-[#2D5A3D]/10 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="max-w-[1800px] mx-auto w-full">
        {/* HEADER & OPTIONS */}
        <div className="relative z-20 px-8 md:px-20 flex flex-col xl:flex-row xl:items-end justify-between gap-10 mb-10 md:mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-[#E8783C] text-[12px] font-bold uppercase tracking-widest border border-[#E8783C]/20 mb-6 backdrop-blur-md shadow-lg shadow-[#E8783C]/5">
              <Sparkles size={14} className="text-[#E8783C]" />
              <span>Premium Collection</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight mb-6">
              Menus with a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E8783C] to-[#F1A679] font-serif italic font-normal pr-4">
                point of view.
              </span>
            </h2>
            <p className="text-white/50 text-xl max-w-xl font-light leading-relaxed">
              15 signature templates. Each structurally re-renders your menu with unique typography, spacing, and layout logic.
            </p>
          </div>

          {/* Category Filter Options */}
          <div className="flex flex-wrap gap-2.5 max-w-[500px] justify-start xl:justify-end">
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-[13px] font-bold tracking-wide uppercase transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-[#E8783C] text-white shadow-[0_8px_20px_-6px_rgba(232,120,60,0.5)] scale-105'
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* TEMPLATE GRID */}
        <ScrollStack
          key={activeCategory}
          className="scroll-stack-scroller--window relative z-10"
          useWindowScroll
          itemDistance={72}
          itemScale={0.004}
          itemStackDistance={24}
          stackPosition="center"
          scaleEndPosition="8%"
          baseScale={0.92}
        >
          {filteredTemplates.map((template, index) => (
            <TemplateCard key={template.id} template={template} index={index} />
          ))}
        </ScrollStack>
      </div>
    </section>
  );
}
