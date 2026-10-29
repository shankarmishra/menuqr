import React, { useState, useMemo } from 'react';
import clsx from 'clsx';
import type { LayoutProps, CategoryGroup } from '../types';
import { ShobharamBespokeCover } from './ShobharamBespokeCover';
import { AuthenticNoirChalkboardBg } from '../artwork/AuthenticNoirChalkboardBg';
import {
  BookOpen,
  Sparkles,
  Phone,
  MapPin,
  Globe,
  HeartHandshake,
  Plus,
  ShieldCheck,
  Star,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';

export interface ShobharamBookletSpreadProps extends LayoutProps {}

interface CategoryMeta {
  photo: string;
  badge: string;
  subtitle: string;
  tagline: string;
}

const CATEGORY_META_REGISTRY: Record<string, CategoryMeta> = {
  'specials': {
    photo: '/uploads/shobharam/dishes/dish_paneer_masala.webp',
    badge: "Chef's Special",
    subtitle: 'Signature Desi Ghee Curries',
    tagline: 'Cooked with royal spices & rich cream',
  },
  'breakfast': {
    photo: '/uploads/shobharam/dishes/dish_samosa_chaat.webp',
    badge: 'Morning Fresh',
    subtitle: 'Crispy Kachoris & Chole Bhature',
    tagline: 'Served piping hot with tangy aloo sabji',
  },
  'combos': {
    photo: '/uploads/shobharam/dish_royal_thali.webp',
    badge: 'Value Feast',
    subtitle: 'Complete Curated Meals',
    tagline: 'Wholesome box meals for dining & delivery',
  },
  'thali': {
    photo: '/uploads/shobharam/dish_royal_thali.webp',
    badge: 'Royal Thali',
    subtitle: 'Authentic Rajasthani & North Indian Spread',
    tagline: 'Unlimited royal indulgence with breads & dessert',
  },
  'meals': {
    photo: '/uploads/shobharam/dishes/dish_platter.webp',
    badge: 'Executive Feast',
    subtitle: 'Daily Lunch & Dinner Platters',
    tagline: 'Balanced, nutritious & full of home flavor',
  },
  'soups': {
    photo: '/uploads/shobharam/dishes/dish_soup.webp',
    badge: 'Hot & Steamy',
    subtitle: 'Warm Simmered Broths',
    tagline: 'Freshly prepared rich aromatic soups',
  },
  'starters': {
    photo: '/uploads/shobharam/dishes/dish_starters.webp',
    badge: 'Tandoori Sizzle',
    subtitle: 'Charcoal Grilled Paneer & Chaap',
    tagline: 'Marinated in thick spiced curd & roasted',
  },
  'main course': {
    photo: '/uploads/shobharam/dishes/dish_dal_makhani.webp',
    badge: 'Slow Cooked',
    subtitle: 'Dal Makhani Bukhara & Paneer Gravies',
    tagline: 'Simmered overnight on traditional slow flame',
  },
  'breads': {
    photo: '/uploads/shobharam/dishes/dish_tandoori_naan.webp',
    badge: 'Clay Oven',
    subtitle: 'Fresh Baked Naans & Parathas',
    tagline: 'Crisp from the tandoor, brushed with desi ghee',
  },
  'rice & biryani': {
    photo: '/uploads/shobharam/dishes/dish_biryani_rice.webp',
    badge: 'Aromatic Dum',
    subtitle: 'Long Grain Basmati Specialties',
    tagline: 'Layered with fragrant saffron & caramelized onions',
  },
  'south indian': {
    photo: '/uploads/shobharam/dishes/dish_crispy_dosa.webp',
    badge: 'Crispy Gold',
    subtitle: 'Traditional Idli, Vada & Uttapam',
    tagline: 'Served with fresh coconut chutney & hot sambar',
  },
  'dosa': {
    photo: '/uploads/shobharam/dishes/dish_crispy_dosa.webp',
    badge: 'Butter Crisp',
    subtitle: 'Tawa Roasted Crispy Dosas',
    tagline: 'Thin golden crepe with spiced potato masala',
  },
  'chinese': {
    photo: '/uploads/shobharam/dishes/dish_pasta.webp',
    badge: 'Wok Tossed',
    subtitle: 'Chilli Paneer & Manchurian',
    tagline: 'Flavored with ginger, garlic & oriental spices',
  },
  'fried rice & noodles': {
    photo: '/uploads/shobharam/dishes/dish_noodles.webp',
    badge: 'Hakka Style',
    subtitle: 'Wok Fried Noodles & Fragrant Rice',
    tagline: 'Crisp julienne vegetables tossed on high flame',
  },
  'snacks & chaat': {
    photo: '/uploads/shobharam/dishes/dish_street_chaat.webp',
    badge: 'Chaat Bazaar',
    subtitle: 'Raj Kachori, Golgappe & Pav Bhaji',
    tagline: 'Explosion of sweet, sour & spicy chutneys',
  },
  'momos': {
    photo: '/uploads/shobharam/dishes/dish_sandwich.webp',
    badge: 'Steamed & Fried',
    subtitle: 'Juicy Vegetable & Tandoori Momos',
    tagline: 'Served with fiery red chilli garlic dip',
  },
  'accompaniments': {
    photo: '/uploads/shobharam/dishes/dish_accompaniments.webp',
    badge: 'Royal Sides',
    subtitle: 'Cool Raitas, Crispy Papad & Fresh Salads',
    tagline: 'The perfect cooling accompaniment to your meal',
  },
  'sweets & desserts': {
    photo: '/uploads/shobharam/dish_sweets_luxury.webp',
    badge: '100% Desi Ghee',
    subtitle: 'Heritage Mawa Sweets & Kulfi',
    tagline: 'Crafted with pure desi ghee, saffron & pistachios',
  },
  'add-ons & extras': {
    photo: '/uploads/shobharam/dishes/dish_coffee.webp',
    badge: 'Coolers & Shakes',
    subtitle: 'Fresh Lassi, Thick Shakes & Beverages',
    tagline: 'Chilled refreshing drinks to complete your feast',
  },
};

function getCategoryMeta(catName: string, index: number): CategoryMeta {
  const normalized = (catName || '').toLowerCase().trim();
  for (const [key, meta] of Object.entries(CATEGORY_META_REGISTRY)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return meta;
    }
  }
  const fallbackPhotos = [
    '/uploads/shobharam/dishes/dish_starters.webp',
    '/uploads/shobharam/dishes/dish_paneer_masala.webp',
    '/uploads/shobharam/dishes/dish_dal_makhani.webp',
    '/uploads/shobharam/dishes/dish_crispy_dosa.webp',
    '/uploads/shobharam/dishes/dish_street_chaat.webp',
    '/uploads/shobharam/dish_sweets_luxury.webp',
  ];
  return {
    photo: fallbackPhotos[index % fallbackPhotos.length],
    badge: 'House Specialty',
    subtitle: 'Authentic Indian Cuisine',
    tagline: 'Prepared fresh to order in pure desi ghee',
  };
}

