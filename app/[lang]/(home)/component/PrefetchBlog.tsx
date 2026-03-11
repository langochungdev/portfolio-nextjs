"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function PrefetchBlog({ locale }: { locale: string }) {
  const router = useRouter();

  useEffect(() => {
    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(() => {
        router.prefetch(`/${locale}/blog`);
      });
      return () => cancelIdleCallback(id);
    }
    const timer = setTimeout(() => {
      router.prefetch(`/${locale}/blog`);
    }, 1);
    return () => clearTimeout(timer);
  }, [router, locale]);

  return null;
}
