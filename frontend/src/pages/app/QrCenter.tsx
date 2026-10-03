import { useEffect, useState } from 'react';
import { getQr, type AppQrData } from './appStore';

export default function QrCenter() {
  const [_data, setData] = useState<AppQrData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getQr()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading QR Center...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">QR Center</h1>
      <div className="bg-[#1d2723] rounded-xl p-6 border border-[#2a3832]">
        <p className="text-[#f3f4f6]">Your QR Code settings.</p>
      </div>
    </div>
  );
}
