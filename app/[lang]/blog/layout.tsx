import type { Metadata } from "next";
import { BlogShell } from "./_components/BlogShell";
import { BlogDataProvider } from "./_lib/BlogDataProvider";

export const metadata: Metadata = {
  title: "Blog",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <BlogDataProvider>
      <BlogShell>{children}</BlogShell>
    </BlogDataProvider>
  );
}
