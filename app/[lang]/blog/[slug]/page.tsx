"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { createPortal } from "react-dom";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import {
  closeRelated,
  subscribeRelated,
  getRelatedSnapshot,
  getRelatedServerSnapshot,
} from "@/app/[lang]/_shared/blogDetailStore";
import { blogPosts, blogTopics, blogHints, collectionColors } from "@/lib/mock/blog";
import TipsFeed from "@/app/[lang]/blog/_components/TipsFeed";
import styles from "@/app/style/blog/detail.module.css";
import tipsStyles from "@/app/style/blog/tips.module.css";
import { useMemo, useState, useSyncExternalStore, useEffect, useRef } from "react";

export default function BlogDetailPage() {
  const { locale, dictionary: dict } = useDictionary();
  const params = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === params.slug);
  const [showTips, setShowTips] = useState(false);
  const showRelated = useSyncExternalStore(
    subscribeRelated,
    getRelatedSnapshot,
    getRelatedServerSnapshot
  );
  const overlayRef = useRef<HTMLDivElement>(null);

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
      <div className={styles.notFound}>
        <h1>{dict.blog.notFound}</h1>
        <Link href={`/${locale}/blog`} className={styles.sidebarBack}>
          ← {dict.blog.backToBlog}
        </Link>
      </div>
    );
  }

  const postCatLabel =
    dict.blog.categories[post.category as keyof typeof dict.blog.categories] ?? post.category;
  const color = collectionColors[post.category] ?? post.color;

  const currentTopicId = post.topic ?? undefined;
  const tipsCount = currentTopicId
    ? blogHints.filter((h) => h.topicId === currentTopicId).length
    : blogHints.length;

  return (
    <>
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
                onClick={() => setShowTips(false)}
              >
                {sidebarData.type === "topic" && (
                  <span className={styles.sidebarIndex}>{i + 1}</span>
                )}
                <span className={styles.sidebarItemText}>{p.title[locale]}</span>
              </Link>
            ))}
          </div>
        </div>

        {tipsCount > 0 && (
          <button
            type="button"
            className={tipsStyles.tipsBtn}
            onClick={() => setShowTips(true)}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1.5C4.1 1.5 1.75 3.85 1.75 6.75C1.75 8.05 2.25 9.22 3.07 10.1L2.5 12.5L5.05 11.7C5.64 11.92 6.3 12.04 7 12.04C9.9 12.04 12.25 9.69 12.25 6.79C12.25 3.89 9.9 1.5 7 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Tips & Hints ({tipsCount})
          </button>
        )}
      </aside>

      {showTips ? (
        <TipsFeed topicId={currentTopicId} onBack={() => setShowTips(false)} />
      ) : (
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
      )}

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
    </>
  );
}
