import React, { useRef } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { DEMO_RESTAURANT } from '../../../data/menuTemplates';
import { MenuTemplateRenderer } from '../../menu-builder/MenuTemplateRenderer';

const COMPARISON_TEMPLATES = [
  { id: 'royal-maharaja', label: 'Royal Maharaja', desc: 'Traditional Luxury' },
  { id: 'modern-india', label: 'Modern India', desc: 'Editorial Sans' },
  { id: 'minimal-editorial', label: 'Minimal Editorial', desc: 'Ultra Clean' },
];

export const SameMenuDifferentPersonality: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const [activeIndex, setActiveIndex] = React.useState(0);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // 3 states: 0-0.33, 0.33-0.66, 0.66-1.0
    if (latest < 0.33) setActiveIndex(0);
    else if (latest < 0.66) setActiveIndex(1);
    else setActiveIndex(2);
  });

  const selectedTemplateId = COMPARISON_TEMPLATES[activeIndex].id;

  return (
    <section ref={containerRef} className="relative h-[300vh] bg-menusqr-primary text-menusqr-emerald border-t border-menusqr-emerald/5">
      <div className="sticky top-0 h-screen flex flex-col md:flex-row items-center justify-center overflow-hidden px-4 py-12 md:py-0">
        {/* Soft Background Accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[600px] h-[300px] bg-menusqr-orange/10 rounded-full blur-[100px] md:blur-[120px] pointer-events-none" />

        <div className="max-w-[1100px] w-full mx-auto grid md:grid-cols-2 gap-8 md:gap-20 relative z-10 items-center">
          
          {/* Left Text Column */}
          <div className="space-y-6 md:space-y-8 text-center md:text-left order-1 md:order-1 mt-10 md:mt-0">
            <div className="space-y-4">
              <span className="text-xs font-mono text-menusqr-orange uppercase tracking-[0.25em] font-extrabold inline-block">
                ONE DATASET • 3 IDENTITIES
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                Same menu.<br/>
                <span className="text-menusqr-orange">Different personality.</span>
              </h2>
              <p className="text-sm sm:text-base text-menusqr-emerald/70 max-w-md mx-auto md:mx-0 leading-relaxed font-medium">
                Your dishes, prices, and categories stay identical. As you scroll, watch the visual architecture completely transform.
              </p>
            </div>

            {/* Desktop Steps indicator */}
            <div className="hidden md:flex flex-col gap-6 mt-12 relative">
               {/* Vertical line connector */}
               <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-menusqr-emerald/10 z-0" />
               {COMPARISON_TEMPLATES.map((tmpl, idx) => {
                 const isActive = activeIndex === idx;
                 return (
                   <div key={tmpl.id} className="flex items-center gap-6 relative z-10">
                     <div className={`w-[32px] h-[32px] rounded-full flex items-center justify-center border-[2px] transition-all duration-500 ${isActive ? 'bg-menusqr-orange border-menusqr-orange text-white shadow-[0_0_20px_rgba(232,120,60,0.3)] scale-110' : 'bg-white border-menusqr-emerald/20 text-menusqr-emerald/50 scale-100'}`}>
                       <span className="text-xs font-bold">{idx + 1}</span>
                     </div>
                     <div className={`transition-all duration-500 ${isActive ? 'opacity-100 translate-x-2' : 'opacity-60 translate-x-0'}`}>
                       <h4 className={`font-bold text-lg transition-colors ${isActive ? 'text-menusqr-emerald' : 'text-menusqr-emerald/60'}`}>{tmpl.label}</h4>
                       <p className="text-xs text-menusqr-emerald/60 font-medium">{tmpl.desc}</p>
                     </div>
                   </div>
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
            <div className="w-[320px] sm:w-[360px] h-[520px] sm:h-[620px] rounded-[32px] sm:rounded-[40px] border-[6px] border-[#2A3430] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] overflow-hidden bg-black relative">
              
              {/* Phone Notch/Island */}
              <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-50 pointer-events-none">
                <div className="w-1/3 h-5 bg-[#2A3430] rounded-b-xl" />
              </div>

              <div className="w-full h-full relative overflow-hidden bg-black pt-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedTemplateId}
                    initial={{ opacity: 0, y: 50, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -50, filter: 'blur(8px)' }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
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
    </section>
  );
};

export default SameMenuDifferentPersonality;
