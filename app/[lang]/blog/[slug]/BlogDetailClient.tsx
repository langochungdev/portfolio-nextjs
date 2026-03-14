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
import { useVisitor } from "@/lib/visitor/VisitorProvider";
import { useBlogData } from "@/app/[lang]/blog/_lib/BlogDataProvider";
import type { PostDoc } from "@/app/[lang]/blog/_lib/types";
import TipsFeed from "@/app/[lang]/blog/_components/TipsFeed";
import { fetchHintsCount } from "@/lib/firebase/hints";
import { trackPostView } from "@/lib/firebase/analytics";
import styles from "@/app/style/blog/detail.module.css";
import tipsStyles from "@/app/style/blog/tips.module.css";
import { useMemo, useState, useSyncExternalStore, useEffect, useRef } from "react";
import hljs from "highlight.js/lib/core";
import plaintext from "highlight.js/lib/languages/plaintext";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import java from "highlight.js/lib/languages/java";
import python from "highlight.js/lib/languages/python";
import go from "highlight.js/lib/languages/go";
import sql from "highlight.js/lib/languages/sql";
import markdown from "highlight.js/lib/languages/markdown";

let highlightRegistered = false;

function syncCodeBlockWidthParity(root: HTMLElement): void {
  const wraps = root.querySelectorAll(".code-block-wrap");

  wraps.forEach((wrap) => {
    const wrapEl = wrap as HTMLElement;
    const inner = wrapEl.firstElementChild;
    if (!(inner instanceof HTMLElement)) return;

    const pre = inner.querySelector("pre");
    if (!(pre instanceof HTMLElement)) return;

    const overflow = pre.scrollWidth - pre.clientWidth;
    if (overflow <= 1) return;

    const currentWidth = inner.getBoundingClientRect().width;
    const maxWidth = wrapEl.getBoundingClientRect().width;
    if (!Number.isFinite(currentWidth) || !Number.isFinite(maxWidth) || maxWidth <= 0) return;
    if (currentWidth >= maxWidth - 1) return;

    // Only patch small visual mismatches so intentional narrow code blocks keep their behavior.
    const delta = Math.ceil(overflow + 2);
    if (delta > 48) return;

    const nextWidth = Math.min(Math.ceil(maxWidth), Math.ceil(currentWidth + delta));
    if (nextWidth <= currentWidth + 0.5) return;

    inner.style.width = `${nextWidth}px`;
    inner.style.maxWidth = "100%";
  });
}

