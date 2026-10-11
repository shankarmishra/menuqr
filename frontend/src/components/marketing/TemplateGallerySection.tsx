import { useState, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { menuTemplates, type MenuTemplate } from '../../data/menuTemplates';
import { TemplateCard } from './template-gallery/TemplateCard';

// Featured signature templates for the "Menus with a point of view" showcase
const SIGNATURE_TEMPLATE_IDS = [
  'mughal-luxe',
  'royal-maharaja',
  'rajasthani-heritage',
  'banarasi-gold',
  'south-indian-heritage',
  'indian-street-kitchen',
  'modern-india',
  'bombay-street',
  'coffee-house',
  'minimal-editorial',
];

export default function TemplateGallerySection() {
  // Curated signature templates showcase
  const signatureTemplates = useMemo(() => {
    return SIGNATURE_TEMPLATE_IDS.map((id) => menuTemplates.find((t) => t.id === id)).filter(
      Boolean
    ) as MenuTemplate[];
  }, []);

  // Unique categories derived from signature templates
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    signatureTemplates.forEach((t) => t.categories?.forEach((c) => cats.add(c)));
    return ['All', ...Array.from(cats)];
  }, [signatureTemplates]);

  const [activeCategory, setActiveCategory] = useState('All');

  const filteredTemplates = useMemo(() => {
    if (activeCategory === 'All') return signatureTemplates;
    return signatureTemplates.filter((t) =>
      t.categories?.some((c) => c.toLowerCase().includes(activeCategory.toLowerCase())) ||
      t.badge?.toLowerCase().includes(activeCategory.toLowerCase())
    );
  }, [activeCategory, signatureTemplates]);

  return (
    <section id="templates" className="relative overflow-clip bg-[#050807] pt-24 pb-20 md:pt-32 md:pb-28 scroll-mt-24">
      {/* Ambient luxury glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-[10%] w-[60vw] h-[60vw] bg-[#D7B66D]/5 blur-[160px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-[10%] w-[50vw] h-[50vw] bg-[#064F43]/20 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="max-w-[1800px] mx-auto w-full relative z-10">
        {/* HEADER & FILTER OPTIONS */}
        <div className="px-6 md:px-16 flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-12 md:mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-[#D7B66D] text-[12px] font-bold uppercase tracking-widest border border-[#D7B66D]/30 mb-6 backdrop-blur-md shadow-lg shadow-[#D7B66D]/5">
              <Sparkles size={14} className="text-[#D7B66D]" />
              <span>Signature Heritage Collection</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight mb-5">
              Menus with a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D7B66D] via-[#EBD69A] to-[#F5EBDD] font-serif italic font-normal pr-4">
                point of view.
              </span>
            </h2>
            <p className="text-white/60 text-lg sm:text-xl max-w-xl font-light leading-relaxed">
              10 signature templates. Each structurally re-renders your menu with unique typography, spacing, and layout logic.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 max-w-[560px] justify-start xl:justify-end">
            {allCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-[13px] font-bold tracking-wide uppercase transition-all duration-300 cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#D7B66D] text-[#064F43] shadow-[0_8px_20px_-6px_rgba(215,182,109,0.5)] scale-105'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* NATURAL CONTINUOUS PAGE SCROLL: 10 TEMPLATES IN NORMAL DOCUMENT FLOW */}
        <div className="flex flex-col gap-10 sm:gap-14 md:gap-16 lg:gap-20 px-4 sm:px-6 md:px-12 max-w-[1360px] mx-auto w-full relative z-10">
          {filteredTemplates.map((template, index) => (
            <TemplateCard
              key={template.id}
              template={template}
              index={index}
              total={filteredTemplates.length}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
