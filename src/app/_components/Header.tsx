"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  ShoppingCart,
  Menu,
  X,
  LogOut,
  Settings,
  ClipboardList,
  User,
  FileText,
  Sun,
  Moon,
} from "lucide-react";
import { useCart } from "../_context/CartContext";
import Cart from "../_components/Cart";
import Link from "next/link";
import { useSettings } from "../_context/SettingsContext";
import LocationLoader from "./Apploading";
import AdminForm from "./AdminForm";
import { useAdminAuth } from "../_context/AdminAuthContext";
import { useTheme } from "../_context/ThemeContext";
import { useSession, signOut } from "next-auth/react";

const Header: React.FC = () => {
  const { cart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { isAdmin, logout } = useAdminAuth();
  const { settings, loading, error } = useSettings();
  const { isDark, toggleTheme } = useTheme();

  const { data: clientSession } = useSession();

  const toggleCart = () => setIsCartOpen((prev) => !prev);
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout");
    logout();
    closeMenus();
  };

  const handleLoginClick = () => {
    setShowAdminForm(true);
    closeMenus();
  };

  if (loading) return <LocationLoader />;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!settings) return null;

  const navLinks = [
    { href: "/#home", label: "Home" },
    { href: "/#appointment", label: "Appointment" },
    { href: "/#Products", label: "Products" },
    { href: "/#aboutus", label: "About Us" },
    { href: "/#f", label: "Contact Us" },
  ];

  const adminLinks = [
    { href: "/Setting", label: "Setting", icon: Settings },
    { href: "/Orders", label: "Orders", icon: ShoppingCart },
    { href: "/IntakeForms", label: "Intake Forms", icon: FileText },
    {
      href: "/Appointments",
      label: "Appointment Requests",
      icon: ClipboardList,
    },
  ];

  return (
    <header
      id="home"
      className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-md transition-colors"
    >
      <div className="flex h-[70px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Hamburger Menu Button */}
        <button
          className="md:hidden text-black hover:text-gray-700 transition"
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo — double-click opens the admin login (intentionally not a visible link) */}
        <Link
          href="/#home"
          className="flex-shrink-0"
          onDoubleClick={(e) => {
            if (!isAdmin) {
              e.preventDefault();
              handleLoginClick();
            }
          }}
        >
          <Image
            className="w-auto rounded-2xl max-h-14"
            src={settings.images.logo}
            alt="Clinic Logo"
            width={120}
            height={60}
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Global" className="hidden md:block flex-1">
          <ul className="flex items-center gap-6 text-sm">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  className="text-gray-500 dark:text-gray-300 transition hover:text-gray-700 dark:hover:text-white"
                  href={link.href}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-9 h-9 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 transition-colors cursor-pointer"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Cart Button */}
          <button
            onClick={toggleCart}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-hovprimary"
            aria-label="Shopping cart"
          >
            <ShoppingCart size={18} />
            <span className="hidden sm:inline">({cart?.length || 0})</span>
          </button>

          {/* Client Auth */}
          {clientSession ? (
            <div className="relative group">
              <button className="text-gray-500 hover:text-gray-700 flex items-center gap-1 px-3 py-2 text-sm">
                {clientSession.user?.name?.split(" ")[0]}
              </button>
              <ul className="absolute right-0 mt-0 w-40 bg-white dark:bg-gray-800 shadow-lg rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <li>
                  <Link
                    href="/client-dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    My Profile
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Sign Out
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <Link
              href="/client-portal"
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
            >
              Client Login
            </Link>
          )}

          {/* Desktop Admin Section */}
          <div className="hidden md:flex items-center gap-2">
            {isAdmin ? (
              <div className="relative group">
                <button
                  className="text-gray-500 dark:text-gray-300 transition hover:text-gray-700 dark:hover:text-white flex items-center gap-1 px-3 py-2"
                  aria-label="Admin menu"
                >
                  Admin
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {/* Dropdown Menu */}
                <ul className="absolute right-0 mt-0 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  {adminLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <li key={link.href}>
                        <Link
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                          href={link.href}
                        >
                          <Icon size={16} />
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}

            {/* Logout — the login entry point itself is hidden (double-click the logo) */}
            {isAdmin && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-700 bg-hovprimary hover:bg-gray-200 transition"
              >
                <LogOut size={16} />
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-secondary dark:bg-gray-900 max-h-[calc(100vh-70px)] overflow-y-auto">
          <div className="px-4 py-5">
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
                    onClick={closeMenus}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}

              <li>
                <Link
                  href="/Cart"
                  className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
                  onClick={closeMenus}
                >
                  Cart
                </Link>
              </li>

              <li>
                <button
                  onClick={() => {
                    toggleTheme();
                    closeMenus();
                  }}
                  className="w-full flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition text-left cursor-pointer"
                >
                  {isDark ? <Sun size={16} /> : <Moon size={16} />}
                  {isDark ? "Light Mode" : "Dark Mode"}
                </button>
              </li>

              {/* Mobile Admin Links */}
              {isAdmin && (
                <>
                  <li className="border-t border-gray-200 pt-2 mt-2">
                    <span className="block px-4 py-2 text-xs font-semibold text-gray-600 uppercase">
                      Admin
                    </span>
                  </li>
                  {adminLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="block rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
                        onClick={closeMenus}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </>
              )}

              {/* Mobile Logout — login entry point is hidden (double-click the logo) */}
              {isAdmin && (
                <li className="border-t border-gray-200 pt-2 mt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-lg px-4 py-2 text-sm bg-hovprimary text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition text-left flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAdminForm && <AdminForm onClose={() => setShowAdminForm(false)} />}
      {isCartOpen && <Cart setIsCartOpen={setIsCartOpen} />}
    </header>
  );
};

export default Header;
