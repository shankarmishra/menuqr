import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CreditCard, Sparkles } from 'lucide-react';
import RenewalPanel from './RenewalPanel';
import UpgradePanel from './UpgradePanel';
import PaymentStep from './PaymentStep';
import SuccessPanel from './SuccessPanel';
import {
  type RenewalInitiateResponse,
  type UpgradeInitiateResponse,
} from '../../pages/app/appStore';
import { normalizePlan } from '../../lib/planCapabilities';

export interface CheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialAction?: 'renew' | 'upgrade';
  currentPlanId?: string;
  expiresAt?: string;
  startedAt?: string;
  onPlanUpdated?: () => void;
}

type DrawerStep = 'panel' | 'payment' | 'success';

interface ActiveOrderState {
  orderId: string;
  paymentSessionId: string;
  amount: number;
  amountPaise: number;
  orderSubtype: 'RENEWAL' | 'UPGRADE';
  targetPlan?: string;
  newExpiry?: string;
  checkoutMode?: string;
}

export default function CheckoutDrawer({
  isOpen,
  onClose,
  initialAction = 'renew',
  currentPlanId = 'BASIC',
  expiresAt,
  startedAt: _startedAt,
  onPlanUpdated,
}: CheckoutDrawerProps) {
  const [step, setStep] = useState<DrawerStep>('panel');
  const [action, setAction] = useState<'renew' | 'upgrade'>(initialAction);
  const [activeOrder, setActiveOrder] = useState<ActiveOrderState | null>(null);

  const planKey = normalizePlan(currentPlanId);
  const isPremium = planKey === 'premium';

  // Sync initial action when drawer opens
  useEffect(() => {
    if (isOpen) {
      setStep('panel');
      setAction(isPremium ? 'renew' : initialAction);
      setActiveOrder(null);
    }
  }, [isOpen, initialAction, isPremium]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && step !== 'payment') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, step, onClose]);

  // Handle transition from RenewalPanel to PaymentStep
  const handleProceedFromRenewal = (orderData: RenewalInitiateResponse) => {
    setActiveOrder({
      orderId: orderData.orderId,
      paymentSessionId: orderData.paymentSessionId,
      amount: orderData.amount,
      amountPaise: orderData.amountPaise,
      orderSubtype: 'RENEWAL',
      newExpiry: orderData.newExpiresAt,
      checkoutMode: orderData.checkoutMode,
    });
    setStep('payment');
  };

  // Handle transition from UpgradePanel to PaymentStep
  const handleProceedFromUpgrade = (orderData: UpgradeInitiateResponse, targetTier?: string) => {
    const chosenTarget =
      targetTier ||
      orderData.targetPlan ||
      orderData.targetPlanId ||
      orderData.order?.targetPlan ||
      'PREMIUM';

    setActiveOrder({
      orderId: orderData.orderId,
      paymentSessionId: orderData.paymentSessionId,
      amount: orderData.amount,
      amountPaise: orderData.amountPaise,
      orderSubtype: 'UPGRADE',
      targetPlan: chosenTarget.toUpperCase(),
      checkoutMode: orderData.checkoutMode,
    });
    setStep('payment');
  };

  // Handle Payment completion
  const handlePaymentSuccess = (details: { orderId: string; newExpiry?: string; planId?: string }) => {
    if (activeOrder) {
      setActiveOrder({
        ...activeOrder,
        newExpiry: details.newExpiry || activeOrder.newExpiry,
        targetPlan: details.planId || activeOrder.targetPlan,
      });
    }
    setStep('success');
    onPlanUpdated?.();
  };

  const handleDrawerClose = () => {
    if (step === 'payment') return; // Do not close while active payment
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleDrawerClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Slide-over panel */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-drawer-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative z-10 w-full max-w-xl bg-[#141b18] border-l border-[#2a3832] shadow-2xl flex flex-col h-full overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#2a3832] flex items-center justify-between shrink-0 bg-[#151c19]/50">
              <div>
                <h2 id="checkout-drawer-title" className="text-xl font-bold text-white tracking-wide">
                  {step === 'success'
                    ? 'Payment Confirmed'
                    : step === 'payment'
                    ? 'Complete Payment'
                    : action === 'renew'
                    ? 'Renew Subscription'
                    : 'Upgrade Subscription Plan'}
                </h2>
                <p className="text-xs text-[#849a90] mt-0.5">
                  {step === 'success'
                    ? 'All features are now active in real time.'
                    : step === 'payment'
                    ? 'Secure gateway encrypted checkout.'
                    : `Current Plan: ${currentPlanId.toUpperCase()}`}
                </p>
              </div>

              <button
                onClick={handleDrawerClose}
                disabled={step === 'payment'}
                aria-label="Close checkout drawer"
                className="p-2 rounded-xl text-[#849a90] hover:text-white hover:bg-white/5 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <X size={20} />
              </button>
            </div>

            {/* Action Tabs (only visible during 'panel' step and if not already Premium) */}
            {step === 'panel' && !isPremium && (
              <div className="px-6 pt-4 shrink-0">
                <div className="flex rounded-xl bg-[#1d2723] p-1 border border-[#2a3832]">
                  <button
                    onClick={() => setAction('renew')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      action === 'renew'
                        ? 'bg-[#e8783c] text-white shadow-sm'
                        : 'text-[#849a90] hover:text-white'
                    }`}
                  >
                    <CreditCard size={14} />
                    <span>Renew Plan</span>
                  </button>
                  <button
                    onClick={() => setAction('upgrade')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      action === 'upgrade'
                        ? 'bg-[#e8783c] text-white shadow-sm'
                        : 'text-[#849a90] hover:text-white'
                    }`}
                  >
                    <Sparkles size={14} className={action === 'upgrade' ? 'text-amber-200' : 'text-amber-400'} />
                    <span>Upgrade Tier</span>
                  </button>
                </div>
              </div>
            )}

            {/* Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {step === 'panel' && action === 'renew' && (
                <RenewalPanel
                  currentPlanId={currentPlanId}
                  expiresAt={expiresAt}
                  onProceedToPayment={handleProceedFromRenewal}
                />
              )}

              {step === 'panel' && action === 'upgrade' && (
                <UpgradePanel
                  currentPlanId={currentPlanId}
                  expiresAt={expiresAt}
                  onProceedToPayment={handleProceedFromUpgrade}
                />
              )}

              {step === 'payment' && activeOrder && (
                <PaymentStep
                  orderId={activeOrder.orderId}
                  paymentSessionId={activeOrder.paymentSessionId}
                  amount={activeOrder.amount}
                  amountPaise={activeOrder.amountPaise}
                  orderSubtype={activeOrder.orderSubtype}
                  targetPlan={activeOrder.targetPlan}
                  newExpiry={activeOrder.newExpiry}
                  checkoutMode={activeOrder.checkoutMode}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentFailure={(msg) => console.error('[CheckoutDrawer] Payment failure:', msg)}
                  onBack={() => setStep('panel')}
                />
              )}

              {step === 'success' && (
                <SuccessPanel
                  orderSubtype={activeOrder?.orderSubtype || 'UPGRADE'}
                  planId={activeOrder?.targetPlan || currentPlanId}
                  newExpiry={activeOrder?.newExpiry || expiresAt}
                  orderId={activeOrder?.orderId || 'MQR_ORDER'}
                  onClose={handleDrawerClose}
                />
              )}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
