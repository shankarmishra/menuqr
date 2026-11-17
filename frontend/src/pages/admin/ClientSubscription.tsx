import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BadgeIndianRupee, CalendarClock, CheckCircle2, History, Loader2, ShieldAlert, ShieldCheck, Timer } from 'lucide-react';
import {
  activateManualPlan,
  extendTenantTrial,
  grantOrderPacks,
  getAdminPlanCatalog,
  getAdminTenantSubscription,
  revokeManualPlan,
  updateManualPlan,
  type AdminPlanCatalog,
  type AdminTenantSubscription,
  type ManualPlanInput,
} from './clientStore';

type DurationUnit = 'DAYS' | 'MONTHS' | 'YEARS';

const inputClass = 'mt-2 w-full rounded-lg border border-white/10 bg-[#17211e] px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-[#728079] focus:border-[#e8783c] focus:ring-2 focus:ring-[#e8783c]/20';
const labelClass = 'text-sm font-semibold text-[#dce5df]';

const PAYMENT_MODE_LABELS: Record<string, string> = {
  CASH: 'Cash',
  UPI: 'UPI',
  BANK_TRANSFER: 'Bank transfer',
  CHEQUE: 'Cheque',
  CARD: 'Card (offline)',
  OTHER: 'Other',
};

const DURATION_PRESETS: Array<{ label: string; value: number; unit: DurationUnit }> = [
  { label: '1 month', value: 1, unit: 'MONTHS' },
  { label: '3 months', value: 3, unit: 'MONTHS' },
  { label: '6 months', value: 6, unit: 'MONTHS' },
  { label: '1 year', value: 1, unit: 'YEARS' },
];

const EVENT_LABELS: Record<string, string> = {
  NEW_SUBSCRIPTION: 'Plan bought online',
  ORDER_PACK_PURCHASED: 'Extra orders bought online',
  ORDER_PACK_GRANTED: 'Extra orders added (offline payment)',
  SUBSCRIPTION_RENEWED: 'Renewed online',
  SUBSCRIPTION_UPGRADED: 'Upgraded online',
  MANUAL_PLAN_ACTIVATED: 'Offline plan activated',
  MANUAL_PLAN_UPDATED: 'Offline plan changed',
  MANUAL_PLAN_REVOKED: 'Offline plan revoked',
  TRIAL_STARTED: 'Free trial started',
  TRIAL_EXTENDED: 'Free trial extended',
  TRIAL_EXPIRED: 'Free trial ended',
};

function addDuration(date: Date, value: number, unit: DurationUnit): Date {
  const d = new Date(date);
  if (unit === 'DAYS') d.setDate(d.getDate() + value);
  else if (unit === 'MONTHS') d.setMonth(d.getMonth() + value);
  else d.setFullYear(d.getFullYear() + value);
  return d;
}

