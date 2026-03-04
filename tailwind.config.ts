import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50:  "#f0f4ff",
          100: "#e0e8ff",
          200: "#c0cfff",
          300: "#92a8ff",
          400: "#6b7fff",
          500: "#4f5bff",
          600: "#3d3ff5",
          700: "#332fd9",
          800: "#2b28ae",
          900: "#282689",
          950: "#191552",
        },
        surface: {
          0:   "#ffffff",
          50:  "#f8f9fe",
          100: "#f0f2fc",
          200: "#e4e7f8",
        },
      },
      animation: {
        "spin-slow": "spin 1.2s linear infinite",
        "fade-up": "fade-up 0.4s ease forwards",
        "fade-in": "fade-in 0.3s ease forwards",
        "slide-in": "slide-in 0.35s cubic-bezier(0.16,1,0.3,1) forwards",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateX(-8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 4px 24px rgba(79,91,255,0.08)",
        "card-hover": "0 2px 6px rgba(0,0,0,0.08), 0 8px 32px rgba(79,91,255,0.14)",
        btn: "0 4px 14px rgba(79,91,255,0.3)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
