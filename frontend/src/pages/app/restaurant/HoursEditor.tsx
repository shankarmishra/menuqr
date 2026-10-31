import React, { useMemo } from 'react';
import { Plus, Trash2, Clock } from 'lucide-react';
import type { CanonicalWeeklyHours } from '../appStore';

interface HoursEditorProps {
  hours: CanonicalWeeklyHours;
  onChange: (updated: CanonicalWeeklyHours) => void;
}

const DAYS: Array<{ key: string; label: string }> = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
];

export const HoursEditor: React.FC<HoursEditorProps> = ({ hours, onChange }) => {
  const weekly = hours.weekly || {};

  // Quick fills
  const applyDaily10To11 = () => {
    const updatedWeekly: any = {};
    for (const d of DAYS) {
      updatedWeekly[d.key] = {
        closed: false,
        shifts: [{ open: '10:00', close: '23:00', overnight: false }],
      };
    }
    onChange({ ...hours, weekly: updatedWeekly });
  };

  const applyLunchDinner = () => {
    const updatedWeekly: any = {};
    for (const d of DAYS) {
      updatedWeekly[d.key] = {
        closed: false,
        shifts: [
          { open: '12:00', close: '15:30', overnight: false },
          { open: '19:00', close: '23:00', overnight: false },
        ],
      };
    }
    onChange({ ...hours, weekly: updatedWeekly });
  };

  const copyMonToAll = () => {
    const monConfig = weekly.mon || { closed: false, shifts: [{ open: '10:00', close: '23:00' }] };
    const updatedWeekly: any = {};
    for (const d of DAYS) {
      updatedWeekly[d.key] = JSON.parse(JSON.stringify(monConfig));
    }
    onChange({ ...hours, weekly: updatedWeekly });
  };

  // Status preview (IST time calculation)
  const previewStatus = useMemo(() => {
    const now = new Date();
    const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const todayKey = dayKeys[now.getDay()];
    const todayConfig = weekly[todayKey];
    if (!todayConfig || todayConfig.closed) {
      return { status: 'Closed today', open: false };
    }
    const firstShift = todayConfig.shifts?.[0];
    if (firstShift) {
      return { status: `Open · Closes ${firstShift.close}`, open: true };
    }
    return { status: 'Hours configured', open: true };
  }, [weekly]);

  const handleToggleDay = (dayKey: string, closed: boolean) => {
    const dayConfig = weekly[dayKey] || { closed: false, shifts: [] };
    const shifts =
      dayConfig.shifts && dayConfig.shifts.length > 0
        ? dayConfig.shifts
        : [{ open: '10:00', close: '23:00', overnight: false }];

    onChange({
      ...hours,
      weekly: {
        ...weekly,
        [dayKey]: { closed, shifts: closed ? [] : shifts },
      },
    });
  };

  const handleShiftChange = (
    dayKey: string,
    shiftIndex: number,
    field: 'open' | 'close',
    val: string
  ) => {
    const dayConfig = weekly[dayKey] || { closed: false, shifts: [] };
    const shifts = [...(dayConfig.shifts || [])];
    if (!shifts[shiftIndex]) return;

    shifts[shiftIndex] = {
      ...shifts[shiftIndex],
      [field]: val,
    };
    // Recompute overnight
    const [oH, oM] = (shifts[shiftIndex].open || '00:00').split(':').map(Number);
    const [cH, cM] = (shifts[shiftIndex].close || '00:00').split(':').map(Number);
    shifts[shiftIndex].overnight = cH * 60 + cM <= oH * 60 + oM;

    onChange({
      ...hours,
      weekly: {
        ...weekly,
        [dayKey]: { ...dayConfig, shifts },
      },
    });
  };

  const handleAddShift = (dayKey: string) => {
    const dayConfig = weekly[dayKey] || { closed: false, shifts: [] };
    const shifts = [...(dayConfig.shifts || [])];
    if (shifts.length >= 3) return;
    shifts.push({ open: '19:00', close: '23:00', overnight: false });

    onChange({
      ...hours,
      weekly: {
        ...weekly,
        [dayKey]: { ...dayConfig, shifts },
      },
    });
  };

  const handleRemoveShift = (dayKey: string, shiftIndex: number) => {
    const dayConfig = weekly[dayKey] || { closed: false, shifts: [] };
    const shifts = (dayConfig.shifts || []).filter((_, idx) => idx !== shiftIndex);
    onChange({
      ...hours,
      weekly: {
        ...weekly,
        [dayKey]: { ...dayConfig, shifts, closed: shifts.length === 0 },
      },
    });
  };

  return (
    <div className="space-y-5">
      {/* Quick Fills Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#151c19] border border-[#2a3832] rounded-xl p-3 shadow-inner">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            Quick Preset:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={applyDaily10To11}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#1d2723] border border-[#2a3832] text-slate-200 hover:text-white hover:border-[#e8783c]/50 transition-colors"
            >
              Daily 10 AM – 11 PM
            </button>
            <button
              type="button"
              onClick={applyLunchDinner}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#1d2723] border border-[#2a3832] text-slate-200 hover:text-white hover:border-[#e8783c]/50 transition-colors"
            >
              Lunch + Dinner Splits
            </button>
            <button
              type="button"
              onClick={copyMonToAll}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#1d2723] border border-[#2a3832] text-slate-200 hover:text-white hover:border-[#e8783c]/50 transition-colors"
            >
              Copy Mon to All
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <Clock size={13} className="animate-spin-slow" />
          <span>{previewStatus.status}</span>
        </div>
      </div>

      {/* Days Rows */}
      <div className="space-y-2">
        {DAYS.map(({ key, label }) => {
          const config = weekly[key] || { closed: false, shifts: [] };
          const isClosed = config.closed;
          const shifts = config.shifts || [];

          return (
            <div
              key={key}
              className={`p-3.5 rounded-xl border transition-all ${
                isClosed
                  ? 'bg-[#151c19]/40 border-[#2a3832]/60 opacity-60'
                  : 'bg-[#151c19] border-[#2a3832] hover:border-[#2a3832]/90 shadow-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Day name & Closed Switch */}
                <div className="flex items-center justify-between sm:justify-start gap-3 w-40">
                  <span className="text-xs font-bold text-slate-200 tracking-wide uppercase">
                    {label}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleDay(key, !isClosed)}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all ${
                      isClosed
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {isClosed ? 'Closed' : 'Open'}
                  </button>
                </div>

                {/* Shifts */}
                {!isClosed ? (
                  <div className="flex-1 flex flex-wrap items-center gap-2.5">
                    {shifts.map((shift, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex items-center gap-2 bg-[#0e1311] border border-[#2a3832] rounded-lg px-3 py-1.5 shadow-inner"
                      >
                        <input
                          type="time"
                          value={shift.open || '10:00'}
                          onChange={(e) => handleShiftChange(key, sIdx, 'open', e.target.value)}
                          className="bg-transparent text-xs font-mono text-slate-100 focus:outline-none"
                        />
                        <span className="text-slate-500 text-xs font-medium">to</span>
                        <input
                          type="time"
                          value={shift.close || '23:00'}
                          onChange={(e) => handleShiftChange(key, sIdx, 'close', e.target.value)}
                          className="bg-transparent text-xs font-mono text-slate-100 focus:outline-none"
                        />
                        {shift.overnight && (
                          <span className="text-[10px] font-mono font-bold text-[#e8783c] bg-[#e8783c]/15 px-1.5 py-0.5 rounded border border-[#e8783c]/30">
                            +1d
                          </span>
                        )}
                        {shifts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveShift(key, sIdx)}
                            className="text-slate-500 hover:text-rose-400 p-0.5 transition-colors ml-1"
                            title="Remove shift"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    ))}

                    {shifts.length < 3 && (
                      <button
                        type="button"
                        onClick={() => handleAddShift(key)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#f49b6b] hover:text-white px-2.5 py-1 rounded-lg bg-[#e8783c]/10 border border-[#e8783c]/30 hover:bg-[#e8783c]/20 transition-all"
                      >
                        <Plus size={12} />
                        <span>Add Shift</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic">Marked closed for the day</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Last order & General Note */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="bg-[#151c19] border border-[#2a3832] rounded-xl p-3.5 space-y-1.5">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide">
            Kitchen Last Order Buffer
          </label>
          <div className="relative">
            <input
              type="number"
              min={0}
              max={120}
              value={hours.lastOrderMinutes || 0}
              onChange={(e) => onChange({ ...hours, lastOrderMinutes: Number(e.target.value) })}
              className="w-full bg-[#0e1311] border border-[#2a3832] rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-[#e8783c] font-mono"
            />
            <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-medium">
              mins before close
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            QR order cart automatically disables during this buffer period.
          </p>
        </div>

        <div className="bg-[#151c19] border border-[#2a3832] rounded-xl p-3.5 space-y-1.5">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide">
            Hours Note / Special Schedule
          </label>
          <input
            type="text"
            value={hours.note || ''}
            onChange={(e) => onChange({ ...hours, note: e.target.value })}
            placeholder="e.g. Lunch buffet served 12:30 to 3:30 PM only"
            maxLength={120}
            className="w-full bg-[#0e1311] border border-[#2a3832] rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-[#e8783c] placeholder:text-slate-600"
          />
          <p className="text-[11px] text-slate-500">
            Displayed under hours on diner's info sheet (ⓘ).
          </p>
        </div>
      </div>
    </div>
  );
};
