"use client";

import { useState, useRef, useEffect } from "react";
import { blogHints, blogTopics, type BlogHint } from "@/lib/mock/blog";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import styles from "@/app/style/blog/tips.module.css";

const ITEMS_PER_PAGE = 4;

const TYPE_LABELS: Record<BlogHint["type"], { vi: string; en: string }> = {
  tip: { vi: "Mẹo", en: "Tip" },
  hint: { vi: "Gợi ý", en: "Hint" },
  note: { vi: "Ghi chú", en: "Note" },
};

const TYPE_COLORS: Record<BlogHint["type"], string> = {
  tip: "#3B82F6",
  hint: "#10B981",
  note: "#F59E0B",
};

function formatRelativeTime(dateStr: string, locale: "vi" | "en"): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) {
    return new Date(dateStr).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
      day: "numeric",
      month: "short",
    });
  }
  if (days > 0) return locale === "vi" ? `${days} ngày trước` : `${days}d ago`;
  if (hours > 0) return locale === "vi" ? `${hours} giờ trước` : `${hours}h ago`;
  if (minutes > 0) return locale === "vi" ? `${minutes} phút trước` : `${minutes}m ago`;
  return locale === "vi" ? "Vừa xong" : "Just now";
}

interface TipsFeedProps {
  topicId?: string;
  onBack: () => void;
}

export default function TipsFeed({ topicId, onBack }: TipsFeedProps) {
  const { locale } = useDictionary();
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const allHints = topicId
    ? blogHints.filter((h) => h.topicId === topicId)
    : blogHints;

  const topic = topicId ? blogTopics.find((t) => t.id === topicId) : null;
  const visibleHints = allHints.slice(0, visibleCount);
  const hasMore = visibleCount < allHints.length;

  const loadMore = () => {
    setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, allHints.length));
  };

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <div className={styles.feed}>
      <header className={styles.feedHeader}>
        <button type="button" className={styles.backBtn} onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className={styles.feedHeaderInfo}>
          <h2 className={styles.feedTitle}>Tips & Hints</h2>
          {topic && (
            <span className={styles.feedTopic}>{topic.title[locale]}</span>
          )}
        </div>
        <span className={styles.feedCount}>{allHints.length}</span>
      </header>

      <div className={styles.feedList}>
        {visibleHints.map((hint) => (
          <article key={hint.id} className={styles.hintCard}>
            <div className={styles.hintTop}>
              <div className={styles.hintAvatar}>
                {hint.author.charAt(0).toUpperCase()}
              </div>
              <div className={styles.hintMeta}>
                <span className={styles.hintAuthor}>{hint.author}</span>
                <span className={styles.hintTime}>
                  {formatRelativeTime(hint.createdAt, locale)}
                </span>
              </div>
              <span
                className={styles.hintType}
                style={{ color: TYPE_COLORS[hint.type] }}
              >
                {TYPE_LABELS[hint.type][locale]}
              </span>
            </div>

            <h3 className={styles.hintTitle}>{hint.title}</h3>
            <p className={styles.hintContent}>{hint.content}</p>

            <div className={styles.hintActions}>
              <button type="button" className={styles.hintAction}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3.5V12.5M3.5 8H12.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </button>
              <button type="button" className={styles.hintAction}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2.5 5.5L8 11L13.5 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button type="button" className={styles.hintAction}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="4" cy="8" r="1" fill="currentColor" />
                  <circle cx="8" cy="8" r="1" fill="currentColor" />
                  <circle cx="12" cy="8" r="1" fill="currentColor" />
                </svg>
              </button>
            </div>
          </article>
        ))}

        {hasMore && <div ref={sentinelRef} className={styles.sentinel} />}

        {!hasMore && allHints.length > 0 && (
          <div className={styles.feedEnd}>
            {locale === "vi" ? "Đã hết tips" : "No more tips"}
          </div>
        )}
      </div>
    </div>
  );
}
