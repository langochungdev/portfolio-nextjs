"use client";

import Link from "next/link";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import {
  blogPosts,
  blogCategories,
  collectionColors,
} from "@/lib/mock/blog";
import type { BlogPost } from "@/lib/mock/blog";
import styles from "@/app/style/blog/page.module.css";
import { useState, useMemo } from "react";

const WIDE_THRESHOLD = 4;

function groupByCategory(posts: BlogPost[]) {
  const groups: Record<string, BlogPost[]> = {};
  for (const post of posts) {
    if (!groups[post.category]) groups[post.category] = [];
    groups[post.category].push(post);
  }
  return groups;
}

function latestDate(posts: BlogPost[]) {
  return posts.reduce(
    (latest, p) => (p.updatedDate > latest ? p.updatedDate : latest),
    posts[0].updatedDate,
  );
}

export default function BlogPage() {
  const { locale, dictionary: dict } = useDictionary();
  const [activeCategory, setActiveCategory] = useState<string>("allPosts");

  const categories = blogCategories.filter((c) => c !== "allPosts");
  const grouped = useMemo(() => groupByCategory(blogPosts), []);

  const visibleGroups = useMemo(() => {
    if (activeCategory === "allPosts") {
      return categories
        .filter((cat) => grouped[cat]?.length)
        .map((cat) => ({ key: cat, posts: grouped[cat] }));
    }
    const posts = grouped[activeCategory];
    return posts?.length ? [{ key: activeCategory, posts }] : [];
  }, [activeCategory, categories, grouped]);

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href={`/${locale}`} className={styles.wordmark}>
          langochung
        </Link>

        <div className={styles.sidebarSection}>
          <div className={styles.sidebarHeading}>Collections</div>
          <button
            className={`${styles.collectionItem} ${activeCategory === "allPosts" ? styles.collectionItemActive : ""}`}
            onClick={() => setActiveCategory("allPosts")}
          >
            <span
              className={styles.collectionDot}
              style={{ background: "#1C1C1A" }}
            />
            <span className={styles.collectionName}>
              {dict.blog.categories.allPosts}
            </span>
            <span className={styles.collectionBadge}>{blogPosts.length}</span>
          </button>
          {categories.map((cat) => {
            const count = grouped[cat]?.length ?? 0;
            if (!count) return null;
            return (
              <button
                key={cat}
                className={`${styles.collectionItem} ${activeCategory === cat ? styles.collectionItemActive : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                <span
                  className={styles.collectionDot}
                  style={{ background: collectionColors[cat] }}
                />
                <span className={styles.collectionName}>
                  {dict.blog.categories[cat as keyof typeof dict.blog.categories]}
                </span>
                <span className={styles.collectionBadge}>{count}</span>
              </button>
            );
          })}
        </div>

        <div className={styles.sidebarSection}>
          <div className={styles.sidebarHeading}>Filter</div>
          {(["recent", "oldest"] as const).map((filter) => (
            <button key={filter} className={styles.filterItem}>
              {filter === "recent" ? "Most Recent" : "Oldest First"}
            </button>
          ))}
        </div>
      </aside>

      <nav className={styles.pillStrip}>
        <button
          className={`${styles.pill} ${activeCategory === "allPosts" ? styles.pillActive : ""}`}
          onClick={() => setActiveCategory("allPosts")}
        >
          <span className={styles.pillDot} style={{ background: "#1C1C1A" }} />
          {dict.blog.categories.allPosts}
        </button>
        {categories.map((cat) => {
          const count = grouped[cat]?.length ?? 0;
          if (!count) return null;
          return (
            <button
              key={cat}
              className={`${styles.pill} ${activeCategory === cat ? styles.pillActive : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              <span
                className={styles.pillDot}
                style={{ background: collectionColors[cat] }}
              />
              {dict.blog.categories[cat as keyof typeof dict.blog.categories]}
            </button>
          );
        })}
      </nav>

      <main className={styles.main}>
        {visibleGroups.map(({ key, posts }, blockIdx) => {
          const catLabel =
            dict.blog.categories[key as keyof typeof dict.blog.categories] ??
            key;
          const color = collectionColors[key] ?? "#1C1C1A";
          const isWide = posts.length >= WIDE_THRESHOLD;

          return (
            <section
              key={key}
              className={styles.collectorBlock}
              style={{ animationDelay: `${blockIdx * 0.07}s` }}
            >
              <div className={styles.collectorHeader}>
                <span
                  className={styles.collectorDot}
                  style={{ background: color }}
                />
                <h2 className={styles.collectorTitle}>{catLabel}</h2>
                <span className={styles.collectorMeta}>
                  {posts.length} posts · Updated {latestDate(posts)}
                </span>
              </div>

              <div
                className={`${styles.postGrid} ${isWide ? styles.postGridWide : ""}`}
              >
                {posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/${locale}/blog/${post.slug}`}
                      className={styles.card}
                    >
                      <div className={styles.cardTopRow}>
                        <span className={styles.cardTag}>{catLabel}</span>
                        <span className={styles.cardDate}>{post.date}</span>
                      </div>
                      <h3 className={styles.cardTitle}>
                        {post.title[locale]}
                      </h3>
                      <p className={styles.cardExcerpt}>
                        {post.excerpt[locale]}
                      </p>
                      <div className={styles.cardFooter}>
                        <span className={styles.cardReadTime}>
                          {post.readTime} min read
                        </span>
                        <span className={styles.cardArrow}>→</span>
                      </div>
                    </Link>
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
