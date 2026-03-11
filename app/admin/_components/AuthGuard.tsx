"use client";

import { useMockAuth } from "./MockAuthProvider";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useMockAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && !pathname.endsWith("/admin/login")) {
      router.replace("/admin/login");
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--color-bg)", color: "var(--color-text)" }}>
        <div className="admin-spinner" />
      </div>
    );
  }

  if (!user && !pathname.endsWith("/admin/login")) {
    return null;
  }

  return <>{children}</>;
}
