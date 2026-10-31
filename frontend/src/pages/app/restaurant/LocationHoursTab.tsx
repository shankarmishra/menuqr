import React from 'react';
import { ExternalLink, MapPin } from 'lucide-react';
import { AppearsOnChips, type SurfaceTarget } from './AppearsOnChips';
import { HoursEditor } from './HoursEditor';
import type { CanonicalProfileData } from '../appStore';

interface LocationHoursTabProps {
  profile: CanonicalProfileData;
  onChange: (updated: Partial<CanonicalProfileData>) => void;
  onHighlightSurface?: (surface: SurfaceTarget) => void;
  activeSurface?: string | null;
}

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi NCR',
  'Chandigarh',
  'Jammu and Kashmir',
  'Ladakh',
];

export const LocationHoursTab: React.FC<LocationHoursTabProps> = ({
  profile,
  onChange,
  onHighlightSurface,
  activeSurface,
}) => {
  const address = profile.address || {};
  const maps = profile.maps || {};
  const hours = profile.hours || { weekly: {} };

  const updateAddress = (field: string, val: string) => {
    onChange({
      address: {
        ...address,
        [field]: val,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Physical Address Section */}
      <div className="bg-[#1d2723]/70 border border-[#2a3832] rounded-2xl p-5 space-y-4 shadow-sm transition-all hover:border-[#2a3832]/90">
        <div>
          <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
            <MapPin size={16} className="text-[#e8783c]" />
            <span>Physical Location & Address</span>
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Shown to diners on the Info Sheet (ⓘ), Back Cover, and About & Visit page.
          </p>
        </div>

        <AppearsOnChips
          surfaces={['infoSheet', 'about', 'backCover', 'tent']}
          onHighlight={onHighlightSurface}
          activeSurface={activeSurface}
        />

        <div className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">
              Shop / Building / Street Address
            </label>
            <input
              type="text"
              value={address.line || ''}
              onChange={(e) => updateAddress('line', e.target.value)}
              placeholder="e.g. E-36, Patel Nagar 2nd, Near City Bus Stand"
              maxLength={120}
              className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#e8783c] focus:ring-1 focus:ring-[#e8783c] transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">
                Area / Locality
              </label>
              <input
                type="text"
                value={address.area || ''}
                onChange={(e) => updateAddress('area', e.target.value)}
                placeholder="e.g. Patel Nagar"
                maxLength={80}
                className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#e8783c] focus:ring-1 focus:ring-[#e8783c] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">
                Landmark (optional)
              </label>
              <input
                type="text"
                value={address.landmark || ''}
                onChange={(e) => updateAddress('landmark', e.target.value)}
                placeholder="e.g. Opp. Metro Pillar #42"
                maxLength={80}
                className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#e8783c] focus:ring-1 focus:ring-[#e8783c] transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">
                City
              </label>
              <input
                type="text"
                value={address.city || ''}
                onChange={(e) => updateAddress('city', e.target.value)}
                placeholder="Ghaziabad"
                className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#e8783c] focus:ring-1 focus:ring-[#e8783c] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">
                State / UT
              </label>
              <select
                value={address.state || ''}
                onChange={(e) => updateAddress('state', e.target.value)}
                className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-[#e8783c] focus:ring-1 focus:ring-[#e8783c] transition-colors"
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st} className="bg-[#151c19] text-white">
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">
                PIN Code (6 digits)
              </label>
              <input
                type="text"
                value={address.pincode || ''}
                onChange={(e) => updateAddress('pincode', e.target.value)}
                placeholder="201001"
                maxLength={6}
                className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl px-4 py-2.5 text-sm font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#e8783c] focus:ring-1 focus:ring-[#e8783c] transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide">
                Google Maps Location Link
              </label>
              {maps.url && (
                <a
                  href={maps.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-[#f49b6b] hover:text-[#e8783c] font-semibold transition-colors"
                >
                  <ExternalLink size={12} />
                  <span>Test Directions Link ↗</span>
                </a>
              )}
            </div>
            <input
              type="url"
              value={maps.url || ''}
              onChange={(e) => onChange({ maps: { ...maps, url: e.target.value } })}
              placeholder="e.g. https://maps.app.goo.gl/..."
              className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl px-4 py-2.5 text-sm font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#e8783c] focus:ring-1 focus:ring-[#e8783c] transition-colors"
            />
            <span className="block text-[11px] text-slate-400 mt-1">
              Diners clicking "Get Directions" on your QR menu will be routed straight to this map pin.
            </span>
          </div>
        </div>
      </div>

      {/* Opening Hours Section */}
      <div className="bg-[#1d2723]/70 border border-[#2a3832] rounded-2xl p-5 space-y-4 shadow-sm transition-all hover:border-[#2a3832]/90">
        <div>
          <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Weekly Opening Hours & Service Schedule
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Drives the real-time "Open now" / "Closed" badge on your cover, and automated ordering availability.
          </p>
        </div>

        <AppearsOnChips
          surfaces={['cover', 'infoSheet', 'about', 'backCover', 'checkout']}
          onHighlight={onHighlightSurface}
          activeSurface={activeSurface}
        />

        <HoursEditor
          hours={hours}
          onChange={(newHours) => onChange({ hours: newHours })}
        />
      </div>
    </div>
  );
};
