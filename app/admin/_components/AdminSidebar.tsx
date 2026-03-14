"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMockAuth } from "./MockAuthProvider";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import styles from "@/app/style/admin/sidebar.module.css";

const DashboardIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </svg>
);

const PostsIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838.838-2.872a2 2 0 0 1 .506-.854Z" />
  </svg>
);

const MessagesIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const NotificationsIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const ExternalLinkIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 3h7v7" />
    <path d="M10 14 21 3" />
    <path d="M21 14v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6" />
  </svg>
);

const LogoutIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

interface AdminSidebarProps {
  dict: Dictionary;
}

export function AdminSidebar({ dict }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useMockAuth();
  const t = dict.admin.sidebar;

  const navItems = [
    { href: "/admin", label: t.dashboard, icon: DashboardIcon },
    { href: "/admin/posts", label: t.posts, icon: PostsIcon },
    { href: "/admin/messages", label: t.messages, icon: MessagesIcon },
    { href: "/admin/notifications", label: t.notifications, icon: NotificationsIcon },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === href;
    return pathname.startsWith(href);
  };

  if (!user) return null;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>Admin</div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${isActive(item.href) ? styles.active : ""}`}
          >
            {item.icon}
            <span className={styles.navLabel}>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className={styles.bottom}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>{user.email?.[0]?.toUpperCase() ?? "A"}</div>
          <span className={styles.userName}>{user.email?.split("@")[0]}</span>
        </div>
        <a
          className={`${styles.logoutBtn} ${styles.siteBtn}`}
          href="/"
          target="_blank"
          rel="noopener noreferrer"
        >
          {ExternalLinkIcon}
          <span className={styles.navLabel}>Trang chinh</span>
        </a>
        <button className={styles.logoutBtn} onClick={logout}>
          {LogoutIcon}
          <span className={styles.navLabel}>{t.logout}</span>
        </button>
      </div>
    </aside>
  );
}
