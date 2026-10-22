import { useState, useEffect, type FormEvent } from 'react';
import { Eye, EyeOff, KeyRound, Mail, ShieldCheck, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SEO } from '../../seo/SEO';
import { isAdminHostname } from '../../utils/hostRouting';
import { MenusQRBrand } from '../../components/brand/MenusQRBrand';
import { loginAdmin, verifyLoginOtp, resendLoginOtp, requestForgotPassword, resetPassword, requestSuperAdminOtp, verifySuperAdminOtp } from './clientStore';

interface LoginLocationState {
  from?: { pathname?: string; search?: string; hash?: string };
}

type AuthMode = 'LOGIN' | 'OTP' | 'FORGOT_EMAIL' | 'FORGOT_OTP';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as LoginLocationState | null)?.from;
  const isAdminPage = isAdminHostname(window.location.hostname, import.meta.env.VITE_ADMIN_HOSTNAME);

  // Login State
  const [mode, setMode] = useState<AuthMode>(() => {
    if (typeof window === 'undefined') return 'LOGIN';
    const params = new URLSearchParams(window.location.search);
    return (params.get('action') === 'forgot' || params.get('mode') === 'forgot') ? 'FORGOT_EMAIL' : 'LOGIN';
  });
  const [email, setEmail] = useState(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('email') || '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [targetEmail, setTargetEmail] = useState('');

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('email') || '';
  });
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Status & Feedback
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    let timer: number;
    if (mode === 'OTP' && resendTimer > 0) {
      timer = window.setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => window.clearInterval(timer);
  }, [mode, resendTimer]);

  function handleLoginSuccess(role?: string, onboardingState?: string) {
    if (onboardingState === 'PENDING') {
      navigate('/onboarding', { replace: true });
      return;
    }
    const defaultDest = role === 'SUPER_ADMIN' ? '/admin' : '/app';
    const dest = returnTo ? `${returnTo.pathname ?? defaultDest}${returnTo.search ?? ''}${returnTo.hash ?? ''}` : defaultDest;
    navigate(dest, { replace: true });
  }

  async function handleInitialLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setInfoMessage('');
    setIsSubmitting(true);
    try {
      if (isAdminPage) {
        if (!email) throw new Error('Email is required for Admin login.');
        const res = await requestSuperAdminOtp(email);
        setMode('OTP');
        setTargetEmail(email);
        setResendTimer(30);
        setInfoMessage(res.message || 'A 6-digit OTP code has been sent to your email.');
      } else {
        const res = await loginAdmin(password, email || undefined);
        if (res.requireOtp && res.tempToken) {
          setTempToken(res.tempToken);
          setTargetEmail(res.email || email);
          setMode('OTP');
          setResendTimer(30);
          setInfoMessage(res.message || 'A 6-digit OTP code has been sent to your email.');
        } else if (res.authenticated) {
          handleLoginSuccess(res.role, res.onboardingState);
        }
      }
    } catch {
      setError(isAdminPage
        ? 'We could not send a sign-in code. Please try again shortly. If the problem continues, contact support.'
        : 'Could not sign in. Please check your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!otp || otp.length < 6) {
      setError('Please enter the full 6-digit OTP code.');
      return;
    }
    setError('');
    setInfoMessage('');
    setIsSubmitting(true);
    try {
      const res = isAdminPage
        ? await verifySuperAdminOtp(targetEmail, otp)
        : await verifyLoginOtp(tempToken, otp);
      if (res.authenticated) {
        handleLoginSuccess(res.role, res.onboardingState);
      }
    } catch {
      setError(isAdminPage
        ? 'Unable to verify sign-in. Check your details or request a new code.'
        : 'Incorrect code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendOtp() {
    if (resendTimer > 0) return;
    setError('');
    setIsSubmitting(true);
    try {
      if (isAdminPage) {
        const res = await requestSuperAdminOtp(targetEmail);
        setInfoMessage(res.message || 'New OTP sent to your email.');
        setResendTimer(30);
      } else {
        const res = await resendLoginOtp(tempToken);
        setInfoMessage(res.message || 'New OTP sent to your email.');
        setResendTimer(30);
      }
    } catch {
      setError(isAdminPage
        ? 'We could not send a new code. Please wait a moment and try again.'
        : 'Could not resend the code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRequestForgot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!forgotEmail) {
      setError('Please enter your registered email address.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      const res = await requestForgotPassword(forgotEmail);
      setInfoMessage(res.message || 'Reset code sent to your email.');
      setMode('FORGOT_OTP');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reset code.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!forgotOtp || !newPassword) {
      setError('Please fill all fields.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      const res = await resetPassword(forgotEmail, forgotOtp, newPassword);
      setInfoMessage(res.message || 'Password reset successful! Please log in with your new password.');
      setEmail(forgotEmail);
      setPassword('');
      setMode('LOGIN');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <SEO
        title={isAdminPage ? 'Administrator Access | MenusQR' : 'Restaurant Sign In | MenusQR'}
        description={isAdminPage ? 'MenusQR administrator sign in.' : 'Sign in to your MenusQR restaurant account.'}
        index={false}
      />
      <main className="grid min-h-screen place-items-center bg-[radial-gradient(ellipse_at_50%_35%,#26342e_0%,#151c19_58%,#101513_100%)] px-5 py-10 text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-[#202a26]/95 p-7 shadow-2xl shadow-black/30 sm:p-9">
        
        {/* Brand Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <MenusQRBrand size="lg" variant="light" markOnly={false} />
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#94a39d] pl-1">{isAdminPage ? 'Private Admin Access' : 'Restaurant Portal'}</p>
          </div>
          {mode !== 'LOGIN' && (
            <button
              type="button"
              onClick={() => { setMode('LOGIN'); setError(''); setInfoMessage(''); }}
              className="flex items-center gap-1 text-xs text-[#aab7b2] hover:text-white transition"
            >
              <ArrowLeft size={14} /> Back
            </button>
          )}
        </div>

        {/* FEEDBACK MESSAGES */}
        {infoMessage && (
          <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
            <p>{infoMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-300" role="alert">
            {error}
          </div>
        )}

        {/* MODE 1: STANDARD LOGIN */}
        {mode === 'LOGIN' && (
          <>
            <h1 className="text-2xl font-bold">{isAdminPage ? 'Administrator sign in' : 'Sign in to continue'}</h1>
            <p className="mt-2 text-sm text-[#aab7b2]">
              {isAdminPage ? 'Private access for approved administrators.' : 'Enter your restaurant credentials to manage your digital menu.'}
            </p>

            <form onSubmit={handleInitialLogin} className="mt-7 space-y-5">
              <label className="block text-sm font-semibold text-[#dce5df]" htmlFor="email">
                Email Address
                <span className="relative mt-2 block">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#84938c]" size={17} aria-hidden="true" />
                  <input
                    id="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    autoFocus
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#151d19] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-[#728079] focus:border-[#e8783c] focus:ring-2 focus:ring-[#e8783c]/20"
                    placeholder={isAdminPage ? 'Administrator email address' : 'owner@restaurant.com'}
                  />
                </span>
              </label>

              {!isAdminPage && (
                <div>
                  <div className="flex items-center justify-between text-sm font-semibold text-[#dce5df]">
                    <label htmlFor="admin-password">Password</label>
                    <button
                      type="button"
                      onClick={() => { setMode('FORGOT_EMAIL'); setForgotEmail(email); setError(''); setInfoMessage(''); }}
                      className="text-xs text-[#e8783c] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <span className="relative mt-2 block">
                    <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#84938c]" size={17} aria-hidden="true" />
                    <input
                      id="admin-password"
                      autoComplete="current-password"
                      required
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-[#151d19] py-3 pl-10 pr-12 text-sm text-white outline-none transition placeholder:text-[#728079] focus:border-[#e8783c] focus:ring-2 focus:ring-[#e8783c]/20"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-[#94a39d] transition hover:bg-white/5 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || (isAdminPage ? !email : !password)}
                className="w-full rounded-lg bg-[#e8783c] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#f18b50] disabled:cursor-wait disabled:opacity-60"
              >
                {isSubmitting ? (isAdminPage ? 'Sending OTP...' : 'Verifying credentials...') : isAdminPage ? 'Request sign-in code' : 'Continue to Sign In \u2192'}
              </button>
            </form>
          </>
        )}

        {/* MODE 2: 2-STEP VERIFICATION OTP */}
        {mode === 'OTP' && (
          <>
            <div className="flex items-center gap-2 mb-2 text-[#e8783c] font-semibold text-xs uppercase tracking-wider">
              <ShieldCheck size={16} /> 2-Step Verification
            </div>
            <h1 className="text-2xl font-bold">Enter Verification Code</h1>
            <p className="mt-2 text-sm text-[#aab7b2]">
              {isAdminPage
                ? <>If <strong className="text-white font-mono">{targetEmail}</strong> is approved, a 6-digit code has been sent there.</>
                : <>We sent a 6-digit OTP code to <strong className="text-white font-mono">{targetEmail}</strong>.</>}
            </p>

            <form onSubmit={handleVerifyOtp} className="mt-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#94a39d] mb-2" htmlFor="otp-input">
                  6-Digit Verification Code
                </label>
                <input
                  id="otp-input"
                  type="text"
                  maxLength={6}
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full rounded-xl border border-[#e8783c]/40 bg-[#151d19] py-3.5 text-center text-2xl font-mono font-bold tracking-[0.4em] text-[#e8783c] outline-none transition focus:border-[#e8783c] focus:ring-4 focus:ring-[#e8783c]/20"
                  placeholder="000000"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || otp.length < 6}
                className="w-full rounded-lg bg-[#e8783c] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#f18b50] disabled:opacity-60"
              >
                {isSubmitting ? 'Verifying OTP...' : isAdminPage ? 'Verify & enter admin console' : 'Verify & Enter Dashboard'}
              </button>

              <div className="flex items-center justify-between text-xs text-[#94a39d] pt-2">
                <span>Didn't get the code?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || isSubmitting}
                  className="flex items-center gap-1 font-semibold text-[#e8783c] hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  <RefreshCw size={12} className={isSubmitting ? 'animate-spin' : ''} />
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                </button>
              </div>
            </form>
          </>
        )}

        {/* MODE 3: FORGOT PASSWORD - REQUEST EMAIL */}
        {mode === 'FORGOT_EMAIL' && (
          <>
            <h1 className="text-2xl font-bold">Reset Password</h1>
            <p className="mt-2 text-sm text-[#aab7b2]">Enter your registered email address and we'll send you a password reset code.</p>

            <form onSubmit={handleRequestForgot} className="mt-7 space-y-5">
              <label className="block text-sm font-semibold text-[#dce5df]" htmlFor="forgot-email">
                Registered Email
                <span className="relative mt-2 block">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#84938c]" size={17} aria-hidden="true" />
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    autoFocus
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#151d19] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-[#728079] focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/20"
                    placeholder="owner@restaurant.com"
                  />
                </span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting || !forgotEmail}
                className="w-full rounded-lg bg-[#38bdf8] px-4 py-3 text-sm font-bold text-[#0f172a] transition hover:bg-[#7dd3fc] disabled:opacity-60"
              >
                {isSubmitting ? 'Sending Reset Code...' : 'Send Reset Code'}
              </button>
            </form>
          </>
        )}

        {/* MODE 4: FORGOT PASSWORD - ENTER RESET OTP & NEW PASSWORD */}
        {mode === 'FORGOT_OTP' && (
          <>
            <h1 className="text-2xl font-bold">Set New Password</h1>
            <p className="mt-2 text-sm text-[#aab7b2]">Enter the 6-digit reset code sent to <strong className="text-white font-mono">{forgotEmail}</strong> along with your new password.</p>

            <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#94a39d] mb-1.5" htmlFor="reset-otp">
                  Reset OTP Code
                </label>
                <input
                  id="reset-otp"
                  type="text"
                  maxLength={6}
                  autoFocus
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full rounded-lg border border-[#38bdf8]/40 bg-[#151d19] py-3 text-center text-xl font-mono font-bold tracking-[0.3em] text-[#38bdf8] outline-none transition focus:border-[#38bdf8]"
                  placeholder="000000"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#94a39d] mb-1.5" htmlFor="new-pass">
                  New Password
                </label>
                <span className="relative block">
                  <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#84938c]" size={17} aria-hidden="true" />
                  <input
                    id="new-pass"
                    required
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-[#151d19] py-3 pl-10 pr-12 text-sm text-white outline-none transition focus:border-[#38bdf8]"
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-[#94a39d] transition hover:bg-white/5 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || forgotOtp.length < 6 || newPassword.length < 6}
                className="w-full rounded-lg bg-[#38bdf8] px-4 py-3 text-sm font-bold text-[#0f172a] transition hover:bg-[#7dd3fc] disabled:opacity-60"
              >
                {isSubmitting ? 'Updating Password...' : 'Reset Password & Login'}
              </button>
            </form>
          </>
        )}

      </section>
      </main>
    </>
  );
}