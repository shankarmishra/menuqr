import { CheckCircle2, ArrowRight } from 'lucide-react';

const STEPS = [
  { step: '01', title: 'Set Up Account', desc: 'Register your restaurant tenant in under 60 seconds.', highlight: true },
  { step: '02', title: 'Build Digital Menu', desc: 'Add categories, dishes, prices, photos, and dietary tags.', highlight: false },
  { step: '03', title: 'Choose Menu Theme', desc: 'Select from 10 distinct, responsive design templates.', highlight: false },
  { step: '04', title: 'Generate Permanent QR', desc: 'Download high-resolution print-ready table stickers.', highlight: true },
  { step: '05', title: 'Print & Place on Tables', desc: 'Display QR placards across tables, counter, or reception.', highlight: false },
  { step: '06', title: 'Update Anytime Live', desc: 'Modify prices or specials without reprinting a single QR.', highlight: true },
];

export default function HowItWorksSection() {
  return (
    <section className="py-24 md:py-36 px-6 bg-[#151c19] border-b border-white/5 relative overflow-hidden" id="how-it-works">
      <div className="max-w-[1240px] mx-auto text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1d2723] text-[#e8783c] text-xs font-semibold uppercase tracking-wider border border-[#e8783c]/30 mb-4">
          <CheckCircle2 size={14} />
          <span>Simple 6-Step Workflow</span>
        </div>
        <h2 className="text-[2.25rem] sm:text-[3.25rem] font-extrabold text-white tracking-tight">
          How MENUQR Works
        </h2>
        <p className="text-base sm:text-lg text-[#aab7b2] max-w-2xl mx-auto mt-3">
          From initial setup to permanent table placement—the seamless path to dynamic digital dining.
        </p>
      </div>

      {/* Rhythmic High-Contrast Steps Grid */}
      <div className="max-w-[1240px] mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {STEPS.map((s, idx) => (
          <div
            key={s.step}
            className={`p-8 rounded-3xl border transition-all duration-300 flex flex-col justify-between hover:scale-[1.02] shadow-xl ${
              s.highlight
                ? 'bg-white text-[#151c19] border-white shadow-2xl shadow-white/10'
                : 'bg-[#1d2723] text-white border-white/10 hover:border-white/30'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <span
                  className={`text-sm font-mono font-extrabold px-3 py-1 rounded-xl ${
                    s.highlight ? 'bg-[#151c19] text-white' : 'bg-[#151c19] text-[#e8783c] border border-white/10'
                  }`}
                >
                  STEP {s.step}
                </span>
                {idx < STEPS.length - 1 && (
                  <ArrowRight size={18} className={s.highlight ? 'text-[#e8783c]' : 'text-white/30'} />
                )}
              </div>
              <h3 className={`text-xl font-bold mb-2 ${s.highlight ? 'text-[#151c19]' : 'text-white'}`}>
                {s.title}
              </h3>
              <p className={`text-sm leading-relaxed ${s.highlight ? 'text-[#334155]' : 'text-[#aab7b2]'}`}>
                {s.desc}
              </p>
            </div>

            <div className="pt-6 mt-4 border-t border-current/10 flex items-center justify-between text-[10px] font-mono opacity-80">
              <span>MENUQR Platform</span>
              <span>Milestone {s.step}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}