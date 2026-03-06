"use client";

import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import styles from "./styles/GithubSection.module.css";

const CELL_PATTERN = [
  0, 0, 1, 0, 0, 2, 0, 1, 0, 0, 3, 0, 0, 1, 0, 2, 0, 0, 1, 0, 0, 3, 1, 0,
  0, 2, 0, 1, 0, 3, 0, 0, 2, 0, 1, 0, 0, 1, 0, 2, 3, 0, 1, 0, 0, 0, 2, 0, 1,
  0, 0, 3, 0, 1, 0, 0, 2, 0, 0, 1, 3, 0, 0, 2, 0, 1, 0, 3, 0, 1, 0, 2, 0, 0,
  1, 0, 2, 0, 3, 0, 0, 1, 0, 0, 2, 0, 1, 0, 0, 3, 0, 0, 1, 2, 0, 0, 1, 0, 3,
  0, 0, 2, 0, 1, 0, 0, 0, 1, 3, 0, 2, 0, 1, 0, 0, 2, 3, 0, 0, 1, 0, 2, 0, 1,
  0, 0, 3, 0, 1, 0,
];

const LEVEL_CLASS: Record<number, string> = {
  1: styles.githubCellActive1,
  2: styles.githubCellActive2,
  3: styles.githubCellActive3,
};

export function GithubSection() {
  const { dictionary: dict } = useDictionary();

  return (
    <section>
      <h3 className={styles.sectionTitle}>{"// "}{dict.home.githubContribution}</h3>
      <div className={styles.githubBox}>
        <div className={styles.githubInner}>
          <div className={styles.githubGrid}>
            {CELL_PATTERN.map((level, i) => (
              <div
                key={i}
                className={`${styles.githubCell} ${LEVEL_CLASS[level] ?? ""}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
