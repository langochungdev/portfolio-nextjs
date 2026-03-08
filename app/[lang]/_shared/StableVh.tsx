"use client";

import { useEffect } from "react";

export function StableVh() {
  useEffect(() => {
    const h = window.innerHeight;
    document.documentElement.style.setProperty("--stable-vh", `${h}px`);
  }, []);

  return null;
}
