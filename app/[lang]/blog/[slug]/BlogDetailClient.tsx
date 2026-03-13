"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import {
  closeRelated,
  subscribeRelated,
  getRelatedSnapshot,
  getRelatedServerSnapshot,
} from "@/app/[lang]/_shared/blogDetailStore";
import { useBlogData } from "@/app/[lang]/blog/_lib/BlogDataProvider";
import type { PostDoc } from "@/app/[lang]/blog/_lib/types";
import TipsFeed from "@/app/[lang]/blog/_components/TipsFeed";
import { fetchHintsCount } from "@/lib/firebase/hints";
import styles from "@/app/style/blog/detail.module.css";
import tipsStyles from "@/app/style/blog/tips.module.css";
import { useMemo, useState, useSyncExternalStore, useEffect, useRef } from "react";

function processContent(html: string): string {
  const getAlign = (attrs: string): "left" | "right" | "center" => {
    const match = attrs.match(/data-align="(left|right|center)"/);
    if (match?.[1] === "left" || match?.[1] === "right" || match?.[1] === "center") {
      return match[1];
    }
    return "center";
  };

  const getWidth = (attrs: string): string | null => {
    const match = attrs.match(/width="(\d+)"/);
    return match?.[1] ?? null;
  };

  const getFloatWrapStyle = (align: "left" | "right" | "center", width?: string | null): string => {
    if (align === "left") {
      return `display:block;float:left;margin-right:1rem;margin-bottom:0.5rem;${width ? `width:min(100%,${width}px);` : "max-width:100%;"}`;
    }
    if (align === "right") {
      return `display:block;float:right;margin-left:1rem;margin-bottom:0.5rem;${width ? `width:min(100%,${width}px);` : "max-width:100%;"}`;
    }
    return "display:flex;justify-content:center;width:100%;margin:0.75rem 0;";
  };

  const getInnerWidthStyle = (width?: string | null): string => {
    if (!width) return "";
    return ` style=\"max-width:${width}px;width:min(100%,${width}px)\"`;
  };

  return html
    .replace(
      /<img\s([^>]*)>/g,
      (_match, attrs: string) => {
        const align = getAlign(attrs);
        const width = getWidth(attrs);
        const altMatch = attrs.match(/alt="([^"]*)"/);
        const alt = altMatch?.[1];
        const alignStyle = getFloatWrapStyle(align, width);

        if (alt || width) {
          const figStyle = getInnerWidthStyle(width);
          const figcaption = alt ? `<figcaption>${alt}</figcaption>` : "";
          return `<div style="${alignStyle}"><figure${figStyle}><img ${attrs}>${figcaption}</figure></div>`;
        }
        return `<div style="${alignStyle}"><img ${attrs}></div>`;
      }
    )
    .replace(
      /<video\s([^>]*)><\/video>/g,
      (_match, attrs: string) => {
        const align = getAlign(attrs);
        const altMatch = attrs.match(/alt="([^"]*)"/);
        const width = getWidth(attrs);
        const alt = altMatch?.[1];
        const wrapStyle = getFloatWrapStyle(align, width);
        const figStyle = getInnerWidthStyle(width);
        const figcaption = alt ? `<figcaption>${alt}</figcaption>` : "";
        return `<div style="${wrapStyle}"><figure class="media-figure"${figStyle}><video ${attrs}></video>${figcaption}</figure></div>`;
      }
    )
    .replace(
      /<audio\s([^>]*)><\/audio>/g,
      (_match, attrs: string) => {
        const align = getAlign(attrs);
        const wrapStyle = getFloatWrapStyle(align, null);
        const altMatch = attrs.match(/alt="([^"]*)"/);
        const alt = altMatch?.[1];
        const figcaption = alt ? `<figcaption>${alt}</figcaption>` : "";
        return `<div style="${wrapStyle}"><figure class="media-figure audio-figure"><audio ${attrs}></audio>${figcaption}</figure></div>`;
      }
    )
    .replace(
      /<div class="iframe-wrapper">\s*<iframe\s([^>]*)><\/iframe>\s*<\/div>/g,
      (_match, attrs: string) => {
        const align = getAlign(attrs);
        const width = getWidth(attrs);
        const wrapStyle = getFloatWrapStyle(align, width);
        return `<div class="iframe-wrapper" style="${wrapStyle}"><iframe ${attrs}></iframe></div>`;
      }
    )
    .replace(
      /<div class="file-preview">\s*<iframe\s([^>]*)><\/iframe>\s*<\/div>/g,
      (_match, attrs: string) => {
        const align = getAlign(attrs);
        const width = getWidth(attrs);
        const wrapStyle = getFloatWrapStyle(align, width);
        return `<div class="file-preview" style="${wrapStyle}"><iframe ${attrs}></iframe></div>`;
      }
    )
    .replace(
      /<a\s([^>]*data-file-src[^>]*)>([\s\S]*?)<\/a>/g,
      (_match, attrs: string, inner: string) => {
        const align = getAlign(attrs);
        const wrapStyle = getFloatWrapStyle(align, null);
        return `<div style="${wrapStyle}"><a ${attrs}>${inner}</a></div>`;
      }
    )
    .replace(/<p><\/p>/g, "<p><br></p>");
}

export default function BlogDetailClient({ initialPost }: { initialPost: PostDoc | null }) {
  const { locale, dictionary: dict } = useDictionary();
  const { collections, topics, posts, loading } = useBlogData();
  const post = initialPost;
  const [showTips, setShowTips] = useState(false);
  const [tipsCount, setTipsCount] = useState(0);
  const showRelated = useSyncExternalStore(
    subscribeRelated,
    getRelatedSnapshot,
    getRelatedServerSnapshot
  );
  const overlayRef = useRef<HTMLDivElement>(null);

  const collection = post
    ? collections.find((c) => post.collectionIds.includes(c.id))
    : null;

  const sidebarData = useMemo(() => {
    if (!post) return null;
    const topic = post.topicIds.length > 0 ? topics.find((t) => post.topicIds.includes(t.id)) : null;
    if (topic) {
      const topicPosts = posts.filter((p) => p.topicIds.includes(topic.id));
      return { type: "topic" as const, topic, posts: topicPosts };
    }
    const primaryColId = post.collectionIds[0];
    const colPosts = primaryColId ? posts.filter((p) => p.collectionIds.includes(primaryColId)) : [];
    return { type: "collection" as const, posts: colPosts };
  }, [post, topics, posts]);

  useEffect(() => {
    return () => closeRelated();
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!post) {
      setTipsCount(0);
      return;
    }

    const currentTopicId = post.topicIds[0] || undefined;
    fetchHintsCount(currentTopicId)
      .then((count) => {
        if (!cancelled) setTipsCount(count);
      })
      .catch(() => {
        if (!cancelled) setTipsCount(0);
      });

    return () => {
      cancelled = true;
    };
  }, [post]);

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

  const currentTopicId = post.topicIds[0] || undefined;

  return (
    <>
      <aside className={styles.sidebar}>
        <Link href={`/${locale}/blog?cat=${post.collectionIds[0] ?? ""}`} className={styles.sidebarBack}>
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
            <span className={styles.readTime}>· {post.readTime} min read</span>
          </div>

          <h1 className={styles.title}>{post.title}</h1>

          <div className={styles.content} dangerouslySetInnerHTML={{ __html: processContent(post.content) }} />
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
