"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import styles from "@/app/style/NavBar.module.css";

const NAV_ITEMS = [
  { key: "home" as const, path: "" },
  { key: "blog" as const, path: "/blog" },
  { key: "certificates" as const, path: "/certificates" },
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
            className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
          >
            {dict.home.nav[item.key]}
          </Link>
        );
      })}
    </nav>
  );
}
