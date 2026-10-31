import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Flame, 
  Sparkles, 
  ChefHat, 
  Info
} from 'lucide-react';
import { parseItemPricing, type FormattedVariant } from '../menu-builder/templates/shared/pricingUtils';
import { SmartImage } from '../menu-renderer/primitives/SmartImage';
import type { RenderMenuItem } from '../menu-renderer/types';

export interface CustomizationResult {
  item: RenderMenuItem;
  variant?: string;
  price: number;
  quantity: number;
  spiceLevel: number;
  instructions: string;
}

export interface DishCustomizationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  dish: RenderMenuItem | null;
  onConfirm: (result: CustomizationResult) => void;
  isPremium?: boolean;
}

const QUICK_INSTRUCTIONS = [
  '🌿 No Onion & Garlic',
  '🫒 Less Oil',
  '🧂 Less Salt',
  '🔥 Extra Crispy',
  '🥣 Extra Gravy',
  '🍽️ Cut into Halves',
];

const SPICE_LEVELS = [
  { level: 0, label: 'Mild', chilies: '0 Chilies', desc: 'Non-spicy, gentle aromatic flavor' },
  { level: 1, label: 'Medium', chilies: '1 Chili 🌶️', desc: 'Pleasant, balanced Indian heat' },
  { level: 2, label: 'Spicy', chilies: '2 Chilies 🌶️🌶️', desc: 'Authentic kick with rich masalas' },
  { level: 3, label: 'Extra Hot', chilies: '3 Chilies 🌶️🌶️🌶️', desc: 'Fiery hot with red chilies & peppercorns' },
];

