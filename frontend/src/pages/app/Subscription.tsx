import { useEffect, useState } from 'react';
import { getSubscription, type AppSubscriptionData } from './appStore';

export default function Subscription() {
  const [data, setData] = useState<AppSubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubscription()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRenew = () => {
    alert('Redirecting to renewal payment flow. The QR code and restaurant identity will remain unchanged.');
    // Normally this would navigate to /pricing?renew=true
  };

  if (loading) return <div>Loading Subscription...</div>;

  const isExpired = data?.expiresAt ? new Date(data.expiresAt) < new Date() : false;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Subscription</h1>
      <div className="bg-[#1d2723] rounded-xl p-6 border border-[#2a3832] space-y-4">
        <div>
          <h2 className="text-[#849a90] text-sm uppercase font-semibold">Current Plan</h2>
          <p className="text-xl font-medium text-white">{data?.planId?.toUpperCase() || 'Unknown'}</p>
        </div>
        <div>
          <h2 className="text-[#849a90] text-sm uppercase font-semibold">Status</h2>
          <p className={`text-white ${isExpired ? 'text-red-400 font-bold' : ''}`}>
            {data?.status || 'Unknown'} {isExpired && '(Expired)'}
          </p>
        </div>
        {data?.expiresAt && (
          <div>
            <h2 className="text-[#849a90] text-sm uppercase font-semibold">Expires At</h2>
            <p className="text-white">{new Date(data.expiresAt).toLocaleDateString()}</p>
          </div>
        )}
        
        <div className="pt-4 border-t border-[#2a3832]">
          <button onClick={handleRenew} className="bg-[#e8783c] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#d66a30] transition-colors">
            Renew Plan
          </button>
          <p className="text-xs text-[#849a90] mt-2">Renewing keeps your permanent QR code and menu data intact.</p>
        </div>
      </div>
    </div>
  );
}
