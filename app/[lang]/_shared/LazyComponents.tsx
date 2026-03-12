"use client";

import dynamic from "next/dynamic";

export const LazyEyesCat = dynamic(
  () => import("./EyesCat").then((m) => m.EyesCat),
  { ssr: false }
);

export const LazyAnimatedFavicon = dynamic(
  () => import("./AnimatedFavicon").then((m) => m.AnimatedFavicon),
  { ssr: false }
);

export const LazyVisitorProvider = dynamic(
  () =>
    import("@/lib/visitor/VisitorProvider").then((m) => m.VisitorProvider),
  { ssr: false }
);
