import PremiumIPhoneMockup from './PremiumIPhoneMockup';

export default function PremiumOrderingSection() {
  return (
    <section className="py-16 md:py-20 bg-white relative overflow-hidden">
      <div className="max-w-[1360px] mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            A menu that can become an ordering system.
          </h2>
          <p className="text-lg text-gray-600">
            Customers order from their phone. Your reception receives it instantly.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
          {/* Left: Phone Mockup (Customer View) */}
          <div className="flex justify-center">
            <PremiumIPhoneMockup
              className="!w-[280px] sm:!w-[290px] shadow-2xl"
              badgeText="Customer View"
              statusBarTheme="dark"
              statusBarBg="bg-[#FAFAF7]"
            >
              <div className="p-4 h-full flex flex-col bg-[#FAFAF7] justify-between font-sans select-none">
                <div>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-200">
                    <div>
                      <h4 className="font-extrabold text-base text-[#151C19] tracking-tight">The Artisan Grill</h4>
                      <p className="text-[10px] text-stone-500 font-medium">Table #12 • Live Guest Order</p>
                    </div>
                    <span className="text-[9.5px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Table #12
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {/* Item 1: Truffle Smash Burger */}
                    <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-stone-200 flex gap-2.5 items-center">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="w-2.5 h-2.5 border border-rose-600 rounded-[2px] flex items-center justify-center bg-rose-50 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                          </span>
                          <span className="font-bold text-xs text-[#151C19] truncate">Truffle Smash Burger</span>
                        </div>
                        <p className="text-[9.5px] text-stone-500 line-clamp-1 leading-snug">Double patty, truffle aioli, aged cheddar & brioche.</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[#e8783c] text-xs font-black">₹450</span>
                          <div className="flex items-center gap-2 bg-stone-100 px-2 py-0.5 rounded-full text-[10px] font-bold text-stone-700 border border-stone-200">
                            <span>-</span>
                            <span className="font-black text-[#151C19]">1</span>
                            <span>+</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-stone-100 border border-stone-200 relative">
                        <img
                          src="/uploads/mannat/burger.webp"
                          alt="Truffle Smash Burger"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/img/photos/photo-1568901346375-23c9450c58cd-w200.webp';
                          }}
                          decoding="async"
                          loading="lazy"
                          width={1040}
                          height={980}
                        />
                      </div>
                    </div>

                    {/* Item 2: Parmesan Truffle Fries */}
                    <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-stone-200 flex gap-2.5 items-center">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="w-2.5 h-2.5 border border-emerald-600 rounded-[2px] flex items-center justify-center bg-emerald-50 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          </span>
                          <span className="font-bold text-xs text-[#151C19] truncate">Parmesan Truffle Fries</span>
                        </div>
                        <p className="text-[9.5px] text-stone-500 line-clamp-1 leading-snug">Crisp Idaho fries, white truffle oil & shaved parmesan.</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[#e8783c] text-xs font-black">₹150</span>
                          <div className="flex items-center gap-2 bg-stone-100 px-2 py-0.5 rounded-full text-[10px] font-bold text-stone-700 border border-stone-200">
                            <span>-</span>
                            <span className="font-black text-[#151C19]">1</span>
                            <span>+</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-stone-100 border border-stone-200 relative">
                        <img
                          src="/uploads/mannat/fries.webp"
                          alt="Parmesan Truffle Fries"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/uploads/mannat/fries.webp';
                          }}
                          decoding="async"
                          loading="lazy"
                          width={895}
                          height={1180}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#151C19] text-white p-3 rounded-2xl shadow-lg mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-[8px] font-mono font-bold text-[#F1A679] uppercase tracking-wider">YOUR ORDER</p>
                    <p className="text-xs font-black text-white">2 items • ₹600</p>
                  </div>
                  <button className="bg-[#E8783C] hover:bg-[#F1A679] text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-xs transition-colors active:scale-95">
                    <span>Send to Kitchen</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </PremiumIPhoneMockup>
          </div>

          {/* Center: Transfer Animation */}
          <div className="flex lg:flex-col items-center justify-center gap-2 text-[#e8783c] py-8 lg:py-0">
            <div className="h-1 w-16 lg:w-1 lg:h-16 bg-gradient-to-r lg:bg-gradient-to-b from-[#e8783c] to-transparent animate-pulse rounded-full"></div>
            <div className="font-bold tracking-widest text-xs uppercase">Transfer</div>
            <div className="h-1 w-16 lg:w-1 lg:h-16 bg-gradient-to-l lg:bg-gradient-to-t from-[#e8783c] to-transparent animate-pulse rounded-full"></div>
          </div>

          {/* Right: Reception Dashboard */}
          <div className="flex-1 max-w-[600px] w-full bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-[#151c19] text-white p-4 flex justify-between items-center">
              <div className="font-bold text-sm tracking-widest uppercase">Reception Dashboard</div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#34B56A] rounded-full animate-pulse"></span>
                <span className="text-xs font-semibold">LIVE</span>
              </div>
            </div>
            <div className="p-6 bg-gray-50 h-[480px] overflow-y-auto">
              <div className="bg-white p-5 rounded-xl border-l-4 border-[#e8783c] shadow-sm mb-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">New Order</div>
                    <div className="text-lg font-bold text-gray-900">Table #12</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-[#e8783c]">₹600</div>
                    <div className="text-xs text-gray-500">Just now</div>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-3 mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-800">1x Truffle Burger</span>
                    <span className="text-gray-500">₹450</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-800">1x Fries</span>
                    <span className="text-gray-500">₹150</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 bg-[#34B56A] text-white py-2 rounded-lg font-bold text-sm hover:bg-emerald-600 transition-colors">
                    ACCEPT
                  </button>
                  <button className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors">
                    REJECT
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
