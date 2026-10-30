import { Clock } from 'lucide-react';

export type CategorySchedule = { from: string; to: string; days?: number[] };

const PRESETS: Array<{ label: string; from: string; to: string }> = [
  { label: 'Breakfast', from: '07:00', to: '11:00' },
  { label: 'Lunch', from: '12:00', to: '15:30' },
  { label: 'Evening snacks', from: '16:00', to: '19:00' },
  { label: 'Dinner', from: '19:00', to: '23:30' },
  { label: 'Happy hour', from: '17:00', to: '20:00' },
];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type Props = {
  value: CategorySchedule | null;
  onChange: (next: CategorySchedule | null) => void;
};

/** Optional serving window for a category. Times are India time, matching the guest's menu. */
export default function CategorySchedulePicker({ value, onChange }: Props) {
  const enabled = value !== null;
  const days = value?.days ?? [];

  const setField = (patch: Partial<CategorySchedule>) => onChange({ from: '07:00', to: '11:00', ...value, ...patch });
  const toggleDay = (d: number) => {
    const next = days.includes(d) ? days.filter((x) => x !== d) : [...days, d].sort();
    setField({ days: next.length === 7 ? [] : next });
  };

  return (
    <div className="rounded-xl border border-[#2d3a34] bg-[#151c19] p-4">
      <label className="flex cursor-pointer items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          <Clock size={15} className="text-[#e8783c]" />
          <span>
            <span className="block text-xs font-bold text-white">Only serve at certain times</span>
            <span className="block text-[11px] text-[#aab7b2]">Outside this window guests see the dishes but cannot order them.</span>
          </span>
        </span>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked ? { from: '07:00', to: '11:00' } : null)}
          className="h-5 w-5 rounded border-[#384841] bg-[#1d2723] text-[#e8783c]"
          aria-label="Only serve at certain times"
        />
      </label>

      {enabled && value && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => {
              const selected = value.from === p.from && value.to === p.to;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setField({ from: p.from, to: p.to })}
                  className={`rounded-full border px-3 py-1 text-[11px] font-bold ${
                    selected ? 'border-[#e8783c] bg-[#e8783c]/20 text-[#f4b48f]' : 'border-[#384841] text-[#aab7b2] hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-[11px] font-semibold text-[#aab7b2]">From
              <input
                type="time"
                value={value.from}
                onChange={(e) => e.target.value && setField({ from: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#384841] bg-[#1d2723] px-3 py-2 text-sm text-white focus:border-[#e8783c] focus:outline-none"
              />
            </label>
            <label className="text-[11px] font-semibold text-[#aab7b2]">Until
              <input
                type="time"
                value={value.to}
                onChange={(e) => e.target.value && setField({ to: e.target.value })}
                className="mt-1 w-full rounded-lg border border-[#384841] bg-[#1d2723] px-3 py-2 text-sm text-white focus:border-[#e8783c] focus:outline-none"
              />
            </label>
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-semibold text-[#aab7b2]">
              Days <span className="font-normal">({days.length === 0 ? 'every day' : 'selected days only'})</span>
            </p>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Days of the week">
              {DAYS.map((label, d) => {
                const selected = days.includes(d);
                return (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleDay(d)}
                    className={`h-8 w-11 rounded-lg border text-[11px] font-bold ${
                      selected ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300' : 'border-[#384841] text-[#aab7b2] hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {value.from > value.to && (
            <p className="text-[11px] text-[#e8b84a]">This runs past midnight and ends the next morning.</p>
          )}
        </div>
      )}
    </div>
  );
}
