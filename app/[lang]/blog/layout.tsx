import type { Metadata } from "next";
import { BlogShell } from "./_components/BlogShell";
import { BlogDataProvider } from "./_lib/BlogDataProvider";
import { getBlogData } from "./_lib/getBlogData";
import { JsonLd, blogListingSchema, breadcrumbSchema } from "@/lib/seo/schemas";

export const metadata: Metadata = {
  title: "Blog",
};

export default async function BlogLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  let data: Awaited<ReturnType<typeof getBlogData>> = {
    collections: [],
    topics: [],
    posts: [],
  };

  try {
    data = await getBlogData();
  } catch { /* Firestore unavailable */ }

  const { collections, topics, posts } = data;

  return (
    <BlogDataProvider initialData={{ collections, topics, posts }}>
      <JsonLd data={blogListingSchema(posts, lang)} />
      <JsonLd
        data={breadcrumbSchema(
          [
            { name: "Trang chủ", url: "https://langochung.me" },
            { name: "Blog", url: `https://langochung.me/${lang}/blog` },
          ],
          "breadcrumb-blog",
        )}
      />
      <BlogShell>{children}</BlogShell>
    </BlogDataProvider>
  );
}
