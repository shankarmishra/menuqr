import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Search, 
  Smartphone, 
  Maximize2, 
  Palette, 
  Type, 
  ArrowRight, 
  Grid3X3, 
  TableProperties, 
  ExternalLink,
  ChevronRight,
  Utensils
} from 'lucide-react';
import { menuTemplates, isTemplateDark, DEMO_RESTAURANT } from '../../data/menuTemplates';
import MenuTemplateRenderer from '../../components/menu-builder/MenuTemplateRenderer';
import PremiumIPhoneMockup from '../../components/marketing/PremiumIPhoneMockup';
import { getTemplateCardTheme } from '../../components/marketing/template-gallery/templateCardThemes';
import { TemplatePhonePreview } from '../../components/marketing/template-gallery/TemplateCard';

type ViewMode = 'grid' | 'playground' | 'table';
type FilterGroup = 'all' | 'heritage' | 'booklet' | 'italian' | 'burger' | 'indian';

export default function TemplateShowcasePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('playground');
  const [selectedFilter, setSelectedFilter] = useState<FilterGroup>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('craft-trattoria');
  const [isCompactDevice, setIsCompactDevice] = useState(true);

  // Filtered list (All 12 templates: 2 Heritage Masterpieces + 10 Graphic Cover Themes)
  const filteredTemplates = useMemo(() => {
    return menuTemplates.filter((t) => {
      if (selectedFilter === 'heritage' && !['rajasthani-heritage', 'mughal-luxe'].includes(t.id)) return false;
      if (selectedFilter === 'booklet' && ['rajasthani-heritage', 'mughal-luxe'].includes(t.id)) return false;
      if (selectedFilter === 'italian' && t.id !== 'craft-trattoria') return false;
      if (selectedFilter === 'burger' && !['midnight-burger', 'rustic-smokehouse', 'boho-taproom'].includes(t.id)) return false;
      if (selectedFilter === 'indian' && !['rajasthani-heritage', 'mughal-luxe', 'awadhi-dastarkhwan', 'desi-dhaba'].includes(t.id)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.subtitle.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.typography.style.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedFilter, searchQuery]);

  const currentTemplate = useMemo(() => {
    return menuTemplates.find((t) => t.id === selectedTemplateId) || menuTemplates[0];
  }, [selectedTemplateId]);

  const isCurrentDark = useMemo(() => {
    return isTemplateDark(currentTemplate);
  }, [currentTemplate]);

  return (
    <div className="min-h-screen bg-[#0C120F] text-[#FAF3E0] font-sans selection:bg-[#E8783C] selection:text-white flex flex-col">
      {/* Top Banner Header */}
      <header className="sticky top-0 z-50 bg-[#121B16]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#E8783C] to-amber-400 flex items-center justify-center text-stone-900 font-extrabold shadow-lg shadow-[#E8783C]/20">
            <Utensils size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-wide text-white">
                MenuQR Design Studio
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#E8783C] text-white">
                Total: 12 Templates
              </span>
            </div>
            <p className="text-[11px] text-[#8EA298] font-mono">
              2 Heritage Masterpieces + 10 Front Cover & Inside Menu Booklet Themes
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="bg-[#18231E] border border-white/10 rounded-xl p-1 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode('playground')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'playground'
                  ? 'bg-[#E8783C] text-white shadow-md'
                  : 'text-[#8EA298] hover:text-white'
              }`}
            >
              <Smartphone size={14} />
              <span>Interactive Playground</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-[#E8783C] text-white shadow-md'
                  : 'text-[#8EA298] hover:text-white'
              }`}
            >
              <Grid3X3 size={14} />
              <span>Grid Gallery ({filteredTemplates.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-[#E8783C] text-white shadow-md'
                  : 'text-[#8EA298] hover:text-white'
              }`}
            >
              <TableProperties size={14} />
              <span>Specs Table</span>
            </button>
          </div>

          <Link
            to="/templates"
            className="px-3.5 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs text-white font-medium transition-colors inline-flex items-center gap-1.5"
          >
            <span>Public Page</span>
            <ExternalLink size={12} />
          </Link>
        </div>
      </header>

      {/* Filter Bar & Quick Stats */}
      <div className="bg-[#101713] border-b border-white/5 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              selectedFilter === 'all'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'bg-white/5 text-[#8EA298] hover:text-white hover:bg-white/10'
            }`}
          >
            All Templates ({menuTemplates.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('booklet')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              selectedFilter === 'booklet'
                ? 'bg-[#E8783C] text-white shadow-sm'
                : 'bg-white/5 text-[#8EA298] hover:text-white hover:bg-white/10'
            }`}
          >
            <span>📖 Cover & Inside Pages (10)</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('heritage')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              selectedFilter === 'heritage'
                ? 'bg-[#244740] text-amber-200 shadow-sm'
                : 'bg-white/5 text-[#8EA298] hover:text-white hover:bg-white/10'
            }`}
          >
            <span>🏛️ Heritage Masterpieces (2)</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('italian')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              selectedFilter === 'italian'
                ? 'bg-[#C62828] text-white shadow-sm'
                : 'bg-white/5 text-[#8EA298] hover:text-white hover:bg-white/10'
            }`}
          >
            <span>🍕 Italian Bistro</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('burger')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              selectedFilter === 'burger'
                ? 'bg-[#FF9800] text-stone-900 shadow-sm'
                : 'bg-white/5 text-[#8EA298] hover:text-white hover:bg-white/10'
            }`}
          >
            <span>🍔 Fast Food & Grill</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('indian')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              selectedFilter === 'indian'
                ? 'bg-[#8D1436] text-amber-300 shadow-sm'
                : 'bg-white/5 text-[#8EA298] hover:text-white hover:bg-white/10'
            }`}
          >
            <span>🍛 Royal Awadhi & Dhaba</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates by name, style..."
            className="w-full bg-[#18231E] border border-white/10 rounded-full pl-8 pr-4 py-1.5 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#E8783C]"
          />
        </div>
      </div>

      {/* Main Showcase Body */}
      <div className="flex-1 overflow-hidden">
        {/* ---------------------------------------------------- */}
        {/* VIEW 1: INTERACTIVE PLAYGROUND (DEFAULT DEDICATED)  */}
        {/* ---------------------------------------------------- */}
        {viewMode === 'playground' && (
          <div className="h-[calc(100vh-115px)] grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
            {/* Left Column: Quick Selector Sidebar (4 Cols) */}
            <div className="lg:col-span-4 border-r border-white/10 bg-[#0E1512] flex flex-col h-full overflow-hidden">
              <div className="p-3.5 border-b border-white/10 bg-[#121A15] flex items-center justify-between">
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#8EA298]">
                  Select Template ({filteredTemplates.length})
                </span>
                <span className="text-[11px] font-mono text-stone-400">
                  Live Sync
                </span>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-white/5 p-2 space-y-1">
                {filteredTemplates.map((t, idx) => {
                  const isSelected = t.id === selectedTemplateId;
                  const isNew = Boolean(t.badge);

                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTemplateId(t.id)}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#E8783C]/20 to-amber-500/10 border border-[#E8783C]/50 shadow-md'
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[#E8783C] text-white' : 'bg-white/10 text-stone-400'
                        }`}>
                          {idx + 1}
                        </span>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`font-bold text-sm tracking-tight ${
                              isSelected ? 'text-white' : 'text-[#D0DBD5] group-hover:text-white'
                            }`}>
                              {t.name}
                            </span>
                            {isNew && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#E8783C]/30 text-[#E8783C] border border-[#E8783C]/40">
                                NEW
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#7E9388] line-clamp-1">
                            {t.subtitle}
                          </span>
                        </div>
                      </div>

                      {/* Color dots preview */}
                      <div className="flex items-center gap-1 shrink-0">
                        <span 
                          className="w-3 h-3 rounded-full border border-white/20 shadow-xs" 
                          style={{ backgroundColor: t.colors.accent }} 
                          title={`Accent: ${t.colors.accent}`}
                        />
                        <span 
                          className="w-3 h-3 rounded-full border border-white/20 shadow-xs" 
                          style={{ backgroundColor: t.colors.bg }} 
                          title={`Background: ${t.colors.bg}`}
                        />
                        <ChevronRight size={14} className={`transition-transform ${isSelected ? 'text-[#E8783C] translate-x-0.5' : 'text-stone-600'}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Live Interactive Device Frame & Specs (8 Cols) */}
            <div className="lg:col-span-8 bg-[#090D0B] flex flex-col h-full overflow-hidden">
              {/* Device Toolbar */}
              <div className="px-6 py-3 border-b border-white/10 bg-[#101713] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-white">
                      {currentTemplate.name}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-white/10 text-[#8EA298] font-mono">
                      id: {currentTemplate.id}
                    </span>
                    {Boolean(currentTemplate.badge) && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
                        <Sparkles size={10} /> {currentTemplate.badge}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCompactDevice(!isCompactDevice)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors flex items-center gap-1.5 ${
                      isCompactDevice
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-white/5 text-stone-400 border-white/10 hover:text-white'
                    }`}
                  >
                    <Smartphone size={13} />
                    <span>{isCompactDevice ? 'Phone Mockup (340px)' : 'Full Width View'}</span>
                  </button>

                  <Link
                    to={`/audit-preview/${currentTemplate.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center gap-1.5"
                  >
                    <Maximize2 size={13} />
                    <span>Open Standalone</span>
                  </Link>
                </div>
              </div>

              {/* Live Preview Area & Metadata Drawer */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Center Stage: Phone Render */}
                <div className="flex-1 overflow-y-auto p-6 flex items-start justify-center relative">
                  {/* Subtle Background Radial Ambient Glow */}
                  <div 
                    className="absolute top-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20"
                    style={{ backgroundColor: currentTemplate.colors.accent }}
                  />

                  {isCompactDevice ? (
                    <div className="my-auto transform transition-transform duration-300 hover:scale-[1.01]">
                      <PremiumIPhoneMockup
                        className="!w-[340px] shadow-2xl"
                        badgeText={currentTemplate.name}
                        statusBarTheme={isCurrentDark ? 'light' : 'dark'}
                        homeIndicatorTheme={isCurrentDark ? 'light' : 'dark'}
                        screenStyle={{ backgroundColor: currentTemplate.colors.bg }}
                      >
                        <div className="h-full w-full overflow-y-auto">
                          <MenuTemplateRenderer
                            templateId={currentTemplate.id}
                            restaurant={DEMO_RESTAURANT}
                            categories={DEMO_RESTAURANT.categories}
                            items={DEMO_RESTAURANT.items}
                            compact={true}
                          />
                        </div>
                      </PremiumIPhoneMockup>
                    </div>
                  ) : (
                    <div className="w-full max-w-2xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                      <MenuTemplateRenderer
                        templateId={currentTemplate.id}
                        restaurant={DEMO_RESTAURANT}
                        categories={DEMO_RESTAURANT.categories}
                        items={DEMO_RESTAURANT.items}
                        compact={false}
                      />
                    </div>
                  )}
                </div>

                {/* Right Panel: Template Specification Card */}
                <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-white/10 bg-[#111914] p-5 overflow-y-auto space-y-5">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#E8783C] font-bold">
                      Design Specifications
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1">
                      {currentTemplate.name}
                    </h3>
                    <p className="text-xs text-amber-400 font-medium">
                      {currentTemplate.subtitle}
                    </p>
                    <p className="text-xs text-[#8EA298] mt-2 leading-relaxed">
                      {currentTemplate.description}
                    </p>
                  </div>

                  {/* Visual Palette Swatches */}
                  <div className="bg-[#18231E] p-3.5 rounded-xl border border-white/5 space-y-2.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                      <Palette size={12} className="text-[#E8783C]" /> Color Palette
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="flex items-center gap-2 bg-black/30 p-1.5 rounded-lg border border-white/5">
                        <span className="w-4 h-4 rounded-md border border-white/20 shrink-0" style={{ backgroundColor: currentTemplate.colors.bg }} />
                        <div className="truncate">
                          <p className="text-[9px] text-stone-400">Background</p>
                          <p className="font-mono text-white text-[10px]">{currentTemplate.colors.bg}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-black/30 p-1.5 rounded-lg border border-white/5">
                        <span className="w-4 h-4 rounded-md border border-white/20 shrink-0" style={{ backgroundColor: currentTemplate.colors.accent }} />
                        <div className="truncate">
                          <p className="text-[9px] text-stone-400">Accent</p>
                          <p className="font-mono text-white text-[10px]">{currentTemplate.colors.accent}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-black/30 p-1.5 rounded-lg border border-white/5">
                        <span className="w-4 h-4 rounded-md border border-white/20 shrink-0" style={{ backgroundColor: currentTemplate.colors.heading }} />
                        <div className="truncate">
                          <p className="text-[9px] text-stone-400">Heading</p>
                          <p className="font-mono text-white text-[10px]">{currentTemplate.colors.heading}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-black/30 p-1.5 rounded-lg border border-white/5">
                        <span className="w-4 h-4 rounded-md border border-white/20 shrink-0" style={{ backgroundColor: currentTemplate.colors.text }} />
                        <div className="truncate">
                          <p className="text-[9px] text-stone-400">Body Text</p>
                          <p className="font-mono text-white text-[10px]">{currentTemplate.colors.text}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Typography & Layout */}
                  <div className="bg-[#18231E] p-3.5 rounded-xl border border-white/5 space-y-2.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                      <Type size={12} className="text-emerald-400" /> Typography & Layout
                    </span>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-stone-400">Heading Font:</span>
                        <span className="font-bold text-white text-right truncate max-w-[150px]">
                          {currentTemplate.typography.heading.split(',')[0]}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-stone-400">Item Presentation:</span>
                        <span className="font-bold text-emerald-300 capitalize">
                          {currentTemplate.layout.itemStyle}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-stone-400">Header Style:</span>
                        <span className="font-bold text-white capitalize">
                          {currentTemplate.layout.headerStyle}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Visual Mode:</span>
                        <span className="font-bold text-white">
                          {isCurrentDark ? 'Dark Atmospheric' : 'Light Paper'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Link */}
                  <Link
                    to={`/signup?template=${currentTemplate.id}`}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-[#E8783C] hover:from-amber-500 hover:to-[#f18b50] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <span>Use This Template For Menu</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 2: GRID GALLERY (SIDE-BY-SIDE ALL 25)          */}
        {/* ---------------------------------------------------- */}
        {viewMode === 'grid' && (
          <div className="p-6 md:p-10 max-w-7xl mx-auto overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-white">
                  All 25 Production Menu Templates
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  Click any template card to inspect it inside the live device playground.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredTemplates.map((template, idx) => {
                const theme = getTemplateCardTheme(template);
                const isDark = isTemplateDark(template);
                const isNew = Boolean(template.badge);

                return (
                  <div
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplateId(template.id);
                      setViewMode('playground');
                    }}
                    className="group cursor-pointer bg-[#141C18] border border-white/10 hover:border-[#E8783C]/60 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col"
                  >
                    {/* Phone Preview Stage */}
                    <div 
                      className="p-5 flex items-center justify-center relative border-b border-white/5"
                      style={{
                        background: isDark
                          ? 'radial-gradient(circle at center, #1b2420 0%, #0d1210 100%)'
                          : 'radial-gradient(circle at center, #F7F5F0 0%, #EBE7DE 100%)',
                      }}
                    >
                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/80 text-white border border-white/10">
                          #{idx + 1}
                        </span>
                        {isNew ? (
                          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500 text-stone-900 shadow-xs flex items-center gap-1">
                            <Sparkles size={9} /> NEW STUDIO
                          </span>
                        ) : template.badge ? (
                          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#E8783C] text-white">
                            {template.badge}
                          </span>
                        ) : null}
                      </div>

                      {/* Mini iPhone Preview */}
                      <div className="transform group-hover:scale-105 transition-transform duration-300 my-2">
                        <PremiumIPhoneMockup
                          className="w-[155px]"
                          statusBarTheme={isDark ? 'light' : 'dark'}
                          statusBarMode="overlay"
                          badgeText={template.name}
                        >
                          <TemplatePhonePreview template={template} theme={theme} isDark={isDark} />
                        </PremiumIPhoneMockup>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h4 className="font-bold text-sm text-white group-hover:text-[#E8783C] transition-colors truncate">
                            {template.name}
                          </h4>
                          <span 
                            className="w-3 h-3 rounded-full border border-white/20 shrink-0" 
                            style={{ backgroundColor: template.colors.accent }}
                          />
                        </div>
                        <p className="text-[11px] text-[#E8783C] font-semibold line-clamp-1 mb-1">
                          {template.subtitle}
                        </p>
                        <p className="text-[10px] text-stone-400 line-clamp-2">
                          {template.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] text-stone-400 font-mono">
                        <span>{template.typography.heading.split(',')[0]}</span>
                        <span className="text-[#E8783C] group-hover:underline">Inspect →</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* VIEW 3: COMPARISON SPECS TABLE                      */}
        {/* ---------------------------------------------------- */}
        {viewMode === 'table' && (
          <div className="p-6 md:p-10 max-w-7xl mx-auto overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-white">
                  Templates Catalog Specifications Matrix
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  Full programmatic comparison of all 25 active production templates.
                </p>
              </div>
            </div>

            <div className="bg-[#131B17] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#18231E] text-stone-400 font-mono text-[11px] uppercase border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Template Name</th>
                      <th className="py-3 px-4">Template ID</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Colors (Accent / BG)</th>
                      <th className="py-3 px-4">Heading Typography</th>
                      <th className="py-3 px-4">Layout Style</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-stone-300">
                    {filteredTemplates.map((template, idx) => {
                      const isNew = Boolean(template.badge);
                      return (
                        <tr key={template.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 font-mono text-stone-500">{idx + 1}</td>
                          <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                            <span>{template.name}</span>
                            {isNew && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                {template.badge}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-stone-400">{template.id}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-stone-300">
                              {template.typography.style}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 font-mono text-[10px]">
                              <span className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: template.colors.accent }} />
                              <span className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: template.colors.bg }} />
                              <span className="text-stone-400">{template.colors.accent}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium text-stone-300">
                            {template.typography.heading.split(',')[0]}
                          </td>
                          <td className="py-3 px-4 capitalize font-mono text-[11px] text-emerald-400">
                            {template.layout.itemStyle}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTemplateId(template.id);
                                setViewMode('playground');
                              }}
                              className="px-3 py-1 rounded-lg bg-[#E8783C] hover:bg-[#f18b50] text-white text-[11px] font-bold transition-colors"
                            >
                              Inspect Live
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
