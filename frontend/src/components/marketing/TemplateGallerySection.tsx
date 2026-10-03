import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Palette, Check } from 'lucide-react';
import IPhoneMockup from './IPhoneMockup';

interface TemplateTheme {
  id: string;
  name: string;
  category: string;
  bgColor: string;
  accentColor: string;
  textColor: string;
  fontFamily: string;
  tagline: string;
  sampleItem: { name: string; price: string; desc: string; image: string };
}

const TEMPLATE_THEMES: TemplateTheme[] = [
  {
    id: 'luxury-dark',
    name: 'Luxury Emerald',
    category: 'Fine Dining',
    bgColor: '#151c19',
    accentColor: '#e8783c',
    textColor: '#ffffff',
    fontFamily: 'serif',
    tagline: 'Deep dark surfaces with warm gold accents.',
    sampleItem: { name: 'Wagyu Beef Tenderloin', price: '₹1,450', desc: 'Truffle glaze, roasted shallots', image: '🥩' },
  },
  {
    id: 'modern-clean',
    name: 'Minimal White',
    category: 'Bistro & Cafe',
    bgColor: '#fcfcfc',
    accentColor: '#151c19',
    textColor: '#0f172a',
    fontFamily: 'sans-serif',
    tagline: 'Ultra clean white aesthetic with sharp typography.',
    sampleItem: { name: 'Avocado Toast & Egg', price: '₹380', desc: 'Sourdough, poached egg, microgreens', image: '🥑' },
  },
  {
    id: 'indian-heritage',
    name: 'Royal Heritage',
    category: 'Indian & Ethnic',
    bgColor: '#2a1a15',
    accentColor: '#ffc928',
    textColor: '#fdf6e2',
    fontFamily: 'serif',
    tagline: 'Rich warm terracotta with golden royal borders.',
    sampleItem: { name: 'Dal Bukhara Special', price: '₹490', desc: 'Slow-cooked overnight with cream', image: '🍲' },
  },
  {
    id: 'cafe-warm',
    name: 'Cozy Roastery',
    category: 'Coffee & Bakery',
    bgColor: '#241e1b',
    accentColor: '#d97706',
    textColor: '#fef3c7',
    fontFamily: 'sans-serif',
    tagline: 'Warm espresso tones with handwritten feel.',
    sampleItem: { name: 'Single Origin Espresso', price: '₹190', desc: 'Notes of dark chocolate & plum', image: '☕' },
  },
  {
    id: 'premium-slate',
    name: 'Neon Cyber',
    category: 'Bar & Lounge',
    bgColor: '#0f172a',
    accentColor: '#38bdf8',
    textColor: '#f8fafc',
    fontFamily: 'sans-serif',
    tagline: 'High contrast dark slate with vibrant neon accents.',
    sampleItem: { name: 'Smoked Bourbon Sour', price: '₹650', desc: 'Craft bourbon, aromatic bitters', image: '🍸' },
  },
  {
    id: 'bakery-pastel',
    name: 'Sweet Patisserie',
    category: 'Desserts',
    bgColor: '#fff5f7',
    accentColor: '#ec4899',
    textColor: '#831843',
    fontFamily: 'sans-serif',
    tagline: 'Soft pastel pinks for cake shops and cafes.',
    sampleItem: { name: 'Raspberry Macaron Tower', price: '₹320', desc: 'French almond shell, fresh berries', image: '🧁' },
  },
  {
    id: 'classic-bistro',
    name: 'French Bistro',
    category: 'Casual Dining',
    bgColor: '#1e293b',
    accentColor: '#f43f5e',
    textColor: '#ffffff',
    fontFamily: 'serif',
    tagline: 'Classic two-column list layout.',
    sampleItem: { name: 'Confit de Canard', price: '₹890', desc: 'Crispy duck leg, garlic potato', image: '🍗' },
  },
  {
    id: 'visual-grid',
    name: 'Photo First',
    category: 'Fast Casual',
    bgColor: '#121212',
    accentColor: '#22c55e',
    textColor: '#ffffff',
    fontFamily: 'sans-serif',
    tagline: 'Large visual cards focusing on dish imagery.',
    sampleItem: { name: 'Double Smash Burger', price: '₹420', desc: 'Angus beef patty, cheddar, brioche', image: '🍔' },
  },
];

