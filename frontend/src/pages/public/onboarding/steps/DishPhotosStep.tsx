import { useMemo, useRef, useState } from 'react';
import { Camera, Check, ImageIcon, Link, RefreshCw, Sparkles, Star, Trash2, Upload, X } from 'lucide-react';
import type { ParsedCategory, ParsedMenuItem } from '../../../../utils/excelMenuParser';
import LottieMoment from '../../../../components/common/LottieMoment';
import { OB } from '../chrome';

/**
 * Curated culinary stock photography, used only when the owner explicitly asks for it.
 *
 * These files used to be substituted silently into the wizard's *preview* for any dish without a
 * photo, which made Step 4 and Step 5 look finished while the published menu came out bare. Now
 * they are an opt-in bulk action that actually writes to the dish.
 */
const STOCK_PHOTOS = [
  '/img/photos/photo-1567184109191-37a69f369f24-w500.webp',
  '/img/photos/photo-1599488615731-7e5c2823ff28-w500.webp',
  '/img/photos/photo-1546833999-b9f581a1996d-w500.webp',
  '/img/photos/photo-1563379091339-03b21ab4a4f8-w500.webp',
  '/img/photos/photo-1626074353765-517a681e40be-w500.webp',
  '/img/photos/photo-1601050690597-df0568f70950-w500.webp',
  '/img/photos/photo-1576092768241-dec231879fc3-w500.webp',
];

/**
 * Step 3 — "Dish Photos & Highlights".
 *
 * Mirrors the Design Studio's Photos tab (`pages/app/MenuDesignStudio.tsx`) — same two-section
 * "needs a photo / has a photo" shape and the same optimize-and-store upload — but writes into the
 * wizard's local `items` because nothing has been saved yet. Starring a dish is what the Signature
 * Editions read when they choose a hero dish for the cover, so it belongs next to the photos.
 */
