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
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        stripe: {
          navy: "#0a2540",
          ink: "#425466",
          muted: "#6b7c93",
          border: "#e6ebf1",
          soft: "#f6f9fc",
          white: "#ffffff",
          accent: "#635bff",
          accentDark: "#4b45c6",
          cyan: "#00d4ff",
          green: "#24b47e",
        },
      },
      boxShadow: {
        stripe:
          "0 50px 100px -20px rgba(50,50,93,0.15), 0 30px 60px -30px rgba(0,0,0,0.12)",
        soft: "0 13px 27px -5px rgba(50,50,93,0.1), 0 8px 16px -8px rgba(0,0,0,0.1)",
      },
      backgroundImage: {
        "stripe-glow":
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,91,255,0.18), transparent 55%)",
      },
    },
  },
  plugins: [],
};

export default config;
