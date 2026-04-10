"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogOut, User, CalendarCheck } from "lucide-react";
import Link from "next/link";

export default function ClientDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/client-portal");
    if (status === "authenticated" && !session.profileCompleted) router.push("/intake-form");
  }, [status, session, router]);

  if (status === "loading") return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="text-primary" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {session?.user?.name}!</h1>
          <p className="text-gray-600 mt-2">Your consultation form has been submitted.</p>

          <div className="grid grid-cols-1 gap-4 mt-8">
            <Link
              href="/#appointment"
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-blue-600 text-white font-semibold py-4 rounded-xl hover:shadow-lg transition"
            >
              <CalendarCheck size={20} />
              Book an Appointment
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center justify-center gap-3 border-2 border-gray-200 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-50 transition"
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