function registerHighlightLanguages(): void {
  if (highlightRegistered) return;
  hljs.registerLanguage("plaintext", plaintext);
  hljs.registerLanguage("javascript", javascript);
  hljs.registerLanguage("typescript", typescript);
  hljs.registerLanguage("xml", xml);
  hljs.registerLanguage("css", css);
  hljs.registerLanguage("json", json);
  hljs.registerLanguage("bash", bash);
  hljs.registerLanguage("java", java);
  hljs.registerLanguage("python", python);
  hljs.registerLanguage("go", go);
  hljs.registerLanguage("sql", sql);
  hljs.registerLanguage("markdown", markdown);
  highlightRegistered = true;
}

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

  const getNumberAttr = (attrs: string, name: string, fallback: number): number => {
    const pattern = new RegExp(`${name}="([\\d.]+)"`);
    const match = attrs.match(pattern);
    const value = match?.[1] ? Number(match[1]) : NaN;
    return Number.isFinite(value) ? value : fallback;
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

  const getCodeBlockWrapStyle = (align: "left" | "right" | "center"): string => {
    const justifyContent = align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center";
    return `display:flex;justify-content:${justifyContent};width:100%;margin:0.75rem 0;clear:both;`;
  };

  const getCodeBlockInnerStyle = (width?: string | null): string => {
    if (!width) {
      return "position:relative;width:100%;max-width:100%;";
    }
    return `position:relative;width:min(100%,${width}px);max-width:100%;`;
  };

  const getCodeBlockWidth = (attrs: string): string | null => {
    const dataWidth = getNumberAttr(attrs, "data-width", 0);
    if (dataWidth > 0) return String(Math.round(dataWidth));

    const widthAttr = attrs.match(/\bwidth="(\d+)"/);
    if (widthAttr?.[1]) return widthAttr[1];

    const styleWidth = attrs.match(/style="[^"]*\bwidth\s*:\s*(\d+)px[^"]*"/);
    if (styleWidth?.[1]) return styleWidth[1];

    return null;
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
        const radius = getNumberAttr(attrs, "data-radius", 8);
        const cropMode = /data-crop-mode="true"/.test(attrs);
        const cropX = getNumberAttr(attrs, "data-crop-x", 50);
        const cropY = getNumberAttr(attrs, "data-crop-y", 50);
        const cropScale = getNumberAttr(attrs, "data-crop-scale", 1);
        const cropHeight = getNumberAttr(attrs, "data-crop-height", 220);
        const imgStyle = cropMode
          ? ` style="display:block;width:100%;height:${cropHeight}px;object-fit:cover;object-position:${cropX}% ${cropY}%;transform:scale(${cropScale});transform-origin:${cropX}% ${cropY}%;border-radius:${radius}px;"`
          : ` style="border-radius:${radius}px;"`;
        const cropClass = cropMode ? ` class="cropped-media-image"` : "";

        if (alt || width) {
          const figStyle = getInnerWidthStyle(width);
          const figcaption = alt ? `<figcaption>${alt}</figcaption>` : "";
          return `<div style="${alignStyle}"><figure${figStyle}><img ${attrs}${cropClass}${imgStyle}>${figcaption}</figure></div>`;
        }
        return `<div style="${alignStyle}"><img ${attrs}${cropClass}${imgStyle}></div>`;
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
    .replace(
      /<pre\b([^>]*)>([\s\S]*?)<\/pre>/g,
      (_match, attrs: string, inner: string) => {
        const align = getAlign(attrs);
        const width = getCodeBlockWidth(attrs);
        const wrapStyle = getCodeBlockWrapStyle(align);
        const innerStyle = getCodeBlockInnerStyle(width);
        return `<div class="code-block-wrap" style="${wrapStyle}"><div style="${innerStyle}"><button type="button" class="code-copy-btn" data-copy-code>Copy</button><pre${attrs}>${inner}</pre></div></div>`;
      }
    )
    .replace(/<p><\/p>/g, "<p><br></p>");
}

export default function BlogDetailClient({ initialPost }: { initialPost: PostDoc | null }) {
  const { locale, dictionary: dict } = useDictionary();
  const { visitorId, viewedPostIds, viewedPostSlugs } = useVisitor();
  const { collections, topics, posts } = useBlogData();
  const post = initialPost;
  const [showTips, setShowTips] = useState(false);
  const [tipsCount, setTipsCount] = useState(0);
  const showRelated = useSyncExternalStore(
    subscribeRelated,
    getRelatedSnapshot,
    getRelatedServerSnapshot
  );
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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
    if (!post?.id) return;
    trackPostView(post.id, visitorId);
  }, [post?.id, visitorId]);

  useEffect(() => {
    let cancelled = false;
    if (!post) {
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

  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;

    const handleCopyClick = (event: Event) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest("[data-copy-code]") as HTMLButtonElement | null;
      if (!button) return;

      const codeEl = button.parentElement?.querySelector("pre code");
      const text = codeEl?.textContent ?? "";
      if (!text.trim()) return;
      if (!navigator.clipboard?.writeText) {
        button.textContent = "Unsupported";
        window.setTimeout(() => {
          button.textContent = "Copy";
        }, 1200);
        return;
      }

      navigator.clipboard.writeText(text)
        .then(() => {
          const old = button.textContent;
          button.textContent = "Copied";
          window.setTimeout(() => {
            button.textContent = old;
          }, 1200);
        })
        .catch(() => {
          button.textContent = "Failed";
          window.setTimeout(() => {
            button.textContent = "Copy";
          }, 1200);
        });
    };

    root.addEventListener("click", handleCopyClick);
    return () => {
      root.removeEventListener("click", handleCopyClick);
    };
  }, [post?.id]);

  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;

    registerHighlightLanguages();

    const run = () => {
      const blocks = root.querySelectorAll("pre code");
      blocks.forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
      syncCodeBlockWidthParity(root);
    };

    run();
    window.addEventListener("resize", run);

    return () => {
      window.removeEventListener("resize", run);
    };
  }, [post?.id]);

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
  const viewedText = locale === "vi" ? "Đã xem" : "Viewed";
  const isViewed =
    viewedPostIds.includes(post.id) || viewedPostSlugs.includes(post.slug);

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
            {isViewed && <span className={styles.viewedPost}>{viewedText}</span>}
            <span className={styles.dot} style={{ background: color }} />
            <time className={styles.date}>{post.createdAt}</time>
            <span className={styles.readTime}>· {post.readTime} min read</span>
          </div>

          <h1 className={styles.title}>{post.title}</h1>

          <div ref={contentRef} className={styles.content} dangerouslySetInnerHTML={{ __html: processContent(post.content) }} />
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
