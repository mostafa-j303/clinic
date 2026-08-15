"use client";
import React from "react";
import { motion } from "framer-motion";
import { useSettings } from "../_context/SettingsContext";
import Loading from "./Loding";
import { Award, GraduationCap, Heart, Stethoscope } from "lucide-react";
import SectionHeading from "./SectionHeading";

function OurServices() {
  const { settings, loading, error } = useSettings();

  if (loading) return <Loading message="Loading services..." variant="list" />;
  if (error) return <div className="text-red-500 text-center py-20">Error: {error}</div>;
  if (!settings) return null;

  const services = [
    {
      icon: GraduationCap,
      title: "Education & Expertise",
      description:
        "Over 9 years of dedicated experience in nutritional therapy with intensive clinical training. Expertise spans renal nutrition, diabetes management, maternal nutrition, food safety, eating disorders, and gastrointestinal disorders.",
    },
    {
      icon: Heart,
      title: "Passionate Approach",
      description:
        "Committed to translating evidence-based nutrition into practical strategies that empower individuals to improve their health and quality of life through tailored dietary interventions.",
    },
    {
      icon: Stethoscope,
      title: "Clinical Excellence",
      description:
        "Licensed dietitian with comprehensive clinical training and continuous professional development. Staying current with evolving practices in dietetics and nutritional therapy.",
    },
  ];

  return (
    <section
      id="aboutus"
      className="relative w-full py-16 sm:py-20 lg:py-24 overflow-hidden"
      style={
        settings?.images?.background2
          ? {
              backgroundImage: `url(${settings.images.background2})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : {
              background:
                "linear-gradient(135deg, var(--color-secondary) 0%, white 100%)",
            }
      }
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/90" />

      {/* Ambient animated shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          aria-hidden
          className="absolute top-20 right-[6%] w-72 h-72 rounded-full bg-primary/5 blur-3xl"
          animate={{ y: [0, -22, 0], x: [0, 16, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute bottom-20 left-[6%] w-64 h-64 rounded-full bg-accent/5 blur-3xl"
          animate={{ y: [0, 20, 0], x: [0, -14, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="About Us"
          title="Professional Background"
          subtitle="Licensed dietitian with over 9 years of dedicated experience in nutritional therapy, combining clinical expertise with a passion for patient care."
        />

        {/* Main Description Card */}
        <div className="bg-gradient-to-br from-primary/5 to-accent/10 border-2 border-primary rounded-xl p-6 sm:p-8 mb-12 sm:mb-16">
          <div className="flex items-start gap-4">
            <Award className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Foundation Built on Excellence
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base sm:text-lg">
                I am a licensed dietitian with over nine years of dedicated experience in the field
                of nutritional therapy. My foundation was built through intensive clinical training at
                a hospital, where I completed a comprehensive 6-month internship that deepened my
                understanding of medical nutrition therapy and patient-centered care.
              </p>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div
                key={index}
                className="group bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                {/* Icon */}
                <div className="flex items-center justify-center w-14 h-14 bg-primary/10 group-hover:bg-primary rounded-lg mb-5 transition-colors duration-300">
                  <IconComponent className="w-7 h-7 text-primary group-hover:text-white transition-colors duration-300" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {service.description}
                </p>

                {/* Accent line */}
                <div className="mt-4 h-1 w-0 bg-primary group-hover:w-12 transition-all duration-300" />
              </div>
            );
          })}
        </div>

        {/* Specializations */}
        <div className="mt-12 sm:mt-16 bg-gray-50 dark:bg-gray-800 rounded-xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Areas of Expertise</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "Renal Nutrition",
              "Diabetes Management",
              "Maternal Nutrition",
              "Pregnancy & Lactation",
              "Food Safety",
              "Eating Disorders",
              "Gastrointestinal Disorders",
              "Medical Nutrition Therapy",
              "Community Nutrition",
            ].map((specialty, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">{specialty}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default OurServices;