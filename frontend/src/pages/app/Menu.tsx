import { useEffect, useState } from 'react';
import { getSubscription, type AppSubscriptionData } from './appStore';
import { Link } from 'react-router-dom';

export default function Menu() {
  const [sub, setSub] = useState<AppSubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditLocked, setIsEditLocked] = useState(false);

  useEffect(() => {
    getSubscription()
      .then((data) => {
        setSub(data);
        if (data.planId === 'BASIC' || data.planId === 'basic') {
          const used = localStorage.getItem('basic_menu_edit_used') === 'true';
          setIsEditLocked(used);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = () => {
    if (sub?.planId?.toUpperCase() === 'BASIC') {
      localStorage.setItem('basic_menu_edit_used', 'true');
      setIsEditLocked(true);
    }
    alert('Menu saved successfully!');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Menu Items</h1>
      
      {sub?.planId?.toUpperCase() === 'BASIC' && isEditLocked && (
        <div className="bg-[#e8783c15] text-[#e8783c] border border-[#e8783c] p-4 rounded-xl flex items-center justify-between">
          <span>Your included edit has been used. Upgrade to unlock unlimited edits.</span>
          <Link to="/app/subscription" className="bg-[#e8783c] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#d66a30]">
            Upgrade Plan
          </Link>
        </div>
      )}
      {sub?.planId?.toUpperCase() === 'BASIC' && !isEditLocked && (
        <div className="bg-[#34B56A]/10 text-[#34B56A] border border-[#34B56A] p-4 rounded-xl">
          <span>You have 1 included menu edit available on the Basic plan.</span>
        </div>
      )}

      <div className="bg-[#1d2723] rounded-xl p-6 border border-[#2a3832]">
        <p className="text-[#f3f4f6]">Menu management coming soon.</p>
        
        {(!isEditLocked || sub?.planId?.toUpperCase() !== 'BASIC') ? (
          <button onClick={handleEdit} className="mt-4 bg-[#e8783c] text-white px-4 py-2 rounded-lg font-medium text-sm">
            Save Menu (Simulate Edit)
          </button>
        ) : null}
      </div>
    </div>
  );
}
