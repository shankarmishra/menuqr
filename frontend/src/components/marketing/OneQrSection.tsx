import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, QrCode, ShieldCheck, Check } from 'lucide-react';
import IPhoneMockup from './IPhoneMockup';

export default function OneQrSection() {
  const [price, setPrice] = useState(280);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('Just now');

  const handleUpdatePrice = (newPrice: number) => {
    if (price === newPrice || isUpdating) return;
    setIsUpdating(true);
    setTimeout(() => {
      setPrice(newPrice);
      setLastUpdated('Updated 1s ago');
      setIsUpdating(false);
    }, 400);
  };

  return (
    <section className="py-24 md:py-36 px-6 bg-[#151c19] relative border-y border-white/5 overflow-hidden">
      <div className="max-w-[1240px] mx-auto grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1d2723] text-[#ffc928] text-xs font-semibold uppercase tracking-wider border border-[#ffc928]/20">
            <RefreshCw size={14} className={isUpdating ? 'animate-spin' : ''} />
            <span>Real-time Dynamic Sync</span>
          </div>

          <h2 className="text-[2.25rem] sm:text-[3rem] font-extrabold text-white leading-tight tracking-tight">
            One QR. <br />
            <span className="text-[#e8783c]">Countless Live Updates.</span>
          </h2>

          <p className="text-base sm:text-lg text-[#aab7b2] leading-relaxed">
            Change prices, mark sold-out specials, or modify categories in your dashboard. The changes sync instantly to every customer's phone—without reprinting table stickers.
          </p>

          <div className="bg-[#1d2723] p-6 rounded-2xl border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-xs text-[#aab7b2] uppercase tracking-wider font-mono">
                  Dish Editor • Paneer Butter Masala
                </span>
                <p className="text-sm font-bold text-white mt-0.5">Live Menu Item #104</p>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                Published
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs text-[#aab7b2] block mb-1">Current Price</label>
                <div className="text-2xl font-bold text-white">₹{price}</div>
              </div>
              <div>
                <label className="text-xs text-[#aab7b2] block mb-1">Quick Adjust</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdatePrice(280)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      price === 280
                        ? 'bg-[#e8783c] text-white border-[#e8783c]'
                        : 'bg-[#151c19] text-[#aab7b2] border-white/10 hover:border-white/30'
                    }`}
                  >
                    ₹280
                  </button>
                  <button
                    onClick={() => handleUpdatePrice(320)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      price === 320
                        ? 'bg-[#e8783c] text-white border-[#e8783c]'
                        : 'bg-[#151c19] text-[#aab7b2] border-white/10 hover:border-white/30'
                    }`}
                  >
                    ₹320
                  </button>
                  <button
                    onClick={() => handleUpdatePrice(360)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      price === 360
                        ? 'bg-[#e8783c] text-white border-[#e8783c]'
                        : 'bg-[#151c19] text-[#aab7b2] border-white/10 hover:border-white/30'
                    }`}
                  >
                    ₹360
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#aab7b2]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#34b56a]" />
                Permanent QR Unaffected
              </span>
              <span className="font-mono text-[10px]">{lastUpdated}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 relative flex justify-center items-center">
          <div className="absolute -left-4 top-1/4 z-30 bg-[#1d2723] border border-white/15 p-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md hidden sm:flex">
            <div className="bg-white p-1.5 rounded-lg border border-[#e8783c]">
              <QrCode size={28} className="text-[#151c19]" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Table QR #104</p>
              <p className="text-[10px] text-[#34b56a] font-medium">Never Needs Reprint</p>
            </div>
          </div>

          <IPhoneMockup badgeText="Live Sync">
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-xs font-bold text-white">Royal Curry House</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Live View
                </span>
              </div>

              <div className="space-y-3">
                <div
                  className={`p-3 rounded-xl bg-[#1d2723] border transition-all duration-300 ${
                    isUpdating
                      ? 'border-[#ffc928] shadow-[0_0_20px_rgba(255,201,40,0.3)] scale-[1.02]'
                      : 'border-[#e8783c]/40'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">Paneer Butter Masala</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-[#34b56a]" />
                      </div>
                      <p className="text-[10px] text-[#aab7b2] mt-0.5">
                        Rich tomato & cashew gravy with cottage cheese cubes.
                      </p>
                    </div>
                    <motion.span
                      key={price}
                      initial={{ scale: 1.3, color: '#ffc928' }}
                      animate={{ scale: 1, color: '#ffffff' }}
                      transition={{ duration: 0.3 }}
                      className="text-sm font-black text-white"
                    >
                      ₹{price}
                    </motion.span>
                  </div>

                  <div className="flex justify-between items-center text-[9px] text-[#aab7b2] pt-2 border-t border-white/5">
                    <span className="text-[#ffc928]">★ 4.9 Bestseller</span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Check size={10} /> Synced
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#1d2723]/60 border border-white/5 opacity-60">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-white">Garlic Butter Naan</span>
                      <p className="text-[10px] text-[#aab7b2]">Clay oven baked bread.</p>
                    </div>
                    <span className="text-sm font-bold text-white">₹70</span>
                  </div>
                </div>
              </div>
            </div>
          </IPhoneMockup>
        </div>
      </div>
    </section>
  );
}