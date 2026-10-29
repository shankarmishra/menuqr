import SiteHeader from '../../components/marketing/SiteHeader';
import SiteFooter from '../../components/marketing/SiteFooter';
import { SEO } from '../../seo/SEO';
import BreadcrumbNav from '../../components/seo/BreadcrumbNav';
import GeoFaqSection from '../../components/seo/GeoFaqSection';
import { getBreadcrumbSchema, getOrganizationSchema } from '../../seo/structuredData';
import { Link } from 'react-router-dom';

export default function FaqPage() {
  const breadcrumbs = [{ name: 'FAQ', path: '/faq' }];

  return (
    <div className="bg-[#FAFAF7] min-h-screen text-gray-900 font-sans relative overflow-x-clip">
      <div className="texture-indian-heritage fixed inset-0 pointer-events-none z-0" />
      <SEO 
        title="MenusQR FAQ | Frequently Asked Questions"
        description="Find answers to common questions about MenusQR digital menus, permanent QR codes, instant price updates, and direct table ordering."
        canonicalUrl="/faq"
        schema={[getOrganizationSchema(), getBreadcrumbSchema(breadcrumbs)]}
      />
      <SiteHeader />
      
      <main id="main-content" className="pt-32 pb-24 px-6 md:px-12 max-w-5xl mx-auto relative z-10">
        <BreadcrumbNav items={breadcrumbs} />
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#151C19] mb-6 tracking-tight">
          Frequently Asked Questions About MenusQR
        </h1>
        
        <p className="text-xl text-[#53615a] mb-10 leading-relaxed font-medium">
          Everything you need to know about MenusQR digital menus, table QR code stands, menu updates, and direct table ordering.
        </p>

        <GeoFaqSection title="All Common Questions" />

        <div className="bg-white p-8 rounded-3xl border border-gray-100 text-center shadow-sm mt-12">
          <h3 className="text-2xl font-bold text-[#151C19] mb-3">Still have questions?</h3>
          <p className="text-[#53615a] mb-6">Our team is ready to help you select the right digital menu plan for your restaurant.</p>
          <div className="flex justify-center gap-4">
            <Link to="/contact" className="bg-[#151C19] text-white px-6 py-3 rounded-full font-bold hover:bg-black transition-colors">
              Contact Us
            </Link>
            <Link to="/plans" className="bg-[#E8783C] text-white px-6 py-3 rounded-full font-bold hover:bg-[#d66a30] transition-colors">
              View Plans
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
