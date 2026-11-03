import React from 'react';
import type { DesignAssetSpec, AssetStatus } from '../manifest';
import { AssetRenderer } from './AssetRenderer';
import { Eye, CheckCircle2, Clock, AlertCircle, XCircle, Sparkles } from 'lucide-react';

interface Props {
  asset: DesignAssetSpec;
  onInspect: (asset: DesignAssetSpec) => void;
  onApprove?: (id: string) => void;
  onRequestChanges?: (id: string) => void;
}

const STATUS_BADGE: Record<
  AssetStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  READY_FOR_REVIEW: {
    label: 'Ready for Review',
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    icon: <Sparkles size={11} />,
  },
  APPROVED: {
    label: 'Approved',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    icon: <CheckCircle2 size={11} />,
  },
  CHANGES_REQUESTED: {
    label: 'Changes Requested',
    bg: 'bg-blue-500/15',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    icon: <AlertCircle size={11} />,
  },
  REJECTED: {
    label: 'Rejected',
    bg: 'bg-rose-500/15',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    icon: <XCircle size={11} />,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    bg: 'bg-purple-500/15',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
    icon: <Clock size={11} />,
  },
  NOT_STARTED: {
    label: 'Planned',
    bg: 'bg-slate-500/15',
    text: 'text-slate-400',
    border: 'border-slate-500/30',
    icon: <Clock size={11} />,
  },
};

export const AssetCard: React.FC<Props> = ({
  asset,
  onInspect,
  onApprove,
  onRequestChanges,
}) => {
  const statusInfo = STATUS_BADGE[asset.status];

  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-[#23352C] bg-[#141E1A] shadow-lg transition-all duration-200 hover:border-[#E8783C]/50 hover:shadow-xl hover:shadow-[#E8783C]/5">
      <div>
        {/* Real Live Component Preview */}
        <div className="relative h-56 w-full overflow-hidden rounded-t-xl bg-[#0E1612] flex items-center justify-center p-2 border-b border-[#1E2E25]">
          <AssetRenderer assetId={asset.id} animated={true} />
        </div>

        <div className="p-4 sm:p-5">
          {/* Header Status & Version */}
          <div className="flex items-center justify-between gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
            >
              {statusInfo.icon}
              <span>{statusInfo.label}</span>
            </span>
            <span className="font-mono text-[11px] text-[#6E8278]">v{asset.version}</span>
          </div>

          {/* Title & Description */}
          <h3 className="mt-3 text-base font-bold text-white group-hover:text-[#FFA64D] transition-colors">
            {asset.name}
          </h3>
          <p className="mt-1 text-xs text-[#8C9B94] line-clamp-2">
            {asset.description}
          </p>

          {/* Related Feature */}
          <div className="mt-4 rounded-lg bg-[#0F1713] p-2.5 border border-[#1E2C25]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#5A7366]">Related Feature</p>
            <p className="mt-0.5 text-[11px] font-medium text-[#C5D1CB] truncate">
              {asset.relatedFeature}
            </p>
          </div>

          {/* Source File Traceability */}
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[#6E8278]">
            <span className="truncate max-w-[200px]" title={asset.sourceFile}>
              {asset.sourceFile}
            </span>
            <span className="text-[10px] uppercase font-bold text-[#E8783C] bg-[#E8783C]/10 px-1.5 py-0.5 rounded">
              {asset.type}
            </span>
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="border-t border-[#23352C] p-3 sm:p-4 bg-[#111A16] rounded-b-2xl flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onInspect(asset)}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#1E2E26] px-3 py-2 text-xs font-bold text-[#E6EFEA] hover:bg-[#E8783C] hover:text-white transition-colors"
        >
          <Eye size={13} />
          <span>Inspect & Test</span>
        </button>

        {asset.status === 'READY_FOR_REVIEW' && (
          <div className="flex items-center gap-1.5">
            {onApprove && (
              <button
                type="button"
                onClick={() => onApprove(asset.id)}
                className="rounded-xl bg-emerald-500/20 p-2 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                title="Approve this asset"
              >
                <CheckCircle2 size={15} />
              </button>
            )}
            {onRequestChanges && (
              <button
                type="button"
                onClick={() => onRequestChanges(asset.id)}
                className="rounded-xl bg-amber-500/20 p-2 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-colors"
                title="Request changes"
              >
                <AlertCircle size={15} />
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
};