export const DishCustomizationDrawer: React.FC<DishCustomizationDrawerProps> = ({
  isOpen,
  onClose,
  dish,
  onConfirm,
}) => {
  if (!dish) return null;

  const isVeg = dish.dietType === 'veg' || dish.dietType === 'vegan' || !dish.dietType;
  const isVegan = dish.dietType === 'vegan';

  const pricing = useMemo(() => {
    return parseItemPricing(dish as Parameters<typeof parseItemPricing>[0]);
  }, [dish]);

  // Derive portion options
  const portionOptions: FormattedVariant[] = useMemo(() => {
    if (pricing.hasVariants && pricing.variants.length > 0) {
      return pricing.variants;
    }
    const baseP = pricing.basePrice ?? (typeof dish.price === 'number' ? dish.price : parseFloat(String(dish.price || 0)));
    return [
      {
        name: 'Regular',
        label: 'Regular / Standard Serving',
        price: isNaN(baseP) ? 0 : baseP,
        formattedPrice: isNaN(baseP) ? '₹0' : `₹${baseP.toLocaleString('en-IN')}`,
      },
    ];
  }, [pricing, dish.price]);

  // Initial State
  const [selectedVariant, setSelectedVariant] = useState<FormattedVariant>(portionOptions[0]);
  const [spiceLevel, setSpiceLevel] = useState<number>(0);
  const [instructions, setInstructions] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  // Sync state whenever dish opens
  useEffect(() => {
    if (portionOptions.length > 0) {
      setSelectedVariant(portionOptions[0]);
    }
    const defaultSpice = Math.max(dish.spicyLevel ?? 0, dish.tags?.spice ?? 0);
    setSpiceLevel(Math.min(3, Math.max(0, defaultSpice)));
    setInstructions('');
    setQuantity(1);
  }, [dish, portionOptions]);

  const unitPrice = selectedVariant?.price ?? pricing.basePrice ?? 0;
  const totalPrice = unitPrice * quantity;

  const handleToggleQuickInstruction = (tag: string) => {
    const cleanTag = tag.replace(/^[^\w\s]+\s*/, ''); // strip leading emoji
    setInstructions((prev) => {
      const parts = prev
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
      const exists = parts.some((p) => p.toLowerCase() === cleanTag.toLowerCase());
      if (exists) {
        return parts.filter((p) => p.toLowerCase() !== cleanTag.toLowerCase()).join(', ');
      } else {
        return parts.length > 0 ? `${parts.join(', ')}, ${cleanTag}` : cleanTag;
      }
    });
  };

  const handleConfirm = () => {
    onConfirm({
      item: dish,
      variant: portionOptions.length > 1 ? selectedVariant.name : undefined,
      price: unitPrice,
      quantity,
      spiceLevel,
      instructions: instructions.trim(),
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="dish-customization-portal" style={{ position: 'fixed', inset: 0, zIndex: 120 }}>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Bottom Sheet Drawer */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-[#141b18] text-slate-100 rounded-t-[28px] border-t border-white/15 shadow-2xl flex flex-col max-h-[90vh] max-h-[90dvh] overflow-hidden z-10"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                onClose();
              }
            }}
          >
            {/* Grab / Pull Handle */}
            <div className="pt-3 pb-1 flex justify-center shrink-0 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 rounded-full bg-slate-600/70" />
            </div>

            {/* Scrollable Content Area */}
            <div className="overflow-y-auto px-5 pb-6 space-y-6 flex-1 overscroll-contain">
              {/* Hero Image & Close Button */}
              {dish.imageUrl ? (
                <div className="relative -mx-5 -mt-2 mb-4 overflow-hidden rounded-t-[20px] aspect-[16/9] max-h-56 bg-slate-900">
                  <SmartImage
                    src={dish.imageUrl}
                    alt={dish.name}
                    role="card"
                    focal={dish.focal}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141b18] via-transparent to-black/30 pointer-events-none" />
                  
                  {/* Close button */}
                  <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-colors shadow-md"
                    aria-label="Close dish customization"
                  >
                    <X size={18} />
                  </button>

                  {/* FSSAI Badge floating over hero */}
                  <div className="absolute bottom-3 left-4 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-[4px] bg-[#141b18]/90 backdrop-blur-md border-[1.5px] ${
                        isVeg ? 'border-emerald-500' : 'border-amber-700'
                      }`}
                      title={isVeg ? 'FSSAI Vegetarian' : 'FSSAI Non-Vegetarian'}
                    >
                      {isVeg ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      ) : (
                        <span
                          className="w-2.5 h-2.5 bg-amber-700"
                          style={{ clipPath: 'polygon(50% 10%, 10% 90%, 90% 90%)' }}
                        />
                      )}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white/90 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm">
                      {isVegan ? '100% Vegan' : isVeg ? '100% Pure Veg' : 'Non-Vegetarian'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-[4px] bg-[#1c2420] border-[1.5px] ${
                        isVeg ? 'border-emerald-500' : 'border-amber-700'
                      }`}
                      title={isVeg ? 'FSSAI Vegetarian' : 'FSSAI Non-Vegetarian'}
                    >
                      {isVeg ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      ) : (
                        <span
                          className="w-2.5 h-2.5 bg-amber-700"
                          style={{ clipPath: 'polygon(50% 10%, 10% 90%, 90% 90%)' }}
                        />
                      )}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      {isVegan ? '100% Vegan' : isVeg ? '100% Pure Veg' : 'Non-Vegetarian'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                    aria-label="Close dish customization"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              {/* Title & Badges */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-extrabold tracking-tight text-white leading-snug">
                    {dish.name}
                  </h2>
                  <div className="text-lg font-black text-amber-400 shrink-0 tabular-nums">
                    ₹{unitPrice.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Tags row */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {dish.isBestseller && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                      <Sparkles size={11} /> Bestseller
                    </span>
                  )}
                  {dish.trending && !dish.isBestseller && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 uppercase tracking-wider">
                      <Flame size={11} /> Trending
                    </span>
                  )}
                  {dish.isSpecial && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                      <ChefHat size={11} /> Chef&rsquo;s Special
                    </span>
                  )}
                  {dish.tags?.jain && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Jain Friendly
                    </span>
                  )}
                  {dish.tags?.eggless && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      Eggless
                    </span>
                  )}
                </div>

                {/* Description */}
                {(pricing.cleanDescription || dish.description) && (
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                    {pricing.cleanDescription || dish.description}
                  </p>
                )}
              </div>

              {/* 1. Portion Selection (Half / Full or Regular / Large) */}
              <div className="space-y-2.5 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <span>1. Portion Size</span>
                    <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {portionOptions.length > 1 ? 'Select one' : 'Standard portion'}
                  </span>
                </div>

                <div className="grid gap-2">
                  {portionOptions.map((portion) => {
                    const isSelected = selectedVariant.name === portion.name;
                    return (
                      <button
                        key={portion.name}
                        type="button"
                        onClick={() => setSelectedVariant(portion)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm shadow-amber-500/10'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'border-amber-400 bg-amber-400 text-black'
                                : 'border-slate-500 bg-transparent'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">
                              {portion.label || portion.name}
                            </div>
                            {portion.portion && (
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                {portion.portion}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-sm font-bold text-amber-400 tabular-nums">
                          ₹{portion.price.toLocaleString('en-IN')}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Scoville Spice Meter Selector (0 to 3 Chilies) */}
              <div className="space-y-2.5 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Flame size={14} className="text-rose-400" />
                    <span>2. Scoville Spice Meter</span>
                  </label>
                  <span className="text-[11px] font-semibold text-amber-400">
                    {SPICE_LEVELS[spiceLevel].chilies}
                  </span>
                </div>

                {/* Interactive Segmented Buttons */}
                <div className="grid grid-cols-4 gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
                  {SPICE_LEVELS.map((s) => {
                    const isSelected = spiceLevel === s.level;
                    return (
                      <button
                        key={s.level}
                        type="button"
                        onClick={() => setSpiceLevel(s.level)}
                        className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-center transition-all ${
                          isSelected
                            ? s.level === 0
                              ? 'bg-emerald-600/90 text-white shadow-md'
                              : s.level === 1
                              ? 'bg-amber-600/90 text-white shadow-md'
                              : s.level === 2
                              ? 'bg-orange-600/90 text-white shadow-md'
                              : 'bg-rose-600/90 text-white shadow-md'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span className="text-xs font-bold leading-tight">{s.label}</span>
                        <span className="text-[10px] mt-0.5 opacity-90">
                          {s.level === 0 ? '0 🌶️' : '🌶️'.repeat(s.level)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Subtitle helper */}
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                  <Info size={12} className="text-slate-400 shrink-0" />
                  <span>{SPICE_LEVELS[spiceLevel].desc}</span>
                </div>
              </div>

              {/* 3. Special Cooking Instructions */}
              <div className="space-y-2.5 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    3. Special Cooking Instructions
                  </label>
                  <span className="text-[11px] text-slate-400">Optional</span>
                </div>

                {/* Quick chip pills for rapid single-tap convenience */}
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_INSTRUCTIONS.map((chip) => {
                    const cleanTag = chip.replace(/^[^\w\s]+\s*/, '');
                    const isIncluded = instructions.toLowerCase().includes(cleanTag.toLowerCase());
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleToggleQuickInstruction(chip)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                          isIncluded
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>

                {/* Instruction input */}
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value.slice(0, 140))}
                  placeholder="e.g. Less oil, extra crispy, no garlic, allergic to peanuts..."
                  rows={2}
                  className="w-full bg-black/40 border border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 resize-none outline-none"
                />
                <div className="text-[10px] text-right text-slate-500">
                  {instructions.length}/140 characters
                </div>
              </div>
            </div>

            {/* Sticky Bottom Actions Bar */}
            <div className="p-4 bg-[#101613] border-t border-white/10 shrink-0 flex items-center gap-3">
              {/* Quantity Stepper */}
              <div className="flex items-center bg-white/10 border border-white/15 rounded-xl p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-200 hover:bg-white/15 active:scale-95 transition-all disabled:opacity-30"
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus size={15} />
                </button>
                <span className="w-8 text-center text-sm font-bold text-white tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-200 hover:bg-white/15 active:scale-95 transition-all"
                  aria-label="Increase quantity"
                >
                  <Plus size={15} />
                </button>
              </div>

              {/* Add to Tray Primary CTA */}
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-3 px-4 rounded-xl shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-between text-sm"
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag size={17} />
                  <span>Add to Tray</span>
                </span>
                <span className="text-base font-extrabold tabular-nums">
                  ₹{totalPrice.toLocaleString('en-IN')}
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DishCustomizationDrawer;
