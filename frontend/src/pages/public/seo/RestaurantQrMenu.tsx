import SiteHeader from '../../../components/marketing/SiteHeader';
import SiteFooter from '../../../components/marketing/SiteFooter';
import { SEO } from '../../../seo/SEO';

export default function RestaurantQrMenu() {
  return (
    <div className="bg-[#FAFAF7] min-h-screen text-gray-900 font-sans">
      <SEO 
        title="Restaurant QR Menu | Digital Menu for Restaurants | MenusQR"
        description="Upgrade your restaurant with a permanent QR menu. Showcase your food beautifully, update prices instantly, and offer table ordering with MenusQR Premium."
        canonicalUrl="/restaurant-qr-menu"
      />
      <SiteHeader />
      
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-[#151C19] mb-8">The Ultimate Restaurant QR Menu</h1>
        
        <div className="prose prose-lg text-[#151C19]/80">
          <p className="mb-6">
            Running a modern restaurant requires agility. A restaurant QR menu is no longer just a digital PDF; it's an interactive experience that helps you serve guests faster, reduce printing costs, and increase order sizes.
          </p>
          
          <h2 className="text-2xl font-bold text-[#151C19] mt-12 mb-4">Table QR Codes Built for Hospitality</h2>
          <p className="mb-6">
            MenusQR provides permanent table QR codes. This means you print your table stands once. When you need to change your menu, update pricing, or switch to a special holiday theme, the physical QR code on the table remains exactly the same.
          </p>

          <h2 className="text-2xl font-bold text-[#151C19] mt-12 mb-4">Beautiful Menu Browsing</h2>
          <p className="mb-6">
            Your food deserves to look great. With our premium templates, your restaurant QR menu becomes a visual feast. Guests can browse by category, view high-resolution images of your dishes, and easily identify dietary preferences like vegetarian, vegan, or gluten-free options.
          </p>

          <h2 className="text-2xl font-bold text-[#151C19] mt-12 mb-4">Premium Direct Table Ordering</h2>
          <p className="mb-6">
            Want to increase efficiency? With the MenusQR Premium plan, your restaurant QR menu transforms into a complete ordering system. Guests can select items, customize their orders, and send them directly to your kitchen or bar—all without waiting for a server to take their order.
          </p>

          <div className="mt-16 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
            <h3 className="text-2xl font-bold text-[#151C19] mb-4">Get your Restaurant QR Menu</h3>
            <p className="mb-8">Set up your digital menu in less than 10 minutes.</p>
            <a href="/plans" className="inline-block bg-[#E8783C] text-white px-8 py-3 rounded-full font-bold hover:bg-[#d66a30] transition-colors">
              View Plans & Pricing
            </a>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
