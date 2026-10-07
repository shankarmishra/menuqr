import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Eye, Palette, Save, Lock, Zap } from 'lucide-react';
import MenuTemplateRenderer from '../../components/menu-builder/MenuTemplateRenderer';
import { menuTemplates } from '../../data/menuTemplates';
import { useToast } from '../../components/feedback/ToastProvider';
import { getAppearance, getMenu, getProfile, getSubscription, updateAppearance, type AppMenuData, type AppProfile, type AppSubscriptionData } from './appStore';

export default function Appearance() {
  const [menu, setMenu] = useState<AppMenuData | null>(null);
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [sub, setSub] = useState<AppSubscriptionData | null>(null);
  const [templateId, setTemplateId] = useState('royal-maharaja');
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
      await updateAppearance({ templateId });
      showToast('success', 'Menu theme updated. The same QR now opens this design.');
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
    dietType: item.diet_type === 'non-veg' ? 'non-veg' as const : 'veg' as const,
    available: item.is_available !== false,
    image: item.image_url || undefined,
  })));

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
          
          <h2 className="text-2xl font-bold text-white mb-3">Premium Templates Locked</h2>
          <p className="text-[#849a90] max-w-md mb-8">
            Templates and appearance customization are available on Intermediate and Premium plans. Upgrade to unlock the Template Library.
          </p>
          
          <Link to="/app/subscription" className="inline-flex items-center gap-2 rounded-lg bg-[#e8783c] hover:bg-[#f08b55] px-6 py-3 text-sm font-bold text-white transition-colors shadow-lg shadow-[#e8783c]/20">
            <Zap size={18} /> Upgrade Plan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 px-4 md:px-8 pt-4 sm:pt-6">
      <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-[#2a3832] pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#e8783c]">{profile?.businessName}</p>
          <h1 className="mt-1 text-3xl font-bold text-white">Template Library</h1>
          <p className="mt-2 text-sm text-[#849a90]">Choose a style for your live menu. Your physical QR stays exactly the same.</p>
        </div>
        <button type="button" onClick={saveTemplate} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[#e8783c] hover:bg-[#f08b55] px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50 transition-colors shadow-lg shadow-[#e8783c]/20">
          <Save size={18} /> {saving ? 'Saving...' : 'Apply Theme'}
        </button>
      </header>

      <div className="grid lg:grid-cols-[1fr_360px] gap-10 items-start">
        <section aria-label="Available menu themes" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuTemplates.map((template) => {
            const isSelected = templateId === template.id;
            return (
              <button 
                key={template.id} 
                type="button" 
                onClick={() => setTemplateId(template.id)} 
                aria-pressed={isSelected} 
                className={`flex flex-col items-start p-5 rounded-xl border-2 text-left transition-colors ${isSelected ? 'border-[#e8783c] bg-[#e8783c]/5' : 'border-[#2a3832] bg-[#1d2723] hover:border-[#36473f]'}`}
              >
                <div className="flex items-start justify-between w-full mb-3">
                  <h3 className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-[#e2e8f0]'}`}>{template.name}</h3>
                  {isSelected && <Check size={20} className="text-[#e8783c] shrink-0" />}
                </div>
                <p className="text-sm text-[#849a90]">{template.subtitle}</p>
              </button>
            );
          })}
        </section>

        <section aria-label="Live menu preview" className="lg:sticky lg:top-8 bg-[#1d2723] rounded-2xl p-6 border border-[#2a3832] flex flex-col items-center">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#849a90] mb-6 w-full justify-center">
            <Eye size={16} className="text-[#e8783c]" /> Live menu preview
          </div>
          
          <div className="w-full max-w-[340px] aspect-[9/19] rounded-[2.5rem] border-[8px] border-[#151c19] overflow-hidden shadow-2xl relative bg-black">
            <MenuTemplateRenderer
              templateId={templateId}
              restaurant={{ name: profile?.businessName || 'Your restaurant', tagline: profile?.tagline, phone: profile?.phone, address: profile?.address, logo: profile?.logoUrl }}
              categories={previewCategories}
              items={previewItems}
            />
          </div>
          
          <div className="flex items-center gap-2 mt-6 text-xs font-medium text-[#849a90]">
            <Palette size={14} className="text-[#e8783c]" />
            Your customers will see this design instantly
          </div>
        </section>
      </div>
    </div>
  );
}
