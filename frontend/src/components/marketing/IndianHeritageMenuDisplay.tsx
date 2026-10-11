import { useState } from 'react';
import { Check, Plus } from 'lucide-react';

export interface IndianHeritageMenuDisplayProps {
  restaurantName?: string;
  tagline?: string;
  tableInfo?: string;
  badgeText?: string;
  highlightItemPrice?: number;
  isUpdated?: boolean;
  className?: string;
}

export function VegEmblem({ size = 12 }: { size?: number }) {
  return (
    <div
      className="border border-[#27C93F] flex items-center justify-center rounded-[2px] bg-white/10 shrink-0"
      style={{ width: size, height: size, padding: size > 12 ? 2 : 1 }}
      title="Vegetarian"
    >
      <div
        className="rounded-full bg-[#27C93F]"
        style={{ width: Math.max(size - 6, 4), height: Math.max(size - 6, 4) }}
      />
    </div>
  );
}

export function NonVegEmblem({ size = 12 }: { size?: number }) {
  return (
    <div
      className="border border-[#E0443E] flex items-center justify-center rounded-[2px] bg-white/10 shrink-0"
      style={{ width: size, height: size, padding: size > 12 ? 2 : 1 }}
      title="Non-Vegetarian"
    >
      <div
        className="rounded-full bg-[#E0443E]"
        style={{ width: Math.max(size - 6, 4), height: Math.max(size - 6, 4) }}
      />
    </div>
  );
}

const CATEGORIES = ['All', 'Royal Curries', 'Tandoor & Kebab', 'Dum Biryani', 'Desserts'];

