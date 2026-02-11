"use client";
import Image from "next/image";
import Link from "next/link";
import { useSettings } from "../_context/SettingsContext";
import { ArrowRight, CheckCircle } from "lucide-react";

function Hero() {
  const { settings, loading, error } = useSettings();

  if (error) return <div className="text-red-500 text-center py-20">Error: {error}</div>;
  if (!settings) return null;

  return (
    <section
      id="hero"
      className="w-full min-h-screen  flex items-center justify-center relative overflow-hidden pt-20"
      style={
        settings?.images?.background
          ? {
              backgroundImage: `url(${settings.images.background})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "fixed",
            }
          : {
              background: "linear-gradient(135deg, var(--secondary) 0%, var(--hovsecondary) 50%, white 100%)",
            }
      }
    >
      {/* Overlay for better text readability */}
      {settings?.images?.background && (
        <div className="absolute inset-0 bg-white/10" />
      )}

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left Content */}
          <div className="flex flex-col justify-center space-y-6 text-center lg:text-left bg-white px-12 py-12 rounded-3xl shadow-2xl">
            {/* Badge */}
            <div className="flex justify-center lg:justify-start">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
                <CheckCircle size={16} />
                <span className="text-sm font-semibold">Trusted Nutrition Expert</span>
              </div>
            </div>

            {/* Main Heading */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Welcome to Your
                <span className="block text-primary mt-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text ">
                  Trusted Nutrition Partner
                </span>
              </h1>
            </div>

            {/* Description */}
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl">
              Helping you build healthy habits, one meal at a time. Personalized plans, expert advice, and support tailored just for you.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="#appointment"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-hovprimary hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Book Now
                <ArrowRight size={18} />
              </Link>
              
              <Link
                href="#Products"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-primary hover:text-hovprimary border-2 border-primary font-semibold py-3 px-8 rounded-lg transition-all duration-300 shadow hover:shadow-lg"
              >
                See Our Products
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 pt-4 justify-center lg:justify-start text-sm">
              <div>
                <p className="text-2xl font-bold text-primary">1000+</p>
                <p className="text-gray-600">Happy Clients</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">5★</p>
                <p className="text-gray-600">Rating</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">24/7</p>
                <p className="text-gray-600">Support</p>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative flex items-end justify-center h-full min-h-[500px] lg:min-h-[600px]">
            {/* Image Container with decorative elements */}
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-4">
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
              
              {/* Image */}
              <div className="relative z-10">
                <Image
                  src={settings.images.missoPic}
                  alt="Nutrition Expert"
                  width={400}
                  height={573}
                  priority
                  className="w-full h-auto rounded-t-3xl rounded-b-3xl shadow-2xl object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      
    </section>
  );
}

export default Hero;