import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { 
  Clock, 
  Check, 
  ChefHat, 
  CheckCircle2, 
  RefreshCw, 
  Phone, 
  MessageSquare, 
  Copy, 
  CheckCheck, 
  UtensilsCrossed, 
  Bike, 
  X, 
  Volume2, 
  VolumeX, 
  AlertTriangle,
  Search, 
  ArrowUpDown, 
  Printer, 
  LayoutGrid, 
  Kanban, 
  BellRing,
  Flame,
  Volume1
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
  items: Array<{ 
    id: string; 
    name: string; 
    quantity: number; 
    price: number; 
    variant?: string; 
    addons?: Array<{ id: string; name: string; price: number }>; 
    addonTotal?: number 
  }>;
  total: number;
  status: 'NEW' | 'ACCEPTED' | 'PREPARING' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
  rejectionReason?: string | null;
  time: string;
  estimatedTimeMinutes?: number | null;
  estimatedDeliveryTime?: string | null;
  sessionId?: string | null;
  roundNumber?: number;
  parentOrderId?: string | null;
  previousRoundItems?: Array<{ 
    id?: string; 
    name: string; 
    quantity: number; 
    price: number; 
    variant?: string; 
    roundNumber?: number 
  }>;
  sessionTotal?: number;
};

// ==========================================
// Web Audio API Synthesizers (No external MP3 files needed)
// ==========================================
let audioContextInstance: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioContextInstance) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioContextInstance = new AudioCtx();
      }
    }
    if (audioContextInstance && audioContextInstance.state === 'suspended') {
      audioContextInstance.resume();
    }
    return audioContextInstance;
  } catch {
    return null;
  }
}

// Harmonious two-bell chime for new orders
function playNewOrderSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // First tone (587.33 Hz - D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.22, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second higher tone (880 Hz - A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.16);
    gain2.gain.setValueAtTime(0.28, now + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.16);
    osc2.stop(now + 0.65);
  } catch {
    // Ignore audio permission errors
  }
}

// Three-pulse urgent chime for unaccepted orders lingering > 10m
function playUrgentBuzzer() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    [0, 0.18, 0.36].forEach((offset, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(idx === 2 ? 880 : 740, now + offset);
      gain.gain.setValueAtTime(0.25, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.15);
    });
  } catch {
    // Ignore audio permission errors
  }
}

