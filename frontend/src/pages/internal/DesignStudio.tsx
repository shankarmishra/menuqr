import { useState, useMemo } from 'react';
import { useDesignStudioStore } from '../../design-studio/store';
import type { DesignAssetSpec } from '../../design-studio/manifest';
import { StudioHeader } from '../../design-studio/components/StudioHeader';
import { AssetCard } from '../../design-studio/components/AssetCard';
import { AssetDetailModal } from '../../design-studio/components/AssetDetailModal';
import { RevisionModal } from '../../design-studio/components/RevisionModal';
import { AnimationPlayground } from '../../design-studio/components/AnimationPlayground';
import { ConceptComparator } from '../../design-studio/components/ConceptComparator';
import { BenchmarkSingleShowcase } from '../../design-studio/components/BenchmarkSingleShowcase';
import { PosPilotComparator } from '../../design-studio/components/PosPilotComparator';
import { Sparkles, Palette } from 'lucide-react';

export default function DesignStudio() {
  const {
    assets,
    stats,
    requestRevision,
    approveAsset,
    rejectAsset,
    resetAllToManifest,
  } = useDesignStudioStore();

  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'pos-pilot' | 'benchmark' | 'concepts' | 'gallery' | 'playground' | 'provenance'>('pos-pilot');
  const [inspectingAsset, setInspectingAsset] = useState<DesignAssetSpec | null>(null);
  const [revisionModal, setRevisionModal] = useState<{
    asset: DesignAssetSpec;
    mode: 'CHANGES_REQUESTED' | 'REJECTED';
  } | null>(null);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      // Filter by category / status
      if (selectedFilter === 'illustration' && asset.type !== 'illustration') return false;
      if (selectedFilter === 'animation' && asset.type !== 'animation') return false;
      if (selectedFilter === 'review' && asset.status !== 'READY_FOR_REVIEW') return false;
      if (selectedFilter === 'approved' && asset.status !== 'APPROVED') return false;
      if (selectedFilter === 'needs-work' && asset.status !== 'CHANGES_REQUESTED' && asset.status !== 'REJECTED') return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = asset.name.toLowerCase().includes(q);
        const matchesShort = asset.shortTitle.toLowerCase().includes(q);
        const matchesFeature = asset.relatedFeature.toLowerCase().includes(q);
        const matchesId = asset.id.toLowerCase().includes(q);
        return matchesName || matchesShort || matchesFeature || matchesId;
      }

      return true;
    });
  }, [assets, selectedFilter, searchQuery]);

  const handleOpenRevision = (id: string) => {
    const target = assets.find((a) => a.id === id);
    if (target) {
      setRevisionModal({ asset: target, mode: 'CHANGES_REQUESTED' });
    }
  };

  const handleOpenReject = (id: string) => {
    const target = assets.find((a) => a.id === id);
    if (target) {
      setRevisionModal({ asset: target, mode: 'REJECTED' });
    }
  };

  const handleCloseInspect = () => {
    setInspectingAsset(null);
  };

  return (
    <div className="min-h-screen bg-[#0A0F0D] text-white selection:bg-[#E8783C] selection:text-white">
      {/* Studio Header & Stats */}
      <StudioHeader
        stats={stats}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onReset={resetAllToManifest}
      />

      {/* Main Studio Viewport */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        
        {/* Navigation Tabs */}
        <div className="mb-8 flex items-center justify-between border-b border-[#23352C] pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('pos-pilot')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'pos-pilot'
                  ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/25 font-black'
                  : 'text-[#8C9B94] hover:text-white bg-[#141F1A] border border-[#23352C]'
              }`}
            >
              <Sparkles size={14} />
              <span>Phase 5: POS Pilot (3 Concepts)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('benchmark')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'benchmark'
                  ? 'bg-[#10B981] text-black shadow-lg shadow-[#10B981]/20 font-black'
                  : 'text-[#8C9B94] hover:text-white bg-[#141F1A] border border-[#23352C]'
              }`}
            >
              <Sparkles size={14} />
              <span>Benchmark Asset #1 (POS Terminal)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('concepts')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'concepts'
                  ? 'bg-[#E8783C] text-white shadow-lg shadow-[#E8783C]/20'
                  : 'text-[#8C9B94] hover:text-white bg-[#141F1A] border border-[#23352C]'
              }`}
            >
              <Palette size={14} />
              <span>AI Creative Factory (3 Directions)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('gallery')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'gallery'
                  ? 'bg-[#1C2C23] text-white shadow border border-[#2F473B]'
                  : 'text-[#8C9B94] hover:text-white'
              }`}
            >
              Illustration Gallery ({filteredAssets.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('playground')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'playground'
                  ? 'bg-[#1C2C23] text-white shadow border border-[#2F473B]'
                  : 'text-[#8C9B94] hover:text-white'
              }`}
            >
              Motion Playground (8 Assets)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('provenance')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'provenance'
                  ? 'bg-[#1C2C23] text-white shadow border border-[#2F473B]'
                  : 'text-[#8C9B94] hover:text-white'
              }`}
            >
              Tool & Provenance Matrix
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-[#63756C]">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Vite HMR Live</span>
          </div>
        </div>

        {/* ── VIEW -1: BENCHMARK SINGLE SHOWCASE (POS TERMINAL) ── */}
        {activeTab === 'pos-pilot' && (
          <PosPilotComparator />
        )}

        {activeTab === 'benchmark' && (
          <BenchmarkSingleShowcase />
        )}

        {/* ── VIEW 0: AI CREATIVE FACTORY & 3 CONCEPTS COMPARATOR ── */}
        {activeTab === 'concepts' && (
          <ConceptComparator />
        )}

        {/* ── VIEW 1: ASSET GALLERY ── */}
        {activeTab === 'gallery' && (
          <div>
            {filteredAssets.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#24352D] bg-[#101713] p-12 text-center">
                <Sparkles size={36} className="text-[#556D62] mb-3" />
                <h3 className="text-base font-bold text-white">No assets match your search</h3>
                <p className="mt-1 text-xs text-[#8C9B94]">
                  Try adjusting your filter or search query.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAssets.map((asset) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    onInspect={(a) => setInspectingAsset(a)}
                    onApprove={(id) => approveAsset(id)}
                    onRequestChanges={(id) => handleOpenRevision(id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── VIEW 2: MOTION PLAYGROUND ── */}
        {activeTab === 'playground' && (
          <AnimationPlayground />
        )}

        {/* ── VIEW 3: PROVENANCE & COMPLIANCE MATRIX ── */}
        {activeTab === 'provenance' && (
          <div className="rounded-3xl border border-[#23352C] bg-[#101713] p-6 overflow-x-auto">
            <h3 className="text-base font-bold text-white mb-4">
              MENUQR Asset Traceability Matrix (Blueprint Compliance)
            </h3>
            <table className="w-full text-left text-xs text-[#C5D1CB]">
              <thead>
                <tr className="border-b border-[#23352C] text-[#7E9187] font-mono uppercase text-[10px]">
                  <th className="pb-3">Asset ID</th>
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Version</th>
                  <th className="pb-3">Source File</th>
                  <th className="pb-3">Figma Status</th>
                  <th className="pb-3">In Production?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1B2721]">
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-[#141F1A]">
                    <td className="py-3 font-mono font-bold text-white">{asset.id}</td>
                    <td className="py-3">{asset.name}</td>
                    <td className="py-3">
                      <span className="font-mono text-[10px] uppercase text-[#E8783C] bg-[#E8783C]/10 px-1.5 py-0.5 rounded">
                        {asset.type}
                      </span>
                    </td>
                    <td className="py-3 font-bold">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] ${
                          asset.status === 'READY_FOR_REVIEW'
                            ? 'bg-amber-500/20 text-amber-300'
                            : asset.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : asset.status === 'CHANGES_REQUESTED'
                            ? 'bg-blue-500/20 text-blue-300'
                            : 'bg-slate-500/20 text-slate-400'
                        }`}
                      >
                        {asset.status}
                      </span>
                    </td>
                    <td className="py-3 font-mono">v{asset.version}</td>
                    <td className="py-3 font-mono text-[#34B56A] truncate max-w-[200px]">{asset.sourceFile}</td>
                    <td className="py-3 text-[11px] text-[#8C9B94]">{asset.figmaSource}</td>
                    <td className="py-3 font-bold text-amber-400">
                      {asset.integratedInProduction ? 'Yes' : 'No'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Inspect Detail Modal */}
      {inspectingAsset && (
        <AssetDetailModal
          asset={inspectingAsset}
          onClose={handleCloseInspect}
          onApprove={(id) => {
            approveAsset(id);
            const updated = assets.find((a) => a.id === id);
            if (updated) setInspectingAsset({ ...updated, status: 'APPROVED' });
          }}
          onRequestChanges={(id) => {
            handleOpenRevision(id);
            handleCloseInspect();
          }}
          onReject={(id) => {
            handleOpenReject(id);
            handleCloseInspect();
          }}
        />
      )}

      {/* Revision Modal */}
      {revisionModal && (
        <RevisionModal
          asset={revisionModal.asset}
          mode={revisionModal.mode}
          onClose={() => setRevisionModal(null)}
          onSubmit={(feedback) => {
            if (revisionModal.mode === 'REJECTED') {
              rejectAsset(revisionModal.asset.id, feedback);
            } else {
              requestRevision(revisionModal.asset.id, feedback);
            }
            setRevisionModal(null);
          }}
        />
      )}
    </div>
  );
}
