import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import SiteHeader from '../../components/marketing/SiteHeader';
import { AlertCircle } from 'lucide-react';

export default function PurchaseDetailsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPlan = searchParams.get('plan') || 'premium';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [planId] = useState(initialPlan); // Lock it in state

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    phone: '',
    businessName: '',
    city: '',
    address: ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!['basic', 'intermediate', 'premium'].includes(planId)) {
      navigate('/plans');
    }
  }, [planId, navigate]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.customerName.trim()) errors.customerName = 'Name is required';
    if (!formData.customerEmail.trim()) {
      errors.customerEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      errors.customerEmail = 'Please enter a valid email address';
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
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/purchase/orders`, {
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
      
      // Pass orderId via state so it's not exposed in URL if preferred, or store in sessionStorage.
      // The instructions say /purchase/review (without :orderId), so we pass it in state.
      sessionStorage.setItem('pendingOrderId', data.orderId);
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
    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <SiteHeader />
      <div className="pt-32 pb-24 px-6 md:px-12 max-w-2xl mx-auto">
        <div className="mb-8">
          <Link to="/plans" className="text-[#E8783C] hover:underline text-sm font-medium mb-4 inline-block">
            &larr; Back to Plans
          </Link>
          <h1 className="text-3xl font-bold text-[#151C19] mb-2">Account Details</h1>
          <p className="text-[#151C19]/60">
            Tell us about your restaurant to get started with the {planId.toUpperCase()} plan.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          {error && (
            <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-rose-600 mt-0.5 flex-shrink-0" size={20} />
              <div className="text-sm font-medium text-rose-800 leading-relaxed">
                {error}
                {error.includes('already exists') && (
                  <div className="mt-2">
                    <Link to="/admin/login" className="text-rose-600 underline font-bold">
                      Go to Login
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#151C19] mb-2">Owner Name</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#E8783C]/20 focus:border-[#E8783C] transition-all ${
                    validationErrors.customerName ? 'border-rose-300 bg-rose-50' : 'border-gray-200'
                  }`}
                  placeholder="John Doe"
                />
                {validationErrors.customerName && <p className="text-rose-500 text-xs mt-1.5">{validationErrors.customerName}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-[#151C19] mb-2">Email Address</label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#E8783C]/20 focus:border-[#E8783C] transition-all ${
                    validationErrors.customerEmail ? 'border-rose-300 bg-rose-50' : 'border-gray-200'
                  }`}
                  placeholder="john@example.com"
                />
                {validationErrors.customerEmail && <p className="text-rose-500 text-xs mt-1.5">{validationErrors.customerEmail}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#151C19] mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#E8783C]/20 focus:border-[#E8783C] transition-all ${
                    validationErrors.phone ? 'border-rose-300 bg-rose-50' : 'border-gray-200'
                  }`}
                  placeholder="+91 98765 43210"
                />
                {validationErrors.phone && <p className="text-rose-500 text-xs mt-1.5">{validationErrors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#151C19] mb-2">Restaurant Name</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#E8783C]/20 focus:border-[#E8783C] transition-all ${
                    validationErrors.businessName ? 'border-rose-300 bg-rose-50' : 'border-gray-200'
                  }`}
                  placeholder="The Spice Lounge"
                />
                {validationErrors.businessName && <p className="text-rose-500 text-xs mt-1.5">{validationErrors.businessName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#151C19] mb-2">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#E8783C]/20 focus:border-[#E8783C] transition-all ${
                  validationErrors.city ? 'border-rose-300 bg-rose-50' : 'border-gray-200'
                }`}
                placeholder="Mumbai"
              />
              {validationErrors.city && <p className="text-rose-500 text-xs mt-1.5">{validationErrors.city}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#151C19] mb-2">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#E8783C]/20 focus:border-[#E8783C] transition-all resize-none ${
                  validationErrors.address ? 'border-rose-300 bg-rose-50' : 'border-gray-200'
                }`}
                placeholder="123 Restaurant Street..."
              />
              {validationErrors.address && <p className="text-rose-500 text-xs mt-1.5">{validationErrors.address}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 bg-[#151C19] hover:bg-[#151C19]/90 text-white py-4 rounded-xl font-bold transition-colors flex items-center justify-center disabled:opacity-70"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : 'Continue to Review'}
          </button>
        </form>
      </div>
    </div>
  );
}
