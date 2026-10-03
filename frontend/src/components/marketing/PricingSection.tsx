import { Check, Sparkles } from 'lucide-react';

export default function PricingSection() {
  return (
    <section className="py-24 md:py-36 px-6 bg-[#151c19] border-b border-white/5 relative overflow-hidden" id="pricing">
      <div className="max-w-[1240px] mx-auto text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1d2723] text-[#ffc928] text-xs font-semibold uppercase tracking-wider border border-[#ffc928]/30 mb-4">
          <Sparkles size={14} />
          <span>Transparent Yearly Subscriptions</span>
        </div>
        <h2 className="text-[2.25rem] sm:text-[3.25rem] font-extrabold text-white tracking-tight">
          Simple, Predictable Pricing
        </h2>
        <p className="text-base sm:text-lg text-[#aab7b2] max-w-2xl mx-auto mt-3">
          Designed for independent restaurants, cafes, and hospitality businesses. No hidden fees per scan.
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        {/* Starter Plan - Dark Card */}
        <div className="bg-[#1d2723] p-8 rounded-3xl border border-white/10 text-left space-y-6 shadow-xl">
          <div>
            <span className="text-xs font-mono text-[#aab7b2] uppercase tracking-wider">
              Essential
            </span>
            <h3 className="text-2xl font-bold text-white mt-1">Starter Tier</h3>
            <p className="text-xs text-[#aab7b2] mt-1">
              For small cafes and single-table locations.
            </p>
          </div>

          <div className="text-4xl font-extrabold text-white">
            ₹4,999 <span className="text-sm font-normal text-[#aab7b2]">/ year</span>
          </div>

          <ul className="space-y-3 text-xs text-[#aab7b2]">
            <li className="flex items-center gap-2">
              <Check size={16} className="text-[#34b56a]" /> Unlimited QR Scans
            </li>
            <li className="flex items-center gap-2">
              <Check size={16} className="text-[#34b56a]" /> 1 Live Digital Menu
            </li>
            <li className="flex items-center gap-2">
              <Check size={16} className="text-[#34b56a]" /> 3 Standard Menu Themes
            </li>
            <li className="flex items-center gap-2">
              <Check size={16} className="text-[#34b56a]" /> Permanent QR Guarantee
            </li>
          </ul>

          <a
            href="#/admin/login"
            className="block text-center w-full bg-[#151c19] hover:bg-white/10 text-white border border-white/15 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Get Started
          </a>
        </div>

        {/* Pro Recommended Plan - High Contrast Crisp White Card */}
        <div className="bg-white text-[#151c19] p-8 rounded-3xl border-2 border-white relative text-left space-y-6 shadow-2xl shadow-white/15 scale-[1.03]">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#e8783c] text-white px-4 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider shadow-lg">
            ★ Most Popular Choice
          </div>

          <div>
            <span className="text-xs font-mono text-[#e8783c] uppercase tracking-wider font-bold">
              Full SaaS Suite
            </span>
            <h3 className="text-2xl font-bold text-[#151c19] mt-1">Pro Restaurant Plan</h3>
            <p className="text-xs text-[#475569] mt-1">
              For active restaurants, lounges, and busy dining rooms.
            </p>
          </div>

          <div className="text-4xl font-extrabold text-[#151c19]">
            ₹8,999 <span className="text-sm font-normal text-[#475569]">/ year</span>
          </div>

          <ul className="space-y-3 text-xs text-[#334155] font-medium">
            <li className="flex items-center gap-2">
              <Check size={16} className="text-[#e8783c]" /> Everything in Starter
            </li>
            <li className="flex items-center gap-2">
              <Check size={16} className="text-[#e8783c]" /> 10 Distinct Premium Menu Themes
            </li>
            <li className="flex items-center gap-2">
              <Check size={16} className="text-[#e8783c]" /> Instant Price & Availability Sync
            </li>
            <li className="flex items-center gap-2">
              <Check size={16} className="text-[#e8783c]" /> Veg / Non-Veg & Allergen Filters
            </li>
            <li className="flex items-center gap-2">
              <Check size={16} className="text-[#e8783c]" /> 10-Day Expiry Protection Engine
            </li>
          </ul>

          <a
            href="#/admin/login"
            className="block text-center w-full bg-[#e8783c] hover:bg-[#151c19] text-white hover:text-white py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#e8783c]/30"
          >
            Start Free Trial
          </a>
        </div>
      </div>
    </section>
  );
}