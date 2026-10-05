import { motion } from 'framer-motion';
import { Check, Sparkles, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PricingSection() {

  return (
    <section className="py-24 md:py-36 px-6 bg-menusqr-secondary relative overflow-hidden" id="pricing">
      <div className="absolute top-0 inset-x-0 h-px bg-menusqr-emerald/5" />
      <div className="texture-paper-grain z-0" />
      
      <div className="max-w-[1240px] mx-auto text-center mb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-menusqr-white text-menusqr-orange text-xs font-semibold uppercase tracking-wider border border-menusqr-emerald/10 mb-4 shadow-sm">
            <Sparkles size={14} />
            <span>Transparent Pricing</span>
          </div>
          <h2 className="text-[2.25rem] sm:text-[3.25rem] font-extrabold text-menusqr-emerald tracking-tight">
            One powerful plan.
          </h2>
          <p className="text-base sm:text-lg text-menusqr-neutral-muted max-w-2xl mx-auto mt-3">
            Everything you need for a fully self-managed interactive ordering system.
          </p>
        </motion.div>
      </div>

      <div className="max-w-2xl mx-auto relative z-10 px-4 sm:px-0">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="bg-menusqr-white rounded-[2.5rem] shadow-[0_32px_80px_-12px_rgba(21,28,25,0.12)] p-10 sm:p-12 relative flex flex-col border border-menusqr-emerald/5"
        >
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-menusqr-orange text-white text-xs font-black uppercase tracking-widest py-2 px-6 rounded-full shadow-lg shadow-menusqr-orange/20">
            Premium Access
          </div>
          
          <div className="text-center mb-10 mt-4">
            <h3 className="text-3xl font-black tracking-tight text-menusqr-emerald mb-3">
              MenusQR Pro
            </h3>
            <p className="text-base text-menusqr-neutral-sec leading-relaxed max-w-md mx-auto">
              Full interactive menu with live table ordering and permanent QR identity.
            </p>
          </div>
          
          <div className="flex justify-center items-end gap-2 mb-12">
            <span className="text-6xl font-black text-menusqr-emerald tracking-tighter">₹2,999</span>
            <span className="text-lg font-bold text-menusqr-neutral-muted mb-2">/ year</span>
          </div>

          <div className="bg-menusqr-secondary rounded-3xl p-8 mb-10 border border-menusqr-emerald/5">
            <h4 className="text-sm font-black text-menusqr-emerald uppercase tracking-widest mb-6 flex items-center justify-center gap-2">
              <ShieldCheck size={18} className="text-menusqr-orange" />
              Everything Included
            </h4>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
              {[
                "Permanent QR Code Identity",
                "Unlimited Live Updates",
                "Live Customer Table Ordering",
                "Premium Layout Templates",
                "Order Reception Dashboard",
                "Variant & Dietary Tagging",
                "Real-time Availability Toggles",
                "Detailed Analytics"
              ].map((feat, fIdx) => (
                <div key={fIdx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-menusqr-emerald/5 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} className="text-menusqr-orange" strokeWidth={3} />
                  </div>
                  <span className="text-sm font-bold text-menusqr-neutral-sec leading-snug">
                    {feat}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <Link
            to="/purchase"
            className="w-full py-5 px-8 rounded-2xl font-black text-base uppercase tracking-widest transition-all shadow-xl text-menusqr-white bg-menusqr-orange hover:bg-[#d9672d] shadow-menusqr-orange/25 text-center flex justify-center items-center gap-2"
          >
            Start Your Subscription <Sparkles size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
