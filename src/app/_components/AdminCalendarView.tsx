"use client";
import React, { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Lock, Unlock, Loader2 } from "lucide-react";

type AppointmentRequest = {
  id: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  appointment_name: string;
  selected_date: string;
  slot_start: string | null;
  status: string;
};

type DaySlot = { time: string; status: "available" | "closed" | "confirmed" | "past" };

const STATUS_DOT: Record<string, string> = {
  Pending: "bg-yellow-400",
  Confirmed: "bg-blue-500",
  Completed: "bg-green-500",
  Cancelled: "bg-red-400",
};

function dateKey(d: Date) {
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
    .getDate()
    .toString()
    .padStart(2, "0")}`;
}

function formatSlotLabel(t: string) {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

// Month-grid calendar of appointment requests, grouped by day (from
// slot_start — falls back to selected_date for pre-slot-system legacy rows).
// Clicking a day lists that day's appointments AND lets the admin close the
// whole day or individual 30-min slots to new bookings.
export default function AdminCalendarView({ requests }: { requests: AppointmentRequest[] }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<{
    dayOpen: boolean;
    fullDayClosed: boolean;
    slots: DaySlot[];
  } | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  const byDay = useMemo(() => {
    const map = new Map<string, AppointmentRequest[]>();
    for (const r of requests) {
      if (r.status === "Cancelled") continue;
      const when = r.slot_start || r.selected_date;
      const key = dateKey(new Date(when));
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    for (const list of map.values()) {
      list.sort((a, b) => {
        const av = a.slot_start || a.selected_date;
        const bv = b.slot_start || b.selected_date;
        return new Date(av).getTime() - new Date(bv).getTime();
      });
    }
    return map;
  }, [requests]);

  const loadSchedule = (day: string) => {
    setSchedule(null);
    setScheduleError(null);
    fetch(`/api/admin/day-schedule?date=${day}`)
      .then((res) => res.json())
      .then((data) => setSchedule(data))
      .catch(() => setScheduleError("Failed to load this day's schedule."));
  };

  useEffect(() => {
    if (selectedDay) loadSchedule(selectedDay);
  }, [selectedDay]);

  const toggleDay = async (close: boolean) => {
    if (!selectedDay) return;
    setTogglingKey("__day__");
    try {
      const res = await fetch("/api/admin/toggle-closure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDay, close }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      loadSchedule(selectedDay);
    } catch (err: any) {
      setScheduleError(err.message || "Failed to update");
    } finally {
      setTogglingKey(null);
    }
  };

  const toggleSlot = async (time: string, close: boolean) => {
    if (!selectedDay) return;
    setTogglingKey(time);
    try {
      const res = await fetch("/api/admin/toggle-closure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDay, slotTime: time, close }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      loadSchedule(selectedDay);
    } catch (err: any) {
      setScheduleError(err.message || "Failed to update");
    } finally {
      setTogglingKey(null);
    }
  };

  const monthLabel = cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });

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

  const today = dateKey(new Date());
  const selectedList = selectedDay ? byDay.get(selectedDay) || [] : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 dark:text-white">{monthLabel}</h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
              className="p-1.5 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
              className="p-1.5 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] sm:text-xs font-semibold text-gray-400 mb-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {gridDays.map((d) => {
            const key = dateKey(d);
            const inMonth = d.getMonth() === cursor.getMonth();
            const dayRequests = byDay.get(key) || [];
            const isSelected = selectedDay === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedDay(key)}
                className={`aspect-square rounded-md border text-left p-1 sm:p-1.5 flex flex-col transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                } ${!inMonth ? "opacity-40" : ""}`}
              >
                <span
                  className={`text-[10px] sm:text-xs font-medium ${
                    key === today ? "text-primary font-bold" : "text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {d.getDate()}
                </span>
                {dayRequests.length > 0 && (
                  <div className="mt-auto flex flex-wrap gap-1">
                    {dayRequests.slice(0, 4).map((r) => (
                      <span
                        key={r.id}
                        className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${STATUS_DOT[r.status] || "bg-gray-300"}`}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3 mt-4 text-[11px] text-gray-500 dark:text-gray-400">
          {Object.entries(STATUS_DOT).map(([label, dot]) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-full ${dot}`} /> {label}
            </span>
          ))}
        </div>
      </div>

      {/* Day detail panel */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">
          {selectedDay
            ? new Date(`${selectedDay}T00:00:00`).toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })
            : "Select a day"}
        </h3>

        {!selectedDay && (
          <p className="text-sm text-gray-400">Click a day on the calendar to see its appointments.</p>
        )}

        {/* Availability management */}
        {selectedDay && (
          <div className="mb-5 pb-5 border-b border-gray-100 dark:border-gray-800">
            {scheduleError && (
              <p className="text-xs text-red-600 dark:text-red-400 mb-2">{scheduleError}</p>
            )}

            {!schedule ? (
              <div className="flex items-center justify-center py-6 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            ) : !schedule.dayOpen ? (
              <p className="text-xs text-gray-400 italic">
                Not a working day (see Opening Hours in Settings).
              </p>
            ) : (
              <>
                <button
                  onClick={() => toggleDay(!schedule.fullDayClosed)}
                  disabled={togglingKey === "__day__"}
                  className={`w-full flex items-center justify-center gap-2 text-xs font-semibold py-2 rounded-lg mb-3 transition-colors disabled:opacity-60 ${
                    schedule.fullDayClosed
                      ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                      : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                  }`}
                >
                  {togglingKey === "__day__" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : schedule.fullDayClosed ? (
                    <Unlock size={14} />
                  ) : (
                    <Lock size={14} />
                  )}
                  {schedule.fullDayClosed ? "Reopen this day" : "Close this whole day"}
                </button>

                {schedule.slots.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No slots configured for this day.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-1.5">
                    {schedule.slots.map((slot) => {
                      const isToggling = togglingKey === slot.time;
                      const disabled =
                        slot.status === "confirmed" || slot.status === "past" || isToggling;
                      return (
                        <button
                          key={slot.time}
                          disabled={disabled}
                          onClick={() => toggleSlot(slot.time, slot.status !== "closed")}
                          title={
                            slot.status === "confirmed"
                              ? "Already confirmed — cancel that booking first to close this time"
                              : slot.status === "past"
                              ? "This time has passed"
                              : slot.status === "closed"
                              ? "Closed — click to reopen"
                              : "Click to close this time"
                          }
                          className={`flex items-center justify-center gap-1 py-1.5 rounded-md text-[11px] font-medium border transition-colors ${
                            slot.status === "confirmed"
                              ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 cursor-not-allowed"
                              : slot.status === "past"
                              ? "bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                              : slot.status === "closed"
                              ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40"
                              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-primary"
                          }`}
                        >
                          {isToggling ? (
                            <Loader2 size={10} className="animate-spin" />
                          ) : slot.status === "closed" ? (
                            <Lock size={10} />
                          ) : null}
                          {formatSlotLabel(slot.time)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {selectedDay && selectedList.length === 0 && (
          <p className="text-sm text-gray-400">No appointments this day.</p>
        )}

        <div className="space-y-3">
          {selectedList.map((r) => (
            <div
              key={r.id}
              className="border border-gray-100 dark:border-gray-800 rounded-lg p-3"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-semibold text-sm text-gray-900 dark:text-white">
                  {r.first_name} {r.last_name}
                </span>
                <span
                  className={`w-3 h-3 rounded-full flex-shrink-0 ${STATUS_DOT[r.status] || "bg-gray-300"}`}
                  title={r.status}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{r.appointment_name}</p>
              {r.slot_start && (
                <p className="flex items-center gap-1 text-xs text-primary font-medium mt-1">
                  <Clock size={12} />
                  {new Date(r.slot_start).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
