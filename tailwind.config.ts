import type { Config } from "tailwindcss";


const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
         primary: "var(--color-primary)",
        hovprimary: "var(--color-hovprimary)",
        secondary: "var(--color-secondary)",
        hovsecondary: "var(--color-hovsecondary)",
        accent: "var(--color-accent)",
      }
    },
  },
  plugins: [],
  corePlugins: {
    scrollBehavior: true,
  },
};
export default config;
