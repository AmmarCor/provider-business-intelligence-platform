import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "mpi-theme";

function getSystemTheme(): Theme {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : null;
}

/** Resolves the theme to use on first render: an explicit prior choice wins,
 *  otherwise fall back to the OS/browser preference. */
function getInitialTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme();
}

function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  /** True only when the current theme came from an explicit user choice
   *  (as opposed to the detected system preference). */
  isUserOverride: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [isUserOverride, setIsUserOverride] = useState<boolean>(() => getStoredTheme() !== null);

  // Keep <html class="dark"> (and the color-scheme hint) in sync with state.
  // The inline script in index.html already applies the correct class
  // before first paint, so this effect just keeps things consistent after.
  useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  // If the person never explicitly chose a theme, keep following the OS
  // preference live (e.g. their system switches to dark mode at sunset).
  useEffect(() => {
    if (isUserOverride || typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setThemeState(e.matches ? "dark" : "light");
    };
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [isUserOverride]);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    setIsUserOverride(true);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const value = useMemo(() => ({ theme, setTheme, toggleTheme, isUserOverride }), [theme, isUserOverride]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
