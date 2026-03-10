import Link from "next/link";
import type { BlogPost } from "@/lib/mock/blog";
import type { Locale } from "@/lib/i18n/config";
import styles from "@/app/style/blog/page.module.css";

export function PostCard({ post, locale, label }: { post: BlogPost; locale: Locale; label: string }) {
  return (
    <Link href={`/${locale}/blog/${post.slug}`} className={styles.card}>
      <div className={styles.cardTopRow}>
        <span className={styles.cardTag}>{label}</span>
        <span className={styles.cardDate}>{post.date}</span>
      </div>
      <h3 className={styles.cardTitle}>{post.title[locale]}</h3>
      <p className={styles.cardExcerpt}>{post.excerpt[locale]}</p>
      <div className={styles.cardFooter}>
        <span className={styles.cardReadTime}>{post.readTime} min read</span>
        <span className={styles.cardArrow}>→</span>
      </div>
    </Link>
  );
}
