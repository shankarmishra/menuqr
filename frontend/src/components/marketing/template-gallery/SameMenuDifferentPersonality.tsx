import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { DEMO_RESTAURANT, menuTemplates } from '../../../data/menuTemplates';
import { MenuTemplateRenderer } from '../../menu-builder/MenuTemplateRenderer';

const COMPARISON_TEMPLATES = [
  { id: 'royal-maharaja', label: 'Royal Maharaja', desc: 'Palace dining & gold' },
  { id: 'rajasthani-heritage', label: 'Rajasthani Heritage', desc: 'Craft & terracotta' },
  { id: 'mughal-luxe', label: 'Mughal Luxe', desc: 'Emerald & regal gold' },
  { id: 'banarasi-gold', label: 'Banarasi Gold', desc: 'Silk weave collection' },
  { id: 'modern-india', label: 'Modern India', desc: 'Contemporary dining' },
  { id: 'bombay-street', label: 'Bombay Street', desc: 'Irani café & bazaar' },
];

export const SameMenuDifferentPersonality = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const selected = COMPARISON_TEMPLATES[activeIndex];
  const selectedTemplate = menuTemplates.find((template) => template.id === selected.id);

  return (
    <section className="relative overflow-hidden border-y border-menusqr-emerald/10 bg-[#F7F5EF] px-5 py-16 text-menusqr-emerald sm:px-8 md:py-24">
      <div className="pointer-events-none absolute -right-32 top-1/2 h-[28rem] w-[28rem] -translate-y-1/2 rounded-full bg-menusqr-orange/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-menusqr-emerald/5 blur-3xl" />

      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: 'easeOut' }}
        className="relative mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-24"
      >
        <div className="min-w-0">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-menusqr-orange/20 bg-white/80 px-3.5 py-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-menusqr-orange shadow-sm">
            <Sparkles size={14} />
            One menu · six unique styles
          </div>

          <h2 className="max-w-xl text-4xl font-black leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl">
            Same menu.
            <span className="mt-1 block text-menusqr-orange">Different personality.</span>
          </h2>
          <p className="mt-5 max-w-lg text-sm font-medium leading-7 text-menusqr-emerald/70 sm:text-base">
            Your dishes and prices stay the same. Pick a style and see your restaurant menu transform instantly.
          </p>

          <div className="mt-8 grid max-w-[680px] grid-cols-1 gap-2.5 sm:grid-cols-2">
            {COMPARISON_TEMPLATES.map((template, index) => {
              const isActive = activeIndex === index;
              const colors = menuTemplates.find((item) => item.id === template.id)?.colors;

              return (
                <button
                  key={template.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveIndex(index)}
                  className={`group flex min-h-[72px] items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-[background-color,border-color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-menusqr-orange focus-visible:ring-offset-2 ${
                    isActive
                      ? 'border-menusqr-orange/50 bg-white shadow-[0_8px_24px_rgba(34,48,39,0.09)]'
                      : 'border-menusqr-emerald/10 bg-white/55 hover:-translate-y-0.5 hover:border-menusqr-emerald/20 hover:bg-white'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold transition-colors duration-200 ${
                      isActive
                        ? 'bg-menusqr-orange text-white'
                        : 'bg-menusqr-emerald/5 text-menusqr-emerald/55 group-hover:bg-menusqr-emerald/10'
                    }`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-extrabold">{template.label}</span>
                    <span className="mt-0.5 block text-xs font-medium text-menusqr-emerald/55">{template.desc}</span>
                  </span>
                  <span className="flex shrink-0 gap-1" aria-hidden="true">
                    {[colors?.bg, colors?.accent, colors?.surface].map((color, colorIndex) => (
                      <span
                        key={`${template.id}-${colorIndex}`}
                        className="h-2.5 w-2.5 rounded-full border border-black/10"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-xs font-semibold text-menusqr-emerald/45">
            Select any style to preview it on the phone.
          </p>
        </div>

        <div className="relative mx-auto flex min-h-[560px] w-full min-w-0 items-center justify-center py-3 sm:min-h-[610px]">
          <div className="absolute inset-x-8 top-1/2 h-3/4 -translate-y-1/2 rounded-full bg-menusqr-orange/10 blur-3xl" />
          <div className="absolute -left-2 top-16 z-20 hidden -rotate-6 items-center gap-2 rounded-2xl border border-white/80 bg-white/90 px-3.5 py-2.5 shadow-lg sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-extrabold text-menusqr-emerald">Live preview</span>
          </div>

          <div className="relative w-[min(360px,calc(100vw-3rem))] rounded-[42px] bg-gradient-to-br from-[#F0E1BA] via-[#BDA66D] to-[#51482E] p-[3px] shadow-[0_36px_90px_-30px_rgba(15,24,19,0.55)]">
            <div className="relative h-[540px] overflow-hidden rounded-[39px] border-[6px] border-[#222A25] bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)] sm:h-[590px]">
              <div className="absolute -left-[6px] top-[120px] z-20 h-11 w-[3px] rounded-r bg-[#C2AA70]" />
              <div className="absolute -left-[6px] top-[185px] z-20 h-9 w-[3px] rounded-r bg-[#C2AA70]" />
              <div className="absolute -right-[6px] top-[150px] z-20 h-14 w-[3px] rounded-l bg-[#C2AA70]" />
              <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex h-7 justify-center">
                <div className="h-5 w-1/3 rounded-b-xl bg-[#2A3430]" />
              </div>

              <motion.div
                key={selected.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: 'easeOut' }}
                className="h-full w-full pt-2"
              >
                <MenuTemplateRenderer
                  templateId={selected.id}
                  restaurant={DEMO_RESTAURANT}
                  categories={DEMO_RESTAURANT.categories}
                  items={DEMO_RESTAURANT.items}
                  compact={true}
                />
              </motion.div>
            </div>
          </div>

          <div className="absolute -bottom-1 right-1 z-20 flex items-center gap-2 rounded-full border border-white/70 bg-white/90 py-2 pl-3.5 pr-2.5 shadow-lg">
            <span className="text-xs font-bold text-menusqr-emerald/60">Viewing</span>
            <span className="max-w-[150px] truncate text-xs font-extrabold text-menusqr-emerald">
              {selectedTemplate?.name ?? selected.label}
            </span>
            <ArrowUpRight size={14} className="text-menusqr-orange" />
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default SameMenuDifferentPersonality;
