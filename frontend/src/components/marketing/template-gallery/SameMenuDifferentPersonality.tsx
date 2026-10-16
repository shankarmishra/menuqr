import { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Sparkles, Plus, Check, ShoppingBag, UtensilsCrossed } from 'lucide-react';
import PremiumIPhoneMockup from '../PremiumIPhoneMockup';
import { menuTemplates } from '../../../data/menuTemplates';

interface ComparisonTemplateMeta {
  id: string;
  label: string;
  desc: string;
  tagline: string;
  themeName: string;
  restaurantName: string;
  tableInfo: string;
  badgeText: string;
  accentColor: string;
  secondaryColor: string;
  bgColor: string;
  surfaceColor: string;
  textColor: string;
  subtextColor: string;
  borderColor: string;
  chipActiveBg: string;
  chipActiveText: string;
  headingFont: string;
  ornament: string;
  isDark?: boolean;
}

const COMPARISON_TEMPLATES: ComparisonTemplateMeta[] = [
  {
    id: 'royal-maharaja',
    label: 'Royal Maharaja',
    desc: 'Palace dining & gold',
    tagline: 'Palace Dining & Heritage Feast',
    themeName: 'Royal Maharaja',
    restaurantName: 'The Royal Haveli',
    tableInfo: 'Table #07 • Royal Banquet',
    badgeText: 'Palace Heritage',
    isDark: true,
    accentColor: '#D4AF37',
    secondaryColor: '#FFF5D1',
    bgColor: '#25091A',
    surfaceColor: '#350F26',
    textColor: '#FAF3E0',
    subtextColor: 'rgba(250, 243, 224, 0.7)',
    borderColor: 'rgba(212, 175, 55, 0.35)',
    chipActiveBg: '#D4AF37',
    chipActiveText: '#1A0B13',
    headingFont: "'Playfair Display', serif",
    ornament: '✦ ❖ ✦',
  },
  {
    id: 'rajasthani-heritage',
    label: 'Heritage Parchment',
    desc: 'Botanical parchment & teal',
    tagline: 'Botanical Atelier & Courtyard Dining',
    themeName: 'Heritage Parchment Atelier',
    restaurantName: 'Haveli Rajputana',
    tableInfo: 'Table #07 • Courtyard Dining',
    badgeText: 'Botanical Craft',
    isDark: false,
    accentColor: '#D76C3C',
    secondaryColor: '#315A53',
    bgColor: '#F7EBD7',
    surfaceColor: '#FCF5E9',
    textColor: '#244740',
    subtextColor: '#716958',
    borderColor: 'rgba(49, 90, 83, 0.35)',
    chipActiveBg: '#D76C3C',
    chipActiveText: '#FFFFFF',
    headingFont: "'Cinzel', 'Playfair Display', serif",
    ornament: '✦ ❖ ✦',
  },
  {
    id: 'mughal-luxe',
    label: 'Mughal Luxe',
    desc: 'Emerald & regal gold',
    tagline: 'Dawat-e-Khas & Court Dining',
    themeName: 'Mughal Luxe',
    restaurantName: 'Nawab Dastarkhwan',
    tableInfo: 'Table #07 • Imperial Court',
    badgeText: 'Nawabi Luxe',
    isDark: true,
    accentColor: '#D7B66D',
    secondaryColor: '#FBF5E9',
    bgColor: '#083830',
    surfaceColor: '#0E493F',
    textColor: '#FBF5E9',
    subtextColor: 'rgba(251, 245, 233, 0.75)',
    borderColor: 'rgba(215, 182, 109, 0.35)',
    chipActiveBg: '#D7B66D',
    chipActiveText: '#064F43',
    headingFont: "'Cormorant Garamond', 'Playfair Display', serif",
    ornament: '❊ ✦ ❊',
  },
  {
    id: 'banarasi-gold',
    label: 'Banarasi Gold',
    desc: 'Silk weave collection',
    tagline: 'Silk Weave Luxury Collection',
    themeName: 'Banarasi Gold',
    restaurantName: 'Varanasi Zari Feast',
    tableInfo: 'Table #07 • Silk Terrace',
    badgeText: '24K Zari Silk',
    isDark: true,
    accentColor: '#FFD700',
    secondaryColor: '#FFF5D1',
    bgColor: '#240B22',
    surfaceColor: '#361334',
    textColor: '#FFF5D1',
    subtextColor: 'rgba(255, 245, 209, 0.7)',
    borderColor: 'rgba(255, 215, 0, 0.35)',
    chipActiveBg: '#FFD700',
    chipActiveText: '#1E061B',
    headingFont: "'Playfair Display', serif",
    ornament: '◈ ✦ ◈',
  },
  {
    id: 'modern-india',
    label: 'Modern India',
    desc: 'Contemporary dining',
    tagline: 'Progressive Gastronomy',
    themeName: 'Modern India',
    restaurantName: 'Amber & Saffron',
    tableInfo: 'Table #07 • Studio Table',
    badgeText: 'Contemporary',
    isDark: false,
    accentColor: '#D97706',
    secondaryColor: '#1E1B18',
    bgColor: '#FAF8F5',
    surfaceColor: '#FFFFFF',
    textColor: '#1E1B18',
    subtextColor: '#70645B',
    borderColor: 'rgba(217, 119, 6, 0.22)',
    chipActiveBg: '#D97706',
    chipActiveText: '#FFFFFF',
    headingFont: "'Plus Jakarta Sans', sans-serif",
    ornament: '• ✦ •',
  },
  {
    id: 'bombay-street',
    label: 'Bombay Street',
    desc: 'Irani café & bazaar',
    tagline: 'Irani Café & Street Bistro',
    themeName: 'Bombay Street',
    restaurantName: 'Bombay Central 1952',
    tableInfo: 'Table #07 • Corner Booth',
    badgeText: 'Street Bistro',
    isDark: true,
    accentColor: '#EAB308',
    secondaryColor: '#FFFFFF',
    bgColor: '#191A19',
    surfaceColor: '#252825',
    textColor: '#FFFFFF',
    subtextColor: 'rgba(255, 255, 255, 0.7)',
    borderColor: 'rgba(234, 179, 8, 0.4)',
    chipActiveBg: '#EAB308',
    chipActiveText: '#121312',
    headingFont: "'Plus Jakarta Sans', sans-serif",
    ornament: '★ ✦ ★',
  },
];

