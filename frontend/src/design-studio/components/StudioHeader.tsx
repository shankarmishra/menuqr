import React from 'react';
import type { StudioStats } from '../store';
import { Sparkles, Search, RefreshCw } from 'lucide-react';

interface Props {
  stats: StudioStats;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onReset: () => void;
}

export const StudioHeader: React.FC<Props> = ({
  stats,
  selectedFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  onReset,
}) => {
  return (
    <header className="border-b border-[#23352C] bg-[#0E1512] px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Title Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8783C]/15 px-3 py-1 text-xs font-bold text-[#E8783C] border border-[#E8783C]/30">
                <Sparkles size={13} />
                <span>INTERNAL DESIGN STUDIO</span>
              </span>
              <span className="text-xs font-mono text-[#8C9B94]">v1.0.0 · Local Dev Runtime</span>
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
              MENUQR Illustration & Motion Studio
            </h1>
            <p className="mt-1 text-sm text-[#8C9B94]">
              Visual review, inspection, animation tuning, and approval workspace for original project assets.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#2A3D34] bg-[#16221C] px-3.5 py-2 text-xs font-semibold text-[#C5D1CB] hover:bg-[#1E2E26] hover:text-white transition-colors"
              title="Reset reviews to blueprint manifest default"
            >
              <RefreshCw size={13} />
              <span>Reset State</span>
            </button>
          </div>
        </div>

        {/* Real-time KPI Stats Row */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          <div className="rounded-xl border border-[#24352D] bg-[#141E1A] p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#7E9187]">Total Planned</p>
            <p className="mt-1 text-2xl font-black text-white">{stats.totalPlanned}</p>
            <p className="mt-0.5 text-[10px] text-[#63756C]">12 Illus · 8 Motion</p>
          </div>

          <div className="rounded-xl border border-[#24352D] bg-[#141E1A] p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#7E9187]">Ready for Review</p>
            <p className="mt-1 text-2xl font-black text-[#FFC928]">{stats.readyForReview}</p>
            <p className="mt-0.5 text-[10px] text-[#FFC928]/80">Awaiting your feedback</p>
          </div>

          <div className="rounded-xl border border-[#24352D] bg-[#141E1A] p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#7E9187]">Approved</p>
            <p className="mt-1 text-2xl font-black text-[#34B56A]">{stats.approved}</p>
            <p className="mt-0.5 text-[10px] text-[#34B56A]/80">Ready for integration</p>
          </div>

          <div className="rounded-xl border border-[#24352D] bg-[#141E1A] p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#7E9187]">Changes Needed</p>
            <p className="mt-1 text-2xl font-black text-[#60A5FA]">{stats.changesRequested}</p>
            <p className="mt-0.5 text-[10px] text-[#60A5FA]/80">Revisions recorded</p>
          </div>

          <div className="rounded-xl border border-[#24352D] bg-[#141E1A] p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#7E9187]">Rejected</p>
            <p className="mt-1 text-2xl font-black text-[#FF5E4D]">{stats.rejected}</p>
            <p className="mt-0.5 text-[10px] text-[#FF5E4D]/80">To be redesigned</p>
          </div>

          <div className="rounded-xl border border-[#24352D] bg-[#141E1A] p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#7E9187]">Illustrations Done</p>
            <p className="mt-1 text-2xl font-black text-white">{stats.completedIllustrations} <span className="text-sm font-normal text-[#63756C]">/ 12</span></p>
            <p className="mt-0.5 text-[10px] text-[#34B56A]">Restaurant Owner live</p>
          </div>

          <div className="rounded-xl border border-[#24352D] bg-[#141E1A] p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#7E9187]">Animations Done</p>
            <p className="mt-1 text-2xl font-black text-white">{stats.completedAnimations} <span className="text-sm font-normal text-[#63756C]">/ 8</span></p>
            <p className="mt-0.5 text-[10px] text-[#34B56A]">QR Scanner live</p>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Assets' },
              { id: 'illustration', label: 'Illustrations (12)' },
              { id: 'animation', label: 'Animations (8)' },
              { id: 'review', label: 'Ready for Review' },
              { id: 'approved', label: 'Approved' },
              { id: 'needs-work', label: 'Revisions / Rejected' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onFilterChange(f.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  selectedFilter === f.id
                    ? 'bg-[#E8783C] text-white shadow-lg shadow-[#E8783C]/20'
                    : 'bg-[#151F1B] text-[#8C9B94] hover:bg-[#1C2B25] hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#63756C]" />
            <input
              type="text"
              placeholder="Search by name, feature..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-lg border border-[#24352D] bg-[#141E1A] py-1.5 pl-9 pr-3 text-xs text-white placeholder-[#63756C] focus:border-[#E8783C] focus:outline-none"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
