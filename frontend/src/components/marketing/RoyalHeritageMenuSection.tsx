import { Crown, Sparkles, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import RoyalHeritageSketchbook from './RoyalHeritageSketchbook';

export default function RoyalHeritageMenuSection() {
  return (
    <section className="relative py-10 sm:py-14 overflow-hidden bg-[#FAFAF7] border-y border-[#E8E4DA]">
      
      {/* Subtle warm ambient background glow matching the light theme */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-br from-[#D4AF37]/8 via-[#e8783c]/5 to-transparent blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* TOP BADGE & SECTION INTRO (Compact Height) */}
        <div className="text-center max-w-2xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#8C6808] text-xs font-black tracking-widest uppercase mb-3 shadow-xs">
            <Sparkles size={12} className="text-[#AA820A]" />
            <span>Interactive 3D Heritage Showcase</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-[#1C1814] tracking-tight leading-tight font-serif">
            The Art of the Royal Menu
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#6B5E52] leading-relaxed">
            Before smartphones, Indian royal palaces preserved culinary secrets in leather-bound, gold-embossed tasting folios. 
            Experience how <span className="text-[#8C6808] font-bold">MenuQR</span> brings that timeless majesty to tables with zero paper reprints.
          </p>
        </div>

        {/* 3D SKETCHBOOK COMPONENT (Compact Max Width) */}
        <div className="my-4">
          <RoyalHeritageSketchbook />
        </div>

        {/* THREE COMPACT PILLARS */}
        <div className="grid md:grid-cols-3 gap-4 mt-8 max-w-4xl mx-auto">
          
          <div className="p-4 rounded-xl bg-white/95 border border-[#E5E0D5] hover:border-[#D4AF37]/60 transition-all group shadow-sm flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#8C6808] shrink-0 group-hover:scale-105 transition-transform">
              <Crown size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1C1814] font-serif">
                Royal Heritage Typography
              </h3>
              <p className="text-xs text-[#736353] mt-1 leading-relaxed">
                Awadhi &amp; Mughal recipes with Devanagari calligraphy, spice profiles, and 24K gold foil borders.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/95 border border-[#E5E0D5] hover:border-[#16A34A]/60 transition-all group shadow-sm flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#16A34A]/15 border border-[#16A34A]/30 flex items-center justify-center text-[#16A34A] shrink-0 group-hover:scale-105 transition-transform">
              <Zap size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1C1814] font-serif">
                Instant 12ms Cloud Sync
              </h3>
              <p className="text-xs text-[#736353] mt-1 leading-relaxed">
                Sold-out items or seasonal price changes update live without reprinting costly leather folios.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/95 border border-[#E5E0D5] hover:border-[#e8783c]/60 transition-all group shadow-sm flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#e8783c]/15 border border-[#e8783c]/30 flex items-center justify-center text-[#e8783c] shrink-0 group-hover:scale-105 transition-transform">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1C1814] font-serif">
                Permanent 24K Table QR
              </h3>
              <p className="text-xs text-[#736353] mt-1 leading-relaxed">
                Calacatta marble &amp; walnut placard placed once forever. 100% vector scannable.
              </p>
            </div>
          </div>

        </div>

        {/* COMPACT BOTTOM CTA */}
        <div className="mt-8 text-center">
          <Link
            to="/purchase"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#AA820A] text-[#121815] font-black text-xs sm:text-sm tracking-wide shadow-md shadow-[#D4AF37]/20 hover:brightness-105 transition-all cursor-pointer"
          >
            <span>Claim Your Restaurant's Heritage Theme</span>
            <ArrowRight size={15} />
          </Link>
          <p className="text-[11px] text-[#7A6D60] mt-2">
            Plans starting at ₹559/mo • 20% launch discount applied • 3-minute setup
          </p>
        </div>

      </div>

    </section>
  );
}
