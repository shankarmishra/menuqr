import React from 'react';
import { Sparkles, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import type { MenuTemplate } from '../../../data/menuTemplates';

interface TemplateMetadataProps {
  template: MenuTemplate;
  activeIndex: number;
  totalCount: number;
  onPrev: () => void;
  onNext: () => void;
  onOpenInspector: () => void;
}

export const TemplateMetadata: React.FC<TemplateMetadataProps> = ({
  template,
  activeIndex,
  totalCount,
  onPrev,
  onNext,
  onOpenInspector,
}) => {
  return (
    <div className="space-y-4 text-left max-w-lg mx-auto lg:mx-0">
      {/* Index Counter & Progress Tag */}
      <div className="flex items-center gap-3">
        <span className="text-4xl sm:text-5xl font-black text-[#E8783C] font-mono tracking-tighter">
          {String(activeIndex + 1).padStart(2, '0')}
        </span>
        <div className="h-8 w-px bg-slate-300" />
        <div>
          <span className="text-[10px] font-mono font-bold text-[#626776] uppercase tracking-widest block">
            TEMPLATE COLLECTION
          </span>
          <span className="text-xs font-mono text-[#151C19] font-bold">
            {activeIndex + 1} OF {totalCount} DESIGNS
          </span>
        </div>
      </div>

      {/* Category Pills & Badge */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#E8783C]/10 border border-[#E8783C]/30 text-[#E8783C] text-[11px] font-extrabold uppercase tracking-wider">
          <Sparkles size={12} />
          {template.subtitle}
        </span>
        {template.badge && (
          <span className="px-2.5 py-1 rounded-md bg-[#151C19] text-[#FFC928] text-[10px] font-extrabold uppercase tracking-wider">
            {template.badge}
          </span>
        )}
      </div>

      {/* Template Name & Description */}
      <div>
        <h3 className="text-2xl sm:text-4xl font-black text-[#151C19] tracking-tight leading-tight">
          {template.name}
        </h3>
        <p className="text-xs sm:text-sm text-[#626776] mt-2 leading-relaxed">
          {template.description}
        </p>
      </div>

      {/* Specs Chips */}
      <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
        <div className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-[#151C19] shadow-2xs font-medium">
          <span className="text-[#626776]">Layout:</span> <strong className="capitalize">{template.layout.type}</strong>
        </div>
        <div className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-[#151C19] shadow-2xs font-medium">
          <span className="text-[#626776]">Header:</span> <strong className="capitalize">{template.layout.headerStyle}</strong>
        </div>
        <div className="px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-[#151C19] shadow-2xs font-medium">
          <span className="text-[#626776]">Style:</span> <strong className="capitalize">{template.typography.style}</strong>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 flex items-center justify-between gap-4">
        <button
          onClick={onOpenInspector}
          className="px-6 py-3.5 rounded-xl bg-[#151C19] hover:bg-[#E8783C] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 group"
        >
          <Eye size={16} /> Explore Design <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>

        {/* Arrow Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            disabled={activeIndex === 0}
            className="p-3 rounded-xl bg-white hover:bg-slate-100 text-[#151C19] border border-slate-300 disabled:opacity-30 transition-all shadow-2xs"
            aria-label="Previous template"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={onNext}
            disabled={activeIndex === totalCount - 1}
            className="p-3 rounded-xl bg-white hover:bg-slate-100 text-[#151C19] border border-slate-300 disabled:opacity-30 transition-all shadow-2xs"
            aria-label="Next template"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateMetadata;
