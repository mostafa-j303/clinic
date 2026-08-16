"use client";
import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import SlotPicker from "./SlotPicker";

interface ClientCalendarPickerProps {
  date: string; // YYYY-MM-DD
  slot: string | null;
  onDateChange: (date: string) => void;
  onSlotChange: (slot: string | null) => void;
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
    .getDate()
    .toString()
    .padStart(2, "0")}`;
}

// The client-facing booking calendar — a month grid like the admin's, but
// deliberately stripped down to just "does this day have any open time or
// not". It never shows who booked what, only whether a day/slot is still
// bookable, backed by the same /api/appointment-slots the flat picker used
// (via SlotPicker below) plus a new day-level /api/month-availability so the
// grid doesn't need one request per visible cell.
export default function ClientCalendarPicker({
  date,
  slot,
  onDateChange,
  onSlotChange,
}: ClientCalendarPickerProps) {
  const [cursor, setCursor] = useState(() => {
    const d = date ? new Date(`${date}T00:00:00`) : new Date();
    d.setDate(1);
    return d;
  });
  const [availability, setAvailability] = useState<Record<string, boolean> | null>(null);

  useEffect(() => {
    setAvailability(null);
    const year = cursor.getFullYear();
    const month = cursor.getMonth() + 1;
    fetch(`/api/month-availability?year=${year}&month=${month}`)
      .then((res) => res.json())
      .then((data) => setAvailability(data.availability || {}))
      .catch(() => setAvailability({}));
  }, [cursor]);

  const gridDays = useMemo(() => {
    const firstOfMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const startOffset = firstOfMonth.getDay();
    const gridStart = new Date(firstOfMonth);
    gridStart.setDate(gridStart.getDate() - startOffset);

    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      days.push(d);
    }
    return days;
  }, [cursor]);

  const todayKey = dateKey(new Date());
  const monthLabel = cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const pickDay = (key: string) => {
    onDateChange(key);
    onSlotChange(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {monthLabel}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="p-1.5 rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Previous month"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="p-1.5 rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Next month"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-gray-400 mb-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 mb-3">
        {gridDays.map((d) => {
          const key = dateKey(d);
          const inMonth = d.getMonth() === cursor.getMonth();
          const isPast = key < todayKey;
          const hasAvailability = availability ? availability[key] !== false : true;
          const disabled = !inMonth || isPast || !hasAvailability;
          const isSelected = date === key;

          return (
            <button
              type="button"
              key={key}
              disabled={disabled}
              onClick={() => pickDay(key)}
              title={
                !inMonth
                  ? undefined
                  : isPast
                  ? "In the past"
                  : hasAvailability
                  ? undefined
                  : "No available times this day"
              }
              className={`aspect-square rounded-md text-xs sm:text-sm flex items-center justify-center transition-colors ${
                !inMonth
                  ? "text-transparent pointer-events-none"
                  : isSelected
                  ? "bg-primary text-white font-semibold"
                  : disabled
                  ? "text-gray-300 dark:text-gray-700 cursor-not-allowed"
                  : key === todayKey
                  ? "text-primary font-semibold border border-primary hover:bg-primary/10"
                  : "text-gray-700 dark:text-gray-200 hover:bg-primary/10"
              }`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>

      {!availability && (
        <div className="flex items-center justify-center py-4 text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      )}

      {date && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Available Times (30 min) *
          </label>
          <SlotPicker date={date} selectedSlot={slot} onSelectSlot={onSlotChange} />
        </div>
      )}
    </div>
  );
}
