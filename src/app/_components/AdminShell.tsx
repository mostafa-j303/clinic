"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Settings,
  ShoppingCart,
  FileText,
  ClipboardList,
  Users,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { useAdminAuth } from "../_context/AdminAuthContext";
import { useSettings } from "../_context/SettingsContext";

const ADMIN_LINKS = [
  { href: "/Setting", label: "Settings", icon: Settings },
  { href: "/Orders", label: "Orders", icon: ShoppingCart },
  { href: "/IntakeForms", label: "Intake Forms", icon: FileText },
  { href: "/Appointments", label: "Appointments", icon: ClipboardList },
  { href: "/Users", label: "Users", icon: Users },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { logout } = useAdminAuth();
  const { settings } = useSettings();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/admin/logout");
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden text-white/80 hover:text-white transition"
                onClick={() => setMobileNavOpen((v) => !v)}
                aria-label="Toggle admin menu"
                aria-expanded={mobileNavOpen}
              >
                {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
              {settings?.images?.logo && (
                <Image
                  src={settings.images.logo}
                  alt="Clinic Logo"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
              )}
              <div className="leading-tight">
                <p className="font-heading font-bold text-sm">Admin Panel</p>
                <p className="text-xs text-white/50 hidden sm:block">{settings?.webtitle}</p>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-1">
              {ADMIN_LINKS.map((link) => {
                const Icon = link.icon;
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary text-white"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon size={16} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <ExternalLink size={16} />
                View Site
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {mobileNavOpen && (
            <nav className="lg:hidden border-t border-white/10 py-3 space-y-1">
              {ADMIN_LINKS.map((link) => {
                const Icon = link.icon;
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary text-white"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon size={16} />
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/"
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <ExternalLink size={16} />
                View Site
              </Link>
            </nav>
          )}
        </div>
      </header>

      {children}
    </div>
  );
}
