import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Check, 
  Eye, 
  Palette, 
  Save, 
  Lock, 
  Zap, 
  Smartphone, 
  Monitor, 
  ShoppingCart, 
  ChevronRight, 
  MapPin, 
  RotateCcw, 
  Upload, 
  Trash2, 
  Image as ImageIcon,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import MenuTemplateRenderer from '../../components/menu-builder/MenuTemplateRenderer';
import { MultiPageMenuStudio } from '../../components/menu-builder/MultiPageMenuStudio';
import PremiumIPhoneMockup from '../../components/marketing/PremiumIPhoneMockup';
import IsolatedMobileFrame from '../../components/menu-builder/IsolatedMobileFrame';
import { MenusQRBrand } from '../../components/brand/MenusQRBrand';
import { menuTemplates, isTemplateDark, isColorDark } from '../../data/menuTemplates';
import { artisanGraphicThemes } from '../../data/artisanGraphicThemes';
import { Flame, Layers } from 'lucide-react';
import { useToast } from '../../components/feedback/ToastProvider';
import { 
  getAppearance, 
  getMenu, 
  getProfile, 
  getSubscription, 
  updateAppearance, 
  uploadImage,
  type AppMenuData, 
  type AppProfile, 
  type AppSubscriptionData 
} from './appStore';

const THEME_CATEGORIES = [
  { id: 'all', label: 'All Themes', count: 15 },
  { id: 'heritage', label: 'Royal & Heritage', count: 5 },
  { id: 'fine-dining', label: 'Fine Dining & Luxury', count: 4 },
  { id: 'cafe', label: 'Café & Bistro', count: 2 },
  { id: 'street', label: 'Street Food', count: 2 },
  { id: 'minimal', label: 'Modern & Minimal', count: 2 },
] as const;

type ThemeCategoryFilter = typeof THEME_CATEGORIES[number]['id'];

function getThemeGroup(id: string): 'heritage' | 'fine-dining' | 'cafe' | 'street' | 'minimal' {
  if (['royal-maharaja', 'rajasthani-heritage', 'mughal-luxe', 'banarasi-gold', 'south-indian-heritage'].includes(id)) return 'heritage';
  if (['modern-india', 'spice-house', 'maison-noir', 'grand-table'].includes(id)) return 'fine-dining';
  if (['coffee-house', 'paper-cafe'].includes(id)) return 'cafe';
  if (['indian-street-kitchen', 'bombay-street'].includes(id)) return 'street';
  return 'minimal'; // ivory-dining, minimal-editorial
}

