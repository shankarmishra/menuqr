import { useEffect, useState } from 'react';
import {
  getProfile,
  getGoogleReviewsAddon,
  updateGoogleReviewsAddon,
  deleteGoogleReviewsAddon,
  type AppProfile,
  type GoogleReviewsAddonStatus,
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
  Link as LinkIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Settings() {
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [addonStatus, setAddonStatus] = useState<GoogleReviewsAddonStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Review URL form state
  const [reviewUrlInput, setReviewUrlInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    Promise.all([
      getProfile().catch(console.error),
      getGoogleReviewsAddon().catch(console.error),
    ])
      .then(([prof, addon]) => {
        if (prof) setProfile(prof);
        if (addon) {
          setAddonStatus(addon);
          setReviewUrlInput(addon.reviewUrl || '');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewUrlInput.trim()) {
      setMessage({ type: 'error', text: 'Please enter a valid Google review link.' });
      return;
    }
    setSaving(true);
    setMessage(null);
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
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Google review link saved successfully! Your menu will now display the review button.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save Google review link.' });
    } finally {
      setSaving(false);
    }
  };

  const handleClearUrl = async () => {
    if (!window.confirm('Are you sure you want to remove your Google review link? The review button will be hidden from your menu.')) return;
    setDeleting(true);
    setMessage(null);
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
      setIsEditing(true);
      setMessage({ type: 'success', text: 'Google review link removed.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to remove link.' });
    } finally {
      setDeleting(false);
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
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Restaurant Settings</h1>
        <p className="mt-1 text-sm text-[#849a90]">Manage your profile and digital menu integrations.</p>
      </div>

      {/* Google Reviews Add-on Management Section */}
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
        {message && (
          <div
            className={`rounded-xl p-4 flex items-start gap-3 text-xs font-medium border ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" /> : <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />}
            <div className="flex-1 leading-relaxed">{message.text}</div>
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
                    disabled={!isEditing && Boolean(addonStatus?.reviewUrl)}
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
                {!isEditing && Boolean(addonStatus?.reviewUrl) ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
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
                      disabled={deleting}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 px-4 py-2 text-xs font-semibold border border-rose-500/20 transition-colors ml-auto disabled:opacity-50"
                    >
                      <Trash2 size={13} />
                      {deleting ? 'Removing...' : 'Remove'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="submit"
                      disabled={saving || !reviewUrlInput.trim()}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#e8783c] hover:bg-[#d66a30] text-white px-5 py-2.5 text-xs font-bold transition-all shadow-md shadow-[#e8783c]/20 disabled:opacity-50"
                    >
                      <Save size={14} />
                      {saving ? 'Saving...' : 'Save & Publish on Menu'}
                    </button>
                    {addonStatus?.reviewUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setReviewUrlInput(addonStatus.reviewUrl || '');
                          setIsEditing(false);
                        }}
                        className="rounded-xl bg-transparent hover:bg-white/5 text-[#849a90] px-4 py-2 text-xs font-medium transition-colors"
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
          /* Unsubscribed or Expired upsell banner */
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

      {/* Existing Business Profile Settings */}
      <div className="bg-[#1d2723] rounded-2xl p-6 md:p-8 border border-[#2a3832] space-y-4">
        <h2 className="text-lg font-bold text-white mb-2">Business Profile</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#849a90] mb-1.5">Business Name</label>
            <input
              type="text"
              disabled
              value={profile?.businessName || ''}
              className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl px-4 py-2 text-sm text-white opacity-70"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#849a90] mb-1.5">Owner Name</label>
            <input
              type="text"
              disabled
              value={profile?.ownerName || ''}
              className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl px-4 py-2 text-sm text-white opacity-70"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#849a90] mb-1.5">Email</label>
            <input
              type="email"
              disabled
              value={profile?.email || ''}
              className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl px-4 py-2 text-sm text-white opacity-70"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#849a90] mb-1.5">Menu Slug</label>
            <input
              type="text"
              disabled
              value={profile?.menuSlug || ''}
              className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl px-4 py-2 text-sm text-white opacity-70 font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
