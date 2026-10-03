import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, KeyRound, Utensils, Mail } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loginAdmin } from './clientStore';

interface LoginLocationState {
  from?: { pathname?: string; search?: string; hash?: string };
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const returnTo = (location.state as LoginLocationState | null)?.from;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await loginAdmin(password, email || undefined);
      // Let AuthContext checkAuth happen or just navigate to /app if they used an email
      // Wait, `/admin/dashboard` is the default returnTo. If they logged in as RESTAURANT_OWNER, 
      // `/admin/dashboard` will redirect them away if they don't have SUPER_ADMIN.
      // But ProtectedAdminLayout handles the redirect or error? 
      // Actually, if we just navigate to returnTo, and if it's empty we go to `/app` instead if email is provided.
      const defaultDest = email ? '/app' : '/admin/dashboard';
      navigate(returnTo ? `${returnTo.pathname ?? defaultDest}${returnTo.search ?? ''}${returnTo.hash ?? ''}` : defaultDest, { replace: true });
      window.location.reload(); // Quick fix to re-trigger AuthContext fetch, since it's an app-wide state and they might not be using a global state manager for the User outside of AuthProvider which already loaded.
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Could not sign in. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(ellipse_at_50%_35%,#26342e_0%,#151c19_58%,#101513_100%)] px-5 py-10 text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-[#202a26]/95 p-7 shadow-2xl shadow-black/30 sm:p-9">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#e8783c] text-white"><Utensils size={23} /></span>
          <div>
            <p className="text-xl font-extrabold">Menu<span className="text-[#f29a66]">QR</span></p>
            <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#94a39d]">Portal</p>
          </div>
        </div>

        <h1 className="text-2xl font-bold">Sign in to continue</h1>
        <p className="mt-2 text-sm text-[#aab7b2]">Enter your email and password to manage your menu. (Leave email blank for Super Admin).</p>

        <form onSubmit={submit} className="mt-7 space-y-5">
          <label className="block text-sm font-semibold text-[#dce5df]" htmlFor="email">Email Address
            <span className="relative mt-2 block">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#84938c]" size={17} aria-hidden="true" />
              <input
                id="email"
                autoComplete="email"
                autoFocus
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#151d19] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-[#728079] focus:border-[#e8783c] focus:ring-2 focus:ring-[#e8783c]/20"
                placeholder="owner@restaurant.com"
              />
            </span>
          </label>
          <label className="block text-sm font-semibold text-[#dce5df]" htmlFor="admin-password">Password
            <span className="relative mt-2 block">
              <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#84938c]" size={17} aria-hidden="true" />
              <input
                id="admin-password"
                autoComplete="current-password"
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#151d19] py-3 pl-10 pr-12 text-sm text-white outline-none transition placeholder:text-[#728079] focus:border-[#e8783c] focus:ring-2 focus:ring-[#e8783c]/20"
                placeholder="Enter password"
              />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-[#94a39d] transition hover:bg-white/5 hover:text-white">
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
          </label>

          {error && <p role="alert" aria-live="polite" className="text-sm text-rose-300">{error}</p>}

          <button type="submit" disabled={isSubmitting || !password} className="w-full rounded-lg bg-[#e8783c] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#f18b50] disabled:cursor-wait disabled:opacity-60">
            {isSubmitting ? 'Signing in…' : 'Enter admin panel'}
          </button>
        </form>
      </section>
    </main>
  );
}