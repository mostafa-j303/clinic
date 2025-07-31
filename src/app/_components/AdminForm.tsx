// components/AdminForm.tsx
"use client";
import React, { useState } from "react";
import Alert from "./Alert"; // adjust the path if necessary
import { useAdminAuth } from "../_context/AdminAuthContext";

const AdminForm = ({ onClose }: { onClose: () => void }) => {
  const [password, setPassword] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

const { isAdmin, login, logout } = useAdminAuth();

  const showAlertMessage = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/admin/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        showAlertMessage("Login successful!");
        login(); //call the login fucntion form adminauthcontext to make the admin true 
        setTimeout(() => {
          onClose(); // Close modal after alert
        }, 1500);
      } else {
        showAlertMessage(data.message || "Invalid password");
      }
    } catch (err) {
      console.error("Login error:", err);
      showAlertMessage("Server error. Please try again.");
    }
  };
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      {showAlert && (
        <Alert value={alertMessage} onClose={() => setShowAlert(false)} />
      )}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-80 text-center"
      >
        <h2 className="text-lg font-semibold mb-2 text-primary">
          Admin Access
        </h2>
        <hr></hr>
        <input
          type="password"
          placeholder="Enter Password"
          className="w-full border mt-2 px-3 py-2 rounded mb-4 text-black"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminForm;
