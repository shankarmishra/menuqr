import SiteHeader from '../../../components/marketing/SiteHeader';
import SiteFooter from '../../../components/marketing/SiteFooter';
import { SEO } from '../../../seo/SEO';
import BreadcrumbNav from '../../../components/seo/BreadcrumbNav';
import GeoFaqSection from '../../../components/seo/GeoFaqSection';
import { getBreadcrumbSchema, getOrganizationSchema } from '../../../seo/structuredData';
import { Link } from 'react-router-dom';

export default function RestaurantQrMenu() {
  const breadcrumbs = [{ name: 'Restaurant QR Menu', path: '/restaurant-qr-menu' }];

  return (
    <div className="bg-[#FAFAF7] min-h-screen text-gray-900 font-sans">
      <SEO 
        title="Restaurant QR Menu | Permanent QR, Live Menu Updates | MenusQR"
        description="Upgrade your restaurant with a permanent QR menu. Showcase your food beautifully, update prices instantly, and offer table ordering with MenusQR Premium."
        canonicalUrl="/restaurant-qr-menu"
        schema={[getOrganizationSchema(), getBreadcrumbSchema(breadcrumbs)]}
      />
      <SiteHeader />
      
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-5xl mx-auto">
        <BreadcrumbNav items={breadcrumbs} />
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#151C19] mb-6 tracking-tight">
          A Restaurant QR Menu That Never Needs Reprinting
        </h1>
        
        <p className="text-xl text-[#53615a] mb-10 leading-relaxed font-medium">
          Say goodbye to costly menu reprinting. MenusQR gives your restaurant high-durability permanent table QR codes coupled with continuous real-time cloud menu management.
        </p>

        <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm mb-12 space-y-8 text-[#151C19]/80 text-lg leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-[#151C19] mb-4">Permanent Table QR Code Technology</h2>
            <p>
              When you set up MenusQR, your table QR code link remains unchanged forever. Print high-quality table acrylic stands or wooden stickers once. Whether you update daily specials, change prices, or launch holiday menus, your table codes work without reprinting.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#151C19] mb-4">Engineered for Busy Dining Rooms & Cafés</h2>
            <p className="mb-4">
              MenusQR is built specifically for high-velocity food businesses:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-base text-[#151C19]">
              <li><strong>Fine Dining & Bistros:</strong> Elegant visual styling with clear categorization and wine pairing notes.</li>
              <li><strong>Quick Service & Cafés:</strong> Lightning-fast page loads optimized for high peak customer traffic.</li>
              <li><strong>Dhabas & Family Restaurants:</strong> Veg/Non-Veg indicators and clear multi-language support.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#151C19] mb-4">Upgrade to Direct Table QR Ordering</h2>
            <p>
              With the MenusQR Premium plan, your restaurant QR menu expands into a complete order placement system. Guests add items to their cart and send orders directly from their table to your reception dashboard.
            </p>
          </section>

          <div className="pt-6 border-t border-gray-100 flex flex-wrap gap-4 items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#151C19]">Want QR ordering for your tables?</h3>
              <p className="text-sm text-[#53615a]">Discover how direct table ordering boosts revenue.</p>
            </div>
            <div className="flex gap-3">
              <Link to="/qr-ordering-for-restaurants" className="bg-[#151C19] text-white px-6 py-3 rounded-full font-bold hover:bg-black transition-colors">
                Learn About QR Ordering
              </Link>
              <Link to="/plans" className="bg-[#E8783C] text-white px-6 py-3 rounded-full font-bold hover:bg-[#d66a30] transition-colors">
                View Pricing
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
