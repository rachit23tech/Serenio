/**
 * ThemeContext.tsx
 * Provides dark/light mode toggle across the entire app.
 * Usage: const { dark, toggleDark } = useTheme();
 * Wrap app in <ThemeProvider> inside main.tsx.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface ThemeContextType {
  dark: boolean;
  toggleDark: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ dark: false, toggleDark: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("serenio-dark");
    if (saved === "true") setDark(true);
  }, []);

  const toggleDark = () => {
    setDark((prev) => {
      localStorage.setItem("serenio-dark", String(!prev));
      return !prev;
    });
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}