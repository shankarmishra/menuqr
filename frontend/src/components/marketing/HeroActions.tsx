import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HeroActions() {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Link
        to="/plans"
        className="inline-flex items-center justify-center gap-2 bg-[#E8783C] hover:bg-[#d9672d] text-white px-8 py-4 rounded-xl font-bold text-[15px] transition-all shadow-[0_8px_20px_-8px_rgba(232,120,60,0.5)] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-8px_rgba(232,120,60,0.6)]"
      >
        <span>Create Your Menu</span>
        <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
      </Link>
      <button
        onClick={() => {
          document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
        }}
        className="inline-flex items-center justify-center bg-transparent border-2 border-[#151C19]/10 hover:border-[#151C19]/20 hover:bg-[#151C19]/5 text-[#151C19] px-8 py-4 rounded-xl font-bold text-[15px] transition-all hover:-translate-y-0.5"
      >
        See How It Works
      </button>
    </div>
  );
}
