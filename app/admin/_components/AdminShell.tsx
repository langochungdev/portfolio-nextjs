"use client";

import { MockAuthProvider } from "./MockAuthProvider";
import { DictionaryProvider } from "@/app/[lang]/_shared/DictionaryProvider";
import { AuthGuard } from "./AuthGuard";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { useTheme } from "@/app/[lang]/_shared/useTheme";
import { usePathname } from "next/navigation";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { Locale } from "@/lib/i18n/config";
import styles from "@/app/style/admin/layout.module.css";

function AdminInner({
  children,
  locale,
  dict,
}: {
  children: React.ReactNode;
  locale: Locale;
  dict: Dictionary;
}) {
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const isLogin = pathname.endsWith("/admin/login");

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div className={styles.adminLayout}>
      <AdminSidebar locale={locale} dict={dict} />
      <div className={styles.mainArea}>
        <AdminHeader
          locale={locale}
          dict={dict}
          onToggleTheme={toggle}
          theme={theme}
        />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
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
    <DictionaryProvider dictionary={dictionary} locale={locale} serverTheme="light">
      <MockAuthProvider>
        <AuthGuard>
          <AdminInner locale={locale} dict={dictionary}>
            {children}
          </AdminInner>
        </AuthGuard>
      </MockAuthProvider>
    </DictionaryProvider>
  );
}
