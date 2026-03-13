"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { i18nConfig, localeCookieName } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/config";
import styles from "@/app/style/shared/TopActions.module.css";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1] as Locale;
  const nextLocale = i18nConfig.locales.find((l) => l !== currentLocale) ?? i18nConfig.defaultLocale;

  function getLocalePath(locale: Locale) {
    const segments = pathname.split("/");
    segments[1] = locale;
    return segments.join("/");
  }

  return (
    <Link
      href={getLocalePath(nextLocale)}
      className={styles.actionBtn}
      onClick={() => {
        document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
      }}
    >
      {nextLocale.toUpperCase()}
    </Link>
  );
}
