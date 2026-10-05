import { useEffect, useState } from 'react';
import { getPayments } from './clientStore';
import { CreditCard, Search } from 'lucide-react';

export default function Payments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    void getPayments().then(data => {
      if (isCurrent) {
        setPayments(data || []);
        setIsLoading(false);
      }
    }).catch(() => {
      if (isCurrent) setIsLoading(false);
    });
    return () => { isCurrent = false; };
  }, []);

  const filteredPayments = payments.filter(p => 
    (p.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.order_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.transaction_id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 pb-32">
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Payments</h1>
          <p className="text-[#aab7b2]">Track transaction history and statuses.</p>
        </div>
      </header>
      
      <div className="mb-8 flex flex-wrap gap-4">
        <label className="relative flex-1 min-w-[280px]">
          <span className="sr-only">Search payments</span>
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aab7b2]" />
          <input
            type="text"
            placeholder="Search by Payment ID, Order ID, or Transaction ID..."
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
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Payment ID</th>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Date</th>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Order ID</th>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Gateway</th>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Transaction ID</th>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a3631]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">Loading payments...</td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <CreditCard size={48} className="mx-auto mb-4 text-[#2a3631]" />
                    <p>No payments found.</p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-[#202b27] transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{payment.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(payment.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-[#e2e8e6] font-mono text-xs">{payment.order_id}</td>
                    <td className="px-6 py-4">{payment.gateway}</td>
                    <td className="px-6 py-4 font-mono text-xs text-[#aab7b2]">{payment.transaction_id}</td>
                    <td className="px-6 py-4 font-bold text-white">{payment.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        payment.status === 'SUCCESS' ? 'bg-[#34b56a]/20 text-[#34b56a]' :
                        payment.status === 'FAILED' ? 'bg-[#ff5e4d]/20 text-[#ff5e4d]' :
                        'bg-[#ffc928]/20 text-[#ffc928]'
                      }`}>
                        {payment.status}
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
