import React, { useState } from 'react';
import { Sparkles, X, Megaphone, Tag } from 'lucide-react';
import { useMenuTheme } from '../MenuThemeProvider';

export const AnnouncementBanner: React.FC = () => {
  const { announcement } = useMenuTheme();
  const [dismissed, setDismissed] = useState(false);

  if (!announcement || dismissed) return null;

  const isOffer = /%|off|discount|flat|free|deal|happy hour|save/i.test(announcement);

  return (
    <div
      role="region"
      aria-label="Restaurant announcement"
      className="mx-auto w-full max-w-4xl px-4 py-2.5 animate-in fade-in slide-in-from-top-2 duration-300"
    >
      <div className="relative overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 p-3 sm:px-4 backdrop-blur-md shadow-lg shadow-amber-950/20 flex items-center justify-between gap-3 text-white">
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute -left-10 -top-10 h-24 w-24 rounded-full bg-amber-400/20 blur-xl" />

        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
            {isOffer ? <Tag className="h-3.5 w-3.5" /> : <Megaphone className="h-3.5 w-3.5" />}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
                {isOffer ? 'Special Offer' : 'Announcement'}
                <Sparkles className="h-2.5 w-2.5 text-amber-400" />
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-white/95 truncate">
              {announcement}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss announcement"
          className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors shrink-0"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
