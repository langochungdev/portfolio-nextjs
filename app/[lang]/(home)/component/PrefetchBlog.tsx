"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function PrefetchBlog({ locale }: { locale: string }) {
  const router = useRouter();

  useEffect(() => {
    const id = requestIdleCallback(() => {
      router.prefetch(`/${locale}/blog`);
    });
    return () => cancelIdleCallback(id);
  }, [router, locale]);

  return null;
}
