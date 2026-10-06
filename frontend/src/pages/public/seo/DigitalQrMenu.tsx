import SiteHeader from '../../../components/marketing/SiteHeader';
import SiteFooter from '../../../components/marketing/SiteFooter';
import { SEO } from '../../../seo/SEO';

export default function DigitalQrMenu() {
  return (
    <div className="bg-[#FAFAF7] min-h-screen text-gray-900 font-sans">
      <SEO 
        title="Digital QR Menu for Restaurants | MenusQR"
        description="Discover how a digital QR menu can transform your restaurant. Learn how MenusQR helps you replace printed menus with a smart, easy-to-update QR ordering system."
        canonicalUrl="/digital-qr-menu"
      />
      <SiteHeader />
      
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-[#151C19] mb-8">What is a Digital QR Menu?</h1>
        
        <div className="prose prose-lg text-[#151C19]/80">
          <p className="mb-6">
            A digital QR menu allows restaurants, cafes, and hotels to share their food and beverage offerings directly on a customer's smartphone. Instead of waiting for a physical menu, guests simply scan a QR code placed on their table.
          </p>
          
          <h2 className="text-2xl font-bold text-[#151C19] mt-12 mb-4">How MenusQR Works</h2>
          <p className="mb-6">
            With MenusQR, the process is seamless. You create your menu online, categorize your items, and set your prices. We generate a permanent, high-quality QR code for your tables. When a customer scans it, they instantly see your beautiful, mobile-optimized menu—no app download required.
          </p>

          <h2 className="text-2xl font-bold text-[#151C19] mt-12 mb-4">Printed Menu vs QR Menu</h2>
          <p className="mb-6">
            Printed menus get dirty, tear easily, and are expensive to reprint every time a price changes or a dish becomes unavailable. A digital QR menu solves all these problems. You can mark an item as "sold out" in seconds, update pricing instantly, and even change the entire visual theme of your menu without ever replacing the physical QR code on the table.
          </p>

          <h2 className="text-2xl font-bold text-[#151C19] mt-12 mb-4">Restaurant Use Cases</h2>
          <p className="mb-6">
            Whether you run a busy fine-dining restaurant, a quick-service cafe, or a late-night dhaba, a digital menu adapts to your needs. MenusQR supports dietary tags (like Veg/Non-Veg), detailed descriptions, and high-quality images to help upsell your best dishes.
          </p>

          <div className="mt-16 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
            <h3 className="text-2xl font-bold text-[#151C19] mb-4">Ready to upgrade your restaurant?</h3>
            <p className="mb-8">Join thousands of restaurants using MenusQR today.</p>
            <a href="/plans" className="inline-block bg-[#E8783C] text-white px-8 py-3 rounded-full font-bold hover:bg-[#d66a30] transition-colors">
              Explore Pricing Plans
            </a>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
