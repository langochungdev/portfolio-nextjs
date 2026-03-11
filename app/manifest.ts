import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "La Ngọc Hùng - Software Engineer",
    short_name: "langochungdev",
    description: "Software Engineer Portfolio & Blog by La Ngọc Hùng",
    start_url: "/vi",
    display: "standalone",
    background_color: "#141414",
    theme_color: "#141414",
    orientation: "portrait-primary",
    categories: ["portfolio", "blog", "technology"],
    lang: "vi",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
