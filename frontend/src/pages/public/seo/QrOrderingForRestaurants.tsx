import SiteHeader from '../../../components/marketing/SiteHeader';
import SiteFooter from '../../../components/marketing/SiteFooter';
import { SEO } from '../../../seo/SEO';
import BreadcrumbNav from '../../../components/seo/BreadcrumbNav';
import GeoFaqSection from '../../../components/seo/GeoFaqSection';
import { getBreadcrumbSchema, getOrganizationSchema } from '../../../seo/structuredData';
import { Link } from 'react-router-dom';

export default function QrOrderingForRestaurants() {
  const breadcrumbs = [{ name: 'QR Ordering for Restaurants', path: '/qr-ordering-for-restaurants' }];

  return (
    <div className="bg-[#FAFAF7] min-h-screen text-gray-900 font-sans">
      <SEO 
        title="QR Ordering for Restaurants | Table Ordering System | MenusQR"
        description="Let guests order directly from their table using MenusQR Premium. Streamline kitchen reception, speed up service, and boost table turnover."
        canonicalUrl="/qr-ordering-for-restaurants"
        schema={[getOrganizationSchema(), getBreadcrumbSchema(breadcrumbs)]}
      />
      <SiteHeader />
      
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-5xl mx-auto">
        <BreadcrumbNav items={breadcrumbs} />
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#151C19] mb-6 tracking-tight">
          Direct Table QR Ordering for Restaurants
        </h1>
        
        <p className="text-xl text-[#53615a] mb-10 leading-relaxed font-medium">
          Turn your table QR codes into an interactive order placement engine with MenusQR Premium. Enable guests to select dishes, customize options, and submit orders directly to your reception dashboard.
        </p>

        <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm mb-12 space-y-8 text-[#151C19]/80 text-lg leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-[#151C19] mb-4">How Table QR Ordering Works</h2>
            <ol className="list-decimal pl-6 space-y-3 text-base text-[#151C19]">
              <li><strong>Guest Scans Table QR:</strong> The guest opens your menu and browses categories on their phone.</li>
              <li><strong>Item Selection & Customization:</strong> Diners add items to their table cart and add specific preparation notes.</li>
              <li><strong>Instant Order Dispatch:</strong> The guest taps "Place Order". The order appears instantly on your restaurant's reception screen with table number and audio notification.</li>
              <li><strong>Kitchen Fulfillment:</strong> Your staff prepares and delivers the order smoothly without order taking delays.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#151C19] mb-4">Key Benefits of QR Ordering</h2>
            <ul className="list-disc pl-6 space-y-2 text-base text-[#151C19]">
              <li><strong>Faster Table Turnover:</strong> Eliminates waiting times for waiter order taking during rush hours.</li>
              <li><strong>Higher Average Bill Size:</strong> Visual menus and easy add-ons encourage guests to order extra appetizers, drinks, and desserts.</li>
              <li><strong>Zero Order Miscommunication:</strong> Customer preferences and dietary specifications arrive in writing directly to reception.</li>
            </ul>
          </section>

          <div className="pt-6 border-t border-gray-100 flex flex-wrap gap-4 items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#151C19]">Ready to enable direct table ordering?</h3>
              <p className="text-sm text-[#53615a]">Premium Plan includes complete order management at ₹2,999/year.</p>
            </div>
            <Link to="/plans" className="bg-[#E8783C] text-white px-6 py-3 rounded-full font-bold hover:bg-[#d66a30] transition-colors">
              Get Premium Plan
            </Link>
          </div>
        </div>

        <GeoFaqSection title="QR Ordering System FAQs" />
      </main>

      <SiteFooter />
    </div>
  );
}
