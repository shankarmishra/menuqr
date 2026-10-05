import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { menuTemplates, DEMO_RESTAURANT } from '../../data/menuTemplates';
import { MenuTemplateRenderer } from '../menu-builder/MenuTemplateRenderer';
import { ChevronDown, ArrowRight, ArrowLeft, Palette } from 'lucide-react';

export default function TemplateGallerySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress within the 220vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Smooth the scroll so the templates glide cinematically
  const smoothProgress = useSpring(scrollYProgress, { damping: 25, stiffness: 120, mass: 0.5 });
  
  // Map 0-1 progress to 0-14 index
  const activeIndex = useTransform(smoothProgress, [0, 1], [0, menuTemplates.length - 1]);

  return (
    <section 
      ref={containerRef} 
      className="relative h-[220vh] bg-menusqr-primary"
    >
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        
        {/* Cinematic Ambient Glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-menusqr-emerald/5 blur-[120px] rounded-full mix-blend-multiply" />
          <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] bg-menusqr-orange/5 blur-[120px] rounded-full mix-blend-multiply" />
        </div>

        {/* Header Typography */}
        <div className="absolute top-8 sm:top-12 left-0 right-0 z-50 text-center px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-menusqr-emerald/5 text-menusqr-orange text-xs font-semibold uppercase tracking-wider border border-menusqr-orange/20 mb-4 shadow-sm">
            <Palette size={14} />
            <span>Theme Architecture</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-menusqr-emerald tracking-tight mb-3">
            15 Signature Templates.
          </h2>
          <p className="text-menusqr-emerald/70 max-w-xl mx-auto text-sm md:text-base font-medium">
            Not just color swaps. We structurally re-render your entire menu with distinct typography, spacing, and editorial layouts.
          </p>
        </div>

        {/* Desktop Scroll Hints (Sides) */}
        <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-8 right-8 justify-between z-40 pointer-events-none opacity-40 text-menusqr-emerald">
          <div className="flex items-center gap-2 text-sm uppercase tracking-widest font-bold">
            <ArrowLeft className="w-5 h-5" /> Scroll Up
          </div>
          <div className="flex items-center gap-2 text-sm uppercase tracking-widest font-bold">
            Scroll Down <ArrowRight className="w-5 h-5" />
          </div>
        </div>

        {/* Carousel Viewport */}
        <div className="relative w-full h-[70vh] sm:h-[700px] max-h-[75vh] flex items-center justify-center mt-16 perspective-[1200px]">
          {menuTemplates.map((template, i) => (
            <TemplateCard 
              key={template.id}
              template={template}
              index={i}
              activeIndex={activeIndex}
            />
          ))}
        </div>
        
        {/* Mobile Scroll Hint (Bottom) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex md:hidden flex-col items-center gap-2 opacity-60">
          <span className="text-[10px] text-menusqr-emerald uppercase tracking-widest font-bold">Scroll to Explore</span>
          <motion.div animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <ChevronDown className="text-menusqr-emerald w-4 h-4" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function TemplateCard({ template, index, activeIndex }: { template: any, index: number, activeIndex: any }) {
  // Distance from center (0 = center, <0 = right, >0 = left)
  const distance = useTransform(activeIndex, (val: number) => val - index);
  
  // X offset: spread horizontally
  const x = useTransform(distance, (val) => `${val * -110}%`);
  
  // Scale down off-center cards
  const scale = useTransform(distance, (val) => 1 - Math.abs(val) * 0.12);
  
  // Fade out cards smoothly
  const opacity = useTransform(distance, (val) => {
    const abs = Math.abs(val);
    if (abs < 1) return 1; 
    if (abs < 2) return 1 - (abs - 1) * 0.4;
    if (abs < 3) return 0.6 - (abs - 2) * 0.6;
    return 0;
  });
  
  // Ensure center card is always on top
  const zIndex = useTransform(distance, (val) => 30 - Math.round(Math.abs(val)));
  
  // Cinematic 3D Rotation based on distance
  const rotateY = useTransform(distance, (val) => `${val * 12}deg`);
  
  // Editorial Parallax Crop Effect (scale up inner content as container scales down)
  const innerScale = useTransform(distance, (val) => 1 + Math.abs(val) * 0.08);

  // Metadata text fades rapidly when moving out of center
  const overlayOpacity = useTransform(distance, (val) => 1 - Math.abs(val) * 1.5);

  return (
    <motion.div
      style={{ x, scale, opacity, zIndex, rotateY }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[82vw] sm:w-[380px] h-full"
    >
      {/* Physical Glass Frame */}
      <div className="w-full h-full rounded-[2.25rem] overflow-hidden bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] ring-1 ring-black/5 flex flex-col relative">
        
        {/* Template Metadata Overlay (Gradient fade up from bottom) */}
        <motion.div 
          style={{ opacity: overlayOpacity }}
          className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-menusqr-emerald via-menusqr-emerald/90 to-transparent p-6 z-50 flex flex-col justify-end pointer-events-none"
        >
          <div className="inline-block px-2.5 py-1 rounded-full bg-white/20 border border-white/20 text-white text-[9px] font-black uppercase tracking-widest mb-3 w-fit backdrop-blur-sm">
            {template.categories?.[0] || 'Premium'} Collection
          </div>
          <h3 className="text-white font-bold text-2xl mb-2 tracking-tight">{template.name}</h3>
          <p className="text-white/80 text-xs leading-relaxed line-clamp-3">
            {template.description}
          </p>
        </motion.div>

        {/* Scaled Menu Render Container (Creates the Crop Parallax) */}
        <motion.div 
          style={{ scale: innerScale }}
          className="w-full h-full transform-gpu origin-center relative"
        >
          {/* Subtle inner shadow to give depth to the crop */}
          <div className="absolute inset-0 z-40 pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.05)]" />
          
          <div className="w-full h-full overflow-hidden" style={{ backgroundColor: template.colors?.bg || '#fff' }}>
            <MenuTemplateRenderer 
              templateId={template.id}
              restaurant={DEMO_RESTAURANT}
              categories={DEMO_RESTAURANT.categories}
              items={DEMO_RESTAURANT.items}
              compact={false}
              className="pointer-events-none pb-[200px]" // Extra padding for the bottom overlay
            />
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
