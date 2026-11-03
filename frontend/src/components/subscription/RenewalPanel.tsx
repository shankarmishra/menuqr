import { useState } from 'react';
import { ShieldCheck, Calendar, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { initiateRenewal, type RenewalInitiateResponse } from '../../pages/app/appStore';
import { PLAN_NAMES, PLAN_PRICES, normalizePlan } from '../../lib/planCapabilities';

export interface RenewalPanelProps {
  currentPlanId: string;
  expiresAt?: string;
  onProceedToPayment: (orderData: RenewalInitiateResponse) => void;
}

export default function RenewalPanel({
  currentPlanId,
  expiresAt,
  onProceedToPayment,
}: RenewalPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const planKey = normalizePlan(currentPlanId);
  const planName = PLAN_NAMES[planKey] || currentPlanId;
  const priceDisplay = PLAN_PRICES[planKey] || '₹1,999/yr';

  // Zero-Days-Loss Guarantee Date Computation
  const now = new Date();
  const currentExpiryDate = expiresAt ? new Date(expiresAt) : now;
  const baseDate = currentExpiryDate.getTime() > now.getTime() ? currentExpiryDate : now;
  const calculatedNewExpiry = (() => {
    const d = new Date(baseDate);
    d.setFullYear(d.getFullYear() + 1);
    return d;
  })();

  const formatDate = (d: Date | string | undefined) => {
    if (!d) return 'N/A';
    const dateObj = typeof d === 'string' ? new Date(d) : d;
    return dateObj.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleInitiate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await initiateRenewal();
      if (!res || !res.success) {
        throw new Error('Failed to initiate renewal order');
      }
      onProceedToPayment(res);
    } catch (err: unknown) {
      console.error('[RenewalPanel] Renewal initiation error:', err);
      const msg = err instanceof Error ? err.message : 'Could not initiate renewal. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <div className="p-4 rounded-xl bg-[#151c19] border border-[#2a3832] flex items-center justify-between">
        <div>
          <span className="text-xs uppercase font-semibold text-[#849a90]">Active Subscription</span>
          <h3 className="text-lg font-bold text-white mt-0.5">{planName} Plan</h3>
          <p className="text-xs text-[#849a90]">{priceDisplay} + 18% GST</p>
        </div>
        <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          ACTIVE
        </span>
      </div>

      {/* Zero Lost Days Callout */}
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1.5">
          <ShieldCheck size={18} className="shrink-0" />
          <span>Zero Lost Days Guarantee</span>
        </div>
        <p className="text-xs text-[#aab7b2] leading-relaxed">
          Renewing early adds a full 365 days to your existing expiration date. Your remaining active days are 100% preserved.
        </p>
        <div className="mt-3.5 grid grid-cols-2 gap-3 pt-3 border-t border-emerald-500/20 text-xs">
          <div>
            <span className="text-[#62756d] uppercase font-bold text-[10px] flex items-center gap-1 mb-0.5">
              <Calendar size={11} /> Current Expiry
            </span>
            <p className="text-white font-medium">{formatDate(expiresAt)}</p>
          </div>
          <div>
            <span className="text-emerald-400 uppercase font-bold text-[10px] flex items-center gap-1 mb-0.5">
              <Calendar size={11} /> Extended Expiry
            </span>
            <p className="text-emerald-300 font-bold">{formatDate(calculatedNewExpiry)}</p>
          </div>
        </div>
      </div>

      {/* Benefits Summary */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#849a90]">Included with Renewal</h4>
        <ul className="space-y-2 text-xs text-[#aab7b2]">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e8783c]"></span>
            <span>Permanent QR codes and tabletop stickers remain active</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e8783c]"></span>
            <span>Uninterrupted digital menu hosting and live updates</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e8783c]"></span>
            <span>Instant official GST tax invoice with SAC 997331</span>
          </li>
        </ul>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleInitiate}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-[#e8783c] hover:bg-[#d66a30] text-white px-5 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-[#e8783c]/20 hover:shadow-[#e8783c]/40 cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Preparing Renewal Order...</span>
          </>
        ) : (
          <>
            <span>Proceed to Payment</span>
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </div>
  );
}
