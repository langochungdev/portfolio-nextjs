"use client";

import { useSyncExternalStore, useEffect, useCallback } from "react";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";

type Theme = "light" | "dark";
const STORAGE_KEY = "theme-preference";

export function useTheme() {
  const { serverTheme } = useDictionary();

  const theme = useSyncExternalStore(
    (cb) => {
      window.addEventListener("storage", cb);
      return () => window.removeEventListener("storage", cb);
    },
    () => {
      const attr = document.documentElement.getAttribute("data-theme");
      if (attr === "dark" || attr === "light") return attr;

      const cookieTheme = document.cookie.match(
        /(?:^|;)\s*theme=(light|dark)/,
      )?.[1];
      if (cookieTheme === "dark" || cookieTheme === "light") return cookieTheme;

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "dark" || stored === "light") return stored;

      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    },
    () => serverTheme,
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
