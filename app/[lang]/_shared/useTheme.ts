"use client";

import { useSyncExternalStore, useEffect, useCallback } from "react";

type Theme = "light" | "dark";
const STORAGE_KEY = "theme-preference";

export function useTheme() {
  const theme = useSyncExternalStore(
    (cb) => {
      window.addEventListener("storage", cb);
      return () => window.removeEventListener("storage", cb);
    },
    () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === "dark" ? "dark" : "light";
    },
    () => "light" as Theme,
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggle = useCallback(() => {
    const next: Theme = theme === "light" ? "dark" : "light";
    localStorage.setItem(STORAGE_KEY, next);
    document.cookie = `theme=${next};path=/;max-age=31536000;SameSite=Lax`;
    document.documentElement.setAttribute("data-theme", next);
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
  }, [theme]);

  return { theme, toggle };
}
