import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';

type ToastKind = 'success' | 'error' | 'info';
type ToastRecord = { id: number; kind: ToastKind; message: string };
type ToastContextValue = { showToast: (kind: ToastKind, message: string) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const showToast = useCallback((kind: ToastKind, message: string) => {
    const toast = { id: Date.now() + Math.random(), kind, message };
    setToasts((current) => [...current, toast].slice(-4));
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((toast) => window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== toast.id));
    }, toast.kind === 'error' ? 7000 : 4500));
    return () => timers.forEach(window.clearTimeout);
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[11000] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite" aria-relevant="additions">
        {toasts.map((toast) => {
          const Icon = toast.kind === 'success' ? CheckCircle2 : toast.kind === 'error' ? XCircle : Info;
          const color = toast.kind === 'success' ? 'border-emerald-400/40 text-emerald-200' : toast.kind === 'error' ? 'border-rose-400/40 text-rose-200' : 'border-sky-300/40 text-sky-100';
          return (
            <div key={toast.id} role={toast.kind === 'error' ? 'alert' : 'status'} className={`pointer-events-auto flex items-start gap-3 rounded-lg border bg-[#17211e] px-4 py-3 text-sm shadow-xl ${color}`}>
              <Icon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
              <p className="min-w-0 flex-1">{toast.message}</p>
              <button type="button" aria-label="Dismiss notification" onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))} className="shrink-0 text-white/60 hover:text-white"><X size={16} /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider.');
  return context.showToast;
}