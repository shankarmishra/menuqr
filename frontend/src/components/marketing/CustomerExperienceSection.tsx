import { useState } from 'react';
import { Smartphone, Zap, Filter, HeartHandshake, Search } from 'lucide-react';
import IPhoneMockup from './IPhoneMockup';

export default function CustomerExperienceSection() {
  const [vegOnly, setVegOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const sampleItems = [
    { name: 'Paneer Tikka Roll', price: '₹240', isVeg: true, category: 'Starters', cal: '320 kcal' },
    { name: 'Chicken Malai Tikka', price: '₹340', isVeg: false, category: 'Starters', cal: '410 kcal' },
    { name: 'Wild Mushroom Soup', price: '₹220', isVeg: true, category: 'Soups', cal: '180 kcal' },
    { name: 'Classic Cold Coffee', price: '₹180', isVeg: true, category: 'Beverages', cal: '210 kcal' },
  ];

  const filtered = sampleItems.filter((item) => {
    if (vegOnly && !item.isVeg) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <section className="py-24 md:py-36 px-6 bg-[#1d2723] relative overflow-hidden border-b border-white/5">
      <div className="max-w-[1240px] mx-auto grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151c19] text-[#e8783c] text-xs font-semibold uppercase tracking-wider border border-[#e8783c]/30">
            <Smartphone size={14} />
            <span>Customer-Centric UX</span>
          </div>

          <h2 className="text-[2.25rem] sm:text-[3.25rem] font-extrabold text-white leading-tight tracking-tight">
            Designed for <br />
            <span className="text-[#e8783c]">Diners at the Table</span>
          </h2>

          <p className="text-base sm:text-lg text-[#aab7b2] leading-relaxed">
            No app downloads. No slow PDF loading. Just tap or scan to open an ultra-fast, mobile-first menu that makes ordering effortless.
          </p>

          <div className="space-y-6 pt-2">
            <div className="flex gap-4 items-start">
              <div className="p-3 rounded-xl bg-[#151c19] text-[#ffc928] border border-white/10 shrink-0">
                <Zap size={20} />
              </div>
              <div>
                <h4 className="text-base font-bold text-white mb-1">0.2s Instant Load</h4>
                <p className="text-xs sm:text-sm text-[#aab7b2]">
                  High-performance web architecture loads instantly even on weak 3G cellular signals.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 rounded-xl bg-[#151c19] text-[#34b56a] border border-white/10 shrink-0">
                <Filter size={20} />
              </div>
              <div>
                <h4 className="text-base font-bold text-white mb-1">Veg / Non-Veg Toggles</h4>
                <p className="text-xs sm:text-sm text-[#aab7b2]">
                  Instant dietary filtering allows diners to filter vegetarian dishes with one tap.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 rounded-xl bg-[#151c19] text-[#e8783c] border border-white/10 shrink-0">
                <HeartHandshake size={20} />
              </div>
              <div>
                <h4 className="text-base font-bold text-white mb-1">Zero Friction</h4>
                <p className="text-xs sm:text-sm text-[#aab7b2]">
                  No registration, no password, no app install required for customers.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 flex justify-center">
          <IPhoneMockup badgeText="Diner View">
            <div className="p-4 space-y-3.5">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <div>
                  <h4 className="text-xs font-bold text-white">Olive & Thyme Bistro</h4>
                  <p className="text-[9px] text-[#aab7b2]">Digital Menu • Table #08</p>
                </div>
                <span className="text-[10px] text-[#ffc928] bg-[#ffc928]/10 px-2 py-0.5 rounded-full font-bold">
                  Open
                </span>
              </div>

              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-2 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter dishes..."
                  className="w-full bg-[#151c19] rounded-lg pl-7 pr-3 py-1.5 text-xs text-white placeholder-white/40 border border-white/10 focus:outline-none focus:border-[#e8783c]"
                />
              </div>

              <div className="flex items-center justify-between bg-[#151c19] p-2 rounded-xl border border-white/10">
                <span className="text-[10px] font-semibold text-white">Veg Only Filter</span>
                <button
                  onClick={() => setVegOnly(!vegOnly)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${
                    vegOnly ? 'bg-[#34b56a]' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                      vegOnly ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-2">
                {filtered.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-[#151c19] border border-white/10 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{item.name}</span>
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            item.isVeg ? 'bg-[#34b56a]' : 'bg-[#ff5e4d]'
                          }`}
                        />
                      </div>
                      <span className="text-[9px] text-[#aab7b2]">{item.cal}</span>
                    </div>
                    <span className="text-xs font-bold text-[#e8783c]">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </IPhoneMockup>
        </div>
      </div>
    </section>
  );
}