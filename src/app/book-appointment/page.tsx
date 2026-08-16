"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Ticket, ArrowLeft } from "lucide-react";
import ClientCalendarPicker from "../_components/ClientCalendarPicker";
import Alert from "../_components/Alert";

type CreditBundle = {
  id: number;
  appointment_name: string;
  total_visits: number;
  remaining_visits: number;
  completed_visits: number;
  expires_at: string | null;
};

// Dedicated page for spending a visit credit on an actual appointment time —
// separate from buying a package (Appointment.tsx), which only ever grants
// credits. Reachable from the header's visit-count badge and the dashboard.
export default function BookAppointmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [credits, setCredits] = useState<CreditBundle[] | null>(null);
  const [selectedCreditId, setSelectedCreditId] = useState<number | null>(null);
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

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/client/my-credits")
      .then((res) => res.json())
      .then((data) => {
        const bundles: CreditBundle[] = data.credits || [];
        setCredits(bundles);
        const withCredit = bundles.find((c) => c.remaining_visits > 0);
        if (withCredit) setSelectedCreditId(withCredit.id);
      })
      .catch(() => setCredits([]));
  }, [status]);

  const selectedCredit = credits?.find((c) => c.id === selectedCreditId) || null;

  const handleBook = async () => {
    if (!selectedCredit || !date || !slot || !session?.phoneNumber) return;
    setIsSubmitting(true);
    const nameParts = (session.user?.name || "").split(" ");
    try {
      const res = await fetch("/api/client/book-from-credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creditId: selectedCredit.id,
          slotStart: `${date}T${slot}:00`,
          firstName: nameParts[0] || "Client",
          lastName: nameParts.slice(1).join(" ") || "-",
          phone: session.phoneNumber,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to book appointment");

      setAlertMessage(data.message || "Appointment requested.");
      setAlertType("success");
      setDate("");
      setSlot(null);
      // Refresh balances so the picked bundle's remaining count updates.
      fetch("/api/client/my-credits")
        .then((res) => res.json())
        .then((data) => setCredits(data.credits || []))
        .catch(() => {});
    } catch (err: any) {
      setAlertMessage(err.message || "Failed to book appointment.");
      setAlertType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || credits === null) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const bookableCredits = credits.filter((c) => c.remaining_visits > 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-12 px-4">
      {alertMessage && (
        <Alert value={alertMessage} type={alertType} onClose={() => setAlertMessage(null)} />
      )}

      <div className="max-w-2xl mx-auto">
        <Link
          href="/client-dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary mb-4"
        >
          <ArrowLeft size={14} /> Back to dashboard
        </Link>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="text-primary" size={24} />
            Book an Appointment
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1 mb-6">
            Use one of your remaining package visits on a specific date and time.
          </p>

          {bookableCredits.length === 0 ? (
            <div className="text-center py-10">
              <Ticket className="mx-auto text-gray-300 dark:text-gray-700 mb-3" size={40} />
              <p className="text-gray-600 dark:text-gray-300 font-medium">
                You don't have any visits available right now.
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Buy a package to get started, or check back after your current request is
                approved.
              </p>
              <Link
                href="/#appointment"
                className="inline-block mt-5 bg-gradient-to-r from-primary to-accent text-white font-semibold px-5 py-2.5 rounded-xl hover:shadow-lg transition"
              >
                Browse Packages
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {bookableCredits.length > 1 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Which package?
                  </label>
                  <select
                    value={selectedCreditId ?? ""}
                    onChange={(e) => {
                      setSelectedCreditId(Number(e.target.value));
                      setDate("");
                      setSlot(null);
                    }}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl focus:border-primary focus:outline-none text-gray-900 dark:text-white"
                  >
                    {bookableCredits.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.appointment_name} — {c.remaining_visits}/{c.total_visits} visits left
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedCredit && (
                <div className="rounded-lg p-3 text-sm font-medium bg-primary/5 text-primary border border-primary/20">
                  {selectedCredit.remaining_visits} of {selectedCredit.total_visits} visits
                  remaining on {selectedCredit.appointment_name}
                  {selectedCredit.expires_at &&
                    ` · valid until ${new Date(selectedCredit.expires_at).toLocaleDateString()}`}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Pick a Date & Time *
                </label>
                <ClientCalendarPicker
                  date={date}
                  slot={slot}
                  onDateChange={setDate}
                  onSlotChange={setSlot}
                />
              </div>

              <button
                type="button"
                onClick={handleBook}
                disabled={!date || !slot || isSubmitting}
                className={`w-full px-4 py-3 font-semibold rounded-xl transition flex items-center justify-center gap-2 ${
                  !date || !slot || isSubmitting
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Booking...
                  </>
                ) : (
                  "Book This Visit"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
