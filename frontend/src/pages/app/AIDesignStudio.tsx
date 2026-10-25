// MENUQR AI-Assisted Design Studio Panel
// Phase 2: Live Gemini Multimodal Design Generation, Reference Image Understanding & Revisions

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Palette, 
  Layout, 
  Check, 
  Sliders,
  UploadCloud,
  X,
  Image as ImageIcon,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import type { 
  DesignSpecification, 
  DesignCompositionStrategy, 
  RestaurantPositioning, 
  RestaurantMood, 
  RestaurantDesignProfile 
} from '../../components/menu-builder/design-engine/types';
import { DeterministicDesignEngine } from '../../components/menu-builder/design-engine/designGenerator';
import { 
  getAiDesignStatus, 
  generateAiMenuDesign, 
  type AiDesignStatus,
  type GenerateAiMenuDesignPayload 
} from './appStore';

interface AIDesignStudioProps {
  businessName: string;
  tagline?: string;
  logoUrl?: string;
  currentSpec: DesignSpecification | null;
  onSpecChange: (spec: DesignSpecification) => void;
  hasPhotography: boolean;
  itemCount: number;
  hasSavedSpec?: boolean;
}

const COMPOSITION_OPTIONS: Array<{
  id: DesignCompositionStrategy;
  title: string;
  desc: string;
  badge: string;
}> = [
  {
    id: 'editorial',
    title: 'Editorial Fine Dining',
    desc: 'Ceremonial crests, luxury serif typography, dot leader lines, and spacious elegance.',
    badge: 'Luxury & Heritage',
  },
  {
    id: 'image-showcase',
    title: 'Modern Image Showcase',
    desc: 'Responsive photo card grid, hero media aspect ratios, and bold badge tags.',
    badge: 'Visual & Contemporary',
  },
  {
    id: 'compact-bistro',
    title: 'Compact Typographic Bistro',
    desc: 'High-density scanability, 2-column desktop split, fast-ordering price pills.',
    badge: 'High Efficiency',
  },
];

const MOOD_OPTIONS: Array<{ id: RestaurantMood; label: string; previewColor: string }> = [
  { id: 'royal-heritage', label: 'Royal Heritage (Wine & Gold)', previewColor: '#D4AF37' },
  { id: 'clean-editorial', label: 'Clean Editorial (Ivory & Emerald)', previewColor: '#163328' },
  { id: 'warm-bistro', label: 'Warm Bistro (Espresso & Terracotta)', previewColor: '#C85A32' },
  { id: 'fresh-cafe', label: 'Fresh Botanical (Mint & Forest)', previewColor: '#4ADE80' },
  { id: 'urban-street', label: 'Urban Street (Charcoal & Amber)', previewColor: '#F59E0B' },
  { id: 'midnight-luxury', label: 'Midnight Lounge (Obsidian & Sky)', previewColor: '#38BDF8' },
];

const POSITIONING_OPTIONS: Array<{ id: RestaurantPositioning; label: string }> = [
  { id: 'fine-dining', label: 'Fine Dining / Banquet' },
  { id: 'contemporary', label: 'Contemporary Fusion' },
  { id: 'casual', label: 'Casual / Cafe' },
  { id: 'rustic', label: 'Rustic Traditional' },
  { id: 'minimalist', label: 'Minimalist Modern' },
];

