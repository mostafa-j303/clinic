'use client'
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaTiktok, FaWhatsapp } from "react-icons/fa";
import data from "../../../public/data.json";
import { IoMail } from "react-icons/io5";
import { useSettings } from "../_context/SettingsContext";
import LocationLoader from "../_components/Apploading";


function Footer() {
  const { settings, loading, error } = useSettings();
  const [mapError, setMapError] = useState(false);

  const handleMapError = () => {
    setMapError(true); // Set error state when iframe fails to load
  };
  if (loading) return  <LocationLoader/>;
  if (error) return <div>Error: {error}</div>;
  if (!settings) return null;
  return (
    <footer id="f" className="bg-white lg:grid lg:grid-cols-5">
      <div className="relative block h-32 lg:col-span-2 lg:h-full">
      <Link
            target="_blank"
            className="absolute bg-white opacity-70 z-40 w-full h-full text-black flex justify-center items-center text-xl font-extrabold"
            href={settings.myLocation}
          > Click To See Location</Link>
      {!mapError ? (
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d26584.637704388914!2d35.4780439983918!3d33.888345720788744!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151f170f813de44b%3A0xb6a9f74e09fd1e5f!2sKoraytem%2C%20Beirut%2C%20Lebanon!5e0!3m2!1sen!2s!4v1620731361740!5m2!1sen!2s"
            width="100%"
            height="100%"
            loading="lazy"
            className="absolut inset-0 h-full w-full object-cover"
            onError={handleMapError} // Handle iframe load error
          ></iframe>
          
        ) : (
          <Link
            target="_blank"
            className="absolute bg-transparent z-50 w-full h-full"
            href={settings.myLocation}
          ></Link>
        )}
      </div>

      <div className="px-4 py-6 sm:px-6 lg:col-span-3 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div>
            <p>
              <span className="text-xs uppercase tracking-wide text-gray-500">
                Call us
              </span>

              <Link
                href={`tel:+${settings.social.number}`}
                className="block text-2xl font-medium text-gray-900 hover:opacity-75 sm:text-3xl"
              >
                (+961) 71 310 901
              </Link>
            </p>

            <ul className="mt-8 space-y-1 text-sm text-gray-700">
              <li>Monday to Friday: 10am - 5pm</li>
              <li>Weekend: 10am - 3pm</li>
            </ul>

            <ul className="mt-8 flex gap-6">
              <li>
                <Link
                  href={settings.social.facebook}
                  rel="noreferrer"
                  target="_blank"
                  className="text-gray-700 transition hover:opacity-75"
                >
                  <span className="sr-only">Facebook</span>

                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </li>

              <li>
                <Link
                  href={settings.social.insta}
                  rel="noreferrer"
                  target="_blank"
                  className="text-gray-700 transition hover:opacity-75"
                >
                  <span className="sr-only">Instagram</span>

                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </li>

              <li>
                <Link
                  href={`mailto:${settings.social.mail}`}
                  rel="noreferrer"
                  target="_blank"
                  className="text-gray-700 transition hover:opacity-75"
                >
                  <span className="sr-only">Mail</span>

                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <IoMail size={23} />
                  </svg>
                </Link>
              </li>

              <li>
                <Link
                  href={`https://api.whatsapp.com/send/?phone=${settings.social.number}`}
                  rel="noreferrer"
                  target="_blank"
                  className="text-gray-700 transition hover:opacity-75"
                >
                  <span className="sr-only">WhatsApp</span>

                  <svg
                    className=" h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <FaWhatsapp size={20} />
                  </svg>
                </Link>
              </li>

              <li>
                <Link
                  href="https://www.tiktok.com/@dietitianmaysa"
                  rel="noreferrer"
                  target="_blank"
                  className="text-gray-700 transition hover:opacity-75"
                >
                  <span className="sr-only">TikTok</span>

                  <svg
                    className="flex items-center h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <FaTiktok size={20} />
                  </svg>
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-black grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="p-5 bg-hovsecondary rounded-xl border-primary border-4">
              <h1 className="font-extrabold text-2xl">Our Address:</h1>
              <p className="text-primary">{settings.addressdetail.address}</p>
              <div className="flex">
                <h1 className="font-bold">Building Name: </h1>
                <p className="text-primary pl-1">{settings.addressdetail.building}</p>
              </div>

              <div className="flex">
                <h1 className="font-bold">Floor number: </h1>
                <span className="text-primary pl-1">{settings.addressdetail.floor}</span>
              </div>
            </div>

            <div></div>
          </div>
        </div>

        <div className="mt-4 border-t border-gray-100 pt-4">
          <div className="sm:flex sm:items-center sm:justify-between">
            <p className="mt-4 text-xs text-gray-500 sm:mt-0">
              All rights reserved for Mostafa Jarjour, 2024.
            </p>
            <p className="text-gray-600 text-sm">{settings.webtitle}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
