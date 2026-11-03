/**
 * UnpaidTokenQueue.tsx
 * Displays list of UNPAID tokens for the cashier.
 * Highlights the selected token.
 * SSE-driven — parent should push updates via onTokensChange.
 */

export interface CashierToken {
  id: string;
  tokenNumber: number;
  tableNumber: number;
  total: number;         // rupees
  itemCount: number;
  createdAt: string;
  status: 'UNPAID' | 'PAID' | 'VOID' | 'BILL_REQUESTED' | 'ORDERING' | 'DINING' | 'SETTLED' | 'ISSUED' | 'CLOSED';
}

interface Props {
  tokens: CashierToken[];
  selectedId: string | null;
  onSelect: (token: CashierToken) => void;
  loading: boolean;
}

function timeAgo(iso: string): string {
  try {
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins === 1) return '1 min ago';
    if (mins < 60) return `${mins} mins ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m ago`;
  } catch {
    return '';
  }
}

export default function UnpaidTokenQueue({ tokens, selectedId, onSelect, loading }: Props) {
  if (loading) {
    return (
      <div style={{ padding: '32px 0', textAlign: 'center', color: '#6b7280' }}>
        <div style={{
          width: 28, height: 28, border: '3px solid rgba(232,120,60,0.2)',
          borderTopColor: '#e8783c', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 12px',
        }} />
        <p style={{ fontSize: 13 }}>Loading tokens…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const unpaid = tokens.filter(t => t.status === 'UNPAID');

  if (unpaid.length === 0) {
    return (
      <div style={{
        padding: '40px 24px',
        textAlign: 'center',
        color: '#4b5563',
        border: '1.5px dashed rgba(255,255,255,0.08)',
        borderRadius: 12,
      }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
        <p style={{ fontWeight: 600, color: '#aab7b2', fontSize: 14 }}>All clear!</p>
        <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>No pending tokens right now.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {unpaid.map((token) => {
        const isSelected = token.id === selectedId;
        return (
          <button
            key={token.id}
            type="button"
            onClick={() => onSelect(token)}
            aria-pressed={isSelected}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: isSelected
                ? 'linear-gradient(90deg, rgba(232,120,60,0.15), rgba(232,120,60,0.06))'
                : '#1d2723',
              border: isSelected
                ? '1.5px solid rgba(232,120,60,0.5)'
                : '1.5px solid rgba(255,255,255,0.07)',
              borderLeft: isSelected ? '4px solid #e8783c' : '4px solid transparent',
              borderRadius: 10,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
              width: '100%',
            }}
          >
            {/* Left: token badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                background: isSelected ? '#e8783c' : '#2d3c35',
                color: isSelected ? '#fff' : '#aab7b2',
                borderRadius: 8,
                padding: '6px 10px',
                fontFamily: 'Courier Prime, Courier New, monospace',
                fontWeight: 700,
                fontSize: 14,
                minWidth: 48,
                textAlign: 'center',
                lineHeight: 1.2,
              }}>
                <div style={{ fontSize: 10, opacity: 0.7 }}>TOKEN</div>
                <div>#{String(token.tokenNumber).padStart(3, '0')}</div>
              </div>

              <div>
                <p style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#fcfaf8',
                  marginBottom: 2,
                }}>
                  Table {token.tableNumber}
                </p>
                <p style={{ fontSize: 11, color: '#6b7280' }}>
                  {token.itemCount} item{token.itemCount !== 1 ? 's' : ''} · {timeAgo(token.createdAt)}
                </p>
              </div>
            </div>

            {/* Right: total + unpaid badge */}
            <div style={{ textAlign: 'right' }}>
              <p style={{
                fontSize: 15,
                fontWeight: 700,
                color: isSelected ? '#e8783c' : '#fcfaf8',
                fontFamily: 'Courier Prime, Courier New, monospace',
              }}>
                ₹{token.total.toFixed(2)}
              </p>
              <span style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.08em',
                background: '#fef3c7',
                color: '#92400e',
                borderRadius: 4,
                padding: '1px 5px',
                textTransform: 'uppercase',
              }}>
                UNPAID
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
