import { useEffect, useState } from 'react';
import { getOrders } from './clientStore';
import { Receipt, Search, AlertTriangle } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = () => {
    setIsLoading(true);
    setLoadError('');
    getOrders()
      .then((data) => {
        setOrders(data || []);
        setIsLoading(false);
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : 'Failed to load orders.');
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredOrders = orders.filter(o => 
    (o.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.business_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 pb-32">
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Orders</h1>
          <p className="text-[#aab7b2]">Track all subscription purchases and status.</p>
        </div>
      </header>

      {loadError && (
        <div role="alert" className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="text-rose-400 shrink-0" />
            <span className="text-sm font-medium">{loadError}</span>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}
      
      <div className="mb-8 flex flex-wrap gap-4">
        <label className="relative flex-1 min-w-[280px]">
          <span className="sr-only">Search orders</span>
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aab7b2]" />
          <input
            type="text"
            placeholder="Search by ID, customer, or business..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border-none bg-[#1d2723] py-3 pl-11 pr-4 text-[#e2e8e6] placeholder:text-[#aab7b2] focus:ring-2 focus:ring-[#e8783c] focus:outline-none shadow-inner"
          />
        </label>
      </div>

      <div className="rounded-2xl bg-[#1d2723] border border-[#2a3631] shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#aab7b2]">
            <thead className="border-b border-[#2a3631] bg-[#151c19] text-xs uppercase text-[#73827d]">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Order ID</th>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Date</th>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Customer</th>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Business</th>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Plan</th>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a3631]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">Loading orders...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Receipt size={48} className="mx-auto mb-4 text-[#2a3631]" />
                    <p>No orders found.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-[#202b27] transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-[#e2e8e6]">{order.customer_name}<br/><span className="text-xs text-[#aab7b2]">{order.customer_email}</span></td>
                    <td className="px-6 py-4 text-white font-medium">{order.business_name}</td>
                    <td className="px-6 py-4">{order.plan_id}</td>
                    <td className="px-6 py-4 font-bold text-white">{order.currency} {order.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        order.status === 'PROVISIONED' ? 'bg-[#34b56a]/20 text-[#34b56a]' :
                        order.status === 'PAID' ? 'bg-[#34b56a]/20 text-[#34b56a]' :
                        order.status === 'FAILED' ? 'bg-[#ff5e4d]/20 text-[#ff5e4d]' :
                        'bg-[#ffc928]/20 text-[#ffc928]'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