export default function TemplateGallerySection() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const current = TEMPLATE_THEMES[selectedIndex];

  const handleNext = () => setSelectedIndex((prev) => (prev + 1) % TEMPLATE_THEMES.length);
  const handlePrev = () => setSelectedIndex((prev) => (prev - 1 + TEMPLATE_THEMES.length) % TEMPLATE_THEMES.length);

  return (
    <section className="py-24 md:py-36 px-6 bg-[#1d2723] border-b border-white/5 relative overflow-hidden">
      <div className="max-w-[1240px] mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151c19] text-[#e8783c] text-xs font-semibold uppercase tracking-wider border border-[#e8783c]/30 mb-4">
          <Palette size={14} />
          <span>Visual Theme Architecture</span>
        </div>
        <h2 className="text-[2.25rem] sm:text-[3.25rem] font-extrabold text-white tracking-tight">
          10 Structurally Distinct Menu Themes
        </h2>
        <p className="text-base sm:text-lg text-[#aab7b2] max-w-2xl mx-auto mt-3">
          Every template features custom typography, card composition, and navigation layouts—not just simple background color swaps.
        </p>
      </div>

      <div className="max-w-[1100px] mx-auto flex gap-2 overflow-x-auto pb-4 justify-start md:justify-center scrollbar-none mb-10 px-4">
        {TEMPLATE_THEMES.map((theme, idx) => (
          <button
            key={theme.id}
            onClick={() => setSelectedIndex(idx)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border flex items-center gap-2 ${
              selectedIndex === idx
                ? 'bg-[#e8783c] text-white border-[#e8783c] shadow-lg shadow-[#e8783c]/20'
                : 'bg-[#151c19] text-[#aab7b2] border-white/10 hover:border-white/30'
            }`}
          >
            {selectedIndex === idx && <Check size={12} />}
            <span>{theme.name}</span>
          </button>
        ))}
      </div>

      <div className="max-w-[1000px] mx-auto grid md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-5 space-y-4 text-left order-2 md:order-1 bg-[#151c19] p-6 rounded-2xl border border-white/10 shadow-xl">
          <span className="text-xs text-[#ffc928] font-mono uppercase tracking-wider">
            {current.category}
          </span>
          <h3 className="text-2xl font-bold text-white">{current.name}</h3>
          <p className="text-sm text-[#aab7b2] leading-relaxed">{current.tagline}</p>

          <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
            <div className="flex justify-between text-[#aab7b2]">
              <span>Typography:</span>
              <span className="text-white font-mono">{current.fontFamily}</span>
            </div>
            <div className="flex justify-between text-[#aab7b2]">
              <span>Primary Accent:</span>
              <span className="flex items-center gap-1.5 text-white font-mono">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: current.accentColor }} />
                {current.accentColor}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handlePrev}
              className="p-3 rounded-xl bg-[#1d2723] hover:bg-white/10 text-white border border-white/10"
              aria-label="Previous template"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleNext}
              className="p-3 rounded-xl bg-[#1d2723] hover:bg-white/10 text-white border border-white/10"
              aria-label="Next template"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="md:col-span-7 flex justify-center order-1 md:order-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <IPhoneMockup badgeText={current.name}>
                <div
                  className="p-4 space-y-4 min-h-[380px] flex flex-col justify-between"
                  style={{
                    backgroundColor: current.bgColor,
                    color: current.textColor,
                    fontFamily: current.fontFamily,
                  }}
                >
                  <div>
                    <div className="border-b border-current/10 pb-3 mb-3 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-sm" style={{ color: current.textColor }}>
                          {current.name} Experience
                        </h4>
                        <p className="text-[9px] opacity-70">{current.category} Layout</p>
                      </div>
                      <span
                        className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: current.accentColor, color: '#ffffff' }}
                      >
                        Active
                      </span>
                    </div>

                    <div
                      className="p-3 rounded-xl border mb-3 shadow-sm"
                      style={{
                        borderColor: current.accentColor + '40',
                        backgroundColor: current.bgColor === '#fcfcfc' ? '#ffffff' : 'rgba(255,255,255,0.05)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{current.sampleItem.image}</span>
                        <div className="flex-1">
                          <h5 className="text-xs font-bold">{current.sampleItem.name}</h5>
                          <p className="text-[10px] opacity-75">{current.sampleItem.desc}</p>
                        </div>
                        <span className="text-xs font-extrabold" style={{ color: current.accentColor }}>
                          {current.sampleItem.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] opacity-60 text-center pt-2 border-t border-current/10">
                    Designed for high-conversion scanning
                  </div>
                </div>
              </IPhoneMockup>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}