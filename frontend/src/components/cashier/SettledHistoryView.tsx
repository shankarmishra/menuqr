import { useState, useMemo } from 'react';
import {
  Receipt,
  Search,
  ExternalLink,
  Copy,
  Check,
  CreditCard,
  Smartphone,
  Banknote,
  RefreshCw,
} from 'lucide-react';

export interface SettledTokenItem {
  id: string;
  tokenNumber: number;
  tableNumber: number;
  total: number;
  paymentMethod?: string | null;
  settledAt?: string | null;
  items?: Array<{ name: string; quantity: number; totalPrice: number }>;
  billUrl?: string;
}

interface Props {
  settledTokens: SettledTokenItem[];
  loading: boolean;
  onRefresh: () => void;
}

export default function SettledHistoryView({ settledTokens, loading, onRefresh }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState<'ALL' | 'CASH' | 'UPI' | 'CARD'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Financial Summary
  const summary = useMemo(() => {
    let totalRev = 0;
    let cashRev = 0;
    let upiRev = 0;
    let cardRev = 0;

    settledTokens.forEach((t) => {
      const amt = Number(t.total) || 0;
      totalRev += amt;
      const m = (t.paymentMethod || '').toUpperCase();
      if (m === 'CASH') cashRev += amt;
      else if (m === 'UPI') upiRev += amt;
      else if (m === 'CARD') cardRev += amt;
    });

    return {
      count: settledTokens.length,
      totalRev,
      cashRev,
      upiRev,
      cardRev,
    };
  }, [settledTokens]);

  // Filtered List
  const filtered = useMemo(() => {
    return settledTokens.filter((t) => {
      if (filterMethod !== 'ALL') {
        const m = (t.paymentMethod || '').toUpperCase();
        if (m !== filterMethod) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesToken = String(t.tokenNumber).includes(q);
        const matchesTable = String(t.tableNumber).includes(q);
        const matchesId = (t.id || '').toLowerCase().includes(q);
        const matchesItem = (t.items || []).some((it) => it.name.toLowerCase().includes(q));
        return matchesToken || matchesTable || matchesId || matchesItem;
      }
      return true;
    });
  }, [settledTokens, filterMethod, searchQuery]);

  const handleCopy = (id: string, url?: string) => {
    const fullUrl = url
      ? `${window.location.origin}${url}`
      : `${window.location.origin}/bill/${id}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ── Summary Statistics Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Collected */}
        <div className="bg-[#151c19] border border-[#2a3832] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#849a90] text-xs font-semibold">
            <span>Total Collection</span>
            <Receipt size={16} className="text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl md:text-2xl font-black text-white font-mono">
              ₹{summary.totalRev.toFixed(0)}
            </span>
            <span className="text-[11px] text-[#849a90] ml-2">
              ({summary.count} bill{summary.count !== 1 ? 's' : ''})
            </span>
          </div>
        </div>

        {/* Cash Total */}
        <div className="bg-[#151c19] border border-[#2a3832] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#849a90] text-xs font-semibold">
            <span>Cash Collection</span>
            <Banknote size={16} className="text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl md:text-2xl font-black text-emerald-400 font-mono">
              ₹{summary.cashRev.toFixed(0)}
            </span>
          </div>
        </div>

        {/* UPI Total */}
        <div className="bg-[#151c19] border border-[#2a3832] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#849a90] text-xs font-semibold">
            <span>UPI / QR</span>
            <Smartphone size={16} className="text-sky-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl md:text-2xl font-black text-sky-400 font-mono">
              ₹{summary.upiRev.toFixed(0)}
            </span>
          </div>
        </div>

        {/* Card Total */}
        <div className="bg-[#151c19] border border-[#2a3832] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#849a90] text-xs font-semibold">
            <span>Card / POS</span>
            <CreditCard size={16} className="text-purple-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl md:text-2xl font-black text-purple-400 font-mono">
              ₹{summary.cardRev.toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Filters & Search Bar ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#151c19] p-3 rounded-2xl border border-[#2a3832]">
        {/* Method filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilterMethod('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMethod === 'ALL'
                ? 'bg-white text-black'
                : 'bg-[#1d2723] text-[#849a90] hover:text-white border border-[#2a3832]'
            }`}
          >
            All Methods ({settledTokens.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMethod('CASH')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMethod === 'CASH'
                ? 'bg-emerald-500 text-white'
                : 'bg-[#1d2723] text-[#849a90] hover:text-white border border-[#2a3832]'
            }`}
          >
            💵 Cash
          </button>
          <button
            type="button"
            onClick={() => setFilterMethod('UPI')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMethod === 'UPI'
                ? 'bg-sky-500 text-white'
                : 'bg-[#1d2723] text-[#849a90] hover:text-white border border-[#2a3832]'
            }`}
          >
            📱 UPI
          </button>
          <button
            type="button"
            onClick={() => setFilterMethod('CARD')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMethod === 'CARD'
                ? 'bg-purple-500 text-white'
                : 'bg-[#1d2723] text-[#849a90] hover:text-white border border-[#2a3832]'
            }`}
          >
            💳 Card
          </button>
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#849a90]" />
            <input
              type="text"
              placeholder="Search table, token #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1d2723] border border-[#2a3832] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#62756d] focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="button"
            onClick={onRefresh}
            className="p-2 rounded-xl bg-[#1d2723] hover:bg-[#2a3832] border border-[#2a3832] text-[#849a90] hover:text-white transition-colors"
            title="Refresh settled history"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-emerald-400' : ''} />
          </button>
        </div>
      </div>

      {/* ── Settled Tokens List ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-[#151c19]/50 rounded-2xl border border-dashed border-[#2a3832] text-center">
          <Receipt size={32} className="text-[#62756d] mb-2" />
          <p className="text-sm font-semibold text-white">No settled bills found</p>
          <p className="text-xs text-[#849a90] mt-1">
            {searchQuery
              ? 'Try adjusting your search query or filter.'
              : 'Bills settled at the cashier counter today will be preserved here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((item) => {
            const timeStr = item.settledAt
              ? new Date(item.settledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Today';

            const methodUpper = (item.paymentMethod || 'CASH').toUpperCase();
            const methodBadge =
              methodUpper === 'CASH'
                ? { label: 'CASH', bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400', icon: '💵' }
                : methodUpper === 'UPI'
                ? { label: 'UPI', bg: 'bg-sky-500/15 border-sky-500/30 text-sky-400', icon: '📱' }
                : { label: 'CARD', bg: 'bg-purple-500/15 border-purple-500/30 text-purple-400', icon: '💳' };

            return (
              <div
                key={item.id}
                className="bg-[#151c19] border border-[#2a3832] rounded-2xl p-4 flex flex-col justify-between hover:border-[#384a42] transition-colors"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#2a3832]/60">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">
                        Table {item.tableNumber || 'N/A'}
                      </span>
                      <span className="text-[11px] font-mono text-[#849a90] bg-[#1d2723] px-1.5 py-0.5 rounded border border-[#2a3832]">
                        #{item.tokenNumber}
                      </span>
                    </div>

                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${methodBadge.bg}`}>
                      <span>{methodBadge.icon}</span>
                      <span>{methodBadge.label}</span>
                    </span>
                  </div>

                  {/* Amount & Time */}
                  <div className="flex items-baseline justify-between my-2.5">
                    <span className="text-xl font-black text-white font-mono">
                      ₹{Number(item.total).toFixed(0)}
                    </span>
                    <span className="text-[11px] text-[#849a90]">{timeStr}</span>
                  </div>

                  {/* Item Snippet */}
                  {item.items && item.items.length > 0 && (
                    <div className="text-[11px] text-[#849a90] line-clamp-2 leading-relaxed bg-[#1d2723]/60 p-2 rounded-xl mb-3">
                      {item.items.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#2a3832]/60">
                  <a
                    href={item.billUrl || `/bill/${item.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1d2723] hover:bg-[#2a3832] border border-[#2a3832] text-xs font-semibold text-white transition-colors"
                  >
                    <ExternalLink size={12} />
                    <span>Thermal Receipt</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopy(item.id, item.billUrl)}
                    className="px-2.5 py-1.5 rounded-xl bg-[#1d2723] hover:bg-[#2a3832] border border-[#2a3832] text-[#849a90] hover:text-white transition-colors"
                    title="Copy bill link"
                  >
                    {copiedId === item.id ? (
                      <Check size={13} className="text-emerald-400" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
