"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { createPortal } from "react-dom";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import { useTheme } from "@/app/[lang]/_shared/useTheme";
import { CollectionSidebar } from "@/app/[lang]/_shared/CollectionSidebar";
import {
  closeRelated,
  subscribeRelated,
  getRelatedSnapshot,
  getRelatedServerSnapshot,
} from "@/app/[lang]/_shared/blogDetailStore";
import { blogPosts, blogCategories, blogTopics, collectionColors } from "@/lib/mock/blog";
import styles from "@/app/style/blog/detail.module.css";
import { useMemo, useSyncExternalStore, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const SunIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const MoonIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export default function BlogDetailPage() {
  const { locale, dictionary: dict } = useDictionary();
  const params = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === params.slug);
  const { theme, toggle: toggleTheme } = useTheme();
  const router = useRouter();
  const activeCategory = post?.category ?? "allPosts";
  const showRelated = useSyncExternalStore(
    subscribeRelated,
    getRelatedSnapshot,
    getRelatedServerSnapshot
  );
  const overlayRef = useRef<HTMLDivElement>(null);

  const categories = blogCategories.filter((c) => c !== "allPosts");
  const catLabel = (k: string) =>
    dict.blog.categories[k as keyof typeof dict.blog.categories] ?? k;
  const categoryCounts = Object.fromEntries(
    categories.map((c) => [c, blogPosts.filter((p) => p.category === c).length])
  );
  const collectionItems = categories.map((cat) => ({
    key: cat,
    label: catLabel(cat),
    color: collectionColors[cat] ?? "#1C1C1A",
    count: categoryCounts[cat] ?? 0,
  }));

  const handleCategoryChange = (cat: string) => {
    const qs = cat === "allPosts" ? "" : `?cat=${cat}`;
    router.push(`/${locale}/blog${qs}`);
  };

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

  useEffect(() => {
    return () => closeRelated();
  }, []);

  useEffect(() => {
    if (!showRelated) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Element;
      if (target.closest(".bottom-bar")) return;
      if (overlayRef.current && !overlayRef.current.contains(target)) {
        closeRelated();
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [showRelated]);

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

  const postCatLabel =
    dict.blog.categories[post.category as keyof typeof dict.blog.categories] ?? post.category;
  const color = collectionColors[post.category] ?? post.color;

  return (
    <div className={styles.shell}>
      <div className={styles.desktopActions}>
        <button className={styles.desktopThemeBtn} onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "light" ? SunIcon : MoonIcon}
        </button>
      </div>

      <CollectionSidebar
        locale={locale}
        activeKey={activeCategory}
        onSelect={handleCategoryChange}
        allKey="allPosts"
        allLabel={catLabel("allPosts")}
        allCount={blogPosts.length}
        items={collectionItems}
        className={styles.collectionWrap}
        filters={[
          { key: "recent", label: "Most Recent" },
          { key: "oldest", label: "Oldest First" },
        ]}
      />

      <aside className={styles.sidebar}>
        <Link href={`/${locale}/blog?cat=${post.category}`} className={styles.sidebarBack}>
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
            {sidebarData?.type === "topic" ? `${sidebarData.posts.length} posts` : postCatLabel}
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
            <span className={styles.tag}>{postCatLabel}</span>
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

      {showRelated && sidebarData &&
        createPortal(
          <div ref={overlayRef} className={styles.relatedOverlay}>
            {sidebarData.type === "topic" && (
              <div className={styles.relatedHeading}>
                {sidebarData.topic.title[locale]}
              </div>
            )}
            {sidebarData.posts.map((p, i) => (
              <Link
                key={p.id}
                href={`/${locale}/blog/${p.slug}`}
                className={`${styles.relatedItem} ${p.slug === post.slug ? styles.relatedItemActive : ""}`}
                onClick={() => closeRelated()}
              >
                <span className={styles.relatedIndex}>{i + 1}</span>
                <span>{p.title[locale]}</span>
              </Link>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
