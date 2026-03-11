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
import { useBlogData } from "@/app/[lang]/blog/_lib/BlogDataProvider";
import { getReadTime } from "@/app/[lang]/blog/_lib/types";
import TipsFeed from "@/app/[lang]/blog/_components/TipsFeed";
import styles from "@/app/style/blog/detail.module.css";
import tipsStyles from "@/app/style/blog/tips.module.css";
import { useMemo, useState, useSyncExternalStore, useEffect, useRef } from "react";

export default function BlogDetailClient() {
  const { locale, dictionary: dict } = useDictionary();
  const params = useParams<{ slug: string }>();
  const { collections, topics, posts, hints, loading } = useBlogData();
  const post = posts.find((p) => p.slug === params.slug);
  const [showTips, setShowTips] = useState(false);
  const showRelated = useSyncExternalStore(
    subscribeRelated,
    getRelatedSnapshot,
    getRelatedServerSnapshot
  );
  const overlayRef = useRef<HTMLDivElement>(null);

  const collection = post
    ? collections.find((c) => c.id === post.collectionId)
    : null;

  const sidebarData = useMemo(() => {
    if (!post) return null;
    const topic = post.topicId ? topics.find((t) => t.id === post.topicId) : null;
    if (topic) {
      const topicPosts = posts.filter((p) => p.topicId === topic.id);
      return { type: "topic" as const, topic, posts: topicPosts };
    }
    const colPosts = posts.filter((p) => p.collectionId === post.collectionId);
    return { type: "collection" as const, posts: colPosts };
  }, [post, topics, posts]);

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

  if (loading) {
    return <main className={styles.main} />;
  }

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

  const postColLabel = collection?.name ?? "";
  const color = collection?.color ?? "#1C1C1A";

  const currentTopicId = post.topicId || undefined;
  const tipsCount = currentTopicId
    ? hints.filter((h) => h.topicId === currentTopicId).length
    : hints.length;

  return (
    <>
      <aside className={styles.sidebar}>
        <Link href={`/${locale}/blog?cat=${post.collectionId}`} className={styles.sidebarBack}>
          ← {dict.blog.backToBlog}
        </Link>

        {sidebarData?.type === "topic" && (
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarHeading}>{dict.blog.topic}</div>
            <div className={styles.topicLabel}>{sidebarData.topic.name}</div>
          </div>
        )}

        <div className={styles.sidebarSection}>
          <div className={styles.sidebarHeading}>
            {sidebarData?.type === "topic" ? `${sidebarData.posts.length} posts` : postColLabel}
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
                <span className={styles.sidebarItemText}>{p.title}</span>
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
            <span className={styles.tag}>{postColLabel}</span>
            <span className={styles.dot} style={{ background: color }} />
            <time className={styles.date}>{post.createdAt}</time>
            <span className={styles.readTime}>· {getReadTime(post.content)} min read</span>
          </div>

          <h1 className={styles.title}>{post.title}</h1>

          <div className={styles.content} dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
        </main>
      )}

      {showRelated && sidebarData &&
        createPortal(
          <div ref={overlayRef} className={styles.relatedOverlay}>
            {sidebarData.type === "topic" && (
              <div className={styles.relatedHeading}>
                {sidebarData.topic.name}
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
                <span>{p.title}</span>
              </Link>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