interface DishItem {
  id: string;
  name: string;
  price: string;
  numericPrice: number;
  category: string;
  isVeg: boolean;
  badge?: string;
  desc: string;
  image: string;
  icon: string;
}

const MENU_DISHES: DishItem[] = [
  {
    id: 'dish-1',
    name: 'Royal Murgh Dum Biryani',
    price: '₹380',
    numericPrice: 380,
    category: 'Mains',
    isVeg: false,
    badge: 'Bestseller',
    desc: 'Aged long-grain basmati, saffron-marinated tender chicken, caramelized onions & rose kewra essence.',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
    icon: '🍗',
  },
  {
    id: 'dish-2',
    name: '24h Slow Dal Makhani',
    price: '₹280',
    numericPrice: 280,
    category: 'Mains',
    isVeg: true,
    badge: 'Signature',
    desc: 'Overnight clay-pot simmered black lentils, cultured white butter, fresh cream & toasted fenugreek.',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80',
    icon: '🍲',
  },
  {
    id: 'dish-3',
    name: 'Charcoal Malai Paneer Tikka',
    price: '₹320',
    numericPrice: 320,
    category: 'Starters',
    isVeg: true,
    badge: "Chef's Pick",
    desc: 'Cottage cheese marinated in rich malai, crushed cardamom & spices, clay-oven roasted with mint glaze.',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&auto=format&fit=crop&q=80',
    icon: '🍢',
  },
  {
    id: 'dish-4',
    name: 'Old Delhi Butter Chicken',
    price: '₹390',
    numericPrice: 390,
    category: 'Mains',
    isVeg: false,
    badge: 'Must Try',
    desc: 'Boneless clay-charred chicken simmered in satin velvet tomato gravy with fresh cream & honey butter.',
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&auto=format&fit=crop&q=80',
    icon: '🥘',
  },
  {
    id: 'dish-5',
    name: 'Garlic Butter Sourdough Naan',
    price: '₹95',
    numericPrice: 95,
    category: 'Breads',
    isVeg: true,
    desc: 'Artisanal sourdough flatbread baked against blistering tandoor clay, brushed with roasted garlic butter.',
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500&auto=format&fit=crop&q=80',
    icon: '🫓',
  },
  {
    id: 'dish-6',
    name: 'Kesari Saffron Gulab Jamun',
    price: '₹150',
    numericPrice: 150,
    category: 'Desserts',
    isVeg: true,
    badge: 'Heritage',
    desc: 'Warm golden mawa dumplings steeped in saffron-cardamom syrup with silver leaf & pistachios.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80',
    icon: '🍮',
  },
];

