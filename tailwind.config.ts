import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // CivicVoice Civic Intelligence Palette
        civic: {
          bg: "#05080f",
          surface: "#0a0e1a",
          elevated: "#0f1629",
          border: "rgba(255,255,255,0.07)",
          cyan: "#00d4ff",
          "cyan-dim": "#0099bb",
          "cyan-glow": "rgba(0,212,255,0.15)",
          blue: "#3b82f6",
          "blue-dim": "#2563eb",
          lime: "#84cc16",
          "lime-dim": "#65a30d",
          red: "#ef4444",
          amber: "#f59e0b",
          purple: "#a855f7",
          pink: "#ec4899",
          text: "#f1f5f9",
          "text-muted": "#64748b",
          "text-dim": "#334155",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        "radial-dark":
          "radial-gradient(ellipse at 50% 0%, rgba(0,100,180,0.12) 0%, transparent 60%)",
        "hero-glow":
          "radial-gradient(ellipse at 50% 50%, rgba(0,212,255,0.06) 0%, transparent 70%)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      boxShadow: {
        "glow-cyan":
          "0 0 20px rgba(0,212,255,0.3), 0 0 40px rgba(0,212,255,0.1)",
        "glow-cyan-sm": "0 0 10px rgba(0,212,255,0.4)",
        "glow-blue": "0 0 20px rgba(59,130,246,0.3)",
        glass: "0 4px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
        card: "0 2px 8px rgba(0,0,0,0.5)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "marker-pulse": "markerPulse 2s ease-out infinite",
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        markerPulse: {
          "0%": { transform: "scale(1)", opacity: "1" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { transform: "translateY(8px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
