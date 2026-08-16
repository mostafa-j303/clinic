"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import Alert from "../_components/Alert";
import PhoneField from "../_components/PhoneField";

const GENDER_OPTIONS = ["Female", "Male", "Prefer not to say"];

// Required one-time step for every client, Google sign-ins included — Google
// never asks for a phone number or gender during OAuth, so this closes that
// gap right after first login, before intake-form/dashboard are reachable.
export default function CompleteProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/client-portal");
    if (status === "authenticated" && !session.needsBasicInfo) {
      router.push(session.profileCompleted ? "/client-dashboard" : "/intake-form");
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim() || !gender) {
      setAlert({ msg: "Please fill in both fields", type: "error" });
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/client/complete-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber: phoneNumber.trim(), gender }),
    });
    const data = await res.json();
    if (!res.ok) {
      setAlert({ msg: data.message, type: "error" });
      setSubmitting(false);
      return;
    }

    await update({ phoneNumber: phoneNumber.trim(), gender });
    router.push(session?.profileCompleted ? "/client-dashboard" : "/intake-form");
  };

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      {alert && <Alert value={alert.msg} type={alert.type} onClose={() => setAlert(null)} />}

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-accent px-8 py-10 text-center">
          <h1 className="text-2xl font-bold text-white">Almost there</h1>
          <p className="text-white/80 mt-2 text-sm">
            Just a couple details before you continue
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <PhoneField value={phoneNumber} onChange={setPhoneNumber} required />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                So we can reach you about your appointments.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col gap-3">
                {GENDER_OPTIONS.map((g) => (
                  <label
                    key={g}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      checked={gender === g}
                      onChange={() => setGender(g)}
                      className="hidden"
                    />
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                        gender === g
                          ? "border-primary"
                          : "border-gray-300 dark:border-gray-600 group-hover:border-primary"
                      }`}
                    >
                      {gender === g && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <span className="text-gray-700 dark:text-gray-200 text-sm">{g}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-primary to-accent text-white font-bold py-3 rounded-xl hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Continue <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
