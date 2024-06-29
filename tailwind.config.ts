import data from "./public/data.json"
import type { Config } from "tailwindcss";
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        primary : data.colors.primary ,
        hovprimary:data.colors.hovprimary,
        secondary:data.colors.secondary ,
        hovsecondary:data.colors.hovsecondary,
      }
    },
  },
  plugins: [],
};
export default config;
