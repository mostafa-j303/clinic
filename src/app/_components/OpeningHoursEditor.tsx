"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Every 30-minute mark in a day, "HH:mm" (24h, for storage/comparison) paired
// with a 12h display label — e.g. { value: "13:30", label: "1:30 PM" }.
// Visits are 30 minutes long, so opening hours are only ever meaningful on
// these boundaries; a picker built from this list can't produce anything
// else, unlike a native <input type="time"> which happily accepts "13:07".
const HALF_HOUR_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  const value = `${h.toString().padStart(2, "0")}:${m}`;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return { value, label: `${hour12}:${m} ${period}` };
});

type DayHours = {
  dayOfWeek: number;
  isClosed: boolean;
  openTime: string | null;
  closeTime: string | null;
};

interface OpeningHoursEditorProps {
  onSaved?: () => void;
  onError?: (message: string) => void;
}

// Rounds an arbitrary "HH:mm" (e.g. loaded from a DB row written before this
// picker existed) down to the nearest 30-minute mark, so old free-typed
// values still render as a valid selection instead of silently mismatching
// every option.
function snapToHalfHour(value: string): string {
  const [hStr, mStr] = value.split(":");
  const h = Number(hStr);
  const m = Number(mStr) >= 30 ? 30 : 0;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

// Admin-configurable weekly opening hours — drives which days/times clients
// can book a 30-min appointment slot in. Manages its own fetch/save cycle,
// same pattern as SettingsImageUploader, since it's backed by its own table
// (clinic_hours) rather than the general `settings` row.
export default function OpeningHoursEditor({ onSaved, onError }: OpeningHoursEditorProps) {
  const [days, setDays] = useState<DayHours[] | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/clinic-hours")
      .then((res) => res.json())
      .then((data) => {
        const rows: DayHours[] = data.hours.map((h: any) => ({
          dayOfWeek: h.day_of_week,
          isClosed: h.is_closed,
          openTime: h.open_time ? snapToHalfHour(h.open_time.slice(0, 5)) : "09:00",
          closeTime: h.close_time ? snapToHalfHour(h.close_time.slice(0, 5)) : "17:00",
        }));
        setDays(rows);
      })
      .catch(() => onError?.("Failed to load opening hours"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateDay = (dayOfWeek: number, patch: Partial<DayHours>) => {
    setDays((prev) =>
      prev ? prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, ...patch } : d)) : prev
    );
  };

  const invalidDay = useMemo(() => {
    if (!days) return null;
    return days.find(
      (d) => !d.isClosed && d.openTime && d.closeTime && d.openTime >= d.closeTime
    );
  }, [days]);

  const handleSave = async () => {
    if (!days) return;
    if (invalidDay) {
      onError?.(`${DAY_NAMES[invalidDay.dayOfWeek]}'s closing time must be after its opening time.`);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/clinic-hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hours: days }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to save opening hours");
      onSaved?.();
    } catch (err: any) {
      onError?.(err.message || "Failed to save opening hours");
    } finally {
      setSaving(false);
    }
  };

  if (!days) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-2">
        {days.map((day) => {
          const rangeInvalid =
            !day.isClosed && day.openTime && day.closeTime && day.openTime >= day.closeTime;
          return (
            <div
              key={day.dayOfWeek}
              className="flex flex-wrap items-center gap-3 py-2 border-b border-gray-100 last:border-0"
            >
              <label className="flex items-center gap-2 w-28 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={!day.isClosed}
                  onChange={(e) => updateDay(day.dayOfWeek, { isClosed: !e.target.checked })}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm font-medium text-gray-700">{DAY_NAMES[day.dayOfWeek]}</span>
              </label>

              {day.isClosed ? (
                <span className="text-xs text-gray-400 italic">Closed</span>
              ) : (
                <div className="flex items-center gap-2">
                  <select
                    value={day.openTime ?? "09:00"}
                    onChange={(e) => updateDay(day.dayOfWeek, { openTime: e.target.value })}
                    className={`border rounded-md px-2 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                      rangeInvalid ? "border-red-400" : "border-gray-300"
                    }`}
                  >
                    {HALF_HOUR_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-gray-400">to</span>
                  <select
                    value={day.closeTime ?? "17:00"}
                    onChange={(e) => updateDay(day.dayOfWeek, { closeTime: e.target.value })}
                    className={`border rounded-md px-2 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                      rangeInvalid ? "border-red-400" : "border-gray-300"
                    }`}
                  >
                    {HALF_HOUR_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {rangeInvalid && (
                    <span className="text-xs text-red-500">Closing time must be after opening time</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !!invalidDay}
        className="mt-4 flex items-center gap-2 bg-primary hover:bg-hovprimary disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
      >
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        Save Opening Hours
      </button>
    </div>
  );
}
