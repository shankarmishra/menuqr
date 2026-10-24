import { useEffect, useState, useRef } from 'react';
import { 
  Clock, 
  Check, 
  ChefHat, 
  CheckCircle2, 
  RefreshCw, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Copy, 
  CheckCheck, 
  UtensilsCrossed, 
  Bike, 
  X, 
  Volume2, 
  VolumeX, 
  AlertTriangle,
  Search,
  ArrowUpDown
} from 'lucide-react';
import { useToast } from '../../components/feedback/ToastProvider';
import { getOrders, updateOrderStatus, updateOrderEstimatedTime } from './appStore';

export type CustomerOrder = {
  id: string;
  orderType: 'DINE_IN' | 'DELIVERY';
  tableNumber?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  deliveryAddress?: string | null;
  deliveryLandmark?: string | null;
  deliveryCity?: string | null;
  notes?: string | null;
  items: Array<{ id: string; name: string; quantity: number; price: number; variant?: string; addons?: Array<{ id: string; name: string; price: number }>; addonTotal?: number }>;
  total: number;
  status: 'NEW' | 'ACCEPTED' | 'PREPARING' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
  rejectionReason?: string | null;
  time: string;
  estimatedTimeMinutes?: number | null;
  estimatedDeliveryTime?: string | null;
};

// Web Audio API chime generator (no external files needed)
function playNewOrderSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    
    // First tone (587 Hz - D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Second higher tone (880 Hz - A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.frequency.setValueAtTime(880, now + 0.14);
    gain2.gain.setValueAtTime(0.22, now + 0.14);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.14);
    osc2.stop(now + 0.55);
  } catch {
    // Ignore audio permission errors
  }
}

