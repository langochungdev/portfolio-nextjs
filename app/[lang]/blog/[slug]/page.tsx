import type { Metadata } from "next";
import { getExcerpt } from "../_lib/helpers";
import { getBlogData } from "../_lib/getBlogData";
import BlogDetailClient from "./BlogDetailClient";
import { JsonLd, articleSchema, breadcrumbSchema } from "@/lib/seo/schemas";

interface Props {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const { posts } = await getBlogData();
  const post = posts.find((item) => item.slug === slug);
  if (!post) return { title: "Not Found" };

  const description = getExcerpt(post.content, 160);
  const url = `https://langochung.me/${lang}/blog/${slug}`;

  const meta: Metadata = {
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      url,
      siteName: "langochungdev",
      authors: ["La Ngọc Hùng"],
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
    },
  };

  if (post.thumbnail) {
    meta.openGraph!.images = [{ url: post.thumbnail }];
    meta.twitter!.images = [post.thumbnail];
  }

  return meta;
}

export default async function BlogDetailPage({ params }: Props) {
  const { lang, slug } = await params;
  const { posts } = await getBlogData();
  const post = posts.find((item) => item.slug === slug);

  return (
    <>
      {post && (
        <>
          <JsonLd data={articleSchema(post, lang)} />
          <JsonLd
            data={breadcrumbSchema(
              [
                { name: "Trang chủ", url: "https://langochung.me" },
                { name: "Blog", url: `https://langochung.me/${lang}/blog` },
                {
                  name: post.title,
                  url: `https://langochung.me/${lang}/blog/${slug}`,
                },
              ],
              `breadcrumb-blog-${slug}`,
            )}
          />
        </>
      )}
      <BlogDetailClient />
    </>
  );
}
