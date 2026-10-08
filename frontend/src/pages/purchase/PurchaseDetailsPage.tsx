import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import SiteHeader from '../../components/marketing/SiteHeader';
import { AlertCircle, CheckCircle2, ChevronRight, ShieldCheck, MapPin } from 'lucide-react';

const PLANS: Record<string, { price: number; label: string; features: string[] }> = {
  basic: {
    price: 999,
    label: 'Basic',
    features: ['1 QR Code', 'Unlimited menu views', 'Up to 50 items', 'Basic templates', 'Email support']
  },
  intermediate: {
    price: 1499,
    label: 'Intermediate',
    features: ['1 QR Code', 'Unlimited menu views', 'Unlimited items', 'All templates', 'Priority support', 'Analytics dashboard']
  },
  premium: {
    price: 2999,
    label: 'Premium',
    features: ['1 QR Code', 'Unlimited menu views', 'Unlimited items', 'All templates', '24/7 support', 'Analytics dashboard', 'Table ordering']
  }
};

export default function PurchaseDetailsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPlan = searchParams.get('plan') || 'premium';
  
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [error, setError] = useState('');
  const [planId] = useState(initialPlan);

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    phone: '',
    businessName: '',
    city: '',
    address: '',
    password: ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!['basic', 'intermediate', 'premium'].includes(planId)) {
      navigate('/plans');
    }
  }, [planId, navigate]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || '';
            
            // Format a nicer display address if possible, else use full display_name
            const parts = [
              addr.amenity || addr.shop || addr.building,
              addr.road,
              addr.suburb || addr.neighbourhood,
              city,
              addr.state,
              addr.postcode
            ].filter(Boolean);
            
            const displayAddress = parts.length > 0 ? parts.join(', ') : data.display_name || '';
            
            setFormData(prev => ({
              ...prev,
              city: city,
              address: displayAddress
            }));
            
            setValidationErrors(prev => ({
              ...prev,
              city: '',
              address: ''
            }));
          }
        } catch (error) {
          console.error("Error fetching address:", error);
          alert('Could not fetch address automatically. Please enter it manually.');
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert('Could not access your location. Please allow location permissions or enter manually.');
        setGettingLocation(false);
      },
      { timeout: 10000 }
    );
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.customerName.trim()) errors.customerName = 'Name is required';
    if (!formData.customerEmail.trim()) {
      errors.customerEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      errors.customerEmail = 'Please enter a valid email address';
    }
    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    if (!formData.businessName.trim()) errors.businessName = 'Restaurant name is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.address.trim()) errors.address = 'Address is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/purchase/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          planId: planId.toUpperCase(),
          currency: 'INR'
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409 || data.error?.toLowerCase().includes('already exists')) {
          throw new Error('An account already exists with this email address. Please login or use a different email.');
        }
        throw new Error(data.error || 'Failed to create order');
      }
      
      sessionStorage.setItem('pendingOrderId', data.orderId);
      if (data.paymentSessionId) {
        sessionStorage.setItem('paymentSessionId', data.paymentSessionId);
        sessionStorage.setItem('cashfreeMode', data.cashfreeMode || 'sandbox');
      }
      navigate(`/purchase/review`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const plan = PLANS[planId] || PLANS['premium'];

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col">
      <SiteHeader />
      
      <main className="flex-1 pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <Link to="/plans" className="text-[#E8783C] hover:underline text-sm font-medium mb-4 flex items-center gap-1 w-fit">
            &larr; Back to Plans
          </Link>
          <h1 className="text-4xl font-extrabold text-[#151C19] mb-3 tracking-tight">Complete your account setup</h1>
          <p className="text-[#151C19]/60 text-lg">
            Tell us about your restaurant to get started with the {plan.label} plan.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Form Section */}
          <div className="lg:col-span-7 xl:col-span-8 order-2 lg:order-1">
            <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
              {error && (
                <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="text-rose-600 mt-0.5 flex-shrink-0" size={20} />
                  <div className="text-sm font-medium text-rose-800 leading-relaxed">
                    {error}
                    {error.includes('already exists') && (
                      <div className="mt-2">
                        <Link to="/login" className="text-rose-600 underline font-bold hover:text-rose-700">
                          Go to Login &rarr;
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#151C19] mb-1.5">Owner Name</label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E8783C]/20 focus:border-[#E8783C] transition-all text-sm ${
                        validationErrors.customerName ? 'border-rose-300 bg-rose-50' : 'border-gray-200'
                      }`}
                      placeholder="e.g. John Doe"
                    />
                    {validationErrors.customerName && <p className="text-rose-500 text-[10px] mt-1 font-medium">{validationErrors.customerName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-[#151C19] mb-1.5">Email Address</label>
                    <input
                      type="email"
                      name="customerEmail"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E8783C]/20 focus:border-[#E8783C] transition-all text-sm ${
                        validationErrors.customerEmail ? 'border-rose-300 bg-rose-50' : 'border-gray-200'
                      }`}
                      placeholder="john@example.com"
                    />
                    {validationErrors.customerEmail && <p className="text-rose-500 text-[10px] mt-1 font-medium">{validationErrors.customerEmail}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#151C19] mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E8783C]/20 focus:border-[#E8783C] transition-all text-sm ${
                        validationErrors.phone ? 'border-rose-300 bg-rose-50' : 'border-gray-200'
                      }`}
                      placeholder="+91 98765 43210"
                    />
                    {validationErrors.phone && <p className="text-rose-500 text-[10px] mt-1 font-medium">{validationErrors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#151C19] mb-1.5">Restaurant Name</label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E8783C]/20 focus:border-[#E8783C] transition-all text-sm ${
                        validationErrors.businessName ? 'border-rose-300 bg-rose-50' : 'border-gray-200'
                      }`}
                      placeholder="The Spice Lounge"
                    />
                    {validationErrors.businessName && <p className="text-rose-500 text-[10px] mt-1 font-medium">{validationErrors.businessName}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#151C19] mb-1.5">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E8783C]/20 focus:border-[#E8783C] transition-all text-sm ${
                        validationErrors.city ? 'border-rose-300 bg-rose-50' : 'border-gray-200'
                      }`}
                      placeholder="e.g. Mumbai"
                    />
                    {validationErrors.city && <p className="text-rose-500 text-[10px] mt-1 font-medium">{validationErrors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#151C19] mb-1.5">Create Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E8783C]/20 focus:border-[#E8783C] transition-all text-sm ${
                        validationErrors.password ? 'border-rose-300 bg-rose-50' : 'border-gray-200'
                      }`}
                      placeholder="Minimum 6 characters"
                    />
                    {validationErrors.password && <p className="text-rose-500 text-[10px] mt-1 font-medium">{validationErrors.password}</p>}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#151C19]">Address</label>
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      className="text-xs text-[#E8783C] font-semibold flex items-center gap-1 hover:underline disabled:opacity-50"
                      disabled={gettingLocation}
                    >
                      {gettingLocation ? (
                        <span className="animate-pulse">Detecting...</span>
                      ) : (
                        <>
                          <MapPin size={12} />
                          Detect Location
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E8783C]/20 focus:border-[#E8783C] transition-all text-sm ${
                      validationErrors.address ? 'border-rose-300 bg-rose-50' : 'border-gray-200'
                    }`}
                    placeholder="123 Restaurant Street..."
                  />
                  {validationErrors.address && <p className="text-rose-500 text-[10px] mt-1 font-medium">{validationErrors.address}</p>}
                </div>
              </div>

              <div className="mt-10">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#E8783C] hover:bg-[#d66a30] text-white py-5 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-[#E8783C]/20 hover:shadow-[#E8783C]/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:shadow-none"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      Continue to Review
                      <ChevronRight size={20} />
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-2 mt-6 text-sm text-[#151C19]/50 font-medium">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  Your information is securely encrypted
                </div>
              </div>
            </form>
          </div>

          {/* Summary Section */}
          <div className="lg:col-span-5 xl:col-span-4 order-1 lg:order-2">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm sticky top-32">
              <h3 className="text-lg font-bold text-[#151C19] mb-6 border-b border-gray-100 pb-4">Order Summary</h3>
              
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-[#151C19]/60 font-medium mb-1 uppercase tracking-wide text-xs">Selected Plan</p>
                  <h4 className="text-2xl font-black text-[#151C19]">{plan.label}</h4>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-[#151C19]">₹{plan.price}</span>
                  <span className="text-[#151C19]/60 font-medium text-sm block">/ year</span>
                </div>
              </div>

              <div className="space-y-4 mb-8 bg-gray-50/50 p-6 rounded-2xl">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="text-[#E8783C] flex-shrink-0 mt-0.5" size={18} />
                    <span className="text-[#151C19]/80 font-medium text-sm leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 text-sm text-[#151C19]/60 font-medium bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50">
                <ShieldCheck className="text-emerald-500 flex-shrink-0" size={24} />
                <p>30-day money-back guarantee. No questions asked.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
