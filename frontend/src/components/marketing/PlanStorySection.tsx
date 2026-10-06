

export default function PlanStorySection() {
  return (
    <section className="py-24 bg-[#FAFAF7] relative overflow-hidden">
      <div className="max-w-[1360px] mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            How much control do you need?
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Basic */}
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col items-center text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic</h3>
            <div className="text-lg font-semibold text-[#e8783c] mb-6">₹999/YR</div>
            <p className="text-gray-600 mb-8">Simple menu creation. Digitize your menu with a QR code and 1 included edit.</p>
            <div className="mt-auto p-4 bg-gray-50 rounded-xl w-full text-sm text-gray-500 font-medium">
              Menu ➔ Digitized ➔ QR
            </div>
          </div>

          {/* Intermediate */}
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col items-center text-center relative">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Intermediate</h3>
            <div className="text-lg font-semibold text-[#e8783c] mb-6">₹1,499/YR</div>
            <p className="text-gray-600 mb-8">3-4 templates, full editing. Owner edits, template changes, live menu updates instantly.</p>
            <div className="mt-auto p-4 bg-gray-50 rounded-xl w-full text-sm text-gray-500 font-medium">
              Owner Edits ➔ Live Menu Updates
            </div>
          </div>

          {/* Premium */}
          <div className="bg-[#151c19] text-white p-8 rounded-3xl border border-[#34B56A]/20 shadow-xl flex flex-col items-center text-center relative">
            <div className="absolute -top-3 bg-[#e8783c] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Most Popular</div>
            <h3 className="text-2xl font-bold mb-2">Premium</h3>
            <div className="text-lg font-semibold text-[#e8783c] mb-6">₹2,999/YR</div>
            <p className="text-gray-300 mb-8">Digital Menu + Ordering. Complete control from scan to kitchen reception.</p>
            <div className="mt-auto p-4 bg-white/10 rounded-xl w-full text-sm text-gray-300 font-medium border border-white/10">
              Scan ➔ Order ➔ Reception Accepts
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
