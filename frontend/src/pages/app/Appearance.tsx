import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Eye, Palette, Save, Lock, Zap, Smartphone, Monitor, Sparkles } from 'lucide-react';
import MenuTemplateRenderer from '../../components/menu-builder/MenuTemplateRenderer';
import PremiumIPhoneMockup from '../../components/marketing/PremiumIPhoneMockup';
import { menuTemplates, isTemplateDark, isColorDark } from '../../data/menuTemplates';
import { useToast } from '../../components/feedback/ToastProvider';
import { 
  getAppearance, 
  getMenu, 
  getProfile, 
  getSubscription, 
  updateAppearance, 
  type AppMenuData, 
  type AppProfile, 
  type AppSubscriptionData 
} from './appStore';
import { AIDesignStudio } from './AIDesignStudio';
import { 
  validateDesignSpecification, 
  type DesignSpecification 
} from '../../components/menu-builder/design-engine/types';

export default function Appearance() {
  const [menu, setMenu] = useState<AppMenuData | null>(null);
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [sub, setSub] = useState<AppSubscriptionData | null>(null);
  const [templateId, setTemplateId] = useState('royal-maharaja');
  const [customDesignSpec, setCustomDesignSpec] = useState<DesignSpecification | null>(null);
  const [hasSavedSpec, setHasSavedSpec] = useState(false);
  const [activeMode, setActiveMode] = useState<'ai-studio' | 'classic'>('ai-studio');
  const [previewMode, setPreviewMode] = useState<'phone' | 'desktop'>('phone');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const showToast = useToast();

  useEffect(() => {
    let current = true;
    Promise.all([getMenu(), getProfile(), getAppearance(), getSubscription()]).then(([menuData, profileData, appearance, subData]) => {
      if (!current) return;
      setMenu(menuData);
      setProfile(profileData);
      setTemplateId(appearance.templateId || 'royal-maharaja');
      setSub(subData);

      const savedSpec = appearance.accentConfiguration 
        ? validateDesignSpecification(appearance.accentConfiguration) 
        : null;

      if (savedSpec) {
        setCustomDesignSpec(savedSpec);
        setHasSavedSpec(true);
        setActiveMode('ai-studio');
      } else {
        setCustomDesignSpec(null);
        setHasSavedSpec(false);
      }
    }).catch(() => {
      if (current) showToast('error', 'Your menu design could not be loaded. Please refresh and try again.');
    }).finally(() => {
      if (current) setLoading(false);
    });
    return () => { current = false; };
  }, [showToast]);

  async function saveTemplate() {
    setSaving(true);
    try {
      if (activeMode === 'ai-studio' && customDesignSpec) {
        await updateAppearance({
          templateId: customDesignSpec.themeId || templateId,
          accentConfiguration: customDesignSpec,
        });
        setHasSavedSpec(true);
        showToast('success', 'Bespoke AI design published! Your permanent QR code now displays this look.');
      } else {
        await updateAppearance({ 
          templateId,
          accentConfiguration: null,
        });
        setHasSavedSpec(false);
        showToast('success', 'Classic template applied! The same QR code now displays this theme.');
      }
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'The theme could not be saved. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e8783c]"></div>
    </div>
  );
  
  if (!menu?.menu) return (
    <div className="bg-[#1d2723] rounded-xl border border-[#2a3832] p-8 text-center max-w-2xl mx-auto mt-12">
      <h1 className="text-2xl font-bold text-white mb-2">Menu Appearance</h1>
      <p className="text-[#849a90] mb-6">Set up your menu items and categories before choosing a design.</p>
      <Link to="/app/menu" className="inline-flex rounded-lg bg-[#e8783c] hover:bg-[#f08b55] px-6 py-3 text-sm font-bold text-white transition-colors">
        Manage Menu
      </Link>
    </div>
  );

  const planId = sub?.planId?.toUpperCase() || 'BASIC';
  const isBasic = planId === 'BASIC';

  const previewCategories = menu.categories.map((category, index) => ({ id: category.id, name: category.name, order: index }));
  const previewItems = menu.categories.flatMap((category) => category.items.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description ?? '',
    price: Number(item.price || 0),
    category: category.id,
    dietType: (item.diet_type === 'non-veg' ? 'non-veg' : item.diet_type === 'vegan' ? 'vegan' : 'veg') as 'veg' | 'non-veg' | 'vegan',
    available: item.is_available !== false,
    image: item.image_url || undefined,
  })));

  const hasPhotos = previewItems.some((i) => Boolean(i.image));

  if (isBasic) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-8 pt-4 sm:pt-6">
        <header className="mb-8">
          <p className="text-xs font-bold uppercase tracking-wider text-[#e8783c]">{profile?.businessName}</p>
          <h1 className="mt-1 text-3xl font-bold text-white">Appearance</h1>
          <p className="mt-2 text-sm text-[#849a90]">Customize how your digital menu looks to customers.</p>
        </header>

        <div className="bg-[#1d2723] rounded-2xl border border-[#2a3832] p-10 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 text-white/5 pointer-events-none">
            <Palette size={200} />
          </div>
          
          <div className="bg-[#151c19] p-4 rounded-full mb-6 border border-[#2a3832]">
            <Lock size={32} className="text-[#849a90]" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-3">Premium Design Engine Locked</h2>
          <p className="text-[#849a90] max-w-md mb-8">
            AI-assisted bespoke designs and premium templates are available on Intermediate and Premium plans. Upgrade to unlock your restaurant's unique design engine.
          </p>
          
          <Link to="/app/subscription" className="inline-flex items-center gap-2 rounded-lg bg-[#e8783c] hover:bg-[#f08b55] px-6 py-3 text-sm font-bold text-white transition-colors shadow-lg shadow-[#e8783c]/20">
            <Zap size={18} /> Upgrade Plan
          </Link>
        </div>
      </div>
    );
  }

  const activeBgColor = activeMode === 'ai-studio' && customDesignSpec 
    ? customDesignSpec.colors.bg 
    : (menuTemplates.find((t) => t.id === templateId)?.colors.bg || '#FAFAF7');

  const activeIsDark = activeMode === 'ai-studio' && customDesignSpec
    ? isColorDark(customDesignSpec.colors.bg)
    : isTemplateDark(menuTemplates.find((t) => t.id === templateId));

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 px-4 md:px-8 pt-4 sm:pt-6">
      <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-[#2a3832] pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#e8783c]">{profile?.businessName}</p>
          <h1 className="mt-1 text-3xl font-bold text-white">Menu Design Studio</h1>
          <p className="mt-2 text-sm text-[#849a90]">
            Craft a bespoke visual identity for your digital menu or select a classic template. Your permanent QR code stays unchanged.
          </p>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 mt-4 bg-[#151c19] p-1.5 rounded-xl border border-[#2a3832] w-fit">
            <button
              type="button"
              onClick={() => setActiveMode('ai-studio')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'ai-studio'
                  ? 'bg-[#e8783c] text-white shadow-md'
                  : 'text-[#849a90] hover:text-white'
              }`}
            >
              <Sparkles size={14} /> AI Design Studio (Bespoke)
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('classic')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'classic'
                  ? 'bg-[#e8783c] text-white shadow-md'
                  : 'text-[#849a90] hover:text-white'
              }`}
            >
              <Palette size={14} /> Classic Templates ({menuTemplates.length})
            </button>
          </div>
        </div>

        <button 
          type="button" 
          onClick={saveTemplate} 
          disabled={saving} 
          className="inline-flex items-center gap-2 rounded-lg bg-[#e8783c] hover:bg-[#f08b55] px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50 transition-colors shadow-lg shadow-[#e8783c]/20 cursor-pointer"
        >
          <Save size={18} /> {saving ? 'Saving...' : 'Apply & Publish Design'}
        </button>
      </header>

      <div className="grid lg:grid-cols-[1fr_420px] gap-8 items-start">
        {/* Left Column: AI Studio Controls OR Classic Templates */}
        <div>
          {activeMode === 'ai-studio' ? (
            <AIDesignStudio
              businessName={profile?.businessName || 'Your Restaurant'}
              tagline={profile?.tagline}
              logoUrl={profile?.logoUrl}
              currentSpec={customDesignSpec}
              onSpecChange={setCustomDesignSpec}
              hasPhotography={hasPhotos}
              itemCount={previewItems.length}
              hasSavedSpec={hasSavedSpec}
            />
          ) : (
            <section aria-label="Available menu themes" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {menuTemplates.map((template) => {
                const isSelected = templateId === template.id;
                return (
                  <button 
                    key={template.id} 
                    type="button" 
                    onClick={() => setTemplateId(template.id)} 
                    aria-pressed={isSelected} 
                    className={`flex flex-col items-start rounded-xl border-2 text-left transition-all overflow-hidden cursor-pointer ${
                      isSelected 
                        ? 'border-[#e8783c] bg-[#e8783c]/10 ring-2 ring-[#e8783c]/50' 
                        : 'border-[#2a3832] bg-[#1d2723] hover:border-[#36473f]'
                    }`}
                  >
                    {/* Mini Swatch Header */}
                    <div 
                      className="w-full h-10 p-3 flex items-center justify-between relative overflow-hidden" 
                      style={{ backgroundColor: template.colors.bg, color: template.colors.text }}
                    >
                      <span 
                        className="text-xs font-bold font-serif uppercase tracking-wider truncate" 
                        style={{ fontFamily: template.typography.heading }}
                      >
                        {template.name}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {template.badge && (
                          <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-black/40 text-white">
                            {template.badge}
                          </span>
                        )}
                        {isSelected && <Check size={16} className="text-[#e8783c]" />}
                      </div>
                    </div>

                    <div className="p-4 w-full">
                      <p className="text-xs text-[#849a90] line-clamp-2 leading-relaxed">{template.description}</p>
                    </div>
                  </button>
                );
              })}
            </section>
          )}
        </div>

        {/* Right Column: Interactive Phone & Desktop Simulator */}
        <section aria-label="Live menu preview" className="lg:sticky lg:top-8 bg-[#1d2723] rounded-2xl p-6 border border-[#2a3832] flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-4 pb-3 border-b border-[#2a3832]">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#849a90]">
              <Eye size={16} className="text-[#e8783c]" /> Live Interactive Preview
            </div>
            
            {/* Device View Toggle */}
            <div className="flex items-center gap-1 bg-[#151c19] p-1 rounded-lg border border-[#2a3832]">
              <button
                type="button"
                onClick={() => setPreviewMode('phone')}
                className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  previewMode === 'phone' ? 'bg-[#e8783c] text-white' : 'text-[#849a90] hover:text-white'
                }`}
                title="Phone view"
              >
                <Smartphone size={14} /> Phone
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('desktop')}
                className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  previewMode === 'desktop' ? 'bg-[#e8783c] text-white' : 'text-[#849a90] hover:text-white'
                }`}
                title="Desktop view"
              >
                <Monitor size={14} /> Desktop
              </button>
            </div>
          </div>
          
          {previewMode === 'phone' ? (
            <div className="py-2">
              <PremiumIPhoneMockup
                className="!w-[290px] sm:!w-[310px] shadow-2xl"
                badgeText={activeMode === 'ai-studio' ? 'Bespoke AI Preview' : 'Classic Theme Preview'}
                statusBarTheme={activeIsDark ? 'light' : 'dark'}
                homeIndicatorTheme={activeIsDark ? 'light' : 'dark'}
                screenStyle={{ backgroundColor: activeBgColor }}
                screenClassName=""
              >
                <div className="h-full w-full overflow-y-auto">
                  <MenuTemplateRenderer
                    templateId={templateId}
                    accentConfiguration={activeMode === 'ai-studio' ? customDesignSpec : undefined}
                    restaurant={{ 
                      name: profile?.businessName || 'Your Restaurant', 
                      tagline: profile?.tagline, 
                      phone: profile?.phone, 
                      address: profile?.address, 
                      logo: profile?.logoUrl 
                    }}
                    categories={previewCategories}
                    items={previewItems}
                    compact={true}
                  />
                </div>
              </PremiumIPhoneMockup>
            </div>
          ) : (
            <div className="w-full aspect-[4/3] rounded-xl border-4 border-[#151c19] overflow-hidden shadow-2xl relative bg-black max-h-[500px]">
              <div className="h-full w-full overflow-y-auto">
                <MenuTemplateRenderer
                  templateId={templateId}
                  accentConfiguration={activeMode === 'ai-studio' ? customDesignSpec : undefined}
                  restaurant={{ 
                    name: profile?.businessName || 'Your Restaurant', 
                    tagline: profile?.tagline, 
                    phone: profile?.phone, 
                    address: profile?.address, 
                    logo: profile?.logoUrl 
                  }}
                  categories={previewCategories}
                  items={previewItems}
                  compact={false}
                />
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2 mt-4 text-xs font-medium text-[#849a90]">
            <Palette size={14} className="text-[#e8783c]" />
            Your customers will see this design instantly when scanning the permanent QR
          </div>
        </section>
      </div>
    </div>
  );
}
