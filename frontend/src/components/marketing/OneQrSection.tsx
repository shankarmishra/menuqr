import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import IPhoneMockup from './PremiumIPhoneMockup';
import PhysicalQRStand from './PhysicalQRStand';

const timelineStates = [
  {
    id: 'monday',
    day: 'Monday',
    title: 'Regular Day',
    subtitle: 'Base prices active',
    items: [
      { id: 1, name: 'Double Smash Burger', desc: 'Two beef patties, house sauce, brioche bun.', price: '₹340', tag: '', available: true },
      { id: 2, name: 'Truffle Fries', desc: 'Crispy fries tossed in truffle oil and parmesan.', price: '₹180', tag: '', available: true },
      { id: 3, name: 'Classic Mojito', desc: 'Mint, lime, soda.', price: '₹150', tag: '', available: true },
    ]
  },
  {
    id: 'wednesday',
    day: 'Wednesday',
    title: 'Mid-week Rush',
    subtitle: 'Fries sold out!',
    items: [
      { id: 1, name: 'Double Smash Burger', desc: 'Two beef patties, house sauce, brioche bun.', price: '₹340', tag: '', available: true },
      { id: 2, name: 'Truffle Fries', desc: 'Crispy fries tossed in truffle oil and parmesan.', price: '₹180', tag: 'Sold Out', available: false },
      { id: 3, name: 'Classic Mojito', desc: 'Mint, lime, soda.', price: '₹150', tag: '', available: true },
    ]
  },
  {
    id: 'saturday',
    day: 'Saturday',
    title: 'Weekend Surge',
    subtitle: 'Dynamic weekend pricing',
    items: [
      { id: 1, name: 'Double Smash Burger', desc: 'Two beef patties, house sauce, brioche bun.', price: '₹380', tag: 'Bestseller', available: true },
      { id: 2, name: 'Truffle Fries', desc: 'Crispy fries tossed in truffle oil and parmesan.', price: '₹220', tag: 'Back in stock', available: true },
      { id: 3, name: 'Classic Mojito', desc: 'Mint, lime, soda.', price: '₹180', tag: '', available: true },
    ]
  }
];

