"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import { blogPosts, collectionColors } from "@/lib/mock/blog";
import styles from "@/app/style/blog/detail.module.css";

export default function BlogDetailPage() {
  const { locale, dictionary: dict } = useDictionary();
  const params = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === params.slug);

  if (!post) {
    return (
      <div className={styles.shell}>
        <div className={styles.notFound}>
          <h1>{dict.blog.notFound}</h1>
          <Link href={`/${locale}/blog`} className={styles.backBtn}>
            ← {dict.blog.backToBlog}
          </Link>
        </div>
      </div>
    );
  }

  const catLabel =
    dict.blog.categories[
      post.category as keyof typeof dict.blog.categories
    ] ?? post.category;
  const color = collectionColors[post.category] ?? post.color;

  return (
    <div className={styles.shell}>
      <main className={styles.main}>
        <Link href={`/${locale}/blog`} className={styles.backBtn}>
          ← {dict.blog.backToBlog}
        </Link>

        <article className={styles.article}>
          <div className={styles.articleTop}>
            <span className={styles.tag}>{catLabel}</span>
            <span
              className={styles.dot}
              style={{ background: color }}
            />
            <time className={styles.date}>{post.date}</time>
            <span className={styles.readTime}>
              · {post.readTime} min read
            </span>
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
