import type { Config } from "tailwindcss";

/** Reads a "R G B" CSS variable and applies Tailwind's alpha-value convention
 *  so opacity modifiers (bg-surface/80, border-border/50, ...) keep working. */
function withOpacity(variable: string) {
  return `rgb(var(${variable}) / <alpha-value>)`;
}

const config: Config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      colors: {
        // Semantic, theme-aware tokens — every one resolves through a CSS
        // variable defined in index.css for both the light (:root) and dark
        // (.dark) themes. Components should reach for these instead of
        // fixed hex values or the old numeric base-* scale.
        background: withOpacity("--bg-canvas"),
        surface: {
          DEFAULT: withOpacity("--bg-surface"),
          hover: withOpacity("--bg-surface-hover"),
        },
        sidebar: withOpacity("--bg-sidebar"),
        border: {
          DEFAULT: withOpacity("--border-default"),
          strong: withOpacity("--border-strong"),
          faint: withOpacity("--fg-faint"),
        },
        foreground: {
          DEFAULT: withOpacity("--fg-primary"),
          secondary: withOpacity("--fg-secondary"),
          tertiary: withOpacity("--fg-tertiary"),
          quaternary: withOpacity("--fg-quaternary"),
          faint: withOpacity("--fg-faint"),
        },
        // Brand accent colors are intentionally identical across both
        // themes (consistent brand identity, and already tuned for
        // sufficient contrast on both a near-black and a near-white surface).
        accent: {
          indigo: "#5B8DEF",
          teal: "#3ECF8E",
          amber: "#F2B75C",
          rose: "#F2545C",
          violet: "#8B7CF6",
        },
      },
      backgroundImage: {
        "accent-gradient": "linear-gradient(135deg, #5B8DEF 0%, #3ECF8E 100%)",
      },
      boxShadow: {
        panel: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.6)",
        "panel-light": "0 1px 0 0 rgba(255,255,255,0.6) inset, 0 8px 24px -12px rgba(20,23,31,0.12)",
        glow: "0 0 0 1px rgba(91,141,239,0.25), 0 8px 30px -10px rgba(91,141,239,0.35)",
      },
      borderRadius: {
        xl2: "1.1rem",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-450px 0" },
          "100%": { backgroundPosition: "450px 0" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s infinite linear",
        fadeUp: "fadeUp 0.4s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
