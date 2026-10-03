import { useEffect, useState } from 'react';
import { getDashboard } from './appStore';

export default function Dashboard() {
  const [_data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1d2723] rounded-xl p-6 border border-[#2a3832]">
          <h2 className="text-[#849a90] text-sm uppercase font-semibold">Total Views</h2>
          <p className="text-3xl font-bold text-white mt-2">--</p>
        </div>
        <div className="bg-[#1d2723] rounded-xl p-6 border border-[#2a3832]">
          <h2 className="text-[#849a90] text-sm uppercase font-semibold">Menu Items</h2>
          <p className="text-3xl font-bold text-white mt-2">--</p>
        </div>
        <div className="bg-[#1d2723] rounded-xl p-6 border border-[#2a3832]">
          <h2 className="text-[#849a90] text-sm uppercase font-semibold">Active Scans</h2>
          <p className="text-3xl font-bold text-white mt-2">--</p>
        </div>
      </div>
    </div>
  );
}
