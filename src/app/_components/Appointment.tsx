"use client";
import React, { useState, useEffect } from "react";
import data from "../../../public/data.json";
import { openWhishApp } from "../utils/openWhishApp";
import Image from "next/image";
import { useSettings } from "../_context/SettingsContext";
import LocationLoader from "../_components/Apploading";
import { useAdminAuth } from "../_context/AdminAuthContext";
import { Pencil, Plus, Trash2 } from "lucide-react";
import AppointmentFormModal from "./AppointmentFormModal";
import ConfirmationModal from "./ConfirmationModal";
import Alert from "./Alert";

type AppointmentType = {
  id: number;
  price: string;
  offerPrice?: string;
  name: string;
  duration?: string;
  details: string[];
};

function Appointment() {
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentType | null>(null);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [date, setDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const { settings, loading, error } = useSettings();
  const [fetched, setFetched] = useState(false); // ✅ flag to avoid double fetch
  const { isAdmin, login, logout } = useAdminAuth();

  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState<AppointmentType | null>(null);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<number | null>(
    null
  );

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
        offerPrice: appointmentData.offerPrice,
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
    setName(storedName);
    setLastName(storedLastName);
  }, []);

  const openModal = (appointment: AppointmentType) => {
    setSelectedAppointment(appointment);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleSubmit = () => {
    localStorage.setItem("name", name);
    localStorage.setItem("lastName", lastName);
    if (selectedAppointment) {
      const message = `Appointment Info:
        Name: ${name}
        Last Name: ${lastName}
        Date: ${date}
        Payment Method: ${paymentMethod}
        Appointment: ${selectedAppointment.name}
        Price: ${
          selectedAppointment.offerPrice
            ? selectedAppointment.offerPrice
            : selectedAppointment.price
        }
      `;
      const whatsappUrl = `https://wa.me/${
        settings?.social.number
      }?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
      closeModal();
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

  if (loading) return <LocationLoader />;
  if (error) return <div>Error: {error}</div>;
  if (!settings) return null;

  return (
    <div
      id="appointment"
      className="bg-gradient-to-b from-hovprimary via-white to-hovsecondary mx-auto shadow-2xl shadow-primary px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
    >
      <div className="grid grid-cols-2  gap-4 sm:grid-cols-3  md:grid-cols-3 lg:grid-cols-4  md:gap-8">
        {appointments.map((appointment: AppointmentType) => (
          <div
            key={appointment.id}
            className="flex flex-col justify-between  bg-white hover:box-content rounded-2xl border border-gray-300 p-2 pb-4 shadow-sm   hover:border-primary hover:border-2 transition duration-500 hover:scale-y-105"
          >
            <div className="text-center">
              <h2 className="text-lg font-medium text-gray-900">
                {appointment.name}
                <span className="sr-only">Plan</span>
              </h2>

              <p>
                <strong
                  className={`font-bold  ${
                    appointment.offerPrice
                      ? "line-through text-base text-gray-700"
                      : "text-xl text-primary"
                  }`}
                >
                  {appointment.price}
                </strong>
                {appointment.offerPrice && (
                  <span className="text-xl font-medium text-primary ">
                    /{appointment.offerPrice}
                  </span>
                )}
              </p>
            </div>
            <ul className="mt-1 space-y-1">
              {appointment.details.map((detail, index) => (
                <li key={index} className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-3 text-primary"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                  <span className="text-gray-500 text-xs ">{detail}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-end flex-col">
              {" "}
              <button
                onClick={() => openModal(appointment)}
                className="w-fit self-center mt-2 block rounded-full border border-primary bg-white px-4 py-3 text-center text-sm font-medium text-primary hover:ring-1 hover:ring-primary focus:outline-none focus:ring active:text-primary hover:text-white hover:bg-primary transition duration-500"
              >
                Book now
              </button>
            </div>
            {isAdmin && (
              <div className="flex justify-center gap-1 mt-2 flex-row-reverse">
                <button
                  className="text-white rounded-lg bg-red-500 p-2"
                  onClick={() => handleDeleteClick(appointment.id)}
                >
                  <Trash2 />
                </button>
                <button
                  className="text-white rounded-lg bg-blue-500 p-2"
                  onClick={() => openEditModal(appointment)}
                >
                  {" "}
                  <Pencil />
                </button>
              </div>
            )}
          </div>
        ))}
        {/* Fake card at the end for admin */}
        {isAdmin && (
          <div className="flex items-center justify-center bg-green-100 hover:box-content rounded-2xl border border-dashed border-green-500 p-2  shadow-sm hover:border-green-600 hover:border-2 transition duration-500 hover:scale-y-105">
            <button
              className="text-white rounded-lg bg-green-400 text-9xl w-full h-full flex justify-center items-center text-center p-3 hover:text-black hover:bg-green-300 duration-500"
              onClick={openAddModal}
            >
              <Plus className="text-7xl size-20" />
            </button>
          </div>
        )}
      </div>

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

      {modalIsOpen && selectedAppointment && (
        <div className="fixed z-50 inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 w-96">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Appointment for {selectedAppointment.name}
            </h2>
            <form className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="p-3 text-gray-600 mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="p-3 text-gray-600 mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700"
                >
                  Date
                </label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="p-3 text-gray-600 mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="paymentMethod"
                  className="block text-sm font-medium text-gray-700"
                >
                  Payment Method
                </label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="p-3 text-gray-600 mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                >
                  <option value="Cash">Cash</option>
                  <option value="Wish Money">Wish Money</option>
                </select>
                {paymentMethod === "Wish Money" && (
                  <div className="flex justify-between items-center">
                    <span className="text-red-800 text-sm leading-4">
                      {" "}
                      Pay to wish Account:
                      <span className="block md:inline">
                        {settings.social.wishnb}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={openWhishApp}
                      className="p-2 rounded transition hover:opacity-80"
                    >
                      <Image
                        className="rounded-md w-auto h-auto max-w-10"
                        src={settings.images.whishlogo}
                        alt="Open Whish"
                        width={40}
                        height={50}
                      />
                    </button>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!name || !lastName || !date}
                className={`mt-4 block w-full font-medium py-2 rounded-md ${
                  !name || !lastName || !date
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-primary text-white cursor-pointer"
                }`}
              >
                Send via WhatsApp
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="mt-2 block w-full bg-gray-300 text-gray-700 font-medium py-2 rounded-md"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Appointment;