export default function Appearance() {
  const [menu, setMenu] = useState<AppMenuData | null>(null);
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [sub, setSub] = useState<AppSubscriptionData | null>(null);
  const [templateId, setTemplateId] = useState('royal-maharaja');
  const [brandLogo, setBrandLogo] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [brandTagline, setBrandTagline] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<ThemeCategoryFilter>('all');
  const [previewMode, setPreviewMode] = useState<'phone' | 'desktop'>('phone');
  const [themeFamily, setThemeFamily] = useState<'artisan' | 'dynamic'>('artisan');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [isMultiPageStudioOpen, setIsMultiPageStudioOpen] = useState(false);
  const [mockCart, setMockCart] = useState<Array<{ id: string; name: string; price: number; quantity: number }>>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const showToast = useToast();

  useEffect(() => {
    let current = true;
    Promise.all([getMenu(), getProfile(), getAppearance(), getSubscription()]).then(([menuData, profileData, appearance, subData]) => {
      if (!current) return;
      setMenu(menuData);
      setProfile(profileData);
      setTemplateId(appearance.templateId || 'royal-maharaja');
      setBrandLogo(appearance.logo || profileData.logoUrl || '');
      setDisplayName(appearance.restaurantDisplayName || profileData.businessName || '');
      setBrandTagline(appearance.tagline || profileData.tagline || '');
      setSub(subData);
    }).catch(() => {
      if (current) showToast('error', 'Your menu design could not be loaded. Please refresh and try again.');
    }).finally(() => {
      if (current) setLoading(false);
    });
    return () => { current = false; };
  }, [showToast]);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('error', 'Image size must be less than 10MB.');
      return;
    }

    setUploadingLogo(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const result = await uploadImage(base64Data, 'logos', 800);
          setBrandLogo(result.url);
          showToast('success', 'Logo uploaded successfully! Preview updated.');
        } catch (err) {
          showToast('error', err instanceof Error ? err.message : 'Failed to upload logo.');
        } finally {
          setUploadingLogo(false);
        }
      };
      reader.onerror = () => {
        showToast('error', 'Could not read image file.');
        setUploadingLogo(false);
      };
      reader.readAsDataURL(file);
    } catch {
      showToast('error', 'Failed to process logo image.');
      setUploadingLogo(false);
    }
  }

  function handleRemoveLogo() {
    setBrandLogo('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('info', 'Brand logo removed. Click Save to publish.');
  }

  async function saveTheme() {
    setSaving(true);
    try {
      await updateAppearance({ 
        templateId,
        logo: brandLogo.trim() || null,
        restaurantDisplayName: displayName.trim() || null,
        tagline: brandTagline.trim() || null,
        accentConfiguration: null, // explicit null clears any legacy AI overrides
      });
      showToast('success', 'Theme applied! Your live QR code now displays this theme.');
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
    price: item.price ? Number(item.price) : 0,
    halfPrice: item.half_price ? Number(item.half_price) : undefined,
    fullPrice: item.full_price ? Number(item.full_price) : undefined,
    pricingType: item.pricing_type,
    variants: item.variants,
    category: category.id,
    dietType: (item.diet_type === 'non-veg' ? 'non-veg' : item.diet_type === 'vegan' ? 'vegan' : 'veg') as 'veg' | 'non-veg' | 'vegan',
    available: item.is_available !== false,
    image: item.image_url || undefined,
  })));

  // Interactive cart simulation inside preview
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

  const cartTotalAmount = mockCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartTotalQuantity = mockCart.reduce((sum, item) => sum + item.quantity, 0);

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
          
          <h2 className="text-2xl font-bold text-white mb-3">Premium Themes Locked</h2>
          <p className="text-[#849a90] max-w-md mb-8">
            Handcrafted luxury themes and brand customization are available on Intermediate and Premium plans. Upgrade to unlock all 15 themes for your restaurant.
          </p>
          
          <Link to="/app/subscription" className="inline-flex items-center gap-2 rounded-lg bg-[#e8783c] hover:bg-[#f08b55] px-6 py-3 text-sm font-bold text-white transition-colors shadow-lg shadow-[#e8783c]/20">
            <Zap size={18} /> Upgrade Plan
          </Link>
        </div>
      </div>
    );
  }

  const selectedArtisanTheme = artisanGraphicThemes.find((t) => t.id === templateId);
  const selectedTemplate = menuTemplates.find((t) => t.id === templateId) || menuTemplates[0];
  const activeThemeName = selectedArtisanTheme ? selectedArtisanTheme.name : selectedTemplate.name;
  const activeBgColor = selectedArtisanTheme ? selectedArtisanTheme.colors.safeZoneBg : selectedTemplate.colors.bg;
  const activeIsDark = selectedArtisanTheme ? true : isTemplateDark(selectedTemplate);

  const filteredTemplates = menuTemplates.filter((t) => {
    if (categoryFilter === 'all') return true;
    return getThemeGroup(t.id) === categoryFilter;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 px-4 md:px-8 pt-4 sm:pt-6">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-[#2a3832] pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#e8783c]">{profile?.businessName || 'Restaurant'}</p>
          <h1 className="mt-1 text-3xl font-bold text-white">Menu Themes & Branding</h1>
          <p className="mt-2 text-sm text-[#849a90]">
            Select from 35 handcrafted themes: 20 luxury artisan graphic backdrops & 15 modern dynamic digital designs. Your live QR menu updates instantly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsMultiPageStudioOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 px-5 py-3 text-sm font-bold transition-all shrink-0 cursor-pointer"
          >
            <FileSpreadsheet size={18} />
            <span>35 Themes Multi-Page Studio</span>
          </button>

          <button 
            type="button" 
            onClick={saveTheme} 
            disabled={saving} 
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#e8783c] to-[#f08b55] hover:brightness-110 px-7 py-3 text-sm font-bold text-white disabled:opacity-50 transition-all shadow-xl shadow-[#e8783c]/20 cursor-pointer shrink-0"
          >
            <Save size={18} /> {saving ? 'Applying...' : 'Apply & Publish Theme'}
          </button>
        </div>
      </header>

      {/* Main Grid: Left Controls & Themes, Right Interactive Preview */}
      <div className="grid lg:grid-cols-[1fr_420px] gap-8 items-start">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Section 1: Brand Customization (Logo, Name, Tagline) */}
          <div className="bg-[#1d2723] rounded-2xl border border-[#2a3832] p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#2a3832]">
              <div className="w-8 h-8 rounded-lg bg-[#e8783c]/15 text-[#e8783c] flex items-center justify-center">
                <Sparkles size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Restaurant Brand Identity</h2>
                <p className="text-xs text-[#849a90]">Upload your official logo and configure your header title</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6 items-center">
              {/* Logo Preview & Upload */}
              <div className="flex flex-col items-center sm:items-start gap-2.5">
                <span className="text-xs font-semibold text-[#849a90]">Brand Logo</span>
                <div className="relative group w-24 h-24 rounded-2xl border-2 border-dashed border-[#2a3832] hover:border-[#e8783c] bg-[#151c19] flex items-center justify-center overflow-hidden transition-all shadow-inner">
                  {brandLogo ? (
                    <img 
                      src={brandLogo} 
                      alt="Brand Logo" 
                      className="w-full h-full object-contain p-2" 
                    />
                  ) : (
                    <div className="flex flex-col items-center text-center p-2 text-[#849a90]">
                      <ImageIcon size={24} className="mb-1 text-[#849a90]" />
                      <span className="text-[10px] font-medium leading-tight">No Logo</span>
                    </div>
                  )}

                  {uploadingLogo && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-[#e8783c] rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleLogoUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151c19] hover:bg-[#25322c] border border-[#2a3832] text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    <Upload size={13} className="text-[#e8783c]" />
                    {brandLogo ? 'Change' : 'Upload'}
                  </button>
                  {brandLogo && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                      title="Remove Logo"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Display Name & Tagline Inputs */}
              <div className="space-y-4 w-full">
                <div>
                  <label className="block text-xs font-semibold text-[#849a90] mb-1.5">
                    Restaurant Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={profile?.businessName || 'e.g. Royal Haveli'}
                    maxLength={100}
                    className="w-full bg-[#151c19] border border-[#2a3832] focus:border-[#e8783c] focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#849a90] mb-1.5">
                    Tagline / Cuisine Subtitle
                  </label>
                  <input
                    type="text"
                    value={brandTagline}
                    onChange={(e) => setBrandTagline(e.target.value)}
                    placeholder="e.g. Authentic North Indian & Mughlai Delicacies"
                    maxLength={150}
                    className="w-full bg-[#151c19] border border-[#2a3832] focus:border-[#e8783c] focus:outline-none rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Theme Selector */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Palette size={18} className="text-[#e8783c]" />
                <h2 className="text-lg font-bold text-white">Select Menu Theme (35 Themes)</h2>
              </div>
              <span className="text-xs text-[#849a90]">
                Active: <strong className="text-white">{activeThemeName}</strong>
              </span>
            </div>

            {/* Theme Family Switcher Tabs */}
            <div className="flex items-center gap-2 p-1 bg-[#151c19] border border-[#2a3832] rounded-2xl w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setThemeFamily('artisan')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  themeFamily === 'artisan'
                    ? 'bg-[#e8783c] text-white shadow-md'
                    : 'text-[#849a90] hover:text-white'
                }`}
              >
                <Flame size={14} />
                <span>Artisan Graphic Posters ({artisanGraphicThemes.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setThemeFamily('dynamic')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  themeFamily === 'dynamic'
                    ? 'bg-[#e8783c] text-white shadow-md'
                    : 'text-[#849a90] hover:text-white'
                }`}
              >
                <Layers size={14} />
                <span>Dynamic Digital Themes ({menuTemplates.length})</span>
              </button>
            </div>

            {/* ARTISAN GRAPHIC THEMES GRID (20 THEMES) */}
            {themeFamily === 'artisan' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {artisanGraphicThemes.map((tpl) => {
                  const isSelected = templateId === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setTemplateId(tpl.id)}
                      aria-pressed={isSelected}
                      className={`flex flex-col items-start rounded-2xl border-2 text-left transition-all overflow-hidden cursor-pointer relative group ${
                        isSelected
                          ? 'border-[#e8783c] bg-[#1d2723] ring-4 ring-[#e8783c]/20 shadow-xl'
                          : 'border-[#2a3832] bg-[#1d2723] hover:border-[#42574d] hover:bg-[#222e29]'
                      }`}
                    >
                      {/* Background Artwork Banner Preview */}
                      <div
                        className="w-full h-24 relative overflow-hidden bg-stone-900 border-b border-[#2a3832]"
                        style={{
                          backgroundImage: `url(${tpl.bgImage})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                        <span className="absolute bottom-2 left-3 text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-black/70 text-amber-300 font-bold border border-amber-400/30">
                          {tpl.badge}
                        </span>
                        {isSelected && (
                          <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#e8783c] text-white flex items-center justify-center shadow-lg">
                            <Check size={14} />
                          </span>
                        )}
                      </div>

                      <div className="p-4 w-full space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-white group-hover:text-[#e8783c] transition-colors">{tpl.name}</h3>
                        </div>
                        <p className="text-xs text-[#e8783c] font-semibold">{tpl.cuisine}</p>
                        <p className="text-[11px] text-[#849a90] line-clamp-2 leading-relaxed">{tpl.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* DYNAMIC DIGITAL THEMES GRID (15 THEMES) */}
            {themeFamily === 'dynamic' && (
              <>
                {/* Category Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 pb-1">
                  {THEME_CATEGORIES.map((cat) => {
                    const isActive = categoryFilter === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoryFilter(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#e8783c] text-white shadow-md shadow-[#e8783c]/20'
                            : 'bg-[#1d2723] text-[#849a90] hover:text-white border border-[#2a3832]'
                        }`}
                      >
                        {cat.label} ({cat.count})
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredTemplates.map((template) => {
                const isSelected = templateId === template.id;
                return (
                  <button 
                    key={template.id} 
                    type="button" 
                    onClick={() => setTemplateId(template.id)} 
                    aria-pressed={isSelected} 
                    className={`flex flex-col items-start rounded-2xl border-2 text-left transition-all overflow-hidden cursor-pointer relative group ${
                      isSelected 
                        ? 'border-[#e8783c] bg-[#1d2723] ring-4 ring-[#e8783c]/20 shadow-xl' 
                        : 'border-[#2a3832] bg-[#1d2723] hover:border-[#42574d] hover:bg-[#222e29]'
                    }`}
                  >
                    {/* Visual Palette Preview Header */}
                    <div 
                      className="w-full p-3.5 flex items-center justify-between relative overflow-hidden" 
                      style={{ 
                        backgroundColor: template.colors.bg, 
                        color: template.colors.text,
                        borderBottom: `1px solid ${template.colors.border || 'rgba(0,0,0,0.1)'}` 
                      }}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span 
                          className="text-xs font-bold uppercase tracking-wider truncate font-serif" 
                          style={{ fontFamily: template.typography.heading }}
                        >
                          {template.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {template.badge && (
                          <span 
                            className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm"
                            style={{ 
                              backgroundColor: template.colors.accent, 
                              color: isColorDark(template.colors.accent) ? '#fff' : '#000' 
                            }}
                          >
                            {template.badge}
                          </span>
                        )}
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#e8783c] text-white flex items-center justify-center shrink-0 shadow">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Content & Details */}
                    <div className="p-4 w-full flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <p className="text-[11px] font-semibold text-zinc-300 mb-1">{template.subtitle}</p>
                        <p className="text-xs text-[#849a90] line-clamp-2 leading-relaxed">{template.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#2a3832]/60 text-[11px]">
                        {/* Swatches */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-[#849a90] font-mono mr-1">Palette:</span>
                          <span className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs" style={{ backgroundColor: template.colors.bg }} title="Background" />
                          <span className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs" style={{ backgroundColor: template.colors.surface }} title="Surface" />
                          <span className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs" style={{ backgroundColor: template.colors.accent }} title="Accent" />
                        </div>

                        {/* Layout Type */}
                        <span className="text-[10px] text-zinc-400 capitalize px-2 py-0.5 rounded bg-[#151c19] border border-[#2a3832]">
                          {template.layout.type}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Live Interactive Phone & Desktop Simulator */}
        <section aria-label="Live menu preview" className="lg:sticky lg:top-8 bg-[#1d2723] rounded-2xl p-5 border border-[#2a3832] flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-4 pb-3 border-b border-[#2a3832]">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#849a90]">
              <Eye size={16} className="text-[#e8783c]" /> Live Interactive Preview
            </div>
            
            {/* Device View Toggle */}
            <div className="flex items-center gap-1 bg-[#151c19] p-1 rounded-xl border border-[#2a3832]">
              <button
                type="button"
                onClick={() => setPreviewMode('phone')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  previewMode === 'phone' ? 'bg-[#e8783c] text-white shadow' : 'text-[#849a90] hover:text-white'
                }`}
                title="Phone view"
              >
                <Smartphone size={13} /> Phone
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('desktop')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  previewMode === 'desktop' ? 'bg-[#e8783c] text-white shadow' : 'text-[#849a90] hover:text-white'
                }`}
                title="Desktop view"
              >
                <Monitor size={13} /> Desktop
              </button>
            </div>
          </div>
          
          {previewMode === 'phone' ? (
            <div className="py-1 w-full flex justify-center">
              <PremiumIPhoneMockup
                className="!w-[340px] sm:!w-[365px] max-w-full shadow-2xl"
                badgeText={`${selectedTemplate.name} Theme`}
                statusBarTheme={activeIsDark ? 'light' : 'dark'}
                homeIndicatorTheme={activeIsDark ? 'light' : 'dark'}
                screenStyle={{ backgroundColor: activeBgColor }}
                screenClassName=""
              >
                <IsolatedMobileFrame backgroundColor={activeBgColor}>
                  <div className="flex flex-col min-h-full w-full relative">
                    {/* Customer Experience Top Bar */}
                    <header className="px-3.5 py-2.5 border-b border-white/10 flex items-center justify-between backdrop-blur-md sticky top-0 z-40 bg-black/50 shrink-0">
                      <div className="flex items-center gap-2">
                        <MenusQRBrand size="sm" variant="light" className="scale-75 origin-left" />
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-white/80">
                        {profile?.city && (
                          <span className="flex items-center gap-1">
                            <MapPin size={10} className="text-[#e8783c]" />
                            {[profile.city, profile.state].filter(Boolean).join(', ')}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                        </span>
                      </div>
                    </header>

                    {/* Actual Menu Content */}
                    <div className="flex-1 pb-24">
                      <MenuTemplateRenderer
                        templateId={templateId}
                        restaurant={{ 
                          name: displayName.trim() || profile?.businessName || 'Your Restaurant', 
                          tagline: brandTagline.trim() || profile?.tagline, 
                          phone: profile?.phone, 
                          address: profile?.address, 
                          city: profile?.city,
                          logo: brandLogo || profile?.logoUrl 
                        }}
                        categories={previewCategories}
                        items={previewItems}
                        compact={false}
                        onAddToCart={handleAddToCart}
                        onRemoveFromCart={handleRemoveFromCart}
                        getItemQuantity={getItemQuantity}
                        isPremium={true}
                      />
                    </div>

                    {/* Interactive Floating Order Bar in Phone Screen */}
                    {mockCart.length > 0 && (
                      <div className="fixed bottom-3 inset-x-3 z-50 rounded-2xl bg-[#153b32] border border-[#2b594d] shadow-2xl p-2.5 flex items-center justify-between text-white animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="flex items-center gap-2.5 pl-1">
                          <div className="w-7 h-7 rounded-full bg-[#e8783c] flex items-center justify-center text-white">
                            <ShoppingCart size={14} />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold leading-tight">
                              {cartTotalQuantity} {cartTotalQuantity === 1 ? 'item' : 'items'}
                            </p>
                            <p className="text-[10px] font-mono text-emerald-300">
                              ₹{cartTotalAmount.toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setMockCart([])}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                            title="Reset Cart"
                          >
                            <RotateCcw size={13} />
                          </button>
                          <div className="flex items-center gap-1 bg-[#e8783c] px-3 py-1.5 rounded-xl font-bold text-xs shadow-md">
                            <span>Order</span>
                            <ChevronRight size={13} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </IsolatedMobileFrame>
              </PremiumIPhoneMockup>
            </div>
          ) : (
            <div className="w-full aspect-[4/3] rounded-xl border-4 border-[#151c19] overflow-hidden shadow-2xl relative bg-black max-h-[500px]">
              <div className="h-full w-full overflow-y-auto">
                <MenuTemplateRenderer
                  templateId={templateId}
                  restaurant={{ 
                    name: displayName.trim() || profile?.businessName || 'Your Restaurant', 
                    tagline: brandTagline.trim() || profile?.tagline, 
                    phone: profile?.phone, 
                    address: profile?.address, 
                    city: profile?.city,
                    logo: brandLogo || profile?.logoUrl 
                  }}
                  categories={previewCategories}
                  items={previewItems}
                  compact={false}
                  onAddToCart={handleAddToCart}
                  onRemoveFromCart={handleRemoveFromCart}
                  getItemQuantity={getItemQuantity}
                  isPremium={true}
                />
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2 mt-4 text-xs font-medium text-[#849a90]">
            <Palette size={14} className="text-[#e8783c]" />
            Changes apply to your permanent QR code instantly when saved.
          </div>
        </section>
      </div>

      {/* Multi-Page Studio Modal for all 35 themes with Excel Ingestion */}
      <MultiPageMenuStudio
        isOpen={isMultiPageStudioOpen}
        onClose={() => setIsMultiPageStudioOpen(false)}
        restaurant={{
          name: displayName.trim() || profile?.businessName || 'Your Restaurant',
          tagline: brandTagline.trim() || profile?.tagline,
          phone: profile?.phone,
          address: profile?.address,
          city: profile?.city,
          state: profile?.state,
          logo: brandLogo || profile?.logoUrl,
          slug: profile?.menuSlug || 'demo',
        }}
        initialCategories={previewCategories}
        initialItems={previewItems}
      />
    </div>
  );
}
