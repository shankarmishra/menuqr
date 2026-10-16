import { useState, useMemo, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { menuTemplates, type MenuTemplate } from '../../data/menuTemplates';
import { TemplateCard } from './template-gallery/TemplateCard';
import ScrollStack, { ScrollStackItem } from '../ui/ScrollStack';

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

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredTemplates = useMemo(() => {
    if (activeCategory === 'All') return signatureTemplates;
    return signatureTemplates.filter((t) =>
      t.categories?.some((c) => c.toLowerCase().includes(activeCategory.toLowerCase())) ||
      t.badge?.toLowerCase().includes(activeCategory.toLowerCase())
    );
  }, [activeCategory, signatureTemplates]);

  return (
    <section id="templates" className="relative overflow-x-clip bg-[#FAFAF7] pt-24 pb-20 md:pt-32 md:pb-28 scroll-mt-24 border-t border-menusqr-emerald/10">
      {/* Ambient luxury light glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-[10%] w-[50vw] h-[50vw] bg-[#E8783C]/5 blur-[160px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-[10%] w-[50vw] h-[50vw] bg-[#064F43]/5 blur-[140px] rounded-full -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="max-w-[1800px] mx-auto w-full relative z-10">
        {/* HEADER & FILTER OPTIONS */}
        <div className="px-6 md:px-16 flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-12 md:mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-menusqr-emerald text-[12px] font-bold uppercase tracking-widest border border-menusqr-emerald/15 mb-6 shadow-xs">
              <Sparkles size={14} className="text-menusqr-orange" />
              <span>Signature Heritage Collection</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-menusqr-emerald tracking-tight leading-tight mb-5">
              Menus with a{' '}
              <span 
                className="text-transparent bg-clip-text bg-gradient-to-r from-[#D78F45] via-menusqr-orange to-[#B3521E] font-serif italic font-normal pr-4 inline-block"
                style={{
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                point of view.
              </span>
            </h2>
            <p className="text-menusqr-neutral-sec text-lg sm:text-xl max-w-xl font-normal leading-relaxed">
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
                    ? 'bg-menusqr-emerald text-[#FAF8F5] shadow-[0_8px_20px_-6px_rgba(6,79,67,0.35)] scale-105'
                    : 'bg-white text-menusqr-emerald/70 hover:bg-white/90 hover:text-menusqr-emerald border border-menusqr-emerald/15 shadow-xs'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* TEMPLATE SHOWCASE LIST: REACT BITS SCROLLSTACK */}
        <ScrollStack
          key={`${activeCategory}-${isMobile ? 'mobile' : 'desktop'}`}
          className="relative z-10 max-w-[1360px] mx-auto w-full px-4 sm:px-6 md:px-12"
          useWindowScroll={true}
          itemDistance={isMobile ? 180 : 130}
          itemStackDistance={isMobile ? 16 : 28}
          stackPosition={isMobile ? '76px' : '100px'}
          itemScale={isMobile ? 0.025 : 0.035}
          baseScale={0.82}
          dimAmount={0.16}
          blurAmount={0}
          tiltAmount={0}
          rotationAmount={0}
          holdDistance={260}
          smoothScroll={false}
          snap={false}
        >
          {filteredTemplates.map((template, index) => (
            <ScrollStackItem key={template.id}>
              <TemplateCard
                template={template}
                index={index}
                total={filteredTemplates.length}
              />
            </ScrollStackItem>
          ))}
        </ScrollStack>
      </div>
    </section>
  );
}
