// MENUQR PDF-to-Digital-Menu Reconstruction Engine
// Full High-Fidelity PDF Import, Document Understanding, Side-by-Side Review & Responsive Adaptation

import { useState, useRef, useEffect } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  RefreshCw,
  Eye,
  Plus,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Check,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import {
  extractPdfMenu,
  refinePdfDesign,
  savePdfDraft,
  approveAndPublishPdfMenu,
  type ExtractedPdfCategory,
  type ExtractedPdfItem,
  type ExtractedPdfRestaurantInfo,
  type PdfExtractionResponse
} from '../../pages/app/appStore';
import { DynamicDesignEngine } from './design-engine/DynamicDesignEngine';
import { validateDesignSpecification, type DesignSpecification, type DesignCompositionStrategy } from './design-engine/types';
import PremiumIPhoneMockup from '../marketing/PremiumIPhoneMockup';
import { menuTemplates } from '../../data/menuTemplates';
import type { CategoryGroup } from './templates/types';
import { useToast } from '../feedback/ToastProvider';

interface PdfMenuImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSwitchToExcel?: () => void;
  initialDraftId?: string | null;
}

type WizardStage = 'upload' | 'extracting' | 'review' | 'publishing' | 'complete';
type ReviewTab = 'content' | 'design' | 'profile';

