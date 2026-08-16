"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, User, CalendarCheck, Ticket, CalendarClock, X, CalendarDays } from "lucide-react";
import Link from "next/link";
import SlotPicker from "../_components/SlotPicker";
import Alert from "../_components/Alert";

type CreditBundle = {
  id: number;
  appointment_name: string;
  total_visits: number;
  remaining_visits: number;
  completed_visits: number;
  expires_at: string | null;
};

type UnscheduledRequest = {
  id: number;
  appointment_name: string;
  price_used: string;
  created_at: string;
};

export default function ClientDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [credits, setCredits] = useState<CreditBundle[]>([]);
  const [unscheduled, setUnscheduled] = useState<UnscheduledRequest[]>([]);
  const [scheduling, setScheduling] = useState<UnscheduledRequest | null>(null);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<"success" | "error">("success");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/client-portal");
    if (status === "authenticated" && session.isSuspended) {
      signOut({ callbackUrl: "/client-portal?error=SUSPENDED" });
    } else if (status === "authenticated" && session.needsBasicInfo) {
      router.push("/complete-profile");
    } else if (status === "authenticated" && !session.profileCompleted) {
      router.push("/intake-form");
    }
  }, [status, session, router]);

  const loadDashboardData = () => {
    fetch("/api/client/my-credits")
      .then((res) => res.json())
      .then((data) => setCredits(data.credits || []))
      .catch(() => setCredits([]));
    fetch("/api/client/unscheduled-visits")
      .then((res) => res.json())
      .then((data) => setUnscheduled(data.requests || []))
      .catch(() => setUnscheduled([]));
  };

  useEffect(() => {
    if (status !== "authenticated") return;
    loadDashboardData();
  }, [status]);

  const openScheduleModal = (req: UnscheduledRequest) => {
    setScheduling(req);
    setDate("");
    setSlot(null);
  };

  const closeScheduleModal = () => {
    setScheduling(null);
    setDate("");
    setSlot(null);
  };

  const submitSchedule = async () => {
    if (!scheduling || !date || !slot) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/client/schedule-visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: scheduling.id,
          slotStart: `${date}T${slot}:00`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to schedule visit");

      setAlertMessage(data.message || "Visit scheduled.");
      setAlertType("success");
      closeScheduleModal();
      loadDashboardData();
    } catch (err: any) {
      setAlertMessage(err.message || "Failed to schedule visit.");
      setAlertType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-12">
      {alertMessage && (
        <Alert value={alertMessage} type={alertType} onClose={() => setAlertMessage(null)} />
      )}

      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="text-primary" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {session?.user?.name}!</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Your consultation form has been submitted.</p>

          {unscheduled.length > 0 && (
            <div className="mt-6 space-y-3 text-left">
              {unscheduled.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40">
                      <CalendarClock className="text-amber-600 dark:text-amber-400" size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {r.appointment_name}
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-400">Awaiting a scheduled visit</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openScheduleModal(r)}
                    className="flex-shrink-0 bg-primary hover:bg-hovprimary text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                  >
                    Pick a time
                  </button>
                </div>
              ))}
            </div>
          )}

          {credits.length > 0 && (
            <div className="mt-6 space-y-3 text-left">
              {credits.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                      <Ticket className="text-primary" size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {c.appointment_name}
                      </p>
                      {c.expires_at && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Valid until {new Date(c.expires_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-lg font-bold text-primary">
                      {c.remaining_visits}/{c.total_visits}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">visits left</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 mt-8">
            <Link
              href="/#appointment"
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-accent text-white font-semibold py-4 rounded-xl hover:shadow-lg transition"
            >
              <CalendarCheck size={20} />
              Book an Appointment
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center justify-center gap-3 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold py-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Schedule modal */}
      {scheduling && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-primary to-accent px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Schedule: {scheduling.appointment_name}</h2>
              <button
                onClick={closeScheduleModal}
                className="text-white hover:bg-white/20 rounded-lg p-1 transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                  <CalendarDays size={16} className="text-primary" />
                  Preferred Date *
                </label>
                <input
                  type="date"
                  value={date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setSlot(null);
                  }}
                  className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:border-primary transition text-black dark:text-white"
                />
              </div>

              {date && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Available Times (30 min) *
                  </label>
                  <SlotPicker date={date} selectedSlot={slot} onSelectSlot={setSlot} />
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={closeScheduleModal}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitSchedule}
                  disabled={!date || !slot || isSubmitting}
                  className={`flex-1 px-4 py-2 font-semibold rounded-lg transition flex items-center justify-center gap-2 ${
                    !date || !slot || isSubmitting
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Scheduling...
                    </>
                  ) : (
                    "Confirm Time"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
