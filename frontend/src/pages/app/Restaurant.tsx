import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Store,
  Sparkles,
  MapPin,
  Phone,
  Image as ImageIcon,
  FileCheck2,
  Save,
  RotateCcw,
  CheckCircle2,
  X,
  Eye,
  ExternalLink,
  MessageCircle,
  Clock,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  Bell,
  Search,
} from 'lucide-react';
import {
  getCanonicalProfile,
  updateCanonicalProfile,
  type CanonicalProfileData,
} from './appStore';
import { IdentityTab } from './restaurant/IdentityTab';
import { BrandTab } from './restaurant/BrandTab';
import { LocationHoursTab } from './restaurant/LocationHoursTab';
import { ContactSocialTab } from './restaurant/ContactSocialTab';
import { PhotosTab } from './restaurant/PhotosTab';
import { HighlightsLegalTab } from './restaurant/HighlightsLegalTab';
import type { SurfaceTarget } from './restaurant/AppearsOnChips';

type TabKey = 'identity' | 'brand' | 'location' | 'contact' | 'photos' | 'highlights';

const TAB_ALIASES: Record<string, TabKey> = {
  identity: 'identity',
  profile: 'identity',
  name: 'identity',
  brand: 'brand',
  'brand-logo': 'brand',
  logo: 'brand',
  location: 'location',
  'location-hours': 'location',
  hours: 'location',
  address: 'location',
  contact: 'contact',
  'contact-social': 'contact',
  phone: 'contact',
  social: 'contact',
  photos: 'photos',
  'photos-story': 'photos',
  gallery: 'photos',
  photo: 'photos',
  highlights: 'highlights',
  'highlights-legal': 'highlights',
  legal: 'highlights',
  amenities: 'highlights',
  taxes: 'highlights',
};

