import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        ink: {
          50: "#f4f6fb",
          100: "#e8ecf6",
          200: "#cfd8ea",
          300: "#a7b6d3",
          400: "#7a8db8",
          500: "#5a6fa3",
          600: "#475a8f",
          700: "#3b4975",
          800: "#343f61",
          900: "#2e3751",
          950: "#1a1f2e",
        },
        signal: {
          DEFAULT: "#5eead4",
          dim: "#2dd4bf",
          glow: "#99f6e4",
        },
        pulse: {
          DEFAULT: "#a78bfa",
          dim: "#8b5cf6",
        },
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to right, rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.08) 1px, transparent 1px)",
        "radial-glow":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(94,234,212,0.25), transparent)",
      },
      boxShadow: {
        panel: "0 0 0 1px rgba(148,163,184,0.12), 0 24px 80px -32px rgba(15,23,42,0.55)",
        lift: "0 12px 40px -16px rgba(15,23,42,0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
