import SiteHeader from '../../../components/marketing/SiteHeader';
import SiteFooter from '../../../components/marketing/SiteFooter';
import { SEO } from '../../../seo/SEO';
import BreadcrumbNav from '../../../components/seo/BreadcrumbNav';
import GeoFaqSection from '../../../components/seo/GeoFaqSection';
import { getBreadcrumbSchema, getOrganizationSchema } from '../../../seo/structuredData';
import { Link } from 'react-router-dom';

export default function RestaurantDigitalMenu() {
  const breadcrumbs = [{ name: 'Restaurant Digital Menu', path: '/restaurant-digital-menu' }];

  return (
    <div className="bg-[#FAFAF7] min-h-screen text-gray-900 font-sans relative overflow-x-clip">
      <div className="texture-indian-heritage fixed inset-0 pointer-events-none z-0" />
      <SEO 
        title="Restaurant Digital Menu Platform | MenusQR"
        description="Empower your food business with MenusQR's restaurant digital menu system. Manage multiple categories, pricing, and availability with ease."
        canonicalUrl="/restaurant-digital-menu"
        schema={[getOrganizationSchema(), getBreadcrumbSchema(breadcrumbs)]}
      />
      <SiteHeader />
      
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-5xl mx-auto relative z-10">
        <BreadcrumbNav items={breadcrumbs} />
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#151C19] mb-6 tracking-tight">
          Complete Restaurant Digital Menu Management
        </h1>
        
        <p className="text-xl text-[#53615a] mb-10 leading-relaxed font-medium">
          Modernize your restaurant operations with an enterprise-grade digital menu engine designed for ease of use, instant deployment, and zero maintenance overhead.
        </p>

        <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm mb-12 space-y-8 text-[#151C19]/80 text-lg leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-[#151C19] mb-4">Core Platform Capabilities</h2>
            <ul className="list-disc pl-6 space-y-2 text-base text-[#151C19]">
              <li><strong>Dynamic Category Organization:</strong> Arrange appetizers, main courses, drinks, and desserts effortlessly.</li>
              <li><strong>Veg / Non-Veg Visual Tagging:</strong> Provide clear dietary distinction for Indian and international diners.</li>
              <li><strong>Instant Availability Toggles:</strong> Hide sold-out dishes instantly to prevent customer disappointment.</li>
              <li><strong>Multi-Theme Support:</strong> Switch between Royal Walnut, Minimalist Emerald, Crimson Diner, and Modern Slate designs.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#151C19] mb-4">No Hardware or App Installation Needed</h2>
            <p>
              Your guests don't need to download an app or register an account. They simply scan the QR code using standard iOS or Android camera apps, and the menu opens in under a second.
            </p>
          </section>

          <div className="pt-6 border-t border-gray-100 flex flex-wrap gap-4 items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#151C19]">Ready to elevate your menu experience?</h3>
              <p className="text-sm text-[#53615a]">Choose a plan starting at just ₹699/month (₹2,499/year).</p>
            </div>
            <Link to="/plans" className="bg-[#E8783C] text-white px-6 py-3 rounded-full font-bold hover:bg-[#d66a30] transition-colors">
              Compare Subscription Plans
            </Link>
          </div>
        </div>

        <GeoFaqSection title="Platform FAQs" />
      </main>

      <SiteFooter />
    </div>
  );
}
