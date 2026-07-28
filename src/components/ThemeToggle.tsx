"use client";

import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme-context";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label="تبديل الوضع"
      className="relative flex h-9 w-16 items-center rounded-full px-1"
      style={{ backgroundColor: "var(--border)" }}
    >
      <motion.div
        className="flex h-7 w-7 items-center justify-center rounded-full shadow-sm"
        style={{ backgroundColor: "var(--bg-elevated)" }}
        animate={{ x: isDark ? -28 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {isDark ? (
          <Moon size={15} color="var(--accent)" />
        ) : (
          <Sun size={15} color="var(--accent)" />
        )}
      </motion.div>
    </button>
  );
}
