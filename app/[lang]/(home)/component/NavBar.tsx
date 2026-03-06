"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import styles from "@/app/style/home/NavBar.module.css";

const NAV_ITEMS = [
  {
    key: "home" as const,
    path: "",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.75L12 3l9 6.75V21a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.75Z" />
        <path d="M9 22V12h6v10" />
      </svg>
    ),
  },
  {
    key: "blog" as const,
    path: "/blog",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    key: "certificates" as const,
    path: "/certificates",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M8 14H5a2 2 0 0 0-2 2v3h18v-3a2 2 0 0 0-2-2h-3" />
        <path d="M9 21v-3a3 3 0 0 1 6 0v3" />
      </svg>
    ),
  },
];

export function NavBar() {
  const { dictionary: dict, locale } = useDictionary();
  const pathname = usePathname();

  return (
    <nav className={styles.navBar}>
      {NAV_ITEMS.map((item) => {
        const href = `/${locale}${item.path}`;
        const isActive =
          item.path === ""
            ? pathname === `/${locale}` || pathname === `/${locale}/`
            : pathname.startsWith(href);

        return (
          <Link
            key={item.key}
            href={href}
            className={`${styles.dockItem} ${isActive ? styles.dockItemActive : ""}`}
            title={dict.home.nav[item.key]}
          >
            <span className={styles.dockIcon}>{item.icon}</span>
            <span className={styles.dockLabel}>{dict.home.nav[item.key]}</span>
            {isActive && <span className={styles.dockDot} />}
          </Link>
        );
      })}
    </nav>
  );
}
