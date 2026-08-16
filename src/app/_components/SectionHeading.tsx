"use client";
import { motion } from "framer-motion";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  tone?: "light" | "dark";
}

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  tone = "light",
}: SectionHeadingProps) {
  const isCenter = align === "center";
  const isDark = tone === "dark";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`mb-10 sm:mb-14 ${isCenter ? "text-center" : "text-left"}`}
    >
      <span
        className={`inline-block text-xs font-bold tracking-[0.15em] uppercase mb-3 ${
          isDark ? "text-white/70" : "text-primary"
        }`}
      >
        {eyebrow}
      </span>
      <h2
        className={`text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight ${
          isDark ? "text-white" : "text-gray-900 dark:text-white"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-4 text-base sm:text-lg leading-relaxed ${
            isCenter ? "mx-auto max-w-2xl" : "max-w-2xl"
          } ${isDark ? "text-white/80" : "text-gray-600 dark:text-gray-300"}`}
        >
          {subtitle}
        </p>
      )}
      <div
        className={`mt-5 h-1 w-14 rounded-full bg-gradient-to-r from-primary to-accent ${
          isCenter ? "mx-auto" : ""
        }`}
      />
    </motion.div>
  );
}
