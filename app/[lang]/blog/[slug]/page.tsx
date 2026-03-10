"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import { blogPosts, blogTopics, collectionColors } from "@/lib/mock/blog";
import styles from "@/app/style/blog/detail.module.css";
import { useMemo } from "react";

export default function BlogDetailPage() {
  const { locale, dictionary: dict } = useDictionary();
  const params = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === params.slug);

  const sidebarData = useMemo(() => {
    if (!post) return null;
    const topic = post.topic ? blogTopics.find((t) => t.id === post.topic) : null;
    if (topic) {
      const topicPosts = blogPosts.filter((p) => p.topic === topic.id);
      return { type: "topic" as const, topic, posts: topicPosts };
    }
    const catPosts = blogPosts.filter((p) => p.category === post.category);
    return { type: "category" as const, posts: catPosts };
  }, [post]);

  if (!post) {
    return (
      <div className={styles.shell}>
        <div className={styles.notFound}>
          <h1>{dict.blog.notFound}</h1>
          <Link href={`/${locale}/blog`} className={styles.sidebarBack}>
            ← {dict.blog.backToBlog}
          </Link>
        </div>
      </div>
    );
  }

  const catLabel =
    dict.blog.categories[post.category as keyof typeof dict.blog.categories] ?? post.category;
  const color = collectionColors[post.category] ?? post.color;

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href={`/${locale}/blog`} className={styles.sidebarBack}>
          ← {dict.blog.backToBlog}
        </Link>

        {sidebarData?.type === "topic" && (
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarHeading}>{dict.blog.topic}</div>
            <div className={styles.topicLabel}>{sidebarData.topic.title[locale]}</div>
          </div>
        )}

        <div className={styles.sidebarSection}>
          <div className={styles.sidebarHeading}>
            {sidebarData?.type === "topic" ? `${sidebarData.posts.length} posts` : catLabel}
          </div>
          <div className={styles.sidebarNav}>
            {sidebarData?.posts.map((p, i) => (
              <Link
                key={p.id}
                href={`/${locale}/blog/${p.slug}`}
                className={`${styles.sidebarItem} ${p.slug === post.slug ? styles.sidebarItemActive : ""}`}
              >
                {sidebarData.type === "topic" && (
                  <span className={styles.sidebarIndex}>{i + 1}</span>
                )}
                <span className={styles.sidebarItemText}>{p.title[locale]}</span>
              </Link>
            ))}
          </div>
        </div>
      </aside>

      <main className={styles.main}>
        <article className={styles.article}>
          <div className={styles.articleTop}>
            <span className={styles.tag}>{catLabel}</span>
            <span className={styles.dot} style={{ background: color }} />
            <time className={styles.date}>{post.date}</time>
            <span className={styles.readTime}>· {post.readTime} min read</span>
          </div>

          <h1 className={styles.title}>{post.title[locale]}</h1>

          <div className={styles.meta}>
            <div className={styles.authorAvatar}>H</div>
            <span className={styles.authorName}>{post.author}</span>
          </div>

          <div className={styles.content}>
            {post.content[locale].split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </article>
      </main>
    </div>
  );
}