export const ShobharamBookletSpread: React.FC<LayoutProps> = ({
  restaurant,
  categories = [],
  rawCategories = [],
  compact = false,
  onAddToCart,
}) => {
  type TabKey = 'cover' | 'page1' | 'page2' | 'page3' | 'page4' | 'page5' | 'page6' | 'all';
  const [activeTab, setActiveTab] = useState<TabKey>('cover');

  const displayCategories = categories.length > 0 ? categories : rawCategories;

  const bookletPages = useMemo(() => {
    const findCats = (regex: RegExp) =>
      displayCategories.filter((c) => regex.test(c.name));

    const p1Cats = findCats(/breakfast|starter|snack|chaat/i);
    const p2Cats = findCats(/special|main course|bread|rice|biryani/i);
    const p3Cats = findCats(/thali|combo|meal|accompaniment/i);
    const p4Cats = findCats(/dosa|south indian/i);
    const p5Cats = findCats(/soup|chinese|fried rice|noodle|momo/i);
    const p6Cats = findCats(/sweet|dessert|add-on|extra|beverage|drink|shake/i);

    const mappedIds = new Set([
      ...p1Cats, ...p2Cats, ...p3Cats, ...p4Cats, ...p5Cats, ...p6Cats
    ].map((c) => c.id));
    const unmapped = displayCategories.filter((c) => !mappedIds.has(c.id));

    return [
      {
        id: 'page1' as TabKey,
        pageNumber: 1,
        title: 'Morning Bites & Royal Starters',
        subtitle: 'Crispy Kachoris, Tandoori Tikka & Street Chaat',
        categories: p1Cats.length > 0 ? p1Cats : displayCategories.slice(0, 3),
      },
      {
        id: 'page2' as TabKey,
        pageNumber: 2,
        title: 'Royal Kitchen & Tandoor Breads',
        subtitle: 'Dal Makhani Bukhara, Shahi Gravies & Clay Oven Naans',
        categories: p2Cats.length > 0 ? p2Cats : displayCategories.slice(3, 7),
      },
      {
        id: 'page3' as TabKey,
        pageNumber: 3,
        title: 'Desi Ghee Thalis & Meals',
        subtitle: 'Opulent Rajasthani Feasts & Balanced Executive Combos',
        categories: p3Cats.length > 0 ? p3Cats : displayCategories.slice(7, 10),
      },
      {
        id: 'page4' as TabKey,
        pageNumber: 4,
        title: 'South Indian Golden Dosas',
        subtitle: 'Crispy Butter Masala Dosas, Fluffy Idlis & Medu Vadas',
        categories: p4Cats.length > 0 ? p4Cats : displayCategories.slice(10, 12),
      },
      {
        id: 'page5' as TabKey,
        pageNumber: 5,
        title: 'Indo-Chinese & Wok Delights',
        subtitle: 'Steaming Soups, Hakka Chowmein & Tandoori Momos',
        categories: p5Cats.length > 0 ? p5Cats : displayCategories.slice(12, 16),
      },
      {
        id: 'page6' as TabKey,
        pageNumber: 6,
        title: 'Heritage Sweets & Beverages',
        subtitle: '100% Desi Ghee Mawa Sweets, Kulfi & Thick Shakes',
        categories: [...(p6Cats.length > 0 ? p6Cats : displayCategories.slice(16)), ...unmapped],
      },
    ];
  }, [displayCategories]);

  const totalItemCount = useMemo(() => {
    return displayCategories.reduce((acc, cat) => acc + (cat.items?.length || 0), 0);
  }, [displayCategories]);

  const phone = restaurant.phone || '+91 98765 43210';
  const address = [restaurant.address, restaurant.city].filter(Boolean).join(', ') || 'Main Market Road, City Center, Jaipur';
  const website =
    (restaurant as any).website && !(restaurant as any).website.toLowerCase().includes('menusqr')
      ? (restaurant as any).website
      : undefined;

  // Render a Single Category Section with Alternating Circular Food Plate
  const renderCategorySection = (cat: CategoryGroup, index: number) => {
    if (!cat || !cat.items || cat.items.length === 0) return null;
    const meta = getCategoryMeta(cat.name, index);
    const isPhotoOnLeft = index % 2 === 1;

    return (
      <div
        key={cat.id}
        className="relative rounded-2xl bg-gradient-to-b from-[#131916]/95 via-[#0D1210]/95 to-[#080B0A]/95 border border-[#D4AF37]/35 p-4 sm:p-6 backdrop-blur-md shadow-2xl overflow-hidden my-4"
      >
        {/* Subtle Decorative Golden Border Accent */}
        <div className="absolute inset-1.5 rounded-xl border border-dashed border-[#D4AF37]/15 pointer-events-none" />

        {/* Category Header Plaque */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D4AF37]/30 pb-3 mb-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1E5E3A]/40 border border-[#1E5E3A] text-[9px] font-black uppercase tracking-widest text-emerald-300 mb-1">
              <Sparkles size={10} className="text-amber-300" />
              <span>{meta.badge}</span>
            </div>
            <h3
              className="text-xl sm:text-2xl font-black uppercase tracking-wide text-white"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {cat.name}
            </h3>
            <p className="text-xs text-[#F5C542] italic font-serif mt-0.5">
              {meta.subtitle} • {cat.items.length} dishes
            </p>
          </div>

          <div className="hidden sm:block text-right">
            <span className="text-[10px] text-gray-400 font-mono tracking-wider uppercase block">
              100% Pure Veg
            </span>
            <span className="text-[11px] text-amber-200/80 italic font-serif">
              {meta.tagline}
            </span>
          </div>
        </div>

        {/* Section Body: Side-by-Side Flex Layout (Item List + Circular Dish Plate) */}
        <div
          className={clsx(
            'relative z-10 flex flex-col gap-6 items-center',
            isPhotoOnLeft ? 'md:flex-row-reverse' : 'md:flex-row'
          )}
        >
          {/* Menu Items List with Clean Dot Leaders & Numbering */}
          <div className="flex-1 w-full space-y-1">
            {cat.items.map((item, idx) => {
              const numStr = String(idx + 1).padStart(2, '0');
              const singlePrice = item.price;
              const hasHalfFull = item.halfPrice || item.fullPrice;

              return (
                <div
                  key={item.id}
                  className="flex items-baseline justify-between w-full group py-1.5 px-2 rounded-lg hover:bg-white/[0.04] transition-colors border-b border-white/[0.04] last:border-b-0"
                >
                  {/* Left: Number, Veg Indicator & Name */}
                  <div className="flex items-baseline gap-1.5 shrink-0 max-w-[62%] sm:max-w-[70%]">
                    <span className="font-mono text-xs font-black text-[#F5C542] shrink-0">
                      {numStr}.
                    </span>

                    {/* Veg Square Dot */}
                    <span
                      className="w-3.5 h-3.5 rounded-xs border border-emerald-500 inline-flex items-center justify-center shrink-0 self-center"
                      title="Pure Vegetarian"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-gray-100 group-hover:text-[#F5C542] transition-colors">
                          {item.name}
                        </span>
                        {item.isBestseller && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 text-[8px] font-bold">
                            <Star size={8} className="fill-amber-400 text-amber-400" />
                            <span>Popular</span>
                          </span>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-[10px] text-gray-400 italic font-sans truncate max-w-sm mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Center: Dot Leader Line Connecting Dish to Price */}
                  <div className="flex-1 border-b border-dotted border-[#D4AF37]/35 mx-2 min-w-[12px] mb-1" />

                  {/* Right: Currency Price (e.g., 280/- or H: 130/- F: 250/-) & Order Button */}
                  <div className="shrink-0 flex items-center gap-2">
                    <div className="text-right font-mono font-bold text-xs sm:text-sm text-[#F5C542]">
                      {hasHalfFull ? (
                        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs">
                          {item.halfPrice && (
                            <span className="text-gray-300">H: ₹{item.halfPrice}/-</span>
                          )}
                          {item.fullPrice && (
                            <span className="text-[#F5C542]">F: ₹{item.fullPrice}/-</span>
                          )}
                        </div>
                      ) : (
                        <span>₹{singlePrice}/-</span>
                      )}
                    </div>

                    {onAddToCart && (
                      <button
                        type="button"
                        onClick={() =>
                          onAddToCart(
                            item,
                            hasHalfFull ? `₹${item.fullPrice || item.halfPrice}` : `₹${singlePrice}`
                          )
                        }
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-[#D4AF37]/20 hover:bg-[#D4AF37] text-amber-300 hover:text-black border border-[#D4AF37]/50 flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                        title="Add to cart"
                      >
                        <Plus size={11} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Circular Food Photo Card (Matching Reference Layout) */}
          <div className="shrink-0 flex flex-col items-center justify-center p-2 order-first md:order-none">
            <div className="relative group w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
              {/* Outer Golden Halo Ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/25 via-emerald-500/20 to-amber-300/30 blur-md group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-1 rounded-full border-2 border-dashed border-[#D4AF37]/45 pointer-events-none" />
              <div className="absolute inset-2.5 rounded-full border border-[#F5C542]/30 pointer-events-none" />

              {/* High-Resolution Circular Dish Photo */}
              <div className="relative z-10 w-26 h-26 sm:w-34 sm:h-34 rounded-full overflow-hidden border-2 border-[#D4AF37] shadow-[0_12px_28px_rgba(0,0,0,0.95)]">
                <img
                  src={meta.photo}
                  alt={cat.name}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              {/* Floating Badge on Circular Rim */}
              <span className="absolute -bottom-1.5 z-20 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-700 to-emerald-600 text-[9px] font-bold text-white border border-emerald-400 shadow-md whitespace-nowrap">
                {meta.badge}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 italic text-center mt-2 max-w-[150px]">
              {meta.tagline}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Helper to Render a Discrete Booklet Page Spread (Matching Reference Mockup)
  const renderBookletPage = (page: (typeof bookletPages)[0]) => {
    const prevTab = page.pageNumber === 1 ? 'cover' : (`page${page.pageNumber - 1}` as TabKey);
    const nextTab = page.pageNumber === 6 ? 'all' : (`page${page.pageNumber + 1}` as TabKey);

    return (
      <div
        key={page.id}
        className="relative w-full max-w-5xl mx-auto rounded-3xl border border-[#D4AF37]/45 shadow-[0_25px_60px_rgba(0,0,0,0.95)] bg-[#0C100E] text-[#F3F4F6] p-4 sm:p-8 my-6 overflow-hidden"
      >
        {/* Authentic Background Texture & Doodles */}
        <AuthenticNoirChalkboardBg opacity={0.12} />
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Ambient Warm Golden & Emerald Glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(circle at 15% 15%, rgba(212, 175, 55, 0.15) 0%, transparent 40%),
              radial-gradient(circle at 85% 85%, rgba(30, 94, 58, 0.18) 0%, transparent 45%)
            `,
          }}
        />

        {/* Corner Golden Ornaments */}
        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#F5C542] pointer-events-none" />
        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#F5C542] pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#F5C542] pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#F5C542] pointer-events-none" />

        {/* Spread Top Header Ribbon */}
        <div className="relative z-10 flex flex-col items-center text-center pb-5 border-b border-[#D4AF37]/35 mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1E5E3A]/50 border border-[#1E5E3A] text-[10px] font-bold tracking-widest uppercase text-emerald-300 mb-2 shadow-md">
            <ShieldCheck size={12} className="text-emerald-400" />
            <span>SHOBHARAM&apos;S MENU BOOKLET • CHAPTER 0{page.pageNumber}</span>
          </div>

          <h2
            className="text-2xl sm:text-4xl font-black uppercase text-white tracking-wide"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {page.title}
          </h2>

          <p
            className="text-xs sm:text-sm text-[#F5C542] italic mt-1 font-serif"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {page.subtitle}
          </p>
        </div>

        {/* Page Interior Categories */}
        <div className="space-y-6">
          {page.categories.map((cat, idx) => renderCategorySection(cat, idx))}
        </div>

        {/* Page Footer Navigation Ribbon */}
        <div className="relative z-10 pt-6 mt-8 border-t border-[#D4AF37]/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <button
            type="button"
            onClick={() => setActiveTab(prevTab)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
          >
            <ChevronLeft size={14} />
            <span>{page.pageNumber === 1 ? 'Back to Cover' : `Chapter 0${page.pageNumber - 1}`}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F5C542]" />
            <span className="font-bold text-gray-200">Shobharam&apos;s Pure Veg</span>
            <span className="font-mono text-[#F5C542] font-bold px-2.5 py-0.5 rounded-md bg-black/60 border border-[#D4AF37]/40 shadow-inner">
              PAGE 0{page.pageNumber + 1} OF 07
            </span>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab(nextTab)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F5C542] to-[#D4AF37] hover:brightness-110 text-black border border-[#D4AF37]/60 transition-colors font-extrabold cursor-pointer shadow-md"
          >
            <span>{page.pageNumber === 6 ? 'View All Spreads' : `Chapter 0${page.pageNumber + 1}`}</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full select-text font-serif text-[#F3F4F6] relative max-w-5xl mx-auto my-2">
      {/* ── Sticky Chapter / Page Navigation Bar ────────────────────────── */}
      <div className="pt-2 pb-2 flex items-center justify-center sticky top-2 z-40 px-2">
        <div className="flex items-center gap-1 p-1.5 bg-[#0B0E0D]/95 backdrop-blur-md rounded-full border border-[#D4AF37]/60 shadow-2xl overflow-x-auto max-w-full scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('cover')}
            className={clsx(
              'px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5',
              activeTab === 'cover'
                ? 'bg-gradient-to-r from-[#D4AF37] via-[#F5C542] to-[#D4AF37] text-black shadow-md font-extrabold'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            )}
          >
            <BookOpen size={13} />
            <span>Cover</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('page1')}
            className={clsx(
              'px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap',
              activeTab === 'page1'
                ? 'bg-gradient-to-r from-[#D4AF37] via-[#F5C542] to-[#D4AF37] text-black shadow-md font-extrabold'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            )}
          >
            1. Starters & Chaat
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('page2')}
            className={clsx(
              'px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap',
              activeTab === 'page2'
                ? 'bg-gradient-to-r from-[#D4AF37] via-[#F5C542] to-[#D4AF37] text-black shadow-md font-extrabold'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            )}
          >
            2. Curries & Breads
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('page3')}
            className={clsx(
              'px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap',
              activeTab === 'page3'
                ? 'bg-gradient-to-r from-[#D4AF37] via-[#F5C542] to-[#D4AF37] text-black shadow-md font-extrabold'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            )}
          >
            3. Royal Thalis
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('page4')}
            className={clsx(
              'px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap',
              activeTab === 'page4'
                ? 'bg-gradient-to-r from-[#D4AF37] via-[#F5C542] to-[#D4AF37] text-black shadow-md font-extrabold'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            )}
          >
            4. South Indian
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('page5')}
            className={clsx(
              'px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap',
              activeTab === 'page5'
                ? 'bg-gradient-to-r from-[#D4AF37] via-[#F5C542] to-[#D4AF37] text-black shadow-md font-extrabold'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            )}
          >
            5. Indo-Chinese
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('page6')}
            className={clsx(
              'px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap',
              activeTab === 'page6'
                ? 'bg-gradient-to-r from-[#D4AF37] via-[#F5C542] to-[#D4AF37] text-black shadow-md font-extrabold'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            )}
          >
            6. Sweets & Shakes
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={clsx(
              'px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5',
              activeTab === 'all'
                ? 'bg-gradient-to-r from-[#D4AF37] via-[#F5C542] to-[#D4AF37] text-black shadow-md font-extrabold'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            )}
          >
            <Layers size={13} />
            <span>Full Menu ({totalItemCount})</span>
          </button>
        </div>
      </div>

      {/* ── Active View Rendering ────────────────────────────────────── */}
      {activeTab === 'cover' && (
        <section aria-label="Cover Spread" className="animate-in fade-in duration-300">
          <ShobharamBespokeCover
            restaurant={restaurant}
            categories={displayCategories}
            onExploreMenu={() => setActiveTab('page1')}
            compact={compact}
          />
        </section>
      )}

      {activeTab === 'page1' && (
        <section aria-label="Chapter 1" className="animate-in fade-in duration-300">
          {renderBookletPage(bookletPages[0])}
        </section>
      )}

      {activeTab === 'page2' && (
        <section aria-label="Chapter 2" className="animate-in fade-in duration-300">
          {renderBookletPage(bookletPages[1])}
        </section>
      )}

      {activeTab === 'page3' && (
        <section aria-label="Chapter 3" className="animate-in fade-in duration-300">
          {renderBookletPage(bookletPages[2])}
        </section>
      )}

      {activeTab === 'page4' && (
        <section aria-label="Chapter 4" className="animate-in fade-in duration-300">
          {renderBookletPage(bookletPages[3])}
        </section>
      )}

      {activeTab === 'page5' && (
        <section aria-label="Chapter 5" className="animate-in fade-in duration-300">
          {renderBookletPage(bookletPages[4])}
        </section>
      )}

      {activeTab === 'page6' && (
        <section aria-label="Chapter 6" className="animate-in fade-in duration-300">
          {renderBookletPage(bookletPages[5])}
        </section>
      )}

      {activeTab === 'all' && (
        <section aria-label="Complete Menu Booklet" className="space-y-6 animate-in fade-in duration-300">
          <div className="w-full flex justify-center py-2">
            <ShobharamBespokeCover
              restaurant={restaurant}
              categories={displayCategories}
              compact={compact}
            />
          </div>
          {bookletPages.map((page) => renderBookletPage(page))}
        </section>
      )}

      {/* Booklet Universal Delivery & Contact Footer Plaque */}
      {activeTab !== 'cover' && (
        <footer className="relative z-10 mt-6 mx-auto max-w-5xl p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-[#141A17] to-[#0A0D0B] border border-[#D4AF37]/40 shadow-inner">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#F5C542] flex items-center gap-1">
                <HeartHandshake size={12} />
                <span>{totalItemCount} Pure Veg Dishes • Free Home Delivery</span>
              </span>
              <a
                href={`tel:${phone}`}
                className="text-xs sm:text-sm font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 mt-0.5 transition-colors"
              >
                <Phone size={13} className="text-[#F5C542]" />
                <span>{phone}</span>
              </a>
            </div>

            <div className="flex flex-col items-center sm:items-end text-xs text-gray-400 space-y-1">
              <div className="flex items-center gap-1.5">
                <MapPin size={12} className="text-emerald-400 shrink-0" />
                <span className="text-gray-300 text-[11px] sm:text-xs text-center sm:text-right max-w-xs truncate">
                  {address}
                </span>
              </div>
              {website ? (
                <a
                  href={website.startsWith('http') ? website : `https://${website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[11px] text-amber-200/80 hover:text-amber-100 transition-colors"
                >
                  <Globe size={11} className="text-[#F5C542]" />
                  <span>{website}</span>
                </a>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-300/80">
                  <ShieldCheck size={11} className="text-emerald-400" />
                  <span>100% Pure Vegetarian</span>
                </div>
              )}
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default ShobharamBookletSpread;
