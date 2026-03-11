"use client";

import { useEffect } from "react";
import { trackPageView, type PageKey } from "@/lib/firebase/analytics";

export function PageViewTracker({ page }: { page: PageKey }) {
  useEffect(() => {
    trackPageView(page);
  }, [page]);

  return null;
}
