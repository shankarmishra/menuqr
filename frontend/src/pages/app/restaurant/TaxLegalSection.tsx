import { Receipt } from 'lucide-react';
import type { CanonicalProfileData } from '../appStore';
import { COMPOSITION_DECLARATION, GST_RATES_BPS, RESTAURANT_TYPE_OPTIONS, formatRate, gstinError, type GstMode } from '../../../utils/gst';

interface TaxLegalSectionProps {
  profile: CanonicalProfileData;
  onChange: (updated: Partial<CanonicalProfileData>) => void;
}

const MODES: Array<{ value: GstMode; title: string; body: string }> = [
  { value: 'NOT_REGISTERED', title: 'Not GST registered', body: 'No GST on your bills and no GSTIN printed.' },
  { value: 'COMPOSITION', title: 'Composition scheme', body: 'No GST charged. Your GSTIN and the composition declaration are printed.' },
  { value: 'REGULAR', title: 'Regular GST', body: 'GST is added to bills at the rate you choose, split into CGST and SGST.' },
];

const inputClass =
  'w-full bg-[#151c19] border rounded-xl px-4 py-3 text-base text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#e8783c] transition-colors';

/**
 * Business type and the GST details printed on the restaurant's bills. Fields appear only when they
 * apply: a GSTIN only for registered restaurants, a rate only for regular GST.
 */
export function TaxLegalSection({ profile, onChange }: TaxLegalSectionProps) {
  const mode: GstMode = profile.gstMode || 'UNSET';
  const needsGstin = mode === 'REGULAR' || mode === 'COMPOSITION';
  const gstin = profile.gstin || '';
  const gstinProblem = needsGstin && gstin ? gstinError(gstin) : null;
  const rate = profile.gstRateBps ?? 500;
  const type = profile.restaurantTypes?.[0] || '';
  const inHotel = type === 'hotel_restaurant';
  const rateChoices = GST_RATES_BPS.filter((r) => r === 500 || r === 1800 || r === rate);

  return (
    <div className="bg-[#1d2723]/70 border border-[#2a3832] rounded-2xl p-5 space-y-5 shadow-sm">
      <div>
        <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
          <Receipt size={16} className="text-[#e8783c]" aria-hidden="true" />
          <span>Tax and legal details on your bills</span>
        </h4>
        <p className="text-sm text-slate-400 mt-1">
          Printed on the bills your guests receive. Your GSTIN is never shown on the public menu.
        </p>
      </div>

      {mode === 'UNSET' && (
        <p role="status" className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          Your bills currently add 5% GST because no GST status has been chosen. Choose the option that applies to you below.
        </p>
      )}

      <div>
        <label htmlFor="restaurant-type" className="block text-sm font-semibold text-slate-200 mb-1.5">Type of business</label>
        <select
          id="restaurant-type"
          value={type}
          onChange={(e) => onChange({ restaurantTypes: e.target.value ? [e.target.value] : [] })}
          className={`${inputClass} border-[#2a3832] min-h-12`}
        >
          <option value="">Choose…</option>
          {RESTAURANT_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="block text-sm font-semibold text-slate-200 mb-2">GST status</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {MODES.map((m) => {
            const selected = mode === m.value;
            return (
              <label
                key={m.value}
                className={`flex cursor-pointer flex-col gap-1 rounded-xl border p-4 min-h-12 transition-colors ${selected ? 'border-[#e8783c] bg-[#e8783c]/10' : 'border-[#2a3832] hover:border-slate-500'}`}
              >
                <span className="flex items-center gap-2 text-sm font-bold text-slate-100">
                  <input
                    type="radio"
                    name="gst-mode"
                    value={m.value}
                    checked={selected}
                    onChange={() =>
                      onChange({
                        gstMode: m.value,
                        gstin: m.value === 'NOT_REGISTERED' ? '' : gstin,
                        gstRateBps: m.value === 'REGULAR' ? (rate || 500) : 0,
                      })
                    }
                    className="h-4 w-4 accent-[#e8783c]"
                  />
                  {m.title}
                </span>
                <span className="text-sm text-slate-400">{m.body}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {needsGstin && (
        <div>
          <label htmlFor="gstin" className="block text-sm font-semibold text-slate-200 mb-1.5">GSTIN</label>
          <input
            id="gstin"
            type="text"
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            value={gstin}
            onChange={(e) => onChange({ gstin: e.target.value.toUpperCase().replace(/\s+/g, '').slice(0, 15) })}
            placeholder="15 characters, e.g. 27ABCDE1234F1Z5"
            aria-invalid={Boolean(gstinProblem)}
            aria-describedby="gstin-help"
            className={`${inputClass} font-mono max-w-sm ${gstinProblem ? 'border-red-400' : 'border-[#2a3832]'}`}
          />
          <p id="gstin-help" className={`mt-1.5 text-sm ${gstinProblem ? 'text-red-300' : 'text-slate-400'}`}>
            {gstinProblem || (gstin ? 'Looks right.' : 'Copy it exactly from your GST registration certificate.')}
          </p>
          {mode === 'COMPOSITION' && (
            <p className="mt-2 text-sm text-slate-400">Your bills will say: “{COMPOSITION_DECLARATION}”</p>
          )}
        </div>
      )}

      {mode === 'REGULAR' && (
        <fieldset>
          <legend className="block text-sm font-semibold text-slate-200 mb-2">GST rate on food</legend>
          <div className="flex flex-wrap gap-2">
            {rateChoices.map((r) => (
              <label
                key={r}
                className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-semibold ${rate === r ? 'border-[#e8783c] bg-[#e8783c]/10 text-slate-100' : 'border-[#2a3832] text-slate-300'}`}
              >
                <input type="radio" name="gst-rate" checked={rate === r} onChange={() => onChange({ gstRateBps: r })} className="accent-[#e8783c]" />
                {formatRate(r)}
              </label>
            ))}
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Most standalone restaurants charge 5%.{inHotel ? ' Restaurants inside some hotels charge 18%.' : ''} Confirm the rate that applies to you with your CA.
          </p>
        </fieldset>
      )}

      <div>
        <label htmlFor="legal-name" className="block text-sm font-semibold text-slate-200 mb-1.5">
          Registered business name <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <input
          id="legal-name"
          type="text"
          value={profile.legalName || ''}
          onChange={(e) => onChange({ legalName: e.target.value })}
          placeholder="As on your GST or FSSAI certificate"
          maxLength={120}
          className={`${inputClass} border-[#2a3832] max-w-md`}
        />
        <p className="mt-1.5 text-sm text-slate-400">Printed on bills only if it differs from your restaurant name.</p>
      </div>
    </div>
  );
}
