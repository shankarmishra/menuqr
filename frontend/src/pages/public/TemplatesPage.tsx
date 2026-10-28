import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Eye, 
  ArrowRight, 
  X, 
  Sparkles, 
  Check, 
  Search, 
  Palette, 
  Type, 
  Layout, 
  QrCode
} from 'lucide-react';
import SiteHeader from '../../components/marketing/SiteHeader';
import SiteFooter from '../../components/marketing/SiteFooter';
import { SEO } from '../../seo/SEO';
import BreadcrumbNav from '../../components/seo/BreadcrumbNav';
import GeoFaqSection from '../../components/seo/GeoFaqSection';
import { getBreadcrumbSchema, getOrganizationSchema } from '../../seo/structuredData';
import { menuTemplates, isTemplateDark, type MenuTemplate } from '../../data/menuTemplates';
import { getTemplateCardTheme } from '../../components/marketing/template-gallery/templateCardThemes';
import { TemplatePhonePreview } from '../../components/marketing/template-gallery/TemplateCard';
import PremiumIPhoneMockup from '../../components/marketing/PremiumIPhoneMockup';

type CategoryFilter = 'all' | 'booklet' | 'heritage' | 'italian' | 'burger' | 'indian';

export default function TemplatesPage() {
  const breadcrumbs = [{ name: 'Templates', path: '/templates' }];
  const [selectedFilter, setSelectedFilter] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [previewTemplate, setPreviewTemplate] = useState<MenuTemplate | null>(null);

  // Filtered Templates (All 12 templates: 2 Heritage Masterpieces + 10 Cover & Inside Page Themes)
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
          t.typography.style.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedFilter, searchQuery]);

  return (
    <div className="bg-[#FAFAF7] min-h-screen text-gray-900 font-sans relative overflow-x-clip selection:bg-[#E8783C] selection:text-white">
      <div className="texture-indian-heritage fixed inset-0 pointer-events-none z-0 opacity-40" />
      <SEO 
        title="Heritage Restaurant Menu Templates | MenusQR"
        description="Experience the finest hand-crafted royal heritage menu templates: Heritage Parchment Atelier & Mughal Luxe edition with gold foil accents, palace arches, and mobile QR speed."
        canonicalUrl="/templates"
        schema={[getOrganizationSchema(), getBreadcrumbSchema(breadcrumbs)]}
      />
      
      {/* Global Floating Header */}
      <SiteHeader />
      
      <main className="pt-32 sm:pt-36 pb-24 px-4 sm:px-6 md:px-12 max-w-[1440px] mx-auto relative z-10">
        <BreadcrumbNav items={breadcrumbs} />
        
        {/* Editorial Masthead with Action CTA */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 text-left">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8783C]/10 border border-[#E8783C]/20 text-[#E8783C] text-xs font-bold uppercase tracking-widest mb-4">
              <Sparkles size={13} className="text-[#E8783C]" />
              <span>Royal Heritage Masterpiece Editions</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#151C19] mb-4 tracking-tight leading-[1.12]">
              Heritage Digital QR Menus Crafted for Exceptional Dining
            </h1>
            <p className="text-base sm:text-lg text-[#53615a] leading-relaxed font-medium">
              Designed with museum-grade Indian palace arch motifs, antique parchment textures, emerald borders, and refined serif typography.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-[#E8783C] hover:from-amber-500 hover:to-[#f18b50] text-white text-sm font-bold shadow-xl shadow-amber-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <QrCode size={18} />
              <span>Create My Free Menu</span>
            </Link>
          </div>
        </div>

        {/* Filter Controls & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-stone-200/80">
          {/* Sub Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            <button
              type="button"
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                selectedFilter === 'all'
                  ? 'bg-[#151C19] text-white shadow-md'
                  : 'bg-white text-[#4A5550] border border-stone-200/90 hover:border-stone-300 hover:text-black'
              }`}
            >
              All Templates ({menuTemplates.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('booklet')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedFilter === 'booklet'
                  ? 'bg-[#E8783C] text-white shadow-md'
                  : 'bg-white text-[#E8783C] border border-stone-200 hover:border-[#E8783C]'
              }`}
            >
              <span>📖 Cover & Inside Pages (10)</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('heritage')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedFilter === 'heritage'
                  ? 'bg-[#244740] text-amber-200 shadow-md'
                  : 'bg-white text-[#244740] border border-stone-200 hover:border-[#244740]'
              }`}
            >
              <span>🏛️ Heritage Masterpieces (2)</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('italian')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedFilter === 'italian'
                  ? 'bg-[#C62828] text-white shadow-md'
                  : 'bg-white text-[#C62828] border border-stone-200 hover:border-[#C62828]'
              }`}
            >
              <span>🍕 Italian Bistro</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('burger')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedFilter === 'burger'
                  ? 'bg-[#FF9800] text-stone-900 shadow-md'
                  : 'bg-white text-[#FF9800] border border-stone-200 hover:border-[#FF9800]'
              }`}
            >
              <span>🍔 Fast Food & Grill</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('indian')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedFilter === 'indian'
                  ? 'bg-[#8D1436] text-amber-300 shadow-md'
                  : 'bg-white text-[#8D1436] border border-stone-200 hover:border-[#8D1436]'
              }`}
            >
              <span>🍛 Royal Awadhi & Dhaba</span>
            </button>
          </div>

          {/* Search Field */}
          <div className="relative min-w-[260px] md:max-w-xs">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, cuisine, vibe..."
              className="w-full bg-white border border-stone-200 rounded-full pl-9 pr-4 py-2 text-xs font-medium text-[#151C19] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#E8783C]/30 focus:border-[#E8783C] transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* -------------------------------------------------------- */}
        {/* TEMPLATES GRID (ALL 25 DIGITAL TEMPLATES)                 */}
        {/* -------------------------------------------------------- */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTemplates.map((template) => {
              const theme = getTemplateCardTheme(template);
              const isDark = isTemplateDark(template);
              const isSignature = false;

              return (
                <div
                  key={template.id}
                  className="group relative bg-white rounded-3xl border border-stone-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1.5 flex flex-col overflow-hidden"
                >
                  {/* Visual Phone Mockup Stage */}
                  <div 
                    className="relative p-6 pt-8 pb-6 flex items-center justify-center overflow-hidden border-b border-stone-100"
                    style={{
                      background: isDark
                        ? 'radial-gradient(ellipse at 50% 30%, #1c2621 0%, #0d1210 100%)'
                        : 'radial-gradient(ellipse at 50% 30%, #F5F3EF 0%, #ECE8E1 100%)',
                    }}
                  >
                    {/* Subtle Ambience Glow */}
                    <div 
                      className="absolute w-44 h-44 rounded-full blur-2xl pointer-events-none opacity-40"
                      style={{ backgroundColor: template.colors.accent || '#E8783C' }}
                    />

                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-stone-200/90 text-[#151C19] shadow-xs">
                        {template.typography.style}
                      </span>
                      {isSignature ? (
                        <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-stone-900 shadow-xs flex items-center gap-1">
                          <Sparkles size={10} /> STUDIO 2026
                        </span>
                      ) : template.badge ? (
                        <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E8783C] text-white shadow-xs">
                          ★ {template.badge}
                        </span>
                      ) : null}
                    </div>

                    {/* Phone Mockup Frame */}
                    <div className="relative z-10 transform group-hover:scale-[1.02] transition-transform duration-300">
                      <PremiumIPhoneMockup
                        className="w-[195px] sm:w-[210px]"
                        statusBarTheme={isDark ? 'light' : 'dark'}
                        statusBarMode="overlay"
                        badgeText="Table 12"
                      >
                        <TemplatePhonePreview template={template} theme={theme} isDark={isDark} />
                      </PremiumIPhoneMockup>
                    </div>
                  </div>

                  {/* Editorial Metadata & Specs */}
                  <div className="p-6 flex-1 flex flex-col justify-between text-left">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <h3 className="text-xl font-bold text-[#151C19] tracking-tight group-hover:text-[#E8783C] transition-colors">
                          {template.name}
                        </h3>
                        {/* Color Palette Indicators */}
                        <div className="flex items-center gap-1 shrink-0" title="Color palette">
                          <span className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: template.colors.bg }} />
                          <span className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: template.colors.accent }} />
                          <span className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: template.colors.heading }} />
                        </div>
                      </div>
                      
                      <p className="text-xs text-[#E8783C] font-bold uppercase tracking-wider mb-2">
                        {template.subtitle}
                      </p>

                      <p className="text-xs text-[#5A6860] leading-relaxed line-clamp-2 mb-5 font-medium">
                        {template.description}
                      </p>

                      {/* Spec Badges Row */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-200/60 mb-5">
                        <div className="flex items-center gap-1.5 truncate">
                          <Type size={12} className="text-[#E8783C] shrink-0" />
                          <span className="truncate">{template.typography.heading.split(',')[0]}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <Layout size={12} className="text-emerald-600 shrink-0" />
                          <span className="capitalize truncate">{template.layout.itemStyle} style</span>
                        </div>
                      </div>
                    </div>

                    {/* Dual Action Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                      <button
                        type="button"
                        onClick={() => setPreviewTemplate(template)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-stone-200 text-[#151C19] hover:bg-stone-50 text-xs font-bold transition-colors active:scale-95"
                      >
                        <Eye size={13} className="text-[#E8783C]" />
                        <span>Live Demo</span>
                      </button>
                      
                      <Link
                        to={`/signup?template=${template.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-[#151C19] hover:bg-[#E8783C] text-white text-xs font-bold transition-colors shadow-xs active:scale-95"
                      >
                        <span>Select</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Switch Reassurance Banner */}
        <div className="bg-gradient-to-r from-[#17211C] via-[#1F2C26] to-[#17211C] p-8 sm:p-12 rounded-3xl text-white text-center shadow-xl mb-16 relative overflow-hidden">
          <div className="absolute inset-0 texture-fine-noise pointer-events-none opacity-20" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E8783C] bg-[#E8783C]/10 px-3 py-1 rounded-full border border-[#E8783C]/20 mb-3 inline-block">
              ZERO RISK • FREE STYLE SWITCHING
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold mb-3 tracking-tight">
              Switch Templates Anytime. Your Printed QR Never Changes.
            </h3>
            <p className="text-sm sm:text-base text-white/70 mb-8 leading-relaxed">
              Every MenusQR tabletop code connects permanently to your restaurant link. Change your colors, update your dishes, or switch your entire visual personality in one second from your portal.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link 
                to="/signup" 
                className="inline-flex items-center gap-2 bg-[#E8783C] hover:bg-[#f18b50] text-white text-sm font-bold px-8 py-4 rounded-full shadow-lg shadow-[#E8783C]/25 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Get Started For Free</span>
                <ArrowRight size={16} />
              </Link>
              <Link 
                to="/plans" 
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-bold px-8 py-4 rounded-full transition-all"
              >
                <span>Explore Pricing & Plans</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Regional FAQ Section */}
        <GeoFaqSection title="Frequently Asked Questions About Menu Templates" />
      </main>

      {/* -------------------------------------------------------- */}
      {/* INTERACTIVE DEMO MODAL                                   */}
      {/* -------------------------------------------------------- */}
      {previewTemplate && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setPreviewTemplate(null)}
        >
          <div 
            className="relative w-full max-w-4xl bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewTemplate(null)}
              aria-label="Close preview modal"
              className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/5 hover:bg-black/10 text-stone-600 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Left Column: Interactive Phone Mockup */}
            <div 
              className="md:w-1/2 p-6 sm:p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-stone-100 overflow-y-auto"
              style={{
                background: isTemplateDark(previewTemplate)
                  ? 'radial-gradient(circle at center, #1b2420 0%, #0d1210 100%)'
                  : 'radial-gradient(circle at center, #F7F5F0 0%, #EBE7DE 100%)',
              }}
            >
              <PremiumIPhoneMockup
                className="w-[230px] sm:w-[250px]"
                statusBarTheme={isTemplateDark(previewTemplate) ? 'light' : 'dark'}
                statusBarMode="overlay"
                badgeText="Interactive Preview"
              >
                <TemplatePhonePreview 
                  template={previewTemplate} 
                  theme={getTemplateCardTheme(previewTemplate)} 
                  isDark={isTemplateDark(previewTemplate)} 
                />
              </PremiumIPhoneMockup>
            </div>

            {/* Right Column: Template Editorial Specifications & CTA */}
            <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto text-left">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#E8783C]/10 text-[#E8783C] border border-[#E8783C]/20">
                    {previewTemplate.typography.style} style
                  </span>
                  {previewTemplate.badge && (
                    <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-stone-900 text-white">
                      {previewTemplate.badge}
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#151C19] mb-1 tracking-tight">
                  {previewTemplate.name}
                </h2>
                <p className="text-xs font-bold text-[#E8783C] uppercase tracking-wider mb-4">
                  {previewTemplate.subtitle}
                </p>

                <p className="text-xs sm:text-sm text-[#53615a] leading-relaxed mb-6">
                  {previewTemplate.description}
                </p>

                {/* Design Characteristics */}
                <div className="space-y-3 mb-6 bg-stone-50 p-4 rounded-2xl border border-stone-200/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-500 flex items-center gap-1.5">
                      <Type size={14} className="text-[#E8783C]" /> Typography Heading:
                    </span>
                    <span className="font-bold text-[#151C19]">{previewTemplate.typography.heading.split(',')[0]}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-500 flex items-center gap-1.5">
                      <Layout size={14} className="text-emerald-600" /> Item Style:
                    </span>
                    <span className="font-bold text-[#151C19] capitalize">{previewTemplate.layout.itemStyle}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-500 flex items-center gap-1.5">
                      <Palette size={14} className="text-purple-600" /> Color Accent:
                    </span>
                    <div className="flex items-center gap-2 font-mono font-bold text-[#151C19]">
                      <span className="w-3 h-3 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: previewTemplate.colors.accent }} />
                      <span>{previewTemplate.colors.accent}</span>
                    </div>
                  </div>
                </div>

                {/* Key Inclusions */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-xs text-[#2A3B32]">
                    <Check size={14} className="text-emerald-600 shrink-0" />
                    <span>Instant Veg / Non-Veg diet indicator badges</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#2A3B32]">
                    <Check size={14} className="text-emerald-600 shrink-0" />
                    <span>Real-time price updating from your client portal</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#2A3B32]">
                    <Check size={14} className="text-emerald-600 shrink-0" />
                    <span>Full mobile browser optimization (iOS & Android)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-stone-200/80 flex items-center gap-3">
                <Link
                  to={`/signup?template=${previewTemplate.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#E8783C] hover:bg-[#f18b50] text-white text-xs sm:text-sm font-bold py-3.5 px-6 rounded-xl transition-all shadow-md active:scale-95"
                >
                  <span>Select This Template</span>
                  <ArrowRight size={15} />
                </Link>
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(null)}
                  className="px-4 py-3.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Footer */}
      <SiteFooter />
    </div>
  );
}