export function PdfMenuImportWizard({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToExcel,
  initialDraftId,
}: PdfMenuImportWizardProps) {
  const showToast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Wizard state
  const [stage, setStage] = useState<WizardStage>('upload');
  const [previewCategory, setPreviewCategory] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ReviewTab>('content');
  const [fileName, setFileName] = useState('');
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [importId, setImportId] = useState<string>('');

  // Extraction results
  const [extractionData, setExtractionData] = useState<PdfExtractionResponse | null>(null);
  const [categories, setCategories] = useState<ExtractedPdfCategory[]>([]);
  const [restaurantInfo, setRestaurantInfo] = useState<ExtractedPdfRestaurantInfo>({
    name: '',
    cuisine: '',
    tagline: '',
    description: '',
    address: '',
    phone: '',
    openingHours: '',
  });
  const [designSpec, setDesignSpec] = useState<DesignSpecification | null>(null);

  // Progress animation state
  const [processingStep, setProcessingStep] = useState(1);
  const [processingError, setProcessingError] = useState<string | null>(null);

  // Refinement prompt state
  const [refinePrompt, setRefinePrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  // UI state for accordion
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Published result
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);

  useEffect(() => {
    if (initialDraftId) {
      import('../../pages/app/appStore').then(({ getPdfDraft }) => {
        getPdfDraft(initialDraftId).then((draft) => {
          if (draft) {
            if (draft.id) setImportId(draft.id);
            if (draft.categories) setCategories(draft.categories);
            if (draft.restaurantInfo) setRestaurantInfo(draft.restaurantInfo);
            if (draft.designSpecification) setDesignSpec(draft.designSpecification);
            setStage('review');
          }
        }).catch(console.error);
      });
    }
  }, [initialDraftId]);

  if (!isOpen) return null;

  // Handle PDF file selection
  const handleFileSelect = (file: File) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      showToast('error', 'Please upload a valid PDF document (.pdf).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showToast('error', 'PDF file size exceeds 15MB limit. Please upload a smaller menu.');
      return;
    }

    setFileName(file.name);
    setProcessingError(null);
    setStage('extracting');
    setProcessingStep(1);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setPdfDataUrl(dataUrl);

      // Staged progress indicators
      const timer1 = setTimeout(() => setProcessingStep(2), 1200);
      const timer2 = setTimeout(() => setProcessingStep(3), 2800);

      try {
        const response = await extractPdfMenu(dataUrl, file.name);
        clearTimeout(timer1);
        clearTimeout(timer2);

        setExtractionData(response);
        setImportId(response.importId);
        setCategories(response.categories || []);
        setRestaurantInfo(response.restaurant || {
          name: file.name.replace(/\.pdf$/i, ''),
          cuisine: 'Multi-Cuisine',
          tagline: '',
          description: '',
          address: '',
          phone: '',
          openingHours: '11:00 AM - 11:00 PM',
        });

        const validated = validateDesignSpecification(response.designSpec);
        setDesignSpec(validated);

        // Expand first category by default
        if (response.categories?.length > 0) {
          setExpandedCategories({ [response.categories[0].id || 'cat-1']: true });
        }

        setStage('review');
        showToast('success', `PDF extracted! Found ${response.categories?.length || 0} categories.`);
      } catch (err: any) {
        clearTimeout(timer1);
        clearTimeout(timer2);
        setProcessingError(err.message || 'Failed to extract menu from PDF document.');
        setStage('upload');
        showToast('error', err.message || 'PDF extraction failed. Please try again.');
      }
    };

    reader.onerror = () => {
      setProcessingError('Could not read the uploaded PDF file.');
      setStage('upload');
    };

    reader.readAsDataURL(file);
  };

  // Toggle category collapse
  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  // Update item field
  const updateItemField = (catIdx: number, itemIdx: number, field: keyof ExtractedPdfItem, value: any) => {
    setCategories(prev => {
      const updated = [...prev];
      const targetCat = { ...updated[catIdx] };
      const targetItems = [...targetCat.items];
      targetItems[itemIdx] = { ...targetItems[itemIdx], [field]: value };

      // If price updated, clear warning
      if (field === 'price' && value !== null && value > 0) {
        targetItems[itemIdx].warnings = [];
      }

      targetCat.items = targetItems;
      updated[catIdx] = targetCat;
      return updated;
    });
  };

  // Update category name
  const updateCategoryName = (catIdx: number, newName: string) => {
    setCategories(prev => {
      const updated = [...prev];
      updated[catIdx] = { ...updated[catIdx], name: newName };
      return updated;
    });
  };

  // Add category
  const addCategory = () => {
    const newId = `cat-${categories.length + 1}`;
    setCategories(prev => [
      ...prev,
      {
        id: newId,
        name: `New Category ${prev.length + 1}`,
        description: '',
        items: []
      }
    ]);
    setExpandedCategories(prev => ({ ...prev, [newId]: true }));
  };

  // Add item to category
  const addItem = (catIdx: number) => {
    setCategories(prev => {
      const updated = [...prev];
      const targetCat = { ...updated[catIdx] };
      targetCat.items = [
        ...targetCat.items,
        {
          id: `item-${catIdx + 1}-${targetCat.items.length + 1}`,
          name: 'New Dish',
          description: '',
          price: 150,
          halfPrice: null,
          fullPrice: null,
          pricingType: 'single',
          variants: [],
          addonGroups: [],
          dietType: 'veg',
          confidence: 1.0,
          warnings: []
        }
      ];
      updated[catIdx] = targetCat;
      return updated;
    });
  };

  // Delete item
  const deleteItem = (catIdx: number, itemIdx: number) => {
    setCategories(prev => {
      const updated = [...prev];
      const targetCat = { ...updated[catIdx] };
      targetCat.items = targetCat.items.filter((_, i) => i !== itemIdx);
      updated[catIdx] = targetCat;
      return updated;
    });
  };

  // Refine design with natural language
  const handleRefineDesign = async () => {
    if (!refinePrompt.trim() || !designSpec) return;
    setIsRefining(true);
    try {
      const res = await refinePdfDesign(importId, refinePrompt, designSpec);
      if (res && res.spec) {
        setDesignSpec(res.spec);
        setRefinePrompt('');
        showToast('success', 'Design specification refined based on your instructions!');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Could not refine design.');
    } finally {
      setIsRefining(false);
    }
  };

  // Save Draft (Resume later)
  const handleSaveDraft = async () => {
    if (!importId) return;
    try {
      await savePdfDraft({
        importId,
        restaurant: restaurantInfo,
        categories,
        designSpec,
      });
      showToast('success', 'Draft saved! You can resume this extraction at any time.');
      onClose();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save draft.');
    }
  };

  // Approve and Publish to Live QR Code
  const handlePublish = async () => {
    if (!importId) return;
    setStage('publishing');
    try {
      const res = await approveAndPublishPdfMenu({
        importId,
        restaurant: restaurantInfo,
        categories,
        designSpec,
        approveContent: true,
        approveDesign: true,
      });

      setPublishedSlug(res.menuSlug);
      setStage('complete');
      showToast('success', 'Menu successfully reconstructed and published to your QR code!');
      onSuccess();
    } catch (err: any) {
      setStage('review');
      showToast('error', err.message || 'Failed to publish reconstructed menu.');
    }
  };

  // Count items with warnings
  const warningCount = categories.reduce(
    (acc, cat) => acc + cat.items.filter(i => (i.warnings && i.warnings.length > 0) || i.price === null).length,
    0
  );
  const totalItemCount = categories.reduce((acc, cat) => acc + cat.items.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-hidden">
      <div className="bg-[#121815] border border-[#2a3832] w-full max-w-7xl h-[92vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-[#2a3832] bg-[#151c19] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#e8783c]/15 text-[#e8783c] border border-[#e8783c]/30">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white leading-tight">
                  PDF-to-Digital-Menu Reconstruction Engine
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Native PDF Vision
                </span>
              </div>
              <p className="text-xs text-[#849a90] mt-0.5">
                {stage === 'upload' && 'Upload your print menu PDF to recreate its exact design and dishes digitally.'}
                {stage === 'extracting' && 'Extracting layout, typography, prices and dishes with multimodal AI...'}
                {stage === 'review' && `Comparing original PDF against recreated digital menu (${totalItemCount} dishes, ${categories.length} categories).`}
                {stage === 'publishing' && 'Writing dishes and design specifications to your live QR menu...'}
                {stage === 'complete' && 'Reconstruction published to permanent QR code!'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {stage === 'upload' && onSwitchToExcel && (
              <button
                type="button"
                onClick={onSwitchToExcel}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2a3832] text-xs font-semibold text-[#849a90] hover:text-white hover:bg-[#1d2723] transition-colors cursor-pointer"
              >
                <FileSpreadsheet size={14} className="text-emerald-400" />
                <span>Switch to Excel Import</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-[#849a90] hover:text-white hover:bg-[#1d2723] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            STAGE 1: UPLOAD SCREEN
            ═══════════════════════════════════════════════════════════════════════ */}
        {stage === 'upload' && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
            <div className="max-w-xl w-full text-center space-y-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
                id="pdf-upload-input"
              />

              <label
                htmlFor="pdf-upload-input"
                className="border-2 border-dashed border-[#2a3832] hover:border-[#e8783c]/60 bg-[#151c19]/60 hover:bg-[#151c19] rounded-2xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all group shadow-inner"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#e8783c]/10 text-[#e8783c] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Upload size={32} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Drop your restaurant menu PDF here, or <span className="text-[#e8783c] underline decoration-dashed">browse</span>
                  </h3>
                  <p className="text-xs text-[#849a90] mt-1.5 max-w-md mx-auto leading-relaxed">
                    Supports multi-page digital PDFs & scanned physical menus up to 15MB.
                    Recreates your original colors, typography, Half/Full portions & pricing.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-[#849a90] pt-2">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={13} className="text-emerald-400" /> Magic Byte Validated
                  </span>
                  <span>•</span>
                  <span>Up to 12 Pages</span>
                  <span>•</span>
                  <span>Hindi & Multilingual Support</span>
                </div>
              </label>

              {processingError && (
                <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-200 flex items-center gap-2 text-left">
                  <AlertTriangle size={16} className="text-red-400 shrink-0" />
                  <span>{processingError}</span>
                </div>
              )}

              {/* Informational feature cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                <div className="p-3.5 rounded-xl bg-[#151c19] border border-[#2a3832]">
                  <span className="text-xs font-bold text-white block mb-1">1. PDF Is Truth</span>
                  <p className="text-[11px] text-[#849a90] leading-relaxed">
                    Extracts exact background tones, fonts, borders and layout structure from your document.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#151c19] border border-[#2a3832]">
                  <span className="text-xs font-bold text-white block mb-1">2. Price & Portions</span>
                  <p className="text-[11px] text-[#849a90] leading-relaxed">
                    Preserves Indian currency (₹), Half/Full pairs, portion sizes and dietary indicators.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#151c19] border border-[#2a3832]">
                  <span className="text-xs font-bold text-white block mb-1">3. Side-by-Side Review</span>
                  <p className="text-[11px] text-[#849a90] leading-relaxed">
                    Inspect original PDF pages alongside live web preview before publishing to your QR code.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            STAGE 2: EXTRACTION ANIMATION
            ═══════════════════════════════════════════════════════════════════════ */}
        {stage === 'extracting' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-[#e8783c]/20 border-t-[#e8783c] animate-spin flex items-center justify-center" />
              <div className="absolute inset-0 flex items-center justify-center text-[#e8783c]">
                <FileText size={26} />
              </div>
            </div>

            <div className="space-y-2 max-w-md">
              <h3 className="text-lg font-bold text-white">Reconstructing {fileName}...</h3>
              <p className="text-xs text-[#849a90]">
                MENUQR is analyzing your PDF structure, typography hierarchy and menu pricing.
              </p>
            </div>

            {/* Staged checklist */}
            <div className="w-full max-w-sm space-y-2 text-left bg-[#151c19] border border-[#2a3832] rounded-xl p-4 text-xs">
              <div className="flex items-center gap-2.5">
                {processingStep >= 1 ? (
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-white/20 shrink-0" />
                )}
                <span className={processingStep >= 1 ? 'text-white font-medium' : 'text-[#849a90]'}>
                  Validating file signature & document pages...
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                {processingStep >= 2 ? (
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-white/20 shrink-0" />
                )}
                <span className={processingStep >= 2 ? 'text-white font-medium' : 'text-[#849a90]'}>
                  Extracting categories, dishes, prices & dietary indicators...
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                {processingStep >= 3 ? (
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-white/20 shrink-0" />
                )}
                <span className={processingStep >= 3 ? 'text-white font-medium' : 'text-[#849a90]'}>
                  Synthesizing high-fidelity web design specification...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            STAGE 3: SIDE-BY-SIDE REVIEW & CORRECTION STUDIO
            ═══════════════════════════════════════════════════════════════════════ */}
        {stage === 'review' && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* LEFT PANE: ORIGINAL SOURCE PDF VIEWER */}
            <div className="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-[#2a3832] flex flex-col bg-[#0d1210]">
              <div className="px-4 py-2.5 bg-[#151c19] border-b border-[#2a3832] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Eye size={14} className="text-[#e8783c]" /> Original Source PDF
                  </span>
                  <span className="text-[10px] text-[#849a90]">
                    ({extractionData?.pageCount || 1} Pages • {extractionData?.isScanned ? 'Scanned Document' : 'Digital PDF'})
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[#849a90] border border-white/10">
                  Visual Source of Truth
                </span>
              </div>

              <div className="flex-1 overflow-hidden relative bg-[#18201c] flex items-center justify-center p-2">
                {pdfDataUrl ? (
                  <iframe
                    src={pdfDataUrl}
                    title="Source PDF"
                    className="w-full h-full rounded-lg border border-[#2a3832] bg-white shadow-inner"
                  />
                ) : (
                  <div className="text-center p-6 text-xs text-[#849a90]">
                    PDF preview unavailable in current viewport.
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT PANE: DIGITAL RECREATION & REVIEW TABS */}
            <div className="w-full lg:w-1/2 flex flex-col bg-[#121815] overflow-hidden">
              {/* TAB SELECTOR */}
              <div className="px-4 py-2 border-b border-[#2a3832] bg-[#151c19] flex items-center justify-between text-xs shrink-0">
                <div className="flex items-center gap-1 bg-[#1a231f] p-1 rounded-lg border border-[#2a3832]">
                  <button
                    type="button"
                    onClick={() => setActiveTab('content')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'content'
                        ? 'bg-[#e8783c] text-white shadow-xs'
                        : 'text-[#849a90] hover:text-white'
                    }`}
                  >
                    1. Dishes & Prices ({totalItemCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('design')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'design'
                        ? 'bg-[#e8783c] text-white shadow-xs'
                        : 'text-[#849a90] hover:text-white'
                    }`}
                  >
                    2. Web Design & Layout
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'profile'
                        ? 'bg-[#e8783c] text-white shadow-xs'
                        : 'text-[#849a90] hover:text-white'
                    }`}
                  >
                    3. Restaurant Profile
                  </button>
                </div>

                {warningCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    <AlertTriangle size={11} /> {warningCount} needs review
                  </span>
                )}
              </div>

              {/* TAB CONTENT */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* ═══════════════════════════════════════════════════════════════
                    TAB 1: CONTENT & PRICING
                    ═══════════════════════════════════════════════════════════════ */}
                {activeTab === 'content' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#849a90]">
                        Review extracted categories and item prices. Edit any unclear details directly.
                      </span>
                      <button
                        type="button"
                        onClick={addCategory}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25322d] hover:bg-[#2e3e38] text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Plus size={13} className="text-[#e8783c]" /> Add Category
                      </button>
                    </div>

                    {categories.map((cat, cIdx) => {
                      const isExpanded = expandedCategories[cat.id || `cat-${cIdx}`] ?? true;
                      return (
                        <div
                          key={cat.id || cIdx}
                          className="border border-[#2a3832] bg-[#151c19] rounded-xl overflow-hidden shadow-xs"
                        >
                          {/* CATEGORY HEADER */}
                          <div className="px-4 py-3 bg-[#1d2723] flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                type="text"
                                value={cat.name}
                                onChange={(e) => updateCategoryName(cIdx, e.target.value)}
                                className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-[#e8783c] text-sm font-bold text-white focus:outline-none px-1 py-0.5 flex-1"
                              />
                              <span className="text-[11px] text-[#849a90] shrink-0">
                                ({cat.items.length} items)
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => addItem(cIdx)}
                                className="px-2 py-1 rounded-md text-[11px] font-semibold bg-[#2a3832] text-white hover:bg-[#384a42] transition-colors cursor-pointer"
                              >
                                + Dish
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleCategory(cat.id || `cat-${cIdx}`)}
                                className="p-1 text-[#849a90] hover:text-white"
                              >
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                            </div>
                          </div>

                          {/* CATEGORY ITEMS */}
                          {isExpanded && (
                            <div className="p-3 divide-y divide-[#2a3832]/60 space-y-3">
                              {cat.items.map((item, iIdx) => (
                                <div key={item.id || iIdx} className="pt-3 first:pt-0 space-y-2">
                                  <div className="flex items-start gap-2.5">
                                    {/* Dietary Indicator */}
                                    <select
                                      value={item.dietType}
                                      onChange={(e) => updateItemField(cIdx, iIdx, 'dietType', e.target.value)}
                                      className={`text-[10px] font-bold uppercase rounded-md px-2 py-1 border shrink-0 ${
                                        item.dietType === 'veg'
                                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
                                          : item.dietType === 'vegan'
                                          ? 'bg-teal-950/40 text-teal-400 border-teal-800/60'
                                          : 'bg-rose-950/40 text-rose-400 border-rose-800/60'
                                      }`}
                                    >
                                      <option value="veg">VEG</option>
                                      <option value="non-veg">NON-VEG</option>
                                      <option value="vegan">VEGAN</option>
                                      <option value="egg">EGG</option>
                                    </select>

                                    {/* Dish Name */}
                                    <div className="flex-1 space-y-1">
                                      <input
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => updateItemField(cIdx, iIdx, 'name', e.target.value)}
                                        placeholder="Dish name"
                                        className="w-full bg-[#101513] border border-[#2a3832] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#e8783c]"
                                      />
                                      <input
                                        type="text"
                                        value={item.description}
                                        onChange={(e) => updateItemField(cIdx, iIdx, 'description', e.target.value)}
                                        placeholder="Description / ingredients (optional)"
                                        className="w-full bg-[#101513] border border-[#2a3832] rounded-lg px-2.5 py-1 text-[11px] text-[#849a90] focus:outline-none focus:border-[#e8783c]"
                                      />
                                    </div>

                                    {/* Price / Half-Full Inputs */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {item.pricingType === 'portion' ? (
                                        <div className="flex items-center gap-1">
                                          <div className="flex items-center gap-0.5 bg-[#101513] border border-[#2a3832] rounded-lg px-2 py-1 text-xs">
                                            <span className="text-[10px] text-[#849a90]">H:₹</span>
                                            <input
                                              type="number"
                                              value={item.halfPrice ?? ''}
                                              onChange={(e) => updateItemField(cIdx, iIdx, 'halfPrice', parseFloat(e.target.value) || null)}
                                              className="w-12 bg-transparent text-white font-mono text-xs focus:outline-none"
                                            />
                                          </div>
                                          <div className="flex items-center gap-0.5 bg-[#101513] border border-[#2a3832] rounded-lg px-2 py-1 text-xs">
                                            <span className="text-[10px] text-[#849a90]">F:₹</span>
                                            <input
                                              type="number"
                                              value={item.fullPrice ?? ''}
                                              onChange={(e) => updateItemField(cIdx, iIdx, 'fullPrice', parseFloat(e.target.value) || null)}
                                              className="w-12 bg-transparent text-white font-mono text-xs focus:outline-none"
                                            />
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1 bg-[#101513] border border-[#2a3832] rounded-lg px-2.5 py-1.5 text-xs">
                                          <span className="text-white font-mono">₹</span>
                                          <input
                                            type="number"
                                            value={item.price ?? ''}
                                            onChange={(e) => updateItemField(cIdx, iIdx, 'price', parseFloat(e.target.value) || null)}
                                            placeholder="Price"
                                            className="w-16 bg-transparent text-white font-mono text-xs focus:outline-none"
                                          />
                                        </div>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() => deleteItem(cIdx, iIdx)}
                                        className="p-1.5 text-[#849a90] hover:text-rose-400 transition-colors"
                                        title="Remove dish"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Warnings if price missing or ambiguous */}
                                  {item.warnings && item.warnings.length > 0 && (
                                    <div className="ml-14 flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-950/30 px-2 py-0.5 rounded border border-amber-900/40">
                                      <AlertTriangle size={11} className="shrink-0" />
                                      <span>{item.warnings.join(' • ')}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════
                    TAB 2: DESIGN & WEB LAYOUT
                    ═══════════════════════════════════════════════════════════════ */}
                {activeTab === 'design' && designSpec && (
                  <div className="space-y-4">
                    {/* NATURAL LANGUAGE REFINEMENT */}
                    <div className="bg-[#19221e] border border-[#e8783c]/30 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#e8783c] flex items-center gap-1.5">
                          <Sparkles size={14} /> Refine Reconstructed Design with AI
                        </span>
                        <span className="text-[10px] text-[#849a90]">Gemini Design Assistant</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={refinePrompt}
                          onChange={(e) => setRefinePrompt(e.target.value)}
                          placeholder="e.g. Make headers more dramatic with gold borders, darken background to charcoal, increase card padding"
                          className="flex-1 bg-[#101513] border border-[#2a3832] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#e8783c]"
                          onKeyDown={(e) => e.key === 'Enter' && handleRefineDesign()}
                        />
                        <button
                          type="button"
                          onClick={handleRefineDesign}
                          disabled={isRefining || !refinePrompt.trim()}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#e8783c] hover:bg-[#f08b55] text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                        >
                          {isRefining ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
                          Refine
                        </button>
                      </div>
                    </div>

                    {/* COMPOSITION STRATEGY */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-white uppercase tracking-wider">
                        Composition Layout
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['editorial', 'image-showcase', 'compact-bistro'] as DesignCompositionStrategy[]).map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setDesignSpec({ ...designSpec, composition: c })}
                            className={`p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                              designSpec.composition === c
                                ? 'border-[#e8783c] bg-[#e8783c]/15 text-white ring-1 ring-[#e8783c]'
                                : 'border-[#2a3832] bg-[#151c19] text-[#849a90] hover:text-white'
                            }`}
                          >
                            <span className="capitalize">{c.replace('-', ' ')}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* LIVE PHONE PREVIEW */}
                    <div className="pt-2 flex flex-col items-center">
                      <span className="text-[11px] font-semibold text-[#849a90] uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Smartphone size={13} className="text-[#e8783c]" /> Responsive Web Menu Preview
                      </span>
                      <PremiumIPhoneMockup
                        className="!w-[320px] shadow-2xl"
                        badgeText={`Reconstructed ${designSpec.composition}`}
                        screenStyle={{ backgroundColor: designSpec.colors.bg }}
                      >
                        <div className="h-full w-full overflow-y-auto">
                          <DynamicDesignEngine
                            spec={designSpec}
                            template={menuTemplates[0]}
                            restaurant={{
                              name: restaurantInfo.name || 'Your Restaurant',
                              tagline: restaurantInfo.tagline,
                              cuisine: restaurantInfo.cuisine,
                              address: restaurantInfo.address,
                              phone: restaurantInfo.phone,
                            }}
                            categories={categories.map((c, cIdx): CategoryGroup => ({
                              id: c.id || `cat-${cIdx}`,
                              name: c.name,
                              items: (c.items || []).map((i, iIdx) => ({
                                id: i.id || `item-${iIdx}`,
                                name: i.name,
                                description: i.description || '',
                                price: i.price || i.fullPrice || 0,
                                halfPrice: i.halfPrice ?? undefined,
                                fullPrice: i.fullPrice ?? undefined,
                                dietType: (i.dietType === 'egg' ? 'non-veg' : i.dietType) || 'veg',
                                available: true,
                                variants: i.variants?.map(v => ({ name: v.name, price: v.price })),
                              })),
                            }))}
                            rawCategories={categories.map((c, cIdx): CategoryGroup => ({
                              id: c.id || `cat-${cIdx}`,
                              name: c.name,
                              items: (c.items || []).map((i, iIdx) => ({
                                id: i.id || `item-${iIdx}`,
                                name: i.name,
                                description: i.description || '',
                                price: i.price || i.fullPrice || 0,
                                halfPrice: i.halfPrice ?? undefined,
                                fullPrice: i.fullPrice ?? undefined,
                                dietType: (i.dietType === 'egg' ? 'non-veg' : i.dietType) || 'veg',
                                available: true,
                                variants: i.variants?.map(v => ({ name: v.name, price: v.price })),
                              })),
                            }))}
                            compact={true}
                            activeCategory={previewCategory}
                            setActiveCategory={setPreviewCategory}
                          />
                        </div>
                      </PremiumIPhoneMockup>
                    </div>
                  </div>
                )}

                {/* ═══════════════════════════════════════════════════════════════
                    TAB 3: RESTAURANT PROFILE
                    ═══════════════════════════════════════════════════════════════ */}
                {activeTab === 'profile' && (
                  <div className="bg-[#151c19] border border-[#2a3832] rounded-xl p-4 space-y-4 text-xs">
                    <div>
                      <label className="block text-[#849a90] font-semibold uppercase tracking-wider mb-1">
                        Restaurant Name
                      </label>
                      <input
                        type="text"
                        value={restaurantInfo.name}
                        onChange={(e) => setRestaurantInfo({ ...restaurantInfo, name: e.target.value })}
                        className="w-full bg-[#101513] border border-[#2a3832] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#e8783c]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#849a90] font-semibold uppercase tracking-wider mb-1">
                          Cuisine Type
                        </label>
                        <input
                          type="text"
                          value={restaurantInfo.cuisine}
                          onChange={(e) => setRestaurantInfo({ ...restaurantInfo, cuisine: e.target.value })}
                          className="w-full bg-[#101513] border border-[#2a3832] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#e8783c]"
                        />
                      </div>
                      <div>
                        <label className="block text-[#849a90] font-semibold uppercase tracking-wider mb-1">
                          Tagline / Slogan
                        </label>
                        <input
                          type="text"
                          value={restaurantInfo.tagline}
                          onChange={(e) => setRestaurantInfo({ ...restaurantInfo, tagline: e.target.value })}
                          className="w-full bg-[#101513] border border-[#2a3832] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#e8783c]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[#849a90] font-semibold uppercase tracking-wider mb-1">
                        Restaurant Description / Story
                      </label>
                      <textarea
                        value={restaurantInfo.description}
                        onChange={(e) => setRestaurantInfo({ ...restaurantInfo, description: e.target.value })}
                        rows={2}
                        className="w-full bg-[#101513] border border-[#2a3832] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#e8783c] resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[#849a90] font-semibold uppercase tracking-wider mb-1">
                          Contact Phone
                        </label>
                        <input
                          type="text"
                          value={restaurantInfo.phone}
                          onChange={(e) => setRestaurantInfo({ ...restaurantInfo, phone: e.target.value })}
                          className="w-full bg-[#101513] border border-[#2a3832] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#e8783c]"
                        />
                      </div>
                      <div>
                        <label className="block text-[#849a90] font-semibold uppercase tracking-wider mb-1">
                          Opening Hours
                        </label>
                        <input
                          type="text"
                          value={restaurantInfo.openingHours}
                          onChange={(e) => setRestaurantInfo({ ...restaurantInfo, openingHours: e.target.value })}
                          className="w-full bg-[#101513] border border-[#2a3832] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#e8783c]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[#849a90] font-semibold uppercase tracking-wider mb-1">
                        Physical Address
                      </label>
                      <input
                        type="text"
                        value={restaurantInfo.address}
                        onChange={(e) => setRestaurantInfo({ ...restaurantInfo, address: e.target.value })}
                        className="w-full bg-[#101513] border border-[#2a3832] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#e8783c]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ACTION FOOTER */}
              <div className="px-6 py-4 border-t border-[#2a3832] bg-[#151c19] flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-4 py-2 rounded-xl border border-[#2a3832] text-xs font-bold text-[#849a90] hover:text-white hover:bg-[#1d2723] transition-colors cursor-pointer"
                >
                  Save Draft & Resume Later
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePublish}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e8783c] hover:bg-[#f08b55] text-white text-xs font-bold shadow-lg shadow-[#e8783c]/20 transition-all cursor-pointer"
                  >
                    <Check size={16} />
                    <span>Approve & Publish to QR Menu</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            STAGE 4: PUBLISHING MODAL
            ═══════════════════════════════════════════════════════════════════════ */}
        {stage === 'publishing' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <RefreshCw size={36} className="text-[#e8783c] animate-spin" />
            <h3 className="text-lg font-bold text-white">Publishing Reconstructed Menu...</h3>
            <p className="text-xs text-[#849a90]">
              Persisting categories, dish prices, and high-fidelity styling to your permanent QR code.
            </p>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            STAGE 5: COMPLETE MODAL
            ═══════════════════════════════════════════════════════════════════════ */}
        {stage === 'complete' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-2 max-w-md">
              <h3 className="text-xl font-bold text-white">Menu Published Successfully!</h3>
              <p className="text-xs text-[#849a90] leading-relaxed">
                Your print PDF has been faithfully reconstructed into a responsive web menu. Your permanent QR code is active and ready for diners.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {publishedSlug && (
                <a
                  href={`/menu/${publishedSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e8783c] hover:bg-[#f08b55] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <ExternalLink size={14} /> View Live QR Menu
                </a>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-[#2a3832] bg-[#1d2723] text-white text-xs font-bold hover:bg-[#25322d] transition-colors cursor-pointer"
              >
                Close & Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


export default PdfMenuImportWizard;
