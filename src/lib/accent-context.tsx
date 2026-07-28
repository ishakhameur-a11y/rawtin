"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export const ACCENT_PRESETS = [
  { id: "teal", color: "#3c8770" },
  { id: "blue", color: "#3b6ea5" },
  { id: "purple", color: "#7c5cbf" },
  { id: "rose", color: "#b5576f" },
  { id: "amber", color: "#b8842f" },
  { id: "slate", color: "#55708a" },
] as const;

const DEFAULT_ACCENT = ACCENT_PRESETS[0].color;
const STORAGE_KEY = "rawtin-accent";

interface AccentContextValue {
  accent: string;
  setAccent: (color: string) => void;
}

const AccentContext = createContext<AccentContextValue | undefined>(undefined);

export function AccentProvider({ children }: { children: ReactNode }) {
  const [accent, setAccentState] = useState<string>(DEFAULT_ACCENT);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setAccentState(stored);
      document.documentElement.style.setProperty("--accent", stored);
    }
  }, []);

  function setAccent(color: string) {
    setAccentState(color);
    document.documentElement.style.setProperty("--accent", color);
    localStorage.setItem(STORAGE_KEY, color);
  }

  return (
    <AccentContext.Provider value={{ accent, setAccent }}>
      {children}
    </AccentContext.Provider>
  );
}

export function useAccent() {
  const ctx = useContext(AccentContext);
  if (!ctx) throw new Error("useAccent must be used within AccentProvider");
  return ctx;
}
