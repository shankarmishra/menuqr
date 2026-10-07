import { useEffect, useState } from 'react';
import { Clock, Check, ChefHat, CheckCircle2, RefreshCw } from 'lucide-react';
import { useToast } from '../../components/feedback/ToastProvider';
import { getOrders, updateOrderStatus } from './appStore';

type CustomerOrder = {
  id: string;
  tableNumber: string;
  items: any[];
  total: number;
  status: 'NEW' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED';
  time: string;
};

export default function Orders() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [updatingId, setUpdatingId] = useState('');
  const showToast = useToast();

  useEffect(() => {
    let isMounted = true;
    const fetchOrders = async () => {
      try {
        const data = await getOrders();
        if (!isMounted) return;
        // Sort by newest first
        data.sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime());
        setOrders(data);
        setLoadFailed(false);
      } catch {
        if (!orders.length) setLoadFailed(true);
        // Only show toast if it's not polling, or we could just silently fail for polling
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Polling every 10s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: CustomerOrder['status']) => {
    setUpdatingId(id);
    try {
      await updateOrderStatus(id, newStatus);
      const data = await getOrders();
      data.sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setOrders(data);
      showToast('success', `Order marked ${newStatus.replace('_', ' ').toLowerCase()}.`);
    } catch {
      showToast('error', 'Order status was not updated. Please try again.');
    } finally {
      setUpdatingId('');
    }
  };

  const newOrders = orders.filter(o => o.status === 'NEW');
  const acceptedOrders = orders.filter(o => o.status === 'ACCEPTED');
  const inProgressOrders = orders.filter(o => o.status === 'IN_PROGRESS');
  const completedOrders = orders.filter(o => o.status === 'COMPLETED');

  const OrderCard = ({ order }: { order: CustomerOrder }) => {
    const timeFormatted = new Date(order.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <div className="bg-[#151c19] rounded-xl p-5 border border-[#2a3832] flex flex-col gap-4 shadow-lg hover:border-[#36473f] transition-colors">
        <div className="flex justify-between items-start border-b border-[#2a3832] pb-3">
          <div>
            <div className="text-[#849a90] text-xs font-bold tracking-wider mb-1 uppercase">Table</div>
            <div className="text-2xl font-black text-white leading-none">{order.tableNumber || 'N/A'}</div>
          </div>
          <div className="text-right">
            <div className="text-[#62756d] text-xs font-mono mb-1">#{String(order.id).substring(0,8)}</div>
            <div className="text-sm font-semibold text-white flex items-center gap-1.5 justify-end">
              <Clock size={14} className="text-[#e8783c]" /> {timeFormatted}
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {order.items && order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <div className="flex items-start gap-2.5">
                <span className="font-bold text-[#e8783c] bg-[#e8783c]/10 border border-[#e8783c]/20 px-2 py-0.5 rounded text-xs">{item.quantity}x</span>
                <div>
                  <div className="text-white font-medium">{item.name}</div>
                  {item.variant && <div className="text-xs text-[#849a90] mt-0.5">{item.variant}</div>}
                </div>
              </div>
              <div className="text-[#849a90] font-medium">₹{item.price * item.quantity}</div>
            </div>
          ))}
        </div>

        <div className="border-t border-[#2a3832] pt-4 flex justify-between items-center">
          <div className="text-xl font-black text-emerald-400">₹{order.total}</div>
          
          <div className="flex gap-2">
            {order.status === 'NEW' && (
              <button disabled={updatingId === order.id}
                onClick={() => handleStatusUpdate(order.id, 'ACCEPTED')}
                className="bg-[#e8783c] hover:bg-[#f08b55] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Check size={16} /> ACCEPT
              </button>
            )}
            
            {order.status === 'ACCEPTED' && (
              <button disabled={updatingId === order.id}
                onClick={() => handleStatusUpdate(order.id, 'IN_PROGRESS')}
                className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <ChefHat size={16} /> COOKING
              </button>
            )}

            {order.status === 'IN_PROGRESS' && (
              <button disabled={updatingId === order.id}
                onClick={() => handleStatusUpdate(order.id, 'COMPLETED')}
                className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle2 size={16} /> SERVE
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const Column = ({ title, orders, icon: Icon, colorClass }: { title: string, orders: CustomerOrder[], icon: any, colorClass: string }) => (
    <div className="flex flex-col gap-4 min-w-[320px] flex-1 bg-[#1d2723] rounded-2xl p-4 border border-[#2a3832]">
      <div className={`flex items-center gap-2.5 pb-3 border-b-2 ${colorClass}`}>
        <Icon size={18} />
        <h2 className="font-bold text-base tracking-wide uppercase">{title}</h2>
        <span className="ml-auto bg-[#151c19] px-2.5 py-0.5 rounded text-xs font-black border border-[#2a3832]">
          {orders.length}
        </span>
      </div>
      
      <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1" style={{ maxHeight: 'calc(100vh - 220px)' }}>
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center border-2 border-dashed border-[#2a3832] rounded-xl text-[#62756d]">
            {loading ? <RefreshCw className="animate-spin text-[#849a90]" size={20} /> : loadFailed ? 'Unavailable' : 'No orders'}
          </div>
        ) : (
          orders.map(order => <OrderCard key={order.id} order={order} />)
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Order Reception</h1>
          <p className="text-[#849a90] text-sm">Manage incoming live orders from your customers.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#e8783c] bg-[#e8783c]/10 px-4 py-2 rounded-lg border border-[#e8783c]/20 shadow-inner">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e8783c] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#e8783c]"></span>
          </span>
          LIVE SYNC ACTIVE
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 flex-1 custom-scrollbar">
        <Column title="New" orders={newOrders} icon={Clock} colorClass="border-[#e8783c] text-[#e8783c]" />
        <Column title="Accepted" orders={acceptedOrders} icon={Check} colorClass="border-blue-400 text-blue-400" />
        <Column title="Preparing" orders={inProgressOrders} icon={ChefHat} colorClass="border-purple-400 text-purple-400" />
        <Column title="Ready" orders={completedOrders} icon={CheckCircle2} colorClass="border-emerald-400 text-emerald-400" />
      </div>
    </div>
  );
}
