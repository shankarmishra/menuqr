import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import SiteHeader from '../../components/marketing/SiteHeader';
import { AlertCircle, CheckCircle2, ChevronRight, ShieldCheck, MapPin, Star, ExternalLink } from 'lucide-react';

const PLANS: Record<string, { monthlyPrice: number; yearlyPrice: number; label: string; features: string[] }> = {
  basic: {
    monthlyPrice: 699,
    yearlyPrice: 2499,
    label: 'Basic',
    features: ['1 QR Code', 'Unlimited menu views', 'Up to 50 items', 'Basic templates', 'Email support']
  },
  intermediate: {
    monthlyPrice: 1199,
    yearlyPrice: 3999,
    label: 'Intermediate',
    features: ['1 QR Code', 'Unlimited menu views', 'Unlimited items', 'All templates', 'Priority support', 'Analytics dashboard']
  },
  premium: {
    monthlyPrice: 1399,
    yearlyPrice: 8499,
    label: 'Premium',
    features: ['1 QR Code', 'Unlimited menu views', 'Unlimited items', 'All templates', '24/7 support', 'Analytics dashboard', 'Table ordering']
  }
};

const EMAIL_TYPO_MAP: Record<string, string> = {
  'gmai.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmaik.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gmeil.com': 'gmail.com',
  'gmaili.com': 'gmail.com',
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yhoo.com': 'yahoo.com',
  'hotmial.com': 'hotmail.com',
  'hotmaill.com': 'hotmail.com',
  'hotmil.com': 'hotmail.com',
  'outloo.com': 'outlook.com',
  'outlok.com': 'outlook.com',
  'icld.com': 'icloud.com',
  'icloud.con': 'icloud.com',
};

function getSuggestedEmail(email: string): string | null {
  if (!email || !email.includes('@')) return null;
  const parts = email.trim().toLowerCase().split('@');
  if (parts.length !== 2) return null;
  const domain = parts[1];
  const suggestedDomain = EMAIL_TYPO_MAP[domain];
  return suggestedDomain ? parts[0] + '@' + suggestedDomain : null;
}

