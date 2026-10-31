import React from 'react';
import { Phone, MessageCircle, Star, Trash2 } from 'lucide-react';
import type { CanonicalContact } from '../appStore';

interface PhoneRowProps {
  contact: CanonicalContact;
  index: number;
  total: number;
  onChange: (updated: CanonicalContact) => void;
  onDelete: () => void;
  onSetPrimary: () => void;
}

export const PhoneRow: React.FC<PhoneRowProps> = ({
  contact,
  onChange,
  onDelete,
  onSetPrimary,
}) => {
  return (
    <div className="bg-[#151c19] border border-[#2a3832] rounded-xl p-4 transition-all hover:border-[#2a3832]/90 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Label & Number */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">
              Line Label
            </label>
            <input
              type="text"
              value={contact.label || ''}
              onChange={(e) => onChange({ ...contact, label: e.target.value })}
              placeholder="e.g. Table Booking, Kitchen, Main"
              maxLength={24}
              className="w-full bg-[#0e1311] border border-[#2a3832] rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#e8783c] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">
              Phone Number (10 digits)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-mono text-slate-500 font-semibold">
                +91
              </span>
              <input
                type="tel"
                value={contact.number.replace(/^\+91/, '')}
                onChange={(e) => onChange({ ...contact, number: e.target.value })}
                placeholder="9876543210"
                className="w-full bg-[#0e1311] border border-[#2a3832] rounded-lg pl-11 pr-3 py-2 text-sm font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#e8783c] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Delete button */}
        <button
          type="button"
          onClick={onDelete}
          className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors self-end sm:self-center"
          title="Remove phone number"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Toggles Row */}
      <div className="flex flex-wrap items-center justify-between pt-2.5 border-t border-[#2a3832]/60 gap-3 text-xs">
        <div className="flex items-center gap-4">
          {/* Show on Menu */}
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white select-none">
            <input
              type="checkbox"
              checked={contact.public}
              onChange={(e) => onChange({ ...contact, public: e.target.checked })}
              className="rounded bg-[#0e1311] border-[#2a3832] text-[#e8783c] focus:ring-0"
            />
            <Phone size={13} className={contact.public ? 'text-[#e8783c]' : 'text-slate-500'} />
            <span className={contact.public ? 'font-medium text-slate-200' : 'text-slate-400'}>
              Show on QR menu
            </span>
          </label>

          {/* WhatsApp switch */}
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white select-none">
            <input
              type="checkbox"
              checked={contact.whatsapp}
              onChange={(e) => onChange({ ...contact, whatsapp: e.target.checked })}
              className="rounded bg-[#0e1311] border-[#2a3832] text-emerald-500 focus:ring-0"
            />
            <MessageCircle
              size={13}
              className={contact.whatsapp ? 'text-emerald-400' : 'text-slate-500'}
            />
            <span className={contact.whatsapp ? 'font-medium text-emerald-300' : 'text-slate-400'}>
              Direct WhatsApp chat
            </span>
          </label>
        </div>

        {/* Primary Phone Marker */}
        <button
          type="button"
          onClick={onSetPrimary}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            contact.primary
              ? 'bg-[#e8783c]/20 text-[#f49b6b] border border-[#e8783c]/50 shadow-sm'
              : 'text-slate-500 hover:text-slate-300 hover:bg-[#1d2723]'
          }`}
        >
          <Star size={12} fill={contact.primary ? 'currentColor' : 'none'} />
          <span>{contact.primary ? 'Primary Line' : 'Set as Primary'}</span>
        </button>
      </div>
    </div>
  );
};
