import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Smartphone, 
  Monitor, 
  ExternalLink, 
  Sparkles,
  Palette,
  Type, 
  ArrowLeft 
} from 'lucide-react';
import { menuTemplates, DEMO_RESTAURANT, isTemplateDark } from '../../data/menuTemplates';
import MenuTemplateRenderer from '../../components/menu-builder/MenuTemplateRenderer';
import PremiumIPhoneMockup from '../../components/marketing/PremiumIPhoneMockup';
import IsolatedMobileFrame from '../../components/menu-builder/IsolatedMobileFrame';

export default function TemplateOnePreviewPage() {
  const template = menuTemplates[0]; // Template #1: Heritage Parchment Atelier (rajasthani-heritage)
  const [viewMode, setViewMode] = useState<'phone' | 'full'>('phone');
  const [mockCart, setMockCart] = useState<Array<{ id: string; name: string; price: number; quantity: number }>>([]);
  const isDark = isTemplateDark(template);

  const handleAddToCart = (item: { id: string; name: string; price?: number; halfPrice?: number }, priceStr?: string, variant?: string) => {
    const parsedPrice = priceStr ? Number(priceStr.replace(/[^0-9.]/g, '')) : Number(item.price || item.halfPrice || 0);
    const cartItemId = variant ? `${item.id}-${variant}` : item.id;
    const cartItemName = variant ? `${item.name} (${variant})` : item.name;
    setMockCart((prev) => {
      const existing = prev.find((i) => i.id === cartItemId);
      if (existing) {
        return prev.map((i) => (i.id === cartItemId ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { id: cartItemId, name: cartItemName, price: parsedPrice, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (itemId: string, variant?: string) => {
    const cartItemId = variant ? `${itemId}-${variant}` : itemId;
    setMockCart((prev) => {
      const existing = prev.find((i) => i.id === cartItemId);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter((i) => i.id !== cartItemId);
      }
      return prev.map((i) => (i.id === cartItemId ? { ...i, quantity: i.quantity - 1 } : i));
    });
  };

  const getItemQuantity = (itemId: string, variant?: string) => {
    const cartItemId = variant ? `${itemId}-${variant}` : itemId;
    return mockCart.find((i) => i.id === cartItemId)?.quantity || 0;
  };

  return (
    <div className="min-h-screen bg-[#0d1311] text-white flex flex-col">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#151c19]/90 backdrop-blur-md border-b border-[#25332d] px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/templates"
            className="p-1.5 rounded-lg bg-[#1f2924] hover:bg-[#2a3832] text-[#849a90] hover:text-white transition-colors"
            title="Back to all templates"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#e8783c]/15 text-[#e8783c] border border-[#e8783c]/20">
                Template #1 of 12
              </span>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {template.name}
              </h1>
            </div>
            <p className="text-xs text-[#849a90] hidden sm:block">
              {template.subtitle}
            </p>
          </div>
        </div>

        {/* View Controls & Action */}
        <div className="flex items-center gap-2.5">
          {/* Device Switcher */}
          <div className="flex items-center bg-[#0d1311] p-1 rounded-xl border border-[#25332d]">
            <button
              type="button"
              onClick={() => setViewMode('phone')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'phone'
                  ? 'bg-[#e8783c] text-white shadow'
                  : 'text-[#849a90] hover:text-white'
              }`}
            >
              <Smartphone size={13} /> Phone View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('full')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'full'
                  ? 'bg-[#e8783c] text-white shadow'
                  : 'text-[#849a90] hover:text-white'
              }`}
            >
              <Monitor size={13} /> Full Screen
            </button>
          </div>

          {/* Full Customer Menu Direct Link */}
          <Link
            to="/menu/template-1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#22302a] hover:bg-[#2a3c34] text-xs font-semibold text-white border border-[#32453c] transition-colors"
          >
            <span>Live Diner Link</span>
            <ExternalLink size={12} className="text-[#e8783c]" />
          </Link>
        </div>
      </header>

      {/* Main Content Stage */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
        {/* Ambient Decorative Glow */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none opacity-20 -top-40 left-1/2 -translate-x-1/2"
          style={{ backgroundColor: template.colors.accent }}
        />

        {viewMode === 'phone' ? (
          /* Phone Mockup Container (Isolated Phone Frame) */
          <div className="w-full flex flex-col items-center py-4">
            <PremiumIPhoneMockup
              className="!w-[360px] sm:!w-[385px] max-w-full shadow-2xl"
              badgeText="Heritage Parchment Atelier"
              statusBarTheme={isDark ? 'light' : 'dark'}
              homeIndicatorTheme={isDark ? 'light' : 'dark'}
              screenStyle={{ backgroundColor: template.colors.bg }}
            >
              <IsolatedMobileFrame backgroundColor={template.colors.bg}>
                <div className="h-full w-full overflow-y-auto">
                  <MenuTemplateRenderer
                    templateId={template.id}
                    restaurant={{
                      name: DEMO_RESTAURANT.name,
                      tagline: DEMO_RESTAURANT.tagline,
                      cuisine: DEMO_RESTAURANT.cuisine,
                      phone: DEMO_RESTAURANT.phone,
                      address: DEMO_RESTAURANT.address,
                      logo: DEMO_RESTAURANT.logo,
                      website: 'www.menusqr.in',
                      instagram: '@bukhara_delhi',
                    }}
                    categories={DEMO_RESTAURANT.categories}
                    items={DEMO_RESTAURANT.items as any}
                    compact={false}
                    onAddToCart={handleAddToCart}
                    onRemoveFromCart={handleRemoveFromCart}
                    getItemQuantity={getItemQuantity}
                    isPremium={true}
                  />
                </div>
              </IsolatedMobileFrame>
            </PremiumIPhoneMockup>

            {/* Template Specs Bar */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-[#849a90]">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#151c19] border border-[#25332d]">
                <Type size={12} className="text-[#e8783c]" /> Heading: <strong className="text-white">Cinzel Serif</strong>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#151c19] border border-[#25332d]">
                <Palette size={12} className="text-[#e8783c]" /> Parchment: <strong className="text-white">#F7EBD7</strong>
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#151c19] border border-[#25332d]">
                <Sparkles size={12} className="text-[#e8783c]" /> Terracotta Accent: <strong className="text-white">#D76C3C</strong>
              </span>
            </div>
          </div>
        ) : (
          /* Full Width Responsive View */
          <div className="w-full max-w-4xl rounded-2xl overflow-hidden border border-[#25332d] shadow-2xl bg-[#FCF5E9]">
            <MenuTemplateRenderer
              templateId={template.id}
              restaurant={{
                name: DEMO_RESTAURANT.name,
                tagline: DEMO_RESTAURANT.tagline,
                cuisine: DEMO_RESTAURANT.cuisine,
                phone: DEMO_RESTAURANT.phone,
                address: DEMO_RESTAURANT.address,
                logo: DEMO_RESTAURANT.logo,
              }}
              categories={DEMO_RESTAURANT.categories}
              items={DEMO_RESTAURANT.items as any}
              compact={false}
              onAddToCart={handleAddToCart}
              onRemoveFromCart={handleRemoveFromCart}
              getItemQuantity={getItemQuantity}
              isPremium={true}
            />
          </div>
        )}
      </main>
    </div>
  );
}
