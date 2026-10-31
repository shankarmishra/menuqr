import React, { useState } from 'react';
import { Upload, Trash2, Image, ShieldCheck } from 'lucide-react';
import { AppearsOnChips, type SurfaceTarget } from './AppearsOnChips';
import { uploadImage } from '../appStore';
import type { CanonicalProfileData } from '../appStore';

interface PhotosTabProps {
  profile: CanonicalProfileData;
  onChange: (updated: Partial<CanonicalProfileData>) => void;
  onHighlightSurface?: (surface: SurfaceTarget) => void;
  activeSurface?: string | null;
  planId?: string;
}

interface GalleryPhoto {
  id: string;
  url: string;
  caption?: string;
  tag?: 'interior' | 'exterior' | 'food' | 'team' | 'event';
}

export const PhotosTab: React.FC<PhotosTabProps> = ({
  profile,
  onChange,
  onHighlightSurface,
  activeSurface,
  planId = 'BASIC',
}) => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(profile?.photos || []);
  const [uploading, setUploading] = useState(false);
  const [rightsConfirmed, setRightsConfirmed] = useState(false);

  const maxPhotos = planId === 'PREMIUM' ? 30 : planId === 'INTERMEDIATE' ? 15 : 6;
  const maxMb = planId === 'PREMIUM' ? 300 : planId === 'INTERMEDIATE' ? 150 : 50;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!rightsConfirmed && photos.length === 0) {
      alert('Please confirm the photo usage rights confirmation checkbox before uploading.');
      return;
    }

    try {
      setUploading(true);
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const res = await uploadImage(base64, 'covers');
        const newPhoto: GalleryPhoto = {
          id: `gp_${Date.now()}`,
          url: res.url,
          caption: '',
          tag: 'interior',
        };
        const updated = [...photos, newPhoto];
        setPhotos(updated);
        onChange({ photos: updated });
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert('Upload failed: ' + (err.message || 'Unknown error'));
      setUploading(false);
    }
  };

  const handleDeletePhoto = (id: string) => {
    const updated = photos.filter((p) => p.id !== id);
    setPhotos(updated);
    onChange({ photos: updated });
  };

  const handleUpdateCaption = (id: string, caption: string) => {
    const updated = photos.map((p) => (p.id === id ? { ...p, caption } : p));
    setPhotos(updated);
    onChange({ photos: updated });
  };

  const handleUpdateTag = (
    id: string,
    tag: 'interior' | 'exterior' | 'food' | 'team' | 'event'
  ) => {
    const updated = photos.map((p) => (p.id === id ? { ...p, tag } : p));
    setPhotos(updated);
    onChange({ photos: updated });
  };

  return (
    <div className="space-y-6">
      {/* Usage Meter Card */}
      <div className="bg-[#1d2723]/70 border border-[#2a3832] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
            <Image size={16} className="text-[#e8783c]" />
            <span>Photo Library & Gallery</span>
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Interior, ambience, dishes, and team photography for your Story and About sections.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-[#151c19] px-4 py-2 rounded-xl border border-[#2a3832] text-xs font-mono">
          <span className="text-[#f49b6b] font-bold">
            {photos.length} / {maxPhotos} photos
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Plan Quota: {maxMb} MB</span>
        </div>
      </div>

      <AppearsOnChips
        surfaces={['cover', 'inner', 'about', 'backCover']}
        onHighlight={onHighlightSurface}
        activeSurface={activeSurface}
      />

      {/* Rights Confirmation Checkbox */}
      <div className="bg-[#1d2723]/70 border border-[#2a3832] rounded-xl p-4 flex items-start gap-3 shadow-sm">
        <input
          type="checkbox"
          id="rightsCheck"
          checked={rightsConfirmed}
          onChange={(e) => setRightsConfirmed(e.target.checked)}
          className="mt-0.5 rounded bg-[#151c19] border-[#2a3832] text-[#e8783c] focus:ring-0"
        />
        <label htmlFor="rightsCheck" className="text-xs text-slate-300 cursor-pointer select-none">
          <span className="font-bold text-slate-200 flex items-center gap-1.5 mb-0.5">
            <ShieldCheck size={14} className="text-[#e8783c]" />
            <span>Usage Rights & Content Confirmation</span>
          </span>
          I confirm that I own or have legal authorization from the copyright holder to publish these photographs on the digital QR menu.
        </label>
      </div>

      {/* Upload Zone */}
      <div className="border-2 border-dashed border-[#2a3832] hover:border-[#e8783c]/60 bg-[#151c19]/60 rounded-2xl p-7 text-center transition-all shadow-inner">
        <Image size={34} className="mx-auto text-slate-600 mb-2.5" />
        <p className="text-sm font-bold text-slate-200">Upload ambience or dish photos</p>
        <p className="text-xs text-slate-400 mt-1">
          PNG, JPG, WebP up to 8MB. Images are automatically optimized and served via CDN.
        </p>
        <label className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 rounded-xl bg-[#e8783c] hover:bg-[#d66c32] text-white text-xs font-bold cursor-pointer transition-all shadow-md shadow-[#e8783c]/20 hover:scale-[1.02] active:scale-95">
          <Upload size={14} />
          <span>{uploading ? 'Processing & optimizing…' : 'Choose Photo to Upload'}</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading || photos.length >= maxPhotos}
            className="hidden"
          />
        </label>
      </div>

      {/* Photos Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="bg-[#151c19] border border-[#2a3832] rounded-xl overflow-hidden group shadow-sm hover:border-[#2a3832]/90 transition-all"
            >
              <div className="h-36 bg-[#0e1311] relative overflow-hidden">
                <img src={photo.url} alt="Gallery item" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/80 text-rose-400 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow"
                  title="Remove photo"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="p-3 space-y-2">
                <input
                  type="text"
                  placeholder="Caption (e.g. Main dining hall)"
                  value={photo.caption || ''}
                  onChange={(e) => handleUpdateCaption(photo.id, e.target.value)}
                  maxLength={80}
                  className="w-full bg-[#0e1311] border border-[#2a3832] rounded-lg px-2.5 py-1 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-[#e8783c]"
                />
                <select
                  value={photo.tag || 'interior'}
                  onChange={(e) => handleUpdateTag(photo.id, e.target.value as any)}
                  className="w-full bg-[#0e1311] border border-[#2a3832] rounded-lg px-2.5 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-[#e8783c]"
                >
                  <option value="interior">Interior / Seating</option>
                  <option value="exterior">Storefront / Exterior</option>
                  <option value="food">Signature Dish</option>
                  <option value="team">Chef & Team</option>
                  <option value="event">Celebration / Event</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
