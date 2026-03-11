import Link from "next/link";
import type { PostDoc } from "@/app/[lang]/blog/_lib/types";
import { getExcerpt, getReadTime } from "@/app/[lang]/blog/_lib/types";
import type { Locale } from "@/lib/i18n/config";
import styles from "@/app/style/blog/page.module.css";

export function PostCard({ post, locale, label }: { post: PostDoc; locale: Locale; label: string }) {
  return (
    <Link href={`/${locale}/blog/${post.slug}`} className={styles.card}>
      <div className={styles.cardTopRow}>
        <span className={styles.cardTag}>{label}</span>
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
