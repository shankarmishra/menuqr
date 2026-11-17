import { useEffect, useState } from 'react';
import { AlertCircle, Loader2, Minus, Plus, ShoppingBag } from 'lucide-react';
import {
  getOrderUsage,
  initiateOrderPack,
  type OrderPackInitiateResponse,
  type OrderUsage,
} from '../../pages/app/appStore';

export interface OrderPackPanelProps {
  onProceedToPayment: (orderData: OrderPackInitiateResponse) => void;
}

const rupees = (value: number) => `₹${value.toLocaleString('en-IN')}`;

/** Choose how many packs of extra online orders to buy (₹99 per 50 orders, valid this month). */
export default function OrderPackPanel({ onProceedToPayment }: OrderPackPanelProps) {
  const [usage, setUsage] = useState<OrderUsage | null>(null);
  const [packs, setPacks] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getOrderUsage().then(setUsage).catch(() => setError('Could not load your order usage.'));
  }, []);

  const packSize = usage?.packSize ?? 50;
  const packPrice = usage?.packPrice ?? 99;
  const maxPacks = usage?.maxPacksPerPurchase ?? 20;

  const proceed = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      onProceedToPayment(await initiateOrderPack(packs));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#2a3832] bg-[#151c19] p-5">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-[#e8783c]/15 p-2.5 text-[#f29a66]"><ShoppingBag size={20} /></span>
          <div>
            <h3 className="font-bold text-white">Extra online orders</h3>
            <p className="text-xs text-[#849a90]">{rupees(packPrice)} for every {packSize} orders · valid for this month</p>
          </div>
        </div>
        {usage && (
          <p className="mt-4 text-sm text-[#cbd5cf]">
            This month: <strong className="text-white">{usage.used}</strong> of <strong className="text-white">{usage.limit}</strong> orders used
            {usage.extraOrders > 0 && <span className="text-[#849a90]"> ({usage.included} included + {usage.extraOrders} extra)</span>}.
          </p>
        )}
      </div>

      <div>
        <p className="text-sm font-semibold text-[#dce5df]">How many packs?</p>
        <div className="mt-3 flex items-center gap-4">
          <button
            type="button"
            aria-label="Fewer packs"
            disabled={packs <= 1}
            onClick={() => setPacks((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-white/10 p-2.5 text-white hover:bg-white/5 disabled:opacity-30"
          >
            <Minus size={16} />
          </button>
          <div className="min-w-[110px] text-center">
            <div className="text-3xl font-black text-white">{packs}</div>
            <div className="text-xs text-[#849a90]">= {(packs * packSize).toLocaleString('en-IN')} orders</div>
          </div>
          <button
            type="button"
            aria-label="More packs"
            disabled={packs >= maxPacks}
            onClick={() => setPacks((p) => Math.min(maxPacks, p + 1))}
            className="rounded-lg border border-white/10 p-2.5 text-white hover:bg-white/5 disabled:opacity-30"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-baseline justify-between rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
        <span className="text-sm font-semibold text-[#dce5df]">Total</span>
        <span className="text-3xl font-black text-[#e8783c]">{rupees(packs * packPrice)}</span>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
          <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      <button
        type="button"
        onClick={proceed}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e8783c] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#e8783c]/20 transition-all hover:bg-[#d66a30] disabled:opacity-60"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        Pay {rupees(packs * packPrice)} for {(packs * packSize).toLocaleString('en-IN')} orders
      </button>
    </div>
  );
}
