import { ShoppingBag } from 'lucide-react';
import type { OrderUsage } from '../../pages/app/appStore';

interface OrderUsageCardProps {
  usage: OrderUsage;
  onBuyMore: () => void;
}

/** This month's online orders vs. the limit, with a button to buy another pack. */
export default function OrderUsageCard({ usage, onBuyMore }: OrderUsageCardProps) {
  const pct = Math.min(100, Math.round((usage.used / Math.max(1, usage.limit)) * 100));
  const tone = usage.exceeded ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-400' : 'bg-emerald-500';
  const monthLabel = (() => {
    const [y, m] = usage.period.split('-').map(Number);
    return new Date(y, (m || 1) - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  })();

  return (
    <div className="rounded-2xl border border-white/10 bg-[#151c19] p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-[#e8783c]/15 p-2.5 text-[#f29a66]"><ShoppingBag size={20} /></span>
          <div>
            <h3 className="font-bold text-white">Online orders · {monthLabel}</h3>
            <p className="text-xs text-[#849a90]">
              {usage.included} included each month · extra {usage.packSize} orders for ₹{usage.packPrice}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onBuyMore}
          className="shrink-0 rounded-xl bg-[#e8783c] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#d66a30]"
        >
          Buy {usage.packSize} more · ₹{usage.packPrice}
        </button>
      </div>

      <div className="mt-5">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-[#cbd5cf]">
            <strong className="text-2xl font-black text-white">{usage.used}</strong> of {usage.limit} used
          </span>
          <span className={usage.exceeded ? 'font-bold text-rose-300' : 'text-[#849a90]'}>
            {usage.exceeded ? 'Limit reached' : `${usage.remaining} left`}
          </span>
        </div>
        <div
          className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={usage.limit}
          aria-valuenow={Math.min(usage.used, usage.limit)}
          aria-label="Online orders used this month"
        >
          <div className={`h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} />
        </div>
        {usage.extraOrders > 0 && (
          <p className="mt-2 text-xs text-[#849a90]">Includes {usage.extraOrders} extra orders bought this month.</p>
        )}
        {usage.exceeded && (
          <p className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            Customers can't place new online orders until you buy more orders or next month starts.
          </p>
        )}
      </div>
    </div>
  );
}
