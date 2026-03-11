"use client";

import { useRouter } from "next/navigation";
import { useMockAuth } from "./MockAuthProvider";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { Locale } from "@/lib/i18n/config";
import styles from "@/app/style/admin/sidebar.module.css";

interface AdminHeaderProps {
  locale: Locale;
  dict: Dictionary;
  onToggleTheme: () => void;
  theme: string;
}

const SunIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const MoonIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export function AdminHeader({ locale, dict, onToggleTheme, theme }: AdminHeaderProps) {
  const { user } = useMockAuth();
  const router = useRouter();

  const getTitle = () => {
    const path = typeof window !== "undefined" ? window.location.pathname : "";
    if (path.includes("/posts")) return dict.admin.posts.title;
    if (path.includes("/messages")) return dict.admin.messages.title;
    return dict.admin.dashboard.title;
  };

  if (!user) return null;

  const nextLocale = locale === "vi" ? "en" : "vi";

  const switchLang = () => {
    document.cookie = `admin-locale=${nextLocale};path=/;max-age=31536000;SameSite=Lax`;
    router.refresh();
  };

  return (
    <header className={styles.header}>
      <h1 className={styles.headerTitle}>{getTitle()}</h1>
      <div className={styles.headerActions}>
        <button className={styles.headerBtn} onClick={switchLang}>
          {nextLocale.toUpperCase()}
        </button>
        <button className={styles.headerBtn} onClick={onToggleTheme} aria-label="Toggle theme">
          {theme === "light" ? SunIcon : MoonIcon}
        </button>
      </div>
    </header>
  );
}
