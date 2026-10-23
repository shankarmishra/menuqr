import SiteHeader from '../../../components/marketing/SiteHeader';
import SiteFooter from '../../../components/marketing/SiteFooter';
import { SEO } from '../../../seo/SEO';
import BreadcrumbNav from '../../../components/seo/BreadcrumbNav';
import GeoFaqSection from '../../../components/seo/GeoFaqSection';
import { getBreadcrumbSchema, getOrganizationSchema } from '../../../seo/structuredData';
import { Link } from 'react-router-dom';

export default function DigitalQrMenu() {
  const breadcrumbs = [{ name: 'Digital QR Menu', path: '/digital-qr-menu' }];

  return (
    <div className="bg-[#FAFAF7] min-h-screen text-gray-900 font-sans relative overflow-x-clip">
      <div className="texture-indian-heritage fixed inset-0 pointer-events-none z-0" />
      <SEO 
        title="Digital QR Menu for Restaurants | MenusQR"
        description="Transform your restaurant with a seamless digital QR menu. Update prices, categories, and items instantly while keeping your table QR codes unchanged."
        canonicalUrl="/digital-qr-menu"
        schema={[getOrganizationSchema(), getBreadcrumbSchema(breadcrumbs)]}
      />
      <SiteHeader />
      
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-5xl mx-auto relative z-10">
        <BreadcrumbNav items={breadcrumbs} />
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#151C19] mb-6 tracking-tight">
          A Digital QR Menu Built for Restaurants
        </h1>
        
        <p className="text-xl text-[#53615a] mb-10 leading-relaxed font-medium">
          Bridge physical table dining with instant digital convenience. MenusQR empowers restaurant owners to publish interactive, mobile-optimized menus that load instantly without any app download.
        </p>

        <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm mb-12 space-y-8 text-[#151C19]/80 text-lg leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-[#151C19] mb-4">What is a Digital QR Menu?</h2>
            <p>
              A digital QR menu is a touchless, digital version of your physical menu hosted online and accessible via table-mounted QR codes. When diners scan the QR code using their smartphone camera, your full menu opens in their web browser immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#151C19] mb-4">Why Modern Restaurants Are Replacing Printed Menus</h2>
            <p className="mb-4">
              Paper and laminated menus deteriorate quickly, accumulate stains, and require expensive reprint cycles whenever dish pricing or ingredients change. A digital QR menu solves operational friction by offering:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-base text-[#151C19]">
              <li><strong>Instant Price & Dish Updates:</strong> Modify pricing or mark items out-of-stock in seconds.</li>
              <li><strong>Zero Reprinting Expenses:</strong> Physical table QR codes remain permanent while content updates live.</li>
              <li><strong>Rich Visual Presentation:</strong> Showcase high-resolution dish images, dietary tags (Veg/Non-Veg), and ingredient notes.</li>
              <li><strong>Faster Table Turnover:</strong> Diners browse the menu immediately upon seating without waiting for staff.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#151C19] mb-4">How MenusQR Delivers Live Menu Control</h2>
            <p>
              With MenusQR, setting up your digital menu takes minutes. Add menu categories, upload dish photos, customize item availability, and choose from curated visual themes. Your table QR codes link to your menu URL so every edit is instantly visible to dining guests.
            </p>
          </section>

          <div className="pt-6 border-t border-gray-100 flex flex-wrap gap-4 items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#151C19]">Ready to build your digital menu?</h3>
              <p className="text-sm text-[#53615a]">Explore pricing options starting at ₹559/month (₹1,999/year).</p>
            </div>
            <Link to="/plans" className="bg-[#E8783C] text-white px-6 py-3 rounded-full font-bold hover:bg-[#d66a30] transition-colors">
              Explore Plans & Pricing
            </Link>
          </div>
        </div>

        <GeoFaqSection title="Digital QR Menu Questions & Answers" />
      </main>

      <SiteFooter />
    </div>
  );
}
