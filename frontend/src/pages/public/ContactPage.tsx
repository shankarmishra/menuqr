import SiteHeader from '../../components/marketing/SiteHeader';
import SiteFooter from '../../components/marketing/SiteFooter';
import { SEO } from '../../seo/SEO';
import BreadcrumbNav from '../../components/seo/BreadcrumbNav';
import GeoFaqSection from '../../components/seo/GeoFaqSection';
import { getBreadcrumbSchema, getOrganizationSchema } from '../../seo/structuredData';
import { Mail, ShieldCheck, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ContactPage() {
  const breadcrumbs = [{ name: 'Contact', path: '/contact' }];

  return (
    <div className="bg-[#FAFAF7] min-h-screen text-gray-900 font-sans">
      <SEO 
        title="Contact MenusQR | Customer Support & Business Inquiries"
        description="Get in touch with the MenusQR team for onboarding assistance, restaurant support, or sales inquiries."
        canonicalUrl="/contact"
        schema={[getOrganizationSchema(), getBreadcrumbSchema(breadcrumbs)]}
      />
      <SiteHeader />
      
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-5xl mx-auto">
        <BreadcrumbNav items={breadcrumbs} />
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#151C19] mb-6 tracking-tight">
          Contact MenusQR Support & Sales
        </h1>
        
        <p className="text-xl text-[#53615a] mb-10 leading-relaxed font-medium">
          Have a question about setting up your restaurant QR menu, upgrading your plan, or ordering table stands? We are here to help.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#E8783C]/10 text-[#E8783C] flex items-center justify-center mb-6">
                <Mail size={24} />
              </div>
              <h2 className="text-lg font-bold text-[#151C19] mb-2">Email Support</h2>
              <p className="text-sm text-[#53615a] mb-4">Direct customer and restaurant technical assistance.</p>
              <a href="mailto:support@menusqr.in" className="text-base font-bold text-[#E8783C] hover:underline">
                support@menusqr.in
              </a>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#151C19]/10 text-[#151C19] flex items-center justify-center mb-6">
                <Clock size={24} />
              </div>
              <h2 className="text-lg font-bold text-[#151C19] mb-2">Support Hours</h2>
              <p className="text-sm text-[#53615a]">Monday – Saturday</p>
              <p className="text-base font-bold text-[#151C19]">9:00 AM – 8:00 PM IST</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <ShieldCheck size={24} />
              </div>
              <h2 className="text-lg font-bold text-[#151C19] mb-2">Help Center</h2>
              <p className="text-sm text-[#53615a] mb-4">Read setup guides and common questions.</p>
              <Link to="/faq" className="text-base font-bold text-[#151C19] hover:underline">
                View FAQ Center &rarr;
              </Link>
            </div>
          </div>
        </div>

        <GeoFaqSection title="Frequently Asked Support Questions" />
      </main>

      <SiteFooter />
    </div>
  );
}
