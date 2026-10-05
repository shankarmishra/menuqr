import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Check, Eye, Layers } from 'lucide-react';
import { menuTemplates, TEMPLATE_FILTER_CATEGORIES, DEMO_RESTAURANT } from '../../data/menuTemplates';
import type { MenuTemplate } from '../../data/menuTemplates';
import MenuTemplateRenderer from './MenuTemplateRenderer';
import TemplatePreviewModal from './TemplatePreviewModal';

interface TemplateGalleryProps {
  activeTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
  clientRestaurantData?: any;
}

export default function TemplateGallery({
  activeTemplateId,
  onSelectTemplate,
  clientRestaurantData,
}: TemplateGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewTemplate, setPreviewTemplate] = useState<MenuTemplate | null>(null);

  const filteredTemplates = useMemo(() => {
    return menuTemplates.filter((template) => {
      const matchesSearch =
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.categories.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'all' || template.categories.includes(selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-3 border border-[#D4AF37]/20">
            <Sparkles size={14} /> Design Marketplace
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Menu Template Studio
          </h1>
          <p className="text-[#8A9AAC] mt-2 max-w-xl">
            Choose from 20 architecturally distinct menu designs. Pick a template to instantly apply your restaurant's menu content, branding, and prices.
          </p>
        </div>
      </div>

      {/* Controls: Search & Category Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A9AAC]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates (e.g., Royal, Indian, Cafe, Dark)..."
            className="w-full pl-11 pr-4 py-3 bg-[#1D2723] border border-white/10 rounded-xl text-sm text-white placeholder-[#8A9AAC] focus:outline-none focus:border-[#E8783C] focus:ring-1 focus:ring-[#E8783C]/30 transition-all"
          />
        </div>

        {/* Filter Categories Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {TEMPLATE_FILTER_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#E8783C] text-white shadow-lg shadow-[#E8783C]/20'
                    : 'bg-[#1D2723] text-[#8A9AAC] hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Templates Marketplace Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredTemplates.map((template) => {
            const isSelected = template.id === activeTemplateId;

            return (
              <motion.div
                key={template.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`group relative rounded-2xl border flex flex-col overflow-hidden transition-all duration-300 ${
                  isSelected
                    ? 'border-[#E8783C] bg-[#1D2723] shadow-[0_0_25px_rgba(232,120,60,0.15)] ring-1 ring-[#E8783C]'
                    : 'border-white/5 bg-[#1D2723] hover:border-white/20 hover:-translate-y-1 hover:shadow-xl'
                }`}
              >
                {/* Status Badge */}
                {isSelected && (
                  <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-md bg-[#E8783C] text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <Check size={12} /> Active
                  </div>
                )}
                {template.badge && !isSelected && (
                  <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-md bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-black uppercase tracking-wider">
                    {template.badge}
                  </div>
                )}

                {/* Rendered Mini-Menu Preview Container */}
                <div
                  onClick={() => setPreviewTemplate(template)}
                  className="relative h-64 overflow-hidden cursor-pointer bg-[#151C19] border-b border-white/5"
                >
                  <div className="absolute inset-0 pointer-events-none transform group-hover:scale-105 transition-transform duration-500 origin-top">
                    <MenuTemplateRenderer
                      templateId={template.id}
                      restaurant={clientRestaurantData || DEMO_RESTAURANT}
                      categories={clientRestaurantData?.categories || DEMO_RESTAURANT.categories}
                      items={clientRestaurantData?.items || DEMO_RESTAURANT.items}
                      compact={true}
                    />
                  </div>

                  {/* Hover Overlay with Preview Trigger */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1px]">
                    <span className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold flex items-center gap-2 shadow-lg">
                      <Eye size={14} /> Full Preview
                    </span>
                  </div>
                </div>

                {/* Template Info & Actions */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-[#E8783C] transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-xs text-[#8A9AAC] mt-1 line-clamp-2">{template.description}</p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => setPreviewTemplate(template)}
                      className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye size={14} /> Preview
                    </button>

                    {isSelected ? (
                      <div className="flex-1 py-2.5 rounded-xl bg-[#34B56A]/10 border border-[#34B56A]/30 text-[#34B56A] text-xs font-bold text-center">
                        Selected
                      </div>
                    ) : (
                      <button
                        onClick={() => onSelectTemplate(template.id)}
                        className="flex-1 py-2.5 rounded-xl bg-[#E8783C] hover:bg-[#f18b50] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-[#E8783C]/20"
                      >
                        <Layers size={14} /> Use Design
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-16 bg-[#1D2723] rounded-2xl border border-white/5">
          <p className="text-base font-bold text-white">No menu designs found</p>
          <p className="text-xs text-[#8A9AAC] mt-1">Try resetting your search or selecting "All" categories.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-[#E8783C] text-white text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Full Preview Modal */}
      <TemplatePreviewModal
        template={previewTemplate}
        isOpen={Boolean(previewTemplate)}
        onClose={() => setPreviewTemplate(null)}
        onSelect={onSelectTemplate}
        isCurrentTemplate={previewTemplate?.id === activeTemplateId}
        clientRestaurantData={clientRestaurantData}
      />
    </div>
  );
}