export default function DishPhotosStep({
  items,
  categories,
  onItemsChange,
  uploadFile,
  onResolveRemaining,
  isResolving,
}: {
  items: ParsedMenuItem[];
  categories: ParsedCategory[];
  onItemsChange: (items: ParsedMenuItem[]) => void;
  uploadFile: (file: File) => Promise<string>;
  onResolveRemaining: () => void;
  isResolving: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pendingIndexRef = useRef<number | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [justUploadedIndex, setJustUploadedIndex] = useState<number | null>(null);
  const [justStarredIndex, setJustStarredIndex] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [editingUrlIndex, setEditingUrlIndex] = useState<number | null>(null);
  const [urlDraft, setUrlDraft] = useState<string>('');

  const categoryName = (id: string) => categories.find((category) => category.id === id)?.name || 'General';

  const indexed = useMemo(() => items.map((item, index) => ({ item, index })), [items]);
  const missing = indexed.filter(({ item }) => !item.imageUrl);
  const present = indexed.filter(({ item }) => item.imageUrl);
  const starred = items.filter((item) => item.isBestseller).length;

  const patch = (index: number, change: Partial<ParsedMenuItem>) => {
    onItemsChange(items.map((item, idx) => (idx === index ? { ...item, ...change } : item)));
  };

  const pickFileFor = (index: number) => {
    pendingIndexRef.current = index;
    fileInputRef.current?.click();
  };

  const handleFile = async (file: File) => {
    const index = pendingIndexRef.current;
    if (index === null) return;
    setUploadError(null);
    setUploadingIndex(index);
    try {
      const url = await uploadFile(file);
      patch(index, { imageUrl: url, focalX: 0.5, focalY: 0.5 });
      setJustUploadedIndex(index);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Could not upload that photo. Please try again.');
    } finally {
      setUploadingIndex(null);
      pendingIndexRef.current = null;
    }
  };

  const startUrlEdit = (index: number) => {
    setEditingUrlIndex(index);
    setUrlDraft(items[index]?.imageUrl || '');
  };

  const saveUrlDraft = (index: number) => {
    const trimmed = urlDraft.trim();
    patch(index, { imageUrl: trimmed, focalX: 0.5, focalY: 0.5 });
    setEditingUrlIndex(null);
    setUrlDraft('');
    if (trimmed) setJustUploadedIndex(index);
  };

  const toggleStar = (index: number) => {
    const next = !items[index].isBestseller;
    patch(index, { isBestseller: next });
    if (next) setJustStarredIndex(index);
  };

  /** Click position on the thumbnail becomes the crop centre the renderer uses. */
  const setFocalFromClick = (index: number, event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    patch(index, {
      focalX: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      focalY: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
    });
  };

  const fillMissingWithStock = () => {
    let stockIndex = 0;
    onItemsChange(
      items.map((item) => {
        if (item.imageUrl) return item;
        const url = STOCK_PHOTOS[stockIndex % STOCK_PHOTOS.length];
        stockIndex += 1;
        return { ...item, imageUrl: url, focalX: 0.5, focalY: 0.5 };
      })
    );
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <LottieMoment moment="empty-state" loop className="h-28 w-28" />
        <p className="text-sm font-bold" style={{ color: OB.ink }}>
          No dishes yet
        </p>
        <p className="max-w-sm text-xs" style={{ color: OB.inkMuted }}>
          Go back one step and upload your menu spreadsheet (or load the demo menu). Photos are
          attached per dish, so the dishes have to exist first.
        </p>
      </div>
    );
  }

  const row = ({ item, index }: { item: ParsedMenuItem; index: number }) => {
    const isVeg = item.dietType === 'veg' || item.dietType === 'vegan';
    const isEditingUrl = editingUrlIndex === index;

    return (
      <div
        key={item.id || index}
        className="flex flex-col gap-2 rounded-2xl border p-3 transition-colors"
        style={{ background: OB.panelRaised, borderColor: OB.goldLineSoft }}
      >
        <div className="flex items-center gap-3">
          {/* 1. CHOT ME LEFT ME PHOTO THUMBNAIL */}
          {uploadingIndex === index ? (
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-dashed"
              style={{ borderColor: OB.goldLine, background: OB.canvasDeep }}
            >
              <LottieMoment moment="photo-matching" loop className="h-full w-full" />
            </div>
          ) : item.imageUrl ? (
            <div
              role="presentation"
              onClick={(event) => setFocalFromClick(index, event)}
              className="group relative h-14 w-14 shrink-0 cursor-crosshair overflow-hidden rounded-xl border border-[#D4AF37]/50 bg-black/60 shadow-md"
              title="Tap/click photo to set the crop centre"
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                style={{ objectPosition: `${(item.focalX ?? 0.5) * 100}% ${(item.focalY ?? 0.5) * 100}%` }}
                loading="lazy"
                decoding="async"
              />
              <span
                className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/90 shadow-sm"
                style={{
                  left: `${(item.focalX ?? 0.5) * 100}%`,
                  top: `${(item.focalY ?? 0.5) * 100}%`,
                  background: OB.gold,
                }}
              />
              {justUploadedIndex === index && (
                <LottieMoment
                  moment="photo-attached"
                  loop={false}
                  onComplete={() => setJustUploadedIndex(null)}
                  className="pointer-events-none absolute -right-2 -top-2 h-7 w-7"
                />
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => pickFileFor(index)}
              className="flex h-14 w-14 shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl border border-dashed transition-colors hover:border-[#D4AF37]"
              style={{ borderColor: OB.goldLineSoft, background: OB.canvasDeep, color: OB.inkFaint }}
              title="Add a photo file for this dish"
            >
              <ImageIcon size={18} style={{ color: OB.gold }} />
              <span className="text-[9px] font-bold">Add</span>
            </button>
          )}

          {/* 2. THEN NAAM & DETAILS (Beside the photo) */}
          <div className="min-w-0 flex-1 pr-2">
            <div className="flex items-center gap-1.5">
              <span
                className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-xs border ${
                  isVeg ? 'border-emerald-500 bg-emerald-950/40' : 'border-rose-500 bg-rose-950/40'
                }`}
                title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${isVeg ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              </span>
              <p className="truncate text-sm font-bold text-[#F6F0E4]" title={item.name}>
                {item.name || 'Untitled dish'}
              </p>
            </div>

            <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px]" style={{ color: OB.inkFaint }}>
              <span className="font-medium text-[#A3957E]">{categoryName(item.category)}</span>
              {item.imageUrl ? (
                <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-950/50 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400 border border-emerald-500/30">
                  ✓ Photo Ready
                </span>
              ) : (
                <span className="text-[10px] text-[#766A58] italic">No photo attached</span>
              )}
            </div>

            {item.description && (
              <p className="mt-0.5 line-clamp-1 text-[10px] text-[#8C8070] italic">
                {item.description}
              </p>
            )}
          </div>

          {/* 3. PURA RIGHT ME PRICE ACCHASE + QUICK ACTIONS */}
          <div className="flex shrink-0 flex-col items-end gap-1.5 pl-2">
            {/* Price display: High contrast, elegant typography */}
            <div className="text-right">
              {item.halfPrice !== undefined || item.fullPrice !== undefined ? (
                <div className="flex flex-col items-end leading-tight">
                  {item.halfPrice !== undefined && (
                    <span className="font-mono text-xs font-bold text-[#D4AF37]/90">
                      <span className="mr-1 font-sans text-[9px] uppercase tracking-wider text-[#A3957E]">Half</span>
                      ₹{item.halfPrice}
                    </span>
                  )}
                  {item.fullPrice !== undefined && (
                    <span className="font-mono text-sm sm:text-base font-black text-[#F6F0E4]">
                      <span className="mr-1 font-sans text-[9px] uppercase tracking-wider text-[#A3957E]">Full</span>
                      ₹{item.fullPrice}
                    </span>
                  )}
                </div>
              ) : (
                <div className="font-mono text-base sm:text-lg font-black tracking-tight" style={{ color: OB.gold }}>
                  ₹{item.price}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1">
              {/* Highlight / Bestseller Star */}
              <button
                type="button"
                onClick={() => toggleStar(index)}
                className="relative flex cursor-pointer items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-bold transition-colors"
                style={{
                  borderColor: item.isBestseller ? OB.gold : OB.goldLineSoft,
                  background: item.isBestseller ? OB.goldWash : 'transparent',
                  color: item.isBestseller ? OB.gold : OB.inkMuted,
                }}
                title="Bestsellers get a badge and Editions use them on the cover"
              >
                <Star size={11} fill={item.isBestseller ? OB.gold : 'none'} />
                <span className="hidden sm:inline">{item.isBestseller ? 'Star' : 'Star'}</span>
                {justStarredIndex === index && (
                  <LottieMoment
                    moment="bestseller-mark"
                    loop={false}
                    onComplete={() => setJustStarredIndex(null)}
                    className="pointer-events-none absolute -inset-1"
                  />
                )}
              </button>

              {/* Upload photo button */}
              <button
                type="button"
                onClick={() => pickFileFor(index)}
                disabled={uploadingIndex !== null}
                className="flex cursor-pointer items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-bold transition-colors disabled:opacity-50"
                style={{ borderColor: OB.goldLineSoft, color: OB.ink }}
                title="Upload image from computer"
              >
                <Upload size={11} style={{ color: OB.gold }} />
                <span className="hidden md:inline">{item.imageUrl ? 'Replace' : 'Upload'}</span>
              </button>

              {/* URL paste toggle */}
              <button
                type="button"
                onClick={() => (isEditingUrl ? setEditingUrlIndex(null) : startUrlEdit(index))}
                className="flex cursor-pointer items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-bold transition-colors"
                style={{
                  borderColor: isEditingUrl ? OB.gold : OB.goldLineSoft,
                  color: isEditingUrl ? OB.gold : OB.inkMuted,
                }}
                title="Paste web URL for dish image"
              >
                <Link size={11} />
                <span className="hidden md:inline">URL</span>
              </button>

              {/* Delete photo button */}
              {item.imageUrl && (
                <button
                  type="button"
                  onClick={() => patch(index, { imageUrl: '', focalX: undefined, focalY: undefined })}
                  className="cursor-pointer p-1 hover:opacity-80"
                  style={{ color: OB.danger }}
                  aria-label={`Remove photo from ${item.name}`}
                  title="Remove photo"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Inline URL paste bar if toggled */}
        {isEditingUrl && (
          <div
            className="flex items-center gap-2 rounded-xl border p-2 animate-fadeIn"
            style={{ background: OB.canvasDeep, borderColor: OB.goldLineSoft }}
          >
            <input
              type="url"
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              placeholder="Paste image web link (e.g. https://... or Google Drive direct link)"
              className="flex-1 rounded-lg border px-2.5 py-1 text-xs text-[#F6F0E4] placeholder:text-[#534738] focus:outline-none"
              style={{ background: OB.panelRaised, borderColor: OB.goldLine }}
              autoFocus
            />
            <button
              type="button"
              onClick={() => saveUrlDraft(index)}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold text-white cursor-pointer"
              style={{ background: OB.cta }}
            >
              <Check size={12} /> Save
            </button>
            <button
              type="button"
              onClick={() => setEditingUrlIndex(null)}
              className="p-1 text-[#A3957E] hover:text-white cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
          event.target.value = '';
        }}
      />

      {/* ── Counters + bulk actions ── */}
      <div
        className="flex flex-col gap-3 rounded-2xl border p-3.5 sm:flex-row sm:items-center sm:justify-between"
        style={{ background: OB.canvasDeep, borderColor: OB.goldLineSoft }}
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]" style={{ color: OB.inkMuted }}>
          <span>
            <span className="font-mono text-base font-black" style={{ color: OB.ink }}>
              {items.length}
            </span>{' '}
            dishes
          </span>
          <span>
            <span className="font-mono text-base font-black" style={{ color: OB.ok }}>
              {present.length}
            </span>{' '}
            with a photo
          </span>
          <span>
            <span className="font-mono text-base font-black" style={{ color: missing.length ? OB.cta : OB.inkFaint }}>
              {missing.length}
            </span>{' '}
            still missing
          </span>
          <span>
            <span className="font-mono text-base font-black" style={{ color: OB.gold }}>
              {starred}
            </span>{' '}
            bestsellers
          </span>
        </div>

        {missing.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onResolveRemaining}
              disabled={isResolving}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-bold transition-colors disabled:opacity-60"
              style={{ borderColor: OB.goldLine, color: OB.gold }}
            >
              <RefreshCw size={12} className={isResolving ? 'animate-spin' : ''} />
              {isResolving ? 'Matching…' : 'Auto-match the rest'}
            </button>
            <button
              type="button"
              onClick={fillMissingWithStock}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold text-white transition-colors"
              style={{ background: OB.cta }}
            >
              <Sparkles size={12} /> Use studio stock photos
            </button>
          </div>
        )}
      </div>

      {uploadError && (
        <div className="flex items-center gap-2 text-[11px]" style={{ color: OB.danger }}>
          <LottieMoment moment="error" loop={false} className="h-6 w-6" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* ── Needs a photo ── */}
      {missing.length > 0 && (
        <section className="space-y-2">
          <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: OB.cta }}>
            <Camera size={13} /> Needs a photo ({missing.length})
          </h3>
          <div className="space-y-2">{missing.map(row)}</div>
        </section>
      )}

      {/* ── Has a photo ── */}
      {present.length > 0 && (
        <section className="space-y-2">
          <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: OB.inkMuted }}>
            <ImageIcon size={13} /> Photographed ({present.length})
          </h3>
          <div className="space-y-2">{present.map(row)}</div>
        </section>
      )}

      <p className="text-[11px]" style={{ color: OB.inkFaint }}>
        Photos upload straight to your menu's image store, resized and converted for fast mobile
        loading. You can continue without every photo — anything still missing simply renders as a
        text-only dish, and you can add it later from the dashboard.
      </p>
    </div>
  );
}
