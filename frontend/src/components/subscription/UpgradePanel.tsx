import { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Loader2, AlertCircle, Check, ShieldCheck } from 'lucide-react';
import {
  getUpgradePreview,
  initiateUpgrade,
  type UpgradePreview,
  type UpgradeInitiateResponse,
} from '../../pages/app/appStore';
import { normalizePlan } from '../../lib/planCapabilities';

export interface UpgradePanelProps {
  currentPlanId: string;
  expiresAt?: string;
  onProceedToPayment: (orderData: UpgradeInitiateResponse, targetTier?: string) => void;
}

interface TierOption {
  id: 'intermediate' | 'premium';
  name: string;
  price: string;
  description: string;
  highlights: string[];
}

const UPGRADE_TIERS: TierOption[] = [
  {
    id: 'intermediate',
    name: 'Intermediate',
    price: '₹3,199/yr',
    description: 'Full menu control, dish customization, and customer analytics',
    highlights: [
      'Unlimited dish additions & edits',
      'Interactive design studio & templates',
      'Customer traffic & search analytics',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '₹6,799/yr',
    description: 'Complete digital ordering, live table tokens, and thermal bills',
    highlights: [
      'Live Table Tokens & Customer Ordering',
      'Realistic Thermal Bill Receipt Printing',
      'Cashier Desk & Bill Settlement Panel',
      'Direct Kitchen & Waiter Order Management',
    ],
  },
];

export default function UpgradePanel({
  currentPlanId,
  expiresAt: _expiresAt,
  onProceedToPayment,
}: UpgradePanelProps) {
  const currentKey = normalizePlan(currentPlanId);

  // Filter available tiers higher than current plan
  const availableTiers = UPGRADE_TIERS.filter((tier) => {
    if (currentKey === 'basic') return true;
    if (currentKey === 'intermediate') return tier.id === 'premium';
    return false;
  });

  const [selectedTier, setSelectedTier] = useState<'intermediate' | 'premium'>(
    availableTiers[availableTiers.length - 1]?.id || 'premium'
  );
  const [preview, setPreview] = useState<UpgradePreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [initiating, setInitiating] = useState(false);
  const [initiateError, setInitiateError] = useState<string | null>(null);

  // Fetch proration calculation preview whenever selected tier changes
  useEffect(() => {
    let cancelled = false;
    setPreviewLoading(true);
    setPreviewError(null);

    getUpgradePreview(selectedTier)
      .then((res) => {
        if (!cancelled) {
          if (res?.preview) {
            setPreview(res.preview);
          } else {
            setPreview(null);
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('[UpgradePanel] Preview fetch error:', err);
          setPreviewError(err instanceof Error ? err.message : 'Unable to calculate upgrade proration.');
        }
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedTier]);

  const handleInitiateUpgrade = async () => {
    setInitiating(true);
    setInitiateError(null);
    try {
      const res = await initiateUpgrade(selectedTier);
      if (!res || !res.success) {
        throw new Error('Failed to initiate upgrade order');
      }
      onProceedToPayment(res, selectedTier.toUpperCase());
    } catch (err: unknown) {
      console.error('[UpgradePanel] Upgrade initiation error:', err);
      const msg = err instanceof Error ? err.message : 'Could not initiate upgrade. Please try again.';
      setInitiateError(msg);
    } finally {
      setInitiating(false);
    }
  };

  const formatPaise = (paise?: number) => {
    if (typeof paise !== 'number' || isNaN(paise)) return '₹0.00';
    return (paise / 100).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    });
  };

  return (
    <div className="space-y-6">
      {/* Target Tier Selection */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-[#849a90]">
          Select Upgrade Tier
        </label>
        <div className="grid grid-cols-1 gap-3">
          {availableTiers.map((tier) => {
            const isSelected = selectedTier === tier.id;
            return (
              <div
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#e8783c] bg-[#e8783c]/5 shadow-lg shadow-[#e8783c]/10'
                    : 'border-[#2a3832] bg-[#151c19] hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white">{tier.name}</h4>
                      <span className="text-xs font-semibold text-[#e8783c]">{tier.price}</span>
                    </div>
                    <p className="text-xs text-[#849a90] mt-1">{tier.description}</p>
                  </div>
                  <div
                    className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'border-[#e8783c] bg-[#e8783c] text-white'
                        : 'border-[#2a3832] bg-transparent'
                    }`}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#aab7b2]">
                  {tier.highlights.map((h, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <Sparkles size={12} className="text-amber-400 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Proration Calculation Breakdown */}
      <div className="p-4 rounded-xl bg-[#151c19] border border-[#2a3832] space-y-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
          <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" /> Proration Breakdown
          </span>
          <span className="text-[11px] text-[#849a90]">Server-calculated</span>
        </div>

        {previewLoading && (
          <div className="py-6 flex flex-col items-center justify-center gap-2 text-xs text-[#849a90]">
            <Loader2 size={18} className="animate-spin text-[#e8783c]" />
            <span>Calculating unused days credit...</span>
          </div>
        )}

        {previewError && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0 text-rose-400" />
            <span>{previewError}</span>
          </div>
        )}

        {!previewLoading && !previewError && preview && (
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-[#aab7b2]">
              <span>{preview.targetPlanName || selectedTier.toUpperCase()} Annual Base</span>
              <span className="font-medium text-white">{formatPaise(preview.fullPricePaise)}</span>
            </div>

            {preview.prorationCreditPaise > 0 && (
              <div className="flex items-center justify-between text-emerald-400">
                <div className="flex flex-col">
                  <span>Unused Days Credit Deduction</span>
                  <span className="text-[10px] text-emerald-400/80">
                    {preview.remainingDays} days credited @ {formatPaise(preview.dailyRatePaise)}/day
                  </span>
                </div>
                <span className="font-bold">-{formatPaise(preview.prorationCreditPaise)}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-[#849a90] pt-1.5 border-t border-white/5">
              <span>Net Taxable Subtotal</span>
              <span className="font-medium text-white">{formatPaise(preview.subtotalPaise)}</span>
            </div>

            <div className="flex items-center justify-between text-[#849a90]">
              <span>GST (18% - CGST 9% + SGST 9%)</span>
              <span className="font-medium text-white">
                {formatPaise(preview.taxPaise || (preview.cgstPaise || 0) + (preview.sgstPaise || 0) + (preview.igstPaise || 0))}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2.5 border-t border-[#2a3832] text-sm">
              <span className="font-bold text-white">Net Payable Now</span>
              <span className="text-base font-black text-emerald-400">
                {formatPaise(preview.totalPaise)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Initiation Error Banner */}
      {initiateError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0 text-rose-400" />
          <span>{initiateError}</span>
        </div>
      )}

      {/* CTA Button */}
      <button
        onClick={handleInitiateUpgrade}
        disabled={initiating || previewLoading || !preview?.isUpgradeAllowed}
        className="w-full flex items-center justify-center gap-2 bg-[#e8783c] hover:bg-[#d66a30] text-white px-5 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-[#e8783c]/20 hover:shadow-[#e8783c]/40 cursor-pointer disabled:opacity-50"
      >
        {initiating ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Preparing Upgrade Order...</span>
          </>
        ) : (
          <>
            <span>
              Upgrade to {selectedTier.toUpperCase()}
              {preview?.totalPaise ? ` (${formatPaise(preview.totalPaise)})` : ''}
            </span>
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </div>
  );
}
