import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import styles from "@/app/style/shared/collection-sidebar.module.css";

export interface CollectionItem {
  key: string;
  label: string;
  color: string;
  count: number;
}

interface CollectionSidebarProps {
  locale: Locale;
  activeKey: string;
  onSelect: (key: string) => void;
  allKey: string;
  allLabel: string;
  allCount: number;
  items: CollectionItem[];
  filters?: { key: string; label: string }[];
  className?: string;
}

export function CollectionSidebar({
  locale,
  activeKey,
  onSelect,
  allKey,
  allLabel,
  allCount,
  items,
  filters,
  className,
}: CollectionSidebarProps) {
  return (
    <div className={className}>
      <aside className={styles.sidebar}>
        <Link href={`/${locale}`} className={styles.wordmark}>
          langochung
        </Link>

        <div className={styles.sidebarSection}>
          <div className={styles.sidebarHeading}>Collections</div>
          <button
            className={`${styles.collectionItem} ${activeKey === allKey ? styles.collectionItemActive : ""}`}
            onClick={() => onSelect(allKey)}
          >
            <span className={styles.collectionDot} style={{ background: "#1C1C1A" }} />
            <span className={styles.collectionName}>{allLabel}</span>
            <span className={styles.collectionBadge}>{allCount}</span>
          </button>
          {items.map((item) => {
            if (!item.count) return null;
            return (
              <button
                key={item.key}
                className={`${styles.collectionItem} ${activeKey === item.key ? styles.collectionItemActive : ""}`}
                onClick={() => onSelect(item.key)}
              >
                <span className={styles.collectionDot} style={{ background: item.color }} />
                <span className={styles.collectionName}>{item.label}</span>
                <span className={styles.collectionBadge}>{item.count}</span>
              </button>
            );
          })}
        </div>

        {filters && (
          <div className={styles.sidebarSection}>
            <div className={styles.sidebarHeading}>Filter</div>
            {filters.map((f) => (
              <button key={f.key} className={styles.filterItem}>
                {f.label}
              </button>
            ))}
          </div>
        )}
      </aside>

      <nav className={styles.pillStrip}>
        <button
          className={`${styles.pill} ${activeKey === allKey ? styles.pillActive : ""}`}
          onClick={() => onSelect(allKey)}
        >
          <span className={styles.pillDot} style={{ background: "#1C1C1A" }} />
          {allLabel}
        </button>
        {items.map((item) => {
          if (!item.count) return null;
          return (
            <button
              key={item.key}
              className={`${styles.pill} ${activeKey === item.key ? styles.pillActive : ""}`}
              onClick={() => onSelect(item.key)}
            >
              <span className={styles.pillDot} style={{ background: item.color }} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
