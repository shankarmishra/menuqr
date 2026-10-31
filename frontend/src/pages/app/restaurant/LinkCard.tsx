import React, { useMemo } from 'react';
import { ExternalLink, Pause, Play, Trash2, Globe, Utensils } from 'lucide-react';
import type { CanonicalLink } from '../appStore';

function InstagramIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function YouTubeIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

interface LinkCardProps {
  link: CanonicalLink;
  onChange: (updated: CanonicalLink) => void;
  onDelete: () => void;
}

const ICONS: Record<string, React.ElementType> = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  youtube: YouTubeIcon,
  website: Globe,
  zomato: Utensils,
  swiggy: Utensils,
  custom: Globe,
};

export const LinkCard: React.FC<LinkCardProps> = ({ link, onChange, onDelete }) => {
  const IconComponent = ICONS[link.type] || Globe;

  const normalizedDisplay = useMemo(() => {
    const raw = String(link.value || '').trim();
    if (!raw) return '';
    if (link.type === 'instagram') {
      const clean = raw
        .replace(/^https?:\/\/(www\.)?instagram\.com\//, '')
        .replace(/\/.*$/, '')
        .replace(/^@+/, '');
      return `@${clean}`;
    }
    if (link.type === 'facebook') {
      return raw.replace(/^https?:\/\/(www\.)?facebook\.com\//, '');
    }
    return raw.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  }, [link.type, link.value]);

  const testHref = useMemo(() => {
    const raw = String(link.value || '').trim();
    if (!raw) return '#';
    if (link.type === 'instagram') {
      const clean = raw
        .replace(/^https?:\/\/(www\.)?instagram\.com\//, '')
        .replace(/\/.*$/, '')
        .replace(/^@+/, '');
      return `https://instagram.com/${clean}`;
    }
    if (link.type === 'facebook') {
      if (raw.startsWith('http')) return raw;
      return `https://facebook.com/${raw.replace(/^@/, '')}`;
    }
    if (!/^https?:\/\//i.test(raw)) return `https://${raw}`;
    return raw;
  }, [link.type, link.value]);

  return (
    <div
      className={`border rounded-xl p-4 transition-all space-y-3 ${
        link.paused
          ? 'bg-[#151c19]/40 border-[#2a3832]/60 opacity-60'
          : 'bg-[#151c19] border-[#2a3832] hover:border-[#2a3832]/90 shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Icon & Input */}
        <div className="flex items-center gap-3 flex-1">
          <div className="w-9 h-9 rounded-xl bg-[#1d2723] border border-[#2a3832] flex items-center justify-center text-slate-300 shrink-0">
            <IconComponent size={17} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 capitalize">
                {link.type === 'custom' ? link.label || 'Custom Link' : link.type}
              </span>
              {normalizedDisplay && (
                <span className="text-[11px] font-mono text-[#f49b6b] truncate max-w-[180px]">
                  → {normalizedDisplay}
                </span>
              )}
            </div>
            <input
              type="text"
              value={link.value || ''}
              onChange={(e) => onChange({ ...link, value: e.target.value })}
              placeholder={link.type === 'instagram' ? '@handle or full profile URL' : 'https://...'}
              className="w-full bg-[#0e1311] border border-[#2a3832] rounded-lg px-3.5 py-1.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#e8783c] font-mono transition-colors"
            />
          </div>
        </div>

        {/* Right actions: Test link, Pause, Delete */}
        <div className="flex items-center gap-1 shrink-0 pt-4">
          {link.value && (
            <a
              href={testHref}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-400 hover:text-[#f49b6b] hover:bg-[#e8783c]/10 rounded-lg transition-colors"
              title="Test link ↗"
            >
              <ExternalLink size={15} />
            </a>
          )}
          <button
            type="button"
            onClick={() => onChange({ ...link, paused: !link.paused })}
            className={`p-1.5 rounded-lg transition-colors ${
              link.paused
                ? 'text-[#f49b6b] hover:bg-[#e8783c]/15'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1d2723]'
            }`}
            title={link.paused ? 'Resume link' : 'Pause link (hide without deleting)'}
          >
            {link.paused ? <Play size={15} /> : <Pause size={15} />}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            title="Delete link"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Placement toggles */}
      <div className="flex items-center justify-between pt-2.5 border-t border-[#2a3832]/60 text-xs">
        <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">
          Show on:
        </span>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white select-none">
            <input
              type="checkbox"
              checked={link.placements?.cover !== false}
              onChange={(e) =>
                onChange({
                  ...link,
                  placements: { ...link.placements, cover: e.target.checked },
                })
              }
              className="rounded bg-[#0e1311] border-[#2a3832] text-[#e8783c] focus:ring-0"
            />
            <span className="text-slate-300">Cover header</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white select-none">
            <input
              type="checkbox"
              checked={link.placements?.about !== false}
              onChange={(e) =>
                onChange({
                  ...link,
                  placements: { ...link.placements, about: e.target.checked },
                })
              }
              className="rounded bg-[#0e1311] border-[#2a3832] text-[#e8783c] focus:ring-0"
            />
            <span className="text-slate-300">About drawer</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white select-none">
            <input
              type="checkbox"
              checked={link.placements?.print !== false}
              onChange={(e) =>
                onChange({
                  ...link,
                  placements: { ...link.placements, print: e.target.checked },
                })
              }
              className="rounded bg-[#0e1311] border-[#2a3832] text-[#e8783c] focus:ring-0"
            />
            <span className="text-slate-300">Print Menu QR</span>
          </label>
        </div>
      </div>
    </div>
  );
};
