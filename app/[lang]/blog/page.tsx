"use client";

import Link from "next/link";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import { LanguageSwitcher } from "@/app/[lang]/_shared/LanguageSwitcher";
import { DarkModeToggle } from "@/app/[lang]/_shared/DarkModeToggle";
import { blogPosts, blogCategories } from "@/lib/mock/blog";
import topStyles from "@/app/style/shared/TopActions.module.css";
import styles from "@/app/style/blog/page.module.css";
import { useState } from "react";

export default function BlogPage() {
  const { locale, dictionary: dict } = useDictionary();
  const [activeCategory, setActiveCategory] = useState<string>("allPosts");

  const filtered =
    activeCategory === "allPosts"
      ? blogPosts
      : blogPosts.filter((p) => p.category === activeCategory);

  return (
    <div className={styles.container}>
      <div className={topStyles.topActions}>
        <LanguageSwitcher />
        <DarkModeToggle />
      </div>

      <header className={styles.header}>
        <Link href={`/${locale}`} className={styles.backLink}>
          ← {dict.blog.backHome}
        </Link>
        <h1 className={styles.title}>{dict.blog.title}</h1>
        <p className={styles.subtitle}>{dict.blog.subtitle}</p>
      </header>

      <nav className={styles.categories}>
        {blogCategories.map((cat) => (
          <button
            key={cat}
            className={`${styles.catBtn} ${activeCategory === cat ? styles.catActive : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {dict.blog.categories[cat]}
          </button>
        ))}
      </nav>

      <div className={styles.grid}>
        {filtered.map((post) => (
          <Link
            key={post.id}
            href={`/${locale}/blog/${post.slug}`}
            className={styles.card}
          >
            <div
              className={styles.cardAccent}
              style={{ backgroundColor: post.color }}
            />
            <div className={styles.cardBody}>
              <span className={styles.cardCategory}>
                {dict.blog.categories[post.category as keyof typeof dict.blog.categories] ?? post.category}
              </span>
              <h2 className={styles.cardTitle}>{post.title[locale]}</h2>
              <p className={styles.cardExcerpt}>{post.excerpt[locale]}</p>
              <time className={styles.cardDate}>{post.date}</time>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
