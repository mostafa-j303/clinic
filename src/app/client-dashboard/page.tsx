"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, User, CalendarCheck, Ticket } from "lucide-react";
import Link from "next/link";
import Alert from "../_components/Alert";

type CreditBundle = {
  id: number;
  appointment_name: string;
  total_visits: number;
  remaining_visits: number;
  completed_visits: number;
  expires_at: string | null;
};

export default function ClientDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [credits, setCredits] = useState<CreditBundle[]>([]);
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
      .then((data) => setCredits(data.credits || []))
      .catch(() => setCredits([]));
  }, [status]);

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
            {credits.some((c) => c.remaining_visits > 0) && (
              <Link
                href="/book-appointment"
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-accent text-white font-semibold py-4 rounded-xl hover:shadow-lg transition"
              >
                <CalendarCheck size={20} />
                Book an Appointment
              </Link>
            )}

            <Link
              href="/#appointment"
              className={`flex items-center justify-center gap-3 font-semibold py-4 rounded-xl transition ${
                credits.some((c) => c.remaining_visits > 0)
                  ? "border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                  : "bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg"
              }`}
            >
              <Ticket size={20} />
              Browse Packages
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
    </div>
  );
}
