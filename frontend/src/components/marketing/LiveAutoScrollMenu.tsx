import { useState } from 'react';
import { Search, Flame, Star, Sparkles, Check, ChevronRight } from 'lucide-react';

const MENU_ITEMS = [
  {
    id: 'd1',
    name: 'Wagyu Beef Tenderloin',
    category: 'Special Dishes',
    price: '₹1,450',
    rating: '4.9',
    desc: 'Truffle glaze, roasted garlic shallots & microgreens',
    image: '🥩',
    isVeg: false,
    tag: 'Chef Special',
  },
  {
    id: 'd2',
    name: 'Paneer Butter Masala',
    category: 'Special Dishes',
    price: '₹380',
    rating: '4.8',
    desc: 'Rich cashew gravy with fresh cottage cheese cubes',
    image: '🍲',
    isVeg: true,
    tag: 'Bestseller',
  },
  {
    id: 'd3',
    name: 'Smoked Woodfire Pizza',
    category: 'Special Dishes',
    price: '₹520',
    rating: '4.9',
    desc: 'Artisanal sourdough crust, mozzarella & fresh basil',
    image: '🍕',
    isVeg: false,
    tag: 'Popular',
  },
  {
    id: 'd4',
    name: 'Truffle Mushroom Risotto',
    category: 'Special Dishes',
    price: '₹480',
    rating: '4.7',
    desc: 'Arborio rice, wild mushrooms & aged parmesan',
    image: '🍄',
    isVeg: true,
    tag: 'Must Try',
  },
  {
    id: 'k1',
    name: 'Smoked Bourbon Sour',
    category: 'Special Drinks',
    price: '₹650',
    rating: '4.9',
    desc: 'Craft bourbon, aromatic bitters & charred orange peel',
    image: '🍸',
    isVeg: true,
    tag: 'Signature',
  },
  {
    id: 'k2',
    name: 'Single Origin Cold Brew',
    category: 'Special Drinks',
    price: '₹220',
    rating: '4.8',
    desc: 'Slow-steeped Arabica with notes of dark cocoa',
    image: '☕',
    isVeg: true,
    tag: 'Refreshing',
  },
  {
    id: 'k3',
    name: 'Mango Passionfruit Fizz',
    category: 'Special Drinks',
    price: '₹280',
    rating: '4.9',
    desc: 'Fresh Alphonso pulp, mint & sparkling soda',
    image: '🍹',
    isVeg: true,
    tag: 'Mocktail',
  },
  {
    id: 't1',
    name: 'Belgian Chocolate Lava',
    category: 'Special Desserts',
    price: '₹340',
    rating: '4.9',
    desc: 'Warm molten dark chocolate center with vanilla bean ice cream',
    image: '🍫',
    isVeg: true,
    tag: 'Decadent',
  },
  {
    id: 't2',
    name: 'Raspberry Macaron Tower',
    category: 'Special Desserts',
    price: '₹320',
    rating: '4.8',
    desc: 'French almond shells, white chocolate ganache & berries',
    image: '🧁',
    isVeg: true,
    tag: 'Chef Special',
  },
  {
    id: 't3',
    name: 'Sizzling Walnut Brownie',
    category: 'Special Desserts',
    price: '₹290',
    rating: '4.9',
    desc: 'Served on hot skillet with hot fudge sauce',
    image: '🍨',
    isVeg: true,
    tag: 'Favorite',
  },
];

export default function LiveAutoScrollMenu() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setAddedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = MENU_ITEMS.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Duplicate items for seamless infinite scroll
  const scrollItems = [...filtered, ...filtered];

  return (
    <div className="w-full h-full flex flex-col bg-[#121815] text-white select-none">
      {/* Top Header Bar */}
      <div className="p-3.5 bg-[#17211d] border-b border-white/10 flex items-center justify-between shadow-md">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-white">Royal Spices Bistro</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-[9px] text-[#626776] font-mono">Table #04 • Digital Menu</p>
        </div>
        <div className="flex items-center gap-1 bg-[#34B56A]/10 text-[#34B56A] border border-emerald-500/20 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase">
          <Sparkles size={10} /> Live Sync
        </div>
      </div>

      {/* Special Offer Banner */}
      <div className="bg-gradient-to-r from-[#e8783c] via-[#f29a66] to-[#ffc928] text-[#121815] px-3.5 py-2 flex items-center justify-between font-extrabold text-[10px] shadow-sm">
        <div className="flex items-center gap-1.5">
          <Flame size={13} className="text-[#121815] animate-bounce" />
          <span>Chef's Special: 15% OFF Tandoori Delights</span>
        </div>
        <ChevronRight size={12} />
      </div>

      {/* Search Input & Category Pills */}
      <div className="p-3 bg-[#17211d]/90 border-b border-white/10 space-y-2">
        <div className="relative">
          <Search size={12} className="absolute left-3 top-2.5 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dishes, drinks, desserts..."
            className="w-full bg-[#121815] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/40 border border-white/10 focus:outline-none focus:border-[#e8783c]"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['All', 'Special Dishes', 'Special Drinks', 'Special Desserts'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[10px] font-extrabold px-3 py-1 rounded-full border transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#E8783C] text-white border-[#e8783c]'
                  : 'bg-[#121815] text-[#626776] border-white/10 hover:border-white/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Continuous Auto-Scrolling Menu List */}
      <div className="flex-1 overflow-hidden relative">
        <div className="p-3 space-y-2.5 animate-[mqr-menu-scroll_26s_linear_infinite] hover:[animation-play-state:paused]">
          {scrollItems.map((item, idx) => {
            const isAdded = addedItems[item.id];
            return (
              <div
                key={`${item.id}-${idx}`}
                className="p-3 rounded-2xl bg-[#17211d] border border-white/10 hover:border-[#e8783c]/50 transition-all flex items-center justify-between shadow-sm group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#212d28] border border-white/10 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                    {item.image}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{item.name}</span>
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          item.isVeg ? 'bg-emerald-400' : 'bg-rose-400'
                        }`}
                      />
                    </div>
                    <p className="text-[9px] text-[#626776] line-clamp-1 max-w-[150px]">{item.desc}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-[#FFC928] font-bold flex items-center gap-0.5">
                        <Star size={9} fill="#ffc928" /> {item.rating}
                      </span>
                      <span className="text-[8px] text-[#E8783C] bg-[#E8783C]/10 px-1.5 py-0.2 rounded border border-[#e8783c]/20 font-bold uppercase">
                        {item.tag}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-xs font-black text-white">{item.price}</span>
                  <button
                    onClick={() => toggleItem(item.id)}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all flex items-center gap-1 border ${
                      isAdded
                        ? 'bg-[#34B56A]/20 text-[#34B56A] border-emerald-500/40'
                        : 'bg-[#E8783C] text-white border-[#e8783c] hover:bg-[#FFC928] hover:text-[#121815]'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check size={10} /> Added
                      </>
                    ) : (
                      '+ Add'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


