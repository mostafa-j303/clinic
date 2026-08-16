"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { openWhishApp } from "../utils/openWhishApp";
import Image from "next/image";
import { useSettings } from "../_context/SettingsContext";
import { useAdminAuth } from "../_context/AdminAuthContext";
import { Pencil, Plus, Trash2, X, Check, Star, CalendarDays, LogIn } from "lucide-react";
import AppointmentFormModal from "./AppointmentFormModal";
import ConfirmationModal from "./ConfirmationModal";
import Alert from "./Alert";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Loading from "./Loding";
import SectionHeading from "./SectionHeading";
import ParticleBackdrop, { hexToRgba } from "./ParticleBackdrop";
import ClientCalendarPicker from "./ClientCalendarPicker";

// Mirrors AppointmentFormModal's day->unit conversion, just for display here.
function daysToFriendly(days: number): string {
  const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? "" : "s"}`;
  if (days > 0 && days % 365 === 0) return plural(days / 365, "year");
  if (days > 0 && days % 30 === 0) return plural(days / 30, "month");
  if (days > 0 && days % 7 === 0) return plural(days / 7, "week");
  return plural(days, "day");
}

type AppointmentType = {
  id: number;
  price: string;
  offerprice?: string;
  name: string;
  duration?: string;
  details: string[];
  is_featured?: boolean;
  visit_count?: number | null;
  validity_days?: number | null;
};

function Appointment() {
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentType | null>(null);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const { settings, loading, error } = useSettings();
  const [fetched, setFetched] = useState(false);
  const { isAdmin } = useAdminAuth();
  const { data: clientSession, status: sessionStatus } = useSession();
  const router = useRouter();

  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState<AppointmentType | null>(null);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<"success" | "error">("success");

  const showAlertMessage = (message: string, type: "success" | "error" = "success") => {
    setAlertMessage(message);
    setAlertType(type);
  };

  const openAddModal = () => {
    setEditData(null);
    setFormOpen(true);
  };

  const openEditModal = (appointment: AppointmentType) => {
    setEditData(appointment);
    setFormOpen(true);
  };

  const handleToggleFeatured = async (id: number) => {
    try {
      const res = await fetch("/api/toggle-appointment-featured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to toggle featured");
      const { isFeatured } = await res.json();

      setAppointments((prev) => {
        const updated = prev.map((a) => ({
          ...a,
          is_featured: a.id === id ? isFeatured : false,
        }));
        return [...updated].sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
      });
    } catch (err) {
      console.error("Failed to toggle featured appointment", err);
      showAlertMessage("Failed to update featured package.", "error");
    }
  };

  const handleSaveAppointment = async (appointmentData: AppointmentType) => {
    const isEdit = !!appointmentData.id;
    const method = isEdit ? "PUT" : "POST";
    const endpoint = isEdit ? `/api/edit-appointment` : `/api/add-appointment`;

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });

      if (!res.ok) throw new Error("Failed to save appointment");

      const data = await res.json();

      const savedAppointment: AppointmentType = {
        id: data.id ?? appointmentData.id,
        name: appointmentData.name,
        price: appointmentData.price,
        offerprice: appointmentData.offerprice,
        duration: appointmentData.duration,
        details: appointmentData.details,
        visit_count: (appointmentData as any).visitCount ?? null,
        validity_days: (appointmentData as any).validityDays ?? null,
      };

      setAppointments((prev) =>
        isEdit
          ? prev.map((app) =>
              app.id === savedAppointment.id ? savedAppointment : app
            )
          : [...prev, savedAppointment]
      );

      setFormOpen(false);
      setEditData(null);
      showAlertMessage(
        `Appointment ${isEdit ? "updated" : "added"} successfully`,
        "success"
       );
    } catch (err) {
      console.error("Failed to save appointment", err);
      showAlertMessage("An error occurred while saving the appointment.", "error");
    }
  };

  // Fetch appointments from API
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch("/api/fetch-appointment");
        const data = await res.json();
        setAppointments(data.appointments);
        setFetched(true);
      } catch (error) {
        console.error("Failed to fetch appointments", error);
      }
    };

    fetchAppointments();
  }, [fetched]);

  useEffect(() => {
    const storedName = localStorage.getItem("name") || "";
    const storedLastName = localStorage.getItem("lastName") || "";
    const storedPhone = localStorage.getItem("phone") || "";
    setPhone(storedPhone);
    setName(storedName);
    setLastName(storedLastName);
  }, []);

  const openBookingModal = (appointment: AppointmentType) => {
    if (sessionStatus !== "authenticated") {
      showAlertMessage("Please log in to book an appointment.", "error");
      setTimeout(() => router.push("/client-portal"), 1200);
      return;
    }
    setDate("");
    setSlot(null);
    setSelectedAppointment(appointment);
  };

  const normalizePhone = (input: string): string | null => {
    let value = input.replace(/[^\d+]/g, "");
    if ((value.match(/\+/g) || []).length > 1) return null;
    if (value.includes("+") && !value.startsWith("+")) return null;
    value = value.replace("+", "");
    if (value.length < 9 || value.length > 15) return null;
    return `+${value}`;
  };

  const handleSubmit = async () => {
    if (sessionStatus !== "authenticated") {
      showAlertMessage("Please log in to book an appointment.", "error");
      return;
    }
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      showAlertMessage("Invalid phone number. Please check the format.", "error");
      return;
    }
    // A package (visit_count set) is always requested without a time — the
    // client books actual visits later, separately, once it's approved and
    // credited. A plain single-visit service still needs a time right away.
    const isPackage = !!selectedAppointment?.visit_count;
    if (!isPackage && (!date || !slot)) {
      showAlertMessage("Please pick a date and time.", "error");
      return;
    }
    localStorage.setItem("name", name);
    localStorage.setItem("lastName", lastName);
    localStorage.setItem("phone", phone);

    if (selectedAppointment) {
      setIsSubmitting(true);
      const priceUsed =
        selectedAppointment.offerprice
          ? selectedAppointment.offerprice
          : selectedAppointment.price;

      try {
        const res = await fetch("/api/create-appointment-request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: name,
            lastName: lastName,
            phone: normalizedPhone,
            appointmentId: selectedAppointment.id,
            appointmentName: selectedAppointment.name,
            slotStart: isPackage ? null : `${date}T${slot}:00`,
            paymentMethod,
            priceUsed,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Insert failed");

        showAlertMessage(
          isPackage
            ? "Package request sent — we'll confirm it and credit your visits soon."
            : "Appointment request sent successfully.",
          "success"
        );
        closeModal();
      } catch (err: any) {
        console.error(err);
        showAlertMessage(err.message || "Failed to submit appointment. Please try again.", "error");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteClick = (id: number) => {
    setAppointmentToDelete(id);
    setShowConfirmation(true);
  };

  const confirmDelete = async () => {
    if (!appointmentToDelete) return;

    try {
      const res = await fetch(
        `/api/delete-appointment?id=${appointmentToDelete}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("Failed to delete appointment");

      setAppointments((prev) =>
        prev.filter((a) => a.id !== appointmentToDelete)
      );
    } catch (error) {
      console.error("Delete failed", error);
      showAlertMessage("Failed to delete appointment.", "error");
    } finally {
      setShowConfirmation(false);
      setAppointmentToDelete(null);
    }
  };

  const closeModal = () => {
    setSelectedAppointment(null);
    setDate("");
    setSlot(null);
  };

  if (loading) return <Loading variant="grid" message="Loading appointments..." />;
  if (error) return <div className="text-red-500 text-center py-20">Error: {error}</div>;
  if (!settings) return null;

  return (
    <section
      id="appointment"
      className="relative w-full py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-hovsecondary via-white to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden"
    >
      <ParticleBackdrop
        colors={[
          hexToRgba(settings.colors.primary, 0.55),
          hexToRgba(settings.colors.accent, 0.5),
          hexToRgba(settings.colors.secondary, 0.45),
        ]}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Appointments"
          title="Choose Your Package"
          subtitle="Personalized nutrition packages designed around your goals, from a single consultation to a full year of ongoing support."
        />
        {/* Grid of Appointment Cards — 2-up on mobile, matching the Products grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
          {appointments.map((appointment: AppointmentType) => (
            <div
              key={appointment.id}
              className={`group relative bg-white dark:bg-gray-800 rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300 p-3 sm:p-6 flex flex-col ${
                appointment.is_featured
                  ? "border-amber-400 shadow-amber-200/50"
                  : "border-gray-200 dark:border-gray-700 hover:border-primary"
              }`}
            >
              {appointment.is_featured && (
                // Small dedicated corner wrapper owns the clipping, sized just for the
                // ribbon — keeps it independent of the card's own overflow behavior.
                // Scaled down on mobile so it doesn't overrun a narrow 2-up card.
                <div className="absolute top-0 right-0 w-16 h-16 sm:w-28 sm:h-28 overflow-hidden rounded-tr-xl pointer-events-none">
                  <motion.div
                    className="absolute top-[10px] right-[-24px] w-[90px] py-0.5 text-center text-[7px] sm:top-[22px] sm:right-[-40px] sm:w-[150px] sm:py-1 sm:text-[11px] font-bold uppercase tracking-wide text-white shadow-md rotate-45"
                    style={{
                      backgroundSize: "200% 100%",
                      backgroundImage:
                        "linear-gradient(90deg, #b45309, #fbbf24, #b45309)",
                    }}
                    animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                  >
                    Most Popular
                  </motion.div>
                </div>
              )}

              {/* Header */}
              <div className="mb-2 sm:mb-4 flex items-start justify-between gap-2">
                <h3 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
                  {appointment.name}
                </h3>
                {isAdmin && (
                  <button
                    onClick={() => handleToggleFeatured(appointment.id)}
                    className="flex-shrink-0 cursor-pointer"
                    title={appointment.is_featured ? "Unmark as featured" : "Mark as featured (shows first)"}
                  >
                    <Star
                      size={18}
                      className={
                        appointment.is_featured
                          ? "fill-amber-400 text-amber-500"
                          : "text-gray-300 hover:text-amber-400"
                      }
                    />
                  </button>
                )}
              </div>

              {/* Price Section */}
              <div className="mb-2 sm:mb-4 pb-2 sm:pb-4 border-b border-gray-200 dark:border-gray-700">
                <p className="flex items-baseline gap-1.5 sm:gap-2">
                  {appointment.offerprice ? (
                    <>
                      <span className="text-xs sm:text-sm text-gray-500 line-through">
                        {appointment.price}
                      </span>
                      <span className="text-lg sm:text-2xl font-bold text-primary">
                        {appointment.offerprice}
                      </span>
                    </>
                  ) : (
                    <span className="text-lg sm:text-2xl font-bold text-primary">
                      {appointment.price}
                    </span>
                  )}
                </p>
              </div>

              {/* Details List */}
              <ul className="space-y-1 sm:space-y-2 mb-3 sm:mb-6 flex-grow">
                {!!appointment.visit_count && (
                  <li className="flex items-start gap-1.5 sm:gap-2">
                    <Check size={13} className="text-primary flex-shrink-0 mt-0.5 sm:size-4" />
                    <span className="text-[11px] sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2 sm:line-clamp-none">
                      {appointment.visit_count} Visit{appointment.visit_count === 1 ? "" : "s"} Included
                    </span>
                  </li>
                )}
                {appointment.details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-1.5 sm:gap-2">
                    <Check size={13} className="text-primary flex-shrink-0 mt-0.5 sm:size-4" />
                    <span className="text-[11px] sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2 sm:line-clamp-none">{detail}</span>
                  </li>
                ))}
              </ul>

              {/* Duration */}
              {appointment.duration && (
                <div className="mb-2 sm:mb-4 pb-2 sm:pb-4 border-t border-gray-200 dark:border-gray-700 pt-2 sm:pt-4">
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Duration</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">
                    {appointment.duration}
                  </p>
                </div>
              )}

              {/* Book Button */}
              <button
                onClick={() => openBookingModal(appointment)}
                className="w-full py-2 sm:py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 mb-2 sm:mb-3 text-xs sm:text-base flex items-center justify-center gap-1.5"
              >
                {sessionStatus !== "authenticated" && <LogIn size={14} />}
                Book Now
              </button>

              {/* Admin Controls */}
              {isAdmin && (
                <div className="flex gap-2 pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => openEditModal(appointment)}
                    className="flex-1 flex items-center justify-center gap-1 sm:gap-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg py-1.5 sm:py-2 transition-colors"
                  >
                    <Pencil size={14} />
                    <span className="text-[11px] sm:text-xs font-semibold">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(appointment.id)}
                    className="flex-1 flex items-center justify-center gap-1 sm:gap-2 bg-red-100 hover:bg-red-600 text-red-600 hover:text-white rounded-lg py-1.5 sm:py-2 transition-colors"
                  >
                    <Trash2 size={14} />
                    <span className="text-[11px] sm:text-xs font-semibold">Delete</span>
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Add New Appointment Card (Admin Only) */}
          {isAdmin && (
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 rounded-xl border-2 border-dashed border-green-400 dark:border-green-700 p-3 sm:p-6 flex items-center justify-center hover:border-green-600 hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={openAddModal}
            >
              <div className="text-center">
                <Plus className="w-8 h-8 sm:w-12 sm:h-12 text-green-600 mx-auto mb-1 sm:mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs sm:text-base font-semibold text-green-700 dark:text-green-400">Add Appointment</p>
                <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-500 mt-0.5 sm:mt-1">Create new service</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AppointmentFormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditData(null);
        }}
        onSave={handleSaveAppointment}
        initialData={editData}
      />

      {showConfirmation && (
        <ConfirmationModal
          text="Are you sure you want to delete this appointment?"
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowConfirmation(false);
            setAppointmentToDelete(null);
          }}
          isDangerous={true}
        />
      )}

      {alertMessage && (
        <Alert value={alertMessage} type={alertType} onClose={() => setAlertMessage(null)} />
      )}

      {/* Booking Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary to-accent px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                Book: {selectedAppointment.name}
              </h2>
              <button
                onClick={closeModal}
                className="text-white hover:bg-white/20 rounded-lg p-1 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <form className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:border-primary transition text-black dark:text-white"
                  placeholder="Enter your first name"
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:border-primary transition text-black dark:text-white"
                  placeholder="Enter your last name"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Phone Number *
                </label>
                <PhoneInput
                  country={"lb"}
                  value={phone}
                  onChange={(value) => setPhone(value)}
                  inputProps={{
                    name: "phone",
                    required: true,
                  }}
                  dropdownClass="custom-dropdown"
                  enableSearch
                  containerClass="w-full"
                  inputClass="!w-full !py-2 !pl-12 !text-black !border !rounded"
                />
              </div>

              {/* Packages just grant visit credits — no time picked here at
                  all. Booking an actual appointment (using those credits)
                  happens later from the "Book Appointment" page. */}
              {selectedAppointment.visit_count ? (
                <div className="rounded-lg p-3 text-sm font-medium bg-primary/5 text-primary border border-primary/20">
                  This package includes {selectedAppointment.visit_count} visit
                  {selectedAppointment.visit_count === 1 ? "" : "s"}
                  {selectedAppointment.validity_days
                    ? `, valid for ${daysToFriendly(selectedAppointment.validity_days)}`
                    : ""}
                  . Once we approve your request, you'll see your visits in the header and can
                  book appointment times any time from the Book Appointment page.
                </div>
              ) : (
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
                    <CalendarDays size={16} className="text-primary" />
                    Pick a Date & Time *
                  </label>
                  <ClientCalendarPicker
                    date={date}
                    slot={slot}
                    onDateChange={setDate}
                    onSlotChange={setSlot}
                  />
                </div>
              )}

              {/* Payment Method */}
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

              {/* Wish Money Info */}
              {paymentMethod === "Wish Money" && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                    Pay to Wish Account:
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-lg font-bold text-primary">
                      {settings.social.wishnb}
                    </span>
                    <button
                      type="button"
                      onClick={openWhishApp}
                      className="flex-shrink-0 hover:opacity-80 transition"
                    >
                      <Image
                        src={settings.images.whishlogo}
                        alt="Open Whish"
                        width={40}
                        height={50}
                        className="rounded-lg"
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={
                    !name ||
                    !lastName ||
                    !phone ||
                    (!selectedAppointment.visit_count && (!date || !slot)) ||
                    isSubmitting
                  }
                  className={`flex-1 px-4 py-2 font-semibold rounded-lg transition flex items-center justify-center gap-2 ${
                    !name ||
                    !lastName ||
                    !phone ||
                    (!selectedAppointment.visit_count && (!date || !slot)) ||
                    isSubmitting
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Sending...
                    </>
                  ) : selectedAppointment.visit_count ? (
                    "Request Package"
                  ) : (
                    "Send Request"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default Appointment;