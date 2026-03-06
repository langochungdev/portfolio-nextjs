import "@/app/style/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "La Ngọc Hưng - Portfolio",
  description: "Software Engineer Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
