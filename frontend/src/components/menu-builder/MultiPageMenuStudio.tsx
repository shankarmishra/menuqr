import { useState, useMemo, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Grid, 
  Maximize2, 
  Check, 
  X,
  FileText
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { artisanGraphicThemes, getArtisanThemeById } from '../../data/artisanGraphicThemes';
import { menuTemplates } from '../../data/menuTemplates';
import { paginateMenu, type MenuPageDefinition, type PagedMenuItem } from '../../utils/menuPaginator';
import { ArtisanGraphicTemplate } from './templates/artisan/ArtisanGraphicTemplate';
import { SmartImportWizard } from './SmartImportWizard';
import { getMenu } from '../../pages/app/appStore';
import { useToast } from '../feedback/ToastProvider';

export interface MultiPageMenuStudioProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: {
    name: string;
    tagline?: string;
    cuisine?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    logo?: string;
    slug?: string;
  };
  initialArtisanThemeId?: string;
  initialCategories?: Array<{ id: string; name: string; order?: number }>;
  initialItems?: PagedMenuItem[];
}

export function MultiPageMenuStudio({
  isOpen,
  onClose,
  restaurant,
  initialArtisanThemeId = 'seafood-coastal',
  initialCategories = [],
  initialItems = [],
}: MultiPageMenuStudioProps) {
  const showToast = useToast();

  // Active Catalog Tab: 'artisan' (20 graphic themes) or 'dynamic' (15 code themes)
  const [catalogTab, setCatalogTab] = useState<'artisan' | 'dynamic'>('artisan');
  const [selectedArtisanId, setSelectedArtisanId] = useState<string>(initialArtisanThemeId);
  const [selectedDynamicId, setSelectedDynamicId] = useState<string>('royal-maharaja');
  
  // Layout & View Options
  const [layoutMode, setLayoutMode] = useState<'single-column' | 'two-column'>('two-column');
  const [viewMode, setViewMode] = useState<'single' | 'all-grid'>('single');
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [isImportWizardOpen, setIsImportWizardOpen] = useState<boolean>(false);
  const [isExportingPng, setIsExportingPng] = useState<boolean>(false);

  // Menu Data State (can be updated via Excel import)
  const [categories, setCategories] = useState(initialCategories.length > 0 ? initialCategories : [
    { id: 'starters', name: 'Signature Starters', order: 0 },
    { id: 'mains', name: 'Main Course & Specialties', order: 1 },
    { id: 'breads', name: 'Artisan Breads & Rice', order: 2 },
    { id: 'desserts', name: 'Desserts & Beverages', order: 3 },
  ]);

  const [items, setItems] = useState<PagedMenuItem[]>(initialItems.length > 0 ? initialItems : [
    { id: '1', name: 'Butter Garlic Jumbo Prawns', category: 'starters', price: 680, dietType: 'non-veg', description: 'Fresh coastal prawns tossed in browned garlic, capers, and herb butter glaze' },
    { id: '2', name: 'Crispy Calamari Rings', category: 'starters', price: 480, dietType: 'non-veg', description: 'Golden fried squid rings served with spicy citrus tartar dip and charred lemon' },
    { id: '3', name: 'Coastal Fish Tikka', category: 'starters', price: 540, dietType: 'non-veg', description: 'Charcoal grilled catch of the day marinated in coastal spices and roasted mustard' },
    { id: '4', name: 'Truffle Mushroom Bruschetta', category: 'starters', price: 420, dietType: 'veg', description: 'Toasted sourdough with sautéed wild mushrooms, thyme and white truffle drizzle' },
    { id: '5', name: 'Paneer Angara Tikka', category: 'starters', price: 390, dietType: 'veg', description: 'Smoked cottage cheese cubes skewered with bell peppers and roasted ground spices' },
    { id: '6', name: 'Lobster Thermidor', category: 'mains', price: 1450, dietType: 'non-veg', description: 'Whole lobster tail cooked with rich egg yolk mustard sauce, gratinated with Gruyère' },
    { id: '7', name: 'Traditional Fish Curry', category: 'mains', price: 590, halfPrice: 320, fullPrice: 590, dietType: 'non-veg', description: 'Simmered in kokum and fresh coconut milk with curry leaves and coastal spices' },
    { id: '8', name: 'Butter Chicken Grand Trunk', category: 'mains', price: 520, halfPrice: 290, fullPrice: 520, dietType: 'non-veg', description: 'Slow cooked tandoori chicken in a rich tomato, butter, and dried fenugreek gravy' },
    { id: '9', name: 'Dal Makhani Bukhara', category: 'mains', price: 380, dietType: 'veg', description: 'Black lentils slow cooked overnight over slow charcoal with churned butter and cream' },
    { id: '10', name: 'Paneer Lababdar', category: 'mains', price: 440, dietType: 'veg', description: 'Soft paneer in luscious onion tomato gravy laced with shredded cottage cheese' },
    { id: '11', name: 'Garlic Butter Naan', category: 'breads', price: 95, dietType: 'veg', description: 'Refined flour bread cooked in clay oven, brushed with roasted garlic butter' },
    { id: '12', name: 'Steamed Basmati Rice', category: 'breads', price: 180, dietType: 'veg', description: 'Fragrant long grain Himalayan basmati rice tempered with royal cumin' },
    { id: '13', name: 'Belgian Chocolate Fondant', category: 'desserts', price: 320, dietType: 'veg', description: 'Warm molten chocolate center cake served with artisanal vanilla bean gelato' },
    { id: '14', name: 'Saffron Pistachio Kulfi', category: 'desserts', price: 240, dietType: 'veg', description: 'Traditional condensed milk ice cream infused with Kashmiri saffron and crushed nuts' },
  ]);

  const activeArtisanTheme = useMemo(() => {
    return getArtisanThemeById(selectedArtisanId);
  }, [selectedArtisanId]);

  // Compute multi-page pagination
  const pagedMenu: MenuPageDefinition[] = useMemo(() => {
    return paginateMenu(categories, items, {
      layoutMode,
      enableCoverPage: true,
    });
  }, [categories, items, layoutMode]);

  // Ref to print container
  const activePageRef = useRef<HTMLDivElement>(null);

  // Trigger high-res PNG download of current page
  const handleDownloadPng = async () => {
    if (!activePageRef.current) return;
    try {
      setIsExportingPng(true);
      const dataUrl = await toPng(activePageRef.current, {
        cacheBust: true,
        pixelRatio: 2, // High resolution for print/mobile
      });
      const link = document.createElement('a');
      link.download = `${restaurant.name.toLowerCase().replace(/\s+/g, '-')}-page-${activePageIndex + 1}.png`;
      link.href = dataUrl;
      link.click();
      showToast('success', `Page ${activePageIndex + 1} downloaded in high-resolution PNG!`);
    } catch (err: any) {
      showToast('error', 'Failed to generate PNG image.');
    } finally {
      setIsExportingPng(false);
    }
  };

  // Trigger browser print for PDF saving
  const handlePrintPdf = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-stone-950/90 backdrop-blur-md text-stone-100 select-none overflow-hidden">
      {/* -------------------------------------------------------- */}
      {/* TOP CONTROL BAR */}
      {/* -------------------------------------------------------- */}
      <header className="h-16 px-4 sm:px-6 bg-stone-900 border-b border-stone-800 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
            title="Close Studio"
          >
            <X size={18} />
          </button>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>Multi-Page Visual Menu Studio</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                35 Master Themes
              </span>
            </h2>
            <p className="text-xs text-stone-400 hidden sm:block">
              {restaurant.name} • {pagedMenu.length} Total Pages Auto-Generated
            </p>
          </div>
        </div>

        {/* Center Actions: Excel Upload & Layout Toggle */}
        <div className="flex items-center gap-2">
          {/* Excel Import Button */}
          <button
            onClick={() => setIsImportWizardOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95"
          >
            <FileSpreadsheet size={15} />
            <span className="hidden md:inline">Upload Menu Excel / CSV</span>
            <span className="md:hidden">Excel</span>
          </button>

          {/* Layout Mode Toggle */}
          <div className="hidden sm:flex items-center bg-stone-800 rounded-lg p-0.5 border border-stone-700">
            <button
              onClick={() => setLayoutMode('single-column')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                layoutMode === 'single-column' ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-400 hover:text-white'
              }`}
            >
              1-Col
            </button>
            <button
              onClick={() => setLayoutMode('two-column')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                layoutMode === 'two-column' ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-400 hover:text-white'
              }`}
            >
              2-Col
            </button>
          </div>

          {/* View Mode: Single vs Grid */}
          <div className="flex items-center bg-stone-800 rounded-lg p-0.5 border border-stone-700">
            <button
              onClick={() => setViewMode('single')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'single' ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-400 hover:text-white'
              }`}
              title="Single Page View"
            >
              <FileText size={15} />
            </button>
            <button
              onClick={() => setViewMode('all-grid')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'all-grid' ? 'bg-amber-600 text-white shadow-xs' : 'text-stone-400 hover:text-white'
              }`}
              title="All Pages Grid"
            >
              <Grid size={15} />
            </button>
          </div>

          {/* Export Actions */}
          <button
            onClick={handleDownloadPng}
            disabled={isExportingPng}
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors"
            title="Download Current Page as High-Res PNG"
          >
            <Download size={16} />
          </button>

          <button
            onClick={handlePrintPdf}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md transition-all"
            title="Print or Save as Vector A4 PDF"
          >
            <Printer size={15} />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>
        </div>
      </header>

      {/* -------------------------------------------------------- */}
      {/* MAIN STUDIO WORKSPACE */}
      {/* -------------------------------------------------------- */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT THEME SELECTOR DRAWER (35 THEMES) */}
        <aside className="w-72 sm:w-80 bg-stone-900 border-r border-stone-800 flex flex-col shrink-0 overflow-hidden">
          {/* Category Tabs: 20 Artisan Posters vs 15 Dynamic Themes */}
          <div className="p-3 border-b border-stone-800 grid grid-cols-2 gap-2">
            <button
              onClick={() => setCatalogTab('artisan')}
              className={`py-2 px-2 text-xs font-bold rounded-lg transition-all text-center ${
                catalogTab === 'artisan'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              Artisan Graphic (20)
            </button>
            <button
              onClick={() => setCatalogTab('dynamic')}
              className={`py-2 px-2 text-xs font-bold rounded-lg transition-all text-center ${
                catalogTab === 'dynamic'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              Dynamic CSS (15)
            </button>
          </div>

          {/* Theme List Scrollable */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
            {catalogTab === 'artisan' ? (
              artisanGraphicThemes.map((t) => {
                const isSelected = t.id === selectedArtisanId;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedArtisanId(t.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/50'
                        : 'border-stone-800 bg-stone-850 hover:bg-stone-800'
                    }`}
                  >
                    {/* Thumbnail preview */}
                    <div
                      className="w-12 h-16 rounded-md bg-cover bg-center shrink-0 border border-stone-700 shadow-sm"
                      style={{ backgroundImage: `url(${t.bgImage})` }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{t.name}</span>
                        {isSelected && <Check size={14} className="text-amber-400 shrink-0" />}
                      </div>
                      <span className="text-[10px] text-amber-400/90 font-medium block truncate">
                        {t.cuisine}
                      </span>
                      <p className="text-[10px] text-stone-400 line-clamp-1 mt-0.5">
                        {t.badge}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              menuTemplates.map((t) => {
                const isSelected = t.id === selectedDynamicId;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedDynamicId(t.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/50'
                        : 'border-stone-800 bg-stone-850 hover:bg-stone-800'
                    }`}
                  >
                    <div
                      className="w-12 h-16 rounded-md shrink-0 border border-stone-700 shadow-sm flex items-center justify-center font-serif text-sm font-bold"
                      style={{ backgroundColor: t.colors.bg, color: t.colors.heading }}
                    >
                      Aa
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{t.name}</span>
                        {isSelected && <Check size={14} className="text-amber-400 shrink-0" />}
                      </div>
                      <span className="text-[10px] text-amber-400/90 font-medium block truncate">
                        {t.categories.slice(0, 2).join(' • ')}
                      </span>
                      <p className="text-[10px] text-stone-400 line-clamp-1 mt-0.5">
                        {t.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* RIGHT CANVAS: INTERACTIVE A4 PAGE VIEWER */}
        <main className="flex-1 flex flex-col bg-stone-950 overflow-y-auto p-4 sm:p-8 items-center justify-start">
          {viewMode === 'single' ? (
            /* SINGLE PAGE CAROUSEL / FLIP VIEW */
            <div className="w-full max-w-[620px] flex flex-col items-center">
              {/* Page Indicator & Navigator Bar */}
              <div className="w-full flex items-center justify-between mb-4 px-2">
                <button
                  disabled={activePageIndex === 0}
                  onClick={() => setActivePageIndex(p => Math.max(0, p - 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold text-stone-200 transition-colors"
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                <div className="text-center">
                  <span className="text-xs font-bold text-white tracking-widest uppercase">
                    {pagedMenu[activePageIndex]?.pageType === 'cover' ? 'Front Cover' : `Page ${pagedMenu[activePageIndex]?.pageNumber}`}
                  </span>
                  <span className="text-[11px] text-stone-400 ml-1.5">
                    of {pagedMenu.length}
                  </span>
                </div>

                <button
                  disabled={activePageIndex >= pagedMenu.length - 1}
                  onClick={() => setActivePageIndex(p => Math.min(pagedMenu.length - 1, p + 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold text-stone-200 transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* A4 Card Frame Container */}
              <div ref={activePageRef} className="w-full shadow-2xl rounded-sm overflow-hidden">
                {pagedMenu[activePageIndex] && (
                  <ArtisanGraphicTemplate
                    theme={activeArtisanTheme}
                    page={pagedMenu[activePageIndex]}
                    restaurant={restaurant}
                    layoutMode={layoutMode}
                  />
                )}
              </div>

              {/* Bottom Thumbnail Strip */}
              <div className="flex items-center gap-2 mt-6 overflow-x-auto max-w-full pb-2">
                {pagedMenu.map((p, idx) => (
                  <button
                    key={p.pageNumber}
                    onClick={() => setActivePageIndex(idx)}
                    className={`w-14 h-20 rounded-md border-2 shrink-0 flex flex-col items-center justify-center transition-all bg-cover bg-center ${
                      idx === activePageIndex
                        ? 'border-amber-500 scale-105 shadow-md'
                        : 'border-stone-800 opacity-60 hover:opacity-100'
                    }`}
                    style={{ backgroundImage: `url(${activeArtisanTheme.bgImage})` }}
                  >
                    <span className="px-1.5 py-0.5 rounded-sm bg-black/75 text-[9px] font-bold text-white">
                      {p.pageType === 'cover' ? 'Cover' : `P${p.pageNumber}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ALL PAGES GRID VIEW */
            <div className="w-full max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {pagedMenu.map((p, idx) => (
                  <div key={p.pageNumber} className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between text-xs text-stone-400 font-semibold px-1">
                      <span>{p.pageType === 'cover' ? 'Page 1: Front Cover' : `Page ${p.pageNumber} of ${p.totalPages}`}</span>
                      <button
                        onClick={() => {
                          setActivePageIndex(idx);
                          setViewMode('single');
                        }}
                        className="text-amber-400 hover:underline inline-flex items-center gap-1 text-[11px]"
                      >
                        <Maximize2 size={12} />
                        Inspect
                      </button>
                    </div>
                    <div className="shadow-2xl rounded-sm overflow-hidden border border-stone-800">
                      <ArtisanGraphicTemplate
                        theme={activeArtisanTheme}
                        page={p}
                        restaurant={restaurant}
                        layoutMode={layoutMode}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* -------------------------------------------------------- */}
      {/* SMART IMPORT WIZARD MODAL FOR EXCEL / CSV */}
      {/* -------------------------------------------------------- */}
      <SmartImportWizard
        isOpen={isImportWizardOpen}
        onClose={() => setIsImportWizardOpen(false)}
        onSuccess={async () => {
          setIsImportWizardOpen(false);
          try {
            const updated = await getMenu();
            if (updated?.categories && updated.categories.length > 0) {
              setCategories(updated.categories.map((c, idx) => ({ id: c.id, name: c.name, order: idx })));
              const flattened = updated.categories.flatMap(c => 
                (c.items || []).map(it => ({
                  id: it.id,
                  name: it.name,
                  description: it.description,
                  price: it.price,
                  halfPrice: it.half_price,
                  fullPrice: it.full_price,
                  category: c.id,
                  dietType: it.diet_type as any,
                  available: it.is_available,
                }))
              );
              if (flattened.length > 0) {
                setItems(flattened as any);
              }
            }
          } catch {
            // fallback
          }
          showToast('success', 'Menu Excel spreadsheet imported successfully! Pages re-calculated.');
        }}
      />
    </div>
  );
}
