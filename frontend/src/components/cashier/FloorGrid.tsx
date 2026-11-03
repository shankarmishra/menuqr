import React from 'react';
import { Plus } from 'lucide-react';
import type { CashierToken } from './UnpaidTokenQueue';

interface FloorGridProps {
  tokens: CashierToken[];
  tables: Array<{ id: string; label: string; sortOrder?: number }>;
  selectedTokenId: string | null;
  onSelectToken: (token: CashierToken) => void;
  onOpenTableBill: (tableNumber: number) => void;
}

export default function FloorGrid({
  tokens,
  tables,
  selectedTokenId,
  onSelectToken,
  onOpenTableBill,
}: FloorGridProps) {
  // If tables list is empty, synthesize tables 1..12 or table numbers from active tokens
  const effectiveTables = React.useMemo(() => {
    if (tables && tables.length > 0) {
      return tables.map((t) => {
        const num = parseInt(t.label.replace(/\D/g, ''), 10);
        return {
          id: t.id,
          label: t.label,
          tableNumber: !isNaN(num) && num > 0 ? num : 1,
        };
      });
    }

    // Auto-generate tables 1..12 + any active token table numbers
    const activeNums = tokens.map((t) => t.tableNumber).filter((n) => n > 0);
    const maxNum = Math.max(12, ...activeNums);
    const generated = [];
    for (let i = 1; i <= Math.min(maxNum, 30); i++) {
      generated.push({
        id: `tbl-${i}`,
        label: `Table ${i}`,
        tableNumber: i,
      });
    }
    return generated;
  }, [tables, tokens]);

  // Map active tokens by table number
  const tokensByTable = React.useMemo(() => {
    const map = new Map<number, CashierToken>();
    tokens.forEach((t) => {
      if (t.tableNumber > 0) {
        map.set(t.tableNumber, t);
      }
    });
    return map;
  }, [tokens]);

  const vacantCount = effectiveTables.filter((t) => !tokensByTable.has(t.tableNumber)).length;
  const occupiedCount = effectiveTables.filter((t) => tokensByTable.has(t.tableNumber)).length;
  const billRequestedCount = tokens.filter((t) => t.status === 'BILL_REQUESTED').length;

  return (
    <div className="flex flex-col gap-4">
      {/* Floor Filter & Legend Chips */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#849a90] uppercase tracking-wider">Floor Status:</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{vacantCount} Vacant</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>{occupiedCount} Occupied</span>
          </span>
          {billRequestedCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
              <span>{billRequestedCount} Bill Requested!</span>
            </span>
          )}
        </div>
      </div>

      {/* Table Tiles Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {effectiveTables.map((tbl) => {
          const activeToken = tokensByTable.get(tbl.tableNumber);
          const isSelected = Boolean(activeToken && activeToken.id === selectedTokenId);
          const isBillRequested = Boolean(activeToken?.status === 'BILL_REQUESTED');

          if (activeToken) {
            // Occupied Table Tile
            return (
              <div
                key={tbl.id}
                onClick={() => onSelectToken(activeToken)}
                className={`relative cursor-pointer rounded-2xl p-3.5 border transition-all flex flex-col justify-between min-h-[115px] select-none ${
                  isSelected
                    ? 'border-[#e8783c] bg-[#e8783c]/15 ring-2 ring-[#e8783c]/30 shadow-lg shadow-[#e8783c]/20'
                    : isBillRequested
                    ? 'border-rose-500 bg-rose-950/30 ring-2 ring-rose-500/40 animate-pulse'
                    : 'border-amber-500/30 bg-[#151c19] hover:border-amber-500/60 hover:bg-[#1a2320]'
                }`}
              >
                {/* Table Header */}
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-white tracking-tight">
                    {tbl.label}
                  </span>
                  {isBillRequested ? (
                    <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-rose-500 text-white shadow-sm">
                      Bill!
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      #{activeToken.tokenNumber}
                    </span>
                  )}
                </div>

                {/* Amount & Items */}
                <div className="my-1.5">
                  <div className="text-base font-black text-white font-mono">
                    ₹{activeToken.total.toFixed(0)}
                  </div>
                  <div className="text-[11px] text-[#849a90]">
                    {activeToken.itemCount} item{activeToken.itemCount !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Footer status */}
                <div className="flex items-center justify-between pt-1 border-t border-[#2a3832]/60 text-[10px]">
                  <span className={isBillRequested ? 'text-rose-400 font-bold' : 'text-amber-400/90 font-medium'}>
                    {isBillRequested ? '🔔 Settle Bill' : '🍽️ Dining'}
                  </span>
                  <span className="text-[#62756d]">Click to pay</span>
                </div>
              </div>
            );
          }

          // Vacant Table Tile
          return (
            <div
              key={tbl.id}
              onClick={() => onOpenTableBill(tbl.tableNumber)}
              className="cursor-pointer rounded-2xl p-3.5 border border-[#2a3832]/80 bg-[#151c19]/50 hover:bg-[#1a2320] hover:border-emerald-500/40 transition-all flex flex-col justify-between min-h-[115px] group select-none"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#849a90] group-hover:text-white transition-colors">
                  {tbl.label}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500/40 group-hover:bg-emerald-400 transition-colors"></span>
              </div>

              <div className="flex flex-col items-center justify-center py-2 text-center text-[#62756d] group-hover:text-emerald-400 transition-colors">
                <Plus size={18} className="mb-0.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                <span className="text-[11px] font-medium">Open Bill</span>
              </div>

              <div className="text-[10px] text-[#62756d] text-center pt-1 border-t border-[#2a3832]/30">
                Vacant
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
