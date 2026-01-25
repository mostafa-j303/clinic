"use client";
import React, { useState } from "react";
import { Lock, X, Eye, EyeOff, Loader } from "lucide-react";
import Alert from "./Alert";
import { useAdminAuth } from "../_context/AdminAuthContext";

const AdminForm = ({ onClose }: { onClose: () => void }) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error">("success");

  const { login } = useAdminAuth();

  const showAlertMessage = (message: string, type: "success" | "error" = "success") => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      showAlertMessage("Please enter a password", "error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        showAlertMessage("Login successful! Welcome back.", "success");
        login();
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        showAlertMessage(data.message || "Invalid password. Please try again.", "error");
      }
    } catch (err) {
      console.error("Login error:", err);
      showAlertMessage("Server error. Please try again later.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      {showAlert && (
        <Alert 
          value={alertMessage} 
          onClose={() => setShowAlert(false)}
        />
      )}

      <div className="relative w-full max-w-md">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-10 -right-2 text-white hover:text-gray-300 transition"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        {/* Modal Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-primary to-blue-600 px-6 py-8 text-center">
            <div className="flex justify-center mb-3">
              <div className="bg-white/20 p-3 rounded-full backdrop-blur">
                <Lock className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white">Admin Access</h2>
            <p className="text-white/80 text-sm mt-1">Enter your password to continue</p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="px-6 py-8 space-y-6">
            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your admin password"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition text-gray-900 placeholder-gray-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-primary to-blue-600 text-white font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </div>

            {/* Footer text */}
            <p className="text-xs text-center text-gray-500">
              Your session is secure and encrypted.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminForm;