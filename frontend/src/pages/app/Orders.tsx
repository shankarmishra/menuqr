import { useEffect, useState } from 'react';
import { getLiveOrders, updateOrderStatus, type CustomerOrder } from '../admin/clientStore';
import { Clock, Check, ChefHat, CheckCircle2 } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchOrders = async () => {
      try {
        const data = await getLiveOrders();
        if (!isMounted) return;
        // Sort by newest first
        data.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        setOrders(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Polling every 5s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: CustomerOrder['status']) => {
    try {
      await updateOrderStatus(id, newStatus);
      const data = await getLiveOrders();
      data.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setOrders(data);
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const newOrders = orders.filter(o => o.status === 'NEW');
  const acceptedOrders = orders.filter(o => o.status === 'ACCEPTED');
  const inProgressOrders = orders.filter(o => o.status === 'IN_PROGRESS');
  const completedOrders = orders.filter(o => o.status === 'COMPLETED');

  const OrderCard = ({ order }: { order: CustomerOrder }) => {
    const timeFormatted = new Date(order.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <div className="bg-[#1d2723] rounded-xl p-5 border border-[#2a3832] flex flex-col gap-4 shadow-lg">
        <div className="flex justify-between items-start border-b border-[#2a3832] pb-3">
          <div>
            <div className="text-[#a0aeb2] text-xs font-medium mb-1">TABLE</div>
            <div className="text-2xl font-bold text-white leading-none">{order.tableNumber}</div>
          </div>
          <div className="text-right">
            <div className="text-[#a0aeb2] text-xs mb-1">ID: #{order.id}</div>
            <div className="text-sm font-medium text-white flex items-center gap-1 justify-end">
              <Clock size={14} className="text-[#0eb374]" /> {timeFormatted}
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-white bg-[#2a3832] px-2 py-0.5 rounded text-xs">{item.quantity}x</span>
                <div>
                  <div className="text-[#e2e8f0]">{item.name}</div>
                  {item.variant && <div className="text-xs text-[#a0aeb2]">{item.variant}</div>}
                </div>
              </div>
              <div className="text-[#e2e8f0]">₹{item.price * item.quantity}</div>
            </div>
          ))}
        </div>

        <div className="border-t border-[#2a3832] pt-3 flex justify-between items-center">
          <div className="text-lg font-bold text-[#0eb374]">₹{order.total}</div>
          
          <div className="flex gap-2">
            {order.status === 'NEW' && (
              <button 
                onClick={() => handleStatusUpdate(order.id, 'ACCEPTED')}
                className="bg-[#0eb374] hover:bg-[#0c9c64] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
              >
                <Check size={16} /> ACCEPT
              </button>
            )}
            
            {order.status === 'ACCEPTED' && (
              <button 
                onClick={() => handleStatusUpdate(order.id, 'IN_PROGRESS')}
                className="bg-[#e7a52a] hover:bg-[#d69827] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
              >
                <ChefHat size={16} /> COOKING
              </button>
            )}

            {order.status === 'IN_PROGRESS' && (
              <button 
                onClick={() => handleStatusUpdate(order.id, 'COMPLETED')}
                className="bg-[#6785e6] hover:bg-[#5a76cf] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
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
    <div className="flex flex-col gap-4 min-w-[300px] flex-1">
      <div className={`flex items-center gap-2 pb-2 border-b-2 ${colorClass}`}>
        <Icon size={18} />
        <h2 className="font-semibold text-lg tracking-wide">{title}</h2>
        <span className="ml-auto bg-[#1d2723] px-2 py-0.5 rounded-full text-xs font-bold border border-[#2a3832]">
          {orders.length}
        </span>
      </div>
      
      <div className="flex flex-col gap-4 overflow-y-auto pb-8" style={{ maxHeight: 'calc(100vh - 180px)' }}>
        {orders.length === 0 ? (
          <div className="text-center p-8 border border-dashed border-[#2a3832] rounded-xl text-[#a0aeb2]">
            No orders
          </div>
        ) : (
          orders.map(order => <OrderCard key={order.id} order={order} />)
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col -mx-2 sm:mx-0">
      <div className="mb-6 px-2 sm:px-0 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Order Reception</h1>
          <p className="text-[#a0aeb2] text-sm">Manage incoming live orders</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-[#0eb374] bg-[#0eb374]/10 px-3 py-1.5 rounded-full border border-[#0eb374]/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0eb374] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0eb374]"></span>
          </span>
          Live Sync
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 px-2 sm:px-0 flex-1 snap-x">
        <div className="snap-center min-w-[300px]">
          <Column title="NEW" orders={newOrders} icon={Clock} colorClass="border-red-500 text-red-500" />
        </div>
        <div className="snap-center min-w-[300px]">
          <Column title="ACCEPTED" orders={acceptedOrders} icon={Check} colorClass="border-[#0eb374] text-[#0eb374]" />
        </div>
        <div className="snap-center min-w-[300px]">
          <Column title="IN PROGRESS" orders={inProgressOrders} icon={ChefHat} colorClass="border-[#e7a52a] text-[#e7a52a]" />
        </div>
        <div className="snap-center min-w-[300px]">
          <Column title="COMPLETED" orders={completedOrders} icon={CheckCircle2} colorClass="border-[#6785e6] text-[#6785e6]" />
        </div>
      </div>
    </div>
  );
}