export default function IndianHeritageMenuDisplay({
  restaurantName = 'Spice Lounge & Haveli',
  tagline = 'Royal Awadhi & Mughlai Cuisine',
  tableInfo = 'Table #04 • Royal Courtyard',
  badgeText = '24K Royal Luxe',
  highlightItemPrice = 320,
  isUpdated = false,
  className = '',
}: IndianHeritageMenuDisplayProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({ 'item-1': true, 'item-2': true });

  const toggleItem = (id: string) => {
    setAddedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const dishes = [
    {
      id: 'item-1',
      name: 'Old Delhi Butter Chicken',
      category: 'Royal Curries',
      isVeg: false,
      tag: 'Royal Bestseller',
      desc: 'Tandoor chicken simmered in satin tomato & cashew makhani gravy with churned butter & kasuri methi.',
      price: highlightItemPrice,
      isDynamic: true,
      icon: '🥘',
      image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'item-2',
      name: 'Dal Makhani Bukhara',
      category: 'Royal Curries',
      isVeg: true,
      tag: '36-Hr Simmered',
      desc: 'Whole black urad lentils slow-simmered over gentle charcoal embers with farm cream & white butter.',
      price: 340,
      isDynamic: false,
      icon: '🍲',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'item-3',
      name: 'Malai Paneer Tikka',
      category: 'Tandoor & Kebab',
      isVeg: true,
      tag: 'Chef Special',
      desc: 'Cardamom & clotted cream marinated cottage cheese charred with bell peppers in clay tandoor.',
      price: 360,
      isDynamic: false,
      icon: '🍢',
      image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'item-4',
      name: 'Awadhi Dum Gosht Biryani',
      category: 'Dum Biryani',
      isVeg: false,
      tag: 'Handi Sealed',
      desc: 'Aged long-grain basmati layered with tender meat, royal spices & saffron in an earthen sealed handi.',
      price: 480,
      isDynamic: false,
      icon: '🍛',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'item-5',
      name: 'Shahi Kesari Tukda',
      category: 'Desserts',
      isVeg: true,
      tag: 'Royal Sweet',
      desc: 'Crisp ghee-fried brioche soaked in cardamom saffron rabri, topped with slivered pistachios & silver vark.',
      price: 220,
      isDynamic: false,
      icon: '🍮',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&fit=crop&q=80',
    },
  ];

  const filteredDishes =
    selectedCategory === 'All'
      ? dishes
      : dishes.filter((d) => d.category === selectedCategory);

  return (
    <div
      className={`h-full w-full relative flex flex-col select-none overflow-hidden bg-[#200817] text-[#FAF3E0] font-serif ${className}`}
      style={{
        backgroundImage: 'radial-gradient(ellipse at top, #360E27 0%, #1A0512 80%)',
      }}
    >
      {/* Royal Palace Masthead */}
      <div className="py-2.5 px-3.5 border-b border-[#D4AF37]/30 bg-[#280B1E]/95 backdrop-blur-md shrink-0 z-20 shadow-md">
        {/* Ornate Top Seal */}
        <div className="flex items-center justify-center gap-1.5 text-[#D4AF37] text-[8px] tracking-[0.28em] font-sans font-bold uppercase mb-1">
          <span className="h-px w-4 bg-[#D4AF37]/50" />
          <span>❖ PALACE DINING ❖</span>
          <span className="h-px w-4 bg-[#D4AF37]/50" />
        </div>

        <div className="flex justify-between items-start mb-2">
          <div className="min-w-0 pr-1">
            <h3
              className="text-xs sm:text-[13px] font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D1] via-[#E8BE5F] to-[#C99738] truncate"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {restaurantName}
            </h3>
            <p className="text-[9.5px] mt-1 text-[#FAF3E0]/70 font-sans font-medium tracking-wide truncate">
              {tableInfo}
            </p>
          </div>

          <span className="text-[8px] font-sans font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#D4AF37] text-[#180912] shadow-sm border border-[#FFF5D1]/50 shrink-0">
            {badgeText}
          </span>
        </div>

        {/* Category Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {CATEGORIES.map((cat) => {
            const isCatActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-[9px] font-sans font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                  isCatActive
                    ? 'bg-[#D4AF37] text-[#180912] shadow-sm font-black'
                    : 'bg-[#180912]/60 text-[#FAF3E0]/80 border border-[#D4AF37]/25 hover:border-[#D4AF37]/60'
                }`}
              >
                {cat === 'All' ? '❖ All' : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Menu Items Canvas */}
      <div className="flex-1 overflow-y-auto scrollbar-none p-3 space-y-2.5 pb-20 relative">
        {/* Subtle Ornamental Tagline */}
        <div className="text-center py-0.5">
          <span className="text-[8.5px] uppercase tracking-[0.25em] font-sans font-bold text-[#D4AF37]/80 block">
            ◈ {tagline} ◈
          </span>
        </div>

        {/* Dish Cards */}
        {filteredDishes.map((dish) => {
          const isAdded = !!addedItems[dish.id];
          return (
            <div
              key={dish.id}
              className={`p-2.5 rounded-xl border transition-all duration-300 relative overflow-hidden bg-[#2C0D21]/90 ${
                dish.isDynamic && isUpdated
                  ? 'border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)] ring-1 ring-[#D4AF37]/50'
                  : 'border-[#D4AF37]/25 hover:border-[#D4AF37]/50 shadow-md'
              }`}
            >
              <div className="flex gap-2.5 items-start">
                {/* Text details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {dish.isVeg ? <VegEmblem size={11} /> : <NonVegEmblem size={11} />}
                    <span
                      className="text-[11.5px] font-bold text-[#FFF5D1] truncate leading-tight"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {dish.name}
                    </span>
                  </div>

                  {dish.tag && (
                    <span className="inline-block text-[7.5px] uppercase tracking-wider font-sans font-bold px-1.5 py-0.2 rounded bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 mb-1">
                      {dish.tag}
                    </span>
                  )}

                  <p className="text-[9px] text-[#FAF3E0]/70 font-sans line-clamp-2 leading-relaxed mb-1.5">
                    {dish.desc}
                  </p>

                  <div className="flex items-center justify-between pt-0.5">
                    <div className="flex items-center gap-1 font-sans">
                      <span className="text-xs font-black text-[#D4AF37]">
                        ₹{dish.price}
                      </span>
                      {dish.isDynamic && isUpdated && (
                        <span className="text-[8px] font-bold text-[#34B56A] uppercase tracking-wider bg-[#34B56A]/10 px-1 py-0.2 rounded border border-[#34B56A]/30">
                          Synced
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleItem(dish.id)}
                      className={`text-[8.5px] font-sans font-bold px-2 py-0.8 rounded-full border transition-all cursor-pointer flex items-center gap-1 ${
                        isAdded
                          ? 'bg-[#D4AF37] text-[#180912] border-[#D4AF37] shadow-sm'
                          : 'bg-transparent text-[#D4AF37] border-[#D4AF37]/50 hover:bg-[#D4AF37]/15'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check size={9} strokeWidth={3} />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus size={9} strokeWidth={3} />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Dish Photo Thumbnail with culinary fallback */}
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 relative border border-[#D4AF37]/35 shadow-sm bg-[#1A0512] flex items-center justify-center">
                  <span className="text-2xl select-none opacity-85" aria-hidden="true">
                    {dish.icon}
                  </span>
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.style.opacity = '0';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Live Table Action Bar */}
      <div className="absolute bottom-5 sm:bottom-6 inset-x-2.5 z-30">
        <div className="bg-[#180912]/95 backdrop-blur-md border border-[#D4AF37]/40 rounded-xl p-2 px-3 flex items-center justify-between shadow-[0_10px_25px_rgba(0,0,0,0.8)]">
          <div>
            <div className="flex items-center gap-1.5 text-[8px] font-sans uppercase font-bold text-[#D4AF37] tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34B56A] animate-pulse" />
              <span>Table Verified</span>
            </div>
            <p className="text-[10px] font-sans font-extrabold text-[#FFF5D1]">
              2 Dishes Selected
            </p>
          </div>

          <button
            type="button"
            className="bg-gradient-to-r from-[#D4AF37] to-[#B38D22] text-[#180912] text-[9.5px] font-sans font-black uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-md border border-[#FFF5D1]/30 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            Order to Table
          </button>
        </div>
      </div>
    </div>
  );
}
