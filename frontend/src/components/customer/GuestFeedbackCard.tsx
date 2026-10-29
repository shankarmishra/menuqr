import { useState, useEffect } from 'react';
import { Star, MessageSquareHeart, CheckCircle2, Send, Loader2, Sparkles } from 'lucide-react';
import { getApiBaseUrl } from '../../utils/apiBaseUrl';

interface GuestFeedbackCardProps {
  slug: string;
  restaurantName: string;
  initialTableNumber?: string;
  className?: string;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Needs improvement 😕',
  2: 'Could be better 😐',
  3: 'Good experience 🙂',
  4: 'Very good! 😊',
  5: 'Loved it! 🌟',
};

export default function GuestFeedbackCard({
  slug,
  restaurantName,
  initialTableNumber = '',
  className = '',
}: GuestFeedbackCardProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [contact, setContact] = useState('');
  const [tableNumber, setTableNumber] = useState(initialTableNumber);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync initial table number if passed or changed
  useEffect(() => {
    if (initialTableNumber) {
      setTableNumber(initialTableNumber);
    }
  }, [initialTableNumber]);

  // Check localStorage if user already submitted feedback today
  useEffect(() => {
    try {
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      const submitted = localStorage.getItem(`mq-feedback:${slug}:${today}`);
      if (submitted) {
        setIsSubmitted(true);
      }
    } catch {
      // Storage unavailable / private mode
    }
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setErrorMessage('Please select a rating between 1 and 5 stars.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/public/menu/${encodeURIComponent(slug)}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || undefined,
          contact: contact.trim() || undefined,
          tableNumber: tableNumber.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setIsSubmitted(true);
      try {
        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
        localStorage.setItem(`mq-feedback:${slug}:${today}`, 'true');
      } catch {
        // LocalStorage fallback
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section aria-label="Customer Feedback" className={`mx-auto my-8 max-w-md px-4 ${className}`}>
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-b from-emerald-950/30 to-[#121c17]/60 p-6 text-center backdrop-blur-xl shadow-2xl">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-white tracking-wide">
            Thank You for Dining With Us!
          </h3>
          <p className="mt-1.5 text-xs text-white/70 leading-relaxed max-w-xs mx-auto">
            Your private feedback has been delivered directly to {restaurantName}'s management. We appreciate your review!
          </p>
        </div>
      </section>
    );
  }

  const activeRating = hoverRating || rating;

  return (
    <section aria-label="Guest Feedback" className={`mx-auto my-10 max-w-md px-4 ${className}`}>
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-6 backdrop-blur-xl shadow-2xl transition-all">
        {/* Glow ambient background */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="flex items-center gap-2.5 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/15 text-amber-400 border border-amber-400/20">
            <MessageSquareHeart className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-1.5">
              Rate Your Experience
              <Sparkles className="h-3 w-3 text-amber-400 opacity-80" />
            </h3>
            <p className="text-[11px] text-white/50">Private feedback sent directly to owner</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Interactive Stars */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isLit = star <= activeRating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setRating(star);
                      setErrorMessage(null);
                    }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    className="p-1 text-white/30 hover:scale-125 transition-all duration-150 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-lg"
                  >
                    <Star
                      className={`h-7 w-7 transition-colors duration-200 ${
                        isLit
                          ? 'fill-amber-400 text-amber-400 filter drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]'
                          : 'fill-transparent text-white/30 hover:text-white/60'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <div className="h-5 mt-1.5 flex items-center justify-center text-xs font-medium text-amber-300">
              {activeRating > 0 ? (
                <span className="animate-in fade-in zoom-in-95 duration-150">
                  {RATING_LABELS[activeRating]}
                </span>
              ) : (
                <span className="text-white/40 text-[11px]">Tap stars to rate</span>
              )}
            </div>
          </div>

          {/* Details (Shown when rating is selected) */}
          {rating > 0 && (
            <div className="space-y-3 pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
              <div>
                <label htmlFor="guest-comment" className="block text-[11px] font-medium text-white/70 mb-1">
                  How was the food, service & ambiance? (Optional)
                </label>
                <textarea
                  id="guest-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, 500))}
                  placeholder="Tell us what you liked or how we can improve..."
                  rows={2}
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white placeholder-white/30 focus:border-amber-400/60 focus:bg-black/50 focus:outline-none transition-all resize-none"
                />
                <div className="text-right text-[10px] text-white/40 mt-0.5">
                  {comment.length}/500
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="guest-table" className="block text-[11px] font-medium text-white/70 mb-1">
                    Table No. (Optional)
                  </label>
                  <input
                    id="guest-table"
                    type="text"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value.slice(0, 50))}
                    placeholder="e.g. 5, Bar-2"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white placeholder-white/30 focus:border-amber-400/60 focus:bg-black/50 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="guest-contact" className="block text-[11px] font-medium text-white/70 mb-1">
                    Phone / Email (Optional)
                  </label>
                  <input
                    id="guest-contact"
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value.slice(0, 120))}
                    placeholder="For manager follow-up"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white placeholder-white/30 focus:border-amber-400/60 focus:bg-black/50 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-300">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold py-2.5 px-4 text-xs shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Send Private Feedback</span>
                    <Send className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
