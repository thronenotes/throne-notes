import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // THRONE NOTES — Personal Color Decree
        throne: {
          bg: "#0A0A0F",           // Throne Black — your cave
          surface: "#14141E",      // Card/container depth
          surfaceHover: "#1E1E2A", // Hover state
          border: "#2A2A3E",       // Subtle dividers
          text: "#F5F0E6",         // Prophetic Cream — primary text
          textMuted: "#8A8A9A",    // Muted silver — secondary text
          gold: "#D4AF37",         // Ezechukwu Gold — treasury, authority
          goldLight: "#F0D878",    // Light gold for hover highlights
          goldDark: "#8A6D1F",     // Dark gold for borders
          indigo: "#4B0082",       // Mystic Indigo — revelation, dreams
          indigoLight: "#6B21A8",  // Lighter indigo for hover
          emerald: "#046307",      // Kingdom Emerald — growth, published
          emeraldLight: "#059669", // Lighter emerald
          bronze: "#B87333",       // Burnt Bronze — CTA, altar fire
          bronzeDark: "#8B5A2B",   // Dark bronze
          crimson: "#8B0000",      // Deep blood red — danger, delete only
        },
      },
      fontFamily: {
        heading: ["Cinzel", "serif"],   // Royalty, weight, history
        body: ["Inter", "sans-serif"],  // Clean, dignified, readable
        decree: ["Great Vibes", "cursive"], // Your signature / quotes only
      },
    },
  },
  plugins: [],
};

export default config;