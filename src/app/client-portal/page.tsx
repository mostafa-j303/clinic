"use client";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Eye, EyeOff, UserPlus, LogIn } from "lucide-react";
import Alert from "../_components/Alert";

export default function ClientPortal() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      if (session.profileCompleted) {
        router.push("/client-dashboard");
      } else {
        router.push("/intake-form");
      }
    }
  }, [status, session, router]);

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/intake-form" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "register") {
      const res = await fetch("/api/client/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAlert({ msg: data.message, type: "error" });
        setLoading(false);
        return;
      }
      setAlert({ msg: "Account created! Signing you in…", type: "success" });
      // Auto sign in after register
      await signIn("credentials", { email, password, callbackUrl: "/intake-form" });
    } else {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setAlert({ msg: "Invalid email or password", type: "error" });
      } else {
        router.push("/intake-form");
      }
    }
    setLoading(false);
  };

  if (status === "loading") return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {alert && (
        <Alert value={alert.msg} type={alert.type} onClose={() => setAlert(null)} />
      )}

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-blue-600 px-8 py-10 text-center">
          <h1 className="text-2xl font-bold text-white">Client Portal</h1>
          <p className="text-white/80 mt-2 text-sm">
            {mode === "login" ? "Welcome back!" : "Create your account"}
          </p>
        </div>

        <div className="p-8">
          {/* Google button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-xl py-3 font-semibold text-gray-700 hover:border-primary hover:bg-primary/5 transition mb-6"
          >
            <FcGoogle size={22} />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none text-gray-900"
              />
            )}

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none text-gray-900"
            />

            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none text-gray-900 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-blue-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : mode === "login" ? (
                <><LogIn size={18} /> Sign In</>
              ) : (
                <><UserPlus size={18} /> Create Account</>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-primary font-semibold hover:underline"
            >
              {mode === "login" ? "Register" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}