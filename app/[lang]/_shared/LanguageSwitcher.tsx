"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { i18nConfig } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/config";
import styles from "./styles/LanguageSwitcher.module.css";

export function LanguageSwitcher() {
  const pathname = usePathname();

  function getLocalePath(locale: Locale) {
    const segments = pathname.split("/");
    segments[1] = locale;
    return segments.join("/");
  }

  const currentLocale = pathname.split("/")[1] as Locale;

  return (
    <div className={styles.langSwitcher}>
      {i18nConfig.locales.map((locale) => (
        <Link
          key={locale}
          href={getLocalePath(locale)}
          className={`${styles.langLink} ${currentLocale === locale ? styles.langActive : ""}`}
        >
          {locale.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
