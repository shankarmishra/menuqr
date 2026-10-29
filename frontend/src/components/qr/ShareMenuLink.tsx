import { Copy, Share2, MessageCircle } from 'lucide-react';
import { useToast } from '../feedback/ToastProvider';

type Props = { menuUrl: string; restaurantName: string };

/** Share the permanent menu link on WhatsApp, via the phone's share sheet, or by copying it. */
export default function ShareMenuLink({ menuUrl, restaurantName }: Props) {
  const showToast = useToast();
  const message = `Check out the menu of ${restaurantName}: ${menuUrl}`;
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(menuUrl);
      showToast('success', 'Menu link copied.');
    } catch {
      showToast('error', 'Could not copy. Long-press the link to copy it.');
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: restaurantName, text: `Menu of ${restaurantName}`, url: menuUrl });
    } catch {
      // The user dismissing the share sheet is not an error.
    }
  }

  return (
    <div className="bg-[#1d2723] rounded-2xl border border-[#2a3832] overflow-hidden shadow-xl">
      <div className="p-4 sm:p-5 border-b border-[#2a3832] bg-[#151c19] flex items-center gap-2 font-bold text-white text-sm">
        <span className="bg-emerald-500/10 text-emerald-400 p-1.5 rounded-md border border-emerald-500/20"><Share2 size={16} /></span>
        Share your menu link
      </div>
      <div className="p-4 sm:p-6 space-y-3">
        <input
          readOnly
          value={menuUrl}
          aria-label="Menu link"
          onFocus={(e) => e.currentTarget.select()}
          className="w-full rounded-lg border border-[#36473f] bg-[#151c19] px-3.5 py-2.5 text-xs text-[#aab7b2]"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#25D366] hover:brightness-110 py-2.5 text-xs font-bold text-white"
          >
            <MessageCircle size={14} /> WhatsApp
          </a>
          <button
            type="button"
            onClick={() => void copyLink()}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#25322d] hover:bg-[#2a3832] border border-[#36473f] py-2.5 text-xs font-bold text-white cursor-pointer"
          >
            <Copy size={14} /> Copy link
          </button>
          {canNativeShare && (
            <button
              type="button"
              onClick={() => void nativeShare()}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-[#25322d] hover:bg-[#2a3832] border border-[#36473f] py-2.5 text-xs font-bold text-white cursor-pointer"
            >
              <Share2 size={14} /> More…
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