export default function PurchaseDetailsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialPlan = searchParams.get('plan') || 'premium';
  
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [error, setError] = useState('');
  const [planId] = useState(initialPlan);
  const initialBilling = (searchParams.get('billing') || 'yearly').toLowerCase() === 'monthly' ? 'monthly' : 'yearly';
  const [billingCycle, setBillingCycle] = useState<'yearly' | 'monthly'>(initialBilling);

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    phone: '',
    businessName: '',
    businessType: 'restaurant',
    categoryOther: '',
    city: '',
    state: '',
    address: '',
    outletCount: 1,
    password: '',
    couponCode: '',
    instagram: '',
    facebook: '',
    website: '',
  });

  const [emailVerified, setEmailVerified] = useState(false);
  const [emailVerificationToken, setEmailVerificationToken] = useState('');

  // Email Verification State
  const [emailOtpSending, setEmailOtpSending] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailChallengeId, setEmailChallengeId] = useState('');
  const [emailOtpInput, setEmailOtpInput] = useState('');
  const [emailOtpVerifying, setEmailOtpVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [emailOtpError, setEmailOtpError] = useState('');

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Coupon State
  const [couponValidating, setCouponValidating] = useState(false);
  const [couponApplied, setCouponApplied] = useState<{
    code: string;
    discountPct: number;
    originalAmount: number;
    discountAmount: number;
    finalAmount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState('');

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Add-ons State
  const [isGoogleReviewsSelected, setIsGoogleReviewsSelected] = useState(false);
  const [addonInfo, setAddonInfo] = useState<{ id: string; name: string; description: string; price: number; currency: string }>({
    id: 'google_reviews',
    name: 'Google Reviews Integration',
    description: "Connect your restaurant's Google review page to your MENUQR menu so customers can easily share their experience.",
    price: 499,
    currency: 'INR',
  });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/purchase/addons`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.addons && Array.isArray(data.addons)) {
          const gr = data.addons.find((a: any) => a.id === 'google_reviews');
          if (gr) setAddonInfo(gr);
        }
      })
      .catch(() => {});
  }, []);

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
            const state = addr.state || '';
            
            const parts = [
              addr.amenity || addr.shop || addr.building,
              addr.road,
              addr.suburb || addr.neighbourhood,
              city,
              state,
              addr.postcode
            ].filter(Boolean);
            
            const displayAddress = parts.length > 0 ? parts.join(', ') : data.display_name || '';
            
            setFormData(prev => ({
              ...prev,
              city: city,
              state: state,
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

  const handleSendEmailOtp = async () => {
    if (!formData.customerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      setValidationErrors(prev => ({ ...prev, customerEmail: 'Valid email address is required to send verification code' }));
      return;
    }
    setEmailOtpSending(true);
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/auth/verify-email/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.customerEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send email verification OTP.');
      setEmailChallengeId(data.challengeId);
      setEmailOtpSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEmailOtpSending(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailOtpInput || emailOtpInput.length !== 6) return;
    setEmailOtpVerifying(true);
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/auth/verify-email/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId: emailChallengeId, otp: emailOtpInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP code.');
      setEmailVerified(true);
      if (data.verificationToken) {
        setEmailVerificationToken(data.verificationToken);
      }
      setEmailOtpSent(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEmailOtpVerifying(false);
    }
  };



  const handleApplyCoupon = async () => {
    setCouponError('');
    if (planId === 'basic') {
      setCouponError('Basic plan is not eligible for coupon discounts.');
      return;
    }
    if (!formData.couponCode.trim()) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    setCouponValidating(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/purchase/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.couponCode.trim(),
          planId: planId.toUpperCase(),
          billingCycle,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid coupon code.');
      setCouponApplied({
        code: data.code,
        discountPct: data.discountPct,
        originalAmount: data.originalAmount,
        discountAmount: data.discountAmount,
        finalAmount: data.finalAmount,
      });
    } catch (err: any) {
      setCouponApplied(null);
      setCouponError(err.message);
    } finally {
      setCouponValidating(false);
    }
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
    if (formData.businessType === 'other' && !formData.categoryOther.trim()) {
      errors.categoryOther = 'Please specify your business type';
    }

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
          billingCycle,
          currency: 'INR',
          couponCode: couponApplied?.code || formData.couponCode || null,
          selectedAddons: isGoogleReviewsSelected ? ['google_reviews'] : [],
          emailVerificationToken,
          emailVerified,
          emailChallengeId,
          phoneVerified: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409 || data.error?.toLowerCase().includes('already exists')) {
          throw new Error('An account already exists with this email or phone number. Please log in.');
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'customerEmail') {
      setEmailVerified(false);
      setEmailOtpSent(false);
      setEmailVerificationToken('');
      setEmailOtpError('');
    }
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const plan = PLANS[planId] || PLANS['premium'];
  const addonPrice = isGoogleReviewsSelected ? addonInfo.price : 0;
  const basePlanPrice = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  const planDiscountedPrice = couponApplied ? couponApplied.finalAmount : basePlanPrice;
  const finalPayablePrice = planDiscountedPrice + addonPrice;

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
                    <label className="block text-xs font-semibold text-[#151C19] mb-1.5">Owner Name *</label>
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
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-[#151C19]">Email Address *</label>
                      {emailVerified ? (
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-sm">
                          <CheckCircle2 size={13} /> Verified
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendEmailOtp}
                          disabled={emailOtpSending || !formData.customerEmail.trim() || resendCooldown > 0}
                          className="text-[11px] font-semibold text-[#E8783C] hover:underline disabled:opacity-50"
                        >
                          {emailOtpSending ? 'Sending OTP...' : resendCooldown > 0 ? `Wait ${resendCooldown}s` : emailOtpSent ? 'Resend Code' : 'Verify Email'}
                        </button>
                      )}
                    </div>
                    <input
                      type="email"
                      name="customerEmail"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E8783C]/20 focus:border-[#E8783C] transition-all text-sm ${
                        validationErrors.customerEmail ? 'border-rose-300 bg-rose-50' : 'border-gray-200'
                      }`}
                      placeholder="e.g. owner@gmail.com"
                    />

                    {/* Smart Typo Detection Banner */}
                    {getSuggestedEmail(formData.customerEmail) && !emailVerified && (
                      <div className="mt-1.5 p-2.5 bg-amber-50/90 border border-amber-300 rounded-xl flex items-center justify-between text-xs text-amber-900 shadow-sm animate-fade-in">
                        <span className="flex items-center gap-1.5 font-medium">
                          <AlertCircle size={14} className="text-amber-600 shrink-0" />
                          Did you mean <strong className="font-bold underline text-amber-950">{getSuggestedEmail(formData.customerEmail)}</strong>?
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const fixed = getSuggestedEmail(formData.customerEmail);
                            if (fixed) {
                              setFormData(prev => ({ ...prev, customerEmail: fixed }));
                              setValidationErrors(prev => ({ ...prev, customerEmail: '' }));
                            }
                          }}
                          className="font-bold text-[11px] bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-400 px-2.5 py-1 rounded-lg transition-colors shrink-0 ml-2 shadow-xs"
                        >
                          Fix Spelling
                        </button>
                      </div>
                    )}

                    {validationErrors.customerEmail && (
                      <p className="text-rose-500 text-[11px] mt-1.5 font-medium flex items-center gap-1">
                        <AlertCircle size={12} className="shrink-0" /> {validationErrors.customerEmail}
                      </p>
                    )}

                    {emailOtpSent && !emailVerified && (
                      <div className="mt-2.5 p-3.5 bg-amber-50/80 rounded-xl border border-amber-200 text-xs shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-amber-900">
                            Enter 6-digit code sent to <span className="font-bold underline text-amber-950">{formData.customerEmail}</span>:
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setEmailOtpSent(false);
                              setEmailOtpInput('');
                              setEmailOtpError('');
                            }}
                            className="text-[11px] text-gray-500 hover:text-gray-900 underline ml-2 shrink-0 font-medium"
                          >
                            Change Email
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            value={emailOtpInput}
                            onChange={(e) => {
                              setEmailOtpInput(e.target.value.replace(/[^0-9]/g, ''));
                              if (emailOtpError) setEmailOtpError('');
                            }}
                            className="w-32 px-3 py-2 border border-amber-300 rounded-xl text-center font-mono font-bold text-base tracking-widest bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E8783C]/30 focus:border-[#E8783C]"
                            placeholder="123456"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyEmailOtp}
                            disabled={emailOtpVerifying || emailOtpInput.length !== 6}
                            className="px-4 py-2 bg-[#E8783C] hover:bg-[#d36428] text-white font-bold rounded-xl disabled:opacity-50 transition-colors shadow-sm text-xs"
                          >
                            {emailOtpVerifying ? 'Checking...' : 'Confirm'}
                          </button>
                          {resendCooldown > 0 ? (
                            <span className="text-[11px] text-gray-400 font-medium ml-1">
                              Resend in {resendCooldown}s
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleSendEmailOtp}
                              disabled={emailOtpSending}
                              className="text-[11px] text-[#E8783C] font-semibold hover:underline ml-1 disabled:opacity-50"
                            >
                              {emailOtpSending ? 'Sending...' : 'Resend Code'}
                            </button>
                          )}
                        </div>
                        {emailOtpError && (
                          <p className="mt-2 text-rose-600 text-xs font-medium flex items-center gap-1 bg-rose-50 p-2 rounded-lg border border-rose-200">
                            <AlertCircle size={14} className="shrink-0" /> {emailOtpError}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#151C19] mb-1.5">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E8783C]/20 focus:border-[#E8783C] transition-all text-sm ${
                        validationErrors.phone ? 'border-rose-300 bg-rose-50' : 'border-gray-200'
                      }`}
                      placeholder="+91 98XXXXXXXX"
                    />
                    {validationErrors.phone && <p className="text-rose-500 text-[10px] mt-1 font-medium">{validationErrors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#151C19] mb-1.5">Restaurant / Business Name *</label>
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
                    <label className="block text-xs font-semibold text-[#151C19] mb-1.5">Business Category *</label>
                    <select
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E8783C]/20 focus:border-[#E8783C] transition-all text-sm font-medium"
                    >
                      <option value="restaurant">Restaurant</option>
                      <option value="dhaba">Dhaba</option>
                      <option value="cafe">Café / Coffee Shop</option>
                      <option value="hotel_restaurant">Hotel / Resort Restaurant</option>
                      <option value="bakery">Bakery</option>
                      <option value="qsr">Fast Food / QSR</option>
                      <option value="cloud_kitchen">Cloud Kitchen</option>
                      <option value="food_truck">Food Truck</option>
                      <option value="canteen_mess">Canteen / Mess</option>
                      <option value="catering">Catering Service</option>
                      <option value="sweet_shop">Sweet Shop</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {formData.businessType === 'other' ? (
                    <div>
                      <label className="block text-xs font-semibold text-[#151C19] mb-1.5">Specify Business Type *</label>
                      <input
                        type="text"
                        name="categoryOther"
                        value={formData.categoryOther}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E8783C]/20 focus:border-[#E8783C] transition-all text-sm ${
                          validationErrors.categoryOther ? 'border-rose-300 bg-rose-50' : 'border-gray-200'
                        }`}
                        placeholder="e.g. Ice Cream Parlor"
                      />
                      {validationErrors.categoryOther && <p className="text-rose-500 text-[10px] mt-1 font-medium">{validationErrors.categoryOther}</p>}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-[#151C19] mb-1.5">Number of Outlets</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        name="outletCount"
                        value={formData.outletCount}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E8783C]/20 focus:border-[#E8783C] transition-all text-sm font-medium"
                      />
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#151C19] mb-1.5">City *</label>
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
                    <label className="block text-xs font-semibold text-[#151C19] mb-1.5">State / Region</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E8783C]/20 focus:border-[#E8783C] transition-all text-sm"
                      placeholder="e.g. Maharashtra"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#151C19] mb-1.5">Create Password *</label>
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
                    <label className="block text-xs font-semibold text-[#151C19]">Address *</label>
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

              {/* Optional Online Presence & Social Links */}
              <div className="mt-6 pt-5 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-[#151C19] uppercase tracking-wider">
                    Social Media & Links (Optional)
                  </label>
                  <span className="text-[10px] text-gray-500 font-medium">Can also set up later</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Instagram Profile (Optional)
                    </label>
                    <input
                      type="text"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E8783C]/20 focus:border-[#E8783C] transition-all text-xs font-mono"
                      placeholder="e.g. @yourrestaurant"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Facebook Page (Optional)
                    </label>
                    <input
                      type="text"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E8783C]/20 focus:border-[#E8783C] transition-all text-xs font-mono"
                      placeholder="e.g. facebook.com/yourrestaurant"
                    />
                  </div>
                </div>
              </div>

              {/* Optional Add-on Service: Google Reviews Integration */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-[#151C19] uppercase tracking-wider flex items-center gap-1.5">
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                    Optional Add-on Service
                  </h4>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    +₹{addonInfo.price}/year
                  </span>
                </div>

                <div
                  onClick={() => setIsGoogleReviewsSelected(!isGoogleReviewsSelected)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    isGoogleReviewsSelected
                      ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-400/20'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      id="googleReviewsCheckbox"
                      checked={isGoogleReviewsSelected}
                      onChange={(e) => setIsGoogleReviewsSelected(e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 h-5 w-5 rounded border-gray-300 text-[#E8783C] focus:ring-[#E8783C] cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="googleReviewsCheckbox"
                          className="font-bold text-[#151C19] text-sm cursor-pointer"
                        >
                          {addonInfo.name}
                        </label>
                        <span className="text-xs font-bold text-[#151C19]">
                          ₹{addonInfo.price} <span className="text-gray-400 font-normal">/yr</span>
                        </span>
                      </div>
                      <p className="text-xs text-[#151C19]/70 mt-1 leading-relaxed">
                        {addonInfo.description}
                      </p>

                      {/* Small Live Menu Preview */}
                      <div className="mt-4 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Live Menu Preview
                        </p>
                        <div className="inline-flex items-center gap-2 rounded-lg bg-black text-white px-3 py-1.5 text-xs font-semibold shadow-sm">
                          <Star size={12} className="text-amber-400 fill-amber-400" />
                          <span>Write a Google Review</span>
                          <ExternalLink size={11} className="opacity-70" />
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1.5">
                          Customers tap this button on your existing QR menu to leave verified reviews.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coupon Section (Eligible Plans Only) */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h4 className="text-xs font-bold text-[#151C19] uppercase tracking-wider mb-2">Discount Coupon</h4>
                {planId === 'basic' ? (
                  <p className="text-xs text-gray-400 font-medium italic">Basic plan is not eligible for coupon discounts.</p>
                ) : (
                  <div>
                    <div className="flex gap-2 max-w-md">
                      <input
                        type="text"
                        name="couponCode"
                        value={formData.couponCode}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, couponCode: e.target.value.toUpperCase() }));
                          setCouponError('');
                        }}
                        placeholder="Enter discount code (e.g. MQ15-ABCD-1234)"
                        className="flex-1 px-4 py-2 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white text-sm uppercase font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponValidating || !formData.couponCode.trim()}
                        className="px-5 py-2 bg-[#151C19] hover:bg-black text-white font-bold rounded-xl text-sm transition-all disabled:opacity-50"
                      >
                        {couponValidating ? 'Checking...' : 'Apply'}
                      </button>
                    </div>

                    {couponError && <p className="text-xs text-rose-500 font-semibold mt-2">{couponError}</p>}

                    {couponApplied && (
                      <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                          <CheckCircle2 size={16} className="text-emerald-600" />
                          <span>Coupon <strong>{couponApplied.code}</strong> applied ({couponApplied.discountPct}% OFF)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setCouponApplied(null); setFormData(prev => ({ ...prev, couponCode: '' })); }}
                          className="text-rose-600 font-bold hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                )}
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
              
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-[#151C19]/60 font-medium mb-1 uppercase tracking-wide text-xs">Selected Plan</p>
                  <h4 className="text-2xl font-black text-[#151C19]">{plan.label}</h4>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-[#151C19]">₹{basePlanPrice}</span>
                  <span className="text-[#151C19]/60 font-medium text-xs block">
                    {billingCycle === 'yearly' ? '/ year' : '/ month'}
                  </span>
                </div>
              </div>

              {/* Billing Cycle Toggle in Order Summary */}
              <div className="bg-gray-100 p-1 rounded-xl flex items-center mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setBillingCycle('yearly');
                    setCouponApplied(null);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                    billingCycle === 'yearly'
                      ? 'bg-white text-[#151C19] shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Yearly
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBillingCycle('monthly');
                    setCouponApplied(null);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-white text-[#151C19] shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Monthly
                </button>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-100 pt-4 mb-6 space-y-2.5 text-sm">
                <div className="flex justify-between text-[#151C19]/70">
                  <span>Base Plan ({plan.label} - {billingCycle === 'yearly' ? 'Yearly' : 'Monthly'})</span>
                  <span>₹{basePlanPrice}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Coupon Discount ({couponApplied.code})</span>
                    <span>-₹{couponApplied.discountAmount} ({couponApplied.discountPct}%)</span>
                  </div>
                )}
                {isGoogleReviewsSelected && (
                  <div className="flex justify-between text-[#151C19] font-medium bg-amber-50/60 p-2.5 rounded-xl border border-amber-100">
                    <span className="flex items-center gap-1.5 text-xs text-amber-900 font-semibold">
                      <Star size={13} className="text-amber-500 fill-amber-500" />
                      Google Reviews Add-on
                    </span>
                    <span className="text-xs font-bold text-amber-900">+₹{addonInfo.price}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-[#151C19] text-base block">Total Payable</span>
                    <span className="text-[#151C19]/50 text-[11px]">{billingCycle === 'yearly' ? 'Billed annually' : 'Billed monthly'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-[#E8783C]">₹{finalPayablePrice}</span>
                  </div>
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