const CATEGORIES = ['All', 'Starters', 'Mains', 'Breads', 'Desserts'];

export const SameMenuDifferentPersonality = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartItems, setCartItems] = useState<string[]>(['dish-1', 'dish-2']);
  const shouldReduceMotion = useReducedMotion();

  const selected = COMPARISON_TEMPLATES[activeIndex];
  const selectedTemplate = menuTemplates.find((template) => template.id === selected.id);

  const filteredDishes = useMemo(() => {
    if (selectedCategory === 'All') return MENU_DISHES;
    return MENU_DISHES.filter((d) => d.category === selectedCategory);
  }, [selectedCategory]);

  const toggleCartItem = (dishId: string) => {
    setCartItems((prev) =>
      prev.includes(dishId) ? prev.filter((id) => id !== dishId) : [...prev, dishId]
    );
  };

  const cartTotal = useMemo(() => {
    return cartItems.reduce((sum, id) => {
      const item = MENU_DISHES.find((d) => d.id === id);
      return sum + (item ? item.numericPrice : 0);
    }, 0);
  }, [cartItems]);

  return (
    <section id="same-menu-section" className="relative overflow-hidden border-y border-menusqr-emerald/10 bg-[#F7F5EF] px-5 py-16 text-menusqr-emerald sm:px-8 md:py-24">
      {/* Dynamic Ambient Background Glow that morphs with selected style */}
      <div
        className="pointer-events-none absolute -right-32 top-1/2 h-[32rem] w-[32rem] -translate-y-1/2 rounded-full blur-3xl opacity-30 transition-colors duration-700"
        style={{ backgroundColor: selected.accentColor }}
      />
      <div className="pointer-events-none absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-menusqr-emerald/5 blur-3xl" />

      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: 'easeOut' }}
        className="relative mx-auto grid w-full max-w-[1240px] grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-12"
      >
        {/* Left Column: Style Switcher & Copy */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-menusqr-orange/20 bg-white/90 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-menusqr-orange shadow-sm">
            <Sparkles size={14} />
            <span>One Menu · Six Visual Personalities</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight text-menusqr-emerald">
            Same menu.
            <span className="mt-1 block text-menusqr-orange">Different personality.</span>
          </h2>

          <p className="max-w-lg text-base sm:text-lg font-medium leading-relaxed text-menusqr-neutral-sec">
            Your dishes and prices stay the exact same. Click any personality below to watch the live table menu transform instantly inside the phone.
          </p>

          {/* Style Selector Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {COMPARISON_TEMPLATES.map((template, index) => {
              const isActive = activeIndex === index;
              const colors = menuTemplates.find((item) => item.id === template.id)?.colors;

              return (
                <button
                  key={template.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveIndex(index)}
                  className={`group flex min-h-[72px] items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-menusqr-orange focus-visible:ring-offset-2 ${
                    isActive
                      ? 'border-menusqr-orange/60 bg-white shadow-[0_10px_28px_rgba(21,28,25,0.08)] ring-1 ring-menusqr-orange/20 scale-[1.01]'
                      : 'border-menusqr-emerald/10 bg-white/60 hover:-translate-y-0.5 hover:border-menusqr-emerald/20 hover:bg-white'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black transition-colors duration-200 ${
                      isActive
                        ? 'bg-menusqr-orange text-white shadow-sm'
                        : 'bg-menusqr-emerald/5 text-menusqr-emerald/60 group-hover:bg-menusqr-emerald/10'
                    }`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-extrabold text-menusqr-emerald">
                      {template.label}
                    </span>
                    <span className="mt-0.5 block truncate text-xs font-medium text-menusqr-neutral-sec">
                      {template.desc}
                    </span>
                  </span>
                  <span className="flex shrink-0 gap-1" aria-hidden="true">
                    {[colors?.bg, colors?.accent, colors?.surface].map((color, colorIndex) => (
                      <span
                        key={`${template.id}-${colorIndex}`}
                        className="h-2.5 w-2.5 rounded-full border border-black/10 shadow-xs"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 pt-2 text-xs font-semibold text-menusqr-neutral-sec">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Interactive: Tap styles, filter categories, or add items inside the phone.</span>
          </div>
        </div>

        {/* Right Column: High-End Floating iPhone 16 Pro Mockup (Centered Inward) */}
        <div className="lg:col-span-7 flex justify-center items-center relative perspective-[1000px] py-4">
          {/* 3D Floating Motion Wrapper */}
          <motion.div
            initial={{ opacity: 0, rotateY: 10, scale: 0.95 }}
            whileInView={{ opacity: 1, rotateY: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.05 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative shadow-[0_36px_80px_rgba(21,28,25,0.22)] rounded-[52px]"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Ambient Glow behind phone matched to template color */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[580px] rounded-full blur-[110px] pointer-events-none transition-colors duration-700 opacity-25"
              style={{ backgroundColor: selected.accentColor }}
            />

            {/* Floating Pill - Top Left cleanly floating above phone */}
            <div className="absolute -top-10 sm:-top-11 left-0 sm:-left-4 z-30 flex items-center gap-2 rounded-full border border-white/80 bg-white/95 px-3.5 py-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.08)] backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-extrabold text-menusqr-emerald tracking-wide">
                Live Table View • {selected.badgeText}
              </span>
            </div>
            <PremiumIPhoneMockup
              statusBarTheme={selected.isDark ? 'light' : 'dark'}
              statusBarBg="bg-transparent"
              screenClassName="overflow-hidden flex flex-col"
            >
              {/* Phone Internal Screen Display */}
              <div
                className="h-full w-full relative flex flex-col select-none transition-colors duration-500 overflow-hidden"
                style={{
                  backgroundColor: selected.bgColor,
                  color: selected.textColor,
                  fontFamily: selected.headingFont,
                }}
              >
                {/* Sticky Restaurant Masthead */}
                <div
                  className="py-2.5 px-3.5 border-b shrink-0 z-20 backdrop-blur-md transition-colors duration-500"
                  style={{
                    backgroundColor: selected.surfaceColor,
                    borderColor: selected.borderColor,
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <UtensilsCrossed size={12} style={{ color: selected.accentColor }} />
                        <h3 className="text-xs sm:text-[13px] font-black tracking-tight leading-none">
                          {selected.restaurantName}
                        </h3>
                      </div>
                      <p
                        className="text-[10px] mt-1 font-sans font-medium tracking-wide"
                        style={{ color: selected.subtextColor }}
                      >
                        {selected.tableInfo}
                      </p>
                    </div>

                    <span
                      className="text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-xs"
                      style={{
                        backgroundColor: selected.chipActiveBg,
                        color: selected.chipActiveText,
                        borderColor: selected.accentColor,
                      }}
                    >
                      {selected.badgeText}
                    </span>
                  </div>

                  {/* Horizontal Category Navigation Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                    {CATEGORIES.map((cat) => {
                      const isCatActive = selectedCategory === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          className="px-2.5 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer"
                          style={{
                            backgroundColor: isCatActive ? selected.chipActiveBg : 'transparent',
                            color: isCatActive ? selected.chipActiveText : selected.textColor,
                            border: `1px solid ${isCatActive ? selected.accentColor : selected.borderColor}`,
                          }}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Scrollable Menu Items Canvas */}
                <div className="flex-1 overflow-y-auto scrollbar-none p-3 space-y-2.5 pb-20 relative">
                  {/* Subtle Ornamental Heading */}
                  <div className="text-center py-1">
                    <span
                      className="text-[9px] uppercase tracking-[0.25em] font-bold block"
                      style={{ color: selected.accentColor }}
                    >
                      {selected.ornament} {selected.tagline} {selected.ornament}
                    </span>
                  </div>

                  {/* Menu Dish Cards */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${selected.id}-${selectedCategory}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      className="space-y-2.5"
                    >
                      {filteredDishes.map((dish) => {
                        const inCart = cartItems.includes(dish.id);

                        return (
                          <div
                            key={dish.id}
                            className="rounded-2xl p-2.5 border transition-all duration-300 flex gap-2.5 relative overflow-hidden group shadow-xs"
                            style={{
                              backgroundColor: selected.surfaceColor,
                              borderColor: inCart ? selected.accentColor : selected.borderColor,
                            }}
                          >
                            {/* Left: Dish Information */}
                            <div className="flex-1 flex flex-col justify-between min-w-0">
                              <div>
                                <div className="flex items-center gap-1.5 mb-1">
                                  {/* Veg / Non-Veg Indicator */}
                                  <div
                                    className={`w-2.5 h-2.5 border flex items-center justify-center rounded-[2px] shrink-0 ${
                                      dish.isVeg ? 'border-emerald-600' : 'border-rose-600'
                                    }`}
                                  >
                                    <div
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        dish.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                                      }`}
                                    />
                                  </div>

                                  {/* Dish Title */}
                                  <h4 className="text-[11.5px] font-black line-clamp-1 leading-snug">
                                    {dish.name}
                                  </h4>
                                </div>

                                {/* Description */}
                                <p
                                  className="text-[9.5px] font-sans leading-relaxed line-clamp-2"
                                  style={{ color: selected.subtextColor }}
                                >
                                  {dish.desc}
                                </p>
                              </div>

                              {/* Price & Add to Order Bar */}
                              <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/5 dark:border-white/5">
                                <span
                                  className="text-[12px] font-extrabold font-sans"
                                  style={{ color: selected.accentColor }}
                                >
                                  {dish.price}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => toggleCartItem(dish.id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-sans font-bold uppercase tracking-wider transition-transform active:scale-95 cursor-pointer shadow-xs"
                                  style={{
                                    backgroundColor: inCart ? selected.chipActiveBg : 'transparent',
                                    color: inCart ? selected.chipActiveText : selected.textColor,
                                    border: `1px solid ${selected.accentColor}`,
                                  }}
                                >
                                  {inCart ? (
                                    <>
                                      <Check size={10} />
                                      <span>Added</span>
                                    </>
                                  ) : (
                                    <>
                                      <Plus size={10} />
                                      <span>Add</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Right: Dish Photo Thumbnail with luxury fallback */}
                            <div
                              className="w-[66px] h-[66px] rounded-xl overflow-hidden shrink-0 relative flex items-center justify-center border shadow-xs"
                              style={{
                                backgroundColor: selected.bgColor,
                                borderColor: selected.borderColor,
                              }}
                            >
                              <span className="text-2xl select-none opacity-80" aria-hidden="true">
                                {dish.icon}
                              </span>
                              <img
                                src={dish.image}
                                alt={dish.name}
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />

                              {/* Bestseller Badge */}
                              {dish.badge && (
                                <span
                                  className="absolute top-1 left-1 px-1.5 py-0.5 rounded-sm text-[7.5px] font-sans font-black uppercase tracking-wider shadow-sm z-10"
                                  style={{
                                    backgroundColor: selected.accentColor,
                                    color: selected.chipActiveText,
                                  }}
                                >
                                  {dish.badge}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Floating Bottom Table Cart Summary */}
                <div
                  className="absolute bottom-5 sm:bottom-6 left-3 right-3 p-2.5 rounded-2xl border shadow-xl flex items-center justify-between backdrop-blur-xl z-20 transition-all duration-300"
                  style={{
                    backgroundColor: selected.surfaceColor,
                    borderColor: selected.accentColor,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-xs"
                      style={{
                        backgroundColor: selected.chipActiveBg,
                        color: selected.chipActiveText,
                      }}
                    >
                      <ShoppingBag size={13} />
                    </div>
                    <div>
                      <span className="text-[11px] font-sans font-black block leading-none">
                        {cartItems.length} {cartItems.length === 1 ? 'Dish' : 'Dishes'} • ₹{cartTotal}
                      </span>
                      <span
                        className="text-[9px] font-sans font-medium"
                        style={{ color: selected.subtextColor }}
                      >
                        Table #07 Active Cart
                      </span>
                    </div>
                  </div>

                  <span
                    className="px-2.5 py-1 rounded-xl text-[10px] font-sans font-bold uppercase tracking-wider shadow-xs"
                    style={{
                      backgroundColor: selected.accentColor,
                      color: selected.chipActiveText,
                    }}
                  >
                    Order Now →
                  </span>
                </div>
              </div>
            </PremiumIPhoneMockup>

            {/* Floating Pill - Bottom Right (Attached to Phone) */}
            <div className="absolute -bottom-3 -right-2 sm:-right-4 z-30 flex items-center gap-2.5 rounded-full border border-white/80 bg-white/95 py-2 pl-3.5 pr-3 shadow-[0_10px_24px_rgba(0,0,0,0.1)] backdrop-blur-md">
              <span className="text-xs font-bold text-menusqr-neutral-sec">Viewing</span>
              <span className="max-w-[150px] truncate text-xs font-black text-menusqr-emerald">
                {selectedTemplate?.name ?? selected.label}
              </span>
              <ArrowUpRight size={14} className="text-menusqr-orange" />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default SameMenuDifferentPersonality;
