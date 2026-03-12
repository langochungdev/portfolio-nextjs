"use client";

import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import { useBlogData } from "./_lib/BlogDataProvider";
import { getExcerpt } from "./_lib/types";
import styles from "@/app/style/blog/page.module.css";
import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { groupByCollection, buildDisplayItems, latestDate } from "./_lib/helpers";
import { PostCard } from "./_components/PostCard";
import { TopicAccordion } from "./_components/TopicAccordion";
import { PageViewTracker } from "@/app/[lang]/_shared/PageViewTracker";


export default function BlogPage() {
  const { locale, dictionary: dict } = useDictionary();
  const { collections, topics, posts, loading } = useBlogData();
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeCategory = searchParams.get("cat") || "allPosts";
  const [openTopics, setOpenTopics] = useState<Set<string>>(new Set());
  const [pendingScroll, setPendingScroll] = useState<string | null>(null);
  const mainRef = useRef<HTMLElement>(null);

  const grouped = useMemo(() => groupByCollection(posts), [posts]);
  const topicsByCollection = useMemo(() => {
    const m: Record<string, typeof topics> = {};
    for (const t of topics) (m[t.collectionId] ??= []).push(t);
    return m;
  }, [topics]);

  const collectionMap = useMemo(() => {
    const m: Record<string, (typeof collections)[0]> = {};
    for (const c of collections) m[c.id] = c;
    return m;
  }, [collections]);

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

  const colLabel = (id: string) => collectionMap[id]?.name ?? id;
  const colColor = (id: string) => collectionMap[id]?.color ?? "#1C1C1A";

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

  if (loading) {
    return <main className={styles.main} ref={mainRef}><PageViewTracker page="blog" /></main>;
  }

  return (
    <main className={styles.main} ref={mainRef}>
        <PageViewTracker page="blog" />
        {activeCategory === "allPosts"
          ? collections.filter((c) => grouped[c.id]?.length).map((col) => {
              const colPosts = grouped[col.id];
              const items = buildDisplayItems(colPosts, topicsByCollection[col.id] ?? []).slice(0, 4);
              return (
                <section key={col.id} className={styles.collectorBlock}>
                  <div className={styles.collectorHeader}>
                    <span className={styles.collectorDot} style={{ background: col.color }} />
                    <h2 className={styles.collectorTitle}>{col.name}</h2>
                    <span className={styles.collectorMeta}>
                      {colPosts.length} posts · Updated {latestDate(colPosts)}
                    </span>
                  </div>
                  <div className={styles.gridFive}>
                    {items.map((item) =>
                      item.type === "post" ? (
                        <PostCard key={item.post.id} post={item.post} locale={locale} label={col.name} />
                      ) : (
                        <button
                          key={item.topic.id}
                          className={`${styles.card} ${styles.topicWrapCard}`}
                          onClick={() => { setPendingScroll(item.topic.id); switchCategory(col.id); }}
                        >
                          <div className={styles.cardTopRow}>
                            <span className={`${styles.cardTag} ${styles.topicTag}`}>{dict.blog.topic}</span>
                            <span className={styles.cardDate}>{latestDate(item.posts)}</span>
                          </div>
                          <h3 className={styles.cardTitle}>{item.topic.name}</h3>
                          <p className={styles.cardExcerpt}>
                            {item.posts[0] ? getExcerpt(item.posts[0].content) : ""}
                          </p>
                          <div className={styles.cardFooter}>
                            <span className={styles.cardReadTime}>{item.posts.length} posts</span>
                            <span className={styles.cardArrow}>→</span>
                          </div>
                        </button>
                      ),
                    )}
                    <button
                      className={`${styles.card} ${styles.viewMoreCard}`}
                      onClick={() => { mainRef.current?.scrollTo(0, 0); switchCategory(col.id); }}
                    >
                      <span className={styles.viewMoreLabel}>{dict.blog.viewMore}</span>
                      <span className={styles.viewMoreCat}>{col.name}</span>
                      <span className={styles.viewMoreArrow}>→</span>
                    </button>
                  </div>
                </section>
              );
            })
          : (() => {
              const colPosts = grouped[activeCategory] ?? [];
              if (!colPosts.length) return null;
              const color = colColor(activeCategory);
              const colTopics = topicsByCollection[activeCategory] ?? [];
              const pinnedPosts = colPosts.filter((p) => p.isPinned);
              const inTopic = new Set(colPosts.filter((p) => p.topicIds.length > 0).map((p) => p.id));
              const standalone = colPosts.filter((p) => !inTopic.has(p.id) && !p.isPinned);
              const combined = [...pinnedPosts, ...standalone];
              return (
                <section className={styles.collectorBlock}>
                  <div className={styles.collectorHeader}>
                    <span className={styles.collectorDot} style={{ background: color }} />
                    <h2 className={styles.collectorTitle}>{colLabel(activeCategory)}</h2>
                    <span className={styles.collectorMeta}>
                      {colPosts.length} posts · Updated {latestDate(colPosts)}
                    </span>
                  </div>
                  {combined.length > 0 && (
                    <div className={styles.standaloneGrid}>
                      {combined.map((p) => (
                        <PostCard key={p.id} post={p} locale={locale} label={colLabel(activeCategory)} />
                      ))}
                    </div>
                  )}
                  {colTopics.map((t) => (
                    <TopicAccordion
                      key={t.id}
                      topic={t}
                      posts={colPosts.filter((p) => !p.isPinned)}
                      isOpen={openTopics.has(t.id)}
                      locale={locale}
                      label={colLabel(activeCategory)}
                      onToggle={() => toggleTopic(t.id)}
                    />
                  ))}
                </section>
              );
            })()}
      </main>
  );
}
