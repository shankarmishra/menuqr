import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { QrCode, Sparkles } from 'lucide-react';
import { MenuTemplateRenderer } from '../menu-builder/MenuTemplateRenderer';

const MOCK_RESTAURANT = {
  name: 'The Rustic Spatula',
  tagline: 'Farm to table goodness',
};

const MOCK_CATEGORIES = [
  { id: 'c1', name: 'Starters', order: 1 },
  { id: 'c2', name: 'Mains', order: 2 },
];

const MOCK_ITEMS = [
  { id: 'i1', name: 'Truffle Fries', price: 299, category: 'c1', dietType: 'veg' as const, available: true, isBestseller: true, description: 'Crispy fries with truffle oil and parmesan.' },
  { id: 'i2', name: 'Spicy Wings', price: 449, category: 'c1', dietType: 'non-veg' as const, available: true, description: 'Signature hot wings with blue cheese dip.' },
  { id: 'i3', name: 'Mushroom Risotto', price: 699, category: 'c2', dietType: 'veg' as const, available: true, description: 'Creamy arborio rice with wild mushrooms.' },
  { id: 'i4', name: 'Grilled Salmon', price: 899, category: 'c2', dietType: 'non-veg' as const, available: true, description: 'Fresh salmon with asparagus and lemon butter.' },
];

export default function PhysicalQrSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const qrScale = useTransform(scrollYProgress, [0, 0.3, 0.6], [1, 1, 0.8]);
  const qrOpacity = useTransform(scrollYProgress, [0.5, 0.6], [1, 0]);

  const phoneY = useTransform(scrollYProgress, [0.2, 0.4, 0.6, 0.8], ["120%", "0%", "0%", "0%"]);
  const phoneScale = useTransform(scrollYProgress, [0.6, 0.8], [1, 1.1]);
  
  const cameraOpacity = useTransform(scrollYProgress, [0.5, 0.6], [1, 0]);
  const menuOpacity = useTransform(scrollYProgress, [0.6, 0.7], [0, 1]);

  return (
    <section ref={containerRef} className="relative h-[350vh] bg-[#FAFAF7]">
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col md:flex-row items-center justify-center px-6 max-w-7xl mx-auto">
        
        {/* Left Side: Narrative */}
        <div className="w-full md:w-1/2 md:pr-12 max-w-xl z-20 flex flex-col justify-center h-1/3 md:h-full text-center md:text-left mt-20 md:mt-0">
          <motion.div style={{ opacity: useTransform(scrollYProgress, [0, 0.15, 0.3], [1, 1, 0]) }} className="absolute md:relative">
            <h2 className="text-3xl md:text-5xl font-bold text-menusqr-emerald mb-4">Print it once.</h2>
            <p className="text-menusqr-neutral-sec text-lg">Your physical QR code is a permanent fixture. No more reprinting for price changes, out-of-stock items, or new additions.</p>
          </motion.div>

          <motion.div style={{ opacity: useTransform(scrollYProgress, [0.2, 0.35, 0.5, 0.65], [0, 1, 1, 0]) }} className="absolute md:relative pointer-events-none">
            <h2 className="text-3xl md:text-5xl font-bold text-menusqr-emerald mb-4">Instant Access.</h2>
            <p className="text-menusqr-neutral-sec text-lg">Customers scan with their native camera. No app downloads required. Fast, friction-free entry to your digital presence.</p>
          </motion.div>

          <motion.div style={{ opacity: useTransform(scrollYProgress, [0.6, 0.75, 1], [0, 1, 1]) }} className="absolute md:relative pointer-events-none">
            <h2 className="text-3xl md:text-5xl font-bold text-menusqr-orange mb-4">A Live Experience.</h2>
            <p className="text-menusqr-neutral-sec text-lg">Beautiful, always up-to-date digital menus that reflect your brand, respect dietary tags, and drive sales seamlessly.</p>
          </motion.div>
        </div>

        {/* Right Side: The Scene */}
        <div className="w-full md:w-1/2 h-2/3 md:h-full relative flex items-center justify-center">
           {/* Scene Light */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-menusqr-emerald/5 rounded-full blur-3xl z-0 pointer-events-none" />

           {/* The physical QR Stand */}
           <motion.div 
             style={{ scale: qrScale, opacity: qrOpacity }}
             className="absolute bg-menusqr-secondary rounded-t-xl rounded-b-md shadow-2xl p-6 flex flex-col items-center justify-center border-b-8 border-menusqr-neutral-muted/40 z-10"
           >
              <div className="w-32 h-32 bg-white rounded-lg p-2 mb-4 shadow-inner border border-black/5">
                 <QrCode className="w-full h-full text-menusqr-emerald" strokeWidth={1.5} />
              </div>
              <div className="w-16 h-1 bg-menusqr-emerald/20 rounded-full" />
              <p className="mt-2 text-menusqr-emerald/60 font-semibold text-[10px] tracking-widest uppercase">Scan for Menu</p>
           </motion.div>

           {/* The Smartphone */}
           <motion.div
             style={{ y: phoneY, scale: phoneScale }}
             className="absolute w-[280px] h-[580px] bg-menusqr-emerald rounded-[3rem] p-2.5 shadow-2xl z-20 border-[3px] border-menusqr-emerald-dark"
           >
             {/* Phone Screen */}
             <div className="relative w-full h-full bg-black rounded-[2.5rem] overflow-hidden flex flex-col">
               {/* Top Notch / Dynamic Island */}
               <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-50 flex items-center justify-end px-2">
                 <div className="w-2 h-2 rounded-full bg-white/10" />
               </div>
               
               {/* Camera Viewfinder Mode */}
               <motion.div 
                 style={{ opacity: cameraOpacity }}
                 className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm z-30"
               >
                 <div className="w-56 h-56 border border-white/20 rounded-2xl relative overflow-hidden flex items-center justify-center">
                   <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-menusqr-orange rounded-tl-xl" />
                   <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-menusqr-orange rounded-tr-xl" />
                   <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-menusqr-orange rounded-bl-xl" />
                   <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-menusqr-orange rounded-br-xl" />
                   
                   {/* Scanning laser */}
                   <motion.div 
                     animate={{ y: [-100, 100, -100] }}
                     transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                     className="w-full h-[2px] bg-menusqr-orange shadow-[0_0_15px_rgba(232,120,60,0.9)]"
                   />
                 </div>
                 <p className="mt-8 text-white/80 text-xs font-medium flex items-center gap-2">
                   <Sparkles className="w-4 h-4 text-menusqr-orange" />
                   Point camera at QR code
                 </p>
               </motion.div>

               {/* Live Menu Mode */}
               <motion.div 
                 style={{ opacity: menuOpacity }}
                 className="absolute inset-0 z-40 bg-menusqr-primary"
               >
                 <MenuTemplateRenderer
                    templateId="maison-noir"
                    restaurant={MOCK_RESTAURANT}
                    categories={MOCK_CATEGORIES}
                    items={MOCK_ITEMS}
                    compact={true}
                    className="h-full w-full !pt-14 pb-8 hide-scrollbar"
                 />
               </motion.div>
             </div>
           </motion.div>
        </div>
      </div>
    </section>
  );
}
