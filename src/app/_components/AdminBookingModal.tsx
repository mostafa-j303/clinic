"use client";
import React, { useEffect, useMemo, useState } from "react";
import { X, CalendarDays } from "lucide-react";
import SlotPicker from "./SlotPicker";
import PhoneField from "./PhoneField";

type Client = {
  id: number;
  email: string;
  full_name: string;
  phone_number: string | null;
};

type AppointmentOption = {
  id: number;
  name: string;
  price: string;
  offerprice?: string;
};

interface AdminBookingModalProps {
  onClose: () => void;
  onCreated: () => void;
}

// Lets the admin place a booking directly for an existing registered client
// — a walk-in or phone booking — skipping the public booking flow entirely.
// Goes straight to Confirmed.
export default function AdminBookingModal({ onClose, onCreated }: AdminBookingModalProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [packages, setPackages] = useState<AppointmentOption[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [clientId, setClientId] = useState<number | null>(null);
  const [appointmentId, setAppointmentId] = useState<number | null>(null);
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/get-clients")
      .then((res) => res.json())
      .then((data) => setClients(data.clients || []))
      .catch(() => setClients([]));
    fetch("/api/fetch-appointment")
      .then((res) => res.json())
      .then((data) => setPackages(data.appointments || []))
      .catch(() => setPackages([]));
  }, []);

  const filteredClients = useMemo(() => {
    const q = clientSearch.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) => c.full_name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
    );
  }, [clients, clientSearch]);

  const selectedClient = clients.find((c) => c.id === clientId);
  const selectedPackage = packages.find((p) => p.id === appointmentId);

  useEffect(() => {
    if (selectedClient?.phone_number) setPhone(selectedClient.phone_number.replace(/\D/g, ""));
  }, [selectedClient]);

  const handleSubmit = async () => {
    if (!clientId || !selectedClient || !appointmentId || !selectedPackage || !date || !slot || !phone) {
      setError("Please fill out every field.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/create-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          firstName: selectedClient.full_name?.split(" ")[0] || selectedClient.full_name,
          lastName: selectedClient.full_name?.split(" ").slice(1).join(" ") || "-",
          phone,
          appointmentId,
          appointmentName: selectedPackage.name,
          slotStart: `${date}T${slot}:00`,
          paymentMethod,
          priceUsed: selectedPackage.offerprice || selectedPackage.price,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create booking");
      onCreated();
    } catch (err: any) {
      setError(err.message || "Failed to create booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-primary to-accent px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">New Booking</h2>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-1 transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Client */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Client *
            </label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:border-primary transition text-black dark:text-white mb-2"
            />
            <select
              value={clientId ?? ""}
              onChange={(e) => setClientId(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:border-primary transition text-black dark:text-white"
              size={Math.min(6, Math.max(3, filteredClients.length))}
            >
              {filteredClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} — {c.email}
                </option>
              ))}
            </select>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Phone Number *
            </label>
            <PhoneField value={phone} onChange={setPhone} />
          </div>

          {/* Package */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Package *
            </label>
            <select
              value={appointmentId ?? ""}
              onChange={(e) => setAppointmentId(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:border-primary transition text-black dark:text-white"
            >
              <option value="">Select a package...</option>
              {packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.offerprice || p.price})
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
              <CalendarDays size={16} className="text-primary" />
              Date *
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

          {/* Payment */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:border-primary transition text-black dark:text-white"
            >
              <option value="Cash">Cash</option>
              <option value="Wish Money">Wish Money</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!clientId || !appointmentId || !date || !slot || !phone || isSubmitting}
              className={`flex-1 px-4 py-2 font-semibold rounded-lg transition flex items-center justify-center gap-2 ${
                !clientId || !appointmentId || !date || !slot || !phone || isSubmitting
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg"
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Creating...
                </>
              ) : (
                "Create & Confirm"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
