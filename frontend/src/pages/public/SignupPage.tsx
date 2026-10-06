import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, CheckCircle, Store, Mail, Lock, User, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MenusQRBrand } from '../../components/brand/MenusQRBrand';
import { SEO } from '../../seo/SEO';

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    ownerName: '',
    restaurantName: '',
    email: '',
    password: '',
    cardNumber: '',
  });
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ownerName || !formData.restaurantName || !formData.email || !formData.password) {
      setError('Please fill all fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/create-payment-intent', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to initialize payment');
      const data = await res.json();
      setTransactionId(data.transactionId);
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.cardNumber !== '4242424242424242') {
      setError('Payment failed. Use the test card number: 4242424242424242');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const payRes = await fetch('/api/auth/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, cardNumber: formData.cardNumber }),
      });
      if (!payRes.ok) throw new Error('Payment processing failed');

      const signupRes = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerName: formData.ownerName,
          restaurantName: formData.restaurantName,
          email: formData.email,
          password: formData.password,
          transactionId,
        }),
      });
      if (!signupRes.ok) {
        const errData = await signupRes.json();
        throw new Error(errData.error || 'Signup failed');
      }

      setStep(3);
      setTimeout(() => navigate('/app/dashboard'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#151c19] flex items-center justify-center p-4">
      <SEO title="Sign Up | MenusQR" description="Sign up for MenusQR" index={false} />
      <div className="absolute inset-0 opacity-[0.03] mix-blend-multiply pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E8783C]/5 rounded-full blur-[140px] pointer-events-none z-0" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#1d2723]/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="flex justify-center mb-8">
          <MenusQRBrand size="lg" variant="light" />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleNext}
              className="space-y-5"
            >
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-white">Create your account</h1>
                <p className="text-[#8a9aac] text-sm mt-2">Start your Premium subscription</p>
              </div>

              {error && <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl">{error}</div>}

              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a9aac]" size={18} />
                  <input
                    type="text"
                    name="ownerName"
                    placeholder="Owner Name"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    className="w-full bg-[#151c19] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#E8783C] transition-colors"
                    required
                  />
                </div>
                <div className="relative">
                  <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a9aac]" size={18} />
                  <input
                    type="text"
                    name="restaurantName"
                    placeholder="Restaurant Name"
                    value={formData.restaurantName}
                    onChange={handleInputChange}
                    className="w-full bg-[#151c19] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#E8783C] transition-colors"
                    required
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a9aac]" size={18} />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-[#151c19] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#E8783C] transition-colors"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a9aac]" size={18} />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full bg-[#151c19] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#E8783C] transition-colors"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 bg-gradient-to-r from-[#e8783c] to-[#ffc928] text-[#121916] font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Continue to Payment'}
                <Sparkles size={16} />
              </button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handlePayment}
              className="space-y-5"
            >
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-white">Payment Details</h1>
                <p className="text-[#8a9aac] text-sm mt-2">Premium Plan - ₹2,999/year</p>
              </div>

              {error && <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl">{error}</div>}

              <div className="space-y-4">
                <div className="relative">
                  <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a9aac]" size={18} />
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="Card Number (Use 4242424242424242)"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    className="w-full bg-[#151c19] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#E8783C] transition-colors"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full bg-[#151c19] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#E8783C] transition-colors"
                    defaultValue="12/26"
                  />
                  <input
                    type="text"
                    placeholder="CVC"
                    className="w-full bg-[#151c19] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#E8783C] transition-colors"
                    defaultValue="123"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3.5 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#F3C35C] text-[#140D05] font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Pay ₹2,999 & Subscribe'}
                </button>
              </div>
            </motion.form>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 space-y-4"
            >
              <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} />
              </div>
              <h1 className="text-2xl font-bold text-white">Payment Successful!</h1>
              <p className="text-[#8a9aac]">Your account has been created. Redirecting to your dashboard...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}


