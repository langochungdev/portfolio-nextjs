"use client";

import { useEffect, useState } from "react";
import styles from "@/app/style/shared/TopActions.module.css";

type Theme = "light" | "dark";
const STORAGE_KEY = "theme-preference";

export function DarkModeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  function toggle() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  return (
    <button
      className={styles.actionBtn}
      onClick={toggle}
      aria-label="Toggle theme"
      suppressHydrationWarning
    >
      {theme === "light" ? "☀️" : "🌙"}
    </button>
  );
}
