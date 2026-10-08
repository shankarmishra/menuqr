import { useState, useEffect, useRef } from 'react';
import { Smartphone, Zap, Filter, HeartHandshake, Search } from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import IPhoneMockup from './PremiumIPhoneMockup';

export default function CustomerExperienceSection() {
  const [animationStep, setAnimationStep] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { margin: '100px 0px' });

  // Animation sequence timeline
  useEffect(() => {
    if (!isInView) return;

    const sequence = [
      { step: 0, duration: 1500 },
      { step: 1, duration: 1500 },
      { step: 2, duration: 1000 },
      { step: 3, duration: 500 },
      { step: 4, duration: 1000 },
      { step: 5, duration: 3000 },
      { step: 6, duration: 1000 },
    ];
    let timer: ReturnType<typeof setTimeout>;

    const runStep = (index: number) => {
      const current = sequence[index];
      setAnimationStep(current.step);
      timer = setTimeout(() => runStep((index + 1) % sequence.length), current.duration);
    };

    runStep(0);
    return () => clearTimeout(timer);
  }, [isInView]);

  const sampleItems = [
    { id: 1, name: 'Paneer Tikka Roll', price: '₹240', isVeg: true, category: 'Starters', cal: '320 kcal', desc: 'Charcoal-grilled paneer wrapped in a roomali roti with mint chutney.' },
    { id: 2, name: 'Chicken Malai Tikka', price: '₹340', isVeg: false, category: 'Starters', cal: '410 kcal', desc: 'Creamy, melt-in-mouth chicken chunks marinated in yogurt.' },
    { id: 3, name: 'Wild Mushroom Soup', price: '₹220', isVeg: true, category: 'Soups', cal: '180 kcal', desc: 'Truffle scented rich mushroom soup served with garlic bread.' },
    { id: 4, name: 'Classic Cold Coffee', price: '₹180', isVeg: true, category: 'Beverages', cal: '210 kcal', desc: 'Thick blended cold coffee with vanilla ice cream.' },
    { id: 5, name: 'Tandoori Roti', price: '₹40', isVeg: true, category: 'Breads', cal: '110 kcal', desc: 'Fresh from the clay oven.' },
    { id: 6, name: 'Dal Makhani', price: '₹320', isVeg: true, category: 'Mains', cal: '450 kcal', desc: 'Overnight simmered black lentils finished with cream.' },
  ];

  const filteredItems = animationStep >= 4 ? [sampleItems[0]] : sampleItems;
  const searchQueryText = animationStep === 3 ? 'Pa' : animationStep >= 4 ? 'Paneer' : '';

  return (
    <section ref={sectionRef} className="py-24 md:py-24 px-6 bg-menusqr-primary relative overflow-hidden">
      {/* Background Soft Textures */}
      <div className="absolute inset-0 bg-gradient-to-br from-menusqr-secondary/50 to-transparent" />
      <div className="texture-paper-grain" />

      <div className="max-w-[1240px] mx-auto grid lg:grid-cols-12 gap-16 lg:gap-12 items-center relative z-10">
        
        {/* Left: Editorial Narrative */}
        <div className="lg:col-span-5 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white shadow-sm text-menusqr-emerald text-xs font-semibold uppercase tracking-wider border border-menusqr-emerald/10"
          >
            <Smartphone size={14} className="text-menusqr-orange" />
            <span>Premium Feature</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[2.5rem] sm:text-[3.5rem] font-extrabold text-menusqr-emerald leading-[1.1] tracking-tight"
          >
            Live Table <br />
            <span className="text-menusqr-orange italic font-serif font-medium">Ordering System</span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-menusqr-neutral-sec leading-relaxed max-w-md"
          >
            Turn your digital menu into a complete point-of-sale extension. Diners can browse, filter, and place orders directly from their table without waiting for a server.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="space-y-6 pt-4"
          >
            <div className="flex gap-4 items-start group">
              <div className="p-3 rounded-2xl bg-white shadow-sm text-menusqr-yellow border border-menusqr-emerald/5 shrink-0 transition-transform group-hover:scale-110">
                <Zap size={22} className="fill-current" />
              </div>
              <div>
                <h4 className="text-base font-bold text-menusqr-emerald mb-1">Instant Order Reception</h4>
                <p className="text-sm text-menusqr-neutral-sec leading-relaxed">
                  Orders flash directly on your kitchen or reception dashboard, complete with table numbers.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start group">
              <div className="p-3 rounded-2xl bg-white shadow-sm text-menusqr-veg border border-menusqr-emerald/5 shrink-0 transition-transform group-hover:scale-110">
                <Filter size={22} />
              </div>
              <div>
                <h4 className="text-base font-bold text-menusqr-emerald mb-1">Accept & Fulfill</h4>
                <p className="text-sm text-menusqr-neutral-sec leading-relaxed">
                  One-tap acceptance notifies the diner their food is being prepared.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start group">
              <div className="p-3 rounded-2xl bg-white shadow-sm text-menusqr-orange border border-menusqr-emerald/5 shrink-0 transition-transform group-hover:scale-110">
                <HeartHandshake size={22} />
              </div>
              <div>
                <h4 className="text-base font-bold text-menusqr-emerald mb-1">Zero App Downloads</h4>
                <p className="text-sm text-menusqr-neutral-sec leading-relaxed">
                  A seamless web experience. No registration, no passwords for your customers.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right: Sharp Floating Phone Mockup */}
        <div className="lg:col-span-7 flex justify-center lg:justify-end relative perspective-[1000px]">
          {/* Decorative blur behind phone */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[500px] bg-menusqr-orange/10 blur-[100px] rounded-full mix-blend-multiply pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, rotateY: 15, scale: 0.9, x: 20 }}
            whileInView={{ opacity: 1, rotateY: -5, scale: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            className="relative shadow-[0_30px_60px_rgba(21,28,25,0.15)] rounded-[50px]"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <IPhoneMockup badgeText="Diner View">
              <div className="h-full w-full bg-[#FAFAF7] relative flex flex-col">
                {/* Header (Sticky) */}
                <div className="pt-12 pb-3 px-4 bg-white border-b border-black/5 shrink-0 z-10 shadow-sm relative">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h4 className="text-sm font-black text-menusqr-emerald tracking-tight">Olive & Thyme</h4>
                      <p className="text-[10px] text-menusqr-neutral-sec mt-0.5">Table #08 ? Digital Menu</p>
                    </div>
                    <span className="text-[10px] text-menusqr-emerald bg-menusqr-yellow px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Open
                    </span>
                  </div>

                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-2.5 text-menusqr-neutral-sec/60" />
                    <div className="w-full bg-[#F5F3EE] rounded-xl pl-9 pr-3 py-2 text-xs text-menusqr-emerald font-medium border border-transparent flex items-center h-9 relative overflow-hidden">
                      {searchQueryText || <span className="text-menusqr-neutral-sec/60">Search dishes...</span>}
                      {/* Blinking cursor */}
                      <AnimatePresence>
                        {(animationStep === 2 || animationStep === 3) && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            className="w-[1.5px] h-4 bg-menusqr-orange ml-0.5"
                          />
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-hidden relative">
                  <motion.div 
                    className="p-4 space-y-4 pb-24"
                    animate={{ 
                      y: animationStep === 1 ? -120 : 0 
                    }}
                    transition={{ type: "spring", stiffness: 60, damping: 15 }}
                  >
                    {/* Filters */}
                    <div className="flex gap-2 mb-4">
                      <div className="px-3 py-1.5 rounded-full bg-white border border-black/5 text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-menusqr-veg" />
                        Veg Only
                      </div>
                      <div className="px-3 py-1.5 rounded-full bg-white border border-black/5 text-[10px] font-bold text-menusqr-neutral-sec shadow-sm">
                        Starters
                      </div>
                      <div className="px-3 py-1.5 rounded-full bg-white border border-black/5 text-[10px] font-bold text-menusqr-neutral-sec shadow-sm">
                        Mains
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="space-y-3">
                      <AnimatePresence mode="popLayout">
                        {filteredItems.map((item) => (
                          <motion.div
                            layout
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className={`p-3 rounded-2xl bg-white shadow-sm border ${animationStep === 5 && item.id === 1 ? 'border-menusqr-orange ring-1 ring-menusqr-orange/20' : 'border-black/5'} flex gap-3 relative overflow-hidden`}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5 mb-1">
                                <div className={`w-2.5 h-2.5 border flex items-center justify-center rounded-[2px] ${item.isVeg ? 'border-menusqr-veg' : 'border-menusqr-nonveg'}`}>
                                  <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-menusqr-veg' : 'bg-menusqr-nonveg'}`} />
                                </div>
                                <span className="text-xs font-bold text-menusqr-emerald line-clamp-1">{item.name}</span>
                              </div>
                              <p className="text-[10px] text-menusqr-neutral-sec line-clamp-2 leading-relaxed mb-2">{item.desc}</p>
                              <span className="text-xs font-bold text-menusqr-emerald">{item.price}</span>
                            </div>
                            <div className="w-20 h-20 bg-[#F5F3EE] rounded-xl shrink-0 relative overflow-hidden">
                              {/* Placeholder for image */}
                              <div className="absolute inset-0 bg-gradient-to-br from-menusqr-neutral-muted/20 to-transparent" />
                              <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-menusqr-orange/10 blur-xl" />
                            </div>
                            
                            {/* Tap Ripple Effect Simulation */}
                            {animationStep === 5 && item.id === 1 && (
                              <motion.div 
                                initial={{ scale: 0, opacity: 0.5 }}
                                animate={{ scale: 2, opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-menusqr-orange/20 rounded-full pointer-events-none"
                              />
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </div>

                {/* Item Detail Sheet Pop-up */}
                <AnimatePresence>
                  {(animationStep === 5 || animationStep === 6) && (
                    <>
                      {/* Overlay */}
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 z-20 backdrop-blur-sm"
                      />
                      {/* Sheet */}
                      <motion.div 
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-30 pt-2 pb-8 shadow-2xl flex flex-col max-h-[85%]"
                      >
                        <div className="w-12 h-1.5 bg-black/10 rounded-full mx-auto mb-4" />
                        
                        <div className="px-5 overflow-y-auto pb-4 flex-1">
                          <div className="w-full aspect-[4/3] rounded-2xl bg-gradient-to-br from-[#F5F3EE] to-[#E5E3DE] mb-5 relative overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-4xl">🫔</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 border border-menusqr-veg flex items-center justify-center rounded-[2px]">
                                <div className="w-1.5 h-1.5 rounded-full bg-menusqr-veg" />
                              </div>
                              <h3 className="text-lg font-black text-menusqr-emerald">Paneer Tikka Roll</h3>
                            </div>
                          </div>
                          <p className="text-xs text-menusqr-neutral-sec leading-relaxed mb-4">
                            Charcoal-grilled paneer wrapped in a roomali roti with mint chutney, sliced onions, and a dash of chaat masala.
                          </p>
                          
                          <div className="h-[1px] w-full bg-black/5 mb-4" />
                          
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-black text-menusqr-emerald">₹240</span>
                            <div className="flex items-center gap-3">
                              <button className="w-8 h-8 rounded-full bg-[#F5F3EE] flex items-center justify-center text-menusqr-emerald font-bold">-</button>
                              <span className="font-bold text-sm">1</span>
                              <button className="w-8 h-8 rounded-full bg-menusqr-orange flex items-center justify-center text-white font-bold">+</button>
                            </div>
                          </div>
                        </div>

                        <div className="px-5 pt-2">
                          <button className="w-full py-3.5 bg-menusqr-emerald text-white rounded-2xl font-bold text-sm shadow-[0_8px_16px_rgba(21,28,25,0.2)]">
                            Add to Order • ₹240
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
                
              </div>
            </IPhoneMockup>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
