import React, { useState } from 'react';
import { Plus, Phone, Share2, Calendar } from 'lucide-react';
import { AppearsOnChips, type SurfaceTarget } from './AppearsOnChips';
import { PhoneRow } from './PhoneRow';
import { LinkCard } from './LinkCard';
import type { CanonicalProfileData, CanonicalContact, CanonicalLink } from '../appStore';

interface ContactSocialTabProps {
  profile: CanonicalProfileData;
  onChange: (updated: Partial<CanonicalProfileData>) => void;
  onHighlightSurface?: (surface: SurfaceTarget) => void;
  activeSurface?: string | null;
}

const AVAILABLE_LINK_TYPES = [
  { type: 'instagram', label: 'Instagram' },
  { type: 'facebook', label: 'Facebook' },
  { type: 'youtube', label: 'YouTube' },
  { type: 'website', label: 'Official Website' },
  { type: 'zomato', label: 'Zomato Page' },
  { type: 'swiggy', label: 'Swiggy Page' },
  { type: 'custom', label: 'Custom Web Link' },
];

export const ContactSocialTab: React.FC<ContactSocialTabProps> = ({
  profile,
  onChange,
  onHighlightSurface,
  activeSurface,
}) => {
  const contacts = profile.contacts || [];
  const links = profile.links || [];
  const reservations = profile.reservations || { mode: 'none' };
  const [showAddLinkDropdown, setShowAddLinkDropdown] = useState(false);

  // Phone operations
  const handleAddPhone = () => {
    if (contacts.length >= 4) return;
    const newContact: CanonicalContact = {
      id: `p_${Date.now()}`,
      label: contacts.length === 0 ? 'Primary' : 'Contact',
      kind: 'mobile',
      number: '',
      public: true,
      whatsapp: false,
      whatsappMessage: '',
      primary: contacts.length === 0,
    };
    onChange({ contacts: [...contacts, newContact] });
  };

  const handleUpdatePhone = (index: number, updated: CanonicalContact) => {
    const list = [...contacts];
    list[index] = updated;
    onChange({ contacts: list });
  };

  const handleDeletePhone = (index: number) => {
    const list = contacts.filter((_, i) => i !== index);
    if (list.length > 0 && !list.some((c) => c.primary)) {
      list[0].primary = true;
    }
    onChange({ contacts: list });
  };

  const handleSetPrimaryPhone = (index: number) => {
    const list = contacts.map((c, i) => ({
      ...c,
      primary: i === index,
    }));
    onChange({ contacts: list });
  };

  // Link operations
  const handleAddLink = (type: string) => {
    setShowAddLinkDropdown(false);
    if (links.length >= 8) return;
    const newLink: CanonicalLink = {
      type,
      value: '',
      label: type === 'custom' ? 'Custom Link' : undefined,
      placements: { cover: type === 'instagram', about: true, print: true },
      paused: false,
    };
    onChange({ links: [...links, newLink] });
  };

  const handleUpdateLink = (index: number, updated: CanonicalLink) => {
    const list = [...links];
    list[index] = updated;
    onChange({ links: list });
  };

  const handleDeleteLink = (index: number) => {
    onChange({ links: links.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      {/* Phone Numbers Section */}
      <div className="bg-[#1d2723]/70 border border-[#2a3832] rounded-2xl p-5 space-y-4 shadow-sm transition-all hover:border-[#2a3832]/90">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
              <Phone size={16} className="text-[#e8783c]" />
              <span>Direct Customer Phone Numbers (up to 4)</span>
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Only numbers marked "Show on QR menu" are exposed to diners. Supports WhatsApp one-tap messaging.
            </p>
          </div>
          {contacts.length < 4 && (
            <button
              type="button"
              onClick={handleAddPhone}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#e8783c] hover:bg-[#d66c32] text-white text-xs font-bold transition-all shadow-md shadow-[#e8783c]/20 hover:scale-[1.02] active:scale-95"
            >
              <Plus size={14} />
              <span>Add Phone Line</span>
            </button>
          )}
        </div>

        <AppearsOnChips
          surfaces={['cover', 'infoSheet', 'about', 'backCover', 'checkout']}
          onHighlight={onHighlightSurface}
          activeSurface={activeSurface}
        />

        <div className="space-y-3 pt-1">
          {contacts.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-[#2a3832] rounded-2xl bg-[#151c19]/50">
              <Phone size={28} className="mx-auto text-slate-600 mb-2" />
              <p className="text-xs font-semibold text-slate-300">No public contact numbers added</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Diners won't see a call button on their phone menu.
              </p>
              <button
                type="button"
                onClick={handleAddPhone}
                className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#e8783c]/15 text-[#f49b6b] border border-[#e8783c]/40 text-xs font-bold hover:bg-[#e8783c]/25 transition-all"
              >
                <Plus size={13} />
                <span>Add Primary Phone</span>
              </button>
            </div>
          ) : (
            contacts.map((contact, idx) => (
              <PhoneRow
                key={contact.id || idx}
                contact={contact}
                index={idx}
                total={contacts.length}
                onChange={(updated) => handleUpdatePhone(idx, updated)}
                onDelete={() => handleDeletePhone(idx)}
                onSetPrimary={() => handleSetPrimaryPhone(idx)}
              />
            ))
          )}
        </div>
      </div>

      {/* Social & External Links Section */}
      <div className="bg-[#1d2723]/70 border border-[#2a3832] rounded-2xl p-5 space-y-4 shadow-sm transition-all hover:border-[#2a3832]/90">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
              <Share2 size={16} className="text-[#e8783c]" />
              <span>Social Media & Delivery Portals</span>
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Connect Instagram, website, or delivery partners directly on your mobile menu.
            </p>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowAddLinkDropdown(!showAddLinkDropdown)}
              disabled={links.length >= 8}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1d2723] border border-[#2a3832] hover:border-[#e8783c]/60 text-slate-200 hover:text-white text-xs font-bold transition-all disabled:opacity-50"
            >
              <Plus size={14} className="text-[#e8783c]" />
              <span>Add Link ▾</span>
            </button>

            {showAddLinkDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-[#151c19] border border-[#2a3832] rounded-xl shadow-2xl z-30 py-1.5 overflow-hidden animate-in fade-in zoom-in-95">
                {AVAILABLE_LINK_TYPES.map((lt) => (
                  <button
                    key={lt.type}
                    type="button"
                    onClick={() => handleAddLink(lt.type)}
                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-[#1d2723] transition-colors"
                  >
                    + {lt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <AppearsOnChips
          surfaces={['cover', 'infoSheet', 'about', 'backCover']}
          onHighlight={onHighlightSurface}
          activeSurface={activeSurface}
        />

        <div className="space-y-3 pt-1">
          {links.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-[#2a3832] rounded-2xl bg-[#151c19]/50">
              <Share2 size={28} className="mx-auto text-slate-600 mb-2" />
              <p className="text-xs font-semibold text-slate-300">No social or external links added</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Add an Instagram handle or your website to build social engagement.
              </p>
              <button
                type="button"
                onClick={() => handleAddLink('instagram')}
                className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#e8783c]/15 text-[#f49b6b] border border-[#e8783c]/40 text-xs font-bold hover:bg-[#e8783c]/25 transition-all"
              >
                <Plus size={13} />
                <span>Add Instagram</span>
              </button>
            </div>
          ) : (
            links.map((link, idx) => (
              <LinkCard
                key={idx}
                link={link}
                onChange={(updated) => handleUpdateLink(idx, updated)}
                onDelete={() => handleDeleteLink(idx)}
              />
            ))
          )}
        </div>
      </div>

      {/* Table Reservations Spec */}
      <div className="bg-[#1d2723]/70 border border-[#2a3832] rounded-2xl p-5 space-y-4 shadow-sm transition-all hover:border-[#2a3832]/90">
        <div>
          <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
            <Calendar size={16} className="text-[#e8783c]" />
            <span>Table Reservation Action Button (Optional)</span>
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Provides a prominent booking action on your digital cover (Call, WhatsApp, or booking URL).
          </p>
        </div>

        <AppearsOnChips
          surfaces={['cover', 'infoSheet', 'about']}
          onHighlight={onHighlightSurface}
          activeSurface={activeSurface}
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          {[
            { id: 'none', label: 'Disabled' },
            { id: 'call', label: 'Call to Reserve' },
            { id: 'whatsapp', label: 'WhatsApp Message' },
            { id: 'link', label: 'Custom Booking URL' },
          ].map((mode) => {
            const isSelected = (reservations.mode || 'none') === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() =>
                  onChange({ reservations: { ...reservations, mode: mode.id as any } })
                }
                className={`py-2.5 px-3.5 rounded-xl border text-xs font-bold text-center transition-all ${
                  isSelected
                    ? 'bg-[#e8783c]/20 text-[#f49b6b] border-[#e8783c] ring-1 ring-[#e8783c]/50 shadow-[0_0_12px_rgba(232,120,60,0.2)]'
                    : 'bg-[#151c19] border-[#2a3832] text-slate-300 hover:text-white hover:border-slate-600'
                }`}
              >
                {mode.label}
              </button>
            );
          })}
        </div>

        {reservations.mode === 'link' && (
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">
              External Reservation Booking Page URL
            </label>
            <input
              type="url"
              value={reservations.url || ''}
              onChange={(e) =>
                onChange({ reservations: { ...reservations, url: e.target.value } })
              }
              placeholder="https://eazydiner.com/... or reservation portal link"
              className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl px-4 py-2.5 text-sm font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#e8783c] transition-colors"
            />
          </div>
        )}
      </div>
    </div>
  );
};