const formatDate = (value?: string | Date | null) =>
  value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const formatRupees = (value: number | null | undefined) =>
  value === null || value === undefined ? '—' : `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function Field({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return <label className={`block ${className}`}><span className={labelClass}>{label}</span>{children}</label>;
}

function Panel({ icon, title, subtitle, children }: { icon: ReactNode; title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="admin-panel rounded-2xl border p-5 sm:p-7">
      <div className="mb-5 flex items-center gap-3">
        <span className="rounded-lg bg-[#e8783c]/10 p-2.5 text-[#f29a66]">{icon}</span>
        <div>
          <h2 className="font-bold text-white">{title}</h2>
          {subtitle && <p className="mt-1 text-xs text-[#94a39d]">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function ClientSubscription() {
  const { clientId = '' } = useParams();
  const [catalog, setCatalog] = useState<AdminPlanCatalog | null>(null);
  const [detail, setDetail] = useState<AdminTenantSubscription | null>(null);
  const [loadError, setLoadError] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  // Activation form
  const [planId, setPlanId] = useState('BASIC');
  const [features, setFeatures] = useState<string[]>([]);
  const [agreedAmount, setAgreedAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [paymentReference, setPaymentReference] = useState('');
  const [paidOn, setPaidOn] = useState(todayIso());
  const [durationValue, setDurationValue] = useState(1);
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('MONTHS');
  const [carryOver, setCarryOver] = useState(false);
  const [notes, setNotes] = useState('');

  // Active offline plan editing
  const [editFeatures, setEditFeatures] = useState<string[] | null>(null);
  const [extendValue, setExtendValue] = useState(1);
  const [extendUnit, setExtendUnit] = useState<DurationUnit>('MONTHS');
  const [trialDays, setTrialDays] = useState(7);

  // Extra order packs (offline payment)
  const [packCount, setPackCount] = useState(1);
  const [packAmount, setPackAmount] = useState('');
  const [packMode, setPackMode] = useState('UPI');
  const [packRef, setPackRef] = useState('');

  useEffect(() => {
    let current = true;
    Promise.all([getAdminPlanCatalog(), getAdminTenantSubscription(clientId)])
      .then(([cat, det]) => {
        if (!current) return;
        setCatalog(cat);
        setDetail(det);
        const startPlan = det.subscription?.planId && cat.plans.some((p) => p.id === det.subscription?.planId)
          ? det.subscription.planId
          : 'BASIC';
        setPlanId(startPlan);
        setFeatures(cat.plans.find((p) => p.id === startPlan)?.features ?? []);
      })
      .catch((err: unknown) => current && setLoadError(err instanceof Error ? err.message : 'Could not load this restaurant.'));
    return () => { current = false; };
  }, [clientId]);

  const selectedPlan = catalog?.plans.find((p) => p.id === planId);
  const sub = detail?.subscription ?? null;
  const activeGrant = detail?.grants.find((g) => g.id === sub?.manualGrantId && g.status === 'ACTIVE') ?? null;
  const isTrial = sub?.status === 'TRIAL' || sub?.source === 'TRIAL';
  const canCarryOver = Boolean(sub && !sub.isExpired && sub.status !== 'TRIAL' && sub.expiresAt);

  const expiryPreview = useMemo(() => {
    const base = carryOver && canCarryOver && sub?.expiresAt ? new Date(sub.expiresAt) : new Date();
    return durationValue > 0 ? addDuration(base, durationValue, durationUnit) : null;
  }, [carryOver, canCarryOver, sub?.expiresAt, durationValue, durationUnit]);

  // Online list price for the chosen duration, to show how big the offline discount is.
  const listPriceForDuration = !selectedPlan || durationValue <= 0
    ? null
    : durationUnit === 'MONTHS'
    ? selectedPlan.monthlyPrice * durationValue
    : durationUnit === 'YEARS'
    ? selectedPlan.yearlyPrice * durationValue
    : Math.round((selectedPlan.yearlyPrice / 365) * durationValue);
  const discountPct = listPriceForDuration && agreedAmount !== ''
    ? Math.round((1 - Number(agreedAmount) / listPriceForDuration) * 100)
    : null;

  const labelFor = (key: string) => catalog?.capabilities.find((c) => c.key === key)?.label ?? key;

  function choosePlan(id: string) {
    setPlanId(id);
    setFeatures(catalog?.plans.find((p) => p.id === id)?.features ?? []);
  }

  function toggle(list: string[], key: string, on: boolean) {
    return on ? [...new Set([...list, key])] : list.filter((f) => f !== key);
  }

  async function run(action: () => Promise<AdminTenantSubscription>, okText: string) {
    setBusy(true);
    setMessage(null);
    try {
      const next = await action();
      setDetail(next);
      setMessage({ kind: 'ok', text: okText });
      return true;
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'Something went wrong.' });
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function submitActivation(event: FormEvent) {
    event.preventDefault();
    if (!selectedPlan || !expiryPreview) return;
    if (features.length === 0) {
      setMessage({ kind: 'error', text: 'Select at least one feature.' });
      return;
    }
    const amount = Number(agreedAmount);
    const confirmText = `Activate ${selectedPlan.label} for ${detail?.businessName} until ${formatDate(expiryPreview)}?\n\n` +
      `Amount received: ${formatRupees(amount)} via ${PAYMENT_MODE_LABELS[paymentMode] ?? paymentMode}.` +
      (sub && !sub.isExpired ? '\n\nThis replaces the restaurant\'s current plan immediately.' : '');
    if (!window.confirm(confirmText)) return;

    const input: ManualPlanInput = {
      planId,
      agreedAmount: amount,
      paymentMode,
      paymentReference: paymentReference.trim() || undefined,
      paidOn: paidOn || undefined,
      durationValue,
      durationUnit,
      enabledFeatures: features,
      carryOverRemainingDays: carryOver && canCarryOver,
      notes: notes.trim() || undefined,
    };
    const ok = await run(() => activateManualPlan(clientId, input), `${selectedPlan.label} plan activated until ${formatDate(expiryPreview)}. The restaurant is unlocked now.`);
    if (ok) {
      setAgreedAmount('');
      setPaymentReference('');
      setNotes('');
      setCarryOver(false);
    }
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Link to="/admin/restaurants" className="inline-flex items-center gap-2 text-sm font-semibold text-[#aab7b2] hover:text-white"><ArrowLeft size={16} /> Restaurants</Link>
        <p role="alert" className="text-rose-300">{loadError}</p>
      </div>
    );
  }

  if (!catalog || !detail) {
    return <div className="flex h-64 items-center justify-center text-[#aab7b2]"><Loader2 className="animate-spin" /></div>;
  }

  const statusLabel = !sub
    ? 'No plan'
    : sub.isExpired
    ? (isTrial ? 'Trial ended' : 'Expired')
    : sub.status === 'TRIAL'
    ? 'Free trial'
    : sub.source === 'MANUAL' ? 'Active · offline payment' : 'Active · paid online';

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link to="/admin/restaurants" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#aab7b2] transition hover:text-white"><ArrowLeft size={16} /> Restaurants</Link>
        <h1 className="text-3xl font-black tracking-tight text-white">Plan &amp; billing</h1>
        <p className="mt-2 text-sm text-[#aab7b2]">{detail.businessName}</p>
      </div>

      {message && (
        <div role={message.kind === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm ${message.kind === 'ok' ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : 'border-rose-400/30 bg-rose-400/10 text-rose-200'}`}>
          {message.text}
        </div>
      )}

      {/* ── Current status ─────────────────────────────────────────────── */}
      <Panel icon={sub && !sub.isExpired ? <ShieldCheck size={19} /> : <ShieldAlert size={19} />} title="Current plan" subtitle={statusLabel}>
        {sub ? (
          <div className="grid gap-4 sm:grid-cols-4">
            <div><p className="text-xs uppercase tracking-wider text-[#87958e]">Plan</p><p className="mt-1 text-lg font-bold text-white">{sub.planId}</p></div>
            <div><p className="text-xs uppercase tracking-wider text-[#87958e]">Started</p><p className="mt-1 text-white">{formatDate(sub.startedAt)}</p></div>
            <div><p className="text-xs uppercase tracking-wider text-[#87958e]">Expires</p><p className={`mt-1 ${sub.isExpired ? 'text-rose-300' : 'text-white'}`}>{formatDate(sub.expiresAt)}</p></div>
            <div><p className="text-xs uppercase tracking-wider text-[#87958e]">Days left</p><p className="mt-1 text-lg font-bold text-white">{sub.daysLeft !== null ? Math.max(0, sub.daysLeft) : '—'}</p></div>
            <div className="sm:col-span-4">
              <p className="text-xs uppercase tracking-wider text-[#87958e]">Enabled features {sub.customFeatures ? '(custom selection)' : '(plan default)'}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {sub.effectiveFeatures.map((f) => <span key={f} className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-[#dce5df]">{labelFor(f)}</span>)}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#aab7b2]">This restaurant has no subscription yet.</p>
        )}

        {isTrial && (
          <div className="mt-6 flex flex-wrap items-end gap-3 border-t border-white/10 pt-5">
            <Field label="Give more trial days">
              <input className={`${inputClass} w-32`} type="number" min={1} max={90} value={trialDays} onChange={(e) => setTrialDays(Number(e.target.value))} />
            </Field>
            <button type="button" disabled={busy} onClick={() => run(() => extendTenantTrial(clientId, trialDays), `Trial extended by ${trialDays} days.`)} className="rounded-lg bg-sky-500/20 px-4 py-2.5 text-sm font-bold text-sky-200 hover:bg-sky-500/30 disabled:opacity-50">
              <Timer size={15} className="mr-1.5 inline" /> Extend trial
            </button>
          </div>
        )}
      </Panel>

      {/* ── Active offline plan controls ───────────────────────────────── */}
      {activeGrant && (
        <Panel icon={<CalendarClock size={19} />} title="Current offline plan" subtitle={`${activeGrant.planId} · ${formatRupees(activeGrant.agreedAmount)} via ${PAYMENT_MODE_LABELS[activeGrant.paymentMode] ?? activeGrant.paymentMode} · until ${formatDate(activeGrant.expiresAt)}`}>
          <div className="space-y-5">
            <div>
              <p className={labelClass}>Enabled features</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {catalog.capabilities.map((cap) => {
                  const list = editFeatures ?? activeGrant.enabledFeatures;
                  return (
                    <label key={cap.key} className="flex items-center gap-2 text-sm text-[#cbd5cf]">
                      <input type="checkbox" className="accent-[#e8783c]" checked={list.includes(cap.key)} onChange={(e) => setEditFeatures(toggle(list, cap.key, e.target.checked))} />
                      {cap.label}
                    </label>
                  );
                })}
              </div>
              {editFeatures && (
                <div className="mt-3 flex gap-2">
                  <button type="button" disabled={busy} onClick={async () => { if (await run(() => updateManualPlan(clientId, activeGrant.id, { enabledFeatures: editFeatures }), 'Features updated.')) setEditFeatures(null); }} className="rounded-lg bg-[#e8783c] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Save features</button>
                  <button type="button" onClick={() => setEditFeatures(null)} className="rounded-lg px-4 py-2 text-sm font-semibold text-[#aab7b2] hover:bg-white/5">Cancel</button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-end gap-3 border-t border-white/10 pt-5">
              <Field label="Extend by">
                <div className="flex gap-2">
                  <input className={`${inputClass} w-24`} type="number" min={1} value={extendValue} onChange={(e) => setExtendValue(Number(e.target.value))} />
                  <select className={`${inputClass} w-32`} value={extendUnit} onChange={(e) => setExtendUnit(e.target.value as DurationUnit)}>
                    <option value="DAYS">Days</option><option value="MONTHS">Months</option><option value="YEARS">Years</option>
                  </select>
                </div>
              </Field>
              <button type="button" disabled={busy || extendValue <= 0} onClick={() => run(() => updateManualPlan(clientId, activeGrant.id, { extendBy: { value: extendValue, unit: extendUnit } }), 'Plan extended.')} className="rounded-lg bg-white/10 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/15 disabled:opacity-50">Extend plan</button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  const reason = window.prompt(`Revoke this offline plan? ${detail.businessName} will lose access immediately.\n\nReason (optional):`);
                  if (reason === null) return;
                  void run(() => revokeManualPlan(clientId, activeGrant.id, reason), 'Offline plan revoked. The restaurant is now blocked.');
                }}
                className="ml-auto rounded-lg bg-rose-500/15 px-4 py-2.5 text-sm font-bold text-rose-300 hover:bg-rose-500/25 disabled:opacity-50"
              >
                Revoke plan
              </button>
            </div>
          </div>
        </Panel>
      )}

      {/* ── Activate an offline plan ───────────────────────────────────── */}
      <form onSubmit={submitActivation}>
        <Panel icon={<BadgeIndianRupee size={19} />} title="Activate a plan for an offline payment" subtitle="Use this when the restaurant paid the team directly (cash, UPI, bank transfer…) at an agreed price.">
          <div className="space-y-6">
            <div>
              <p className={labelClass}>Plan</p>
              <div className="mt-2 grid gap-3 sm:grid-cols-3">
                {catalog.plans.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => choosePlan(p.id)}
                    className={`rounded-xl border p-4 text-left transition ${planId === p.id ? 'border-[#e8783c] bg-[#e8783c]/10' : 'border-white/10 bg-white/[0.02] hover:border-white/20'}`}
                  >
                    <p className="font-bold text-white">{p.label}</p>
                    <p className="mt-1 text-xs text-[#94a39d]">List: {formatRupees(p.monthlyPrice)}/mo · {formatRupees(p.yearlyPrice)}/yr</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <p className={labelClass}>Features to enable</p>
                <button type="button" onClick={() => setFeatures(selectedPlan?.features ?? [])} className="text-xs font-semibold text-[#f29a66] hover:underline">Reset to {selectedPlan?.label} default</button>
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {catalog.capabilities.map((cap) => (
                  <label key={cap.key} className="flex items-center gap-2 text-sm text-[#cbd5cf]">
                    <input type="checkbox" className="accent-[#e8783c]" checked={features.includes(cap.key)} onChange={(e) => setFeatures(toggle(features, cap.key, e.target.checked))} />
                    {cap.label}
                    {selectedPlan && !selectedPlan.features.includes(cap.key) && features.includes(cap.key) && <span className="text-[10px] font-bold uppercase text-amber-300">extra</span>}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Amount received (₹) *">
                <input className={inputClass} required type="number" min={0} step="0.01" value={agreedAmount} onChange={(e) => setAgreedAmount(e.target.value)} placeholder="e.g. 300" />
                {discountPct !== null && Number.isFinite(discountPct) && (
                  <span className="mt-1 block text-[11px] text-[#87958e]">
                    Online price for this duration: {formatRupees(listPriceForDuration)}
                    {discountPct > 0 ? ` · ${discountPct}% discount` : ''}
                  </span>
                )}
              </Field>
              <Field label="Payment mode *">
                <select className={inputClass} value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                  {catalog.paymentModes.map((m) => <option key={m} value={m}>{PAYMENT_MODE_LABELS[m] ?? m}</option>)}
                </select>
              </Field>
              <Field label="Paid on">
                <input className={inputClass} type="date" value={paidOn} onChange={(e) => setPaidOn(e.target.value)} />
              </Field>
              <Field label="Payment reference (UTR / receipt no.)" className="sm:col-span-3">
                <input className={inputClass} value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} placeholder="Optional" maxLength={255} />
              </Field>
            </div>

            <div>
              <p className={labelClass}>Active for</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {DURATION_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => { setDurationValue(preset.value); setDurationUnit(preset.unit); }}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${durationValue === preset.value && durationUnit === preset.unit ? 'border-[#e8783c] bg-[#e8783c]/10 text-[#ffc19e]' : 'border-white/10 text-[#aab7b2] hover:border-white/20'}`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input className={`${inputClass} mt-0 w-24`} type="number" min={1} required value={durationValue} onChange={(e) => setDurationValue(Number(e.target.value))} aria-label="Duration" />
                <select className={`${inputClass} mt-0 w-32`} value={durationUnit} onChange={(e) => setDurationUnit(e.target.value as DurationUnit)} aria-label="Duration unit">
                  <option value="DAYS">Days</option><option value="MONTHS">Months</option><option value="YEARS">Years</option>
                </select>
              </div>
              <label className={`mt-3 flex items-center gap-2 text-sm ${canCarryOver ? 'text-[#cbd5cf]' : 'text-[#5f6d67]'}`}>
                <input type="checkbox" className="accent-[#e8783c]" disabled={!canCarryOver} checked={carryOver && canCarryOver} onChange={(e) => setCarryOver(e.target.checked)} />
                Add the time left on the current plan ({sub?.daysLeft && sub.daysLeft > 0 && canCarryOver ? `${sub.daysLeft} days` : 'not available'})
              </label>
            </div>

            <Field label="Internal notes">
              <textarea className={`${inputClass} min-h-20`} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Who agreed the deal, special terms…" maxLength={2000} />
            </Field>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm text-[#cbd5cf]">
                <CheckCircle2 size={15} className="mr-1.5 inline text-emerald-400" />
                {selectedPlan?.label} will be active until <strong className="text-white">{formatDate(expiryPreview)}</strong>
              </p>
              <button type="submit" disabled={busy || agreedAmount === ''} className="inline-flex items-center gap-2 rounded-lg bg-[#e8783c] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#e8783c]/15 transition hover:bg-[#f18b50] disabled:opacity-50">
                {busy && <Loader2 size={16} className="animate-spin" />} Activate plan
              </button>
            </div>
          </div>
        </Panel>
      </form>

      {/* ── Online orders this month ───────────────────────────────────── */}
      <Panel
        icon={<BadgeIndianRupee size={19} />}
        title="Online orders this month"
        subtitle={`${detail.orderUsage.used} of ${detail.orderUsage.limit} used · ${detail.orderUsage.included} included + ${detail.orderUsage.extraOrders} extra · ${detail.orderUsage.exceeded ? 'limit reached, customers are blocked' : `${detail.orderUsage.remaining} left`}`}
      >
        <div className="mb-5 h-2.5 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full ${detail.orderUsage.exceeded ? 'bg-rose-500' : 'bg-emerald-500'}`}
            style={{ width: `${Math.min(100, Math.round((detail.orderUsage.used / Math.max(1, detail.orderUsage.limit)) * 100))}%` }}
          />
        </div>
        <p className={labelClass}>Add extra orders for an offline payment</p>
        <p className="mt-1 text-xs text-[#94a39d]">₹{detail.orderUsage.packPrice} per {detail.orderUsage.packSize} orders · valid for this month only.</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-4">
          <Field label="Packs">
            <input className={inputClass} type="number" min={1} max={detail.orderUsage.maxPacksPerPurchase} value={packCount} onChange={(e) => setPackCount(Number(e.target.value))} />
            <span className="mt-1 block text-[11px] text-[#87958e]">= {packCount > 0 ? packCount * detail.orderUsage.packSize : 0} orders</span>
          </Field>
          <Field label="Amount received (₹)">
            <input className={inputClass} type="number" min={0} step="0.01" value={packAmount} onChange={(e) => setPackAmount(e.target.value)} placeholder={String(Math.max(0, packCount) * detail.orderUsage.packPrice)} />
          </Field>
          <Field label="Payment mode">
            <select className={inputClass} value={packMode} onChange={(e) => setPackMode(e.target.value)}>
              {catalog.paymentModes.map((m) => <option key={m} value={m}>{PAYMENT_MODE_LABELS[m] ?? m}</option>)}
            </select>
          </Field>
          <Field label="Reference">
            <input className={inputClass} value={packRef} onChange={(e) => setPackRef(e.target.value)} placeholder="Optional" maxLength={255} />
          </Field>
        </div>
        <button
          type="button"
          disabled={busy || !Number.isInteger(packCount) || packCount < 1}
          onClick={async () => {
            const ok = await run(
              () => grantOrderPacks(clientId, { packs: packCount, amount: packAmount === '' ? undefined : Number(packAmount), paymentMode: packMode, paymentReference: packRef.trim() || undefined }),
              `${packCount * detail.orderUsage.packSize} extra orders added for this month.`,
            );
            if (ok) { setPackAmount(''); setPackRef(''); }
          }}
          className="mt-4 rounded-lg bg-[#e8783c] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#f18b50] disabled:opacity-50"
        >
          Add {packCount > 0 ? packCount * detail.orderUsage.packSize : 0} orders
        </button>
        {detail.orderPacks.length > 0 && (
          <ul className="mt-5 space-y-1.5 border-t border-white/10 pt-4 text-sm text-[#cbd5cf]">
            {detail.orderPacks.slice(0, 8).map((p) => (
              <li key={p.id} className="flex flex-wrap justify-between gap-2">
                <span>{p.period} · +{p.ordersAdded} orders · {formatRupees(p.amount)} · {p.source === 'MANUAL' ? `offline (${PAYMENT_MODE_LABELS[p.paymentMode ?? ''] ?? p.paymentMode ?? '—'})` : 'paid online'}</span>
                <span className="text-xs text-[#87958e]">{formatDate(p.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* ── History ────────────────────────────────────────────────────── */}
      <Panel icon={<History size={19} />} title="History">
        {detail.grants.length > 0 && (
          <div className="mb-6 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-[#87958e]">
                <tr><th className="py-2 pr-3">Recorded</th><th className="pr-3">Plan</th><th className="pr-3">Amount</th><th className="pr-3">Mode / ref</th><th className="pr-3">Valid until</th><th className="pr-3">Status</th><th>By</th></tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[#dce5df]">
                {detail.grants.map((g) => (
                  <tr key={g.id}>
                    <td className="py-2 pr-3">{formatDate(g.createdAt)}</td>
                    <td className="pr-3">{g.planId}</td>
                    <td className="pr-3">{formatRupees(g.agreedAmount)}</td>
                    <td className="pr-3">{PAYMENT_MODE_LABELS[g.paymentMode] ?? g.paymentMode}{g.paymentReference ? ` · ${g.paymentReference}` : ''}</td>
                    <td className="pr-3">{formatDate(g.expiresAt)}</td>
                    <td className="pr-3">{g.status === 'REVOKED' ? <span className="text-rose-300">Revoked</span> : g.status === 'ACTIVE' ? <span className="text-emerald-300">Active</span> : <span className="text-[#87958e]">Replaced</span>}</td>
                    <td className="truncate text-xs text-[#87958e]">{g.grantedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {detail.events.length === 0 ? (
          <p className="text-sm text-[#aab7b2]">No plan activity yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {detail.events.map((e) => (
              <li key={e.id} className="flex flex-wrap justify-between gap-2 border-b border-white/5 pb-2 text-[#cbd5cf]">
                <span>{EVENT_LABELS[e.eventType] ?? e.eventType}{e.toPlanId ? ` · ${e.toPlanId}` : ''}{e.toExpiry ? ` · until ${formatDate(e.toExpiry)}` : ''}</span>
                <span className="text-xs text-[#87958e]">{new Date(e.createdAt).toLocaleString('en-IN')}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
