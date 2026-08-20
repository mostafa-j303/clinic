"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Apple, Carrot, Citrus, Leaf, Salad, Wheat, HeartPulse } from "lucide-react";

// Real, on-brand full-screen loader — shown only for as long as data is
// actually loading (no fake countdown, see git history for why that was
// removed). Can't rely on useSettings() here since this is what's shown
// *while* settings are still loading — brand colors fall back to the same
// teal/emerald defaults baked into globals.css's :root, so `text-primary`
// etc. resolve correctly even before the live theme overrides them.
const ORBIT_ICONS = [Apple, Leaf, Citrus, Wheat, Carrot, Salad];

const TIPS = [
  "Small changes, lasting results.",
  "Fueling your goals, one meal at a time.",
  "Progress, not perfection.",
  "Nourish today, thrive tomorrow.",
  "Every healthy choice counts.",
  "Balance is the real superfood.",
];

const AppLoading: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const radius = 64;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-gray-50 dark:bg-gray-950">
      {/* Orbit */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Center mark */}
        <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
          <motion.div
            animate={prefersReducedMotion ? undefined : { scale: [1, 1.12, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <HeartPulse className="w-7 h-7 text-white" />
          </motion.div>
        </div>

        {/* Orbiting food icons */}
        <motion.div
          className="absolute inset-0"
          animate={prefersReducedMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
          {ORBIT_ICONS.map((Icon, i) => {
            const angle = (360 / ORBIT_ICONS.length) * i;
            const rad = (angle * Math.PI) / 180;
            // Rounded to 2dp — Math.cos/sin aren't guaranteed bit-identical
            // across JS engines, so an unrounded value here caused a
            // server/client hydration mismatch on the exact style string.
            const x = Math.round(Math.cos(rad) * radius * 100) / 100;
            const y = Math.round(Math.sin(rad) * radius * 100) / 100;
            return (
              <div
                key={i}
                className="absolute top-1/2 left-1/2"
                style={{ transform: `translate(${x}px, ${y}px) translate(-50%, -50%)` }}
              >
                <motion.div
                  className="w-9 h-9 rounded-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-md flex items-center justify-center"
                  animate={prefersReducedMotion ? undefined : { rotate: -360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                >
                  <Icon className="w-4 h-4 text-primary" strokeWidth={2} />
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Cycling tip */}
      <div className="h-6 flex items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.p
            key={tipIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4 }}
            className="text-sm font-medium text-gray-500 dark:text-gray-400 text-center"
          >
            {TIPS[tipIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AppLoading;
