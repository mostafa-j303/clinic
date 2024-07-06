import Link from "next/link";
import React from "react";
import data from "../../../public/data.json";

function Appointment() {
  return (
    <div id="appointment" className="bg-gradient-to-b from-hovprimary via-white to-hovsecondary mx-auto shadow-2xl shadow-primary px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 sm:items-center md:gap-8">
        {data.appointment.map((appointment) => (
          <div key={appointment.id} className="bg-white rounded-2xl border border-gray-300 p-6 shadow-sm sm:px-8 lg:p-12 hover:border-primary hover:border-2 transition duration-500 hover:scale-y-105">
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

            <Link
              href="#"
              className="mt-8 block rounded-full border border-primary bg-white px-12 py-3 text-center text-sm font-medium text-primary hover:ring-1 hover:ring-primary focus:outline-none focus:ring active:text-primary hover:text-white hover:bg-primary transition duration-500"
            >
              Get Started
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Appointment;
