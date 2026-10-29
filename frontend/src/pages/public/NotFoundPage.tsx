import { Link } from 'react-router-dom';
import { Home, LayoutTemplate, UtensilsCrossed, ArrowRight } from 'lucide-react';
import { SEO } from '../../seo/SEO';
import SiteHeader from '../../components/marketing/SiteHeader';
import SiteFooter from '../../components/marketing/SiteFooter';

export default function NotFoundPage() {
  return (
    <div className="bg-[#FAFAF7] min-h-screen text-gray-900 font-sans relative overflow-x-clip flex flex-col justify-between">
      <div className="texture-indian-heritage fixed inset-0 pointer-events-none z-0" />
      <SEO 
        title="404 - Page Not Found | MenusQR" 
        description="The page or digital menu you are looking for does not exist or may have been updated." 
      />
      <SiteHeader />

      <main id="main-content" className="pt-36 pb-20 px-6 max-w-4xl mx-auto relative z-10 flex-1 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200/60 text-[#E8783C] text-xs font-bold uppercase tracking-wider mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E8783C] animate-pulse" />
          Error 404 • Page Not Found
        </div>

        <h1 className="text-6xl sm:text-7xl font-black text-[#151C19] tracking-tight mb-4">
          Lost Your Way?
        </h1>

        <p className="text-base sm:text-lg text-[#53615a] max-w-lg mx-auto mb-10 leading-relaxed font-medium">
          The page or digital menu you are looking for might have been moved, renamed, or is temporarily unavailable.
        </p>

        {/* Quick Route Shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-12 text-left">
          <Link
            to="/"
            className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-[#E8783C]/30 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#E8783C] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Home size={20} />
              </div>
              <h3 className="font-bold text-sm text-[#151C19] mb-1">Homepage</h3>
              <p className="text-xs text-[#53615a]">Return to our main restaurant showcase.</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#E8783C] mt-4">
              Explore <ArrowRight size={13} />
            </span>
          </Link>

          <Link
            to="/templates"
            className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-[#E8783C]/30 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <LayoutTemplate size={20} />
              </div>
              <h3 className="font-bold text-sm text-[#151C19] mb-1">Menu Templates</h3>
              <p className="text-xs text-[#53615a]">Browse all 15 authentic designs.</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-4">
              View All <ArrowRight size={13} />
            </span>
          </Link>

          <Link
            to="/menu/shankar-dhaba"
            className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-[#E8783C]/30 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <UtensilsCrossed size={20} />
              </div>
              <h3 className="font-bold text-sm text-[#151C19] mb-1">Live Demo Menu</h3>
              <p className="text-xs text-[#53615a]">Experience a live customer menu.</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 mt-4">
              Try Demo <ArrowRight size={13} />
            </span>
          </Link>
        </div>

        <Link
          to="/"
          className="bg-gradient-to-r from-[#E8783C] to-[#F18C50] text-white font-bold py-3.5 px-8 rounded-full shadow-[0_4px_16px_rgba(232,120,60,0.35)] hover:shadow-[0_6px_22px_rgba(232,120,60,0.5)] transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm"
        >
          Return to MenusQR Homepage
        </Link>
      </main>

      <SiteFooter />
    </div>
  );
}
