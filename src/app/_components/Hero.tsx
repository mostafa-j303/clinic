"use client";
import Image from "next/image";
import Link from "next/link";
import { useSettings } from "../_context/SettingsContext";
import { ArrowRight, CheckCircle, Users, Star, Clock } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const textVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
};

function TiltPhoto({ src }: { src: string }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = ({ clientX, clientY, currentTarget }: React.MouseEvent) => {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    mouseX.set((clientX - left - width / 2) / width);
    mouseY.set((clientY - top - height / 2) / height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-10, 10]);
  const springRotateX = useSpring(rotateX, { stiffness: 250, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 250, damping: 20 });

  return (
    // Plain (non-3D) outer wrapper — the badges live here, as flat siblings of the
    // tilting card, so they're never subject to cross-browser 3D depth-sorting bugs.
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-md"
      style={{ perspective: 800 }}
    >
      <motion.div
        style={{ rotateX: springRotateX, rotateY: springRotateY, transformStyle: "preserve-3d" }}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
        className="relative"
      >
        {/* Plain (non-3D) inner div owns the clipping — `overflow-hidden` doesn't
            reliably clip on an element that also has `transform-style: preserve-3d`. */}
        <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-4 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
          <div className="relative z-10 overflow-hidden rounded-2xl">
            <Image
              src={src}
              alt="Nutrition Expert"
              width={400}
              height={573}
              priority
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </motion.div>

      {/* Floating stat badges — flat siblings, always painted on top, no 3D ambiguity. */}
      <motion.div
        initial={{ opacity: 0, x: -16, y: 8 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="absolute left-2 sm:-left-16 top-10 z-20 bg-white dark:bg-gray-800 rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2.5"
      >
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Users size={16} className="text-primary" />
        </div>
        <div className="leading-tight whitespace-nowrap">
          <p className="text-sm font-bold text-gray-900 dark:text-white">1000+</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">Happy Clients</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 16, y: -8 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.6, delay: 0.85 }}
        className="absolute right-2 sm:-right-12 bottom-20 z-20 bg-white dark:bg-gray-800 rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2.5"
      >
        <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
          <Star size={16} className="text-accent" />
        </div>
        <div className="leading-tight whitespace-nowrap">
          <p className="text-sm font-bold text-gray-900 dark:text-white">5.0 Rating</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">From real clients</p>
        </div>
      </motion.div>
    </div>
  );
}

function Hero() {
  const { settings, loading, error } = useSettings();

  if (error) return <div className="text-red-500 text-center py-20">Error: {error}</div>;
  if (!settings) return null;

  return (
    <section
      id="hero"
      className="w-full min-h-screen flex items-center justify-center relative pt-20"
      style={
        settings?.images?.background
          ? {
              backgroundImage: `url(${settings.images.background})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "fixed",
            }
          : {
              background:
                "linear-gradient(135deg, var(--color-secondary) 0%, var(--color-hovsecondary) 50%, white 100%)",
            }
      }
    >
      {settings?.images?.background && <div className="absolute inset-0 bg-white/10" />}

      {/* Ambient animated background blobs — clipped to their own layer so they
          never affect the floating badges/cards elsewhere in this section. */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          aria-hidden
          className="absolute top-1/4 left-[8%] w-72 h-72 rounded-full bg-primary/10 blur-3xl"
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute bottom-1/4 right-[10%] w-80 h-80 rounded-full bg-accent/10 blur-3xl"
          animate={{ y: [0, 24, 0], x: [0, -14, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <motion.div
            variants={textVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col justify-center space-y-6 text-center lg:text-left bg-white dark:bg-gray-800 px-8 sm:px-12 py-12 rounded-3xl shadow-2xl"
          >
            <motion.div variants={itemVariants} className="flex justify-center lg:justify-start">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
                <CheckCircle size={16} />
                <span className="text-sm font-semibold">Trusted Nutrition Expert</span>
              </div>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight"
            >
              Welcome to Your
              <span className="block text-primary mt-2">Trusted Nutrition Partner</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl"
            >
              Helping you build healthy habits, one meal at a time. Personalized plans, expert
              advice, and support tailored just for you.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="#appointment"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent hover:from-hovprimary hover:to-accent text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Book Now
                <ArrowRight size={18} />
              </Link>
              <Link
                href="#Products"
                className="inline-flex items-center justify-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-primary hover:text-hovprimary border-2 border-primary font-semibold py-3 px-8 rounded-lg transition-all duration-300 shadow hover:shadow-lg hover:-translate-y-0.5"
              >
                See Our Products
                <ArrowRight size={18} />
              </Link>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-6 pt-4 justify-center lg:justify-start text-sm"
            >
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-primary" />
                <span className="text-gray-600 dark:text-gray-300">24/7 Support</span>
              </div>
            </motion.div>
          </motion.div>

          <div className="relative flex items-end justify-center h-full min-h-[500px] lg:min-h-[600px]">
            <TiltPhoto src={settings.images.missoPic} />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
