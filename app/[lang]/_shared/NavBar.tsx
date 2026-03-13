"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSyncExternalStore, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import { useTheme } from "@/app/[lang]/_shared/useTheme";
import {
  toggleRelated,
  subscribeRelated,
  getRelatedSnapshot,
  getRelatedServerSnapshot,
} from "@/app/[lang]/_shared/blogDetailStore";
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

const BackIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const ListIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const SunIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const MoonIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const BLOG_DETAIL_RE = /^\/[a-z]{2}\/blog\/.+/;

export function NavBar() {
  const { dictionary: dict, locale } = useDictionary();
  const pathname = usePathname();
  const router = useRouter();
  const isBlogDetail = BLOG_DETAIL_RE.test(pathname);
  const showRelated = useSyncExternalStore(
    subscribeRelated,
    getRelatedSnapshot,
    getRelatedServerSnapshot
  );
  const { theme, toggle: toggleTheme } = useTheme();
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setPendingPath(null);
  }, [pathname]);

  useEffect(() => {
    const current = pathname;
    for (const item of NAV_ITEMS) {
      const href = `/${locale}${item.path}`;
      if (href === current || `${href}/` === current) continue;
      router.prefetch(href);
    }
  }, [locale, pathname, router]);

  const loader = pendingPath && mounted
    ? createPortal(<div className={styles.topLoader} />, document.body)
    : null;

  const handleNav = (e: React.MouseEvent, href: string) => {
    if (href === pathname) { e.preventDefault(); return; }
    setPendingPath(href);
  };

  const checkActive = (item: (typeof NAV_ITEMS)[number]) => {
    const href = `/${locale}${item.path}`;
    if (pendingPath !== null) {
      return item.path === ""
        ? pendingPath === `/${locale}` || pendingPath === `/${locale}/`
        : pendingPath.startsWith(href);
    }
    return item.path === ""
      ? pathname === `/${locale}` || pathname === `/${locale}/`
      : pathname.startsWith(href);
  };

  const defaultNav = (
    <nav className={`${styles.navBar} ${isBlogDetail ? styles.defaultNavDetail : ""}`}>
      {NAV_ITEMS.map((item) => {
        const href = `/${locale}${item.path}`;
        const isActive = checkActive(item);

        return (
          <Link
            key={item.key}
            href={href}
            onClick={(e) => handleNav(e, href)}
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

  if (isBlogDetail) {
    return (
      <>
        {loader}
        {defaultNav}
        <nav
          className={`${styles.navBar} ${styles.detailNav} ${showRelated ? styles.blogDetailOpen : ""}`}
          data-detail-nav
        >
          <button
            className={`${styles.dockItem} ${styles.blogDetailBtn}`}
            onClick={() => router.back()}
            aria-label={dict.blog.backToBlog}
          >
            <span className={styles.dockIcon}>{BackIcon}</span>
          </button>
          <button
            className={`${styles.dockItem} ${styles.blogDetailBtn} ${showRelated ? styles.blogDetailBtnActive : ""}`}
            onClick={toggleRelated}
            aria-label="Related articles"
          >
            <span className={styles.dockIcon}>{ListIcon}</span>
          </button>
          <button
            className={`${styles.dockItem} ${styles.blogDetailBtn}`}
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <span className={styles.dockIcon}>
              {theme === "light" ? SunIcon : MoonIcon}
            </span>
          </button>
        </nav>
      </>
    );
  }

  return (
    <>
      {loader}
      {defaultNav}
    </>
  );
}
