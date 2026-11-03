import React, { useState } from 'react';
import type { DesignAssetSpec } from '../manifest';
import { AssetRenderer } from './AssetRenderer';
import {
  X,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Smartphone,
  Tablet,
  Monitor,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Copy,
  Check,
  Palette,
  Clock,
  Layers,
  Play,
  Pause,
} from 'lucide-react';

interface Props {
  asset: DesignAssetSpec;
  onClose: () => void;
  onApprove: (id: string) => void;
  onRequestChanges: (id: string) => void;
  onReject: (id: string) => void;
}

export const AssetDetailModal: React.FC<Props> = ({
  asset,
  onClose,
  onApprove,
  onRequestChanges,
  onReject,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'svg' | 'react' | 'specs' | 'history'>('preview');
  const [canvasBg, setCanvasBg] = useState<'emerald' | 'parchment' | 'neutral'>('emerald');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isAnimated, setIsAnimated] = useState<boolean>(true);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Raw SVG code sample for IllusRestaurantOwner
  const rawSvgCode = `<!-- MENUQR Asset: ${asset.name} (v${asset.version}) -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" width="100%" height="auto">
  <defs>
    <linearGradient id="mq-owner-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#151C19" />
      <stop offset="50%" stop-color="#1B2621" />
      <stop offset="100%" stop-color="#111714" />
    </linearGradient>
    <linearGradient id="mq-owner-saffron-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFA64D" />
      <stop offset="60%" stop-color="#E8783C" />
      <stop offset="100%" stop-color="#C05E2B" />
    </linearGradient>
  </defs>
  <rect width="500" height="400" rx="20" fill="url(#mq-owner-bg-grad)" />
  <!-- Character & Tablet & Architectural Archway -->
  <!-- View full code in ${asset.sourceFile} -->
</svg>`;

  const reactSnippet = `import { ${asset.componentName} } from '@/components/illustrations';

export function RestaurantDashboard() {
  return (
    <div className="w-full max-w-lg mx-auto">
      <${asset.componentName} 
        size="responsive" 
        theme="${canvasBg}" 
        animated={${isAnimated}} 
      />
    </div>
  );
}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const viewportWidthClass = {
    desktop: 'max-w-2xl w-full',
    tablet: 'max-w-[420px] w-full',
    mobile: 'max-w-[300px] w-full',
  }[viewportMode];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-6 backdrop-blur-md animate-in fade-in duration-200">
      <div className="flex h-full max-h-[92vh] w-full max-w-6xl flex-col rounded-3xl border border-[#2B3F34] bg-[#0E1512] shadow-2xl overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-[#23352C] bg-[#121B17] px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-[#E8783C] bg-[#E8783C]/10 px-2 py-1 rounded">
              {asset.id}
            </span>
            <div>
              <h2 className="text-lg font-black text-white sm:text-xl flex items-center gap-2">
                {asset.name}
                <span className="text-xs font-mono text-[#7D9186] font-normal">v{asset.version}</span>
              </h2>
              <p className="text-xs text-[#8C9B94]">{asset.relatedFeature}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Action Buttons */}
            {asset.status === 'READY_FOR_REVIEW' && (
              <>
                <button
                  type="button"
                  onClick={() => onApprove(asset.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/20 px-3.5 py-1.5 text-xs font-bold text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-colors"
                >
                  <CheckCircle2 size={14} />
                  <span>Approve Asset</span>
                </button>
                <button
                  type="button"
                  onClick={() => onRequestChanges(asset.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/20 px-3.5 py-1.5 text-xs font-bold text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors"
                >
                  <AlertCircle size={14} />
                  <span>Request Changes</span>
                </button>
                <button
                  type="button"
                  onClick={() => onReject(asset.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500/20 px-3 py-1.5 text-xs font-bold text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-colors"
                >
                  <XCircle size={14} />
                  <span>Reject</span>
                </button>
              </>
            )}

            {asset.status === 'APPROVED' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 size={13} />
                <span>Approved</span>
              </span>
            )}

            {asset.status === 'CHANGES_REQUESTED' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-bold text-blue-400 border border-blue-500/30">
                <AlertCircle size={13} />
                <span>Changes Requested</span>
              </span>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-[#7D9186] hover:bg-[#1C2A24] hover:text-white transition-colors"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#23352C] bg-[#101713] px-6">
          {[
            { id: 'preview', label: 'Interactive Canvas' },
            { id: 'specs', label: 'Provenance & Specs' },
            { id: 'svg', label: 'SVG Source' },
            { id: 'react', label: 'React Component' },
            { id: 'history', label: `Revisions (${asset.revisions.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`border-b-2 px-4 py-3 text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'border-[#E8783C] text-[#E8783C]'
                  : 'border-transparent text-[#7D9186] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'preview' && (
            <div className="flex flex-col gap-6">
              {/* Canvas Controls Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#23352C] bg-[#121B17] p-3">
                {/* Background Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#7D9186]">Canvas:</span>
                  <div className="flex items-center gap-1 rounded-xl bg-[#0B100E] p-1 border border-[#1E2D25]">
                    <button
                      type="button"
                      onClick={() => setCanvasBg('emerald')}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                        canvasBg === 'emerald' ? 'bg-[#1C2B24] text-white' : 'text-[#7D9186] hover:text-white'
                      }`}
                    >
                      <span className="h-3 w-3 rounded-full bg-[#151C19] border border-[#3A4F44]" />
                      <span>Obsidian</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCanvasBg('parchment')}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                        canvasBg === 'parchment' ? 'bg-[#1C2B24] text-white' : 'text-[#7D9186] hover:text-white'
                      }`}
                    >
                      <span className="h-3 w-3 rounded-full bg-[#FAFAF7] border border-gray-400" />
                      <span>Parchment</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCanvasBg('neutral')}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                        canvasBg === 'neutral' ? 'bg-[#1C2B24] text-white' : 'text-[#7D9186] hover:text-white'
                      }`}
                    >
                      <span className="h-3 w-3 rounded-full bg-[#26332E] border border-[#3E534A]" />
                      <span>Slate</span>
                    </button>
                  </div>
                </div>

                {/* Viewport Sizing */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#7D9186]">Device:</span>
                  <div className="flex items-center gap-1 rounded-xl bg-[#0B100E] p-1 border border-[#1E2D25]">
                    <button
                      type="button"
                      onClick={() => setViewportMode('desktop')}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                        viewportMode === 'desktop' ? 'bg-[#E8783C] text-white' : 'text-[#7D9186] hover:text-white'
                      }`}
                    >
                      <Monitor size={13} />
                      <span>Desktop</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewportMode('tablet')}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                        viewportMode === 'tablet' ? 'bg-[#E8783C] text-white' : 'text-[#7D9186] hover:text-white'
                      }`}
                    >
                      <Tablet size={13} />
                      <span>Tablet (380px)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewportMode('mobile')}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                        viewportMode === 'mobile' ? 'bg-[#E8783C] text-white' : 'text-[#7D9186] hover:text-white'
                      }`}
                    >
                      <Smartphone size={13} />
                      <span>Mobile (280px)</span>
                    </button>
                  </div>
                </div>

                {/* Zoom & Motion Toggles */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAnimated(!isAnimated)}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-bold transition-colors ${
                      isAnimated
                        ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
                        : 'border-[#23352C] bg-[#16221C] text-[#7D9186]'
                    }`}
                  >
                    {isAnimated ? <Play size={12} /> : <Pause size={12} />}
                    <span>{isAnimated ? 'Motion ON' : 'Motion OFF'}</span>
                  </button>

                  <div className="flex items-center gap-1 rounded-xl bg-[#0B100E] p-1 border border-[#1E2D25]">
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
                      className="rounded p-1 text-[#7D9186] hover:text-white"
                      title="Zoom Out"
                    >
                      <ZoomOut size={13} />
                    </button>
                    <span className="px-1 text-[11px] font-mono text-white">{zoomLevel}%</span>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.min(180, z + 15))}
                      className="rounded p-1 text-[#7D9186] hover:text-white"
                      title="Zoom In"
                    >
                      <ZoomIn size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomLevel(100)}
                      className="rounded p-1 text-[#7D9186] hover:text-white"
                      title="Reset Zoom"
                    >
                      <RotateCcw size={12} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Central Interactive Preview Screen */}
              <div
                className={`flex min-h-[440px] items-center justify-center rounded-3xl border border-[#23352C] p-8 transition-all overflow-hidden ${
                  canvasBg === 'emerald'
                    ? 'bg-[#151C19]'
                    : canvasBg === 'parchment'
                    ? 'bg-[#FAFAF7]'
                    : 'bg-[#26332E]'
                }`}
              >
                <div
                  className={`transition-all duration-300 ${viewportWidthClass}`}
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center' }}
                >
                  <AssetRenderer
                    assetId={asset.id}
                    theme={canvasBg}
                    animated={isAnimated}
                    speed={1}
                    loop={true}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Asset Provenance & Architecture */}
              <div className="rounded-2xl border border-[#23352C] bg-[#121B17] p-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#FFA64D] flex items-center gap-2">
                  <Layers size={14} />
                  <span>Provenance & Engineering Specs</span>
                </h3>

                <dl className="mt-4 space-y-3 text-xs">
                  <div className="flex justify-between border-b border-[#1E2E26] pb-2">
                    <dt className="text-[#7D9186]">Asset ID:</dt>
                    <dd className="font-mono font-bold text-white">{asset.id}</dd>
                  </div>
                  <div className="flex justify-between border-b border-[#1E2E26] pb-2">
                    <dt className="text-[#7D9186]">Source File:</dt>
                    <dd className="font-mono text-[#34B56A] truncate max-w-[280px]">{asset.sourceFile}</dd>
                  </div>
                  <div className="flex justify-between border-b border-[#1E2E26] pb-2">
                    <dt className="text-[#7D9186]">Component Name:</dt>
                    <dd className="font-mono font-bold text-white">{asset.componentName}</dd>
                  </div>
                  <div className="flex justify-between border-b border-[#1E2E26] pb-2">
                    <dt className="text-[#7D9186]">Creation Method:</dt>
                    <dd className="font-semibold text-[#FFA64D]">{asset.creationMethod}</dd>
                  </div>
                  <div className="flex justify-between border-b border-[#1E2E26] pb-2">
                    <dt className="text-[#7D9186]">Figma Status:</dt>
                    <dd className="text-right text-[#C5D1CB] max-w-[260px]">{asset.figmaSource}</dd>
                  </div>
                  <div className="flex justify-between border-b border-[#1E2E26] pb-2">
                    <dt className="text-[#7D9186]">Export Formats:</dt>
                    <dd className="font-mono text-white">{asset.exportFormats.join(', ')}</dd>
                  </div>
                  <div className="flex justify-between border-b border-[#1E2E26] pb-2">
                    <dt className="text-[#7D9186]">Production Integrated:</dt>
                    <dd className="font-bold text-amber-400">
                      {asset.integratedInProduction ? 'Yes' : 'No (Pending Review)'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#7D9186]">Target Routes:</dt>
                    <dd className="font-mono text-white">{asset.targetPages.join(', ')}</dd>
                  </div>
                </dl>
              </div>

              {/* Design Tokens & Colors */}
              <div className="rounded-2xl border border-[#23352C] bg-[#121B17] p-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#FFA64D] flex items-center gap-2">
                  <Palette size={14} />
                  <span>Design Tokens & Palette Harmony</span>
                </h3>

                <div className="mt-4 space-y-2.5">
                  {asset.colorTokens.map((token) => (
                    <div
                      key={token.name}
                      className="flex items-center justify-between rounded-xl bg-[#0F1713] p-2.5 border border-[#1E2C25]"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-7 w-7 rounded-lg border border-white/20 shadow-sm"
                          style={{ backgroundColor: token.hex }}
                        />
                        <div>
                          <p className="text-xs font-bold text-white">{token.name}</p>
                          <p className="text-[10px] text-[#7D9186]">{token.role}</p>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#C5D1CB]">{token.hex}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'svg' && (
            <div className="rounded-2xl border border-[#23352C] bg-[#121B17] p-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#23352C]">
                <p className="text-xs font-bold uppercase tracking-wider text-[#7D9186]">
                  Production SVG XML (Vector Source)
                </p>
                <button
                  type="button"
                  onClick={() => copyToClipboard(rawSvgCode)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#1E2E26] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#E8783C] transition-colors"
                >
                  {copiedCode ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copiedCode ? 'Copied!' : 'Copy SVG'}</span>
                </button>
              </div>
              <pre className="mt-4 max-h-[380px] overflow-x-auto rounded-xl bg-[#0B100E] p-4 font-mono text-xs text-[#9BB1A6] leading-relaxed">
                {rawSvgCode}
              </pre>
            </div>
          )}

          {activeTab === 'react' && (
            <div className="rounded-2xl border border-[#23352C] bg-[#121B17] p-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#23352C]">
                <p className="text-xs font-bold uppercase tracking-wider text-[#7D9186]">
                  React Component Import & Usage
                </p>
                <button
                  type="button"
                  onClick={() => copyToClipboard(reactSnippet)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#1E2E26] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#E8783C] transition-colors"
                >
                  {copiedCode ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copiedCode ? 'Copied!' : 'Copy React Code'}</span>
                </button>
              </div>
              <pre className="mt-4 max-h-[380px] overflow-x-auto rounded-xl bg-[#0B100E] p-4 font-mono text-xs text-[#9BB1A6] leading-relaxed">
                {reactSnippet}
              </pre>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="rounded-2xl border border-[#23352C] bg-[#121B17] p-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#FFA64D] flex items-center gap-2">
                <Clock size={14} />
                <span>Revision & Feedback Audit Trail</span>
              </h3>

              <div className="mt-4 divide-y divide-[#1E2E26]">
                {asset.revisions.length === 0 ? (
                  <p className="py-4 text-xs text-[#7D9186]">No previous revisions recorded.</p>
                ) : (
                  asset.revisions.map((rev) => (
                    <div key={rev.id} className="py-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-white">v{rev.version} · {rev.action}</span>
                        <span className="text-[11px] text-[#7D9186]">
                          {new Date(rev.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#C5D1CB]">{rev.feedback}</p>
                      <p className="mt-1 text-[10px] text-[#63756C]">Recorded by: {rev.author}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
