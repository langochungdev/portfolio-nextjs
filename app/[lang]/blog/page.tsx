"use client";

import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import {
  blogPosts,
  blogCategories,
  blogTopics,
  collectionColors,
} from "@/lib/mock/blog";
import type { BlogTopic } from "@/lib/mock/blog";
import styles from "@/app/style/blog/page.module.css";
import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { groupByCategory, buildDisplayItems, latestDate } from "./_lib/helpers";
import { PostCard } from "./_components/PostCard";
import { TopicAccordion } from "./_components/TopicAccordion";
import { PageViewTracker } from "@/app/[lang]/_shared/PageViewTracker";


export default function BlogPage() {
  const { locale, dictionary: dict } = useDictionary();
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeCategory = searchParams.get("cat") || "allPosts";
  const [openTopics, setOpenTopics] = useState<Set<string>>(new Set());
  const [pendingScroll, setPendingScroll] = useState<string | null>(null);
  const mainRef = useRef<HTMLElement>(null);

  const categories = blogCategories.filter((c) => c !== "allPosts");
  const grouped = useMemo(() => groupByCategory(blogPosts), []);
  const topicsByCat = useMemo(() => {
    const m: Record<string, BlogTopic[]> = {};
    for (const t of blogTopics) (m[t.category] ??= []).push(t);
    return m;
  }, []);

  useEffect(() => {
    if (!pendingScroll || activeCategory === "allPosts") return;
    requestAnimationFrame(() => {
      const el = document.getElementById(pendingScroll);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setOpenTopics((s) => new Set(s).add(pendingScroll));
      }
      setPendingScroll(null);
    });
  }, [pendingScroll, activeCategory]);

  const catLabel = (k: string) =>
    dict.blog.categories[k as keyof typeof dict.blog.categories] ?? k;

  const toggleTopic = (id: string) =>
    setOpenTopics((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const switchCategory = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === "allPosts") params.delete("cat");
    else params.set("cat", cat);
    const qs = params.toString();
    router.replace(`/${locale}/blog${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  return (
    <main className={styles.main} ref={mainRef}>
        <PageViewTracker page="blog" />
        {activeCategory === "allPosts"
          ? categories.filter((c) => grouped[c]?.length).map((cat, i) => {
              const posts = grouped[cat];
              const color = collectionColors[cat] ?? "#1C1C1A";
              const items = buildDisplayItems(posts, topicsByCat[cat] ?? []).slice(0, 4);
              return (
                <section key={cat} className={styles.collectorBlock}>
                  <div className={styles.collectorHeader}>
                    <span className={styles.collectorDot} style={{ background: color }} />
                    <h2 className={styles.collectorTitle}>{catLabel(cat)}</h2>
                    <span className={styles.collectorMeta}>
                      {posts.length} posts · Updated {latestDate(posts)}
                    </span>
                  </div>
                  <div className={styles.gridFive}>
                    {items.map((item) =>
                      item.type === "post" ? (
                        <PostCard key={item.post.id} post={item.post} locale={locale} label={catLabel(cat)} />
                      ) : (
                        <button
                          key={item.topic.id}
                          className={`${styles.card} ${styles.topicWrapCard}`}
                          onClick={() => { setPendingScroll(item.topic.id); switchCategory(cat); }}
                        >
                          <div className={styles.cardTopRow}>
                            <span className={`${styles.cardTag} ${styles.topicTag}`}>{dict.blog.topic}</span>
                            <span className={styles.cardDate}>{latestDate(item.posts)}</span>
                          </div>
                          <h3 className={styles.cardTitle}>{item.topic.title[locale]}</h3>
                          <p className={styles.cardExcerpt}>{item.topic.description[locale]}</p>
                          <div className={styles.cardFooter}>
                            <span className={styles.cardReadTime}>{item.posts.length} posts</span>
                            <span className={styles.cardArrow}>→</span>
                          </div>
                        </button>
                      ),
                    )}
                    <button
                      className={`${styles.card} ${styles.viewMoreCard}`}
                      onClick={() => { mainRef.current?.scrollTo(0, 0); switchCategory(cat); }}
                    >
                      <span className={styles.viewMoreLabel}>{dict.blog.viewMore}</span>
                      <span className={styles.viewMoreCat}>{catLabel(cat)}</span>
                      <span className={styles.viewMoreArrow}>→</span>
                    </button>
                  </div>
                </section>
              );
            })
          : (() => {
              const posts = grouped[activeCategory] ?? [];
              if (!posts.length) return null;
              const color = collectionColors[activeCategory] ?? "#1C1C1A";
              const topics = topicsByCat[activeCategory] ?? [];
              const inTopic = new Set(posts.filter((p) => p.topic).map((p) => p.id));
              const standalone = posts.filter((p) => !inTopic.has(p.id));
              return (
                <section className={styles.collectorBlock}>
                  <div className={styles.collectorHeader}>
                    <span className={styles.collectorDot} style={{ background: color }} />
                    <h2 className={styles.collectorTitle}>{catLabel(activeCategory)}</h2>
                    <span className={styles.collectorMeta}>
                      {posts.length} posts · Updated {latestDate(posts)}
                    </span>
                  </div>
                  {(() => {
                    const pinnedPosts = topics
                      .filter((t) => t.pinned)
                      .flatMap((t) => posts.filter((p) => p.topic === t.id));
                    const combined = [...pinnedPosts, ...standalone];
                    return combined.length > 0 ? (
                      <div className={styles.standaloneGrid}>
                        {combined.map((p) => (
                          <PostCard key={p.id} post={p} locale={locale} label={catLabel(activeCategory)} />
                        ))}
                      </div>
                    ) : null;
                  })()}
                  {topics.filter((t) => !t.pinned).map((t) => (
                    <TopicAccordion
                      key={t.id}
                      topic={t}
                      posts={posts}
                      isOpen={openTopics.has(t.id)}
                      locale={locale}
                      label={catLabel(activeCategory)}
                      onToggle={() => toggleTopic(t.id)}
                    />
                  ))}
                </section>
              );
            })()}
      </main>
  );
}
