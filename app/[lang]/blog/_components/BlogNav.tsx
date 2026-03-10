import Link from "next/link";
import { blogCategories, collectionColors } from "@/lib/mock/blog";
import type { Locale } from "@/lib/i18n/config";
import styles from "@/app/style/blog/page.module.css";

interface BlogNavProps {
  locale: Locale;
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  categoryCounts: Record<string, number>;
  categoryLabels: Record<string, string>;
  totalPosts: number;
}

export function BlogNav({
  locale, activeCategory, onCategoryChange, categoryCounts, categoryLabels, totalPosts,
}: BlogNavProps) {
  const cats = blogCategories.filter((c) => c !== "allPosts");
  return (
    <>
      <aside className={styles.sidebar}>
        <Link href={`/${locale}`} className={styles.wordmark}>langochung</Link>
        <div className={styles.sidebarSection}>
          <div className={styles.sidebarHeading}>Collections</div>
          <button
            className={`${styles.collectionItem} ${activeCategory === "allPosts" ? styles.collectionItemActive : ""}`}
            onClick={() => onCategoryChange("allPosts")}
          >
            <span className={styles.collectionDot} style={{ background: "#1C1C1A" }} />
            <span className={styles.collectionName}>{categoryLabels.allPosts}</span>
            <span className={styles.collectionBadge}>{totalPosts}</span>
          </button>
          {cats.map((cat) => {
            const count = categoryCounts[cat] ?? 0;
            if (!count) return null;
            return (
              <button
                key={cat}
                className={`${styles.collectionItem} ${activeCategory === cat ? styles.collectionItemActive : ""}`}
                onClick={() => onCategoryChange(cat)}
              >
                <span className={styles.collectionDot} style={{ background: collectionColors[cat] }} />
                <span className={styles.collectionName}>{categoryLabels[cat]}</span>
                <span className={styles.collectionBadge}>{count}</span>
              </button>
            );
          })}
        </div>
        <div className={styles.sidebarSection}>
          <div className={styles.sidebarHeading}>Filter</div>
          {(["recent", "oldest"] as const).map((f) => (
            <button key={f} className={styles.filterItem}>
              {f === "recent" ? "Most Recent" : "Oldest First"}
            </button>
          ))}
        </div>
      </aside>
      <nav className={styles.pillStrip}>
        <button
          className={`${styles.pill} ${activeCategory === "allPosts" ? styles.pillActive : ""}`}
          onClick={() => onCategoryChange("allPosts")}
        >
          <span className={styles.pillDot} style={{ background: "#1C1C1A" }} />
          {categoryLabels.allPosts}
        </button>
        {cats.map((cat) => {
          const count = categoryCounts[cat] ?? 0;
          if (!count) return null;
          return (
            <button
              key={cat}
              className={`${styles.pill} ${activeCategory === cat ? styles.pillActive : ""}`}
              onClick={() => onCategoryChange(cat)}
            >
              <span className={styles.pillDot} style={{ background: collectionColors[cat] }} />
              {categoryLabels[cat]}
            </button>
          );
        })}
      </nav>
    </>
  );
}