export default function RestaurantPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>('identity');
  const [profile, setProfile] = useState<CanonicalProfileData | null>(null);
  const [completeness, setCompleteness] = useState(0);
  const [planId, setPlanId] = useState('BASIC');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [colourMood, setColourMood] = useState('royal_gold');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [highlightedSurface, setHighlightedSurface] = useState<SurfaceTarget | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Sync tab with ?tab= search param
  useEffect(() => {
    const tabParam = searchParams.get('tab')?.toLowerCase();
    if (tabParam && TAB_ALIASES[tabParam]) {
      setActiveTab(TAB_ALIASES[tabParam]);
    }
  }, [searchParams]);

  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);
    setSearchParams({ tab: key }, { replace: true });
  };

  // Load canonical profile on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getCanonicalProfile();
      setProfile(res.profile);
      setCompleteness(res.completeness);
      setPlanId(res.plan);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (updated: Partial<CanonicalProfileData>) => {
    if (!profile) return;
    setProfile({
      ...profile,
      ...updated,
    });
    setDirty(true);
  };

  const handleSave = async () => {
    if (!profile) return;
    try {
      setSaving(true);
      const sectionMap: Record<TabKey, any> = {
        identity: 'identity',
        brand: 'brand',
        location: 'location-hours',
        contact: 'contact-social',
        photos: 'photos-story',
        highlights: 'highlights-legal',
      };

      const section = sectionMap[activeTab];
      await updateCanonicalProfile(section, {
        ...profile,
        logo: logoUrl ? { mediaUrl: logoUrl } : undefined,
        colourMood,
      });

      setDirty(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
      loadData();
    } catch (err: any) {
      alert('Failed to save profile: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleHighlight = (surface: SurfaceTarget) => {
    if (highlightedSurface === surface) {
      setHighlightedSurface(null);
    } else {
      setHighlightedSurface(surface);
      // If screen is mobile/tablet (< 1024px), open bottom preview modal automatically
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        setPreviewModalOpen(true);
      }
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3 bg-[#1d2723] px-6 py-4 rounded-2xl border border-[#2a3832] shadow-xl">
          <div className="w-5 h-5 border-2 border-[#e8783c] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-200">
            Loading restaurant console…
          </span>
        </div>
      </div>
    );
  }

  const tabs: Array<{ key: TabKey; label: string; icon: React.ElementType }> = [
    { key: 'identity', label: 'Identity', icon: Store },
    { key: 'brand', label: 'Brand & Logo', icon: Sparkles },
    { key: 'location', label: 'Location & Hours', icon: MapPin },
    { key: 'contact', label: 'Contact & Social', icon: Phone },
    { key: 'photos', label: 'Photos & Story', icon: ImageIcon },
    { key: 'highlights', label: 'Highlights & Legal', icon: FileCheck2 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 text-slate-100">
      {/* Success Toast */}
      {saveSuccess && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#1d2723] border border-emerald-500/50 text-white rounded-2xl shadow-2xl shadow-black/80 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <div>
            <div className="text-xs font-bold text-emerald-300">Profile Updated Live!</div>
            <div className="text-[11px] text-slate-300">
              Changes are immediately live on your diner QR menus.
            </div>
          </div>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1d2723]/90 border border-[#2a3832] rounded-3xl p-6 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {profile.displayName || 'Your Restaurant'}
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#e8783c]/15 text-[#f49b6b] border border-[#e8783c]/30 shadow-sm">
              Profile {completeness}% Complete
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Single source of truth. Changes saved here update your digital QR menu immediately
            without consuming BASIC edit quotas.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {dirty && (
            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-[#151c19] border border-[#2a3832] hover:border-slate-600 transition-all"
            >
              <RotateCcw size={14} />
              <span>Discard</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !dirty}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
              dirty
                ? 'bg-gradient-to-r from-[#e8783c] to-amber-500 hover:from-[#d66c32] hover:to-amber-400 text-white shadow-[#e8783c]/25 active:scale-95'
                : 'bg-[#151c19] text-slate-400 border border-[#2a3832] cursor-not-allowed'
            }`}
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle2 size={16} className="text-emerald-400" />
            ) : (
              <Save size={16} className={dirty ? 'text-white' : 'text-slate-400'} />
            )}
            <span>
              {saving
                ? 'Publishing facts…'
                : saveSuccess
                ? 'Saved live!'
                : dirty
                ? 'Save Changes (Goes Live) ●'
                : 'All changes saved live'}
            </span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex overflow-x-auto gap-2 p-1.5 bg-[#1d2723]/90 border border-[#2a3832] rounded-2xl scrollbar-hide shadow-inner">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-[#e8783c] text-white shadow-md shadow-[#e8783c]/25'
                  : 'text-slate-300 hover:text-white hover:bg-[#151c19]'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {isActive && dirty && (
                <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse ml-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Two-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Area (7 or 8 columns) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {activeTab === 'identity' && (
            <IdentityTab
              profile={profile}
              onChange={handleProfileChange}
              onHighlightSurface={handleHighlight}
              activeSurface={highlightedSurface}
            />
          )}

          {activeTab === 'brand' && (
            <BrandTab
              logoUrl={logoUrl || undefined}
              colourMood={colourMood}
              onUpdateLogo={(url) => {
                setLogoUrl(url);
                setDirty(true);
              }}
              onUpdateMood={(mood) => {
                setColourMood(mood);
                setDirty(true);
              }}
              onHighlightSurface={handleHighlight}
              activeSurface={highlightedSurface}
            />
          )}

          {activeTab === 'location' && (
            <LocationHoursTab
              profile={profile}
              onChange={handleProfileChange}
              onHighlightSurface={handleHighlight}
              activeSurface={highlightedSurface}
            />
          )}

          {activeTab === 'contact' && (
            <ContactSocialTab
              profile={profile}
              onChange={handleProfileChange}
              onHighlightSurface={handleHighlight}
              activeSurface={highlightedSurface}
            />
          )}

          {activeTab === 'photos' && (
            <PhotosTab
              profile={profile}
              onChange={handleProfileChange}
              onHighlightSurface={handleHighlight}
              activeSurface={highlightedSurface}
              planId={planId}
            />
          )}

          {activeTab === 'highlights' && (
            <HighlightsLegalTab
              profile={profile}
              onChange={handleProfileChange}
              onHighlightSurface={handleHighlight}
              activeSurface={highlightedSurface}
            />
          )}

          {/* Bottom Docked Save Bar if Dirty */}
          {dirty && (
            <div className="sticky bottom-6 z-30 p-4 bg-[#1d2723] border border-[#e8783c]/60 rounded-2xl shadow-2xl shadow-black/80 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e8783c] animate-ping" />
                <span className="font-bold text-white">Unsaved changes on {activeTab}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadData}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-[#e8783c] hover:bg-[#d66c32] text-white text-xs font-bold shadow-md shadow-[#e8783c]/20 transition-all active:scale-95 flex items-center gap-2"
                >
                  {saving ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  <span>Save changes now</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Preview Area: Sticky 390px Phone Container (Desktop >= 1024px) */}
        <div className="hidden lg:block lg:col-span-5 xl:col-span-4 sticky top-6">
          <CustomerPreviewPhone
            profile={profile}
            logoUrl={logoUrl}
            colourMood={colourMood}
            highlightedSurface={highlightedSurface}
            onSelectSurface={handleHighlight}
          />
        </div>
      </div>

      {/* Floating "📱 View Customer Preview" Button for Mobile & Tablet (< 1024px) */}
      <div className="block lg:hidden fixed bottom-6 right-5 z-40">
        <button
          type="button"
          onClick={() => setPreviewModalOpen(true)}
          className="flex items-center gap-2.5 px-4.5 py-3.5 rounded-full bg-gradient-to-r from-[#1d2723] to-[#2a3832] border border-[#e8783c]/60 text-white font-bold text-xs shadow-2xl shadow-black/90 hover:scale-105 active:scale-95 transition-all"
        >
          <span className="text-base">📱</span>
          <span>View Customer Preview</span>
          {highlightedSurface && (
            <span className="px-1.5 py-0.5 rounded-full bg-[#e8783c] text-white text-[10px] font-mono">
              Active
            </span>
          )}
        </button>
      </div>

      {/* Responsive Bottom Sheet / Modal for Customer Preview (< 1024px) */}
      {previewModalOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[430px] bg-[#151c19] border border-[#2a3832] rounded-t-3xl sm:rounded-3xl p-4 max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#2a3832] mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">📱</span>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Customer Phone Preview
                  </h3>
                  <p className="text-[10px] text-slate-400">390px Mobile Viewport</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="p-1.5 rounded-full bg-[#1d2723] border border-[#2a3832] text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Phone inside Modal */}
            <div className="flex-1 overflow-y-auto scrollbar-hide py-2 flex justify-center">
              <CustomerPreviewPhone
                profile={profile}
                logoUrl={logoUrl}
                colourMood={colourMood}
                highlightedSurface={highlightedSurface}
                onSelectSurface={handleHighlight}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Reusable 390px Customer Phone Preview with Interactive Surface Glows
// ─────────────────────────────────────────────────────────────────────────────

interface CustomerPreviewPhoneProps {
  profile: CanonicalProfileData;
  logoUrl: string | null;
  colourMood: string;
  highlightedSurface: SurfaceTarget | null;
  onSelectSurface: (surface: SurfaceTarget) => void;
}

function CustomerPreviewPhone({
  profile,
  logoUrl,
  highlightedSurface,
  onSelectSurface,
}: CustomerPreviewPhoneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const guestBarRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const infoSheetRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const checkoutRef = useRef<HTMLDivElement>(null);

  // Auto-scroll inside mock phone when a surface is highlighted
  useEffect(() => {
    if (!highlightedSurface) return;
    const targetMap: Partial<Record<SurfaceTarget, React.RefObject<HTMLDivElement | null>>> = {
      guestBar: guestBarRef,
      cover: coverRef,
      infoSheet: infoSheetRef,
      inner: innerRef,
      about: aboutRef,
      checkout: checkoutRef,
      backCover: aboutRef,
      share: aboutRef,
      tent: coverRef,
      print: coverRef,
    };

    const ref = targetMap[highlightedSurface];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [highlightedSurface]);

  const activeContact = profile.contacts?.find((c) => c.public);
  const pureVeg = profile.dietDeclaration === 'PURE_VEG';

  return (
    <div className="w-full max-w-[390px] mx-auto bg-[#0e1311] border-[5px] border-[#2a3832] rounded-[42px] p-2.5 shadow-2xl shadow-black relative flex flex-col">
      {/* Phone Frame Header */}
      <div className="px-3 py-2 border-b border-[#2a3832]/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5 font-bold tracking-wider text-slate-300">
          <Eye size={12} className="text-[#e8783c]" />
          <span>LIVE DINER MOCK</span>
        </span>
        <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          Real-time
        </span>
      </div>

      {/* Quick Surface Selector Pills */}
      <div className="px-2 py-1.5 border-b border-[#2a3832]/40 flex items-center gap-1 overflow-x-auto scrollbar-hide text-[10px]">
        {(['guestBar', 'cover', 'infoSheet', 'about', 'checkout'] as SurfaceTarget[]).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => onSelectSurface(st)}
            className={`px-2 py-0.5 rounded-md whitespace-nowrap transition-all font-semibold ${
              highlightedSurface === st
                ? 'bg-[#e8783c] text-white shadow-sm font-bold'
                : 'bg-[#151c19] text-slate-400 hover:text-slate-200'
            }`}
          >
            {st === 'guestBar'
              ? 'Guest Bar'
              : st === 'cover'
              ? 'Cover'
              : st === 'infoSheet'
              ? 'Info (ⓘ)'
              : st === 'about'
              ? 'About'
              : 'Checkout'}
          </button>
        ))}
      </div>

      {/* Active Highlighting Banner */}
      {highlightedSurface && (
        <div className="mx-2 mt-1 px-2.5 py-1 rounded-lg bg-[#e8783c]/20 border border-[#e8783c]/50 flex items-center justify-between text-[10px] text-white animate-pulse">
          <span className="font-semibold">
            ✨ Pulsing Zone: <span className="uppercase font-bold">{highlightedSurface}</span>
          </span>
          <button
            type="button"
            onClick={() => onSelectSurface(highlightedSurface)}
            className="text-slate-300 hover:text-white"
            title="Clear highlight"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Mock Phone Screen Viewport */}
      <div
        ref={containerRef}
        className="mt-2 w-full bg-[#121614] rounded-[32px] overflow-hidden border border-[#2a3832] text-slate-100 flex flex-col h-[580px] overflow-y-auto scrollbar-hide relative text-left select-none"
      >
        {/* Dynamic Island / Top Notch */}
        <div className="sticky top-0 z-30 pt-2 pb-1 bg-[#121614]/90 backdrop-blur-md flex items-center justify-between px-6 text-[10px] font-mono text-slate-400">
          <span>12:45</span>
          <div className="w-20 h-4 bg-black rounded-full flex items-center justify-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-700" />
            <div className="w-1 h-1 rounded-full bg-slate-800" />
          </div>
          <span className="flex items-center gap-1">
            <span>5G</span>
            <span>94%</span>
          </span>
        </div>

        {/* ── Surface Zone 1: Guest Bar ────────────────────────────── */}
        <div
          ref={guestBarRef}
          className={`sticky top-7 z-20 px-3.5 py-2.5 bg-[#171e1a]/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between transition-all duration-300 ${
            highlightedSurface === 'guestBar'
              ? 'ring-2 ring-[#e8783c] shadow-[0_0_24px_rgba(232,120,60,0.8)] bg-[#e8783c]/20 animate-pulse'
              : ''
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 rounded-md bg-[#e8783c]/20 text-[#f49b6b] text-[10px] font-bold border border-[#e8783c]/40">
              Table 4
            </div>
            <span className="text-[11px] text-slate-300 font-semibold truncate max-w-[130px]">
              {profile.displayName || 'MenuQR'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-1 rounded-md text-slate-300 hover:text-white bg-white/5"
              title="Search menu"
            >
              <Search size={13} />
            </button>
            <button
              type="button"
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-semibold text-slate-200"
              title="Call server"
            >
              <Bell size={11} className="text-amber-400" />
              <span>Waiter</span>
            </button>
            <div className="relative p-1 rounded-md bg-[#e8783c]/20 text-[#f49b6b]">
              <ShoppingBag size={13} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#e8783c] text-white rounded-full text-[8px] flex items-center justify-center font-bold">
                2
              </span>
            </div>
          </div>
        </div>

        {/* ── Surface Zone 2: Cover Banner ─────────────────────────── */}
        <div
          ref={coverRef}
          className={`p-6 text-center border-b border-white/10 relative transition-all duration-300 ${
            highlightedSurface === 'cover'
              ? 'ring-2 ring-[#e8783c] shadow-[0_0_24px_rgba(232,120,60,0.8)] bg-[#e8783c]/20 animate-pulse'
              : 'bg-gradient-to-b from-[#1d2723] to-[#121614]'
          }`}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo"
              className="w-16 h-16 mx-auto mb-3 object-contain rounded-2xl shadow-lg border border-white/10 p-1 bg-black/40"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#e8783c] to-amber-600 text-white font-black flex items-center justify-center mx-auto mb-3 text-2xl shadow-lg">
              {profile.displayName?.charAt(0) || 'M'}
            </div>
          )}

          <h2 className="text-lg font-black tracking-tight text-white">
            {profile.displayName || 'Restaurant Name'}
          </h2>

          {profile.i18n?.hi?.name && (
            <div className="text-xs text-[#f49b6b] font-hindi font-medium mt-0.5">
              {profile.i18n.hi.name}
            </div>
          )}

          {profile.tagline && (
            <p className="text-xs text-slate-400 italic mt-1 font-serif">"{profile.tagline}"</p>
          )}

          {/* Badges row */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 text-[10px]">
            {pureVeg ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Pure Veg
              </span>
            ) : profile.dietDeclaration === 'VEG_AND_NON_VEG' ? (
              <span className="px-2 py-0.5 rounded-full bg-[#e8783c]/20 text-[#f49b6b] border border-[#e8783c]/40 font-semibold flex items-center gap-1">
                <span>● Veg & Non-Veg</span>
              </span>
            ) : null}

            {profile.establishedYear && (
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                Est. {profile.establishedYear}
              </span>
            )}
          </div>

          {/* Cuisine Pills */}
          {profile.cuisineTags && profile.cuisineTags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1 mt-2.5">
              {profile.cuisineTags.slice(0, 4).map((c) => (
                <span
                  key={c}
                  className="text-[10px] text-amber-200/90 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full"
                >
                  {c}
                </span>
              ))}
            </div>
          )}

          {/* Direct Reservation CTA if configured */}
          {profile.reservations && profile.reservations.mode !== 'none' && (
            <div className="mt-4">
              <button
                type="button"
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#e8783c] to-amber-500 text-white font-bold text-xs shadow-md shadow-[#e8783c]/20 flex items-center justify-center gap-1.5"
              >
                {profile.reservations.mode === 'whatsapp' ? (
                  <>
                    <MessageCircle size={14} />
                    <span>WhatsApp Table Reservation</span>
                  </>
                ) : profile.reservations.mode === 'call' ? (
                  <>
                    <Phone size={14} />
                    <span>Call to Reserve Table</span>
                  </>
                ) : (
                  <>
                    <ExternalLink size={14} />
                    <span>Book Table Online</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* ── Surface Zone 3: Info Sheet ───────────────────────────── */}
        <div
          ref={infoSheetRef}
          className={`p-4 space-y-3 text-xs border-b border-white/10 transition-all duration-300 ${
            highlightedSurface === 'infoSheet'
              ? 'ring-2 ring-[#e8783c] shadow-[0_0_24px_rgba(232,120,60,0.8)] bg-[#e8783c]/20 animate-pulse'
              : 'bg-[#151c19]/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Quick Details & Service
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
              <Clock size={11} />
              <span>Open Today</span>
            </span>
          </div>

          {/* Address */}
          {profile.address?.line ? (
            <div className="flex items-start gap-2 text-slate-300">
              <MapPin size={14} className="text-[#e8783c] shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>
                  {[profile.address.line, profile.address.city, profile.address.pincode]
                    .filter(Boolean)
                    .join(', ')}
                </span>
                {profile.maps?.url && (
                  <div className="text-[10px] text-[#f49b6b] mt-0.5 font-semibold">
                    Get Directions ↗
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-slate-500 italic">No address provided</div>
          )}

          {/* Public Phone */}
          {activeContact && (
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2 text-slate-300">
                <Phone size={14} className="text-emerald-400 shrink-0" />
                <span className="font-mono">{activeContact.number}</span>
                <span className="text-[10px] text-slate-500">({activeContact.label})</span>
              </div>
              {activeContact.whatsapp && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                  <MessageCircle size={10} />
                  <span>WhatsApp</span>
                </span>
              )}
            </div>
          )}

          {/* FSSAI */}
          {profile.fssai && (
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 pt-1 border-t border-white/5">
              <ShieldCheck size={12} className="text-emerald-400" />
              <span>FSSAI Lic. #{profile.fssai}</span>
            </div>
          )}
        </div>

        {/* ── Surface Zone 4: Inner Menu Dishes Preview ─────────────── */}
        <div
          ref={innerRef}
          className={`p-4 space-y-3 text-xs border-b border-white/10 transition-all duration-300 ${
            highlightedSurface === 'inner'
              ? 'ring-2 ring-[#e8783c] shadow-[0_0_24px_rgba(232,120,60,0.8)] bg-[#e8783c]/20 animate-pulse'
              : ''
          }`}
        >
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1">
            <span className="px-3 py-1 rounded-full bg-[#e8783c] text-white font-bold text-[10px]">
              🔥 Chef Specials
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 text-slate-400 text-[10px]">
              Starters
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 text-slate-400 text-[10px]">
              Main Course
            </span>
          </div>

          <div className="space-y-2 pt-1">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm border border-emerald-500 flex items-center justify-center p-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </span>
                  <span className="font-bold text-white text-xs">Paneer Butter Masala</span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1">
                  Slow-simmered rich tomato cashew gravy with hand-churned butter.
                </p>
                <div className="text-xs font-mono font-bold text-[#f49b6b] pt-1">₹340</div>
              </div>
              <button
                type="button"
                className="px-2.5 py-1 rounded-lg bg-[#e8783c]/20 text-[#f49b6b] font-bold text-[10px] border border-[#e8783c]/40 shrink-0"
              >
                ADD
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm border border-emerald-500 flex items-center justify-center p-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </span>
                  <span className="font-bold text-white text-xs">Dal Makhani Special</span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1">
                  Slow cooked overnight on charcoal tandoor with fresh cream.
                </p>
                <div className="text-xs font-mono font-bold text-[#f49b6b] pt-1">₹280</div>
              </div>
              <button
                type="button"
                className="px-2.5 py-1 rounded-lg bg-[#e8783c]/20 text-[#f49b6b] font-bold text-[10px] border border-[#e8783c]/40 shrink-0"
              >
                ADD
              </button>
            </div>
          </div>
        </div>

        {/* ── Surface Zone 5: About & Story ────────────────────────── */}
        <div
          ref={aboutRef}
          className={`p-4 space-y-3 text-xs border-b border-white/10 transition-all duration-300 ${
            highlightedSurface === 'about' ||
            highlightedSurface === 'backCover' ||
            highlightedSurface === 'share'
              ? 'ring-2 ring-[#e8783c] shadow-[0_0_24px_rgba(232,120,60,0.8)] bg-[#e8783c]/20 animate-pulse'
              : ''
          }`}
        >
          <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
            Our Story & Heritage
          </div>

          <p className="text-slate-400 text-xs leading-relaxed line-clamp-4">
            {profile.story ||
              'Crafting authentic dining memories using fresh local ingredients and traditional spices. Welcome to our table.'}
          </p>

          {/* Amenities Badges */}
          {profile.highlights && profile.highlights.length > 0 && (
            <div className="pt-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Amenities & Features
              </div>
              <div className="flex flex-wrap gap-1">
                {profile.highlights.slice(0, 6).map((h) => (
                  <span
                    key={h}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300"
                  >
                    ✓ {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Payment Methods */}
          {profile.payments && profile.payments.length > 0 && (
            <div className="pt-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Payments Accepted
              </div>
              <div className="flex flex-wrap gap-1 text-[10px] text-emerald-400 font-mono">
                {profile.payments.map((p) => (
                  <span key={p} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Surface Zone 6: Checkout / Sticky Bottom Bar ─────────── */}
        <div
          ref={checkoutRef}
          className={`mt-auto sticky bottom-0 z-30 p-3 border-t border-white/10 bg-[#121614]/95 backdrop-blur-md transition-all duration-300 ${
            highlightedSurface === 'checkout'
              ? 'ring-2 ring-[#e8783c] shadow-[0_0_24px_rgba(232,120,60,0.8)] bg-[#e8783c]/20 animate-pulse'
              : ''
          }`}
        >
          {profile.priceNote && (
            <div className="text-[9px] text-center text-slate-400 mb-1.5 tracking-wide">
              {profile.priceNote}
            </div>
          )}

          <div className="p-2.5 rounded-xl bg-gradient-to-r from-[#e8783c] to-amber-500 text-white flex items-center justify-between shadow-lg">
            <div>
              <div className="text-[10px] opacity-90 uppercase tracking-wider font-bold">
                Table 4 • 2 Items
              </div>
              <div className="text-xs font-black font-mono">₹620</div>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold bg-black/20 px-3 py-1 rounded-lg">
              <span>View Order</span>
              <ChevronRight size={13} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
