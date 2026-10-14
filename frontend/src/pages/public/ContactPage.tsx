import SiteHeader from '../../components/marketing/SiteHeader';
import SiteFooter from '../../components/marketing/SiteFooter';
import { SEO } from '../../seo/SEO';
import BreadcrumbNav from '../../components/seo/BreadcrumbNav';
import GeoFaqSection from '../../components/seo/GeoFaqSection';
import { getBreadcrumbSchema, getOrganizationSchema } from '../../seo/structuredData';
import { Mail, ShieldCheck, Clock, Phone, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ContactPage() {
  const breadcrumbs = [{ name: 'Contact', path: '/contact' }];

  return (
    <div className="bg-[#FAFAF7] min-h-screen text-gray-900 font-sans relative overflow-x-clip">
      <div className="texture-indian-heritage fixed inset-0 pointer-events-none z-0" />
      <SEO 
        title="Contact MenusQR | Customer Support & Business Inquiries"
        description="Get in touch with the MenusQR team for onboarding assistance, restaurant support, or sales inquiries."
        canonicalUrl="/contact"
        schema={[getOrganizationSchema(), getBreadcrumbSchema(breadcrumbs)]}
      />
      <SiteHeader />
      
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-5xl mx-auto relative z-10">
        <BreadcrumbNav items={breadcrumbs} />
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#151C19] mb-6 tracking-tight">
          Contact MenusQR Support & Sales
        </h1>
        
        <p className="text-xl text-[#53615a] mb-10 leading-relaxed font-medium">
          Have a question about setting up your restaurant QR menu, upgrading your plan, or ordering table stands? We are here to help.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-[#E8783C]/30 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#E8783C]/10 text-[#E8783C] flex items-center justify-center mb-5">
                <Phone size={24} />
              </div>
              <h2 className="text-lg font-bold text-[#151C19] mb-1.5">Phone & WhatsApp</h2>
              <p className="text-sm text-[#53615a] mb-4">Instant support for restaurant onboarding and queries.</p>
              <div className="space-y-2">
                <a href="tel:+918796530323" className="block text-base font-bold text-[#151C19] hover:text-[#E8783C] transition-colors">
                  +91 87965 30323
                </a>
                <a
                  href="https://wa.me/918796530323?text=Hi%20MenusQR%2C%20I%20have%20an%20inquiry%20regarding%20MenusQR"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
                >
                  <MessageCircle size={14} className="text-emerald-600" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-gray-200 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#E8783C] flex items-center justify-center mb-5">
                <Mail size={24} />
              </div>
              <h2 className="text-lg font-bold text-[#151C19] mb-1.5">Email Support</h2>
              <p className="text-sm text-[#53615a] mb-4">Direct customer and restaurant technical assistance.</p>
              <a href="mailto:support@menusqr.in" className="text-base font-bold text-[#E8783C] hover:underline">
                support@menusqr.in
              </a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-gray-200 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#151C19]/10 text-[#151C19] flex items-center justify-center mb-5">
                <Clock size={24} />
              </div>
              <h2 className="text-lg font-bold text-[#151C19] mb-1.5">Support Hours</h2>
              <p className="text-sm text-[#53615a]">Monday – Saturday</p>
              <p className="text-base font-bold text-[#151C19]">9:00 AM – 8:00 PM IST</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-gray-200 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                <ShieldCheck size={24} />
              </div>
              <h2 className="text-lg font-bold text-[#151C19] mb-1.5">Help Center</h2>
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
