import type { PostSummaryDoc, TopicDoc } from "@/app/[lang]/blog/_lib/types";
import type { Locale } from "@/lib/i18n/config";
import { PostCard } from "./PostCard";
import styles from "@/app/style/blog/page.module.css";

interface TopicAccordionProps {
  topic: TopicDoc;
  posts: PostSummaryDoc[];
  isOpen: boolean;
  isPinned?: boolean;
  locale: Locale;
  label: string;
  pinnedText?: string;
  onToggle: () => void;
}

export function TopicAccordion({
  topic, posts, isOpen, isPinned, locale, label, pinnedText, onToggle,
}: TopicAccordionProps) {
  const tp = posts.filter((p) => p.topicIds.includes(topic.id));
  if (!tp.length) return null;
  return (
    <div id={topic.id} className={styles.topicSection}>
      <button className={styles.topicToggle} onClick={onToggle}>
        <div className={styles.topicInfo}>
          {isPinned && pinnedText && <span className={styles.pinnedBadge}>{pinnedText}</span>}
          <h3 className={styles.topicTitle}>{topic.name}</h3>
        </div>
        <span className={`${styles.topicChevron} ${isOpen ? styles.topicChevronOpen : ""}`}>▾</span>
      </button>
      {isOpen && (
        <div className={styles.topicContent}>
          <div className={styles.postGrid}>
            {tp.map((p) => (
              <PostCard key={p.id} post={p} locale={locale} label={label} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
