import { useEffect, useState, useRef } from 'react';
import {
  getProfile,
  updateSettings,
  getGoogleReviewsAddon,
  updateGoogleReviewsAddon,
  deleteGoogleReviewsAddon,
  saveVoiceGreeting,
  previewVoiceGreeting,
  saveMenuFeatures,
  type AppProfile,
  type GoogleReviewsAddonStatus,
  type MenuFeaturesInput,
} from './appStore';
import {
  Star,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Trash2,
  HelpCircle,
  Save,
  Clock,
  Sparkles,
  Volume2,
  Play,
  Pause,
  Link as LinkIcon,
  Building2,
  Phone,
  MapPin,
  Utensils,
  Globe,
  Loader2,
  Share2,
  BellRing,
  MessageCircle,
  Filter,
  Flame,
  Languages,
  Type,
  ToggleLeft,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../../components/feedback/ToastProvider';

function InstagramIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export default function Settings() {
  const showToast = useToast();
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [addonStatus, setAddonStatus] = useState<GoogleReviewsAddonStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaurant Profile & Account Setup Form State
  const [profileForm, setProfileForm] = useState({
    businessName: '',
    tagline: '',
    cuisine: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    openingHours: '',
    logoUrl: '',
    instagram: '',
    facebook: '',
    website: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // AI Voice Greeting state
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceStyle, setVoiceStyle] = useState<'hinglish_warm' | 'hindi_respectful' | 'english_welcome' | 'custom'>('hinglish_warm');
  const [voiceCustomText, setVoiceCustomText] = useState('');
  const [voiceGender, setVoiceGender] = useState<'female' | 'male'>('female');
  const [savingVoice, setSavingVoice] = useState(false);
  const [previewingVoice, setPreviewingVoice] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [activeVoiceUrl, setActiveVoiceUrl] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Menu Features — one toggle panel for every optional customer-facing control, including the
  // existing Call Waiter button down to its individual request types. Defaults mirror
  // `backend/menuFeatures.js`'s DEFAULT_MENU_FEATURES exactly, so the panel never flashes a
  // different state than what the server will return once `getProfile()` resolves.
  const [menuFeatures, setMenuFeatures] = useState<MenuFeaturesInput>({
    callWaiter: { enabled: true, types: ['WATER', 'WAITER', 'BILL'] },
    whatsappChat: { enabled: false, number: null },
    allergenFilter: { enabled: true },
    spiceFilter: { enabled: true },
    trending: { enabled: true },
    multiLanguage: { enabled: false },
    accessibilityControls: { enabled: true },
  });
  const [savingMenuFeatures, setSavingMenuFeatures] = useState(false);

  // Review URL form state
  const [reviewUrlInput, setReviewUrlInput] = useState('');
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [savingReview, setSavingReview] = useState(false);
  const [deletingReview, setDeletingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    Promise.all([
      getProfile().catch(console.error),
      getGoogleReviewsAddon().catch(console.error),
    ])
      .then(([prof, addon]) => {
        if (prof) {
          setProfile(prof);
          const vg = (prof.accentConfiguration as any)?.voiceGreeting;
          if (vg) {
            setVoiceEnabled(Boolean(vg.enabled));
            setVoiceStyle(vg.messageStyle || 'hinglish_warm');
            setVoiceCustomText(vg.customText || '');
            setVoiceGender(vg.voiceGender || 'female');
            setActiveVoiceUrl(vg.audioUrl || null);
          }
          const mf = (prof.accentConfiguration as any)?.menuFeatures;
          if (mf) {
            setMenuFeatures({
              callWaiter: {
                enabled: mf.callWaiter?.enabled !== false,
                types: Array.isArray(mf.callWaiter?.types) && mf.callWaiter.types.length > 0
                  ? mf.callWaiter.types
                  : ['WATER', 'WAITER', 'BILL'],
              },
              whatsappChat: { enabled: Boolean(mf.whatsappChat?.enabled), number: mf.whatsappChat?.number ?? null },
              allergenFilter: { enabled: mf.allergenFilter?.enabled !== false },
              spiceFilter: { enabled: mf.spiceFilter?.enabled !== false },
              trending: { enabled: mf.trending?.enabled !== false },
              multiLanguage: { enabled: Boolean(mf.multiLanguage?.enabled) },
              accessibilityControls: { enabled: mf.accessibilityControls?.enabled !== false },
            });
          }
          setProfileForm({
            businessName: prof.businessName || '',
            tagline: prof.tagline || '',
            cuisine: prof.cuisine || '',
            phone: prof.phone || '',
            address: prof.address || '',
            city: prof.city || '',
            state: prof.state || '',
            openingHours: prof.openingHours || '',
            logoUrl: prof.logoUrl || '',
            instagram: prof.instagram || '',
            facebook: prof.facebook || '',
            website: prof.website || '',
          });
        }
        if (addon) {
          setAddonStatus(addon);
          setReviewUrlInput(addon.reviewUrl || '');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePreviewVoice = async () => {
    setPreviewingVoice(true);
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    try {
      const res = await previewVoiceGreeting({
        messageStyle: voiceStyle,
        customText: voiceCustomText,
        voiceGender,
      });
      const audio = new Audio(res.audioBase64);
      previewAudioRef.current = audio;
      audio.onplay = () => setIsPlayingPreview(true);
      audio.onended = () => setIsPlayingPreview(false);
      audio.onpause = () => setIsPlayingPreview(false);
      await audio.play();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to preview voice greeting.');
    } finally {
      setPreviewingVoice(false);
    }
  };

  const handleSaveVoice = async () => {
    setSavingVoice(true);
    try {
      const res = await saveVoiceGreeting({
        enabled: voiceEnabled,
        messageStyle: voiceStyle,
        customText: voiceCustomText,
        voiceGender,
      });
      if (res.voiceGreeting?.audioUrl) {
        setActiveVoiceUrl(res.voiceGreeting.audioUrl);
      }
      showToast('success', voiceEnabled ? 'AI Table Voice Greeting activated!' : 'Voice Greeting turned off.');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update voice greeting.');
    } finally {
      setSavingVoice(false);
    }
  };

  const handleSaveMenuFeatures = async () => {
    setSavingMenuFeatures(true);
    try {
      await saveMenuFeatures(menuFeatures);
      showToast('success', 'Menu feature settings saved.');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update menu features.');
    } finally {
      setSavingMenuFeatures(false);
    }
  };

  const toggleCallWaiterType = (type: 'WATER' | 'WAITER' | 'BILL') => {
    setMenuFeatures((prev) => {
      const has = prev.callWaiter.types.includes(type);
      const nextTypes = has ? prev.callWaiter.types.filter((t) => t !== type) : [...prev.callWaiter.types, type];
      // Never leave zero types selected while the feature itself is on — that would silently
      // break the customer-facing modal rather than communicate "off".
      return { ...prev, callWaiter: { ...prev.callWaiter, types: nextTypes.length > 0 ? nextTypes : prev.callWaiter.types } };
    });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.businessName.trim()) {
      setProfileMessage({ type: 'error', text: 'Business / Restaurant Name is required.' });
      return;
    }

    setSavingProfile(true);
    setProfileMessage(null);
    try {
      const updated = await updateSettings({
        businessName: profileForm.businessName.trim(),
        tagline: profileForm.tagline.trim() || null,
        cuisine: profileForm.cuisine.trim() || null,
        phone: profileForm.phone.trim() || null,
        address: profileForm.address.trim() || null,
        city: profileForm.city.trim() || null,
        state: profileForm.state.trim() || null,
        openingHours: profileForm.openingHours.trim() || null,
        logoUrl: profileForm.logoUrl.trim() || null,
        instagram: profileForm.instagram.trim() || null,
        facebook: profileForm.facebook.trim() || null,
        website: profileForm.website.trim() || null,
      });

      setProfile((prev) => (prev ? { ...prev, ...updated } : updated));
      setProfileMessage({ type: 'success', text: 'Restaurant account details and social links saved successfully! Your digital menu is updated.' });
      showToast('success', 'Restaurant profile updated successfully!');
    } catch (err: any) {
      const msg = err.message || 'Failed to update restaurant profile.';
      setProfileMessage({ type: 'error', text: msg });
      showToast('error', msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewUrlInput.trim()) {
      setReviewMessage({ type: 'error', text: 'Please enter a valid Google review link.' });
      return;
    }
    setSavingReview(true);
    setReviewMessage(null);
    try {
      const res = await updateGoogleReviewsAddon(reviewUrlInput.trim());
      setAddonStatus((prev) =>
        prev
          ? {
              ...prev,
              status: res.status as any,
              reviewUrl: res.reviewUrl,
              updatedAt: res.updatedAt,
            }
          : null
      );
      setReviewUrlInput(res.reviewUrl);
      setIsEditingReview(false);
      setReviewMessage({ type: 'success', text: 'Google review link saved successfully! Your menu will now display the review button.' });
      showToast('success', 'Google review link saved!');
    } catch (err: any) {
      setReviewMessage({ type: 'error', text: err.message || 'Failed to save Google review link.' });
    } finally {
      setSavingReview(false);
    }
  };

  const handleClearUrl = async () => {
    if (!window.confirm('Are you sure you want to remove your Google review link? The review button will be hidden from your menu.')) return;
    setDeletingReview(true);
    setReviewMessage(null);
    try {
      const res = await deleteGoogleReviewsAddon();
      setAddonStatus((prev) =>
        prev
          ? {
              ...prev,
              status: res.status as any,
              reviewUrl: null,
            }
          : null
      );
      setReviewUrlInput('');
      setIsEditingReview(true);
      setReviewMessage({ type: 'success', text: 'Google review link removed.' });
      showToast('info', 'Google review link removed.');
    } catch (err: any) {
      setReviewMessage({ type: 'error', text: err.message || 'Failed to remove link.' });
    } finally {
      setDeletingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-[#e8783c]"></div>
      </div>
    );
  }

  const status = addonStatus?.status || 'NOT_SUBSCRIBED';
  const canConfigure = addonStatus?.canConfigure ?? false;

  return (
    <div className="space-y-8 max-w-4xl pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Restaurant Settings & Profile</h1>
          <p className="mt-1 text-sm text-[#849a90]">
            Complete your restaurant account setup, contact details, social media links, and integrations.
          </p>
        </div>
        {profile?.menuSlug && (
          <Link
            to={`/menu/${profile.menuSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#25322d] hover:bg-[#2e3e37] text-white px-4 py-2.5 text-xs font-bold border border-[#36473f] transition-all self-start sm:self-center shadow-sm"
          >
            <span>View Live QR Menu</span>
            <ExternalLink size={14} className="text-[#e8783c]" />
          </Link>
        )}
      </div>

      {/* ── 1. Comprehensive Restaurant Account & Profile Setup ──────────────── */}
      <form onSubmit={handleSaveProfile} className="rounded-2xl border border-[#2a3832] bg-[#1d2723] p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#2a3832] pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8783c]/10 text-[#e8783c]">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Restaurant Account Setup</h2>
              <p className="text-xs text-[#849a90] mt-0.5">
                Set up your restaurant brand, cuisine, contact info, and social channels.
              </p>
            </div>
          </div>
          <button
            type="submit"
            disabled={savingProfile}
            className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-[#e8783c] hover:bg-[#d66a30] text-white px-5 py-2.5 text-xs font-bold transition-all shadow-md shadow-[#e8783c]/20 disabled:opacity-50 cursor-pointer"
          >
            {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{savingProfile ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>

        {profileMessage && (
          <div
            className={`rounded-xl p-4 flex items-start gap-3 text-xs font-medium border ${
              profileMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
            }`}
          >
            {profileMessage.type === 'success' ? (
              <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1 leading-relaxed">{profileMessage.text}</div>
          </div>
        )}

        {/* Core Restaurant Information */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#849a90] flex items-center gap-1.5">
            <Utensils size={14} className="text-[#e8783c]" />
            <span>Basic Restaurant Info</span>
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#f3f4f6] mb-1.5">
                Restaurant / Business Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={profileForm.businessName}
                onChange={(e) => setProfileForm({ ...profileForm, businessName: e.target.value })}
                placeholder="e.g. Spice Garden Restaurant"
                className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e8783c] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#f3f4f6] mb-1.5">
                Tagline / Slogan
              </label>
              <input
                type="text"
                value={profileForm.tagline}
                onChange={(e) => setProfileForm({ ...profileForm, tagline: e.target.value })}
                placeholder="e.g. Authentic Pure Vegetarian Delicacies"
                className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e8783c] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#f3f4f6] mb-1.5">
                Cuisine / Category
              </label>
              <input
                type="text"
                value={profileForm.cuisine}
                onChange={(e) => setProfileForm({ ...profileForm, cuisine: e.target.value })}
                placeholder="e.g. North Indian, Fast Food, Cafe"
                className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e8783c] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#f3f4f6] mb-1.5">
                Opening Hours
              </label>
              <input
                type="text"
                value={profileForm.openingHours}
                onChange={(e) => setProfileForm({ ...profileForm, openingHours: e.target.value })}
                placeholder="e.g. 10:00 AM – 11:30 PM (Daily)"
                className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e8783c] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Contact & Location */}
        <div className="space-y-4 pt-3 border-t border-[#2a3832]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#849a90] flex items-center gap-1.5">
            <MapPin size={14} className="text-[#e8783c]" />
            <span>Contact & Location (Visible on Menu)</span>
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#f3f4f6] mb-1.5">
                Contact Phone / WhatsApp
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#62756d]">
                  <Phone size={14} />
                </span>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e8783c] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#f3f4f6] mb-1.5">City</label>
              <input
                type="text"
                value={profileForm.city}
                onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                placeholder="e.g. Jaipur"
                className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e8783c] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#f3f4f6] mb-1.5">State</label>
              <input
                type="text"
                value={profileForm.state}
                onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                placeholder="e.g. Rajasthan"
                className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e8783c] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#f3f4f6] mb-1.5">
              Full Restaurant Address
            </label>
            <input
              type="text"
              value={profileForm.address}
              onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
              placeholder="e.g. NH-44, GT Road, Murthal, Haryana"
              className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e8783c] transition-all"
            />
          </div>
        </div>

        {/* ── Social Media & Online Links (Optional) ─────────────────────────── */}
        <div className="space-y-4 pt-3 border-t border-[#2a3832]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#849a90] flex items-center gap-1.5">
              <Share2 size={14} className="text-[#e8783c]" />
              <span>Social Media & Web Links (Optional)</span>
            </h3>
            <span className="text-[11px] text-[#62756d]">
              Shown directly on your customer digital menu
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Instagram */}
            <div>
              <label className="block text-xs font-semibold text-[#f3f4f6] mb-1.5 flex items-center gap-1.5">
                <span className="text-pink-400"><InstagramIcon size={14} /></span>
                <span>Instagram Profile Link / Handle (Optional)</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#62756d]">
                  <InstagramIcon size={14} />
                </span>
                <input
                  type="text"
                  value={profileForm.instagram}
                  onChange={(e) => setProfileForm({ ...profileForm, instagram: e.target.value })}
                  placeholder="https://instagram.com/yourrestaurant or @yourrestaurant"
                  className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e8783c] transition-all font-mono text-xs"
                />
              </div>
              <p className="mt-1 text-[11px] text-[#62756d]">
                Customers can click to view your Instagram photos & reels.
              </p>
            </div>

            {/* Facebook */}
            <div>
              <label className="block text-xs font-semibold text-[#f3f4f6] mb-1.5 flex items-center gap-1.5">
                <span className="text-blue-400"><FacebookIcon size={14} /></span>
                <span>Facebook Page Link (Optional)</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#62756d]">
                  <FacebookIcon size={14} />
                </span>
                <input
                  type="text"
                  value={profileForm.facebook}
                  onChange={(e) => setProfileForm({ ...profileForm, facebook: e.target.value })}
                  placeholder="https://facebook.com/yourrestaurant"
                  className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e8783c] transition-all font-mono text-xs"
                />
              </div>
              <p className="mt-1 text-[11px] text-[#62756d]">
                Link to your official Facebook page or community.
              </p>
            </div>

            {/* Website */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#f3f4f6] mb-1.5 flex items-center gap-1.5">
                <Globe size={14} className="text-emerald-400" />
                <span>Website / Custom Link (Optional)</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#62756d]">
                  <Globe size={14} />
                </span>
                <input
                  type="url"
                  value={profileForm.website}
                  onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                  placeholder="https://yourrestaurant.com"
                  className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e8783c] transition-all font-mono text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Logo URL */}
        <div className="pt-3 border-t border-[#2a3832]">
          <label className="block text-xs font-semibold text-[#f3f4f6] mb-1.5">
            Restaurant Logo Image URL
          </label>
          <div className="flex gap-4 items-center">
            {profileForm.logoUrl && (
              <img
                src={profileForm.logoUrl}
                alt="Logo preview"
                className="w-12 h-12 rounded-xl object-contain bg-white/5 border border-[#2a3832] p-1 shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                decoding="async"
                loading="lazy"
              />
            )}
            <input
              type="url"
              value={profileForm.logoUrl}
              onChange={(e) => setProfileForm({ ...profileForm, logoUrl: e.target.value })}
              placeholder="https://example.com/logo.png"
              className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e8783c] transition-all font-mono text-xs"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-[#2a3832] flex items-center justify-end">
          <button
            type="submit"
            disabled={savingProfile}
            className="inline-flex items-center gap-2 rounded-xl bg-[#e8783c] hover:bg-[#d66a30] text-white px-6 py-3 text-xs font-bold transition-all shadow-md shadow-[#e8783c]/20 disabled:opacity-50 cursor-pointer"
          >
            {savingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{savingProfile ? 'Saving Changes...' : 'Save Restaurant Setup & Social Links'}</span>
          </button>
        </div>
      </form>

      {/* ── 2. AI Table Voice Greeting (Smart Host / Hostess) ──────────────── */}
      <div className="bg-[#1d2723] rounded-2xl p-6 md:p-8 border border-[#2a3832] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-[#2a3832]">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20 shrink-0 mt-0.5">
              <Volume2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">AI Table Voice Greeting</h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 text-[10px] font-bold border border-amber-400/30">
                  Real AI Hostess
                </span>
              </div>
              <p className="text-xs text-[#849a90] mt-1 leading-relaxed max-w-xl">
                Plays a natural, warm voice greeting in authentic Hinglish or Hindi when diners scan your table QR code.
              </p>
            </div>
          </div>

          <label className="inline-flex items-center gap-3 cursor-pointer select-none">
            <span className="text-xs font-semibold text-white/80">
              {voiceEnabled ? 'Enabled' : 'Disabled'}
            </span>
            <input
              type="checkbox"
              checked={voiceEnabled}
              onChange={(e) => setVoiceEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>

        {voiceEnabled && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Voice Style Choice */}
            <div>
              <label className="block text-xs font-semibold text-[#f3f4f6] mb-2.5">
                Greeting Style & Language
              </label>
              <div className="grid sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setVoiceStyle('hinglish_warm')}
                  className={`rounded-xl p-3.5 border cursor-pointer transition-all ${
                    voiceStyle === 'hinglish_warm'
                      ? 'border-amber-400 bg-amber-400/10'
                      : 'border-[#2a3832] bg-[#151c19] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">🌸 Warm Hinglish Hostess (Recommended)</span>
                    {voiceStyle === 'hinglish_warm' && <CheckCircle2 className="h-4 w-4 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-[#849a90] italic">
                    "नमस्ते! Welcome to {profileForm.businessName || 'Our Restaurant'}! Please menu dekhiye aur bataiye aaj aapke liye kya layein!"
                  </p>
                </div>

                <div
                  onClick={() => setVoiceStyle('hindi_respectful')}
                  className={`rounded-xl p-3.5 border cursor-pointer transition-all ${
                    voiceStyle === 'hindi_respectful'
                      ? 'border-amber-400 bg-amber-400/10'
                      : 'border-[#2a3832] bg-[#151c19] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">🙏 Traditional Respectful Hindi</span>
                    {voiceStyle === 'hindi_respectful' && <CheckCircle2 className="h-4 w-4 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-[#849a90] italic">
                    "नमस्ते! {profileForm.businessName || 'Our Restaurant'} में आपका हार्दिक स्वागत है! बताइए, आज आप क्या खाना पसंद करेंगे?"
                  </p>
                </div>

                <div
                  onClick={() => setVoiceStyle('english_welcome')}
                  className={`rounded-xl p-3.5 border cursor-pointer transition-all ${
                    voiceStyle === 'english_welcome'
                      ? 'border-amber-400 bg-amber-400/10'
                      : 'border-[#2a3832] bg-[#151c19] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">🌟 Modern Hospitality English</span>
                    {voiceStyle === 'english_welcome' && <CheckCircle2 className="h-4 w-4 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-[#849a90] italic">
                    "Hello and welcome to {profileForm.businessName || 'Our Restaurant'}! Please explore our fresh menu and enjoy your meal!"
                  </p>
                </div>

                <div
                  onClick={() => setVoiceStyle('custom')}
                  className={`rounded-xl p-3.5 border cursor-pointer transition-all ${
                    voiceStyle === 'custom'
                      ? 'border-amber-400 bg-amber-400/10'
                      : 'border-[#2a3832] bg-[#151c19] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">✍️ Custom Greeting Message</span>
                    {voiceStyle === 'custom' && <CheckCircle2 className="h-4 w-4 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-[#849a90]">
                    Write your own customized welcome line in Hindi or Hinglish.
                  </p>
                </div>
              </div>

              {voiceStyle === 'custom' && (
                <div className="mt-3">
                  <textarea
                    rows={2}
                    value={voiceCustomText}
                    onChange={(e) => setVoiceCustomText(e.target.value.slice(0, 200))}
                    placeholder="e.g. नमस्ते! हमारे ढाबे पर पधारने के लिए शुक्रिया, आज की स्पेशल कड़ाही पनीर जरूर ट्राई करें!"
                    className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400"
                  />
                  <div className="text-right text-[10px] text-[#849a90] mt-0.5">{voiceCustomText.length}/200</div>
                </div>
              )}
            </div>

            {/* Voice Gender Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#f3f4f6] mb-2">
                Voice Character
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setVoiceGender('female')}
                  className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                    voiceGender === 'female'
                      ? 'border-amber-400 bg-amber-400/15 text-amber-300 font-bold'
                      : 'border-[#2a3832] bg-[#151c19] text-[#849a90]'
                  }`}
                >
                  Sweet Hostess (Female)
                </button>
                <button
                  type="button"
                  onClick={() => setVoiceGender('male')}
                  className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                    voiceGender === 'male'
                      ? 'border-amber-400 bg-amber-400/15 text-amber-300 font-bold'
                      : 'border-[#2a3832] bg-[#151c19] text-[#849a90]'
                  }`}
                >
                  Welcoming Host (Male)
                </button>
              </div>
            </div>

            {/* Preview and Save Action Bar */}
            <div className="pt-3 border-t border-[#2a3832] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handlePreviewVoice}
                disabled={previewingVoice}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-colors disabled:opacity-50 cursor-pointer"
              >
                {previewingVoice ? (
                  <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                ) : isPlayingPreview ? (
                  <Pause className="h-4 w-4 text-amber-400" />
                ) : (
                  <Play className="h-4 w-4 text-amber-400" />
                )}
                <span>{previewingVoice ? 'Generating AI Voice...' : isPlayingPreview ? 'Playing Voice...' : 'Listen Live Preview'}</span>
              </button>

              {activeVoiceUrl && (
                <div className="flex items-center gap-2 text-xs text-[#849a90]">
                  <span>Saved Audio:</span>
                  <audio controls src={activeVoiceUrl} className="h-7 w-40 rounded opacity-80" />
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveVoice}
                disabled={savingVoice}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-5 py-2.5 text-xs font-bold transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
              >
                {savingVoice ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving Greeting...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save & Activate Voice Greeting</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {!voiceEnabled && (
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleSaveVoice}
              disabled={savingVoice}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 text-white px-5 py-2 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
            >
              {savingVoice ? 'Saving...' : 'Save Setting'}
            </button>
          </div>
        )}
      </div>

      {/* ── 2.5 Menu Features — pick what's live on the customer menu ──────────────── */}
      <div className="bg-[#1d2723] rounded-2xl p-6 md:p-8 border border-[#2a3832] space-y-5">
        <div className="flex items-start gap-3 pb-5 border-b border-[#2a3832]">
          <div className="p-2.5 rounded-xl bg-sky-400/10 text-sky-400 border border-sky-400/20 shrink-0 mt-0.5">
            <ToggleLeft className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Menu Features</h2>
            <p className="text-xs text-[#849a90] mt-1 leading-relaxed max-w-xl">
              Turn each customer-facing control on or off. Defaults match what your menu already
              does — nothing changes here until you flip a switch.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Call Waiter — the one existing feature this panel also now controls */}
          <div className="rounded-xl border border-[#2a3832] bg-[#151c19] p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <BellRing size={16} className="text-[#e8783c] shrink-0" />
                <div>
                  <p className="text-sm font-bold text-white">Call Waiter / Request Bill</p>
                  <p className="text-[11px] text-[#849a90]">Floating button on the customer menu for table service requests.</p>
                </div>
              </div>
              <label className="inline-flex items-center cursor-pointer select-none shrink-0">
                <input
                  type="checkbox"
                  checked={menuFeatures.callWaiter.enabled}
                  onChange={(e) => setMenuFeatures((p) => ({ ...p, callWaiter: { ...p.callWaiter, enabled: e.target.checked } }))}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e8783c]" />
              </label>
            </div>
            {menuFeatures.callWaiter.enabled && (
              <div className="flex flex-wrap gap-2 pl-7">
                {([
                  ['WATER', '💧 Water'],
                  ['WAITER', '🙋 Waiter'],
                  ['BILL', '🧾 Bill'],
                ] as const).map(([type, label]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleCallWaiterType(type)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                      menuFeatures.callWaiter.types.includes(type)
                        ? 'border-[#e8783c] bg-[#e8783c]/15 text-[#e8783c]'
                        : 'border-[#2a3832] bg-[#151c19] text-[#849a90]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* WhatsApp Chat */}
          <div className="rounded-xl border border-[#2a3832] bg-[#151c19] p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <MessageCircle size={16} className="text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-white">Chat on WhatsApp</p>
                  <p className="text-[11px] text-[#849a90]">A direct WhatsApp link on your menu, using your phone number unless you set one below.</p>
                </div>
              </div>
              <label className="inline-flex items-center cursor-pointer select-none shrink-0">
                <input
                  type="checkbox"
                  checked={menuFeatures.whatsappChat.enabled}
                  onChange={(e) => setMenuFeatures((p) => ({ ...p, whatsappChat: { ...p.whatsappChat, enabled: e.target.checked } }))}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
              </label>
            </div>
            {menuFeatures.whatsappChat.enabled && (
              <div className="pl-7">
                <input
                  type="tel"
                  value={menuFeatures.whatsappChat.number ?? ''}
                  onChange={(e) => setMenuFeatures((p) => ({ ...p, whatsappChat: { ...p.whatsappChat, number: e.target.value || null } }))}
                  placeholder={`Optional override — defaults to ${profileForm.phone || 'your profile phone'}`}
                  className="w-full max-w-sm bg-[#1d2723] border border-[#2a3832] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400"
                />
              </div>
            )}
          </div>

          {/* Simple on/off rows for the rest. Icon colour classes are written out in full below
            * (not built from a template string) because Tailwind's build-time scanner can only
            * keep classes it can see as literal text — an interpolated `text-${color}-400` would
            * silently be missing from the shipped CSS. */}
          {([
            ['allergenFilter', Filter, 'text-sky-400', 'Allergen filter', 'Lets guests filter out dishes containing an allergen you’ve tagged.'],
            ['spiceFilter', Flame, 'text-rose-400', 'Spice-level filter', 'Lets guests filter by how spicy a dish is.'],
            ['trending', Flame, 'text-amber-400', 'Trending Now badge', 'Shows a badge on dishes ordered often today.'],
            ['multiLanguage', Languages, 'text-violet-400', 'Multi-language menu', 'Shows a language switch for dishes you’ve translated.'],
            ['accessibilityControls', Type, 'text-slate-400', 'Text-size control', 'Shows a small A+ / A− control for guests who want larger text.'],
          ] as const).map(([key, Icon, colorClass, label, desc]) => (
            <div key={key} className="rounded-xl border border-[#2a3832] bg-[#151c19] p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Icon size={16} className={`${colorClass} shrink-0`} />
                <div>
                  <p className="text-sm font-bold text-white">{label}</p>
                  <p className="text-[11px] text-[#849a90]">{desc}</p>
                </div>
              </div>
              <label className="inline-flex items-center cursor-pointer select-none shrink-0">
                <input
                  type="checkbox"
                  checked={menuFeatures[key].enabled}
                  onChange={(e) => setMenuFeatures((p) => ({ ...p, [key]: { enabled: e.target.checked } }))}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e8783c]" />
              </label>
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleSaveMenuFeatures}
            disabled={savingMenuFeatures}
            className="inline-flex items-center gap-2 rounded-xl bg-[#e8783c] hover:bg-[#d66a30] text-white px-5 py-2.5 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
          >
            {savingMenuFeatures ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {savingMenuFeatures ? 'Saving...' : 'Save Menu Features'}
          </button>
        </div>
      </div>

      {/* ── 3. Google Reviews Add-on Section ─────────────────────────────────── */}
      <div className="rounded-2xl border border-[#2a3832] bg-[#1d2723] p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a3832] pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
              <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Google Reviews</h2>
                <span className="rounded-full bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Add-on
                </span>
              </div>
              <p className="text-xs text-[#849a90] mt-0.5">
                Display a direct &quot;Write a Google Review&quot; button on your live QR menu.
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="self-start sm:self-center">
            {status === 'ACTIVE' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 size={13} /> Active on Menu
              </span>
            )}
            {status === 'SETUP_REQUIRED' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
                <AlertCircle size={13} /> Setup Required
              </span>
            )}
            {status === 'EXPIRED' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-400 border border-rose-500/20">
                <Clock size={13} /> Add-on Expired
              </span>
            )}
            {status === 'NOT_SUBSCRIBED' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#25322d] px-3 py-1 text-xs font-semibold text-[#849a90] border border-[#36473f]">
                Not Subscribed
              </span>
            )}
          </div>
        </div>

        {/* Feedback alert */}
        {reviewMessage && (
          <div
            className={`rounded-xl p-4 flex items-start gap-3 text-xs font-medium border ${
              reviewMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
            }`}
          >
            {reviewMessage.type === 'success' ? <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" /> : <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />}
            <div className="flex-1 leading-relaxed">{reviewMessage.text}</div>
          </div>
        )}

        {/* Configuration for Subscribed Users */}
        {canConfigure ? (
          <div className="space-y-6">
            <div className="rounded-xl bg-[#151c19]/70 border border-[#2a3832] p-4 text-xs text-[#849a90] space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold">
                <HelpCircle size={15} className="text-[#e8783c]" />
                <span>How to get your Google Review link:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px] leading-relaxed">
                <li>Search for your business on Google or open your <strong>Google Business Profile</strong> dashboard.</li>
                <li>Click <strong>&quot;Ask for reviews&quot;</strong> (or &quot;Get more reviews&quot;).</li>
                <li>Copy the short review link provided by Google (e.g., <code className="text-[#f29a66]">https://g.page/r/.../review</code> or <code className="text-[#f29a66]">https://search.google.com/local/writereview?...</code>).</li>
                <li>Paste the URL below and click Save.</li>
              </ol>
            </div>

            <form onSubmit={handleSaveUrl} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#f3f4f6] mb-1.5">
                  Official Google Review URL
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#62756d]">
                    <LinkIcon size={14} />
                  </span>
                  <input
                    type="url"
                    disabled={!isEditingReview && Boolean(addonStatus?.reviewUrl)}
                    value={reviewUrlInput}
                    onChange={(e) => setReviewUrlInput(e.target.value)}
                    placeholder="https://g.page/r/your-restaurant/review"
                    className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e8783c] focus:ring-1 focus:ring-[#e8783c33] disabled:opacity-60 transition-all font-mono"
                  />
                </div>
                <p className="mt-1 text-[11px] text-[#62756d]">
                  Must be an official HTTPS link on Google domains (g.page, google.com, goo.gl, etc.).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                {!isEditingReview && Boolean(addonStatus?.reviewUrl) ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditingReview(true)}
                      className="rounded-xl bg-[#25322d] hover:bg-[#2e3e37] text-white px-4 py-2 text-xs font-semibold border border-[#36473f] transition-colors"
                    >
                      Edit Link
                    </button>
                    <a
                      href={addonStatus?.reviewUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white px-4 py-2 text-xs font-semibold border border-white/10 transition-colors"
                    >
                      <span>Preview in New Tab</span>
                      <ExternalLink size={13} />
                    </a>
                    <button
                      type="button"
                      onClick={handleClearUrl}
                      disabled={deletingReview}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 px-4 py-2 text-xs font-semibold border border-rose-500/20 transition-colors ml-auto disabled:opacity-50"
                    >
                      <Trash2 size={13} />
                      {deletingReview ? 'Removing...' : 'Remove'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="submit"
                      disabled={savingReview || !reviewUrlInput.trim()}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#e8783c] hover:bg-[#d66a30] text-white px-5 py-2.5 text-xs font-bold transition-all shadow-md shadow-[#e8783c]/20 disabled:opacity-50 cursor-pointer"
                    >
                      <Save size={14} />
                      {savingReview ? 'Saving...' : 'Save & Publish on Menu'}
                    </button>
                    {addonStatus?.reviewUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setReviewUrlInput(addonStatus.reviewUrl || '');
                          setIsEditingReview(false);
                        }}
                        className="rounded-xl bg-transparent hover:bg-white/5 text-[#849a90] px-4 py-2 text-xs font-medium transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </>
                )}
              </div>
            </form>

            {/* Addon details / metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#2a3832] text-[11px] text-[#62756d]">
              <div>
                <span className="font-semibold text-[#849a90]">Valid until: </span>
                {addonStatus?.expiresAt
                  ? new Date(addonStatus.expiresAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Subscription term'}
              </div>
              {addonStatus?.updatedAt && (
                <div>
                  <span className="font-semibold text-[#849a90]">Last updated: </span>
                  {new Date(addonStatus.updatedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-[#151c19]/50 border border-[#2a3832] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
                <Sparkles size={16} className="text-amber-400" />
                <span>
                  {status === 'EXPIRED' ? 'Add-on Expired' : 'Get Google Reviews Integration'}
                </span>
              </div>
              <p className="text-xs text-[#849a90] max-w-lg leading-relaxed">
                {status === 'EXPIRED'
                  ? 'Your Google Reviews add-on has expired. Renew your add-on with your subscription to restore the review button on your live menu.'
                  : 'Turn your dine-in guests into 5-star Google reviews. Add Google Reviews Integration to your MENUQR subscription for ₹499/year.'}
              </p>
            </div>
            <Link
              to="/app/subscription"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#e8783c] to-[#f29a66] hover:opacity-95 text-white px-5 py-2.5 text-xs font-bold transition-all whitespace-nowrap shadow-md shadow-[#e8783c]/20"
            >
              <span>{status === 'EXPIRED' ? 'Renew Add-on' : 'Subscribe for ₹499/yr'}</span>
            </Link>
          </div>
        )}
      </div>

      {/* ── 3. Account Credentials & Live Menu Identity ────────────────────── */}
      <div className="bg-[#1d2723] rounded-2xl p-6 md:p-8 border border-[#2a3832] space-y-4">
        <h2 className="text-lg font-bold text-white mb-2">Account Credentials & Menu Identity</h2>
        <div className="grid md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-medium text-[#849a90] mb-1.5">Owner / Contact Name</label>
            <input
              type="text"
              disabled
              value={profile?.ownerName || profile?.businessName || ''}
              className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl px-4 py-2.5 text-white opacity-70"
            />
          </div>
          <div>
            <label className="block font-medium text-[#849a90] mb-1.5">Registered Email</label>
            <input
              type="email"
              disabled
              value={profile?.email || ''}
              className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl px-4 py-2.5 text-white opacity-70"
            />
          </div>
          <div>
            <label className="block font-medium text-[#849a90] mb-1.5">Menu URL Slug</label>
            <input
              type="text"
              disabled
              value={profile?.menuSlug || ''}
              className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl px-4 py-2.5 text-white opacity-70 font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
