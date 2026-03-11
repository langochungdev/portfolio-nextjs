import type { Metadata } from "next";
import { fetchPostBySlug } from "@/lib/firebase/posts";
import { getExcerpt } from "../_lib/helpers";
import BlogDetailClient from "./BlogDetailClient";

interface Props {
  params: Promise<{ lang: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const post = await fetchPostBySlug(slug);
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

export default function BlogDetailPage() {
  return <BlogDetailClient />;
}
