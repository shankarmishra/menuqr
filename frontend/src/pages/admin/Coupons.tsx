import { useEffect, useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Plus, CheckCircle2, Clock, Ban, Search, RefreshCw, Copy, Check, AlertTriangle, X } from 'lucide-react';
import {
  getAdminCoupons,
  bulkGenerateAdminCoupons,
  disableAdminCoupon,
  type AdminCoupon,
} from './clientStore';
import { useToast } from '../../components/feedback/ToastProvider';

export default function Coupons() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [activeCounts, setActiveCounts] = useState<{ INTERMEDIATE: number; PREMIUM: number }>({ INTERMEDIATE: 0, PREMIUM: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Filters
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Bulk Generator Modal State
  const [isModalOpen, setModalOpen] = useState(false);
  const [genPlan, setGenPlan] = useState<'INTERMEDIATE' | 'PREMIUM'>('PREMIUM');
  const [genDiscountPct, setGenDiscountPct] = useState<number>(15);
  const [genCount, setGenCount] = useState<number>(10);
  const [genExpiryDays, setGenExpiryDays] = useState<number | ''>(30);
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState('');

  // Disable Confirmation Modal State
  const [disablingCoupon, setDisablingCoupon] = useState<AdminCoupon | null>(null);
  const [isDisabling, setIsDisabling] = useState(false);

  const showToast = useToast();
  const [, startTransition] = useTransition();

  const fetchCoupons = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminCoupons({
        planId: selectedPlan || undefined,
        status: selectedStatus || undefined,
        search: searchQuery || undefined,
      });
      setCoupons(data.coupons || []);
      setActiveCounts(data.activeCounts || { INTERMEDIATE: 0, PREMIUM: 0 });
    } catch (err: any) {
      const msg = err?.message || 'Failed to fetch coupons.';
      setError(msg);
      showToast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCoupons();
  }, [selectedPlan, selectedStatus, searchQuery]);

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      showToast('success', `Copied ${code} to clipboard!`);
      setTimeout(() => {
        setCopiedCode((prev) => (prev === code ? null : prev));
      }, 2000);
    } catch {
      showToast('error', 'Failed to copy code to clipboard.');
    }
  };

  const handleBulkGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenError('');
    setGenLoading(true);
    try {
      const res = await bulkGenerateAdminCoupons({
        planId: genPlan,
        discountPct: Number(genDiscountPct),
        count: Number(genCount),
        expiryDays: genExpiryDays !== '' ? Number(genExpiryDays) : null,
      });
      showToast('success', `Successfully generated ${res.createdCount} coupon codes for ${genPlan}!`);
      setModalOpen(false);
      void fetchCoupons();
    } catch (err: any) {
      setGenError(err?.message || 'Bulk generation failed.');
    } finally {
      setGenLoading(false);
    }
  };

  const handleConfirmDisable = async () => {
    if (!disablingCoupon) return;
    setIsDisabling(true);
    try {
      await disableAdminCoupon(disablingCoupon.id);
      showToast('success', `Coupon ${disablingCoupon.code} disabled successfully.`);
      setDisablingCoupon(null);
      void fetchCoupons();
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to disable coupon.');
    } finally {
      setIsDisabling(false);
    }
  };

  const statusBadges: Record<string, { bg: string; text: string; icon: any }> = {
    AVAILABLE: { bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', text: 'AVAILABLE', icon: CheckCircle2 },
    RESERVED:  { bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400', text: 'RESERVED', icon: Clock },
    REDEEMED:  { bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400', text: 'REDEEMED', icon: CheckCircle2 },
    EXPIRED:   { bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400', text: 'EXPIRED', icon: Ban },
    DISABLED:  { bg: 'bg-gray-500/10 border-gray-500/30 text-gray-400', text: 'DISABLED', icon: Ban },
  };

  return (
    <div className="admin-coupons-page space-y-7 p-6 pb-28">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Coupon Engine Management</h1>
          <p className="text-slate-400 mt-2 font-medium">Manage single-use subscription discount codes (Maximum 15 active per plan).</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#e8783c] font-bold text-white shadow-lg shadow-[#e8783c]/20 hover:bg-[#f18b50] transition-all cursor-pointer"
        >
          <Plus size={18} /> Bulk Generate Coupons
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Intermediate Active Coupons</p>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-3xl font-black text-white">{activeCounts.INTERMEDIATE} / 15</span>
            <span className="text-xs text-slate-400">{15 - activeCounts.INTERMEDIATE} slots remaining</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
              style={{ width: `${Math.min((activeCounts.INTERMEDIATE / 15) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Premium Active Coupons</p>
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-3xl font-black text-[#e8783c]">{activeCounts.PREMIUM} / 15</span>
            <span className="text-xs text-slate-400">{15 - activeCounts.PREMIUM} slots remaining</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-[#e8783c] to-amber-400 transition-all duration-500"
              style={{ width: `${Math.min((activeCounts.PREMIUM / 15) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Inventory Count</p>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-blue-400">{coupons.length}</span>
            <span className="text-xs text-slate-400">All historical codes</span>
          </div>
        </div>
      </div>

      {/* Error Banner with Retry */}
      {error && (
        <div role="alert" className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="text-rose-400 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button
            type="button"
            onClick={() => void fetchCoupons()}
            className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-lg text-xs font-bold transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search code..."
              value={searchQuery}
              onChange={(e) => startTransition(() => setSearchQuery(e.target.value))}
              className="pl-9 pr-8 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#e8783c]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <select
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#e8783c]"
          >
            <option value="">All Plans</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="PREMIUM">Premium</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#e8783c]"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="RESERVED">Reserved</option>
            <option value="REDEEMED">Redeemed</option>
            <option value="EXPIRED">Expired</option>
            <option value="DISABLED">Disabled</option>
          </select>
        </div>
        <button
          type="button"
          onClick={() => void fetchCoupons()}
          className="p-2 text-slate-400 hover:text-white hover:bg-white/[0.05] rounded-xl transition-all"
          title="Refresh coupons"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Coupons Table */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Tag size={40} className="mx-auto mb-3 text-slate-600" />
            <p className="font-semibold text-slate-300">No coupons found</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or generate new coupons above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-white/[0.04] text-xs uppercase font-bold text-slate-400 border-b border-white/[0.08]">
                <tr>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Eligible Plan</th>
                  <th className="px-6 py-4">Discount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Created / Expiry</th>
                  <th className="px-6 py-4">Order Association</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {coupons.map((c) => {
                  const badge = statusBadges[c.status] || statusBadges.AVAILABLE;
                  const BadgeIcon = badge.icon;
                  const isCopied = copiedCode === c.code;
                  return (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white tracking-wide">{c.code}</span>
                          <button
                            type="button"
                            onClick={() => void handleCopy(c.code)}
                            className="p-1 text-slate-400 hover:text-white hover:bg-white/[0.08] rounded transition-all"
                            title="Copy code"
                          >
                            {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-200">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${c.plan_id === 'PREMIUM' ? 'bg-orange-500/20 text-orange-300' : 'bg-blue-500/20 text-blue-300'}`}>
                          {c.plan_id}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-400">
                        {c.discount_pct}% OFF
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
                          <BadgeIcon size={12} /> {badge.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        <div>Created: {new Date(c.created_at).toLocaleDateString()}</div>
                        {c.expires_at ? (
                          <div className="text-amber-400/80">Expires: {new Date(c.expires_at).toLocaleDateString()}</div>
                        ) : (
                          <div className="text-slate-500">No expiration</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-400">
                        {c.redeemed_order_id ? (
                          <div>
                            <span className="text-emerald-400 font-semibold">Redeemed:</span> {c.redeemed_order_id}
                            <div className="text-[10px] text-slate-500">{new Date(c.redeemed_at!).toLocaleString()}</div>
                          </div>
                        ) : c.reserved_order_id ? (
                          <div>
                            <span className="text-amber-400 font-semibold">Reserved:</span> {c.reserved_order_id}
                          </div>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {(c.status === 'AVAILABLE' || c.status === 'RESERVED') && (
                          <button
                            type="button"
                            onClick={() => setDisablingCoupon(c)}
                            className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            Disable
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bulk Generator Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#1d2623] border border-white/10 rounded-3xl p-6 shadow-2xl text-white"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">Bulk Generate Coupons</h3>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-slate-400 mb-6">Create 1 to 15 single-use discount codes (Max 15 active total per plan).</p>

              {genError && (
                <div role="alert" className="mb-4 p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-300">
                  {genError}
                </div>
              )}

              <form onSubmit={handleBulkGenerate} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Eligible Plan</label>
                  <select
                    value={genPlan}
                    onChange={(e: any) => setGenPlan(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl font-semibold text-white focus:outline-none focus:border-[#e8783c]"
                  >
                    <option value="PREMIUM">Premium (₹6799/yr)</option>
                    <option value="INTERMEDIATE">Intermediate (₹3199/yr)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Discount Tier</label>
                  <select
                    value={genDiscountPct}
                    onChange={(e) => setGenDiscountPct(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl font-semibold text-white focus:outline-none focus:border-[#e8783c]"
                  >
                    <option value={15}>15% Discount (Max Allowed Tier)</option>
                    <option value={10}>10% Discount</option>
                    <option value={5}>5% Discount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Quantity (1 - 15)</label>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={genCount}
                    onChange={(e) => setGenCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl font-semibold text-white focus:outline-none focus:border-[#e8783c]"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Current active on {genPlan}: {activeCounts[genPlan]} / 15 (Max new allowed: {Math.max(0, 15 - activeCounts[genPlan])})
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Expiry Period (Days, Optional)</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="e.g. 30 (leave blank for no expiry)"
                    value={genExpiryDays}
                    onChange={(e) => setGenExpiryDays(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#e8783c]"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={genLoading}
                    className="flex-1 py-2.5 bg-[#e8783c] hover:bg-[#f18b50] rounded-xl font-bold text-white transition-all text-xs disabled:opacity-50 cursor-pointer"
                  >
                    {genLoading ? 'Generating...' : 'Generate Codes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Disable Coupon Confirmation Modal */}
      <AnimatePresence>
        {disablingCoupon && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-[#1d2623] border border-rose-500/20 rounded-3xl p-6 shadow-2xl text-white"
            >
              <div className="flex items-center gap-3 text-rose-400 mb-3">
                <AlertTriangle size={24} />
                <h3 className="text-lg font-bold">Disable Coupon</h3>
              </div>
              <p className="text-sm text-slate-300 mb-2">
                Are you sure you want to disable coupon <span className="font-mono font-bold text-white">{disablingCoupon.code}</span>?
              </p>
              <p className="text-xs text-slate-400 mb-6">
                This coupon will immediately become invalid for new or pending checkouts. This action cannot be undone.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDisablingCoupon(null)}
                  disabled={isDisabling}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDisable}
                  disabled={isDisabling}
                  className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 rounded-xl font-bold text-white text-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isDisabling ? 'Disabling...' : 'Confirm Disable'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
