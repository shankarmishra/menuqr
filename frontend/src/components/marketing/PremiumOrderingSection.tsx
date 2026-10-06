

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
          {/* Left: Phone Mockup (Customer) */}
          <div className="w-[280px] h-[580px] bg-gray-100 rounded-[3rem] border-[8px] border-gray-900 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 inset-x-0 h-6 bg-gray-900 rounded-b-3xl w-40 mx-auto"></div>
            <div className="p-4 pt-10 h-full flex flex-col bg-[#FAFAF7]">
              <div className="font-bold text-xl mb-4">Menu</div>
              <div className="space-y-3 flex-1">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
                  <div className="font-semibold text-sm">Truffle Burger</div>
                  <div className="text-[#e8783c] text-xs font-bold mt-1">₹450</div>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
                  <div className="font-semibold text-sm">Fries</div>
                  <div className="text-[#e8783c] text-xs font-bold mt-1">₹150</div>
                </div>
              </div>
              <div className="bg-[#151c19] text-white p-4 rounded-xl text-center font-bold mt-4 shadow-lg">
                PLACE ORDER • ₹600
              </div>
            </div>
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
