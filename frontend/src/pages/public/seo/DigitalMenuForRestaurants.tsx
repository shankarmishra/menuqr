import SiteHeader from '../../../components/marketing/SiteHeader';
import SiteFooter from '../../../components/marketing/SiteFooter';
import { SEO } from '../../../seo/SEO';
import BreadcrumbNav from '../../../components/seo/BreadcrumbNav';
import GeoFaqSection, { PAGE_FAQS, toFaqSchemaItems } from '../../../components/seo/GeoFaqSection';
import { getBreadcrumbSchema, getFaqSchema, getOrganizationSchema } from '../../../seo/structuredData';
import { Link } from 'react-router-dom';

export default function DigitalMenuForRestaurants() {
  const breadcrumbs = [{ name: 'Digital Menu for Restaurants', path: '/digital-menu-for-restaurants' }];

  return (
    <div className="bg-[#FAFAF7] min-h-screen text-gray-900 font-sans relative overflow-x-clip">
      <div className="texture-indian-heritage fixed inset-0 pointer-events-none z-0" />
      <SEO 
        title="Digital Menu for Restaurants | MenusQR"
        description="Create an interactive digital menu for your restaurant, café, or dhaba. Fast loading, mobile-optimized, and hassle-free menu updates."
        canonicalUrl="/digital-menu-for-restaurants"
        schema={[getOrganizationSchema(), getBreadcrumbSchema(breadcrumbs), getFaqSchema(toFaqSchemaItems(PAGE_FAQS.digitalMenuForRestaurants))]}
      />
      <SiteHeader />
      
      <main id="main-content" className="pt-32 pb-24 px-6 md:px-12 max-w-5xl mx-auto relative z-10">
        <BreadcrumbNav items={breadcrumbs} />
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#151C19] mb-6 tracking-tight">
          The Ultimate Digital Menu for Modern Restaurants
        </h1>
        
        <p className="text-xl text-[#53615a] mb-10 leading-relaxed font-medium">
          Transform guest dining experiences with MenusQR. Create dynamic, visual digital menus that load instantly on any mobile device without requiring app downloads.
        </p>

        <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm mb-12 space-y-8 text-[#151C19]/80 text-lg leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-[#151C19] mb-4">Why Digital Menus Are Superior to Static PDFs</h2>
            <p className="mb-4">
              PDF menus force customers to pinch, zoom, and scroll through huge files that load slowly on mobile data. MenusQR delivers a native web application experience:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-base text-[#151C19]">
              <li><strong>Category Navigation:</strong> Instant tabs for Starters, Main Course, Beverages, and Desserts.</li>
              <li><strong>Dietary Filters:</strong> Clear visual badges for Veg, Non-Veg, Vegan, and Chef's Specials.</li>
              <li><strong>Sub-second Speed:</strong> Optimized web pages load smoothly even in low-signal areas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#151C19] mb-4">Instant Price & Item Management</h2>
            <p>
              When an item runs out during dinner rush, mark it unavailable with a single tap. When supplier costs change, update pricing across your entire establishment immediately.
            </p>
          </section>

          <div className="pt-6 border-t border-gray-100 flex flex-wrap gap-4 items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#151C19]">See How MenusQR Works</h3>
              <p className="text-sm text-[#53615a]">Learn how permanent QR codes streamline restaurant management.</p>
            </div>
            <div className="flex gap-3">
              <Link to="/how-it-works" className="bg-[#151C19] text-white px-6 py-3 rounded-full font-bold hover:bg-black transition-colors">
                How It Works
              </Link>
              <Link to="/plans" className="bg-[#E8783C] text-white px-6 py-3 rounded-full font-bold hover:bg-[#d66a30] transition-colors">
                See Pricing Plans
              </Link>
            </div>
          </div>
        </div>

        <GeoFaqSection faqs={PAGE_FAQS.digitalMenuForRestaurants} title="Digital Menu Questions & Answers" />
      </main>

      <SiteFooter />
    </div>
  );
}
