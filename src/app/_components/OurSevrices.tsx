"use client";
import React from "react";
import { motion } from "framer-motion";
import { useSettings } from "../_context/SettingsContext";
import Loading from "./Loding";
import { Award, GraduationCap, Heart, Stethoscope, BadgeCheck } from "lucide-react";
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

        {/* Foundation Panel — credentials strip + statement, rebuilt from a plain bordered box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-white to-accent/10 dark:from-primary/15 dark:via-gray-800 dark:to-accent/10 p-5 sm:p-8 mb-8 sm:mb-16"
        >
          <Award className="hidden sm:block absolute -right-4 -top-4 w-36 h-36 text-primary/10 dark:text-primary/10" />

          <div className="relative flex items-start gap-3 sm:gap-4">
            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-primary text-white shadow-md">
              <Award className="w-5 h-5 sm:w-7 sm:h-7" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-2xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-3">
                Foundation Built on Excellence
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-lg">
                I am a licensed dietitian with over nine years of dedicated experience in the field
                of nutritional therapy. My foundation was built through intensive clinical training at
                a hospital, where I completed a comprehensive 6-month internship that deepened my
                understanding of medical nutrition therapy and patient-centered care.
              </p>
            </div>
          </div>

          {/* Credential strip */}
          <div className="relative mt-4 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-4 pt-4 sm:pt-6 border-t border-primary/15">
            {[
              { value: "9+", label: "Years Experience" },
              { value: "1000+", label: "Clients Guided" },
              { value: "Licensed", label: "Dietitian" },
            ].map((stat) => (
              <div key={stat.label} className="text-center sm:text-left">
                <div className="text-lg sm:text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-[10px] sm:text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary hover:-translate-y-1 p-4 sm:p-8 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                {/* Icon */}
                <div className="flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 bg-primary/10 group-hover:bg-primary rounded-lg mb-3 sm:mb-5 transition-colors duration-300">
                  <IconComponent className="w-5 h-5 sm:w-7 sm:h-7 text-primary group-hover:text-white transition-colors duration-300" />
                </div>

                {/* Content */}
                <h3 className="text-sm sm:text-xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-3">
                  {service.title}
                </h3>
                <p className="text-xs sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3 sm:line-clamp-none">
                  {service.description}
                </p>

                {/* Accent line */}
                <div className="mt-3 sm:mt-4 h-1 w-0 bg-primary group-hover:w-12 transition-all duration-300" />
              </motion.div>
            );
          })}
        </div>

        {/* Specializations — pill badges instead of a plain bulleted list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mt-8 sm:mt-16 bg-gray-50 dark:bg-gray-800 rounded-xl p-4 sm:p-8 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-base sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-6">Areas of Expertise</h3>
          <div className="flex flex-wrap gap-1.5 sm:gap-3">
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
              <span
                key={idx}
                className="inline-flex items-center gap-1 sm:gap-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-[11px] sm:text-sm font-medium px-2.5 sm:px-4 py-1 sm:py-2 rounded-full"
              >
                <BadgeCheck size={12} className="text-primary flex-shrink-0 sm:size-4" />
                {specialty}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default OurServices;