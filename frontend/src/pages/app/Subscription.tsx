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

  if (loading) return <div>Loading Subscription...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Subscription</h1>
      <div className="bg-[#1d2723] rounded-xl p-6 border border-[#2a3832] space-y-4">
        <div>
          <h2 className="text-[#849a90] text-sm uppercase font-semibold">Current Plan</h2>
          <p className="text-xl font-medium text-white">{data?.plan || 'Unknown'}</p>
        </div>
        <div>
          <h2 className="text-[#849a90] text-sm uppercase font-semibold">Status</h2>
          <p className="text-white">{data?.status || 'Unknown'}</p>
        </div>
      </div>
    </div>
  );
}
