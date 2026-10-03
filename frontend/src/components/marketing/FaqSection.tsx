import {  useState  } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: 'Do I need special paper to print the QR codes?', a: 'No, you can print them on any standard paper or sticker material.' },
  { q: 'Can I update the menu without changing the QR?', a: 'Yes! That is the core feature. The physical code never changes.' },
  { q: 'Is there a limit to how many items I can add?', a: 'There are no strict limits, though we recommend keeping it navigable.' },
  { q: 'What happens if I cancel my subscription?', a: 'Your menu goes offline, but your QR code is protected from being hijacked.' }
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  
  return (
    <section className="py-20 md:py-32 px-6 bg-[#1d2723]" id="faq">
      <div className="max-w-[800px] mx-auto">
        <h2 className="text-[2rem] md:text-[3rem] font-semibold text-white text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-white/10 rounded-xl overflow-hidden">
              <button 
                className="w-full text-left p-6 bg-[#151c19] flex justify-between items-center text-white font-medium"
                onClick={() => setOpen(open === i ? null : i)}
              >
                {faq.q}
                <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown />
                </motion.div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-6 pt-0 bg-[#151c19] text-[#aab7b2]">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}