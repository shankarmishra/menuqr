import { useMemo, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import MenuTemplateRenderer from '../../components/menu-builder/MenuTemplateRenderer';
import PremiumIPhoneMockup from '../../components/marketing/PremiumIPhoneMockup';
import { menuTemplates, DEMO_RESTAURANT, isTemplateDark } from '../../data/menuTemplates';
import { DeterministicDesignEngine, type DesignCompositionStrategy } from '../../components/menu-builder/design-engine';
import { AIDesignStudio } from '../app/AIDesignStudio';
import type { DesignSpecification } from '../../components/menu-builder/design-engine/types';

export default function TemplateAuditCanvas() {
  const { templateId } = useParams<{ templateId: string }>();
  const [searchParams] = useSearchParams();

  const isCompact = searchParams.get('compact') === 'true';
  const edgeCase = searchParams.get('edge') || 'none';
  const hideNav = searchParams.get('hideNav') === 'true';
  const showStudio = searchParams.get('studio') === 'true';
  const composition = searchParams.get('composition') as DesignCompositionStrategy | null;
  const [interactiveSpec, setInteractiveSpec] = useState<DesignSpecification | null>(null);

  const currentTemplate = useMemo(() => {
    return menuTemplates.find(
      (t) => t.id === templateId || t.name.toLowerCase().replace(/\s+/g, '-') === templateId
    ) || menuTemplates[0];
  }, [templateId]);

  const customSpec = useMemo(() => {
    if (!composition) return null;
    const engine = new DeterministicDesignEngine();
    const spec = engine.generateDesignSync({
      businessName: DEMO_RESTAURANT.name,
      cuisine: 'Contemporary Cuisine',
      positioning: composition === 'editorial' ? 'fine-dining' : composition === 'image-showcase' ? 'contemporary' : 'casual',
      mood: composition === 'editorial' ? 'royal-heritage' : composition === 'image-showcase' ? 'clean-editorial' : 'warm-bistro',
      hasPhotography: true,
      menuDensity: 'balanced',
      logoUrl: DEMO_RESTAURANT.logo,
      tagline: DEMO_RESTAURANT.tagline,
    });
    spec.composition = composition;
    return spec;
  }, [composition]);

  const testData = useMemo(() => {
    if (edgeCase === 'long-names') {
      return {
        restaurant: {
          name: 'The Royal Sovereign Imperial Dining Hall & Heritage Garden',
          tagline: 'Authentic 19th-Century Royal Palace Recipes Handcrafted with Fresh Spices & Saffron',
          cuisine: 'Mughal • Awadhi • Royal Rajasthani Imperial Banquet',
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
            price: 380,
            category: 'cat-2',
            dietType: 'non-veg' as const,
            available: true,
          },
        ],
      };
    }

    if (edgeCase === 'multilingual-hindi') {
      return {
        restaurant: {
          name: 'राज महल पैलेस & हेरिटेज रेस्तरां',
          tagline: 'पारंपरिक भारतीय व्यंजन एवं शाही स्वाद - Authentic Heritage Dining Since 1984',
          cuisine: 'शाही मुग़लई • राजस्थानी थाली • उत्तर भारतीय',
          phone: '+91 98290 12345',
          address: 'हवा महल मार्ग, पुराना शहर, जयपुर, राजस्थान 302002',
          logo: DEMO_RESTAURANT.logo,
        },
        categories: [
          { id: 'cat-hi-1', name: 'शुरुआती व्यंजन (STARTERS)', order: 0 },
          { id: 'cat-hi-2', name: 'शाही मुख्य व्यंजन (MAIN COURSE)', order: 1 },
          { id: 'cat-hi-3', name: 'तंदूरी रोटियां एवं बासमती (BREADS & RICE)', order: 2 },
          { id: 'cat-hi-4', name: 'पारंपरिक मिठाइयां (DESSERTS)', order: 3 },
        ],
        items: [
          {
            id: 'hi-1',
            name: 'शाही पनीर मखनी (Shahi Paneer Makhani)',
            description: 'ताज़ा मलाई पनीर, काजू एवं मगज की रेशमी ग्रेवी, असली मक्खन और केसरिया छौंक।',
            price: 320,
            halfPrice: 180,
            fullPrice: 320,
            category: 'cat-hi-2',
            dietType: 'veg' as const,
            available: true,
            isBestseller: true,
            image: DEMO_RESTAURANT.items[0].image,
          },
          {
            id: 'hi-2',
            name: 'अवाधी मुर्ग बिरयानी (Awadhi Murgh Biryani)',
            description: 'धीमी आंच पर दम किया हुआ रसीला चिकन, लंबा बासमती चावल, केसर और खुशबूदार खड़ा मसाला।',
            price: 440,
            halfPrice: 240,
            fullPrice: 440,
            category: 'cat-hi-3',
            dietType: 'non-veg' as const,
            available: true,
            isBestseller: true,
            image: DEMO_RESTAURANT.items[2].image,
          },
          {
            id: 'hi-3',
            name: 'अमृतसरी तंदूरी कुल्चा (Amritsari Tandoori Kulcha)',
            description: 'मसालेदार आलू और प्याज़ से भरा खस्ता कुल्चा, ऊपर से देसी मक्खन और अनारदाना।',
            price: 110,
            category: 'cat-hi-3',
            dietType: 'veg' as const,
            available: true,
          },
          {
            id: 'hi-4',
            name: 'केसर पिस्ता कुल्फी फालूदा (Kesar Pista Kulfi Falooda)',
            description: 'पारंपरिक मटका कुल्फी, गुलाब शरबत, चिया बीज और रेशमी फालूदा सेव।',
            price: 160,
            category: 'cat-hi-4',
            dietType: 'veg' as const,
            available: true,
            isBestseller: true,
          },
        ],
      };
    }

    if (edgeCase === 'large-menu') {
      const generatedCategories = [
        { id: 'lcat-1', name: 'APPETIZERS & CHARCUTERIE', order: 0 },
        { id: 'lcat-2', name: 'SOスープ & SALADS', order: 1 },
        { id: 'lcat-3', name: 'WOOD-FIRED PIZZAS & PASTAS', order: 2 },
        { id: 'lcat-4', name: 'PRIME ROASTS & ENTREES', order: 3 },
        { id: 'lcat-5', name: 'ARTISANAL DESSERTS & DIGESTIFS', order: 4 },
      ];

      const generatedItems = [];
      let itemCounter = 1;
      for (const cat of generatedCategories) {
        for (let i = 1; i <= 8; i++) {
          generatedItems.push({
            id: `large-item-${itemCounter}`,
            name: `${cat.name.split(' ')[0]} Specialty Dish #${i} with Fresh Herbs & Spices`,
            description: `Carefully crafted dish featuring seasonal organic ingredients, pan-seared aromatics, and reduction glaze (${cat.name}).`,
            price: 150 + itemCounter * 15,
            halfPrice: (i % 2 === 0) ? 100 + itemCounter * 10 : undefined,
            fullPrice: (i % 2 === 0) ? 180 + itemCounter * 20 : undefined,
            category: cat.id,
            dietType: (itemCounter % 3 === 0 ? 'non-veg' : itemCounter % 3 === 1 ? 'veg' : 'vegan') as 'veg' | 'non-veg' | 'vegan',
            available: itemCounter !== 13,
            isBestseller: i === 1 || i === 4,
            image: (itemCounter % 2 === 0) ? DEMO_RESTAURANT.items[0]?.image : undefined,
          });
          itemCounter++;
        }
      }

      return {
        restaurant: {
          name: 'Grand Brasserie & Multi-Floor Culinary Hall',
          tagline: 'Expansive 5-Course Artisanal All-Day Dining',
          cuisine: 'Continental • Italian • Bistro Classics',
          phone: '+91 80 2345 6789',
          address: 'Concourse Level 2, Global Galleria Mall, Bengaluru',
          logo: DEMO_RESTAURANT.logo,
        },
        categories: generatedCategories,
        items: generatedItems,
      };
    }

    return {
      restaurant: DEMO_RESTAURANT,
      categories: DEMO_RESTAURANT.categories,
      items: DEMO_RESTAURANT.items,
    };
  }, [edgeCase]);

  return (
    <div className="min-h-screen bg-[#070b09] text-white flex flex-col items-center">
      {!hideNav && (
        <header className="w-full bg-[#0d1411] border-b border-white/10 p-4 sticky top-0 z-50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/templates" className="text-xs font-mono text-[#D4AF37] hover:underline">
              ← Gallery
            </Link>
            <span className="text-white/20">|</span>
            <span className="text-sm font-bold tracking-wider uppercase font-serif text-[#FAF3E0]">
              {customSpec ? `AI Spec: ${customSpec.composition.toUpperCase()}` : currentTemplate.name}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 overflow-x-auto max-w-md py-1">
              {menuTemplates.map((t, idx) => (
                <Link
                  key={t.id}
                  to={`/audit-preview/${t.id}${isCompact ? '?compact=true' : ''}`}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap transition-colors ${
                    t.id === currentTemplate.id && !composition
                      ? 'bg-[#D4AF37] text-black font-bold'
                      : 'text-white/60 hover:text-white bg-white/5'
                  }`}
                >
                  {String(idx + 1).padStart(2, '0')}. {t.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/audit-preview/${currentTemplate.id}?compact=${!isCompact}${edgeCase !== 'none' ? `&edge=${edgeCase}` : ''}${composition ? `&composition=${composition}` : ''}`}
              className={`px-2 py-1 rounded font-mono text-[11px] border ${
                isCompact
                  ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300'
                  : 'border-white/20 text-white/60 hover:text-white'
              }`}
            >
              {isCompact ? 'Phone Mockup [ON]' : 'Full Viewport'}
            </Link>

            <Link
              to={`/audit-preview/${currentTemplate.id}?edge=${edgeCase === 'long-names' ? 'none' : 'long-names'}${isCompact ? '&compact=true' : ''}${composition ? `&composition=${composition}` : ''}`}
              className={`px-2 py-1 rounded font-mono text-[11px] border ${
                edgeCase === 'long-names'
                  ? 'border-purple-400 bg-purple-950/60 text-purple-300'
                  : 'border-white/20 text-white/60 hover:text-white'
              }`}
            >
              {edgeCase === 'long-names' ? 'Edge: Long Names [ON]' : 'Long Names'}
            </Link>

            <Link
              to={`/audit-preview/${currentTemplate.id}?edge=${edgeCase === 'missing-fields' ? 'none' : 'missing-fields'}${isCompact ? '&compact=true' : ''}${composition ? `&composition=${composition}` : ''}`}
              className={`px-2 py-1 rounded font-mono text-[11px] border ${
                edgeCase === 'missing-fields'
                  ? 'border-rose-400 bg-rose-950/60 text-rose-300'
                  : 'border-white/20 text-white/60 hover:text-white'
              }`}
            >
              {edgeCase === 'missing-fields' ? 'Edge: Missing Fields [ON]' : 'Missing Fields'}
            </Link>

            <div className="h-4 w-px bg-white/20" />

            <Link
              to={`/audit-preview/${currentTemplate.id}?composition=editorial${isCompact ? '&compact=true' : ''}`}
              className={`px-2 py-1 rounded font-mono text-[11px] border ${
                composition === 'editorial'
                  ? 'border-amber-400 bg-amber-950/60 text-amber-300'
                  : 'border-white/20 text-white/60 hover:text-white'
              }`}
            >
              Spec: Editorial
            </Link>

            <Link
              to={`/audit-preview/${currentTemplate.id}?composition=image-showcase${isCompact ? '&compact=true' : ''}`}
              className={`px-2 py-1 rounded font-mono text-[11px] border ${
                composition === 'image-showcase'
                  ? 'border-emerald-400 bg-emerald-950/60 text-emerald-300'
                  : 'border-white/20 text-white/60 hover:text-white'
              }`}
            >
              Spec: Image Showcase
            </Link>

            <Link
              to={`/audit-preview/${currentTemplate.id}?composition=compact-bistro${isCompact ? '&compact=true' : ''}`}
              className={`px-2 py-1 rounded font-mono text-[11px] border ${
                composition === 'compact-bistro'
                  ? 'border-sky-400 bg-sky-950/60 text-sky-300'
                  : 'border-white/20 text-white/60 hover:text-white'
              }`}
            >
              Spec: Compact Bistro
            </Link>

            <Link
              to={`/audit-preview/${currentTemplate.id}?studio=true`}
              className={`px-2 py-1 rounded font-mono text-[11px] border ${
                showStudio
                  ? 'border-[#e8783c] bg-[#e8783c]/20 text-[#e8783c] font-bold'
                  : 'border-white/20 text-white/60 hover:text-white'
              }`}
            >
              ✦ AI Studio Interactive
            </Link>
          </div>
        </header>
      )}

      {showStudio ? (
        <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 bg-[#121815] border border-[#2a3832] rounded-2xl p-6 shadow-xl">
            <AIDesignStudio
              businessName={DEMO_RESTAURANT.name}
              tagline={DEMO_RESTAURANT.tagline}
              logoUrl={DEMO_RESTAURANT.logo}
              currentSpec={interactiveSpec || customSpec}
              onSpecChange={setInteractiveSpec}
              hasPhotography={true}
              itemCount={testData.items.length}
            />
          </div>
          <div className="lg:col-span-6 sticky top-8 flex justify-center">
            <PremiumIPhoneMockup
              className="!w-[340px] shadow-2xl"
              badgeText={(interactiveSpec || customSpec) ? `AI ${(interactiveSpec || customSpec)?.composition}` : 'Live Preview'}
              statusBarTheme={isTemplateDark(currentTemplate) ? 'light' : 'dark'}
              homeIndicatorTheme={isTemplateDark(currentTemplate) ? 'light' : 'dark'}
              screenStyle={{ backgroundColor: (interactiveSpec || customSpec) ? (interactiveSpec || customSpec)?.colors.bg : currentTemplate.colors.bg }}
            >
              <div data-audit-target={currentTemplate.id} className="h-full w-full overflow-y-auto">
                <MenuTemplateRenderer
                  templateId={currentTemplate.id}
                  accentConfiguration={(interactiveSpec || customSpec) || undefined}
                  restaurant={testData.restaurant}
                  categories={testData.categories}
                  items={testData.items}
                  compact={true}
                />
              </div>
            </PremiumIPhoneMockup>
          </div>
        </main>
      ) : (
        <main className="w-full flex justify-center">
          {isCompact ? (
            <div className="my-8 flex justify-center">
              <PremiumIPhoneMockup
                className="!w-[320px] sm:!w-[340px] shadow-2xl"
                badgeText={customSpec ? `AI ${customSpec.composition}` : 'Audit Canvas'}
                statusBarTheme={isTemplateDark(currentTemplate) ? 'light' : 'dark'}
                homeIndicatorTheme={isTemplateDark(currentTemplate) ? 'light' : 'dark'}
                screenStyle={{ backgroundColor: customSpec ? customSpec.colors.bg : currentTemplate.colors.bg }}
                screenClassName=""
              >
                <div data-audit-target={currentTemplate.id} className="h-full w-full overflow-y-auto">
                  <MenuTemplateRenderer
                    templateId={currentTemplate.id}
                    accentConfiguration={customSpec || undefined}
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
                accentConfiguration={customSpec || undefined}
                restaurant={testData.restaurant}
                categories={testData.categories}
                items={testData.items}
                compact={false}
              />
            </div>
          )}
        </main>
      )}
    </div>
  );
}
