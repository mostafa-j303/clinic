"use client";
import React, { useState } from "react";
import Image from "next/image";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "../_context/CartContext";
import Cart from "./Cart";
import Link from "next/link";
import data from "../../../public/data.json";
import { useSettings } from "../_context/SettingsContext";
import LocationLoader from "./Apploading";
const Header: React.FC = () => {
  const { cart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleCart = () => {
    setIsCartOpen((prevState) => !prevState);
  };
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const { settings, loading, error } = useSettings();
  if (loading) return  <LocationLoader/>;
  if (error) return <div>Error: {error}</div>;
  if (!settings) return null;
  return (
    <header id="home" className="z-50 fixed bg-white w-full">
      <div className=" flex h-[70px]  items-center gap-8 px-4 sm:px-6 lg:px-8 shadow-md mx-0 ">
        {/* Hamburger for mobile */}
        <button
          className="md:hidden text-black"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <Link href="/#home">
          <Image
            className="w-auto relative rounded-2xl max-h-14"
            src={settings.images.logo}
            alt={"logo"}
            width={120}
            height={60}
          ></Image>
        </Link>

        <div className="flex flex-1 items-center justify-end md:justify-between">
          <nav aria-label="Global" className="hidden md:block">
            <ul className="flex items-center gap-6 text-sm">
              <li>
                <Link
                  className="text-gray-500 transition hover:text-gray-500/75"
                  href="/#home"
                >
                  {" "}
                  Home{" "}
                </Link>
              </li>

              <li>
                <Link
                  className="text-gray-500 transition hover:text-gray-500/75"
                  href="/#appointment"
                >
                  {" "}
                  Appointment{" "}
                </Link>
              </li>

              <li>
                <Link
                  className="text-gray-500 transition hover:text-gray-500/75"
                  href="/#Products"
                >
                  {" "}
                  Products{" "}
                </Link>
              </li>

              <li>
                <Link
                  className="text-gray-500 transition hover:text-gray-500/75"
                  href="/#aboutus"
                >
                  {" "}
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  className="text-gray-500 transition hover:text-gray-500/75"
                  href="/#f"
                >
                  {" "}
                  Contact Us{" "}
                </Link>
              </li>
               <li className="relative group">
  <details className="group [&_summary::-webkit-details-marker]:hidden">
    <summary className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1 text-gray-500 hover:text-gray-700">
      <span className="text-sm font-medium">Admin</span>
      <span className="shrink-0 transition duration-300 group-open:-rotate-180 ml-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    </summary>

    <ul className="absolute z-50 mt-2 w-40 space-y-1 bg-white border border-gray-200 rounded-lg shadow-md p-2">
      <li>
        <Link
          href="#"
          className="block rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-800"
        >
          Login
        </Link>
      </li>
      <li>
        <Link
          href="#"
          className="block rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-800"
        >
          + Product
        </Link>
      </li>
      <li>
        <Link
          href="#"
          className="block rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-800"
        >
          + Categories
        </Link>
      </li>
      <li>
        <Link
          href="#"
          className="block rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-800"
        >
          + Client
        </Link>
      </li>
    </ul>
  </details>
</li>

            </ul>
          </nav>

          <div className="flex items-center gap-4">
            <div className="sm:flex sm:gap-4">
              <button
                className="flex justify-around items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-hovprimary"
                onClick={toggleCart}
              >
                <ShoppingCart /> ({cart?.length})
              </button>
            </div>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="flex h-screen flex-col justify-between border-e border-gray-100 bg-secondary max-w-min  fixed ">
          <div className="px-4 py-5">
            <ul className="mt-2 space-y-1 w-36">
              <li>
                <Link
                  href="/#home"
                  className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                >
                  {"Home"}
                </Link>
              </li>
              <li>
                <Link
                  href="/#appointment"
                  className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                >
                  {"Appointment"}
                </Link>
              </li>
              <li>
                <Link
                  href="/#Products"
                  className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                >
                  {"Products"}
                </Link>
              </li>
              <li>
                <Link
                  href="/#aboutus"
                  className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                >
                  {"About Us"}
                </Link>
              </li>
              <li>
                <Link
                  href="/#f"
                  className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                >
                  {"Contact Us"}
                </Link>
              </li>
              <li>
                <Link
                  href="/Cart"
                  className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                >
                  {"Cart"}
                </Link>
              </li>

              <li>
                <details className="group [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                    <span className="text-sm font-medium"> Admin </span>

                    <span className="shrink-0 transition duration-300 group-open:-rotate-180">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="size-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </summary>

                  <ul className="mt-2 space-y-1 px-4">
                    <li>
                      <Link
                        href="#"
                        className=" w-full block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                      >
                        Login
                      </Link>
                    </li>

                    <li>
                      <Link
                        href="#"
                        className="w-full block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                      >
                        + Product
                      </Link>
                    </li>

                    <li>
                      <Link
                        href="#"
                        className="w-full block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                      >
                        + Categoris
                      </Link>
                    </li>

                    <li>
                      <Link
                        href="#"
                        className="w-full block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                      >
                        + Client
                      </Link>
                    </li>
                  </ul>
                </details>
              </li>
            </ul>
          </div>
        </div>
      )}

      {isCartOpen && <Cart setIsCartOpen={setIsCartOpen} />}
    </header>
  );
};

export default Header;