export default function Orders() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [updatingId, setUpdatingId] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'DINE_IN' | 'DELIVERY'>('ALL');
  const [mobileStage, setMobileStage] = useState<'ALL' | 'NEW' | 'COOKING' | 'READY' | 'DONE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST_PENDING'>('NEWEST');
  const [audioEnabled, setAudioEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('menuqr_order_sound');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [rejectingOrder, setRejectingOrder] = useState<CustomerOrder | null>(null);
  const [rejectReason, setRejectReason] = useState('Kitchen busy / High order volume');
  const [copiedId, setCopiedId] = useState('');
  const [orderTimes, setOrderTimes] = useState<Record<string, number>>({});
  const [timeAdjustOrder, setTimeAdjustOrder] = useState<CustomerOrder | null>(null);
  const [adjustMinutes, setAdjustMinutes] = useState<number>(30);
  const [isUpdatingTime, setIsUpdatingTime] = useState(false);
  const [isSseConnected, setIsSseConnected] = useState(false);
  
  const knownOrderIds = useRef<Set<string>>(new Set());
  const initialLoadDone = useRef(false);
  const audioEnabledRef = useRef(audioEnabled);
  const showToast = useToast();

  useEffect(() => {
    audioEnabledRef.current = audioEnabled;
  }, [audioEnabled]);

  const toggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    try {
      localStorage.setItem('menuqr_order_sound', String(next));
    } catch {
      // Ignore storage errors
    }
    if (next) playNewOrderSound();
  };

  const fetchOrders = async (silent = false) => {
    try {
      const data = await getOrders();
      
      // Check for newly arrived orders to ring notification bell
      if (initialLoadDone.current && audioEnabledRef.current) {
        const hasBrandNew = data.some((o: CustomerOrder) => o.status === 'NEW' && !knownOrderIds.current.has(o.id));
        if (hasBrandNew) {
          playNewOrderSound();
          showToast('info', '🔔 New customer order received!');
        }
      }

      data.forEach((o: CustomerOrder) => knownOrderIds.current.add(o.id));
      initialLoadDone.current = true;

      setOrders(data);
      setLoadFailed(false);
    } catch {
      if (!silent && !orders.length) setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  };

  // Real-Time Server-Sent Events (SSE) order stream (Zero Polling)
  useEffect(() => {
    let isMounted = true;
    fetchOrders();

    let eventSource: EventSource | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    const connectSSE = () => {
      if (!isMounted) return;
      try {
        eventSource = new EventSource('/api/app/orders/stream', { withCredentials: true });

        eventSource.onopen = () => {
          if (isMounted) setIsSseConnected(true);
        };

        eventSource.addEventListener('connected', () => {
          if (isMounted) setIsSseConnected(true);
        });

        eventSource.addEventListener('new_order', (e: MessageEvent) => {
          if (!isMounted) return;
          try {
            const newOrder: CustomerOrder = JSON.parse(e.data);
            if (!knownOrderIds.current.has(newOrder.id)) {
              knownOrderIds.current.add(newOrder.id);
              setOrders(prev => [newOrder, ...prev.filter(o => o.id !== newOrder.id)]);
              if (audioEnabledRef.current) {
                playNewOrderSound();
              }
              const label = newOrder.tableNumber ? `Table ${newOrder.tableNumber}` : 'Online Delivery';
              showToast('info', `🔔 New Order #${newOrder.id.substring(0, 6)} (${label})`);
            }
          } catch (err) {
            console.warn('[SSE] Failed to parse new_order payload:', err);
          }
        });

        eventSource.addEventListener('order_status_updated', (e: MessageEvent) => {
          if (!isMounted) return;
          try {
            const updated: CustomerOrder = JSON.parse(e.data);
            setOrders(prev => prev.map(o => o.id === updated.id ? { ...o, ...updated } : o));
          } catch (err) {
            console.warn('[SSE] Failed to parse order_status_updated payload:', err);
          }
        });

        eventSource.addEventListener('order_time_updated', (e: MessageEvent) => {
          if (!isMounted) return;
          try {
            const updated: CustomerOrder = JSON.parse(e.data);
            setOrders(prev => prev.map(o => o.id === updated.id ? { ...o, ...updated } : o));
          } catch (err) {
            console.warn('[SSE] Failed to parse order_time_updated payload:', err);
          }
        });

        eventSource.onerror = () => {
          if (isMounted) setIsSseConnected(false);
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          if (isMounted) {
            reconnectTimeout = setTimeout(connectSSE, 5000);
          }
        };
      } catch (err) {
        if (isMounted) setIsSseConnected(false);
        console.warn('[SSE] Connection error:', err);
      }
    };

    connectSSE();

    // Relaxed background sync: every 60s as a fallback safety net (instead of aggressive 6s polling)
    const interval = setInterval(() => {
      if (isMounted) fetchOrders(true);
    }, 60000);

    const onFocus = () => {
      if (isMounted) fetchOrders(true);
    };
    window.addEventListener('focus', onFocus);

    return () => {
      isMounted = false;
      if (eventSource) eventSource.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: CustomerOrder['status'], reason?: string, estimatedMinutes?: number) => {
    setUpdatingId(id);
    try {
      await updateOrderStatus(id, newStatus, reason, estimatedMinutes);
      await fetchOrders(true);
      showToast('success', `Order #${id.substring(0, 6)} updated to ${newStatus.replace('_', ' ').toLowerCase()}.`);
      if (rejectingOrder) setRejectingOrder(null);
    } catch (err: any) {
      showToast('error', err?.message || 'Could not update order status. Please try again.');
    } finally {
      setUpdatingId('');
    }
  };

  const handleAdjustTime = async () => {
    if (!timeAdjustOrder) return;
    setIsUpdatingTime(true);
    try {
      await updateOrderEstimatedTime(timeAdjustOrder.id, adjustMinutes);
      await fetchOrders(true);
      showToast('success', `Order #${timeAdjustOrder.id.substring(0, 6)} estimated time updated to ~${adjustMinutes} mins.`);
      setTimeAdjustOrder(null);
    } catch (err: any) {
      showToast('error', err?.message || 'Could not update delivery time.');
    } finally {
      setIsUpdatingTime(false);
    }
  };

  const copyAddress = (orderId: string, addressText: string) => {
    navigator.clipboard.writeText(addressText);
    setCopiedId(orderId);
    showToast('info', 'Address copied to clipboard!');
    setTimeout(() => setCopiedId(''), 2500);
  };

  // Filter orders by service type and search query
  const query = searchQuery.trim().toLowerCase();
  const filteredOrders = orders.filter(o => {
    if (filterType === 'DINE_IN' && o.orderType !== 'DINE_IN') return false;
    if (filterType === 'DELIVERY' && o.orderType !== 'DELIVERY') return false;

    if (query) {
      const matchesId = (o.id || '').toLowerCase().includes(query);
      const matchesTable = (o.tableNumber || '').toLowerCase().includes(query);
      const matchesName = (o.customerName || '').toLowerCase().includes(query);
      const matchesPhone = (o.customerPhone || '').toLowerCase().includes(query);
      const matchesItem = (o.items || []).some(it => (it.name || '').toLowerCase().includes(query));
      return matchesId || matchesTable || matchesName || matchesPhone || matchesItem;
    }
    return true;
  });

  // Sort orders
  filteredOrders.sort((a, b) => {
    const timeA = new Date(a.time).getTime();
    const timeB = new Date(b.time).getTime();
    if (sortOrder === 'OLDEST_PENDING') {
      // Prioritize pending orders oldest first
      const isPendingA = ['NEW', 'ACCEPTED', 'PREPARING', 'IN_PROGRESS'].includes(a.status);
      const isPendingB = ['NEW', 'ACCEPTED', 'PREPARING', 'IN_PROGRESS'].includes(b.status);
      if (isPendingA && !isPendingB) return -1;
      if (!isPendingA && isPendingB) return 1;
      return timeA - timeB;
    }
    return timeB - timeA;
  });

  const newOrders = filteredOrders.filter(o => o.status === 'NEW');
  const inProgressOrders = filteredOrders.filter(o => o.status === 'ACCEPTED' || o.status === 'PREPARING' || o.status === 'IN_PROGRESS');
  const readyOrders = filteredOrders.filter(o => o.status === 'READY');
  const completedOrders = filteredOrders.filter(o => o.status === 'COMPLETED' || o.status === 'DELIVERED');

  const dineInCount = orders.filter(o => o.orderType === 'DINE_IN').length;
  const deliveryCount = orders.filter(o => o.orderType === 'DELIVERY').length;

  const OrderCard = ({ order }: { order: CustomerOrder }) => {
    const timeFormatted = new Date(order.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isDelivery = order.orderType === 'DELIVERY';
    const fullAddress = [order.deliveryAddress, order.deliveryLandmark, order.deliveryCity].filter(Boolean).join(', ');
    
    // Normalize phone number for safe WhatsApp link (avoid duplicate country code)
    const rawDigits = (order.customerPhone || '').replace(/\D/g, '');
    const waNumber = rawDigits.startsWith('91') && rawDigits.length === 12
      ? rawDigits
      : rawDigits.length === 10
      ? `91${rawDigits}`
      : rawDigits;

    return (
      <div className={`bg-[#151c19] rounded-2xl p-5 border flex flex-col gap-4 shadow-xl transition-all duration-200 ${
        order.status === 'NEW' 
          ? 'border-[#e8783c]/50 ring-1 ring-[#e8783c]/30 hover:border-[#e8783c]' 
          : 'border-[#2a3832] hover:border-[#384a42]'
      }`}>
        {/* Header: Service Type & Order ID */}
        <div className="flex justify-between items-start border-b border-[#2a3832] pb-3.5">
          <div>
            {isDelivery ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 font-extrabold text-xs uppercase tracking-wider">
                <Bike size={14} />
                <span>Delivery Order</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#e8783c]/15 border border-[#e8783c]/30 text-[#e8783c] font-black text-xs uppercase tracking-wider">
                <UtensilsCrossed size={14} />
                <span>Table: {order.tableNumber || 'N/A'}</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-[#849a90] text-xs font-mono font-bold">#{order.id}</div>
            <div className="text-xs text-[#62756d] flex items-center gap-1 justify-end mt-0.5">
              <Clock size={12} className="text-[#849a90]" /> {timeFormatted}
            </div>
          </div>
        </div>

        {/* Customer Information & Quick Action Buttons */}
        <div className="bg-[#1a2320] p-3 rounded-xl border border-[#2a3832]/60 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-white font-bold text-sm">
              <span className="text-[#849a90]">Customer:</span>
              <span>{order.customerName || 'Walk-in Guest'}</span>
            </div>
            {order.customerPhone && (
              <div className="flex items-center gap-1.5">
                <a
                  href={`tel:${order.customerPhone}`}
                  title="Call Customer"
                  className="p-1.5 rounded-lg bg-[#24332d] hover:bg-[#2e4039] text-emerald-400 transition-colors"
                  aria-label={`Call customer at ${order.customerPhone}`}
                >
                  <Phone size={13} />
                </a>
                <a
                  href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi ${order.customerName || ''}, greeting from the restaurant regarding your order #${order.id}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Chat on WhatsApp"
                  className="p-1.5 rounded-lg bg-[#24332d] hover:bg-[#2e4039] text-green-400 transition-colors"
                  aria-label={`WhatsApp customer at ${order.customerPhone}`}
                >
                  <MessageSquare size={13} />
                </a>
              </div>
            )}
          </div>

          {order.customerPhone && (
            <div className="text-xs text-[#849a90] font-mono">
              Phone: <span className="text-white font-medium">{order.customerPhone}</span>
            </div>
          )}

          {/* Delivery Address block */}
          {isDelivery && fullAddress && (
            <div className="mt-1 pt-2 border-t border-[#2a3832]/60 flex items-start justify-between gap-2">
              <div className="text-xs text-slate-300 leading-snug">
                <span className="text-[#849a90] font-semibold flex items-center gap-1 mb-0.5">
                  <MapPin size={12} className="text-sky-400 shrink-0" /> Delivery Address:
                </span>
                <span>{fullAddress}</span>
              </div>
              <button
                type="button"
                onClick={() => copyAddress(order.id, fullAddress)}
                title="Copy Address"
                className="p-1.5 rounded-lg bg-[#24332d] hover:bg-[#2e4039] text-[#849a90] hover:text-white transition-colors shrink-0"
                aria-label="Copy delivery address"
              >
                {copiedId === order.id ? <CheckCheck size={13} className="text-emerald-400" /> : <Copy size={13} />}
              </button>
            </div>
          )}
        </div>

        {/* Payment Collection Tag */}
        <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-xl bg-[#1a2320] border border-[#2a3832]">
          <span className="text-[#849a90]">Payment Collection:</span>
          <span className="font-bold text-emerald-400">
            {isDelivery ? '💵 Cash / UPI on Delivery' : '🍽️ Collect at Table / Counter'}
          </span>
        </div>

        {/* Special Instructions / Notes */}
        {order.notes && (
          <div className="bg-amber-400/10 border border-amber-400/20 text-amber-200 px-3 py-2 rounded-xl text-xs flex items-start gap-2">
            <span className="font-black text-amber-400 shrink-0">NOTE:</span>
            <span>{order.notes}</span>
          </div>
        )}

        {/* Active Prep / Delivery Time Badge */}
        {['ACCEPTED', 'PREPARING', 'IN_PROGRESS', 'READY'].includes(order.status) && (
          <div className="bg-emerald-500/10 border border-emerald-500/25 px-3 py-2 rounded-xl flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-1.5 font-semibold">
              <Clock size={13} className="text-emerald-400" />
              <span>
                {isDelivery ? 'Delivery in' : 'Ready in'}: <strong className="text-emerald-200">~{order.estimatedTimeMinutes || (isDelivery ? 35 : 20)} mins</strong>
              </span>
              {order.estimatedDeliveryTime && (
                <span className="text-emerald-400/80 font-mono text-[11px] ml-1">
                  (by {new Date(order.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setTimeAdjustOrder(order);
                setAdjustMinutes(order.estimatedTimeMinutes || (isDelivery ? 35 : 20));
              }}
              className="text-[11px] font-bold text-emerald-400 hover:text-white underline ml-2"
            >
              Adjust Time
            </button>
          </div>
        )}

        {/* Order Items List */}
        <div className="flex-1 space-y-2 py-1">
          {order.items && order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#e8783c] bg-[#e8783c]/15 px-2 py-0.5 rounded text-xs">
                  {item.quantity}x
                </span>
                <div>
                  <span className="text-white font-semibold">{item.name}</span>
                  {item.variant && <span className="ml-1.5 text-xs text-[#849a90] font-normal">({item.variant})</span>}
                  {Array.isArray(item.addons) && item.addons.length > 0 && (
                    <div className="text-xs text-emerald-400 font-medium mt-0.5">
                      + {item.addons.map(a => `${a.name} (₹${a.price})`).join(', ')}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-[#aab7b2] font-mono text-xs">₹{((item.price || 0) + (Array.isArray(item.addons) ? item.addons.reduce((sum, a) => sum + (a.price || 0), 0) : 0)) * item.quantity}</div>
            </div>
          ))}
        </div>

        {/* Total & Action Buttons */}
        <div className={`border-t border-[#2a3832] pt-3.5 flex ${order.status === 'NEW' ? 'flex-col gap-3' : 'justify-between items-center gap-2'}`}>
          <div className="flex justify-between items-center w-full">
            <div>
              <div className="text-[10px] text-[#62756d] uppercase font-bold tracking-wider">Total</div>
              <div className="text-xl font-black text-emerald-400">₹{order.total}</div>
            </div>
            {order.status !== 'NEW' && (
              <div className="text-xs text-[#849a90]">
                {order.orderType === 'DELIVERY' ? '🛵 Delivery' : `🍽️ Table ${order.tableNumber || 'N/A'}`}
              </div>
            )}
          </div>
          
          <div className={`flex items-center gap-2 ${order.status === 'NEW' ? 'w-full' : ''}`}>
            {/* NEW Status: Time picker + Accept / Reject */}
            {order.status === 'NEW' && (
              <div className="flex flex-col gap-2.5 w-full">
                <div className="bg-[#1a2320] p-2.5 rounded-xl border border-[#2a3832] flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs text-[#849a90]">
                    <span className="font-bold flex items-center gap-1.5 text-slate-300">
                      <Clock size={13} className="text-[#e8783c]" />
                      <span>{isDelivery ? 'Est. Delivery Time:' : 'Est. Kitchen Prep Time:'}</span>
                    </span>
                    <span className="font-extrabold text-[#e8783c]">
                      {orderTimes[order.id] || (isDelivery ? 35 : 20)} mins
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[15, 20, 30, 45, 60].map(mins => {
                      const currentVal = orderTimes[order.id] || (isDelivery ? 35 : 20);
                      const isSelected = currentVal === mins;
                      return (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setOrderTimes(prev => ({ ...prev, [order.id]: mins }))}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-[#e8783c] text-white shadow-sm shadow-[#e8783c]/30'
                              : 'bg-[#151c19] text-[#849a90] hover:text-white border border-[#2a3832]'
                          }`}
                        >
                          {mins}m
                        </button>
                      );
                    })}
                    <div className="flex items-center gap-1 ml-auto">
                      <input
                        type="number"
                        min="5"
                        max="180"
                        value={orderTimes[order.id] || (isDelivery ? 35 : 20)}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val > 0) {
                            setOrderTimes(prev => ({ ...prev, [order.id]: val }));
                          }
                        }}
                        className="w-14 bg-[#151c19] border border-[#2a3832] rounded-lg px-2 py-0.5 text-xs text-white text-center font-mono focus:border-[#e8783c] outline-none"
                      />
                      <span className="text-[11px] text-[#62756d]">mins</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    disabled={updatingId === order.id}
                    onClick={() => setRejectingOrder(order)}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    disabled={updatingId === order.id}
                    onClick={() => handleStatusUpdate(order.id, 'ACCEPTED', undefined, orderTimes[order.id] || (isDelivery ? 35 : 20))}
                    className="bg-[#e8783c] hover:bg-[#f08b55] text-white px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-md shadow-[#e8783c]/20 disabled:opacity-50"
                  >
                    <Check size={14} strokeWidth={3} /> ACCEPT & SET TIME
                  </button>
                </div>
              </div>
            )}
            
            {/* ACCEPTED Status: Move to Kitchen Preparing */}
            {order.status === 'ACCEPTED' && (
              <button
                type="button"
                disabled={updatingId === order.id}
                onClick={() => handleStatusUpdate(order.id, 'PREPARING')}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <ChefHat size={15} /> START COOKING
              </button>
            )}

            {/* PREPARING / IN_PROGRESS: Ready for Serve or Pickup */}
            {(order.status === 'PREPARING' || order.status === 'IN_PROGRESS') && (
              <button
                type="button"
                disabled={updatingId === order.id}
                onClick={() => handleStatusUpdate(order.id, 'READY')}
                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle2 size={15} /> {isDelivery ? 'READY FOR PACKING' : 'READY TO SERVE'}
              </button>
            )}

            {/* READY Status: Mark Delivered / Served */}
            {order.status === 'READY' && (
              <button
                type="button"
                disabled={updatingId === order.id}
                onClick={() => handleStatusUpdate(order.id, isDelivery ? 'DELIVERED' : 'COMPLETED')}
                className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-md shadow-emerald-500/20"
              >
                <CheckCircle2 size={15} /> {isDelivery ? 'MARK DELIVERED' : 'TABLE SERVED'}
              </button>
            )}

            {/* COMPLETED or DELIVERED */}
            {(order.status === 'COMPLETED' || order.status === 'DELIVERED') && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                <CheckCircle2 size={14} /> Done
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const Column = ({ title, columnOrders, icon: Icon, colorClass }: { title: string, columnOrders: CustomerOrder[], icon: any, colorClass: string }) => (
    <div className="flex flex-col gap-4 min-w-[320px] flex-1 bg-[#1d2723] rounded-2xl p-4 border border-[#2a3832]">
      <div className={`flex items-center gap-2.5 pb-3 border-b-2 ${colorClass}`}>
        <Icon size={18} />
        <h2 className="font-bold text-sm tracking-wider uppercase text-white">{title}</h2>
        <span className="ml-auto bg-[#151c19] px-2.5 py-0.5 rounded-full text-xs font-black border border-[#2a3832] text-white">
          {columnOrders.length}
        </span>
      </div>
      
      <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1" style={{ maxHeight: 'calc(100vh - 270px)' }}>
        {columnOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center border-2 border-dashed border-[#2a3832] rounded-xl text-[#62756d] p-4">
            {loading ? <RefreshCw className="animate-spin text-[#849a90]" size={20} /> : loadFailed ? 'Connection error' : 'No orders in this stage'}
          </div>
        ) : (
          columnOrders.map(order => <OrderCard key={order.id} order={order} />)
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Top Header & Controls */}
      <div className="mb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">Live Order Reception</h1>
          <p className="text-[#849a90] text-xs md:text-sm">Real-time incoming orders from your digital QR menus and online customers.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Audio Chime Toggle */}
          <button
            type="button"
            onClick={toggleAudio}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
              audioEnabled 
                ? 'bg-[#1d2723] border-emerald-500/40 text-emerald-400' 
                : 'bg-[#151c19] border-[#2a3832] text-[#62756d]'
            }`}
          >
            {audioEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            <span>Sound Alert: {audioEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Live Sync / Realtime Badge */}
          <div className={`flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl border shadow-inner transition-colors ${
            isSseConnected 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-[#e8783c]/10 border-[#e8783c]/20 text-[#e8783c]'
          }`}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isSseConnected ? 'bg-emerald-400' : 'bg-[#e8783c]'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isSseConnected ? 'bg-emerald-400' : 'bg-[#e8783c]'
              }`}></span>
            </span>
            {isSseConnected ? 'LIVE REALTIME' : 'POLLING SYNC'}
          </div>
        </div>
      </div>

      {/* Recoverable Connection Error Banner */}
      {loadFailed && (
        <div className="mb-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-400 shrink-0" />
            <span>Connection to server lost. Retrying automatically in background...</span>
          </div>
          <button
            type="button"
            onClick={() => fetchOrders()}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-colors shrink-0"
          >
            Retry Now
          </button>
        </div>
      )}

      {/* Search & Sort Bar */}
      <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#849a90]" />
          <input
            type="text"
            placeholder="Search by order #, table, customer name, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1a2320] border border-[#2a3832] rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-[#62756d] focus:outline-none focus:border-[#e8783c]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#849a90] hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sort Switcher */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'NEWEST' ? 'OLDEST_PENDING' : 'NEWEST')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1a2320] border border-[#2a3832] text-xs font-semibold text-[#849a90] hover:text-white transition-colors"
          >
            <ArrowUpDown size={13} />
            <span>Sort: {sortOrder === 'NEWEST' ? 'Newest First' : 'Oldest Pending'}</span>
          </button>
        </div>
      </div>

      {/* Service Type Tabs: All, Dine-In, Delivery */}
      <div className="flex items-center gap-2 mb-4 border-b border-[#2a3832] pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setFilterType('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            filterType === 'ALL'
              ? 'bg-white text-[#151c19] shadow-sm'
              : 'bg-[#1d2723] text-[#849a90] hover:text-white border border-[#2a3832]'
          }`}
        >
          <span>All Orders</span>
          <span className="px-1.5 py-0.5 rounded-md bg-black/10 text-[11px]">{orders.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterType('DINE_IN')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            filterType === 'DINE_IN'
              ? 'bg-[#e8783c] text-white shadow-sm'
              : 'bg-[#1d2723] text-[#849a90] hover:text-white border border-[#2a3832]'
          }`}
        >
          <UtensilsCrossed size={14} />
          <span>Dine-In (Table)</span>
          <span className="px-1.5 py-0.5 rounded-md bg-black/20 text-[11px]">{dineInCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterType('DELIVERY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            filterType === 'DELIVERY'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'bg-[#1d2723] text-[#849a90] hover:text-white border border-[#2a3832]'
          }`}
        >
          <Bike size={14} />
          <span>Delivery / Takeaway</span>
          <span className="px-1.5 py-0.5 rounded-md bg-black/20 text-[11px]">{deliveryCount}</span>
        </button>
      </div>

      {/* Mobile Stage Selector (Visible on small screens only) */}
      <div className="flex lg:hidden items-center gap-1.5 mb-4 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setMobileStage('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 ${
            mobileStage === 'ALL' ? 'bg-[#384a42] text-white' : 'bg-[#151c19] text-[#849a90]'
          }`}
        >
          All Stages
        </button>
        <button
          type="button"
          onClick={() => setMobileStage('NEW')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1 ${
            mobileStage === 'NEW' ? 'bg-[#e8783c] text-white' : 'bg-[#151c19] text-[#849a90]'
          }`}
        >
          <span>New</span>
          <span className="px-1 rounded bg-black/20 text-[10px]">{newOrders.length}</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileStage('COOKING')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1 ${
            mobileStage === 'COOKING' ? 'bg-blue-600 text-white' : 'bg-[#151c19] text-[#849a90]'
          }`}
        >
          <span>Cooking</span>
          <span className="px-1 rounded bg-black/20 text-[10px]">{inProgressOrders.length}</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileStage('READY')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1 ${
            mobileStage === 'READY' ? 'bg-purple-600 text-white' : 'bg-[#151c19] text-[#849a90]'
          }`}
        >
          <span>Ready</span>
          <span className="px-1 rounded bg-black/20 text-[10px]">{readyOrders.length}</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileStage('DONE')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1 ${
            mobileStage === 'DONE' ? 'bg-emerald-600 text-white' : 'bg-[#151c19] text-[#849a90]'
          }`}
        >
          <span>Done</span>
          <span className="px-1 rounded bg-black/20 text-[10px]">{completedOrders.length}</span>
        </button>
      </div>

      {/* Kanban Board Columns (Responsive on desktop, filtered on mobile) */}
      <div className="flex gap-5 overflow-x-auto pb-4 flex-1 custom-scrollbar">
        {(mobileStage === 'ALL' || mobileStage === 'NEW') && (
          <Column 
            title="New Orders" 
            columnOrders={newOrders} 
            icon={Clock} 
            colorClass="border-[#e8783c] text-[#e8783c]" 
          />
        )}
        {(mobileStage === 'ALL' || mobileStage === 'COOKING') && (
          <Column 
            title="Cooking / Preparing" 
            columnOrders={inProgressOrders} 
            icon={ChefHat} 
            colorClass="border-blue-400 text-blue-400" 
          />
        )}
        {(mobileStage === 'ALL' || mobileStage === 'READY') && (
          <Column 
            title="Ready / Out" 
            columnOrders={readyOrders} 
            icon={CheckCircle2} 
            colorClass="border-purple-400 text-purple-400" 
          />
        )}
        {(mobileStage === 'ALL' || mobileStage === 'DONE') && (
          <Column 
            title="Completed / Delivered" 
            columnOrders={completedOrders} 
            icon={Check} 
            colorClass="border-emerald-400 text-emerald-400" 
          />
        )}
      </div>

      {/* Order Rejection Modal */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1a2320] border border-[#2a3832] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-[#2a3832] mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle size={18} className="text-rose-400" /> Decline Order #{rejectingOrder.id}
              </h3>
              <button 
                type="button"
                onClick={() => setRejectingOrder(null)} 
                className="text-[#849a90] hover:text-white"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[#849a90] mb-4">
              Please choose a reason for declining this order. The customer will be informed.
            </p>

            <div className="space-y-2 mb-6">
              {[
                'Kitchen busy / High order volume',
                'One or more items are out of stock',
                'Restaurant is closing soon',
                'Delivery address is outside service range',
                'Invalid contact details'
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setRejectReason(reason)}
                  className={`w-full text-left p-3 rounded-xl text-xs font-semibold border transition-all ${
                    rejectReason === reason 
                      ? 'bg-rose-500/10 border-rose-500 text-rose-300' 
                      : 'bg-[#151c19] border-[#2a3832] text-[#849a90] hover:text-white'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRejectingOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#849a90] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updatingId === rejectingOrder.id}
                onClick={() => handleStatusUpdate(rejectingOrder.id, 'CANCELLED', rejectReason)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors disabled:opacity-50 shadow-md shadow-rose-600/30"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Time Adjustment Modal */}
      {timeAdjustOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#1d2723] border border-[#2a3832] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-[#2a3832] mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock size={18} className="text-[#e8783c]" /> Adjust {timeAdjustOrder.orderType === 'DELIVERY' ? 'Delivery' : 'Preparation'} Time
              </h3>
              <button 
                type="button"
                onClick={() => setTimeAdjustOrder(null)} 
                className="text-[#849a90] hover:text-white"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[#849a90] mb-4">
              Order #{timeAdjustOrder.id.substring(0, 8)} ({timeAdjustOrder.customerName || 'Customer'})
              <br />
              Setting a new time will update the customer's live tracking screen in real time.
            </p>

            <div className="mb-5 bg-[#151c19] p-4 rounded-xl border border-[#2a3832] text-center">
              <div className="text-xs text-[#849a90] mb-1 uppercase tracking-wider font-bold">New Estimated Time</div>
              <div className="text-3xl font-black text-[#e8783c]">~{adjustMinutes} Mins</div>
            </div>

            {/* Quick preset buttons */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[15, 20, 30, 45, 60, 75, 90].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setAdjustMinutes(mins)}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                    adjustMinutes === mins
                      ? 'bg-[#e8783c] border-[#e8783c] text-white'
                      : 'bg-[#151c19] border-[#2a3832] text-[#849a90] hover:text-white'
                  }`}
                >
                  {mins}m
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAdjustMinutes(prev => prev + 5)}
                className="p-2.5 rounded-xl text-xs font-bold border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
              >
                +5m
              </button>
            </div>

            {/* Custom Input */}
            <div className="flex items-center gap-3 mb-6 bg-[#151c19] p-3 rounded-xl border border-[#2a3832]">
              <span className="text-xs text-[#849a90] font-medium">Or enter custom minutes:</span>
              <input
                type="number"
                min="5"
                max="240"
                value={adjustMinutes}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val > 0) setAdjustMinutes(val);
                }}
                className="w-20 bg-[#1d2723] border border-[#2a3832] rounded-lg px-3 py-1.5 text-sm text-white text-center font-mono focus:border-[#e8783c] outline-none"
              />
              <span className="text-xs text-[#849a90]">minutes</span>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setTimeAdjustOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#849a90] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdatingTime}
                onClick={handleAdjustTime}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#e8783c] hover:bg-[#f08b55] text-white transition-colors disabled:opacity-50 shadow-md shadow-[#e8783c]/30"
              >
                {isUpdatingTime ? 'Updating...' : 'Save & Notify Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
