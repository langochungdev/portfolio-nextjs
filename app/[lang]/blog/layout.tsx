import type { Metadata } from "next";
import { BlogShell } from "./_components/BlogShell";

export const metadata: Metadata = {
  title: "Blog",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <BlogShell>{children}</BlogShell>;
}
