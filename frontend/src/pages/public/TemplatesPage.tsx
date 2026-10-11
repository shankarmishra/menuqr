import SiteHeader from '../../components/marketing/SiteHeader';
import SiteFooter from '../../components/marketing/SiteFooter';
import { SEO } from '../../seo/SEO';
import BreadcrumbNav from '../../components/seo/BreadcrumbNav';
import GeoFaqSection from '../../components/seo/GeoFaqSection';
import { getBreadcrumbSchema, getOrganizationSchema } from '../../seo/structuredData';
import { Link } from 'react-router-dom';

export default function TemplatesPage() {
  const breadcrumbs = [{ name: 'Templates', path: '/templates' }];

  return (
    <div className="bg-[#FAFAF7] min-h-screen text-gray-900 font-sans relative overflow-x-clip">
      <div className="texture-indian-heritage fixed inset-0 pointer-events-none z-0" />
      <SEO 
        title="Restaurant Menu Templates | MenusQR"
        description="Explore mobile-first digital menu templates designed for fine dining, casual cafés, retro diners, and vibrant dhabas."
        canonicalUrl="/templates"
        schema={[getOrganizationSchema(), getBreadcrumbSchema(breadcrumbs)]}
      />
      <SiteHeader />
      
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-5xl mx-auto relative z-10">
        <BreadcrumbNav items={breadcrumbs} />
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#151C19] mb-6 tracking-tight">
          Digital Menu Templates Designed for Food Businesses
        </h1>
        
        <p className="text-xl text-[#53615a] mb-10 leading-relaxed font-medium">
          Choose a visual personality that matches your restaurant atmosphere. All MenusQR templates are fully responsive, mobile-first, and lightning-fast.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E8783C] bg-[#E8783C]/10 px-3 py-1 rounded-md">Luxury & Fine Dining</span>
            <h2 className="text-2xl font-bold text-[#151C19] mt-4 mb-3">Royal Walnut</h2>
            <p className="text-[#53615a] text-sm leading-relaxed mb-6">
              Rich serif typography, warm dark tones, and subtle gold accents. Perfect for premium steakhouses, wine bars, and fine dining establishments.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#151C19] bg-gray-100 px-3 py-1 rounded-md">Clean & Modern</span>
            <h2 className="text-2xl font-bold text-[#151C19] mt-4 mb-3">Minimalist Emerald</h2>
            <p className="text-[#53615a] text-sm leading-relaxed mb-6">
              Clean sans-serif fonts with refreshing deep emerald and off-white tones. Ideal for modern cafés, organic eateries, and brunch spots.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-md">Vibrant & Casual</span>
            <h2 className="text-2xl font-bold text-[#151C19] mt-4 mb-3">Crimson Diner</h2>
            <p className="text-[#53615a] text-sm leading-relaxed mb-6">
              Bold, energetic typography with high contrast buttons and vivid dish highlights. Great for burger joints, pizza parlors, and casual bistros.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md">Authentic & Regional</span>
            <h2 className="text-2xl font-bold text-[#151C19] mt-4 mb-3">Dhaba Special</h2>
            <p className="text-[#53615a] text-sm leading-relaxed mb-6">
              Designed for high-capacity Indian dhabas, family restaurants, and thali places. Features prominent Veg/Non-Veg badges and clear multi-category navigation.
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 text-center shadow-sm mb-12">
          <h3 className="text-2xl font-bold text-[#151C19] mb-3">Ready to style your restaurant menu?</h3>
          <p className="text-[#53615a] mb-6">Switch menu templates anytime in your dashboard without reprinting QR codes.</p>
          <Link to="/plans" className="inline-block bg-[#E8783C] text-white px-8 py-3.5 rounded-full font-bold hover:bg-[#d66a30] transition-colors">
            Get Started Now
          </Link>
        </div>

        <GeoFaqSection title="Template FAQs" />
      </main>

      <SiteFooter />
    </div>
  );
}
