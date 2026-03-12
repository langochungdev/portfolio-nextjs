import type { Metadata } from "next";
import { BlogShell } from "./_components/BlogShell";
import { BlogDataProvider } from "./_lib/BlogDataProvider";
import { fetchPosts } from "@/lib/firebase/posts";
import { fetchTopicBySlug } from "@/lib/firebase/collections";
import { JsonLd, blogListingSchema, breadcrumbSchema } from "@/lib/seo/schemas";

interface Props {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ topic?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { lang } = await params;
  const { topic: topicSlug } = await searchParams;
  const baseUrl = `https://langochung.me/${lang}/blog`;

  if (topicSlug) {
    try {
      const topic = await fetchTopicBySlug(topicSlug);
      if (topic && (topic.description || topic.thumbnail)) {
        const title = `${topic.name} - Blog`;
        const description = topic.description || `Bài viết về ${topic.name}`;
        const meta: Metadata = {
          title,
          description,
          alternates: { canonical: `${baseUrl}?topic=${topicSlug}` },
          openGraph: {
            title,
            description,
            type: "website",
            url: `${baseUrl}?topic=${topicSlug}`,
            siteName: "langochungdev",
          },
          twitter: {
            card: "summary_large_image",
            title,
            description,
          },
        };
        if (topic.thumbnail) {
          meta.openGraph!.images = [{ url: topic.thumbnail }];
          meta.twitter!.images = [topic.thumbnail];
        }
        return meta;
      }
    } catch { /* fall through to default */ }
  }

  return { title: "Blog" };
}

export default async function BlogLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  let posts: Awaited<ReturnType<typeof fetchPosts>> = [];
  try {
    posts = await fetchPosts();
  } catch { /* Firestore unavailable */ }

  return (
    <BlogDataProvider>
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
