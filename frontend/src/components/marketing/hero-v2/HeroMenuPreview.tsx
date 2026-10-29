import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, Battery, Signal } from 'lucide-react';

interface HeroMenuPreviewProps {
  stage: string;
  price: number;
}

export default function HeroMenuPreview({ stage, price }: HeroMenuPreviewProps) {
  const isMenuOpen = ['menu-open', 'menu-scroll', 'menu-update', 'same-qr'].includes(stage);
  const isScrolled = ['menu-scroll', 'menu-update', 'same-qr'].includes(stage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isMenuOpen ? 1 : 0,
        y: isMenuOpen ? 0 : 20
      }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="absolute inset-0 bg-[#FAFAF7] z-20 flex flex-col font-sans overflow-hidden"
    >
      {/* iOS Status Bar */}
      <div className="absolute top-0 left-0 w-full h-[44px] flex justify-between items-center px-6 pt-3 z-50 text-white font-semibold text-[11px] drop-shadow-md">
        <span className="w-10">9:41</span>
        <div className="flex items-center gap-1.5 opacity-100">
          <Signal size={12} className="stroke-[2.5]" />
          <Wifi size={12} className="stroke-[2.5]" />
          <div className="relative flex items-center">
             <Battery size={16} className="stroke-2" />
             <div className="absolute left-[2px] top-[4.5px] h-[7px] w-[9px] bg-white rounded-[1px]" />
          </div>
        </div>
      </div>

      {/* Hero Banner Image */}
      <div className="relative w-full h-[140px] shrink-0 bg-slate-200">
        <img src="/marketing/hero/hero-restaurant-poster.webp" className="w-full h-full object-cover" alt="Restaurant Cover" decoding="async" loading="lazy" width={1376} height={768} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />
        <div className="absolute bottom-4 left-5 text-white">
          <h3 className="font-black text-2xl tracking-tight leading-none mb-1 shadow-sm">The Garden</h3>
          <p className="text-white/90 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34B56A]" />
            Table #12
          </p>
        </div>
      </div>

      {/* Menu Categories Horizontal Scroll */}
      <div className="bg-white border-b border-slate-100 px-5 py-3 flex gap-3 shadow-sm shrink-0 relative z-30">
        <div className="bg-[#151C19] text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-sm">Starters</div>
        <div className="bg-transparent text-[#626776] border border-slate-200/50 text-[11px] font-bold px-4 py-1.5 rounded-full">Mains</div>
        <div className="bg-transparent text-[#626776] border border-slate-200/50 text-[11px] font-bold px-4 py-1.5 rounded-full">Desserts</div>
      </div>

      {/* Scrollable Menu Content Container */}
      <div className="flex-1 overflow-hidden relative">
        <motion.div 
          animate={{ y: isScrolled ? -140 : 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="p-4 space-y-4"
        >
          
          {/* Menu Item 1: Dahi Puri */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/50/60 flex flex-col gap-3">
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-3.5 h-3.5 border border-green-600 rounded flex items-center justify-center bg-green-50">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                  </div>
                  <h4 className="font-bold text-[#151C19] text-sm">Dahi Puri</h4>
                </div>
                <p className="text-[11px] text-[#626776] leading-relaxed line-clamp-2">
                  Crispy shells filled with potatoes, yogurt, and sweet tamarind chutney.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="font-bold text-[#151C19] text-[15px]">₹120</span>
              <button className="bg-white border border-slate-200/50 text-[#151C19] text-[11px] font-bold px-5 py-1.5 rounded-lg shadow-sm">
                Add
              </button>
            </div>
          </div>

          {/* Menu Item 2: Paneer Tikka (The target item for price update) */}
          <motion.div 
             animate={stage === 'menu-update' ? { scale: [1, 1.02, 1], borderColor: ['#e2e8f0', '#34B56A', '#e2e8f0'] } : {}}
             transition={{ duration: 0.8 }}
             className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/50/60 transition-colors flex flex-col gap-3 relative overflow-hidden"
          >
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-3.5 h-3.5 border border-green-600 rounded flex items-center justify-center bg-green-50">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                  </div>
                  <h4 className="font-bold text-[#151C19] text-sm">Paneer Tikka</h4>
                </div>
                <p className="text-[11px] text-[#626776] leading-relaxed line-clamp-2">
                  Cottage cheese marinated in yogurt and warm ground spices, grilled in a tandoor.
                </p>
              </div>
              
              {/* Dish Image Thumbnail */}
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm border border-slate-100 bg-slate-100 relative">
                 <img src="/marketing/hero/hero-restaurant-poster.webp" className="w-full h-full object-cover scale-150 brightness-110" alt="Paneer Tikka" decoding="async" loading="lazy" width={1376} height={768} />
                 <div className="absolute inset-0 bg-black/5" />
              </div>
            </div>

            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-2">
                 <motion.span 
                   key={price}
                   initial={{ opacity: 0, y: -10, color: '#34B56A' }}
                   animate={{ opacity: 1, y: 0, color: '#151C19' }}
                   transition={{ duration: 0.5 }}
                   className="font-black text-[15px]"
                 >
                   ₹{price}
                 </motion.span>
                 <span className="bg-orange-50 text-orange-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Bestseller</span>
              </div>
              
              <button className="bg-white border border-slate-200/50 shadow-sm text-[#151C19] text-[11px] font-bold px-5 py-1.5 rounded-lg hover:bg-transparent relative overflow-hidden">
                Add
                {/* Highlight Flash when price changes */}
                <AnimatePresence>
                   {stage === 'menu-update' && (
                     <motion.div 
                       initial={{ opacity: 0, scale: 0 }} 
                       animate={{ opacity: 0.3, scale: 2 }} 
                       exit={{ opacity: 0 }} 
                       className="absolute inset-0 bg-[#34B56A] rounded-full" 
                     />
                   )}
                </AnimatePresence>
              </button>
            </div>
          </motion.div>

          {/* Menu Item 3: Chicken Malai */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/50/60 flex flex-col gap-3">
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-3.5 h-3.5 border border-red-600 rounded flex items-center justify-center bg-red-50">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  </div>
                  <h4 className="font-bold text-[#151C19] text-sm">Chicken Malai</h4>
                </div>
                <p className="text-[11px] text-[#626776] leading-relaxed line-clamp-2">
                  Creamy chicken kebabs with cardamom, cream cheese, and cashew paste.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="font-bold text-[#151C19] text-[15px]">₹320</span>
              <button className="bg-white border border-slate-200/50 text-[#151C19] text-[11px] font-bold px-5 py-1.5 rounded-lg shadow-sm">
                Add
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Action Button / Cart Hint */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-11/12 bg-[#151C19] text-white rounded-2xl py-3 px-4 shadow-xl flex items-center justify-between z-30">
         <div className="flex items-center gap-3">
            <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs">0</div>
            <span className="text-[11px] font-semibold text-white/80">View Cart</span>
         </div>
         <span className="font-bold text-sm">₹0</span>
      </div>

    </motion.div>
  );
}


