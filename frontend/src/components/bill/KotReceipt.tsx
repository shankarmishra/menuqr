/**
 * KotReceipt.tsx
 * On-screen preview of a Kitchen Order Ticket inside the shared ReceiptPrint frame.
 * The real printout still comes from Orders.tsx (buildKOTPrintHtml); this shows the kitchen
 * the same lines before printing. No prices: a KOT is for cooks, not for the bill.
 */

import ReceiptPrint from './ReceiptPrint';

/** The fields a kitchen ticket needs (both order types in the app satisfy it). */
export interface KotOrder {
  id: string;
  time: string;
  orderType?: string | null;
  tableNumber?: string | null;
  tableSource?: string | null;
  customerName?: string | null;
  notes?: string | null;
  roundNumber?: number | null;
  items: Array<{ id?: string; name: string; quantity: number; variant?: string | null }>;
}

interface Props {
  order: KotOrder;
  restaurantName: string;
  paperWidth: '80mm' | '58mm';
}

export function kotTargetLabel(order: Pick<KotOrder, 'orderType' | 'tableNumber'>): string {
  const type = String(order.orderType || '');
  if (type === 'DELIVERY') return 'DELIVERY';
  if (type === 'TAKEAWAY' || order.tableNumber === 'TAKEAWAY') return 'TAKEAWAY';
  return `TABLE ${order.tableNumber || 'N/A'}`;
}

export default function KotReceipt({ order, restaurantName, paperWidth }: Props) {
  const time = new Date(order.time);
  const timeText = Number.isNaN(time.getTime())
    ? ''
    : `${time.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} · ${time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
  const items = Array.isArray(order.items) ? order.items : [];
  const totalQty = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  return (
    <ReceiptPrint
      ariaLabel="Kitchen order ticket preview"
      machineLabel={`KOT · ${paperWidth}`}
      narrow={paperWidth === '58mm'}
      printKey={order.id}
      showFeedButton={false}
    >
      <div className="text-center mb-1">
        <h1 className="thermal-restaurant-name">{restaurantName || 'KITCHEN'}</h1>
        <p className="thermal-tagline">KITCHEN ORDER TICKET</p>
      </div>
      <hr className="thermal-divider-double" />
      <div className="thermal-meta-row">
        <span>{kotTargetLabel(order)}</span>
        <span className="thermal-token-badge">#{(order.id || '').substring(0, 6).toUpperCase()}</span>
      </div>
      <div className="thermal-meta-sub">
        <span>{timeText}</span>
        <span>{order.roundNumber && order.roundNumber > 1 ? `Round ${order.roundNumber}` : (order.customerName || 'Guest')}</span>
      </div>
      {order.tableSource === 'legacy' && (
        <p className="thermal-tagline" style={{ fontWeight: 700 }}>OLD STICKER · CHECK TABLE</p>
      )}
      <hr className="thermal-divider" />
      <div className="thermal-items-header">
        <span className="thermal-col-qty">QTY</span>
        <span className="thermal-col-name" style={{ gridColumn: 'span 3' }}>ITEM</span>
      </div>
      {items.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#888', fontSize: 11, padding: '10px 0' }}>— No items —</p>
      ) : (
        items.map((item, idx) => (
          <div key={item.id || idx} className="thermal-item-row" style={{ padding: '3px 0' }}>
            <span className="thermal-col-qty" style={{ fontWeight: 700 }}>{item.quantity}</span>
            <span className="thermal-col-name" style={{ gridColumn: 'span 3', fontWeight: 700 }}>
              {item.name}
              {item.variant && (
                <small style={{ display: 'block', fontSize: 10, color: '#555', fontWeight: 400 }}>({item.variant})</small>
              )}
            </span>
          </div>
        ))
      )}
      <hr className="thermal-divider" />
      {order.notes && (
        <div className="thermal-totals">
          <div className="thermal-totals-row" style={{ fontWeight: 700 }}>
            <span>NOTE: {order.notes}</span>
          </div>
        </div>
      )}
      <div className="thermal-grand-total">
        <span>TOTAL QTY</span>
        <span className="thermal-grand-total-amount">{totalQty}</span>
      </div>
    </ReceiptPrint>
  );
}
