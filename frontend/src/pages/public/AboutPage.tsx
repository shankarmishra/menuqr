import SiteHeader from '../../components/marketing/SiteHeader';
import SiteFooter from '../../components/marketing/SiteFooter';
import { SEO } from '../../seo/SEO';
import BreadcrumbNav from '../../components/seo/BreadcrumbNav';
import GeoFaqSection from '../../components/seo/GeoFaqSection';
import { getBreadcrumbSchema, getOrganizationSchema } from '../../seo/structuredData';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  const breadcrumbs = [{ name: 'About', path: '/about' }];

  return (
    <div className="bg-[#FAFAF7] min-h-screen text-gray-900 font-sans">
      <SEO 
        title="About MenusQR | Digital Menu Platform for Restaurants"
        description="MenusQR is dedicated to simplifying restaurant operations through permanent QR codes and live digital menu management."
        canonicalUrl="/about"
        schema={[getOrganizationSchema(), getBreadcrumbSchema(breadcrumbs)]}
      />
      <SiteHeader />
      
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-5xl mx-auto">
        <BreadcrumbNav items={breadcrumbs} />
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#151C19] mb-6 tracking-tight">
          About MenusQR
        </h1>
        
        <p className="text-xl text-[#53615a] mb-10 leading-relaxed font-medium">
          MenusQR is building the modern digital menu infrastructure for food businesses. We empower restaurant owners to manage physical dining spaces with permanent QR code stands and real-time cloud menu control.
        </p>

        <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm mb-12 space-y-8 text-[#151C19]/80 text-lg leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-[#151C19] mb-4">Our Mission</h2>
            <p>
              We believe restaurant operations should be frictionless. Physical printed menus create constant maintenance overhead: prices change, ingredients fluctuate, and paper menus degrade. MenusQR replaces this friction with permanent table QR technology—print your table QR stands once, and update your menu live whenever needed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#151C19] mb-4">Why Restaurants Choose MenusQR</h2>
            <ul className="list-disc pl-6 space-y-2 text-base text-[#151C19]">
              <li><strong>Zero App Download Requirement:</strong> Diners scan standard phone cameras and view your menu instantly in their web browser.</li>
              <li><strong>Permanent QR Guarantee:</strong> Your table codes never change when you modify prices or dish availability.</li>
              <li><strong>Direct Table QR Ordering:</strong> Upgrade to Premium to receive orders directly from table guests to your kitchen reception screen.</li>
              <li><strong>Transparent Pricing:</strong> Simple yearly plans starting at ₹999/year with zero hidden fees.</li>
            </ul>
          </section>

          <div className="pt-6 border-t border-gray-100 flex flex-wrap gap-4 items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#151C19]">Have questions or need assistance?</h3>
              <p className="text-sm text-[#53615a]">Reach out to our dedicated support team.</p>
            </div>
            <div className="flex gap-3">
              <Link to="/contact" className="bg-[#151C19] text-white px-6 py-3 rounded-full font-bold hover:bg-black transition-colors">
                Contact Support
              </Link>
              <Link to="/plans" className="bg-[#E8783C] text-white px-6 py-3 rounded-full font-bold hover:bg-[#d66a30] transition-colors">
                View Plans
              </Link>
            </div>
          </div>
        </div>

        <GeoFaqSection title="MenusQR Knowledge Base" />
      </main>

      <SiteFooter />
    </div>
  );
}
