import SiteHeader from '../../components/marketing/SiteHeader';
import SiteFooter from '../../components/marketing/SiteFooter';
import { SEO } from '../../seo/SEO';
import BreadcrumbNav from '../../components/seo/BreadcrumbNav';
import GeoFaqSection from '../../components/seo/GeoFaqSection';
import { getBreadcrumbSchema, getHowToSchema, getOrganizationSchema } from '../../seo/structuredData';
import { Link } from 'react-router-dom';

export default function HowItWorksPage() {
  const breadcrumbs = [{ name: 'How It Works', path: '/how-it-works' }];

  return (
    <div className="bg-[#FAFAF7] min-h-screen text-gray-900 font-sans relative overflow-x-clip">
      <div className="texture-indian-heritage fixed inset-0 pointer-events-none z-0" />
      <SEO 
        title="How MenusQR Works | Permanent QR Restaurant Menu"
        description="Learn how MenusQR connects permanent physical QR code stands with real-time digital menu management for your restaurant in 3 easy steps."
        canonicalUrl="/how-it-works"
        schema={[getOrganizationSchema(), getBreadcrumbSchema(breadcrumbs), getHowToSchema('How to launch a MenusQR digital menu', 'Create a digital QR menu, print a permanent QR code and update the menu live without reprinting.', [{ name: 'Create your menu', text: 'Log into your MenusQR dashboard and add dish categories, prices, ingredients, dietary indicators (Veg/Non-Veg) and food photos.' }, { name: 'Download your permanent QR', text: 'Generate a high-resolution SVG or PNG table QR code and print it on acrylic table stands, wooden blocks or table stickers.' }, { name: 'Update live anytime', text: 'Change prices or mark an item sold out in your dashboard. The physical table QR code stays unchanged forever.' }])]}
      />
      <SiteHeader />
      
      <main id="main-content" className="pt-32 pb-24 px-6 md:px-12 max-w-5xl mx-auto relative z-10">
        <BreadcrumbNav items={breadcrumbs} />
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#151C19] mb-6 tracking-tight">
          How MenusQR Works for Your Restaurant
        </h1>
        
        <p className="text-xl text-[#53615a] mb-10 leading-relaxed font-medium">
          MenusQR makes digital menu adoption effortless. Follow three simple steps to launch your permanent table QR menu and manage updates with zero hassle.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#E8783C]/10 text-[#E8783C] font-black text-xl flex items-center justify-center mb-6">
                1
              </div>
              <h2 className="text-xl font-bold text-[#151C19] mb-3">Create Your Menu</h2>
              <p className="text-sm text-[#53615a] leading-relaxed">
                Log into your MenusQR dashboard. Input your dish categories, prices, ingredients, dietary indicators (Veg/Non-Veg), and food photos.
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#E8783C]/10 text-[#E8783C] font-black text-xl flex items-center justify-center mb-6">
                2
              </div>
              <h2 className="text-xl font-bold text-[#151C19] mb-3">Download Permanent QR</h2>
              <p className="text-sm text-[#53615a] leading-relaxed">
                Generate high-resolution SVG or PNG table QR codes. Print them on acrylic table stands, wooden blocks, or table stickers.
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#E8783C]/10 text-[#E8783C] font-black text-xl flex items-center justify-center mb-6">
                3
              </div>
              <h2 className="text-xl font-bold text-[#151C19] mb-3">Update Live Anytime</h2>
              <p className="text-sm text-[#53615a] leading-relaxed">
                Need to change prices or mark an item sold out? Make updates in your dashboard. The physical table QR code stays unchanged forever.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#151C19] text-white p-8 md:p-10 rounded-3xl mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">Ready to transform your dining room?</h3>
            <p className="text-white/70">Pick a plan and publish your digital menu in under 10 minutes.</p>
          </div>
          <Link to="/plans" className="bg-[#E8783C] text-white px-8 py-3.5 rounded-full font-bold hover:bg-[#d66a30] transition-colors whitespace-nowrap">
            View Plans & Pricing
          </Link>
        </div>

        <GeoFaqSection title="Implementation FAQs" />
      </main>

      <SiteFooter />
    </div>
  );
}
