import { bio, type BioBlock } from "@/lib/content/bio";
import type { Locale } from "@/lib/i18n/config";
import styles from "@/app/style/home/ArticlesSection.module.css";

export function ArticlesSection({ locale }: { locale: Locale }) {
  const content: BioBlock[] = bio[locale];

  return (
    <section className={styles.section}>
      {content.map((block: BioBlock, i: number) =>
        block.type === "quote" ? (
          <blockquote key={i} className={styles.quote}>{block.text}</blockquote>
        ) : block.type === "heading" ? (
          <h2 key={i} className={styles.heading}>{block.text}</h2>
        ) : block.type === "paragraph" ? (
          <p key={i} className={styles.paragraph}>{block.text}</p>
        ) : block.type === "list" ? (
          <ul key={i} className={styles.list}>
            {block.items.map((item: string, j: number) => (
              <li key={j} className={styles.listItem}>{item}</li>
            ))}
          </ul>
        ) : null
      )}
    </section>
  );
}
