'use client'
import React, { useState, useEffect } from "react";
import data from "../../../public/data.json";

type AppointmentType = {
  id: number;
  price: string;
  name: string;
  duration: string;
  details: string[];
};

function Appointment() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentType | null>(null);
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [date, setDate] = useState("");

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
        Appointment: ${selectedAppointment.name} - ${selectedAppointment.price}/${selectedAppointment.duration}
      `;
      const whatsappUrl = `https://wa.me/${data.social.number}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
      closeModal();
    }
  };

  return (
    <div id="appointment" className="bg-gradient-to-b from-hovprimary via-white to-hovsecondary mx-auto shadow-2xl shadow-primary px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="grid grid-cols-1  gap-4 sm:grid-cols-3  md:grid-cols-3 lg:grid-cols-3  md:gap-8">
        {data.appointment.map((appointment: AppointmentType) => (
          <div key={appointment.id} className="flex flex-col justify-around  bg-white hover:box-content rounded-2xl border border-gray-300 p-6 shadow-sm sm:px-8 lg:p-12 hover:border-primary hover:border-2 transition duration-500 hover:scale-y-105">
            <div className="text-center">
              <h2 className="text-lg font-medium text-gray-900">
                {appointment.name}
                <span className="sr-only">Plan</span>
              </h2>

              <p className="mt-2 sm:mt-4">
                <strong className="text-3xl font-bold text-gray-900 sm:text-4xl">
                  {appointment.price}
                </strong>
                <span className="text-sm font-medium text-gray-700">/{appointment.duration}</span>
              </p>
            </div>

            <ul className="mt-6 space-y-2">
              {appointment.details.map((detail, index) => (
                <li key={index} className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-5 text-primary"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                  <span className="text-gray-700">{detail}</span>
                </li>
              ))}
            </ul>
              <div className="flex justify-end flex-col">  <button
              onClick={() => openModal(appointment)}
              className="w-fit self-center mt-8 block rounded-full border border-primary bg-white px-12 py-3 text-center text-sm font-medium text-primary hover:ring-1 hover:ring-primary focus:outline-none focus:ring active:text-primary hover:text-white hover:bg-primary transition duration-500"
            >
              Get Started
            </button></div>
          
          </div>
        ))}
      </div>

      {modalIsOpen && selectedAppointment && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 w-96">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Appointment for {selectedAppointment.name}</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="p-3 text-gray-600 mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="p-3 text-gray-600 mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="p-3 text-gray-600 mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                />
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
