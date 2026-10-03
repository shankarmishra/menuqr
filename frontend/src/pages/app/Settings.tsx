import { useEffect, useState } from 'react';
import { getProfile, type AppProfile } from './appStore';

export default function Settings() {
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then(setProfile)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading Settings...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Settings</h1>
      <div className="bg-[#1d2723] rounded-xl p-6 border border-[#2a3832] space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-[#f3f4f6] mb-2">Business Name</label>
          <input 
            type="text" 
            disabled 
            value={profile?.businessName || ''} 
            className="w-full bg-[#151c19] border border-[#2a3832] rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#e8783c] focus:ring-1 focus:ring-[#e8783c33]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#f3f4f6] mb-2">Owner Name</label>
          <input 
            type="text" 
            disabled 
            value={profile?.ownerName || ''} 
            className="w-full bg-[#151c19] border border-[#2a3832] rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#e8783c] focus:ring-1 focus:ring-[#e8783c33]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#f3f4f6] mb-2">Email</label>
          <input 
            type="email" 
            disabled 
            value={profile?.email || ''} 
            className="w-full bg-[#151c19] border border-[#2a3832] rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#e8783c] focus:ring-1 focus:ring-[#e8783c33]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#f3f4f6] mb-2">Menu Slug</label>
          <input 
            type="text" 
            disabled 
            value={profile?.menuSlug || ''} 
            className="w-full bg-[#151c19] border border-[#2a3832] rounded-md px-4 py-2 text-white focus:outline-none focus:border-[#e8783c] focus:ring-1 focus:ring-[#e8783c33]"
          />
        </div>
      </div>
    </div>
  );
}
