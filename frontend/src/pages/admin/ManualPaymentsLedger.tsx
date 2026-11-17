import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeIndianRupee } from 'lucide-react';
import { getManualPayments, type AdminManualGrant } from './clientStore';

const formatRupees = (value: number) => `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

/** Offline payments recorded by the super admin when activating plans manually. */
export default function ManualPaymentsLedger() {
  const [grants, setGrants] = useState<AdminManualGrant[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getManualPayments()
      .then((res) => { setGrants(res.grants); setTotal(res.totalCollected); })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load offline payments.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mb-10 rounded-2xl border border-white/10 bg-[#151c19] p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-300"><BadgeIndianRupee size={19} /></span>
          <div>
            <h2 className="font-bold text-white">Offline payments</h2>
            <p className="text-xs text-[#94a39d]">Plans activated by the team after a direct payment.</p>
          </div>
        </div>
        <p className="text-sm text-[#aab7b2]">Collected (excluding revoked): <strong className="text-white">{formatRupees(total)}</strong></p>
      </div>
      {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
      {loading ? (
        <p className="text-sm text-[#aab7b2]">Loading…</p>
      ) : grants.length === 0 ? (
        <p className="text-sm text-[#aab7b2]">No offline payments recorded yet. Use "Manage Plan" on a restaurant to record one.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-[#87958e]">
              <tr><th className="py-2 pr-3">Date</th><th className="pr-3">Restaurant</th><th className="pr-3">Plan</th><th className="pr-3">Amount</th><th className="pr-3">Mode / ref</th><th className="pr-3">Valid until</th><th>Status</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[#dce5df]">
              {grants.map((g) => (
                <tr key={g.id}>
                  <td className="py-2 pr-3">{formatDate(g.paidOn || g.createdAt)}</td>
                  <td className="pr-3"><Link className="hover:underline" to={`/admin/clients/${encodeURIComponent(g.tenantId)}/subscription`}>{g.businessName || g.tenantId}</Link></td>
                  <td className="pr-3">{g.planId}</td>
                  <td className="pr-3 font-bold text-white">{formatRupees(g.agreedAmount)}</td>
                  <td className="pr-3">{g.paymentMode}{g.paymentReference ? ` · ${g.paymentReference}` : ''}</td>
                  <td className="pr-3">{formatDate(g.expiresAt)}</td>
                  <td>{g.status === 'REVOKED' ? <span className="text-rose-300">Revoked</span> : g.status === 'ACTIVE' ? <span className="text-emerald-300">Active</span> : <span className="text-[#87958e]">Replaced</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
