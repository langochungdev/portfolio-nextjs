import type { Metadata } from "next";
import Link from "next/link";
import { fetchTopicBySlug } from "@/lib/firebase/collections";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { i18nConfig, type Locale } from "@/lib/i18n/config";
import { getBlogData } from "./_lib/getBlogData";
import { assignCollectionColors } from "./_lib/types";
import { groupByCollection, buildDisplayItems, latestDate } from "./_lib/helpers";
import { PostCard } from "./_components/PostCard";
import { TopicAccordionGroup } from "./_components/TopicAccordionGroup";
import { PageViewTracker } from "@/app/[lang]/_shared/PageViewTracker";
import styles from "@/app/style/blog/page.module.css";

interface Props {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ cat?: string; topic?: string; open?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { lang } = await params;
  const { topic: topicSlug } = await searchParams;
  const baseUrl = `https://langochung.me/${lang}/blog`;

  if (topicSlug) {
    try {
      const topic = await fetchTopicBySlug(topicSlug);
      if (topic && (topic.description || topic.thumbnail)) {
        const title = `${topic.name} - Blog`;
        const description = topic.description || `Bài viết về ${topic.name}`;
        const meta: Metadata = {
          title,
          description,
          alternates: { canonical: `${baseUrl}?topic=${topicSlug}` },
          openGraph: {
            title,
            description,
            type: "website",
            url: `${baseUrl}?topic=${topicSlug}`,
            siteName: "langochungdev",
          },
          twitter: {
            card: "summary_large_image",
            title,
            description,
          },
        };
        if (topic.thumbnail) {
          meta.openGraph!.images = [{ url: topic.thumbnail }];
          meta.twitter!.images = [topic.thumbnail];
        }
        return meta;
      }
    } catch { /* fall through to default */ }
  }

  return { title: "Blog" };
}

export default async function BlogPage({ params, searchParams }: Props) {
  const { lang } = await params;
  const { cat, open } = await searchParams;
  const locale = i18nConfig.locales.includes(lang as Locale)
    ? (lang as Locale)
    : i18nConfig.defaultLocale;
  const dict = await getDictionary(locale);
  const { collections: rawCols, topics, posts } = await getBlogData();
  const collections = assignCollectionColors(rawCols);

  const activeCategory = cat || "allPosts";
  const grouped = groupByCollection(posts);

  const topicsByCollection: Record<string, typeof topics> = {};
  for (const t of topics) (topicsByCollection[t.collectionId] ??= []).push(t);

  const collectionMap: Record<string, (typeof collections)[0]> = {};
  for (const c of collections) collectionMap[c.id] = c;

  const topicNameById: Record<string, string> = {};
  for (const topic of topics) topicNameById[topic.id] = topic.name;

  const colLabel = (id: string) => collectionMap[id]?.name ?? id;
  const colColor = (id: string) => collectionMap[id]?.color ?? "#1C1C1A";

  return (
    <main className={styles.main}>
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
                      <PostCard
                        key={item.post.id}
                        post={item.post}
                        locale={locale}
                        label={col.name}
                        topicLabel={item.post.topicIds[0] ? topicNameById[item.post.topicIds[0]] : undefined}
                      />
                    ) : (
                      (() => {
                        const topicDate = latestDate(item.posts);
                        const topicExcerpt = item.topic.description?.trim()
                          ? item.topic.description.trim()
                          : (item.posts[0]?.excerpt ?? "");
                        const hasThumbnail = !!item.topic.thumbnail?.trim();

                        if (hasThumbnail) {
                          return (
                            <Link
                              key={item.topic.id}
                              href={`/${locale}/blog?cat=${col.id}&open=${item.topic.id}`}
                              className={`${styles.card} ${styles.topicWrapCard} ${styles.cardWithMedia}`}
                            >
                              <div className={styles.cardMedia}>
                                <img src={item.topic.thumbnail} alt={item.topic.name} className={styles.cardImage} loading="lazy" />
                                <div className={styles.cardMediaMeta}>
                                  <span className={styles.cardMediaDate}>{topicDate}</span>
                                </div>
                              </div>
                              <div className={styles.cardGlassInfo}>
                                <div className={styles.cardTopRow}>
                                  <span className={`${styles.cardTag} ${styles.topicTag}`}>{dict.blog.topic}</span>
                                  <span className={styles.cardCount}>{item.posts.length} posts</span>
                                </div>
                                <h3 className={styles.cardTitle}>{item.topic.name}</h3>
                                <p className={styles.cardExcerpt}>{topicExcerpt}</p>
                              </div>
                            </Link>
                          );
                        }

                        return (
                          <Link
                            key={item.topic.id}
                            href={`/${locale}/blog?cat=${col.id}&open=${item.topic.id}`}
                            className={`${styles.card} ${styles.topicWrapCard}`}
                          >
                            <div className={styles.cardTopRow}>
                              <span className={`${styles.cardTag} ${styles.topicTag}`}>{dict.blog.topic}</span>
                              <span className={styles.cardDate}>{topicDate}</span>
                            </div>
                            <h3 className={styles.cardTitle}>{item.topic.name}</h3>
                            <p className={styles.cardExcerpt}>{topicExcerpt}</p>
                            <div className={styles.cardFooter}>
                              <span className={styles.cardReadTime}>{item.posts.length} posts</span>
                              <span className={styles.cardArrow}>→</span>
                            </div>
                          </Link>
                        );
                      })()
                    ),
                  )}
                  <Link
                    href={`/${locale}/blog?cat=${col.id}`}
                    className={`${styles.card} ${styles.viewMoreCard}`}
                  >
                    <span className={styles.viewMoreLabel}>{dict.blog.viewMore}</span>
                    <span className={styles.viewMoreCat}>{col.name}</span>
                    <span className={styles.viewMoreArrow}>→</span>
                  </Link>
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
                      <PostCard
                        key={p.id}
                        post={p}
                        locale={locale}
                        label={colLabel(activeCategory)}
                        topicLabel={p.topicIds[0] ? topicNameById[p.topicIds[0]] : undefined}
                      />
                    ))}
                  </div>
                )}
                <TopicAccordionGroup
                  topics={colTopics}
                  posts={colPosts.filter((p) => !p.isPinned)}
                  locale={locale}
                  label={colLabel(activeCategory)}
                  initialOpenId={open}
                />
              </section>
            );
          })()}
    </main>
  );
}
