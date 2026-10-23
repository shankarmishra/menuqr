import { Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PricingSection() {
  return (
    <section className="py-24 bg-[#FAFAF7] relative overflow-hidden" id="pricing">
      <div className="max-w-[1360px] mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Ready to upgrade your menu?
          </h2>
          <p className="text-lg text-gray-600 mt-4">
            Select the experience that fits your business.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Basic */}
          <Link to="/purchase/details?plan=basic" className="block group bg-white border border-gray-200 rounded-3xl p-8 hover:shadow-xl transition-all">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#e8783c] transition-colors">Basic</h3>
            <div className="text-lg font-semibold text-gray-600 mb-6">₹699/MO <span className="text-sm font-normal text-gray-500">(₹2,499/YR)</span></div>
            <p className="text-sm text-gray-500 font-medium">Digital menu with 1 included edit.</p>
          </Link>

          {/* Intermediate */}
          <Link to="/purchase/details?plan=intermediate" className="block group bg-white border border-gray-200 rounded-3xl p-8 hover:shadow-xl transition-all">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#e8783c] transition-colors">Intermediate</h3>
            <div className="text-lg font-semibold text-gray-600 mb-6">₹1,199/MO <span className="text-sm font-normal text-gray-500">(₹3,999/YR)</span></div>
            <p className="text-sm text-gray-500 font-medium">Multiple templates and unlimited edits.</p>
          </Link>

          {/* Premium */}
          <Link to="/purchase/details?plan=premium" className="block group bg-[#151c19] border border-gray-800 rounded-3xl p-8 hover:shadow-2xl transition-all relative">
            <div className="absolute -top-3 right-8 bg-[#e8783c] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
              <Sparkles size={12} /> Best Value
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[#e8783c] transition-colors">Premium</h3>
            <div className="text-lg font-semibold text-gray-400 mb-6">₹1,399/MO <span className="text-sm font-normal text-gray-300">(₹8,499/YR)</span></div>
            <p className="text-sm text-gray-300 font-medium">Full interactive menu with table ordering.</p>
          </Link>
        </div>
      </div>
    </section>
  );
}
