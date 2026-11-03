import React, { useState } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';
import type { DesignAssetSpec } from '../manifest';

interface Props {
  asset: DesignAssetSpec;
  mode: 'CHANGES_REQUESTED' | 'REJECTED';
  onClose: () => void;
  onSubmit: (feedback: string) => void;
}

export const RevisionModal: React.FC<Props> = ({
  asset,
  mode,
  onClose,
  onSubmit,
}) => {
  const [feedback, setFeedback] = useState('');

  const isReject = mode === 'REJECTED';

  const defaultPlaceholder = isReject
    ? 'State the fundamental reason for rejection (e.g., style mismatch, wrong concept, unacceptable proportions)...'
    : 'Example: Make the restaurant owner more professional, reduce head size, improve tablet detailing and use the MENUQR emerald palette...';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    onSubmit(feedback.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl border border-[#2B3F34] bg-[#0E1512] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#23352C] pb-4">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-lg p-2 ${
                isReject ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              <AlertCircle size={18} />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">
                {isReject ? 'Reject Design Asset' : 'Request Asset Revisions'}
              </h3>
              <p className="text-xs text-[#8C9B94]">{asset.name} (v{asset.version})</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#7D9186] hover:bg-[#1C2A24] hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="feedback-text" className="block text-xs font-bold uppercase tracking-wider text-[#A0B4AA]">
              {isReject ? 'Rejection Rationale:' : 'Detailed Revision Instructions:'}
            </label>
            <p className="mt-0.5 text-[11px] text-[#63756C]">
              Your feedback will be recorded in the local project audit manifest and used for the next design iteration.
            </p>
            <textarea
              id="feedback-text"
              rows={5}
              required
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={defaultPlaceholder}
              className="mt-2 w-full rounded-xl border border-[#24352D] bg-[#141E1A] p-3 text-xs text-white placeholder-[#5A7366] focus:border-[#E8783C] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#24352D] px-4 py-2 text-xs font-semibold text-[#8C9B94] hover:bg-[#16221C] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-lg transition-colors ${
                isReject
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                  : 'bg-[#E8783C] hover:bg-[#D6672B] shadow-[#E8783C]/20'
              }`}
            >
              <Send size={13} />
              <span>{isReject ? 'Submit Rejection' : 'Submit Revisions'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
