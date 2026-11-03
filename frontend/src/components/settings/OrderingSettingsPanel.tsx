import { useEffect, useState } from 'react';
import {
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  Clock,
  CheckCircle2,
  Save,
  PauseCircle,
  PlayCircle,
  Plus,
  Trash2,
  Loader2,
} from 'lucide-react';
import {
  getOrderingSettings,
  updateOrderingSettings,
  type OrderingSettingsData,
} from '../../pages/app/appStore';
import { useToast } from '../feedback/ToastProvider';

export default function OrderingSettingsPanel() {
  const showToast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<OrderingSettingsData>({
    dineInEnabled: true,
    takeawayEnabled: false,
    deliveryEnabled: true,
    acceptingOrders: true,
    autoByHours: false,
    deliveryMinOrder: 0,
    deliveryFee: 0,
    deliveryAreaNote: '',
    payNotes: ['Pay at counter'],
    deliveryPausedUntil: null,
    deliveryTimeSlots: [],
  });

  // Countdown timer for active pause
  const [pauseRemaining, setPauseRemaining] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getOrderingSettings();
        if (mounted && data) {
          setSettings(data);
        }
      } catch (err: any) {
        showToast('error', err?.message || 'Could not load ordering settings.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Update countdown timer every second if paused
  useEffect(() => {
    if (!settings.deliveryPausedUntil) {
      setPauseRemaining(null);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const end = new Date(settings.deliveryPausedUntil!).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setPauseRemaining(null);
        setSettings((prev) => ({ ...prev, deliveryPausedUntil: null }));
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setPauseRemaining(`${mins}m ${secs < 10 ? '0' : ''}${secs}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [settings.deliveryPausedUntil]);

  const handleSave = async (partial?: Partial<OrderingSettingsData>) => {
    setSaving(true);
    const toSave = partial ? { ...settings, ...partial } : settings;
    try {
      await updateOrderingSettings(toSave);
      if (partial) setSettings((prev) => ({ ...prev, ...partial }));
      showToast('success', 'Ordering & delivery controls saved successfully.');
    } catch (err: any) {
      showToast('error', err?.message || 'Failed to save ordering settings.');
    } finally {
      setSaving(false);
    }
  };

  const handlePauseDelivery = async (minutes: number | 'tonight') => {
    let untilDate: Date;
    if (minutes === 'tonight') {
      untilDate = new Date();
      untilDate.setHours(23, 59, 59, 999);
    } else {
      untilDate = new Date(Date.now() + minutes * 60 * 1000);
    }
    const iso = untilDate.toISOString();
    await handleSave({ deliveryPausedUntil: iso });
  };

  const handleResumeDelivery = async () => {
    await handleSave({ deliveryPausedUntil: null });
  };

  const addTimeSlot = () => {
    const current = settings.deliveryTimeSlots || [];
    if (current.length >= 5) {
      showToast('error', 'Maximum 5 delivery time slots allowed.');
      return;
    }
    setSettings((prev) => ({
      ...prev,
      deliveryTimeSlots: [...current, { start: '19:00', end: '23:30' }],
    }));
  };

  const removeTimeSlot = (idx: number) => {
    const current = [...(settings.deliveryTimeSlots || [])];
    current.splice(idx, 1);
    setSettings((prev) => ({ ...prev, deliveryTimeSlots: current }));
  };

  const updateTimeSlot = (idx: number, field: 'start' | 'end', val: string) => {
    const current = [...(settings.deliveryTimeSlots || [])];
    current[idx] = { ...current[idx], [field]: val };
    setSettings((prev) => ({ ...prev, deliveryTimeSlots: current }));
  };

  if (loading) {
    return (
      <div className="bg-[#1d2723] rounded-2xl p-6 border border-[#2a3832] flex items-center justify-center py-12 text-[#849a90]">
        <Loader2 size={24} className="animate-spin mr-3 text-emerald-400" />
        <span>Loading ordering & delivery settings...</span>
      </div>
    );
  }

  return (
    <div className="bg-[#1d2723] rounded-2xl p-6 md:p-8 border border-[#2a3832] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2a3832]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">Ordering Modes & Delivery Controls</h2>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Control
            </span>
          </div>
          <p className="text-xs text-[#849a90] mt-1">
            Toggle Dine-in, Takeaway, and Delivery. Set scheduled hours or pause during busy kitchen rush.
          </p>
        </div>

        <button
          onClick={() => handleSave()}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-semibold text-xs transition-all shadow-md shadow-emerald-500/20"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* ── 1. Master Channel Switches ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Dine-In Switch */}
        <div
          onClick={() => setSettings((s) => ({ ...s, dineInEnabled: !s.dineInEnabled }))}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            settings.dineInEnabled
              ? 'bg-[#151c19] border-emerald-500/40 ring-1 ring-emerald-500/20'
              : 'bg-[#151c19]/50 border-[#2a3832] opacity-60'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-lg ${settings.dineInEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#2a3832] text-[#849a90]'}`}>
                <UtensilsCrossed size={18} />
              </div>
              <span className="text-sm font-bold text-white">Dine-In Table Orders</span>
            </div>
            <div className={`w-8 h-4.5 rounded-full transition-colors relative ${settings.dineInEnabled ? 'bg-emerald-500' : 'bg-[#2a3832]'}`}>
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  settings.dineInEnabled ? 'left-4' : 'left-0.5'
                }`}
              />
            </div>
          </div>
          <p className="text-[11px] text-[#849a90] leading-relaxed">
            Customers seated at tables can browse & order directly from table QR codes.
          </p>
        </div>

        {/* Takeaway Switch */}
        <div
          onClick={() => setSettings((s) => ({ ...s, takeawayEnabled: !s.takeawayEnabled }))}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            settings.takeawayEnabled
              ? 'bg-[#151c19] border-blue-500/40 ring-1 ring-blue-500/20'
              : 'bg-[#151c19]/50 border-[#2a3832] opacity-60'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-lg ${settings.takeawayEnabled ? 'bg-blue-500/20 text-blue-400' : 'bg-[#2a3832] text-[#849a90]'}`}>
                <ShoppingBag size={18} />
              </div>
              <span className="text-sm font-bold text-white">Takeaway / Pickup</span>
            </div>
            <div className={`w-8 h-4.5 rounded-full transition-colors relative ${settings.takeawayEnabled ? 'bg-blue-500' : 'bg-[#2a3832]'}`}>
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  settings.takeawayEnabled ? 'left-4' : 'left-0.5'
                }`}
              />
            </div>
          </div>
          <p className="text-[11px] text-[#849a90] leading-relaxed">
            Customers can place advance pickup orders to collect at your restaurant counter.
          </p>
        </div>

        {/* Delivery Switch */}
        <div
          onClick={() => setSettings((s) => ({ ...s, deliveryEnabled: !s.deliveryEnabled }))}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            settings.deliveryEnabled
              ? 'bg-[#151c19] border-[#e8783c]/40 ring-1 ring-[#e8783c]/20'
              : 'bg-[#151c19]/50 border-[#2a3832] opacity-60'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-lg ${settings.deliveryEnabled ? 'bg-[#e8783c]/20 text-[#e8783c]' : 'bg-[#2a3832] text-[#849a90]'}`}>
                <Bike size={18} />
              </div>
              <span className="text-sm font-bold text-white">Home Delivery</span>
            </div>
            <div className={`w-8 h-4.5 rounded-full transition-colors relative ${settings.deliveryEnabled ? 'bg-[#e8783c]' : 'bg-[#2a3832]'}`}>
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  settings.deliveryEnabled ? 'left-4' : 'left-0.5'
                }`}
              />
            </div>
          </div>
          <p className="text-[11px] text-[#849a90] leading-relaxed">
            Receive direct home delivery orders with customer address and phone number.
          </p>
        </div>
      </div>

      {/* ── 2. Rush-Hour Emergency Delivery Pause ── */}
      {settings.deliveryEnabled && (
        <div className="rounded-xl bg-[#151c19] border border-[#2a3832] p-4.5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <PauseCircle size={17} className="text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Rush-Hour Peak Pause</span>
            </div>
            {pauseRemaining ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold animate-pulse">
                <span>⏸ Paused: Resumes in {pauseRemaining}</span>
              </span>
            ) : (
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>Delivery is active</span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#849a90] leading-relaxed">
            Kitchen packed with orders? Instantly pause incoming delivery orders without turning delivery off permanently. Diners will see a polite note with the resume time.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => handlePauseDelivery(30)}
              className="px-3 py-1.5 rounded-lg bg-[#1d2723] hover:bg-[#2a3832] border border-[#2a3832] text-xs font-medium text-white transition-colors"
            >
              Pause 30 Mins
            </button>
            <button
              type="button"
              onClick={() => handlePauseDelivery(60)}
              className="px-3 py-1.5 rounded-lg bg-[#1d2723] hover:bg-[#2a3832] border border-[#2a3832] text-xs font-medium text-white transition-colors"
            >
              Pause 1 Hour
            </button>
            <button
              type="button"
              onClick={() => handlePauseDelivery('tonight')}
              className="px-3 py-1.5 rounded-lg bg-[#1d2723] hover:bg-[#2a3832] border border-[#2a3832] text-xs font-medium text-white transition-colors"
            >
              Pause Tonight (Midnight)
            </button>
            {settings.deliveryPausedUntil && (
              <button
                type="button"
                onClick={handleResumeDelivery}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-bold text-emerald-400 transition-colors flex items-center gap-1.5"
              >
                <PlayCircle size={13} />
                <span>Resume Now</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── 3. Timed Delivery Service Windows ── */}
      {settings.deliveryEnabled && (
        <div className="rounded-xl bg-[#151c19] border border-[#2a3832] p-4.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#849a90]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Scheduled Delivery Hours</span>
            </div>
            <button
              type="button"
              onClick={addTimeSlot}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1d2723] hover:bg-[#2a3832] border border-[#2a3832] text-[11px] font-semibold text-emerald-400 transition-colors"
            >
              <Plus size={12} />
              <span>Add Window</span>
            </button>
          </div>
          <p className="text-[11px] text-[#849a90] leading-relaxed">
            Limit delivery orders to specific service hours (e.g., Lunch 12:00–15:30, Dinner 19:00–23:00, or Late Night 23:00–03:00). Leave empty to accept delivery anytime.
          </p>

          {(!settings.deliveryTimeSlots || settings.deliveryTimeSlots.length === 0) ? (
            <div className="text-xs text-[#849a90] italic py-2">
              No delivery time windows configured. Delivery is accepted all day whenever restaurant is open.
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              {settings.deliveryTimeSlots.map((slot, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-[#1d2723] border border-[#2a3832] rounded-lg px-3 py-1.5">
                    <span className="text-[11px] text-[#849a90]">From</span>
                    <input
                      type="time"
                      value={slot.start}
                      onChange={(e) => updateTimeSlot(idx, 'start', e.target.value)}
                      className="bg-transparent text-white font-mono text-xs focus:outline-none"
                    />
                    <span className="text-[11px] text-[#849a90]">to</span>
                    <input
                      type="time"
                      value={slot.end}
                      onChange={(e) => updateTimeSlot(idx, 'end', e.target.value)}
                      className="bg-transparent text-white font-mono text-xs focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTimeSlot(idx)}
                    className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors"
                    title="Remove Window"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 4. Delivery Pricing & Minimum Order ── */}
      {settings.deliveryEnabled && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-[#849a90] mb-1.5">
              Minimum Delivery Order (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-[#849a90] text-xs">₹</span>
              <input
                type="number"
                min="0"
                step="10"
                value={settings.deliveryMinOrder || ''}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, deliveryMinOrder: Math.max(0, Number(e.target.value) || 0) }))
                }
                placeholder="0 (No minimum)"
                className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl pl-7 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#849a90] mb-1.5">
              Delivery Fee (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-[#849a90] text-xs">₹</span>
              <input
                type="number"
                min="0"
                step="5"
                value={settings.deliveryFee || ''}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, deliveryFee: Math.max(0, Number(e.target.value) || 0) }))
                }
                placeholder="0 (Free delivery)"
                className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl pl-7 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#849a90] mb-1.5">
              Delivery Coverage Area Note
            </label>
            <input
              type="text"
              maxLength={120}
              value={settings.deliveryAreaNote || ''}
              onChange={(e) => setSettings((s) => ({ ...s, deliveryAreaNote: e.target.value }))}
              placeholder="e.g. Within 5 km of MG Road"
              className="w-full bg-[#151c19] border border-[#2a3832] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
