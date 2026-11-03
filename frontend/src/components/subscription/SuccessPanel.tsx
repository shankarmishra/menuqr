import { useState, useEffect } from 'react';
import { CheckCircle2, FileText, Download, Loader2, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { getSubscriptionInvoices, downloadInvoicePdf, type SubscriptionInvoice } from '../../pages/app/appStore';

export interface SuccessPanelProps {
  orderSubtype: 'RENEWAL' | 'UPGRADE';
  planId: string;
  newExpiry?: string;
  orderId: string;
  onClose: () => void;
}

export default function SuccessPanel({
  orderSubtype,
  planId,
  newExpiry,
  orderId,
  onClose,
}: SuccessPanelProps) {
  const [invoices, setInvoices] = useState<SubscriptionInvoice[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);

  useEffect(() => {
    // Attempt to load invoice for instant download
    getSubscriptionInvoices()
      .then((res) => {
        if (res?.invoices) {
          setInvoices(res.invoices);
        }
      })
      .catch((err) => {
        console.warn('[SuccessPanel] Could not fetch invoices:', err);
      });
  }, [orderId]);

  const latestInvoice = invoices[0];

  const handleDownloadInvoice = async () => {
    if (downloading) return;
    setDownloading(true);
    setInvoiceError(null);

    try {
      if (latestInvoice?.id) {
        await downloadInvoicePdf(latestInvoice.id, latestInvoice.invoiceNumber);
        setDownloaded(true);
      } else {
        // Retry fetching invoices once more
        const res = await getSubscriptionInvoices();
        const inv = res?.invoices?.[0];
        if (inv?.id) {
          await downloadInvoicePdf(inv.id, inv.invoiceNumber);
          setDownloaded(true);
        } else {
          throw new Error('Your GST tax invoice is being generated. It will be available in Invoice History shortly.');
        }
      }
    } catch (err: unknown) {
      console.error('[SuccessPanel] Invoice download error:', err);
      setInvoiceError(err instanceof Error ? err.message : 'Failed to download invoice PDF.');
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (d?: string) => {
    if (!d) return '365 days from now';
    try {
      return new Date(d).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return d;
    }
  };

  const isUpgrade = orderSubtype === 'UPGRADE';

  return (
    <div className="space-y-6 text-center py-4">
      {/* Animated Success Checkmark */}
      <div className="relative inline-flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"></div>
        <div className="relative p-4 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-400">
          <CheckCircle2 size={48} />
        </div>
      </div>

      {/* Header Title */}
      <div>
        <h3 className="text-2xl font-black text-white">
          {isUpgrade ? 'Plan Upgraded Successfully!' : 'Subscription Renewed!'}
        </h3>
        <p className="text-xs text-[#849a90] mt-1.5 max-w-sm mx-auto">
          {isUpgrade
            ? `Your restaurant is now active on ${planId.toUpperCase()} tier.`
            : 'Your subscription validity has been extended without losing any active days.'}
        </p>
      </div>

      {/* Confirmed Details Card */}
      <div className="p-5 rounded-2xl bg-[#151c19] border border-[#2a3832] text-left space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <span className="text-xs uppercase font-bold text-[#849a90]">Active Plan</span>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <Sparkles size={12} className="text-emerald-400" />
            {planId.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[#62756d] uppercase font-bold text-[10px]">Valid Until</span>
            <p className="font-semibold text-white mt-0.5">{formatDate(newExpiry)}</p>
          </div>
          <div>
            <span className="text-[#62756d] uppercase font-bold text-[10px]">Order Reference</span>
            <p className="font-mono text-[11px] text-[#849a90] mt-0.5 truncate">{orderId}</p>
          </div>
        </div>

        {/* Real-time Zero-Reload Callout */}
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2">
          <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <strong>Zero-Reload Activated:</strong> All plan capabilities and features are instantly unlocked across your dashboard.
          </span>
        </div>
      </div>

      {/* Instant GST Invoice Action */}
      <div className="p-4 rounded-xl bg-[#151c19]/50 border border-white/5 space-y-2 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-[#e8783c]" />
            <div>
              <h5 className="text-xs font-bold text-white">GST Tax Invoice</h5>
              <p className="text-[11px] text-[#849a90]">Statutory Rule 48 compliant tax receipt</p>
            </div>
          </div>

          <button
            onClick={handleDownloadInvoice}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#25322d] hover:bg-[#2f3f39] text-[#e8783c] hover:text-white border border-[#2a3832] transition-all cursor-pointer disabled:opacity-50"
          >
            {downloading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Downloading...</span>
              </>
            ) : downloaded ? (
              <>
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span>Downloaded</span>
              </>
            ) : (
              <>
                <Download size={13} />
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>

        {invoiceError && (
          <p className="text-[11px] text-rose-300 pt-1">{invoiceError}</p>
        )}
      </div>

      {/* Done Button */}
      <button
        onClick={onClose}
        className="w-full flex items-center justify-center gap-2 bg-[#e8783c] hover:bg-[#d66a30] text-white px-5 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-[#e8783c]/20 hover:shadow-[#e8783c]/40 cursor-pointer"
      >
        <span>Done / Return to Dashboard</span>
        <ArrowRight size={18} />
      </button>
    </div>
  );
}
