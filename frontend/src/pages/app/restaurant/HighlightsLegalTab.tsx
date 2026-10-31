import React from 'react';
import { ShieldCheck, FileCheck2, CreditCard, Sparkles } from 'lucide-react';
import { AppearsOnChips, type SurfaceTarget } from './AppearsOnChips';
import type { CanonicalProfileData } from '../appStore';

interface HighlightsLegalTabProps {
  profile: CanonicalProfileData;
  onChange: (updated: Partial<CanonicalProfileData>) => void;
  onHighlightSurface?: (surface: SurfaceTarget) => void;
  activeSurface?: string | null;
}

const AMENITY_OPTIONS = [
  'Air Conditioned (AC)',
  'Family Seating',
  'Outdoor Seating',
  'Rooftop Lounge',
  'Free Parking',
  'Valet Parking',
  'Live Music',
  'High-Speed Wi-Fi',
  'Pet Friendly',
  'Wheelchair Accessible',
  'Kids Friendly',
  'Private Party Hall',
  'Full Bar Available',
  'Late Night Dining',
  'Open 24x7',
  'Buffet Spread',
];

const PAYMENT_OPTIONS = [
  'Cash',
  'UPI (Google Pay, PhonePe, Paytm)',
  'Credit & Debit Cards',
  'Meal Vouchers (Sodexo)',
];

const PRICE_NOTE_PRESETS = [
  'Prices are inclusive of all taxes',
  '5% GST extra as applicable',
  '18% GST extra on alcoholic beverages',
  'Prices exclusive of applicable taxes',
];

export const HighlightsLegalTab: React.FC<HighlightsLegalTabProps> = ({
  profile,
  onChange,
  onHighlightSurface,
  activeSurface,
}) => {
  const highlights = profile.highlights || [];
  const payments = profile.payments || [];

  const handleToggleAmenity = (item: string) => {
    if (highlights.includes(item)) {
      onChange({ highlights: highlights.filter((h) => h !== item) });
    } else if (highlights.length < 12) {
      onChange({ highlights: [...highlights, item] });
    }
  };

  const handleTogglePayment = (pay: string) => {
    if (payments.includes(pay)) {
      onChange({ payments: payments.filter((p) => p !== pay) });
    } else {
      onChange({ payments: [...payments, pay] });
    }
  };

  return (
    <div className="space-y-6">
      {/* Amenities & Highlights */}
      <div className="bg-[#1d2723]/70 border border-[#2a3832] rounded-2xl p-5 space-y-3 shadow-sm transition-all hover:border-[#2a3832]/90">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
            <Sparkles size={16} className="text-[#e8783c]" />
            <span>Amenities & Dining Features (up to 12)</span>
          </label>
          <span className="text-[11px] text-slate-400 font-mono">
            {highlights.length}/12 selected
          </span>
        </div>
        <AppearsOnChips
          surfaces={['about']}
          onHighlight={onHighlightSurface}
          activeSurface={activeSurface}
        />
        <div className="flex flex-wrap gap-2 pt-1">
          {AMENITY_OPTIONS.map((amenity) => {
            const isSelected = highlights.includes(amenity);
            return (
              <button
                key={amenity}
                type="button"
                onClick={() => handleToggleAmenity(amenity)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'bg-[#e8783c]/20 text-[#f49b6b] border-[#e8783c]/60 shadow-[0_0_12px_rgba(232,120,60,0.2)]'
                    : 'bg-[#151c19] border-[#2a3832] text-slate-400 hover:text-slate-200 hover:border-slate-600'
                }`}
              >
                {isSelected ? `✓ ${amenity}` : `+ ${amenity}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Payment Modes Accepted */}
      <div className="bg-[#1d2723]/70 border border-[#2a3832] rounded-2xl p-5 space-y-3 shadow-sm transition-all hover:border-[#2a3832]/90">
        <label className="block text-xs font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
          <CreditCard size={16} className="text-[#e8783c]" />
          <span>Payment Modes Accepted</span>
        </label>
        <AppearsOnChips
          surfaces={['about', 'backCover', 'checkout']}
          onHighlight={onHighlightSurface}
          activeSurface={activeSurface}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {PAYMENT_OPTIONS.map((pay) => {
            const isSelected = payments.includes(pay);
            return (
              <button
                key={pay}
                type="button"
                onClick={() => handleTogglePayment(pay)}
                className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                    : 'bg-[#151c19] border-[#2a3832] text-slate-400 hover:text-slate-200 hover:border-slate-600'
                }`}
              >
                <span>{pay}</span>
                {isSelected && <span className="text-emerald-400 text-xs font-bold">✓ Active</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Taxes & Price Notes */}
      <div className="bg-[#1d2723]/70 border border-[#2a3832] rounded-2xl p-5 space-y-4 shadow-sm transition-all hover:border-[#2a3832]/90">
        <div>
          <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
            <FileCheck2 size={16} className="text-[#e8783c]" />
            <span>Tax & Billing Transparency</span>
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Displayed on menu footers and checkout summaries so diners know exact tax expectations before ordering.
          </p>
        </div>

        <AppearsOnChips
          surfaces={['inner', 'backCover', 'checkout']}
          onHighlight={onHighlightSurface}
          activeSurface={activeSurface}
        />

        <div className="space-y-3.5 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
              Price Note Presets
            </label>
            <div className="flex flex-wrap gap-2 mb-2.5">
              {PRICE_NOTE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onChange({ priceNote: preset })}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-[#151c19] border border-[#2a3832] hover:border-[#e8783c]/50 text-slate-300 hover:text-white transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={profile.priceNote || ''}
              onChange={(e) => onChange({ priceNote: e.target.value })}
              placeholder="e.g. Prices are inclusive of all taxes"
              maxLength={50}
              className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#e8783c] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
              Service Charge Policy (optional)
            </label>
            <input
              type="text"
              value={profile.serviceChargeNote || ''}
              onChange={(e) => onChange({ serviceChargeNote: e.target.value })}
              placeholder="e.g. 5% discretionary service charge applicable"
              maxLength={80}
              className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#e8783c] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* FSSAI Number */}
      <div className="bg-[#1d2723]/70 border border-[#2a3832] rounded-2xl p-5 space-y-3 shadow-sm transition-all hover:border-[#2a3832]/90">
        <div>
          <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#e8783c]" />
            <span>FSSAI Food Safety License Number</span>
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Mandatory regulatory requirement for commercial food establishments in India. Displayed discreetly in footer.
          </p>
        </div>

        <AppearsOnChips
          surfaces={['about', 'backCover']}
          onHighlight={onHighlightSurface}
          activeSurface={activeSurface}
        />

        <div className="max-w-xs pt-1">
          <input
            type="text"
            value={profile.fssai || ''}
            onChange={(e) => onChange({ fssai: e.target.value })}
            placeholder="14-digit FSSAI number"
            maxLength={14}
            className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl px-4 py-2.5 text-sm font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#e8783c] transition-colors"
          />
        </div>
      </div>
    </div>
  );
};
