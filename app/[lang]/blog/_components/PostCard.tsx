import Link from "next/link";
import type { PostDoc } from "@/app/[lang]/blog/_lib/types";
import { getExcerpt, getReadTime } from "@/app/[lang]/blog/_lib/types";
import type { Locale } from "@/lib/i18n/config";
import styles from "@/app/style/blog/page.module.css";

export function PostCard({
  post,
  locale,
  label,
  topicLabel,
}: {
  post: PostDoc;
  locale: Locale;
  label: string;
  topicLabel?: string;
}) {
  const hasThumbnail = !!post.thumbnail?.trim();
  const displayTopicLabel = topicLabel ?? label;

  if (hasThumbnail) {
    return (
      <Link href={`/${locale}/blog/${post.slug}`} className={`${styles.card} ${styles.cardWithMedia}`}>
        <div className={styles.cardMedia}>
          <img src={post.thumbnail} alt={post.title} className={styles.cardImage} loading="lazy" />
          <div className={styles.cardMediaMeta}>
            <span className={styles.cardMediaDate}>{post.createdAt}</span>
            <span className={styles.cardMediaViews}>{post.views} views</span>
          </div>
        </div>
        <div className={styles.cardGlassInfo}>
          <div className={styles.cardTopRow}>
            <span className={styles.cardTag}>{displayTopicLabel}</span>
          </div>
          <h3 className={styles.cardTitle}>{post.title}</h3>
          <p className={styles.cardExcerpt}>{getExcerpt(post.content)}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/${locale}/blog/${post.slug}`} className={styles.card}>
      <div className={styles.cardTopRow}>
        <span className={styles.cardTag}>{displayTopicLabel}</span>
        <span className={styles.cardDate}>{post.createdAt}</span>
      </div>
      <h3 className={styles.cardTitle}>{post.title}</h3>
      <p className={styles.cardExcerpt}>{getExcerpt(post.content)}</p>
      <div className={styles.cardFooter}>
        <span className={styles.cardReadTime}>{getReadTime(post.content)} min read</span>
        <span className={styles.cardArrow}>→</span>
      </div>
    </Link>
  );
}
