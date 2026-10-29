import { useCallback, useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, 
  MessageSquareHeart, 
  RefreshCw, 
  QrCode, 
  Phone, 
  Mail, 
  Calendar, 
  ThumbsUp, 
  AlertCircle,
  Filter,
  MessageCircle,
  Table as TableIcon
} from 'lucide-react';
import { getFeedback, type FeedbackSummary } from './appStore';

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return iso;
  }
}

export default function Feedback() {
  const [data, setData] = useState<FeedbackSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | 'ALL'>('ALL');
  const [commentsOnly, setCommentsOnly] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await getFeedback(50);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load guest feedback.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredReviews = useMemo(() => {
    if (!data?.recent) return [];
    return data.recent.filter((rev) => {
      if (selectedRating !== 'ALL' && rev.rating !== selectedRating) return false;
      if (commentsOnly && (!rev.comment || !rev.comment.trim())) return false;
      return true;
    });
  }, [data?.recent, selectedRating, commentsOnly]);

  const positivePercent = useMemo(() => {
    if (!data || data.count === 0) return 0;
    const fourAndFive = (data.distribution[3] || 0) + (data.distribution[4] || 0);
    return Math.round((fourAndFive / data.count) * 100);
  }, [data]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <MessageSquareHeart className="h-5 w-5" />
            </span>
            Guest Feedback
          </h1>
          <p className="text-xs text-white/60 mt-1 max-w-xl">
            Private ratings and reviews submitted directly by diners at your tables. Visible only to you.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => void loadData(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/80 transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh Feedback"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/app/qr"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-lg shadow-emerald-950/40 transition-colors"
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>Get Table QRs</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-white/[0.03] border border-white/10 animate-pulse" />
          ))}
        </div>
      ) : data && data.count > 0 ? (
        <>
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Overall Rating Card */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#1b2520] to-[#121815] p-5 shadow-xl">
              <div className="flex items-center justify-between text-xs text-white/60 font-medium">
                <span>Overall Guest Rating</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 text-[10px] font-semibold border border-amber-400/20">
                  {data.count} Total {data.count === 1 ? 'Review' : 'Reviews'}
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-4xl font-extrabold text-white tracking-tight">
                  {data.average.toFixed(1)}
                </span>
                <span className="text-xs text-white/40 font-medium">out of 5.0</span>
              </div>
              <div className="mt-2.5 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${
                      s <= Math.round(data.average)
                        ? 'fill-amber-400 text-amber-400 drop-shadow-[0_1px_4px_rgba(251,191,36,0.4)]'
                        : 'fill-transparent text-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Guest Satisfaction */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#1b2520] to-[#121815] p-5 shadow-xl">
              <div className="flex items-center justify-between text-xs text-white/60 font-medium">
                <span>Customer Delight</span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  {positivePercent}% Positive
                </span>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-white">
                  {positivePercent >= 80 ? 'Exceptional' : positivePercent >= 60 ? 'Healthy' : 'Needs Focus'}
                </span>
                <p className="mt-1 text-xs text-white/50">
                  {data.distribution[4] + data.distribution[3]} diners rated your restaurant 4 or 5 stars.
                </p>
              </div>
            </div>

            {/* Star Distribution Breakdown */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#1b2520] to-[#121815] p-5 shadow-xl">
              <div className="text-xs text-white/60 font-medium mb-2.5">
                Rating Breakdown
              </div>
              <div className="space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const cnt = data.distribution[star - 1] || 0;
                  const pct = data.count > 0 ? Math.round((cnt / data.count) * 100) : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-5 text-[11px] font-semibold text-white/70 flex items-center gap-0.5">
                        {star}<Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            star >= 4 ? 'bg-amber-400' : star === 3 ? 'bg-amber-500/70' : 'bg-rose-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-[10px] text-white/40">{cnt}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-white/50 mr-1 flex items-center gap-1">
                <Filter className="h-3 w-3" /> Filter:
              </span>
              <button
                onClick={() => setSelectedRating('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  selectedRating === 'ALL'
                    ? 'bg-amber-400 text-black font-semibold shadow-md shadow-amber-400/20'
                    : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
                }`}
              >
                All ({data.count})
              </button>
              {[5, 4, 3, 2, 1].map((star) => (
                <button
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedRating === star
                      ? 'bg-amber-400 text-black font-semibold shadow-md shadow-amber-400/20'
                      : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
                  }`}
                >
                  <span>{star}</span>
                  <Star className={`h-3 w-3 ${selectedRating === star ? 'fill-black text-black' : 'fill-amber-400 text-amber-400'}`} />
                  <span className="text-[10px] opacity-70">({data.distribution[star - 1] || 0})</span>
                </button>
              ))}
            </div>

            <label className="inline-flex items-center gap-2 text-xs text-white/70 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={commentsOnly}
                onChange={(e) => setCommentsOnly(e.target.checked)}
                className="rounded border-white/20 bg-black/40 text-amber-400 focus:ring-0 focus:ring-offset-0"
              />
              <span>With Comments Only</span>
            </label>
          </div>

          {/* Feedback Items Feed */}
          {filteredReviews.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-white/10 bg-white/[0.02]">
              <MessageCircle className="h-8 w-8 mx-auto text-white/30 mb-2" />
              <p className="text-xs text-white/60">No reviews found matching your filter criteria.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-5 backdrop-blur-md hover:border-white/20 transition-all shadow-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-400/15 border border-amber-400/20 text-amber-300 font-bold text-xs">
                        <span>{rev.rating}</span>
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      </div>
                      {rev.tableNumber && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-white/80 text-[11px] font-medium">
                          <TableIcon className="h-3 w-3 text-emerald-400" />
                          Table {rev.tableNumber}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-white/40">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(rev.createdAt)}</span>
                    </div>
                  </div>

                  {rev.comment ? (
                    <blockquote className="text-xs text-white/90 leading-relaxed font-normal pl-3 border-l-2 border-amber-400/40 my-2">
                      "{rev.comment}"
                    </blockquote>
                  ) : (
                    <p className="text-[11px] text-white/40 italic my-1">
                      No written comment provided.
                    </p>
                  )}

                  {rev.contact && (
                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2 text-xs">
                      <span className="text-[11px] text-white/50">Guest Contact:</span>
                      <a
                        href={rev.contact.includes('@') ? `mailto:${rev.contact}` : `tel:${rev.contact}`}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-300 hover:underline"
                      >
                        {rev.contact.includes('@') ? (
                          <Mail className="h-3 w-3" />
                        ) : (
                          <Phone className="h-3 w-3" />
                        )}
                        <span>{rev.contact}</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#18231d] to-[#111714] p-10 text-center shadow-2xl">
          <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-amber-400/10 blur-3xl" />
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-400/10 text-amber-400 border border-amber-400/20 shadow-inner">
            <MessageSquareHeart className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            No Guest Feedback Yet
          </h2>
          <p className="mt-2 text-xs text-white/60 max-w-md mx-auto leading-relaxed">
            When guests scan your digital menu QR code or visit your link, they can leave private 1–5 star reviews and suggestions directly for you.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/app/qr"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white px-4 py-2.5 shadow-lg shadow-emerald-950/40 transition-colors"
            >
              <QrCode className="h-4 w-4" />
              <span>Download Table QR Codes</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
