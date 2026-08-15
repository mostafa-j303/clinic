'use client'
import Link from "next/link";
import React, { useState } from "react";
import { FaTiktok, FaWhatsapp, FaFacebook, FaInstagram } from "react-icons/fa";
import { IoMail } from "react-icons/io5";
import { MapPin, Clock, Phone } from "lucide-react";
import { useSettings } from "../_context/SettingsContext";
import Loading from "./Loding";

function Footer() {
  const { settings, loading, error } = useSettings();
  const [mapError, setMapError] = useState(false);

  const handleMapError = () => {
    setMapError(true);
  };

  if (loading) return <Loading variant="grid" message="Loading footer..." />;
  if (error) return <div className="text-red-500 text-center py-20">Error: {error}</div>;
  if (!settings) return null;

  const socialLinks = [
    {
      name: "Facebook",
      href: settings.social.facebook,
      icon: FaFacebook,
      color: "hover:text-primary",
    },
    {
      name: "Instagram",
      href: settings.social.insta,
      icon: FaInstagram,
      color: "hover:text-pink-600",
    },
    {
      name: "WhatsApp",
      href: `https://api.whatsapp.com/send/?phone=${settings.social.number}`,
      icon: FaWhatsapp,
      color: "hover:text-green-600",
    },
    {
      name: "TikTok",
      href: settings.social.tiktok,
      icon: FaTiktok,
      color: "hover:text-black",
    },
    {
      name: "Email",
      href: `mailto:${settings.social.mail}`,
      icon: IoMail,
      color: "hover:text-red-600",
    },
  ];

  return (
    <footer id="f" className="bg-gray-900 text-gray-100">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
          {/* Map Section */}
          <div className="lg:col-span-1">
            <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg border border-gray-700">
              {!mapError ? (
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d26584.637704388914!2d35.4780439983918!3d33.888345720788744!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151f170f813de44b%3A0xb6a9f74e09fd1e5f!2sKoraytem%2C%20Beirut%2C%20Lebanon!5e0!3m2!1sen!2s!4v1620731361740!5m2!1sen!2s"
                  width="100%"
                  height="100%"
                  loading="lazy"
                  className="w-full h-full object-cover"
                  onError={handleMapError}
                ></iframe>
              ) : null}
              <Link
                target="_blank"
                className="absolute inset-0 bg-black/60 hover:bg-black/50 transition-colors flex items-center justify-center text-white font-semibold text-center px-4 z-40"
                href={settings.myLocation}
              >
                View Location on Map
              </Link>
            </div>
          </div>

          {/* Contact & Hours Section */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-white mb-6">Get in Touch</h3>
            
            {/* Phone */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-sm uppercase tracking-wide text-gray-400">Call us</span>
              </div>
              <Link
                href={`tel:+${settings.social.number}`}
                className="text-2xl font-bold text-primary hover:text-hovprimary transition"
              >
                +{settings.social.number}
              </Link>
            </div>

            {/* Hours */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-sm uppercase tracking-wide text-gray-400">Working Hours</span>
              </div>
              <ul className="space-y-2 text-gray-300">
                <li className="flex justify-between">
                  <span>Monday - Friday:</span>
                  <span className="font-semibold">10am - 5pm</span>
                </li>
                <li className="flex justify-between">
                  <span>Weekend:</span>
                  <span className="font-semibold">10am - 3pm</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Address Section */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold text-white mb-6">Our Location</h3>
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/40 rounded-2xl p-5 space-y-4">
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-400">Address</p>
                  <p className="text-primary font-semibold">{settings.addressdetail.address}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-primary/20 space-y-2">
                <div>
                  <p className="text-sm text-gray-400">Building</p>
                  <p className="text-gray-200 font-semibold">{settings.addressdetail.building}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Floor</p>
                  <p className="text-gray-200 font-semibold">{settings.addressdetail.floor}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 py-8">
          {/* Social Links */}
          <div className="mb-8">
            <h4 className="text-sm uppercase tracking-wide text-gray-400 mb-4">Follow Us</h4>
            <div className="flex gap-4 flex-wrap">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <Link
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className={`w-12 h-12 flex items-center justify-center rounded-full bg-gray-800 text-gray-300 transition-all duration-300 hover:bg-primary ${social.color}`}
                    title={social.name}
                  >
                    <IconComponent size={20} />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Copyright */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              © 2026 {settings.webtitle}. All rights reserved.
            </p>
            <p className="text-xs text-gray-500">
              Designed with <span className="text-primary">♥</span> for your health
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;