export const AIDesignStudio: React.FC<AIDesignStudioProps> = ({
  businessName,
  tagline,
  logoUrl,
  currentSpec,
  onSpecChange,
  hasPhotography,
  itemCount,
  hasSavedSpec = false,
}) => {
  const [engine] = useState(() => new DeterministicDesignEngine());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Backend Status
  const [aiStatus, setAiStatus] = useState<AiDesignStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  // Form State
  const [cuisine, setCuisine] = useState('Contemporary Indian & Continental');
  const [positioning, setPositioning] = useState<RestaurantPositioning>('contemporary');
  const [mood, setMood] = useState<RestaurantMood>(
    currentSpec?.colors.bg === '#180912' ? 'royal-heritage' : 'clean-editorial'
  );
  const [customPrimaryColor, setCustomPrimaryColor] = useState(currentSpec?.colors.heading || '');
  const [customAccentColor, setCustomAccentColor] = useState(currentSpec?.colors.accent || '');
  const [customBgColor, setCustomBgColor] = useState(currentSpec?.colors.bg || '');
  const [designBrief, setDesignBrief] = useState('');
  const [revisionPrompt, setRevisionPrompt] = useState('');
  
  // Multimodal Reference Image State
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceFileName, setReferenceFileName] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // Generation / Loading State
  const [generating, setGenerating] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [activeModel, setActiveModel] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'warning' | 'info' } | null>(null);

  const selectedComposition = currentSpec?.composition || 'editorial';

  // Load AI engine status on mount
  useEffect(() => {
    let mounted = true;
    getAiDesignStatus()
      .then((status) => {
        if (mounted) {
          setAiStatus(status);
          setStatusLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setAiStatus({
            available: false,
            provider: 'deterministic-fallback',
            model: null,
            capabilities: {
              multimodalReference: false,
              designGeneration: true,
              revisions: false,
            },
          });
          setStatusLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Handle reference image selection
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setImageError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setImageError('Please select a valid image file (JPEG, PNG, or WEBP).');
      return;
    }

    // Validate size (max 3MB for fast upload & token economy)
    if (file.size > 3 * 1024 * 1024) {
      setImageError('Image must be under 3MB in size.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setReferenceImage(reader.result);
        setReferenceFileName(file.name);
      }
    };
    reader.onerror = () => {
      setImageError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  }

  function handleClearImage() {
    setReferenceImage(null);
    setReferenceFileName(null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // Generate or revise bespoke design
  async function handleGenerate(isRevision = false, overrideComposition?: DesignCompositionStrategy) {
    setGenerating(true);
    setFeedbackMessage(null);

    const briefText = isRevision ? revisionPrompt : designBrief;

    const payload: GenerateAiMenuDesignPayload = {
      profile: {
        businessName,
        cuisine,
        positioning,
        mood,
        hasPhotography,
        menuDensity: itemCount > 50 ? 'compact' : 'balanced',
        logoUrl,
        tagline,
        brandColors: {
          primary: customPrimaryColor.trim() || undefined,
          accent: customAccentColor.trim() || undefined,
          bg: customBgColor.trim() || undefined,
        },
      },
      brief: briefText.trim(),
      referenceImage,
      previousSpec: isRevision ? currentSpec : undefined,
      isRevision,
    };

    try {
      // 1. Attempt server AI endpoint first
      const res = await generateAiMenuDesign(payload);
      if (res && res.spec) {
        let specToApply = res.spec;
        if (overrideComposition) {
          specToApply = { ...specToApply, composition: overrideComposition };
        }
        onSpecChange(specToApply);
        setActiveProvider(res.provider);
        setActiveModel(res.model || null);

        if (res.provider === 'gemini') {
          setFeedbackMessage({
            text: `Bespoke menu design synthesized by Gemini (${res.model || 'Flash'}) based on your brand & references.`,
            type: 'success',
          });
        } else {
          setFeedbackMessage({
            text: res.warning || 'Generated using expert deterministic design engine.',
            type: 'warning',
          });
        }

        if (isRevision) {
          setRevisionPrompt('');
        }
        return;
      }
    } catch (err: any) {
      console.warn('AI endpoint failed or unreachable, using local fallback engine:', err);
    }

    // 2. Client-side deterministic fallback if server fails
    try {
      const fallbackProfile: RestaurantDesignProfile = {
        businessName,
        cuisine,
        positioning,
        mood,
        hasPhotography,
        menuDensity: itemCount > 50 ? 'compact' : 'balanced',
        logoUrl,
        tagline,
        customNotes: briefText,
        brandColors: {
          primary: customPrimaryColor.trim() || undefined,
          accent: customAccentColor.trim() || undefined,
          bg: customBgColor.trim() || undefined,
        },
      };

      const fallbackSpec = await engine.generateDesign(fallbackProfile);
      if (overrideComposition) {
        fallbackSpec.composition = overrideComposition;
      }
      onSpecChange(fallbackSpec);
      setActiveProvider('deterministic-fallback');
      setActiveModel(null);
      setFeedbackMessage({
        text: 'Applied verified design specification via local engine fallback.',
        type: 'info',
      });
    } finally {
      setGenerating(false);
    }
  }

  function handleCompositionSelect(comp: DesignCompositionStrategy) {
    if (hasSavedSpec) {
      if (!currentSpec) return;
      onSpecChange({
        ...currentSpec,
        composition: comp,
      });
      return;
    }
    if (!currentSpec) {
      handleGenerate(false, comp);
      return;
    }
    // Update composition on existing spec
    onSpecChange({
      ...currentSpec,
      composition: comp,
    });
  }

  return (
    <div className="space-y-6">
      {/* ═══════════════════════════════════════════════════════════════════════
          ENGINE STATUS & VERIFICATION BADGE
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-[#151c19] border border-[#2a3832] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#e8783c]/15 text-[#e8783c] border border-[#e8783c]/30 shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Design Engine:
              </span>
              {statusLoading ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300">
                  <RefreshCw size={10} className="animate-spin" /> Checking Engine...
                </span>
              ) : aiStatus?.available ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Gemini Active ({aiStatus.model || 'gemini-3.5-flash-lite'})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Cpu size={11} /> Deterministic Fallback Mode
                </span>
              )}

              {activeProvider && (
                <span className="text-[10px] text-[#849a90] ml-1">
                  (Current design: <strong className="text-white">{activeProvider}{activeModel ? ` · ${activeModel}` : ''}</strong>)
                </span>
              )}
            </div>
            <p className="text-xs text-[#849a90] mt-0.5">
              {hasSavedSpec
                ? 'Your bespoke menu design is active on your live QR code. You can re-generate new looks, switch atmospheres, or refine with AI anytime.'
                : aiStatus?.available 
                ? 'Synthesizes multimodal photo cues, restaurant atmosphere, and typography into a production web menu.'
                : 'Generates tailored typography, balanced color harmonies, and responsive layouts via verified fallback rules.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {hasSavedSpec && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              <span>Active on QR</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => handleGenerate(false)}
            disabled={generating}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#e8783c] to-amber-500 hover:from-[#f08b55] hover:to-amber-400 text-white text-xs font-bold transition-all shadow-md shadow-[#e8783c]/20 shrink-0 cursor-pointer disabled:opacity-50 active:scale-95"
          >
            {generating ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {generating ? 'Composing...' : (currentSpec || hasSavedSpec ? 'Re-generate Design' : 'Generate Menu Design')}
          </button>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedbackMessage && (
        <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs transition-all ${
          feedbackMessage.type === 'success' 
            ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200' 
            : feedbackMessage.type === 'warning'
            ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
            : 'bg-zinc-900 border-zinc-700 text-zinc-300'
        }`}>
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
          )}
          <span className="leading-relaxed">{feedbackMessage.text}</span>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 1: COMPOSITION STRATEGY SELECTOR
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Layout size={15} className="text-[#e8783c]" /> 1. Select Composition Strategy
          </label>
          <span className="text-[11px] text-[#849a90]">3 distinct layout architectures</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {COMPOSITION_OPTIONS.map((opt) => {
            const isSelected = selectedComposition === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleCompositionSelect(opt.id)}
                className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-[#e8783c] bg-[#e8783c]/10 ring-2 ring-[#e8783c]/40'
                    : 'border-[#2a3832] bg-[#1d2723] hover:border-[#384a42]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#e8783c]">
                      {opt.badge}
                    </span>
                    {isSelected && <Check size={16} className="text-[#e8783c]" />}
                  </div>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    {opt.title}
                  </h3>
                  <p className="text-xs text-[#849a90] mt-1.5 leading-relaxed">
                    {opt.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 2: RESTAURANT PROFILE & DESIGN BRIEF
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#1d2723] border border-[#2a3832] rounded-xl p-4">
        <div>
          <label className="block text-xs font-semibold text-[#849a90] uppercase tracking-wider mb-1.5">
            Cuisine & Culinary Style
          </label>
          <input
            type="text"
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            placeholder="e.g. Artisanal Italian, Awadhi Royal, Specialty Coffee"
            className="w-full bg-[#151c19] border border-[#2a3832] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#e8783c]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#849a90] uppercase tracking-wider mb-1.5">
            Brand Positioning
          </label>
          <select
            value={positioning}
            onChange={(e) => setPositioning(e.target.value as RestaurantPositioning)}
            className="w-full bg-[#151c19] border border-[#2a3832] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#e8783c]"
          >
            {POSITIONING_OPTIONS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2 pt-1 border-t border-[#2a3832]/60">
          <label className="block text-xs font-semibold text-[#849a90] uppercase tracking-wider mb-1.5">
            Owner Design Brief & Creative Direction (Optional)
          </label>
          <textarea
            value={designBrief}
            onChange={(e) => setDesignBrief(e.target.value)}
            placeholder="e.g. Warm amber candlelit ambiance, minimalist Kyoto tea garden aesthetic with rich forest greens and brass accents, high legibility for evening diners."
            rows={2}
            className="w-full bg-[#151c19] border border-[#2a3832] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#e8783c] resize-none"
          />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 3: MULTIMODAL REFERENCE IMAGE ANALYSIS
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-[#1d2723] border border-[#2a3832] rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <ImageIcon size={15} className="text-[#e8783c]" /> 2. Reference Photo & Interior Guidance (Optional)
          </label>
          <span className="text-[10px] text-[#849a90]">Gemini extracts palette & mood</span>
        </div>

        {referenceImage ? (
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#151c19] border border-[#2a3832]">
            <div className="flex items-center gap-3">
              <img 
                src={referenceImage} 
                alt="Reference" 
                className="w-14 h-14 object-cover rounded-md border border-[#2a3832]"
              />
              <div>
                <p className="text-xs font-semibold text-white truncate max-w-[200px] sm:max-w-xs">
                  {referenceFileName || 'Uploaded Photo'}
                </p>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 size={12} /> Ready for Gemini palette & mood extraction
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClearImage}
              className="p-1.5 text-[#849a90] hover:text-red-400 hover:bg-red-950/30 rounded-md transition-colors cursor-pointer"
              title="Remove reference photo"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div>
            <input 
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              id="reference-image-input"
            />
            <label
              htmlFor="reference-image-input"
              className="border-2 border-dashed border-[#2a3832] hover:border-[#e8783c]/50 bg-[#151c19]/50 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-all hover:bg-[#151c19]"
            >
              <div className="p-2 rounded-full bg-[#e8783c]/10 text-[#e8783c]">
                <UploadCloud size={20} />
              </div>
              <div>
                <p className="text-xs font-medium text-white">
                  Click to upload menu reference or restaurant interior photo
                </p>
                <p className="text-[11px] text-[#849a90] mt-0.5">
                  Supports JPEG, PNG, WEBP (up to 3MB)
                </p>
              </div>
            </label>
          </div>
        )}

        {imageError && (
          <p className="text-xs text-red-400 flex items-center gap-1.5">
            <AlertCircle size={13} /> {imageError}
          </p>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 4: REVISION FLOW (Always available for iterative refinement)
          ═══════════════════════════════════════════════════════════════════════ */}
      {currentSpec && (
        <div className="bg-[#19221e] border border-[#e8783c]/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-[#e8783c] flex items-center gap-2">
              <Sparkles size={15} /> Request Gemini Revision
            </label>
            <span className="text-[10px] text-[#849a90]">Iterative refinement</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={revisionPrompt}
              onChange={(e) => setRevisionPrompt(e.target.value)}
              placeholder="e.g. Make headers more prominent, shift accent from gold to rose-copper, increase photo card spacing"
              className="flex-1 bg-[#151c19] border border-[#2a3832] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#e8783c]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && revisionPrompt.trim() && !generating) {
                  e.preventDefault();
                  handleGenerate(true);
                }
              }}
            />
            <button
              type="button"
              onClick={() => handleGenerate(true)}
              disabled={generating || !revisionPrompt.trim()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#e8783c] hover:bg-[#f08b55] text-white text-xs font-bold transition-all shadow-md shadow-[#e8783c]/20 shrink-0 cursor-pointer disabled:opacity-50"
            >
              {generating ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
              Revise Design
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 5: ATMOSPHERE PRESETS
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
          <Palette size={15} className="text-[#e8783c]" /> 3. Atmosphere Preset Harmonies
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {MOOD_OPTIONS.map((m) => {
            const isSelected = mood === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setMood(m.id);
                  if (!currentSpec) return;
                  const profile: RestaurantDesignProfile = {
                    businessName,
                    cuisine,
                    positioning,
                    mood: m.id,
                    hasPhotography,
                    menuDensity: itemCount > 50 ? 'compact' : 'balanced',
                    logoUrl,
                    tagline,
                    customNotes: designBrief,
                  };
                  engine.generateDesign(profile).then((s) => {
                    s.composition = selectedComposition;
                    onSpecChange(s);
                  });
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#e8783c] bg-[#e8783c]/10'
                    : 'border-[#2a3832] bg-[#1d2723] hover:border-[#384a42]'
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full shrink-0 border border-white/20 shadow-sm"
                  style={{ backgroundColor: m.previewColor }}
                />
                <span className="text-xs font-semibold text-white truncate">
                  {m.label.split(' (')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SECTION 6: FINE-TUNE BRAND COLORS
          ═══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-[#1d2723] border border-[#2a3832] rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <Sliders size={14} className="text-[#e8783c]" /> Direct Palette Overrides (Optional)
          </span>
          <span className="text-[10px] text-[#849a90]">Interactive fine-tuning</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] text-[#849a90] mb-1">Heading / Titles</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customPrimaryColor || currentSpec?.colors.heading || '#E5C058'}
                onChange={(e) => {
                  setCustomPrimaryColor(e.target.value);
                  if (currentSpec) {
                    onSpecChange({
                      ...currentSpec,
                      colors: {
                        ...currentSpec.colors,
                        heading: e.target.value,
                      },
                    });
                  }
                }}
                className="w-8 h-8 rounded border border-[#2a3832] bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={customPrimaryColor || currentSpec?.colors.heading || ''}
                onChange={(e) => setCustomPrimaryColor(e.target.value)}
                placeholder="#E5C058"
                className="flex-1 bg-[#151c19] border border-[#2a3832] rounded-lg px-2.5 py-1.5 text-xs text-white uppercase font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-[#849a90] mb-1">Accent / Badges</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customAccentColor || currentSpec?.colors.accent || '#D4AF37'}
                onChange={(e) => {
                  setCustomAccentColor(e.target.value);
                  if (currentSpec) {
                    onSpecChange({
                      ...currentSpec,
                      colors: {
                        ...currentSpec.colors,
                        accent: e.target.value,
                        badgeBg: e.target.value,
                      },
                    });
                  }
                }}
                className="w-8 h-8 rounded border border-[#2a3832] bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={customAccentColor || currentSpec?.colors.accent || ''}
                onChange={(e) => setCustomAccentColor(e.target.value)}
                placeholder="#D4AF37"
                className="flex-1 bg-[#151c19] border border-[#2a3832] rounded-lg px-2.5 py-1.5 text-xs text-white uppercase font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-[#849a90] mb-1">Canvas Background</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customBgColor || currentSpec?.colors.bg || '#180912'}
                onChange={(e) => {
                  setCustomBgColor(e.target.value);
                  if (currentSpec) {
                    onSpecChange({
                      ...currentSpec,
                      colors: {
                        ...currentSpec.colors,
                        bg: e.target.value,
                      },
                    });
                  }
                }}
                className="w-8 h-8 rounded border border-[#2a3832] bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={customBgColor || currentSpec?.colors.bg || ''}
                onChange={(e) => setCustomBgColor(e.target.value)}
                placeholder="#180912"
                className="flex-1 bg-[#151c19] border border-[#2a3832] rounded-lg px-2.5 py-1.5 text-xs text-white uppercase font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
