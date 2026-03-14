import "@/app/style/globals.css";
import "cropperjs/dist/cropper.css";
import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://langochung.me"),
  title: {
    default: "╰(*°▽°*)╯ - Hùng Xin Chào",
    template: "langochungdev | %s",
  },
  description:
    "La Ngọc Hùng (langochungdev) - Software Engineer Portfolio & Blog. Next.js, Nuxt.js, Spring Boot, TypeScript, Firebase.",
  keywords: [
    "La Ngọc Hùng",
    "langochungdev",
    "software engineer",
    "portfolio",
    "blog",
    "Next.js",
    "Nuxt.js",
    "Spring Boot",
    "TypeScript",
    "full-stack developer",
    "Vietnam",
  ],
  authors: [{ name: "La Ngọc Hùng", url: "https://langochung.me" }],
  creator: "La Ngọc Hùng",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    alternateLocale: "en_US",
    url: "https://langochung.me",
    siteName: "langochungdev",
    title: "La Ngọc Hùng, Xin Chào",
    description:
      "Thiết kế và triển khai web, app, extension, business tools theo yêu cầu.",
    images: [
      {
        url: "/og-img.png",
        width: 1200,
        height: 630,
        alt: "La Ngọc Hùng - langochungdev",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "La Ngọc Hùng, Xin Chào",
    description:
      "Thiết kế và triển khai web, app, extension, business tools theo yêu cầu.",
    images: ["/og-img.png"],
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  alternates: {
    canonical: "https://langochung.me",
    languages: {
      vi: "https://langochung.me/vi",
      en: "https://langochung.me/en",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
