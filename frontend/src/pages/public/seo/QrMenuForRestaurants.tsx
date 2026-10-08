import SiteHeader from '../../../components/marketing/SiteHeader';
import SiteFooter from '../../../components/marketing/SiteFooter';
import { SEO } from '../../../seo/SEO';
import BreadcrumbNav from '../../../components/seo/BreadcrumbNav';
import GeoFaqSection from '../../../components/seo/GeoFaqSection';
import { getBreadcrumbSchema, getOrganizationSchema } from '../../../seo/structuredData';
import { Link } from 'react-router-dom';

export default function QrMenuForRestaurants() {
  const breadcrumbs = [{ name: 'QR Menu for Restaurants', path: '/qr-menu-for-restaurants' }];

  return (
    <div className="bg-[#FAFAF7] min-h-screen text-gray-900 font-sans">
      <SEO 
        title="QR Menu for Restaurants | Fast & Easy Setup | MenusQR"
        description="Set up a custom QR menu for your restaurant in minutes. Easy dish categorization, Veg/Non-Veg indicators, and beautiful template designs."
        canonicalUrl="/qr-menu-for-restaurants"
        schema={[getOrganizationSchema(), getBreadcrumbSchema(breadcrumbs)]}
      />
      <SiteHeader />
      
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-5xl mx-auto">
        <BreadcrumbNav items={breadcrumbs} />
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#151C19] mb-6 tracking-tight">
          Smart QR Menu Solutions for Every Restaurant
        </h1>
        
        <p className="text-xl text-[#53615a] mb-10 leading-relaxed font-medium">
          Whether you operate a fine-dining establishment, a cozy café, a food truck, or a multi-table dhaba, MenusQR provides a fast, dependable QR menu solution tailored to your operational needs.
        </p>

        <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm mb-12 space-y-8 text-[#151C19]/80 text-lg leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-[#151C19] mb-4">Setup Your Restaurant QR Menu in 3 Easy Steps</h2>
            <ol className="list-decimal pl-6 space-y-3 text-base text-[#151C19]">
              <li><strong>Create Your Digital Menu:</strong> Add your categories, items, prices, and high-resolution food images in your dashboard.</li>
              <li><strong>Download Your Table QR Stands:</strong> Generate custom print-ready QR codes for your tables.</li>
              <li><strong>Place Stands & Start Serving:</strong> Guests scan and view your live menu instantly on their smartphones.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#151C19] mb-4">Continuous Live Menu Management</h2>
            <p>
              Your menu is never static. With MenusQR, you can modify prices, update item descriptions, add daily specials, or toggle availability instantly. The table QR code never changes.
            </p>
          </section>

          <div className="pt-6 border-t border-gray-100 flex flex-wrap gap-4 items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#151C19]">Explore Restaurant Menu Templates</h3>
              <p className="text-sm text-[#53615a]">Find the perfect design theme for your restaurant brand.</p>
            </div>
            <div className="flex gap-3">
              <Link to="/templates" className="bg-[#151C19] text-white px-6 py-3 rounded-full font-bold hover:bg-black transition-colors">
                Explore Templates
              </Link>
              <Link to="/plans" className="bg-[#E8783C] text-white px-6 py-3 rounded-full font-bold hover:bg-[#d66a30] transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>

        <GeoFaqSection title="Restaurant QR Menu FAQs" />
      </main>

      <SiteFooter />
    </div>
  );
}
