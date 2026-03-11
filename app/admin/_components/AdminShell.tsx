"use client";

import { MockAuthProvider } from "./MockAuthProvider";
import { DictionaryProvider } from "@/app/[lang]/_shared/DictionaryProvider";
import { AuthGuard } from "./AuthGuard";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { HeaderActionsProvider } from "./HeaderActionsContext";
import { usePathname } from "next/navigation";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { Locale } from "@/lib/i18n/config";
import styles from "@/app/style/admin/layout.module.css";

function AdminInner({
  children,
  dict,
}: {
  children: React.ReactNode;
  dict: Dictionary;
}) {
  const pathname = usePathname();
  const isLogin = pathname.endsWith("/admin/login");

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <HeaderActionsProvider>
      <div className={styles.adminLayout}>
        <AdminSidebar dict={dict} />
        <div className={styles.mainArea}>
          <AdminHeader dict={dict} />
          <main className={styles.content}>{children}</main>
        </div>
      </div>
    </HeaderActionsProvider>
  );
}

export function AdminShell({
  children,
  locale,
  dictionary,
}: {
  children: React.ReactNode;
  locale: Locale;
  dictionary: Dictionary;
}) {
  return (
    <DictionaryProvider dictionary={dictionary} locale={locale} serverTheme="dark">
      <MockAuthProvider>
        <AuthGuard>
          <AdminInner dict={dictionary}>
            {children}
          </AdminInner>
        </AuthGuard>
      </MockAuthProvider>
    </DictionaryProvider>
  );
}
