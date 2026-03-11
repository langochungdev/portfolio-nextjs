"use client";

import { useMockAuth } from "./MockAuthProvider";
import { useHeaderActions } from "./HeaderActionsContext";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import styles from "@/app/style/admin/sidebar.module.css";

interface AdminHeaderProps {
  dict: Dictionary;
}

export function AdminHeader({ dict }: AdminHeaderProps) {
  const { user } = useMockAuth();
  const { node: headerActions } = useHeaderActions();

  const getTitle = () => {
    const path = typeof window !== "undefined" ? window.location.pathname : "";
    if (path.includes("/posts")) return dict.admin.posts.title;
    if (path.includes("/hints")) return dict.admin.hints.title;
    if (path.includes("/messages")) return dict.admin.messages.title;
    return dict.admin.dashboard.title;
  };

  if (!user) return null;

  return (
    <header className={styles.header}>
      <h1 className={styles.headerTitle}>{getTitle()}</h1>
      {headerActions && <div className={styles.headerActions}>{headerActions}</div>}
    </header>
  );
}
