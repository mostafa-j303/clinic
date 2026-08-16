"use client";
import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface SlotPickerProps {
  date: string; // YYYY-MM-DD
  selectedSlot: string | null;
  onSelectSlot: (slot: string) => void;
}

// 30-minute time slots for the chosen day, fetched from the server (which
// already excludes hours the clinic is closed and slots someone else has a
// *confirmed* booking for).
export default function SlotPicker({ date, selectedSlot, onSelectSlot }: SlotPickerProps) {
  const [slots, setSlots] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date) return;
    setSlots(null);
    setError(null);
    fetch(`/api/appointment-slots?date=${date}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load times");
        return data;
      })
      .then((data) => setSlots(data.slots))
      .catch((err) => setError(err.message || "Failed to load available times"));
  }, [date]);

  if (!date) return null;

  if (error) {
    return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>;
  }

  if (!slots) {
    return (
      <div className="flex items-center justify-center py-6 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 py-2">
        No available times on this day. Please pick another date.
      </p>
    );
  }

  const formatLabel = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
  };

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slots.map((slot) => (
        <button
          key={slot}
          type="button"
          onClick={() => onSelectSlot(slot)}
          className={`py-2 px-2 rounded-lg text-xs sm:text-sm font-medium border transition-colors ${
            selectedSlot === slot
              ? "bg-primary border-primary text-white"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-primary"
          }`}
        >
          {formatLabel(slot)}
        </button>
      ))}
    </div>
  );
}
