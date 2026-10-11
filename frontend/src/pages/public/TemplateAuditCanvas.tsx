import { useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import MenuTemplateRenderer from '../../components/menu-builder/MenuTemplateRenderer';
import PremiumIPhoneMockup from '../../components/marketing/PremiumIPhoneMockup';
import { menuTemplates, DEMO_RESTAURANT, isTemplateDark } from '../../data/menuTemplates';

export default function TemplateAuditCanvas() {
  const { templateId } = useParams<{ templateId: string }>();
  const [searchParams] = useSearchParams();

  const isCompact = searchParams.get('compact') === 'true';
  const edgeCase = searchParams.get('edge') || 'none';
  const hideNav = searchParams.get('hideNav') === 'true';

  const currentTemplate = useMemo(() => {
    return menuTemplates.find(
      (t) => t.id === templateId || t.name.toLowerCase().replace(/\s+/g, '-') === templateId
    ) || menuTemplates[0];
  }, [templateId]);

  const testData = useMemo(() => {
    if (edgeCase === 'long-names') {
      return {
        restaurant: {
          name: 'The Royal Sovereign Imperial Dining Hall & Heritage Garden',
          tagline: 'Authentic 19th-Century Royal Palace Recipes Handcrafted with Fresh Spices & Saffron',
          cuisine: 'Mughal • Awadhi • Royal Rajasthani Imperial Banquet',
          phone: '+91 98765 43210',
          address: 'Heritage Palace Arcade, 4th Floor, Indiranagar High Street, Bengaluru, Karnataka',
          logo: DEMO_RESTAURANT.logo,
        },
        categories: [
          { id: 'cat-1', name: 'SIGNATURE IMPERIAL TANDOORI STARTERS & KEBABS', order: 0 },
          { id: 'cat-2', name: 'ROYAL MAIN COURSES & SLOW-SIMMERED SPECIALTIES', order: 1 },
          { id: 'cat-3', name: 'HAND-STRETCHED ARTISANAL TANDOORI BREADS & BASMATI', order: 2 },
          { id: 'cat-4', name: 'SWEET DELICACIES, COLD DESSERTS & BOTANICAL INFUSIONS', order: 3 },
        ],
        items: [
          {
            id: 'long-1',
            name: 'Charcoal Smoked Himalayan Paneer Tikka Royale with Mint & Pomegranate Caviar Reduction',
            description: 'Organic high-altitude malai cottage cheese, slow charcoal fire-smoked, spiced Greek hung curd, dried pomegranate reduction, served with baby radish carpaccio and house mint chutney.',
            price: 495,
            halfPrice: 280,
            fullPrice: 495,
            category: 'cat-1',
            dietType: 'veg' as const,
            available: true,
            isBestseller: true,
            image: DEMO_RESTAURANT.items[0].image,
          },
          {
            id: 'long-2',
            name: 'Awadhi Nizami Slow-Roasted Cardamom Chicken Seekh with Charred Bell Pepper Fondant',
            description: 'Minced chicken thigh meat infused with royal Awadhi garam masala, cardamom pearls, enveloped in flame-charred bell pepper puree with paper-thin roomali wrap.',
            price: 540,
            category: 'cat-1',
            dietType: 'non-veg' as const,
            available: true,
            image: DEMO_RESTAURANT.items[1].image,
          },
          {
            id: 'long-3',
            name: 'Twenty-Four Hour Velvety Dal Makhani Simmered Over Smoldering Charcoal Embers',
            description: 'Slow-simmered whole black urad lentils infused with white churned butter, organic tomato reduction, and roasted kasoori methi dust.',
            price: 395,
            category: 'cat-2',
            dietType: 'veg' as const,
            available: true,
            isBestseller: true,
            image: DEMO_RESTAURANT.items[4].image,
          },
          {
            id: 'long-4',
            name: 'Kashmiri Imperial Baby Lamb Shank Rogan Josh with Saffron-Infused Mawa Gravy',
            description: 'Tender free-range baby lamb shank braised for 8 hours with Kashmiri ratanjot bark, ground shallots, and fragrant hand-picked saffron threads.',
            price: 680,
            category: 'cat-2',
            dietType: 'non-veg' as const,
            available: true,
            image: DEMO_RESTAURANT.items[5]?.image,
          },
        ],
      };
    }

    if (edgeCase === 'missing-fields') {
      return {
        restaurant: {
          name: 'CAFE MINIMAL',
          tagline: undefined,
          cuisine: undefined,
          phone: undefined,
          address: undefined,
          logo: undefined,
        },
        categories: [
          { id: 'cat-1', name: 'MORNING', order: 0 },
          { id: 'cat-2', name: 'AFTERNOON', order: 1 },
        ],
        items: [
          {
            id: 'miss-1',
            name: 'Double Shot Espresso',
            description: undefined,
            price: 180,
            category: 'cat-1',
            dietType: 'veg' as const,
            available: true,
          },
          {
            id: 'miss-2',
            name: 'Butter Croissant',
            description: undefined,
            price: 140,
            category: 'cat-1',
            dietType: 'veg' as const,
            available: true,
          },
          {
            id: 'miss-3',
            name: 'Avocado Tartine',
            description: undefined,
            price: 320,
            category: 'cat-2',
            dietType: 'vegan' as const,
            available: true,
          },
          {
            id: 'miss-4',
            name: 'Smoked Salmon Toast',
            description: undefined,
            price: 420,
            category: 'cat-2',
            dietType: 'non-veg' as const,
            available: true,
          },
        ],
      };
    }

    // Default: DEMO_RESTAURANT
    return {
      restaurant: DEMO_RESTAURANT,
      categories: DEMO_RESTAURANT.categories,
      items: DEMO_RESTAURANT.items,
    };
  }, [edgeCase]);

  return (
    <div className="min-h-screen bg-neutral-900 text-white font-sans">
      {!hideNav && (
        <header className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-white/10 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-mono text-amber-400 font-bold tracking-wider">VISUAL AUDIT CANVAS</span>
            <span className="text-white/40">|</span>
            <span className="font-semibold text-white/90">{currentTemplate.name}</span>
            <span className="text-white/40 font-mono text-[11px]">({currentTemplate.id})</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full">
            {menuTemplates.map((t, idx) => (
              <Link
                key={t.id}
                to={`/audit-preview/${t.id}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
                className={`px-2 py-1 rounded text-[11px] font-mono transition-colors shrink-0 ${
                  t.id === currentTemplate.id
                    ? 'bg-amber-500 text-black font-bold'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {String(idx + 1).padStart(2, '0')}. {t.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/audit-preview/${currentTemplate.id}?compact=${!isCompact}${edgeCase !== 'none' ? `&edge=${edgeCase}` : ''}`}
              className={`px-2 py-1 rounded font-mono text-[11px] border ${
                isCompact
                  ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300'
                  : 'border-white/20 text-white/60 hover:text-white'
              }`}
            >
              {isCompact ? 'Phone Mockup Mode (compact=true)' : 'Full Viewport Mode (compact=false)'}
            </Link>

            <Link
              to={`/audit-preview/${currentTemplate.id}?edge=${edgeCase === 'long-names' ? 'none' : 'long-names'}${isCompact ? '&compact=true' : ''}`}
              className={`px-2 py-1 rounded font-mono text-[11px] border ${
                edgeCase === 'long-names'
                  ? 'border-purple-400 bg-purple-950/60 text-purple-300'
                  : 'border-white/20 text-white/60 hover:text-white'
              }`}
            >
              {edgeCase === 'long-names' ? 'Edge: Long Names [ON]' : 'Edge: Long Names'}
            </Link>

            <Link
              to={`/audit-preview/${currentTemplate.id}?edge=${edgeCase === 'missing-fields' ? 'none' : 'missing-fields'}${isCompact ? '&compact=true' : ''}`}
              className={`px-2 py-1 rounded font-mono text-[11px] border ${
                edgeCase === 'missing-fields'
                  ? 'border-rose-400 bg-rose-950/60 text-rose-300'
                  : 'border-white/20 text-white/60 hover:text-white'
              }`}
            >
              {edgeCase === 'missing-fields' ? 'Edge: Missing Fields [ON]' : 'Edge: Missing Fields'}
            </Link>
          </div>
        </header>
      )}

      <main className="w-full flex justify-center">
        {isCompact ? (
          <div className="my-8 flex justify-center">
            <PremiumIPhoneMockup
              className="!w-[320px] sm:!w-[340px] shadow-2xl"
              badgeText="Audit Canvas"
              statusBarTheme={isTemplateDark(currentTemplate) ? 'light' : 'dark'}
              homeIndicatorTheme={isTemplateDark(currentTemplate) ? 'light' : 'dark'}
              screenStyle={{ backgroundColor: currentTemplate.colors.bg }}
              screenClassName=""
            >
              <div data-audit-target={currentTemplate.id} className="h-full w-full overflow-y-auto">
                <MenuTemplateRenderer
                  templateId={currentTemplate.id}
                  restaurant={testData.restaurant}
                  categories={testData.categories}
                  items={testData.items}
                  compact={true}
                />
              </div>
            </PremiumIPhoneMockup>
          </div>
        ) : (
          <div data-audit-target={currentTemplate.id} className="w-full">
            <MenuTemplateRenderer
              templateId={currentTemplate.id}
              restaurant={testData.restaurant}
              categories={testData.categories}
              items={testData.items}
              compact={false}
            />
          </div>
        )}
      </main>
    </div>
  );
}
