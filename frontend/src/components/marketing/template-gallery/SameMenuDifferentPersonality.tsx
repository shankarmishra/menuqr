import React, { useRef } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { DEMO_RESTAURANT } from '../../../data/menuTemplates';
import { MenuTemplateRenderer } from '../../menu-builder/MenuTemplateRenderer';

const COMPARISON_TEMPLATES = [
  { id: 'dark-clipboard', label: 'Dark Clipboard', desc: 'Neon & Wood' },
  { id: 'fluid-abstract', label: 'Fluid Abstract', desc: 'Modern Organic' },
  { id: 'chalk-bistro', label: 'Chalkboard Bistro', desc: 'Rustic Cafe' },
  { id: 'royal-maharaja', label: 'Royal Maharaja', desc: 'Traditional Luxury' },
  { id: 'modern-india', label: 'Modern India', desc: 'Editorial Sans' },
  { id: 'minimal-editorial', label: 'Minimal Editorial', desc: 'Ultra Clean' },
];

export const SameMenuDifferentPersonality: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end 100%"]
  });

  const [activeIndex, setActiveIndex] = React.useState(0);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const numTemplates = COMPARISON_TEMPLATES.length;
    const segment = 1 / numTemplates;
    const index = Math.min(
      Math.floor(latest / segment),
      numTemplates - 1
    );
    setActiveIndex(index);
  });

  const selectedTemplateId = COMPARISON_TEMPLATES[activeIndex].id;

  return (
    <section ref={containerRef} className="relative min-h-[100svh] bg-menusqr-primary text-menusqr-emerald border-t border-menusqr-emerald/5 lg:h-[170vh]">
      <div className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 py-10 md:flex-row lg:sticky lg:top-[96px] lg:h-[calc(100svh-96px)] lg:min-h-0 lg:py-0">
        {/* Soft Background Accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[600px] h-[300px] bg-menusqr-orange/10 rounded-full blur-[100px] md:blur-[120px] pointer-events-none" />

        <div className="max-w-[1100px] w-full mx-auto grid md:grid-cols-2 gap-8 md:gap-20 relative z-10 items-center">
          
          {/* Left Text Column */}
          <div className="space-y-6 md:space-y-8 text-center md:text-left order-1 md:order-1 mt-0 md:mt-0">
            <div className="space-y-4">
              <span className="text-xs font-mono text-menusqr-orange uppercase tracking-[0.25em] font-extrabold inline-block">
                ONE DATASET • 3 IDENTITIES
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                Same menu.<br/>
                <span className="text-menusqr-orange">Different personality.</span>
              </h2>
              <p className="text-sm sm:text-base text-menusqr-emerald/70 max-w-md mx-auto md:mx-0 leading-relaxed font-medium">
                Your dishes, prices, and categories stay identical. Watch the visual architecture completely transform while the underlying menu data remains untouched.
              </p>
            </div>

            {/* Desktop Interactive Steps Indicator */}
            <div className="hidden md:flex flex-col gap-4 mt-8 relative">
               {/* Vertical line connector */}
               <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-menusqr-emerald/10 z-0" />
               {COMPARISON_TEMPLATES.map((tmpl, idx) => {
                 const isActive = activeIndex === idx;
                 return (
                   <button
                     key={tmpl.id}
                     onClick={() => setActiveIndex(idx)}
                     className={`flex items-center gap-6 relative z-10 text-left cursor-pointer transition-all duration-300 p-2 rounded-xl ${
                       isActive ? 'bg-white/80 shadow-xs' : 'hover:bg-white/40'
                     }`}
                   >
                     <div className={`w-[32px] h-[32px] rounded-full flex items-center justify-center border-[2px] transition-all duration-500 ${isActive ? 'bg-menusqr-orange border-menusqr-orange text-white shadow-[0_0_20px_rgba(232,120,60,0.3)] scale-110' : 'bg-white border-menusqr-emerald/20 text-menusqr-emerald/50 scale-100'}`}>
                       <span className="text-xs font-bold">{idx + 1}</span>
                     </div>
                     <div className={`transition-all duration-500 ${isActive ? 'opacity-100 translate-x-1' : 'opacity-60 translate-x-0'}`}>
                       <h4 className={`font-bold text-base transition-colors ${isActive ? 'text-menusqr-emerald' : 'text-menusqr-emerald/60'}`}>{tmpl.label}</h4>
                       <p className="text-xs text-menusqr-emerald/60 font-medium">{tmpl.desc}</p>
                     </div>
                   </button>
                 );
               })}
            </div>
            
            {/* Mobile scroll indicator */}
            <div className="md:hidden flex justify-center items-center gap-2 mt-4">
              {COMPARISON_TEMPLATES.map((_, idx) => (
                <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${activeIndex === idx ? 'w-8 bg-menusqr-orange' : 'w-2 bg-menusqr-emerald/20'}`} />
              ))}
            </div>
            
            {/* Scroll affordance text mobile */}
            <div className="md:hidden text-xs text-menusqr-emerald/40 uppercase tracking-widest font-mono pt-2 font-semibold">
              Scroll down ↓
            </div>

          </div>

          {/* Right Phone Column */}
          <div className="flex justify-center md:justify-end items-center order-2 md:order-2">
            <div className="relative rounded-[46px] bg-gradient-to-br from-[#F0E1BA] via-[#BDA66D] to-[#51482E] p-[3px] shadow-[0_34px_90px_-25px_rgba(15,24,19,0.45)]">
            <div className="w-[320px] sm:w-[360px] h-[460px] sm:h-[560px] rounded-[43px] border-[6px] border-[#222A25] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)] overflow-hidden bg-black relative">
              <div className="absolute -left-[6px] top-[135px] z-50 h-12 w-[3px] rounded-r bg-[#C2AA70]" />
              <div className="absolute -left-[6px] top-[202px] z-50 h-10 w-[3px] rounded-r bg-[#C2AA70]" />
              
              {/* Phone Notch/Island */}
              <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-50 pointer-events-none">
                <div className="w-1/3 h-5 bg-[#2A3430] rounded-b-xl" />
              </div>

              <div className="w-full h-full relative overflow-hidden bg-black pt-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedTemplateId}
                    initial={{ opacity: 0, scale: 0.985 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.985 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full h-full absolute inset-0"
                  >
                    <MenuTemplateRenderer
                      templateId={selectedTemplateId}
                      restaurant={DEMO_RESTAURANT}
                      categories={DEMO_RESTAURANT.categories}
                      items={DEMO_RESTAURANT.items}
                      compact={false}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SameMenuDifferentPersonality;
