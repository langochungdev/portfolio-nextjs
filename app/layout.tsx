import "@/app/style/globals.css";
import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    default: "╰(*°▽°*)╯ - Hùng Xin Chào",
    template: "langochungdev | %s",
  },
  description: "Software Engineer Portfolio",
  icons: {
    icon: "/favicon.gif",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
