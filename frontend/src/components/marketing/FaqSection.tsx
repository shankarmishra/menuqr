import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { 
    q: 'Do I need special paper to print the QR codes?', 
    a: 'Not at all. You can print our high-resolution QR codes on any standard paper, cardstock, or custom sticker material. Your design, your choice.' 
  },
  { 
    q: 'Can I update the menu without changing the QR?', 
    a: 'Absolutely. The QR code links to a permanent digital identifier for your restaurant. You can update your menu items, prices, and even the theme without ever needing to reprint the physical QR code.' 
  },
  { 
    q: 'Is there a limit to how many items I can add?', 
    a: 'There are no strict limits on menu items. Our platform is optimized to load hundreds of items instantly. However, we recommend categorizing items carefully to ensure a seamless navigation experience for your guests.' 
  },
  { 
    q: 'What happens if I cancel my subscription?', 
    a: 'Your menu goes offline and will display a polite "Menu Unavailable" screen. However, your permanent QR code is protected—it will never be recycled or hijacked. When you renew, your menu instantly comes back online using the exact same QR code.' 
  }
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 md:py-24 px-6 bg-[#FAFAF7] relative overflow-hidden" id="faq">
      <div className="texture-paper-grain z-0"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-menusqr-emerald/10 pb-8">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-menusqr-emerald mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-menusqr-neutral-sec text-lg">
              Everything you need to know about switching to a modern digital menu.
            </p>
          </div>
        </div>

        <div className="flex flex-col">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div 
                key={i} 
                className="group border-b border-menusqr-emerald/10"
              >
                <button
                  className="w-full py-8 text-left flex justify-between items-start focus:outline-none"
                  onClick={() => toggleOpen(i)}
                  aria-expanded={isOpen}
                >
                  <h3 
                    className={`text-xl md:text-2xl font-medium transition-colors duration-300 ${
                      isOpen ? 'text-menusqr-emerald' : 'text-menusqr-emerald/80 group-hover:text-menusqr-emerald'
                    }`}
                  >
                    {faq.q}
                  </h3>
                  
                  <div className="ml-6 flex-shrink-0 mt-1 relative">
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className={`flex items-center justify-center w-8 h-8 rounded-full border transition-colors duration-300 ${
                        isOpen 
                          ? 'border-menusqr-orange text-menusqr-orange bg-menusqr-orange/5' 
                          : 'border-menusqr-emerald/20 text-menusqr-emerald group-hover:border-menusqr-orange/50 group-hover:text-menusqr-orange'
                      }`}
                    >
                      <ChevronDown size={16} strokeWidth={2} />
                    </motion.div>
                  </div>
                </button>
                
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ 
                        duration: 0.4, 
                        ease: [0.22, 1, 0.36, 1],
                        opacity: { duration: 0.3 }
                      }}
                      className="overflow-hidden"
                    >
                      <div className="pb-8 pr-12 md:pr-24">
                        <div className="w-12 h-[2px] bg-menusqr-orange mb-6"></div>
                        <p className="text-lg text-menusqr-neutral-sec leading-relaxed max-w-prose">
                          {faq.a}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
