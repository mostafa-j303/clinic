"use client";
import React, { useState, useEffect } from "react";
import data from "../../../public/data.json";
import { openWhishApp } from "../utils/openWhishApp";
import Image from "next/image";
import { useSettings } from "../_context/SettingsContext";
import { useAdminAuth } from "../_context/AdminAuthContext";
import { Pencil, Plus, Trash2, X, Check } from "lucide-react";
import AppointmentFormModal from "./AppointmentFormModal";
import ConfirmationModal from "./ConfirmationModal";
import Alert from "./Alert";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Loading from "./Loding";

type AppointmentType = {
  id: number;
  price: string;
  offerprice?: string;
  name: string;
  duration?: string;
  details: string[];
};

function Appointment() {
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentType | null>(null);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const { settings, loading, error } = useSettings();
  const [fetched, setFetched] = useState(false);
  const { isAdmin } = useAdminAuth();

  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState<AppointmentType | null>(null);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const openAddModal = () => {
    setEditData(null);
    setFormOpen(true);
  };

  const openEditModal = (appointment: AppointmentType) => {
    setEditData(appointment);
    setFormOpen(true);
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
      setAlertMessage(
        `Appointment ${isEdit ? "updated" : "added"} successfully`
      );
    } catch (err) {
      console.error("Failed to save appointment", err);
      setAlertMessage("An error occurred while saving the appointment.");
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

  const normalizePhone = (input: string): string | null => {
    let value = input.replace(/[^\d+]/g, "");
    if ((value.match(/\+/g) || []).length > 1) return null;
    if (value.includes("+") && !value.startsWith("+")) return null;
    value = value.replace("+", "");
    if (value.length < 9 || value.length > 15) return null;
    return `+${value}`;
  };

  const handleSubmit = async () => {
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      setAlertMessage("Invalid phone number. Please check the format.");
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
            selectedDate: date,
            paymentMethod,
            priceUsed,
          }),
        });

        if (!res.ok) throw new Error("Insert failed");
        setAlertMessage("Appointment request sent successfully.");
        closeModal();
      } catch (err) {
        console.error(err);
        setAlertMessage("Failed to submit appointment. Please try again.");
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
      alert("Failed to delete appointment.");
    } finally {
      setShowConfirmation(false);
      setAppointmentToDelete(null);
    }
  };

  const closeModal = () => {
    setSelectedAppointment(null);
  };

  if (loading) return <Loading variant="grid" message="Loading appointments..." />;
  if (error) return <div className="text-red-500 text-center py-20">Error: {error}</div>;
  if (!settings) return null;

  return (
    <section
      id="appointment"
      className="w-full py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-hovsecondary via-white to-hovprimary"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid of Appointment Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {appointments.map((appointment: AppointmentType) => (
            <div
              key={appointment.id}
              className="group bg-white rounded-xl border-2 border-gray-200 hover:border-primary shadow-sm hover:shadow-lg transition-all duration-300 p-6 flex flex-col"
            >
              {/* Header */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {appointment.name}
                </h3>
              </div>

              {/* Price Section */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="flex items-baseline gap-2">
                  {appointment.offerprice ? (
                    <>
                      <span className="text-sm text-gray-500 line-through">
                        {appointment.price}
                      </span>
                      <span className="text-2xl font-bold text-primary">
                        {appointment.offerprice}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-primary">
                      {appointment.price}
                    </span>
                  )}
                </p>
              </div>

              {/* Details List */}
              <ul className="space-y-2 mb-6 flex-grow">
                {appointment.details.map((detail, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check size={16} className="text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">{detail}</span>
                  </li>
                ))}
              </ul>

              {/* Duration */}
              {appointment.duration && (
                <div className="mb-4 pb-4 border-t border-gray-200 pt-4">
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {appointment.duration}
                  </p>
                </div>
              )}

              {/* Book Button */}
              <button
                onClick={() => setSelectedAppointment(appointment)}
                className="w-full py-3 bg-gradient-to-r from-primary to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 mb-3"
              >
                Book Now
              </button>

              {/* Admin Controls */}
              {isAdmin && (
                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => openEditModal(appointment)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-600 text-blue-600 hover:text-white rounded-lg py-2 transition-colors"
                  >
                    <Pencil size={16} />
                    <span className="text-xs font-semibold">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(appointment.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-100 hover:bg-red-600 text-red-600 hover:text-white rounded-lg py-2 transition-colors"
                  >
                    <Trash2 size={16} />
                    <span className="text-xs font-semibold">Delete</span>
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Add New Appointment Card (Admin Only) */}
          {isAdmin && (
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-dashed border-green-400 p-6 flex items-center justify-center hover:border-green-600 hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={openAddModal}
            >
              <div className="text-center">
                <Plus className="w-12 h-12 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-semibold text-green-700">Add Appointment</p>
                <p className="text-xs text-green-600 mt-1">Create new service</p>
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
        />
      )}

      {alertMessage && (
        <Alert value={alertMessage} onClose={() => setAlertMessage(null)} />
      )}

      {/* Booking Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary to-blue-600 px-6 py-4 flex items-center justify-between">
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition text-black"
                  placeholder="Enter your first name"
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition text-black"
                  placeholder="Enter your last name"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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

              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition text-black"
                  required
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition text-black"
                >
                  <option value="Cash">Cash</option>
                  <option value="Wish Money">Wish Money</option>
                </select>
              </div>

              {/* Wish Money Info */}
              {paymentMethod === "Wish Money" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
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
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!name || !lastName || !date || !phone || isSubmitting}
                  className={`flex-1 px-4 py-2 font-semibold rounded-lg transition flex items-center justify-center gap-2 ${
                    !name || !lastName || !date || !phone || isSubmitting
                      ? "bg-gray-400 text-white cursor-not-allowed"
                      : "bg-gradient-to-r from-primary to-blue-600 text-white hover:shadow-lg"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Sending...
                    </>
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