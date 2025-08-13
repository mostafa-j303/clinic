"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "../_context/CartContext";
import Cart from "./Cart";
import Link from "next/link";
import data from "../../../public/data.json";
import { useSettings } from "../_context/SettingsContext";
import LocationLoader from "./Apploading";
import AdminForm from "./AdminForm";
import { useAdminAuth } from "../_context/AdminAuthContext";

const Header: React.FC = () => {
  const { cart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleCart = () => {
    setIsCartOpen((prevState) => !prevState);
  };
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const [showAdminForm, setShowAdminForm] = useState(false);

  const handleLoginClick = () => {
    setShowAdminForm(true);
  };

  const { isAdmin, login, logout } = useAdminAuth();

  const { settings, loading, error } = useSettings();
  if (loading) return <LocationLoader />;
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
               {isAdmin && (
              <li>
                <Link
                  className="text-gray-500 transition hover:text-gray-500/75"
                  href="/Setting"
                >
                  {" "}
                  Setting{" "}
                </Link>
              </li>
               )}
              <li>
                      {isAdmin ? (
                        <button
                          onClick={() => {
                            fetch("/api/admin/logout").then(() => logout());
                          }}
                          className="block w-full rounded-lg px-4 py-2 text-sm text-gray-700 bg-hovprimary  hover:bg-gray-100 hover:text-gray-800"
                        >
                          Logout
                        </button>
                      ) : (
                        <button
                          onClick={handleLoginClick}
                          className="block w-full rounded-lg px-4 py-2 text-sm text-gray-700 bg-hovprimary hover:bg-gray-100 hover:text-gray-800"
                        >
                          Login
                        </button>
                      )}
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
              {isAdmin && (
              <li>
                <Link
                  href="/Setting"
                  className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                >
                  {" "}
                  Setting{" "}
                </Link>
              </li>
               )}
               {isAdmin ? (
                        <button
                          onClick={() => {
                            fetch("/api/admin/logout").then(() => logout());
                          }}
                          className="block w-full rounded-lg px-4 py-2 text-sm bg-hovprimary text-gray-700 hover:bg-gray-100 hover:text-gray-800"
                        >
                          Logout
                        </button>
                      ) : (
                        <button
                          onClick={handleLoginClick}
                          className="block w-full rounded-lg px-4 py-2 text-sm bg-hovprimary text-gray-700 hover:bg-gray-100 hover:text-gray-800"
                        >
                          Login
                        </button>
                      )}
            </ul>
          </div>
        </div>
      )}
      {showAdminForm && <AdminForm onClose={() => setShowAdminForm(false)} />}
      {isCartOpen && <Cart setIsCartOpen={setIsCartOpen} />}
    </header>
  );
};

export default Header;
