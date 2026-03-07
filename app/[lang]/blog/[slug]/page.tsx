"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import { LanguageSwitcher } from "@/app/[lang]/_shared/LanguageSwitcher";
import { DarkModeToggle } from "@/app/[lang]/_shared/DarkModeToggle";
import { blogPosts } from "@/lib/mock/blog";
import topStyles from "@/app/style/shared/TopActions.module.css";
import styles from "@/app/style/blog/detail.module.css";

export default function BlogDetailPage() {
  const { locale, dictionary: dict } = useDictionary();
  const params = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === params.slug);

  if (!post) {
    return (
      <div className={styles.container}>
        <div className={topStyles.topActions}>
          <LanguageSwitcher />
          <DarkModeToggle />
        </div>
        <div className={styles.notFound}>
          <h1>{dict.blog.notFound}</h1>
          <Link href={`/${locale}/blog`} className={styles.backLink}>
            ← {dict.blog.backToBlog}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={topStyles.topActions}>
        <LanguageSwitcher />
        <DarkModeToggle />
      </div>

      <article className={styles.article}>
        <Link href={`/${locale}/blog`} className={styles.backLink}>
          ← {dict.blog.backToBlog}
        </Link>

        <div
          className={styles.accentBar}
          style={{ backgroundColor: post.color }}
        />

        <header className={styles.articleHeader}>
          <span className={styles.category}>
            {dict.blog.categories[post.category as keyof typeof dict.blog.categories] ?? post.category}
          </span>
          <h1 className={styles.title}>{post.title[locale]}</h1>
          <div className={styles.meta}>
            <span>{post.author}</span>
            <span>·</span>
            <time>{post.date}</time>
          </div>
        </header>

        <div className={styles.content}>
          {post.content[locale].split("\n\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  );
}
