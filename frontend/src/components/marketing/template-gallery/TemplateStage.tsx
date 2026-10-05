import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { menuTemplates, DEMO_RESTAURANT, type MenuTemplate } from '../../../data/menuTemplates';
import MenuTemplateRenderer from '../../menu-builder/MenuTemplateRenderer';

interface TemplateStageProps {
  activeIndex: number;
  onSelectIndex: (index: number) => void;
  onOpenInspector: (template: MenuTemplate) => void;
}

export const TemplateStage: React.FC<TemplateStageProps> = ({
  activeIndex,
  onSelectIndex,
  onOpenInspector,
}) => {
  const prevIndex = activeIndex > 0 ? activeIndex - 1 : null;
  const nextIndex = activeIndex < menuTemplates.length - 1 ? activeIndex + 1 : null;

  const activeTemplate = menuTemplates[activeIndex] || menuTemplates[0];
  const prevTemplate = prevIndex !== null ? menuTemplates[prevIndex] : null;
  const nextTemplate = nextIndex !== null ? menuTemplates[nextIndex] : null;

  return (
    <div className="relative w-full flex justify-center items-center py-4 perspective-[1200px] min-h-[580px] sm:min-h-[660px]">
      {/* Background Staging Glow */}
      <div className="absolute w-[440px] h-[620px] bg-[#E8783C]/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* Card Carousel Track Container */}
      <div className="relative w-full max-w-[1100px] flex justify-center items-center h-[540px] sm:h-[640px]">
        {/* PREVIOUS CARD (LEFT) */}
        {prevTemplate && (
          <motion.div
            key={`prev-${prevTemplate.id}`}
            onClick={() => onSelectIndex(prevIndex!)}
            initial={{ opacity: 0, x: -160, scale: 0.8 }}
            animate={{ opacity: 0.45, x: -290, scale: 0.88, rotateY: 10, zIndex: 10 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute hidden md:block w-[300px] sm:w-[360px] h-[480px] sm:h-[580px] rounded-3xl border border-slate-300 shadow-xl overflow-hidden cursor-pointer hover:opacity-70 transition-opacity bg-white"
          >
            <div className="pointer-events-none h-full w-full opacity-80 scale-95 origin-top">
              <MenuTemplateRenderer
                templateId={prevTemplate.id}
                restaurant={DEMO_RESTAURANT}
                categories={DEMO_RESTAURANT.categories}
                items={DEMO_RESTAURANT.items}
                compact={true}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/40 via-transparent to-transparent pointer-events-none" />
          </motion.div>
        )}

        {/* ACTIVE HERO MENU CARD (CENTER) */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`active-${activeTemplate.id}`}
            initial={{ opacity: 0.8, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateY: 0, zIndex: 30 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-[340px] sm:w-[420px] h-[540px] sm:h-[640px] rounded-[32px] border-4 border-slate-900/90 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.35)] overflow-hidden bg-[#151C19] group cursor-pointer"
            onClick={() => onOpenInspector(activeTemplate)}
          >
            <MenuTemplateRenderer
              templateId={activeTemplate.id}
              restaurant={DEMO_RESTAURANT}
              categories={DEMO_RESTAURANT.categories}
              items={DEMO_RESTAURANT.items}
              compact={false}
            />

            {/* Hover Action Sheet Overlay */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none z-40 backdrop-blur-[2px]">
              <span className="px-5 py-2.5 rounded-full bg-[#E8783C] text-white text-xs font-bold shadow-xl tracking-wider uppercase flex items-center gap-2">
                🔍 Click to Inspect Design
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* NEXT CARD (RIGHT) */}
        {nextTemplate && (
          <motion.div
            key={`next-${nextTemplate.id}`}
            onClick={() => onSelectIndex(nextIndex!)}
            initial={{ opacity: 0, x: 160, scale: 0.8 }}
            animate={{ opacity: 0.45, x: 290, scale: 0.88, rotateY: -10, zIndex: 10 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute hidden md:block w-[300px] sm:w-[360px] h-[480px] sm:h-[580px] rounded-3xl border border-slate-300 shadow-xl overflow-hidden cursor-pointer hover:opacity-70 transition-opacity bg-white"
          >
            <div className="pointer-events-none h-full w-full opacity-80 scale-95 origin-top">
              <MenuTemplateRenderer
                templateId={nextTemplate.id}
                restaurant={DEMO_RESTAURANT}
                categories={DEMO_RESTAURANT.categories}
                items={DEMO_RESTAURANT.items}
                compact={true}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-l from-slate-900/40 via-transparent to-transparent pointer-events-none" />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TemplateStage;