// Elapsed relative time calculation
function formatElapsedTime(timeStr: string): string {
  try {
    const diffMs = Date.now() - new Date(timeStr).getTime();
    const mins = Math.max(0, Math.floor(diffMs / 60000));
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours}h ${remMins}m ago`;
  } catch {
    return 'Recently';
  }
}

// Urgency classifier for kitchen tickets
function getOrderUrgency(order: CustomerOrder): 'normal' | 'warning' | 'urgent' {
  if (order.status !== 'NEW') return 'normal';
  try {
    const diffMs = Date.now() - new Date(order.time).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins >= 15) return 'urgent';
    if (mins >= 8) return 'warning';
    return 'normal';
  } catch {
    return 'normal';
  }
}

export default function Orders() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
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
  const [customTimeInputs, setCustomTimeInputs] = useState<Record<string, string>>({});
  const [showCustomTimeFor, setShowCustomTimeFor] = useState<string | null>(null);
  const [timeAdjustOrder, setTimeAdjustOrder] = useState<CustomerOrder | null>(null);
  const [adjustMinutes, setAdjustMinutes] = useState<number>(30);
  const [isUpdatingTime, setIsUpdatingTime] = useState(false);
  const [isSseConnected, setIsSseConnected] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'KANBAN' | 'TABLE_MATRIX'>('KANBAN');
  const [buzzerSnoozed, setBuzzerSnoozed] = useState(false);
  const [selectedTableModal, setSelectedTableModal] = useState<string | null>(null);

  const knownOrderIds = useRef<Set<string>>(new Set());
  const initialLoadDone = useRef(false);
  const audioEnabledRef = useRef(audioEnabled);
  const showToast = useToast();

  useEffect(() => {
    audioEnabledRef.current = audioEnabled;
  }, [audioEnabled]);

  // Unlock AudioContext on first user interaction
  useEffect(() => {
    const handleFirstGesture = () => {
      getAudioContext();
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
    window.addEventListener('pointerdown', handleFirstGesture);
    window.addEventListener('keydown', handleFirstGesture);
    return () => {
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, []);

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

  const testAudioChime = () => {
    getAudioContext();
    playNewOrderSound();
    showToast('info', '🔔 Speaker test chime played!');
  };

  const toggleItemCheck = (orderId: string, itemIdx: number) => {
    const key = `${orderId}-${itemIdx}`;
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // 80mm Thermal KOT (Kitchen Order Ticket)
  const printKOT = (order: CustomerOrder) => {
    const printWindow = window.open('', '_blank', 'width=380,height=600');
    if (!printWindow) return;

    const timeFormatted = new Date(order.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = new Date(order.time).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>KOT - #${order.id}</title>
          <style>
            @page { size: 80mm auto; margin: 2mm; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              font-size: 13px; 
              line-height: 1.35; 
              color: #000; 
              margin: 0; 
              padding: 10px; 
            }
            .center { text-align: center; }
            .bold { font-weight: 900; }
            .dashed { border-bottom: 2px dashed #000; padding-bottom: 6px; margin-bottom: 8px; }
            .dashed-top { border-top: 2px dashed #000; padding-top: 6px; margin-top: 8px; }
            .table-hero { font-size: 28px; font-weight: 900; letter-spacing: 1px; }
            .badge { display: inline-block; background: #000; color: #fff; padding: 3px 8px; font-size: 12px; font-weight: 900; border-radius: 4px; margin-top: 4px; }
            .item-row { display: flex; justify-content: space-between; font-size: 14px; margin: 6px 0; }
            .qty { font-size: 16px; font-weight: 900; width: 40px; }
            .item-name { flex: 1; font-weight: 900; }
            .item-addons { font-size: 11px; margin-left: 40px; font-style: italic; color: #222; }
            .note-box { background: #f0f0f0; border-left: 4px solid #000; padding: 6px; font-weight: bold; margin-top: 6px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="center dashed">
            <div class="bold" style="font-size: 17px; letter-spacing: 1px;">KITCHEN ORDER TICKET (KOT)</div>
            <div style="font-size: 11px; margin-top: 2px;">${dateFormatted} • ${timeFormatted}</div>
            <div class="table-hero" style="margin: 6px 0;">
              ${order.orderType === 'DELIVERY' ? '🛵 DELIVERY' : `TABLE ${order.tableNumber || 'N/A'}`}
            </div>
            ${order.roundNumber && order.roundNumber > 1 ? `<div class="badge">🔥 ROUND ${order.roundNumber} ADD-ON</div>` : ''}
            <div style="font-size: 11px; margin-top: 4px;">Ticket #${order.id} • ${order.customerName || 'Guest'}</div>
          </div>

          <div style="margin: 10px 0;">
            <div class="bold" style="font-size: 12px; margin-bottom: 6px;">
              ${order.roundNumber && order.roundNumber > 1 ? `🔥 PREPARE THESE DISHES (ROUND ${order.roundNumber}):` : 'DISHES TO PREPARE:'}
            </div>
            ${(order.items || []).map(it => `
              <div class="item-row">
                <span class="qty">${it.quantity}x</span>
                <span class="item-name">${it.name} ${it.variant ? `(${it.variant})` : ''}</span>
              </div>
              ${Array.isArray(it.addons) && it.addons.length > 0 ? `
                <div class="item-addons">+ ${it.addons.map(a => a.name).join(', ')}</div>
              ` : ''}
            `).join('')}
          </div>

          ${order.notes ? `
            <div class="dashed-top note-box">
              <div class="bold">SPECIAL INSTRUCTIONS:</div>
              <div>${order.notes}</div>
            </div>
          ` : ''}

          ${order.roundNumber && order.roundNumber > 1 && order.previousRoundItems && order.previousRoundItems.length > 0 ? `
            <div class="dashed-top" style="font-size: 11px; color: #444;">
              <div class="bold">ALREADY SERVED (DO NOT RECOOK):</div>
              <div>${order.previousRoundItems.map(it => `${it.quantity}x ${it.name}`).join(', ')}</div>
            </div>
          ` : ''}

          <div class="center dashed-top" style="font-size: 10px; margin-top: 12px;">
            --- MenusQR Digital Kitchen Dispatch ---
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  // 80mm Thermal Consolidated Table Bill
  const printTableSummary = (tableNumber: string, tableOrders: CustomerOrder[], totalBill: number) => {
    const printWindow = window.open('', '_blank', 'width=380,height=650');
    if (!printWindow) return;

    const dateFormatted = new Date().toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
    const timeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>TABLE #${tableNumber} - Running Bill / KOT</title>
          <style>
            @page { size: 80mm auto; margin: 2mm; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              font-size: 13px; 
              line-height: 1.35; 
              color: #000; 
              margin: 0; 
              padding: 10px; 
            }
            .center { text-align: center; }
            .bold { font-weight: 900; }
            .dashed { border-bottom: 2px dashed #000; padding-bottom: 6px; margin-bottom: 8px; }
            .dashed-top { border-top: 2px dashed #000; padding-top: 6px; margin-top: 8px; }
            .table-hero { font-size: 28px; font-weight: 900; letter-spacing: 1px; }
            .item-row { display: flex; justify-content: space-between; font-size: 13px; margin: 4px 0; }
            .qty { font-size: 14px; font-weight: 900; width: 32px; }
            .item-name { flex: 1; font-weight: bold; }
            .item-price { font-weight: bold; text-align: right; width: 65px; }
            .total-row { display: flex; justify-content: space-between; font-size: 19px; font-weight: 900; margin-top: 8px; }
          </style>
        </head>
        <body>
          <div class="center dashed">
            <div class="table-hero">TABLE ${tableNumber}</div>
            <div class="bold" style="font-size: 15px;">CONSOLIDATED TABLE BILL</div>
            <div style="font-size: 11px; margin-top: 4px;">${dateFormatted} • ${timeFormatted}</div>
          </div>
          <div style="margin-bottom: 6px; font-size: 11px; font-weight: bold;">
            TOTAL ROUNDS ORDERED: ${tableOrders.length}
          </div>
          ${tableOrders.map((ord, oIdx) => `
            <div style="margin-top: 6px; padding-top: 4px; border-top: 1px dotted #888;">
              <div style="font-size: 11px; font-weight: bold; color: #222;">
                ROUND ${ord.roundNumber || (oIdx + 1)} (#${ord.id.substring(0, 6)}) - ${new Date(ord.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              ${ord.items.map(it => `
                <div class="item-row">
                  <span class="qty">${it.quantity}x</span>
                  <span class="item-name">${it.name} ${it.variant ? `(${it.variant})` : ''}</span>
                  <span class="item-price">₹${((it.price || 0) + (it.addons ? it.addons.reduce((s, a) => s + (a.price || 0), 0) : 0)) * it.quantity}</span>
                </div>
              `).join('')}
            </div>
          `).join('')}
          <div class="dashed-top">
            <div class="total-row">
              <span>TABLE TOTAL:</span>
              <span>₹${totalBill}</span>
            </div>
          </div>
          <div class="center dashed-top" style="font-size: 10px; margin-top: 12px;">
            MenusQR Dining System • Thank you!
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Repeating Audio Buzzer for Unaccepted NEW orders in Kitchen
  useEffect(() => {
    const unacceptedCount = orders.filter(o => o.status === 'NEW').length;
    if (unacceptedCount === 0 || buzzerSnoozed || !audioEnabled) return;

    const interval = setInterval(() => {
      if (audioEnabledRef.current && !buzzerSnoozed) {
        playUrgentBuzzer();
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [orders, buzzerSnoozed, audioEnabled]);

  // Reset snooze when all new orders are accepted
  useEffect(() => {
    const unacceptedCount = orders.filter(o => o.status === 'NEW').length;
    if (unacceptedCount === 0 && buzzerSnoozed) {
      setBuzzerSnoozed(false);
    }
  }, [orders, buzzerSnoozed]);

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
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
      setIsRefreshing(false);
    }
  }, [orders.length, showToast]);

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

    // Background sync safety net every 60s
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
  }, [fetchOrders]);

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
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
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
    }).sort((a, b) => {
      const timeA = new Date(a.time).getTime();
      const timeB = new Date(b.time).getTime();
      if (sortOrder === 'OLDEST_PENDING') {
        const isPendingA = ['NEW', 'ACCEPTED', 'PREPARING', 'IN_PROGRESS'].includes(a.status);
        const isPendingB = ['NEW', 'ACCEPTED', 'PREPARING', 'IN_PROGRESS'].includes(b.status);
        if (isPendingA && !isPendingB) return -1;
        if (!isPendingA && isPendingB) return 1;
        return timeA - timeB;
      }
      return timeB - timeA;
    });
  }, [orders, filterType, query, sortOrder]);

  const newOrders = useMemo(() => filteredOrders.filter(o => o.status === 'NEW'), [filteredOrders]);
  const inProgressOrders = useMemo(() => filteredOrders.filter(o => ['ACCEPTED', 'PREPARING', 'IN_PROGRESS'].includes(o.status)), [filteredOrders]);
  const readyOrders = useMemo(() => filteredOrders.filter(o => o.status === 'READY'), [filteredOrders]);
  const completedOrders = useMemo(() => filteredOrders.filter(o => ['COMPLETED', 'DELIVERED'].includes(o.status)), [filteredOrders]);

  const dineInCount = useMemo(() => orders.filter(o => o.orderType === 'DINE_IN').length, [orders]);
  const deliveryCount = useMemo(() => orders.filter(o => o.orderType === 'DELIVERY').length, [orders]);
  const unacceptedOrders = useMemo(() => orders.filter(o => o.status === 'NEW'), [orders]);

  // Aggregated Table Groups for Dine-In Table Matrix View
  const tableGroups = useMemo(() => {
    const map: Record<string, CustomerOrder[]> = {};
    const dineInOrders = orders.filter(o => o.orderType === 'DINE_IN' && o.tableNumber && o.status !== 'CANCELLED');
    
    dineInOrders.forEach(ord => {
      const tableKey = String(ord.tableNumber).trim();
      if (!map[tableKey]) map[tableKey] = [];
      map[tableKey].push(ord);
    });

    return Object.keys(map).map(tableKey => {
      const tblOrders = map[tableKey].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
      
      const latestOrderWithSession = [...tblOrders].reverse().find(o => o.sessionTotal && o.sessionTotal > 0);
      const totalBill = latestOrderWithSession?.sessionTotal ?? tblOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      
      const hasNewOrder = tblOrders.some(o => o.status === 'NEW');
      const hasCookingOrder = tblOrders.some(o => ['ACCEPTED', 'PREPARING', 'IN_PROGRESS'].includes(o.status));
      const allReady = tblOrders.length > 0 && tblOrders.every(o => o.status === 'READY');
      const allDone = tblOrders.length > 0 && tblOrders.every(o => ['COMPLETED', 'DELIVERED'].includes(o.status));

      const latestStatus = tblOrders[tblOrders.length - 1].status;
      const seatedTime = tblOrders[0].time;
      const itemCount = tblOrders.reduce((sum, o) => sum + (o.items ? o.items.reduce((s, it) => s + it.quantity, 0) : 0), 0);

      return {
        tableNumber: tableKey,
        orders: tblOrders,
        totalBill,
        latestStatus,
        hasNewOrder,
        hasCookingOrder,
        allReady,
        allDone,
        seatedTime,
        itemCount
      };
    }).sort((a, b) => {
      if (a.hasNewOrder && !b.hasNewOrder) return -1;
      if (!a.hasNewOrder && b.hasNewOrder) return 1;
      const numA = parseInt(a.tableNumber, 10);
      const numB = parseInt(b.tableNumber, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.tableNumber.localeCompare(b.tableNumber);
    });
  }, [orders]);

  const currentModalGroup = selectedTableModal ? tableGroups.find(g => g.tableNumber === selectedTableModal) : null;

  // ==========================================
  // Sub-Component: Table Matrix View (Floor View)
  // ==========================================
  const TableMatrixView = () => {
    if (tableGroups.length === 0) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[#24332d] rounded-3xl p-12 text-center bg-[#151c19]/40 min-h-[420px]">
          <div className="w-16 h-16 rounded-2xl bg-[#1d2723] flex items-center justify-center text-[#849a90] mb-4 border border-[#2a3832]">
            <UtensilsCrossed size={32} />
          </div>
          <h3 className="text-lg font-bold text-white mb-1.5">No Active Dine-In Tables</h3>
          <p className="text-xs text-[#849a90] max-w-md leading-relaxed">
            When guests sit at a table and scan their QR stand, their table will light up here in real-time with round-by-round tickets, live cooking status, and running billing.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto custom-scrollbar pb-6 flex-1 min-h-0">
        {tableGroups.map(group => {
          const seatedMins = Math.max(1, Math.round((Date.now() - new Date(group.seatedTime).getTime()) / 60000));
          const latestOrder = group.orders[group.orders.length - 1];

          return (
            <div 
              key={group.tableNumber}
              className={`rounded-2xl p-5 border flex flex-col justify-between gap-4 transition-all shadow-lg ${
                group.hasNewOrder 
                  ? 'bg-gradient-to-b from-[#e8783c]/15 via-[#151c19] to-[#151c19] border-[#e8783c] ring-2 ring-[#e8783c]/30 shadow-[#e8783c]/10' 
                  : group.hasCookingOrder
                  ? 'bg-[#151c19] border-blue-500/40 hover:border-blue-400'
                  : group.allReady
                  ? 'bg-[#151c19] border-purple-500/40 hover:border-purple-400'
                  : 'bg-[#151c19] border-[#24332d] hover:border-[#384a42]'
              }`}
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between border-b border-[#24332d] pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-white font-serif tracking-tight">
                      TABLE {group.tableNumber}
                    </span>
                    <span className="text-[11px] font-mono text-[#849a90] bg-[#1d2723] px-2 py-0.5 rounded border border-[#2a3832]">
                      ⏱️ {seatedMins}m
                    </span>
                  </div>

                  {group.hasNewOrder ? (
                    <span className="px-2.5 py-1 rounded-full bg-[#e8783c] text-white text-[10px] font-black uppercase tracking-wider animate-bounce flex items-center gap-1 shadow-md shadow-[#e8783c]/30">
                      <Flame size={12} />
                      <span>NEW ROUND</span>
                    </span>
                  ) : group.hasCookingOrder ? (
                    <span className="px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <ChefHat size={12} />
                      <span>COOKING</span>
                    </span>
                  ) : group.allReady ? (
                    <span className="px-2.5 py-1 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <BellRing size={12} />
                      <span>READY TO SERVE</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      <span>ALL SERVED</span>
                    </span>
                  )}
                </div>

                {/* Table Rounds Details */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center text-[11px] text-[#849a90]">
                    <span>Rounds Ordered:</span>
                    <span className="font-bold text-white bg-[#1d2723] px-2 py-0.5 rounded border border-[#2a3832]">
                      {group.orders.length} {group.orders.length === 1 ? 'Round' : 'Rounds'} ({group.itemCount} items)
                    </span>
                  </div>

                  {/* Latest Round Preview Box */}
                  <div className="p-3 rounded-xl bg-black/40 border border-[#24332d] space-y-1.5">
                    <div className="text-[10px] font-mono uppercase text-amber-300 font-bold flex items-center justify-between">
                      <span>Latest: Round {group.orders.length} (#{latestOrder.id.substring(0, 6)})</span>
                      <span className="text-[10px] text-[#849a90] lowercase">{formatElapsedTime(latestOrder.time)}</span>
                    </div>
                    {latestOrder.items.slice(0, 3).map((it, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-slate-200">
                        <span className="font-medium">{it.quantity}x {it.name}</span>
                        <span className="text-[#849a90] font-mono text-[11px]">₹{(it.price || 0) * it.quantity}</span>
                      </div>
                    ))}
                    {latestOrder.items.length > 3 && (
                      <div className="text-[11px] text-amber-300/80 font-medium italic pt-0.5">
                        +{latestOrder.items.length - 3} more items...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Table Bill & Fast Action Bar */}
              <div className="pt-3 border-t border-[#24332d] space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-[#849a90] uppercase font-bold tracking-wider">Running Bill:</span>
                  <span className="text-xl font-black text-emerald-400 font-mono tracking-tight">₹{group.totalBill}</span>
                </div>

                {/* Quick Advance Button if action is required */}
                {group.hasNewOrder && (
                  <button
                    type="button"
                    onClick={() => {
                      const newOrd = group.orders.find(o => o.status === 'NEW');
                      if (newOrd) handleStatusUpdate(newOrd.id, 'ACCEPTED', undefined, 20);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-[#e8783c] hover:bg-[#f08b55] text-white text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#e8783c]/20 cursor-pointer"
                  >
                    <Check size={14} strokeWidth={3} />
                    <span>ACCEPT NEW ROUND (20m)</span>
                  </button>
                )}

                {!group.hasNewOrder && group.hasCookingOrder && (
                  <button
                    type="button"
                    onClick={() => {
                      const cookingOrd = group.orders.find(o => ['ACCEPTED', 'PREPARING', 'IN_PROGRESS'].includes(o.status));
                      if (cookingOrd) handleStatusUpdate(cookingOrd.id, 'READY');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 cursor-pointer"
                  >
                    <CheckCircle2 size={14} />
                    <span>MARK COOKING DISHES READY</span>
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => printTableSummary(group.tableNumber, group.orders, group.totalBill)}
                    className="p-2 rounded-xl bg-[#1d2723] hover:bg-[#273530] text-slate-200 border border-[#2a3832] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Print 80mm thermal bill slip for this table"
                  >
                    <Printer size={13} className="text-amber-400" />
                    <span>Print Bill</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTableModal(group.tableNumber)}
                    className="p-2 rounded-xl bg-[#1d2723] hover:bg-[#273530] text-[#849a90] hover:text-white border border-[#2a3832] text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>All Rounds ({group.orders.length})</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ==========================================
  // Sub-Component: High-Density KDS Order Card
  // ==========================================
  const OrderCard = ({ order }: { order: CustomerOrder }) => {
    const timeFormatted = new Date(order.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isDelivery = order.orderType === 'DELIVERY';
    const fullAddress = [order.deliveryAddress, order.deliveryLandmark, order.deliveryCity].filter(Boolean).join(', ');
    const urgency = getOrderUrgency(order);
    
    // Normalize phone number for safe WhatsApp link
    const rawDigits = (order.customerPhone || '').replace(/\D/g, '');
    const waNumber = rawDigits.startsWith('91') && rawDigits.length === 12
      ? rawDigits
      : rawDigits.length === 10
      ? `91${rawDigits}`
      : rawDigits;

    // Default time: 20m for Dine-In, 35m for Delivery
    const currentSelectedTime = orderTimes[order.id] || (isDelivery ? 35 : 20);

    return (
      <div className={`bg-[#151c19] rounded-2xl p-4 md:p-4.5 border flex flex-col gap-3.5 shadow-xl transition-all duration-200 ${
        urgency === 'urgent'
          ? 'border-rose-500/80 ring-2 ring-rose-500/30 bg-gradient-to-b from-rose-950/20 to-[#151c19]'
          : urgency === 'warning'
          ? 'border-amber-500/80 ring-2 ring-amber-500/20 bg-gradient-to-b from-amber-950/15 to-[#151c19]'
          : order.status === 'NEW'
          ? 'border-[#e8783c]/60 ring-1 ring-[#e8783c]/25 hover:border-[#e8783c]'
          : 'border-[#24332d] hover:border-[#384a42]'
      }`}>
        {/* Ticket Top Header */}
        <div className="flex justify-between items-start border-b border-[#24332d] pb-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              {isDelivery ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 font-black text-xs uppercase tracking-wider">
                  <Bike size={14} />
                  <span>Delivery #{order.id.slice(-4)}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#e8783c]/15 border border-[#e8783c]/30 text-[#e8783c] font-black text-xs uppercase tracking-wider">
                  <UtensilsCrossed size={14} />
                  <span>Table {order.tableNumber || 'N/A'}</span>
                </div>
              )}

              {/* Multi-Round Table Add-On Badge */}
              {order.roundNumber && order.roundNumber > 1 && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 font-black text-[11px] uppercase tracking-wider animate-pulse">
                  <Flame size={12} />
                  <span>Round {order.roundNumber} Add-On</span>
                </div>
              )}
            </div>

            {/* Elapsed relative time with urgency coloring */}
            <div className="flex items-center gap-2 text-xs mt-0.5">
              <span className={`font-mono font-bold flex items-center gap-1 ${
                urgency === 'urgent' 
                  ? 'text-rose-400 font-extrabold animate-pulse' 
                  : urgency === 'warning'
                  ? 'text-amber-400'
                  : 'text-[#849a90]'
              }`}>
                <Clock size={12} />
                <span>{formatElapsedTime(order.time)}</span>
              </span>
              <span className="text-[#62756d] font-mono text-[11px]">({timeFormatted})</span>
            </div>
          </div>

          {/* Quick Actions (Print KOT, Order ID) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => printKOT(order)}
              className="p-1.5 px-2 rounded-lg bg-[#1d2723] hover:bg-[#e8783c] text-slate-300 hover:text-white transition-all flex items-center gap-1 text-[11px] font-bold border border-[#2a3832] cursor-pointer"
              title="Print Kitchen Order Ticket (KOT) on 80mm printer"
            >
              <Printer size={13} />
              <span>KOT</span>
            </button>
            <div className="text-right">
              <span className="text-[#849a90] text-xs font-mono font-bold">#{order.id.substring(0, 6)}</span>
            </div>
          </div>
        </div>

        {/* Customer & Address Details Bar (Compact) */}
        <div className="bg-[#1a2320] p-2.5 rounded-xl border border-[#24332d] flex flex-col gap-1.5 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-white font-semibold truncate">
              <span className="text-[#849a90] text-[11px]">Customer:</span>
              <span className="truncate">{order.customerName || 'Guest'}</span>
            </div>

            {order.customerPhone && (
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <a
                  href={`tel:${order.customerPhone}`}
                  title="Call Customer"
                  className="p-1.5 rounded-lg bg-[#24332d] hover:bg-[#2e4039] text-emerald-400 transition-colors"
                  aria-label={`Call customer at ${order.customerPhone}`}
                >
                  <Phone size={12} />
                </a>
                <a
                  href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi ${order.customerName || ''}, greeting from the restaurant regarding your order #${order.id}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Chat on WhatsApp"
                  className="p-1.5 rounded-lg bg-[#24332d] hover:bg-[#2e4039] text-green-400 transition-colors"
                  aria-label={`WhatsApp customer at ${order.customerPhone}`}
                >
                  <MessageSquare size={12} />
                </a>
              </div>
            )}
          </div>

          {/* Delivery Address if Delivery */}
          {isDelivery && fullAddress && (
            <div className="pt-1.5 border-t border-[#24332d] flex items-start justify-between gap-2">
              <div className="text-[11px] text-slate-300 leading-snug truncate">
                <span className="text-sky-400 font-semibold mr-1">📍 Delivery:</span>
                <span>{fullAddress}</span>
              </div>
              <button
                type="button"
                onClick={() => copyAddress(order.id, fullAddress)}
                title="Copy Address"
                className="p-1 rounded-md bg-[#24332d] hover:bg-[#2e4039] text-[#849a90] hover:text-white transition-colors shrink-0"
              >
                {copiedId === order.id ? <CheckCheck size={12} className="text-emerald-400" /> : <Copy size={12} />}
              </button>
            </div>
          )}
        </div>

        {/* Customer Special Notes / Instructions */}
        {order.notes && (
          <div className="bg-amber-400/10 border border-amber-400/25 text-amber-200 px-3 py-2 rounded-xl text-xs flex items-start gap-2">
            <span className="font-black text-amber-400 shrink-0 uppercase tracking-wide text-[10px]">Note:</span>
            <span className="font-medium">{order.notes}</span>
          </div>
        )}

        {/* Active Prep / Delivery Time Indicator */}
        {['ACCEPTED', 'PREPARING', 'IN_PROGRESS', 'READY'].includes(order.status) && (
          <div className="bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 rounded-xl flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-1.5 font-semibold">
              <Clock size={13} className="text-emerald-400" />
              <span>
                {isDelivery ? 'Delivery in' : 'Ready in'}: <strong className="text-emerald-200 font-bold">~{order.estimatedTimeMinutes || (isDelivery ? 35 : 20)}m</strong>
              </span>
              {order.estimatedDeliveryTime && (
                <span className="text-emerald-400/80 font-mono text-[11px] ml-1">
                  (by {new Date(order.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={async () => {
                  const currentMins = order.estimatedTimeMinutes || (isDelivery ? 35 : 20);
                  const nextMins = currentMins + 5;
                  try {
                    await updateOrderEstimatedTime(order.id, nextMins);
                    await fetchOrders(true);
                    showToast('success', `Added +5m rush time to Order #${order.id.substring(0, 6)}`);
                  } catch (e: any) {
                    showToast('error', e?.message || 'Could not update time');
                  }
                }}
                className="px-1.5 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-black border border-emerald-500/30 transition-colors"
                title="Quick add +5 minutes rush time"
              >
                +5m
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimeAdjustOrder(order);
                  setAdjustMinutes(order.estimatedTimeMinutes || (isDelivery ? 35 : 20));
                }}
                className="text-[11px] font-bold text-emerald-400 hover:text-white underline ml-1 cursor-pointer"
              >
                Adjust
              </button>
            </div>
          </div>
        )}

        {/* Order Items List (Interactive Cook Checklist) */}
        <div className="space-y-2 py-0.5">
          {/* Multi-Round (Round 2+) View */}
          {order.roundNumber && order.roundNumber > 1 && order.previousRoundItems && order.previousRoundItems.length > 0 ? (
            <>
              {/* NEW DISHES TO PREPARE NOW */}
              <div className="p-3 rounded-xl bg-amber-500/10 border-2 border-amber-500/40 space-y-2">
                <div className="flex items-center justify-between border-b border-amber-500/30 pb-1.5">
                  <span className="text-xs font-black text-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
                    <Flame size={13} />
                    <span>PREPARE NOW (Round {order.roundNumber})</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/30 text-amber-200">
                    {order.items?.reduce((s, it) => s + it.quantity, 0)} items
                  </span>
                </div>
                {order.items && order.items.map((item, idx) => {
                  const isChecked = checkedItems[`${order.id}-${idx}`] || false;
                  return (
                    <div 
                      key={idx} 
                      onClick={() => toggleItemCheck(order.id, idx)}
                      className={`flex justify-between items-center text-sm p-1.5 rounded-lg cursor-pointer transition-colors ${
                        isChecked ? 'bg-emerald-500/10 line-through opacity-60' : 'hover:bg-white/5'
                      }`}
                      title="Tap to mark cooked"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-black px-2 py-0.5 rounded text-xs border ${
                          isChecked 
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                            : 'text-[#e8783c] bg-[#e8783c]/20 border-[#e8783c]/40'
                        }`}>
                          {isChecked ? '✓' : `${item.quantity}x`}
                        </span>
                        <div>
                          <span className={`font-bold ${isChecked ? 'text-slate-400' : 'text-white'}`}>{item.name}</span>
                          {item.variant && <span className="ml-1.5 text-xs text-amber-200/90 font-medium">({item.variant})</span>}
                          {Array.isArray(item.addons) && item.addons.length > 0 && (
                            <div className="text-xs text-emerald-400 font-medium mt-0.5">
                              + {item.addons.map(a => `${a.name} (₹${a.price})`).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-white font-mono text-xs font-bold">
                        ₹{((item.price || 0) + (Array.isArray(item.addons) ? item.addons.reduce((sum, a) => sum + (a.price || 0), 0) : 0)) * item.quantity}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ALREADY DELIVERED IN EARLIER ROUNDS */}
              <div className="p-2.5 rounded-xl bg-[#141b18] border border-[#24332d] space-y-1 opacity-70">
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-white/5 pb-1">
                  <span className="font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    <span>Already Served (Earlier Rounds)</span>
                  </span>
                  <span className="text-[10px] text-emerald-400">Do not recook</span>
                </div>
                {order.previousRoundItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs text-slate-400 py-0.5">
                    <span className="line-through">{item.quantity}x {item.name} {item.variant ? `(${item.variant})` : ''}</span>
                    <span className="font-mono text-[11px]">₹{(item.price || 0) * item.quantity}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Standard Order Display */
            (order.items || []).map((item, idx) => {
              const isChecked = checkedItems[`${order.id}-${idx}`] || false;
              return (
                <div 
                  key={idx} 
                  onClick={() => toggleItemCheck(order.id, idx)}
                  className={`flex justify-between items-center text-sm p-1.5 rounded-lg cursor-pointer transition-colors ${
                    isChecked ? 'bg-emerald-500/10 line-through opacity-60' : 'hover:bg-white/5'
                  }`}
                  title="Tap to mark cooked"
                >
                  <div className="flex items-center gap-2">
                    <span className={`font-mono font-black px-2 py-0.5 rounded text-xs border ${
                      isChecked 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                        : 'text-[#e8783c] bg-[#e8783c]/20 border-[#e8783c]/40'
                    }`}>
                      {isChecked ? '✓' : `${item.quantity}x`}
                    </span>
                    <div>
                      <span className={`font-bold ${isChecked ? 'text-slate-400' : 'text-white'}`}>{item.name}</span>
                      {item.variant && <span className="ml-1.5 text-xs text-amber-200/90 font-medium">({item.variant})</span>}
                      {Array.isArray(item.addons) && item.addons.length > 0 && (
                        <div className="text-xs text-emerald-400 font-medium mt-0.5">
                          + {item.addons.map(a => `${a.name} (₹${a.price})`).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-[#aab7b2] font-mono text-xs font-bold">
                    ₹{((item.price || 0) + (Array.isArray(item.addons) ? item.addons.reduce((sum, a) => sum + (a.price || 0), 0) : 0)) * item.quantity}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bill Total & Kitchen Stage Action Footer */}
        <div className="border-t border-[#24332d] pt-3 flex flex-col gap-3">
          {/* Total Row */}
          <div className="flex justify-between items-baseline">
            {order.roundNumber && order.roundNumber > 1 && order.sessionTotal ? (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] text-[#849a90] uppercase font-bold tracking-wider">This Round:</span>
                  <span className="text-xs font-bold text-amber-400 font-mono">₹{order.total}</span>
                </div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-xs text-emerald-400 uppercase font-black tracking-wider">Table Total:</span>
                  <span className="text-xl font-black text-emerald-400 font-mono">₹{order.sessionTotal}</span>
                </div>
              </div>
            ) : (
              <div>
                <span className="text-[10px] text-[#849a90] uppercase font-bold tracking-wider">Bill Total:</span>
                <span className="text-xl font-black text-emerald-400 font-mono ml-2">₹{order.total}</span>
              </div>
            )}

            <div className="text-[11px] font-medium text-[#849a90]">
              {isDelivery ? '🛵 Cash / UPI on Delivery' : '🍽️ Collect at Table / Counter'}
            </div>
          </div>

          {/* Action Row */}
          <div className="w-full">
            {/* NEW Status: 1-Click Accept with Quick Preset Time Selector */}
            {order.status === 'NEW' && (
              <div className="flex flex-col gap-2.5 bg-[#141b18] p-2.5 rounded-xl border border-[#24332d]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#849a90] font-bold flex items-center gap-1">
                    <Clock size={12} className="text-[#e8783c]" />
                    <span>Est. Prep Time:</span>
                  </span>
                  <span className="text-xs font-mono font-black text-[#e8783c]">
                    ~{currentSelectedTime} mins
                  </span>
                </div>

                {/* Preset Time Buttons */}
                <div className="flex items-center gap-1.5">
                  {[15, 20, 30, 45].map(mins => {
                    const isSelected = currentSelectedTime === mins;
                    return (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => {
                          setOrderTimes(prev => ({ ...prev, [order.id]: mins }));
                          setShowCustomTimeFor(null);
                        }}
                        className={`flex-1 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#e8783c] text-white shadow-md shadow-[#e8783c]/30'
                            : 'bg-[#1d2723] text-[#849a90] hover:text-white border border-[#2a3832]'
                        }`}
                      >
                        {mins}m
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setShowCustomTimeFor(showCustomTimeFor === order.id ? null : order.id)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      showCustomTimeFor === order.id
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-[#1d2723] text-[#849a90] hover:text-white border-[#2a3832]'
                    }`}
                  >
                    Custom
                  </button>
                </div>

                {/* Optional Custom Minutes Input */}
                {showCustomTimeFor === order.id && (
                  <div className="flex items-center gap-2 pt-1 border-t border-[#24332d]">
                    <span className="text-[11px] text-[#849a90]">Minutes:</span>
                    <input
                      type="number"
                      min="5"
                      max="180"
                      value={customTimeInputs[order.id] || currentSelectedTime}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val > 0) {
                          setCustomTimeInputs(prev => ({ ...prev, [order.id]: e.target.value }));
                          setOrderTimes(prev => ({ ...prev, [order.id]: val }));
                        }
                      }}
                      className="w-20 bg-[#1d2723] border border-[#2a3832] rounded-lg px-2 py-1 text-xs text-white text-center font-mono focus:border-[#e8783c] outline-none"
                    />
                    <span className="text-[11px] text-[#849a90]">mins</span>
                  </div>
                )}

                {/* Primary CTA: 1-Click Accept */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={updatingId === order.id}
                    onClick={() => setRejectingOrder(order)}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    disabled={updatingId === order.id}
                    onClick={() => handleStatusUpdate(order.id, 'ACCEPTED', undefined, currentSelectedTime)}
                    className="flex-1 bg-[#e8783c] hover:bg-[#f08b55] text-white py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#e8783c]/30 disabled:opacity-50 cursor-pointer"
                  >
                    <Check size={14} strokeWidth={3} />
                    <span>ACCEPT & COOK ({currentSelectedTime}m)</span>
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
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-4 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
              >
                <ChefHat size={15} />
                <span>START COOKING NOW</span>
              </button>
            )}

            {/* PREPARING / IN_PROGRESS: Ready for Serve or Delivery */}
            {(order.status === 'PREPARING' || order.status === 'IN_PROGRESS') && (
              <button
                type="button"
                disabled={updatingId === order.id}
                onClick={() => handleStatusUpdate(order.id, 'READY')}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2.5 px-4 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 size={15} />
                <span>{isDelivery ? 'READY FOR PACKING' : 'READY TO SERVE'}</span>
              </button>
            )}

            {/* READY Status: Mark Delivered / Table Served */}
            {order.status === 'READY' && (
              <button
                type="button"
                disabled={updatingId === order.id}
                onClick={() => handleStatusUpdate(order.id, isDelivery ? 'DELIVERED' : 'COMPLETED')}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-2.5 px-4 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 size={15} />
                <span>{isDelivery ? 'MARK DELIVERED' : 'TABLE SERVED'}</span>
              </button>
            )}

            {/* COMPLETED or DELIVERED */}
            {(order.status === 'COMPLETED' || order.status === 'DELIVERED') && (
              <div className="flex items-center justify-center gap-1.5 text-xs font-black text-emerald-400 bg-emerald-500/10 py-2 rounded-xl border border-emerald-500/20">
                <CheckCircle2 size={14} />
                <span>Completed</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // Sub-Component: Kanban Stage Column
  // ==========================================
  const Column = ({ 
    title, 
    columnOrders, 
    icon: Icon, 
    colorClass,
    accentBorder
  }: { 
    title: string;
    columnOrders: CustomerOrder[];
    icon: any;
    colorClass: string;
    accentBorder: string;
  }) => (
    <div className="flex flex-col gap-3 min-w-[310px] flex-1 bg-[#1a2320]/80 rounded-2xl p-3.5 border border-[#24332d] shadow-lg">
      {/* Column Header */}
      <div className={`flex items-center gap-2 pb-2.5 border-b-2 ${accentBorder}`}>
        <Icon size={16} className={colorClass} />
        <h2 className="font-extrabold text-xs tracking-wider uppercase text-white">{title}</h2>
        <span className="ml-auto bg-[#141b18] px-2 py-0.5 rounded-full text-xs font-black border border-[#2a3832] text-white">
          {columnOrders.length}
        </span>
      </div>
      
      {/* Column Scroll Container */}
      <div className="flex flex-col gap-3.5 overflow-y-auto custom-scrollbar pr-1 flex-1 min-h-0">
        {columnOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-44 text-center border-2 border-dashed border-[#24332d] rounded-2xl text-[#62756d] p-4 bg-[#141b18]/40">
            {loading ? (
              <RefreshCw className="animate-spin text-[#849a90] mb-2" size={18} />
            ) : loadFailed ? (
              'Connection error'
            ) : (
              <div className="text-xs text-[#849a90]">No orders in this stage</div>
            )}
          </div>
        ) : (
          columnOrders.map(order => <OrderCard key={order.id} order={order} />)
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* ==========================================
          Executive Command Header (Unified 2-Row Bar)
          ========================================== */}
      <div className="mb-4 bg-[#151c19] rounded-2xl border border-[#24332d] p-4 shadow-xl">
        {/* Row 1: Title, Live State, Sound Toggle & View Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-[#24332d]">
          {/* Left: Title & Live Pulse */}
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  Kitchen Orders & KDS
                </h1>
                <div className={`flex items-center gap-1.5 text-[11px] font-black px-2.5 py-0.5 rounded-full border shadow-inner ${
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
                  <span>{isSseConnected ? 'LIVE REALTIME' : 'POLLING'}</span>
                </div>
              </div>
              <p className="text-[#849a90] text-xs mt-0.5 hidden sm:block">
                Instant digital dispatch from customer table QR stands and online delivery.
              </p>
            </div>
          </div>

          {/* Right: Audio Control, Speaker Test, and View Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={toggleAudio}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                audioEnabled 
                  ? 'bg-[#1d2723] border-emerald-500/40 text-emerald-400' 
                  : 'bg-[#141b18] border-[#2a3832] text-[#62756d]'
              }`}
              title="Toggle sound buzzer chime for new orders"
            >
              {audioEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              <span>{audioEnabled ? 'Sound ON' : 'Muted'}</span>
            </button>

            {/* Test Speaker Button */}
            {audioEnabled && (
              <button
                type="button"
                onClick={testAudioChime}
                className="px-2.5 py-1.5 rounded-xl bg-[#1d2723] hover:bg-[#273530] text-[#849a90] hover:text-white border border-[#2a3832] text-xs font-medium transition-colors cursor-pointer"
                title="Play test audio chime"
              >
                <Volume1 size={13} />
              </button>
            )}

            {/* Manual Refresh */}
            <button
              type="button"
              onClick={() => fetchOrders()}
              className="p-1.5 rounded-xl bg-[#1d2723] hover:bg-[#273530] text-[#849a90] hover:text-white border border-[#2a3832] transition-colors cursor-pointer"
              title="Refresh orders list"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-[#e8783c]' : ''} />
            </button>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#141b18] border border-[#2a3832]">
              <button
                type="button"
                onClick={() => setViewMode('KANBAN')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'KANBAN'
                    ? 'bg-[#e8783c] text-white shadow-md shadow-[#e8783c]/30'
                    : 'text-[#849a90] hover:text-white'
                }`}
              >
                <Kanban size={13} />
                <span>Kanban</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('TABLE_MATRIX')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'TABLE_MATRIX'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-[#849a90] hover:text-white'
                }`}
              >
                <LayoutGrid size={13} />
                <span>Table Floor ({tableGroups.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Service Filter Pills, Search Bar, and Sort */}
        <div className="pt-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Service Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                filterType === 'ALL'
                  ? 'bg-white text-[#151c19] shadow-sm'
                  : 'bg-[#1a2320] text-[#849a90] hover:text-white border border-[#2a3832]'
              }`}
            >
              <span>All Orders</span>
              <span className="px-1.5 py-0.5 rounded-md bg-black/15 text-[10px] font-mono">{orders.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterType('DINE_IN')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                filterType === 'DINE_IN'
                  ? 'bg-[#e8783c] text-white shadow-sm shadow-[#e8783c]/20'
                  : 'bg-[#1a2320] text-[#849a90] hover:text-white border border-[#2a3832]'
              }`}
            >
              <UtensilsCrossed size={13} />
              <span>Dine-In</span>
              <span className="px-1.5 py-0.5 rounded-md bg-black/20 text-[10px] font-mono">{dineInCount}</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterType('DELIVERY')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                filterType === 'DELIVERY'
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20'
                  : 'bg-[#1a2320] text-[#849a90] hover:text-white border border-[#2a3832]'
              }`}
            >
              <Bike size={13} />
              <span>Delivery</span>
              <span className="px-1.5 py-0.5 rounded-md bg-black/20 text-[10px] font-mono">{deliveryCount}</span>
            </button>
          </div>

          {/* Search Bar & Sort Dropdown */}
          <div className="flex items-center gap-2 flex-1 max-w-lg justify-end">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#849a90]" />
              <input
                type="text"
                placeholder="Search ticket #, table, dish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1a2320] border border-[#2a3832] rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder-[#62756d] focus:outline-none focus:border-[#e8783c]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#849a90] hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'NEWEST' ? 'OLDEST_PENDING' : 'NEWEST')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1a2320] border border-[#2a3832] text-xs font-bold text-[#849a90] hover:text-white transition-colors shrink-0 cursor-pointer"
              title="Toggle sort order"
            >
              <ArrowUpDown size={12} />
              <span>{sortOrder === 'NEWEST' ? 'Newest' : 'Oldest Rush'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recoverable Connection Error Banner */}
      {loadFailed && (
        <div className="mb-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-rose-400 shrink-0" />
            <span>Connection to server lost. Reconnecting automatically...</span>
          </div>
          <button
            type="button"
            onClick={() => fetchOrders()}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            Retry Now
          </button>
        </div>
      )}

      {/* High-Visibility Unaccepted Order Alert Banner */}
      {unacceptedOrders.length > 0 && (
        <div className="mb-3 bg-gradient-to-r from-amber-500/15 via-[#e8783c]/15 to-amber-500/15 border-2 border-[#e8783c] rounded-2xl p-3 md:px-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shadow-[#e8783c]/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#e8783c] text-white shadow-md shadow-[#e8783c]/30 animate-bounce">
              <BellRing size={18} />
            </div>
            <div>
              <div className="text-xs md:text-sm font-black text-white flex items-center gap-2">
                <span>{unacceptedOrders.length} New Customer Order{unacceptedOrders.length > 1 ? 's' : ''} Awaiting Kitchen Confirmation!</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-200 border border-rose-500/40 animate-pulse">
                  Action Required
                </span>
              </div>
              <div className="text-[11px] text-amber-200/90 mt-0.5">
                Set preparation time to begin cooking and start customer live tracking timer.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setMobileStage('NEW');
                setViewMode('KANBAN');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#e8783c] hover:bg-[#f08b55] text-white font-black text-xs transition-all shadow-md shadow-[#e8783c]/30 cursor-pointer"
            >
              Review {unacceptedOrders.length} New
            </button>
            <button
              type="button"
              onClick={() => setBuzzerSnoozed(prev => !prev)}
              className="px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              title="Snooze audio alert"
            >
              {buzzerSnoozed ? '🔕 Buzzer Muted' : '🔔 Mute Buzzer'}
            </button>
          </div>
        </div>
      )}

      {/* Mobile Stage Selector Tabs (Visible on screens < 1024px) */}
      <div className="flex lg:hidden items-center gap-1.5 mb-3 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setMobileStage('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer ${
            mobileStage === 'ALL' ? 'bg-[#384a42] text-white' : 'bg-[#151c19] text-[#849a90] border border-[#2a3832]'
          }`}
        >
          All Stages
        </button>
        <button
          type="button"
          onClick={() => setMobileStage('NEW')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer ${
            mobileStage === 'NEW' ? 'bg-[#e8783c] text-white' : 'bg-[#151c19] text-[#849a90] border border-[#2a3832]'
          }`}
        >
          <span>New</span>
          <span className="px-1 rounded bg-black/20 text-[10px]">{newOrders.length}</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileStage('COOKING')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer ${
            mobileStage === 'COOKING' ? 'bg-blue-600 text-white' : 'bg-[#151c19] text-[#849a90] border border-[#2a3832]'
          }`}
        >
          <span>Cooking</span>
          <span className="px-1 rounded bg-black/20 text-[10px]">{inProgressOrders.length}</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileStage('READY')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer ${
            mobileStage === 'READY' ? 'bg-purple-600 text-white' : 'bg-[#151c19] text-[#849a90] border border-[#2a3832]'
          }`}
        >
          <span>Ready</span>
          <span className="px-1 rounded bg-black/20 text-[10px]">{readyOrders.length}</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileStage('DONE')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer ${
            mobileStage === 'DONE' ? 'bg-emerald-600 text-white' : 'bg-[#151c19] text-[#849a90] border border-[#2a3832]'
          }`}
        >
          <span>Done</span>
          <span className="px-1 rounded bg-black/20 text-[10px]">{completedOrders.length}</span>
        </button>
      </div>

      {/* Main View Area (Kanban vs Table Floor Matrix) */}
      {viewMode === 'TABLE_MATRIX' ? (
        <TableMatrixView />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1 min-h-0 custom-scrollbar">
          {(mobileStage === 'ALL' || mobileStage === 'NEW') && (
            <Column 
              title="New Orders" 
              columnOrders={newOrders} 
              icon={Clock} 
              colorClass="text-[#e8783c]"
              accentBorder="border-[#e8783c]" 
            />
          )}
          {(mobileStage === 'ALL' || mobileStage === 'COOKING') && (
            <Column 
              title="Cooking / Preparing" 
              columnOrders={inProgressOrders} 
              icon={ChefHat} 
              colorClass="text-blue-400"
              accentBorder="border-blue-400" 
            />
          )}
          {(mobileStage === 'ALL' || mobileStage === 'READY') && (
            <Column 
              title="Ready to Serve" 
              columnOrders={readyOrders} 
              icon={CheckCircle2} 
              colorClass="text-purple-400"
              accentBorder="border-purple-400" 
            />
          )}
          {(mobileStage === 'ALL' || mobileStage === 'DONE') && (
            <Column 
              title="Completed / Delivered" 
              columnOrders={completedOrders} 
              icon={Check} 
              colorClass="text-emerald-400"
              accentBorder="border-emerald-400" 
            />
          )}
        </div>
      )}

      {/* ==========================================
          Modals
          ========================================== */}

      {/* Order Decline Modal */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#1a2320] border border-[#2a3832] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-[#2a3832] mb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <AlertTriangle size={18} className="text-rose-400" /> 
                <span>Decline Order #{rejectingOrder.id.substring(0, 8)}</span>
              </h3>
              <button 
                type="button"
                onClick={() => setRejectingOrder(null)} 
                className="text-[#849a90] hover:text-white cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[#849a90] mb-3">
              Select reason for declining this order. The customer will receive an immediate live update.
            </p>

            <div className="space-y-2 mb-5">
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
                  className={`w-full text-left p-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    rejectReason === reason 
                      ? 'bg-rose-500/10 border-rose-500 text-rose-300' 
                      : 'bg-[#141b18] border-[#24332d] text-[#849a90] hover:text-white'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setRejectingOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#849a90] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updatingId === rejectingOrder.id}
                onClick={() => handleStatusUpdate(rejectingOrder.id, 'CANCELLED', rejectReason)}
                className="px-5 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white transition-colors disabled:opacity-50 shadow-md shadow-rose-600/30 cursor-pointer"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time Adjustment Modal */}
      {timeAdjustOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a2320] border border-[#2a3832] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-[#2a3832] mb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Clock size={18} className="text-[#e8783c]" /> 
                <span>Adjust {timeAdjustOrder.orderType === 'DELIVERY' ? 'Delivery' : 'Preparation'} Time</span>
              </h3>
              <button 
                type="button"
                onClick={() => setTimeAdjustOrder(null)} 
                className="text-[#849a90] hover:text-white cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[#849a90] mb-3">
              Order #{timeAdjustOrder.id.substring(0, 8)} ({timeAdjustOrder.customerName || 'Customer'})
              <br />
              Setting a new time will recalculate customer ETA and update their live screen.
            </p>

            <div className="mb-4 bg-[#141b18] p-4 rounded-xl border border-[#24332d] text-center">
              <div className="text-[11px] text-[#849a90] mb-1 uppercase tracking-wider font-bold">New Estimated Time</div>
              <div className="text-3xl font-black text-[#e8783c] font-mono">~{adjustMinutes} Mins</div>
            </div>

            {/* Quick preset buttons */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[15, 20, 30, 45, 60, 75, 90].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setAdjustMinutes(mins)}
                  className={`p-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                    adjustMinutes === mins
                      ? 'bg-[#e8783c] border-[#e8783c] text-white shadow-md shadow-[#e8783c]/30'
                      : 'bg-[#141b18] border-[#24332d] text-[#849a90] hover:text-white'
                  }`}
                >
                  {mins}m
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAdjustMinutes(prev => prev + 5)}
                className="p-2 rounded-xl text-xs font-black border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 cursor-pointer"
              >
                +5m Rush
              </button>
            </div>

            {/* Custom Input */}
            <div className="flex items-center gap-3 mb-5 bg-[#141b18] p-3 rounded-xl border border-[#24332d]">
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
                className="w-20 bg-[#1a2320] border border-[#2a3832] rounded-lg px-3 py-1 text-sm text-white text-center font-mono focus:border-[#e8783c] outline-none"
              />
              <span className="text-xs text-[#849a90]">minutes</span>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setTimeAdjustOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#849a90] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdatingTime}
                onClick={handleAdjustTime}
                className="px-5 py-2 rounded-xl text-xs font-black bg-[#e8783c] hover:bg-[#f08b55] text-white transition-colors disabled:opacity-50 shadow-md shadow-[#e8783c]/30 cursor-pointer"
              >
                {isUpdatingTime ? 'Updating...' : 'Save & Notify Customer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Detail Modal (From Table Floor Matrix) */}
      {selectedTableModal && currentModalGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a2320] border border-[#2a3832] rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-4 md:p-5 border-b border-[#24332d] bg-[#151c19]">
              <div>
                <div className="text-xl font-black text-white font-serif flex items-center gap-2">
                  <span>TABLE {currentModalGroup.tableNumber}</span>
                  <span className="text-xs font-mono text-emerald-400 font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                    Running Total: ₹{currentModalGroup.totalBill}
                  </span>
                </div>
                <div className="text-xs text-[#849a90] mt-0.5 font-mono">
                  {currentModalGroup.orders.length} order rounds • Seated {formatElapsedTime(currentModalGroup.seatedTime)}
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedTableModal(null)} 
                className="text-[#849a90] hover:text-white p-1 cursor-pointer"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 md:p-5 overflow-y-auto space-y-3.5 flex-1 custom-scrollbar">
              {currentModalGroup.orders.map((ord, oIdx) => (
                <div key={ord.id} className="p-3.5 rounded-xl bg-[#141b18] border border-[#24332d] space-y-2.5">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="text-xs font-black text-amber-300 font-mono uppercase flex items-center gap-1.5">
                      <Flame size={12} />
                      <span>Round {ord.roundNumber || (oIdx + 1)} • #{ord.id.substring(0, 6)}</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      ₹{ord.total}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-slate-200">
                        <span className="font-medium">{it.quantity}x {it.name} {it.variant ? `(${it.variant})` : ''}</span>
                        <span className="font-mono text-[#849a90]">
                          ₹{((it.price || 0) + (it.addons ? it.addons.reduce((s, a) => s + (a.price || 0), 0) : 0)) * it.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {ord.notes && (
                    <div className="text-[11px] text-amber-300/90 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 font-medium">
                      Note: {ord.notes}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                    <span className="text-[#849a90]">Status: <strong className="text-white">{ord.status}</strong></span>
                    {ord.status === 'NEW' && (
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(ord.id, 'ACCEPTED', undefined, 20)}
                        className="px-3 py-1 rounded-lg bg-[#e8783c] hover:bg-[#f08b55] text-white font-black text-xs cursor-pointer shadow-sm shadow-[#e8783c]/30"
                      >
                        Accept Round (20m)
                      </button>
                    )}
                    {(ord.status === 'ACCEPTED' || ord.status === 'PREPARING') && (
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(ord.id, 'READY')}
                        className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer"
                      >
                        Mark Ready
                      </button>
                    )}
                    {ord.status === 'READY' && (
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(ord.id, 'COMPLETED')}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                      >
                        Mark Served
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-[#24332d] bg-[#151c19] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => printTableSummary(currentModalGroup.tableNumber, currentModalGroup.orders, currentModalGroup.totalBill)}
                className="px-4 py-2 rounded-xl bg-[#24332d] hover:bg-[#2d4038] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-[#2a3832]"
              >
                <Printer size={14} className="text-amber-400" />
                <span>Print Table Bill / KOT</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTableModal(null)}
                className="px-5 py-2 rounded-xl bg-[#e8783c] hover:bg-[#f08b55] text-white text-xs font-black transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