export default function OneQrSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const activeState = timelineStates[activeIndex];

  const handleTabClick = (index: number) => {
    if (index === activeIndex || isUpdating) return;
    setIsUpdating(true);
    
    // Smooth cinematic sequence: overlay appears, data swaps, overlay fades
    setTimeout(() => {
      setActiveIndex(index);
    }, 200);
    
    setTimeout(() => {
      setIsUpdating(false);
    }, 500);
  };

  return (
    <section className="py-24 md:py-36 px-6 bg-[#FAFAF7] relative border-y border-menusqr-emerald/5 overflow-hidden">
      {/* Decorative texture overlay */}
      <div className="texture-paper-grain z-0"></div>

      <div className="max-w-[1240px] mx-auto relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          
          {/* Left Column: Editorial Text & Timeline */}
          <div className="lg:col-span-4 space-y-12 lg:sticky lg:top-32">
            <div className="space-y-6">
              <h2 className="text-[2.5rem] sm:text-[3.5rem] font-extrabold text-menusqr-emerald leading-[1.05] tracking-tight">
                One QR.<br />
                <span className="text-menusqr-orange font-serif italic font-medium">Countless Updates.</span>
              </h2>
              <p className="text-lg text-menusqr-neutral-muted leading-relaxed">
                Update prices for the weekend, mark items sold out instantly, or launch new specials. Your physical QR codes remain exactly where they are—saving you printing costs forever.
              </p>
            </div>

            <div className="space-y-2 relative before:absolute before:inset-y-0 before:left-[19px] before:w-[2px] before:bg-menusqr-emerald/10">
              {timelineStates.map((state, idx) => (
                <button
                  key={state.id}
                  onClick={() => handleTabClick(idx)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-500 relative z-10 flex gap-4 ${
                    activeIndex === idx
                      ? 'bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-menusqr-emerald/5 scale-[1.02]'
                      : 'hover:bg-black/5 border border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 transition-colors duration-300 ${
                    activeIndex === idx ? 'bg-menusqr-orange shadow-[0_0_0_4px_rgba(232,120,60,0.2)]' : 'bg-menusqr-emerald/20'
                  }`} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-black uppercase tracking-wider ${
                        activeIndex === idx ? 'text-menusqr-orange' : 'text-menusqr-neutral-muted'
                      }`}>
                        {state.day}
                      </span>
                    </div>
                    <h4 className={`text-lg font-bold ${activeIndex === idx ? 'text-menusqr-emerald' : 'text-menusqr-neutral-sec'}`}>
                      {state.title}
                    </h4>
                    <p className={`text-sm mt-1 ${activeIndex === idx ? 'text-menusqr-emerald/70' : 'text-menusqr-neutral-muted'}`}>
                      {state.subtitle}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Visualization Area */}
          <div className="lg:col-span-8 flex flex-col sm:flex-row items-center justify-center gap-12 lg:gap-24 relative mt-12 lg:mt-0">
            
            {/* The Unmoving QR */}
            <div className="relative z-10 flex flex-col items-center">
              {/* Subtle ambient glow behind the QR stand */}
              <div className="absolute inset-0 bg-gradient-to-tr from-menusqr-orange/10 to-transparent rounded-full blur-[60px] -z-10" />
              
              <PhysicalQRStand className="scale-90 sm:scale-[1.15] origin-bottom" />
              
              <div className="mt-8 flex items-center gap-2 text-menusqr-emerald bg-white px-5 py-2.5 rounded-full border border-menusqr-emerald/10 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
                <ShieldCheck size={16} className="text-menusqr-veg" />
                <span className="text-xs font-extrabold uppercase tracking-wider">Never Moves</span>
              </div>
            </div>

            {/* Connection Line Animation */}
            <div className="hidden sm:block absolute left-[40%] right-[40%] top-1/2 -translate-y-[20%] h-[2px] bg-gradient-to-r from-transparent via-menusqr-emerald/10 to-transparent overflow-hidden pointer-events-none">
              <motion.div
                className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-transparent via-menusqr-orange to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
              />
            </div>

            {/* The Live Menu Phone */}
            <div className="relative z-10">
              <IPhoneMockup badgeText="Live Sync">
                <div className="bg-menusqr-secondary h-full rounded-[2.5rem] overflow-hidden flex flex-col relative pb-[20px] shadow-inner">
                  {/* Header */}
                  <div className="bg-menusqr-emerald px-5 pt-12 pb-5 text-white relative z-20 shadow-md">
                    <h3 className="font-serif text-2xl font-medium italic text-menusqr-primary">The Garden Cafe</h3>
                    <p className="text-[11px] text-white/60 font-bold uppercase tracking-[0.2em] mt-1.5">
                      {activeState.day} Menu
                    </p>
                  </div>

                  {/* Menu Items Area */}
                  <div className="flex-1 p-4 space-y-3.5 overflow-y-auto relative z-10">
                    <AnimatePresence mode="popLayout">
                      {activeState.items.map((item) => (
                        <motion.div
                          key={`${item.id}-${item.price}-${item.available}`}
                          initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
                          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, y: -15, filter: 'blur(4px)', transition: { duration: 0.2 } }}
                          transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                          className={`p-4 rounded-2xl bg-white shadow-sm border border-menusqr-emerald/5 relative overflow-hidden ${
                            !item.available ? 'opacity-60' : ''
                          }`}
                        >
                          <div className={`flex justify-between items-start mb-1 relative z-10 ${!item.available ? 'grayscale-[0.5]' : ''}`}>
                            <div className="pr-3">
                              <h4 className={`text-sm font-bold leading-tight ${!item.available ? 'line-through text-menusqr-neutral-muted' : 'text-menusqr-emerald'}`}>
                                {item.name}
                              </h4>
                              <p className="text-[11px] text-menusqr-neutral-muted mt-1 leading-relaxed line-clamp-2">
                                {item.desc}
                              </p>
                            </div>
                            <span className="text-[13px] font-black text-menusqr-emerald whitespace-nowrap bg-menusqr-secondary px-2 py-1 rounded-md">
                              {item.price}
                            </span>
                          </div>
                          
                          {item.tag && (
                            <div className="mt-2.5 inline-block relative z-10">
                              <span className={`text-[9px] font-black uppercase tracking-[0.1em] px-2 py-1 rounded-[4px] ${
                                !item.available 
                                  ? 'bg-menusqr-nonveg/10 text-menusqr-nonveg'
                                  : 'bg-menusqr-orange/10 text-menusqr-orange'
                              }`}>
                                {item.tag}
                              </span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  
                  {/* Refresh Overlay during transition */}
                  <AnimatePresence>
                    {isUpdating && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 z-50 bg-menusqr-secondary/50 backdrop-blur-[2px] flex items-center justify-center"
                      >
                        <div className="bg-white p-3 rounded-2xl shadow-xl border border-black/5">
                          <RefreshCw className="animate-spin text-menusqr-orange" size={24} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </IPhoneMockup>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
