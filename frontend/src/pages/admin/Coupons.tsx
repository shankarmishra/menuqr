import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, Plus, CheckCircle2, Clock, Ban, Search, RefreshCw } from 'lucide-react';
import { ensureCsrfToken } from '../../utils/csrf';

interface Coupon {
  id: string;
  code: string;
  plan_id: string;
  discount_pct: number;
  status: 'AVAILABLE' | 'RESERVED' | 'REDEEMED' | 'EXPIRED' | 'DISABLED';
  created_by: string;
  expires_at: string | null;
  reserved_order_id: string | null;
  reserved_at: string | null;
  redeemed_order_id: string | null;
  redeemed_at: string | null;
  created_at: string;
}

export default function Coupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [activeCounts, setActiveCounts] = useState<{ INTERMEDIATE: number; PREMIUM: number }>({ INTERMEDIATE: 0, PREMIUM: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const fetchCoupons = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (selectedPlan) params.set('planId', selectedPlan);
      if (selectedStatus) params.set('status', selectedStatus);
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`/api/admin/coupons?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch coupons.');
      setCoupons(data.coupons || []);
      setActiveCounts(data.activeCounts || { INTERMEDIATE: 0, PREMIUM: 0 });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCoupons();
  }, [selectedPlan, selectedStatus, searchQuery]);

  const handleBulkGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenError('');
    setGenLoading(true);
    try {
      const token = await ensureCsrfToken();
      const res = await fetch('/api/admin/coupons/bulk-generate', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'X-CSRF-Token': token } : {}),
        },
        body: JSON.stringify({
          planId: genPlan,
          discountPct: Number(genDiscountPct),
          count: Number(genCount),
          expiryDays: genExpiryDays !== '' ? Number(genExpiryDays) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bulk generation failed.');
      setModalOpen(false);
      void fetchCoupons();
    } catch (err: any) {
      setGenError(err.message);
    } finally {
      setGenLoading(false);
    }
  };

  const handleDisableCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to disable this unused coupon?')) return;
    try {
      const token = await ensureCsrfToken();
      const res = await fetch(`/api/admin/coupons/${id}/disable`, {
        method: 'PATCH',
        credentials: 'include',
        headers: token ? { 'X-CSRF-Token': token } : {},
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to disable coupon.');
      void fetchCoupons();
    } catch (err: any) {
      alert(err.message);
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
    <div className="admin-coupons-page space-y-7">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Coupon Engine Management</h1>
          <p className="text-slate-400 mt-2 font-medium">Manage single-use subscription discount codes (Max 15 active per plan).</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#e8783c] font-bold text-white shadow-lg shadow-[#e8783c]/20 hover:bg-[#f18b50] transition-all"
        >
          <Plus size={18} /> Bulk Generate Coupons
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Intermediate Active Coupons</p>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">{activeCounts.INTERMEDIATE} / 15</span>
            <span className="text-xs text-slate-400">Limit: 15 active</span>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Premium Active Coupons</p>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black text-[#e8783c]">{activeCounts.PREMIUM} / 15</span>
            <span className="text-xs text-slate-400">Limit: 15 active</span>
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

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#e8783c]"
            />
          </div>
          <select
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none"
          >
            <option value="">All Plans</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="PREMIUM">Premium</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none"
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
          onClick={() => void fetchCoupons()}
          className="p-2 text-slate-400 hover:text-white transition-colors"
          title="Refresh"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Coupons Table */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading coupons...</div>
        ) : error ? (
          <div className="p-12 text-center text-rose-400">{error}</div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center text-slate-400">No coupons found matching your filter criteria.</div>
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
                  return (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-white flex items-center gap-2">
                        <Tag size={15} className="text-[#e8783c]" />
                        {c.code}
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
                            onClick={() => handleDisableCoupon(c.id)}
                            className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-bold transition-all"
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
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-[#1d2623] border border-white/10 rounded-3xl p-6 shadow-2xl text-white"
          >
            <h3 className="text-xl font-bold mb-1">Bulk Generate Coupons</h3>
            <p className="text-xs text-slate-400 mb-6">Create 10 to 15 single-use discount codes (Max 15 active total per plan).</p>

            {genError && (
              <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-300">
                {genError}
              </div>
            )}

            <form onSubmit={handleBulkGenerate} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Eligible Plan</label>
                <select
                  value={genPlan}
                  onChange={(e: any) => setGenPlan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl font-semibold text-white focus:outline-none"
                >
                  <option value="PREMIUM">Premium (₹2999/yr)</option>
                  <option value="INTERMEDIATE">Intermediate (₹1499/yr)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Discount Tier</label>
                <select
                  value={genDiscountPct}
                  onChange={(e) => setGenDiscountPct(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl font-semibold text-white focus:outline-none"
                >
                  <option value={15}>15% Discount (Max Allowed Tier)</option>
                  <option value={10}>10% Discount</option>
                  <option value={5}>5% Discount</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Quantity (10 - 15)</label>
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={genCount}
                  onChange={(e) => setGenCount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl font-semibold text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Expiry Period (Days, Optional)</label>
                <input
                  type="number"
                  min={1}
                  placeholder="e.g. 30"
                  value={genExpiryDays}
                  onChange={(e) => setGenExpiryDays(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={genLoading}
                  className="flex-1 py-2.5 bg-[#e8783c] hover:bg-[#f18b50] rounded-xl font-bold text-white transition-all text-xs disabled:opacity-50"
                >
                  {genLoading ? 'Generating...' : 'Generate Codes'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
