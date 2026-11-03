import { useEffect, useState } from 'react';
import { getSubscriptionInvoices, downloadInvoicePdf, type SubscriptionInvoice } from '../../pages/app/appStore';
import { FileText, Download, RefreshCw, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

export default function InvoiceHistory() {
  const [invoices, setInvoices] = useState<SubscriptionInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; message: string; isError?: boolean } | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    getSubscriptionInvoices()
      .then((res) => {
        setInvoices(res?.invoices || []);
      })
      .catch((err) => {
        console.error('[InvoiceHistory] Failed to load invoices:', err);
        setError('Unable to load invoices. Please check your connection and try again.');
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  const handleDownload = async (inv: SubscriptionInvoice) => {
    if (downloadingId) return;
    setDownloadingId(inv.id);
    setFeedback(null);

    try {
      await downloadInvoicePdf(inv.id, inv.invoiceNumber);
      setFeedback({ id: inv.id, message: 'PDF downloaded' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: unknown) {
      console.error('[InvoiceHistory] Download error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to download PDF invoice';
      setFeedback({ id: inv.id, message: msg, isError: true });
    } finally {
      setDownloadingId(null);
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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getTypeBadgeClass = (type?: string) => {
    const t = (type || '').toUpperCase();
    if (t === 'RENEWAL') return 'bg-sky-500/15 text-sky-400 border-sky-500/20';
    if (t === 'UPGRADE') return 'bg-purple-500/15 text-purple-400 border-purple-500/20';
    return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';
  };

  return (
    <div className="rounded-2xl bg-gradient-to-r from-[#1d2723] to-[#25322d] border border-[#2a3832] p-6 md:p-8 shadow-xl mt-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#e8783c]/15 text-[#e8783c] border border-[#e8783c]/20">
            <FileText size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">Tax & Billing Invoices</h2>
            <p className="text-sm text-[#849a90] mt-0.5">
              Official GST tax receipts for your MenuQR subscription and plan upgrades.
            </p>
          </div>
        </div>

        <button
          onClick={() => loadInvoices(true)}
          disabled={loading || refreshing}
          className="flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#849a90] hover:text-white bg-[#151c19]/60 hover:bg-[#151c19] border border-white/5 hover:border-white/10 rounded-xl transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin text-[#e8783c]' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadInvoices()}
            className="text-xs font-bold underline hover:text-rose-100 ml-4 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-[#151c19]/50 animate-pulse border border-white/5" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && invoices.length === 0 && (
        <div className="mt-6 text-center py-12 px-4 rounded-xl bg-[#151c19]/30 border border-white/5">
          <div className="inline-flex p-3 rounded-full bg-white/5 text-[#849a90] mb-3">
            <FileText size={28} />
          </div>
          <h3 className="text-base font-semibold text-white">No Invoices Found</h3>
          <p className="text-sm text-[#849a90] max-w-sm mx-auto mt-1">
            Official GST tax receipts will automatically appear here once your subscription or renewal payment completes.
          </p>
        </div>
      )}

      {/* Invoices List / Table */}
      {!loading && !error && invoices.length > 0 && (
        <div className="mt-6">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-[#62756d] font-semibold">
                  <th className="py-3 px-3">Invoice Number</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Plan & Type</th>
                  <th className="py-3 px-3 text-right">Subtotal</th>
                  <th className="py-3 px-3 text-right">GST (18%)</th>
                  <th className="py-3 px-3 text-right">Total</th>
                  <th className="py-3 px-3 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {invoices.map((inv) => {
                  const taxPaise = (inv.cgstPaise || 0) + (inv.sgstPaise || 0) + (inv.igstPaise || 0);
                  const isDownloading = downloadingId === inv.id;
                  const itemFeedback = feedback?.id === inv.id ? feedback : null;

                  return (
                    <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-3.5 px-3 font-mono text-xs font-bold text-white">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-3 text-[#849a90] text-xs">
                        {formatDate(inv.createdAt || inv.date)}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{inv.planName || inv.planLabel || 'Plan'}</span>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getTypeBadgeClass(inv.type || inv.invoiceType)}`}>
                            {inv.type || inv.invoiceType || 'SUBSCRIPTION'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right text-xs text-[#849a90]">
                        {formatPaise(inv.subtotalPaise)}
                      </td>
                      <td className="py-3.5 px-3 text-right text-xs text-[#849a90]">
                        {formatPaise(taxPaise)}
                      </td>
                      <td className="py-3.5 px-3 text-right text-sm font-bold text-white">
                        {inv.totalFormatted || formatPaise(inv.totalPaise)}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => handleDownload(inv)}
                          disabled={isDownloading}
                          title="Download GST Tax Invoice (PDF)"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#25322d] hover:bg-[#2f3f39] text-[#e8783c] hover:text-white border border-[#2a3832] hover:border-[#e8783c]/40 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                        >
                          {isDownloading ? (
                            <Loader2 size={13} className="animate-spin text-[#e8783c]" />
                          ) : itemFeedback ? (
                            itemFeedback.isError ? (
                              <AlertCircle size={13} className="text-rose-400" />
                            ) : (
                              <CheckCircle2 size={13} className="text-emerald-400" />
                            )
                          ) : (
                            <Download size={13} />
                          )}
                          <span>{isDownloading ? 'Downloading...' : 'PDF'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {invoices.map((inv) => {
              const taxPaise = (inv.cgstPaise || 0) + (inv.sgstPaise || 0) + (inv.igstPaise || 0);
              const isDownloading = downloadingId === inv.id;

              return (
                <div
                  key={inv.id}
                  className="p-4 rounded-xl bg-[#151c19]/50 border border-white/5 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono text-xs font-bold text-white">{inv.invoiceNumber}</p>
                      <p className="text-[11px] text-[#849a90] mt-0.5">{formatDate(inv.createdAt || inv.date)}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getTypeBadgeClass(inv.type || inv.invoiceType)}`}>
                      {inv.type || inv.invoiceType || 'SUBSCRIPTION'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-xs">
                    <div>
                      <span className="text-[#62756d]">Plan:</span>
                      <p className="font-semibold text-white">{inv.planName || inv.planLabel || 'Plan'}</p>
                    </div>
                    <div>
                      <span className="text-[#62756d]">Subtotal:</span>
                      <p className="text-[#849a90]">{formatPaise(inv.subtotalPaise)}</p>
                    </div>
                    <div>
                      <span className="text-[#62756d]">GST (18%):</span>
                      <p className="text-[#849a90]">{formatPaise(taxPaise)}</p>
                    </div>
                    <div>
                      <span className="text-[#62756d]">Total Amount:</span>
                      <p className="font-bold text-white">{inv.totalFormatted || formatPaise(inv.totalPaise)}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload(inv)}
                    disabled={isDownloading}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg bg-[#25322d] text-[#e8783c] hover:text-white border border-[#2a3832] hover:border-[#e8783c]/40 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isDownloading ? (
                      <Loader2 size={14} className="animate-spin text-[#e8783c]" />
                    ) : (
                      <Download size={14} />
                    )}
                    <span>{isDownloading ? 'Downloading PDF...' : 'Download Tax Invoice (PDF)'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
