"use client";

import { useEffect, useState } from "react";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import styles from "@/app/style/home/GithubSection.module.css";
import type { ContributionCell } from "@/lib/content/github";

interface ContributionData {
  total: number;
  cells: ContributionCell[];
}

const LEVEL_CLASS: Record<number, string> = {
  1: styles.githubCellActive1,
  2: styles.githubCellActive2,
  3: styles.githubCellActive3,
  4: styles.githubCellActive4,
};

let cached: ContributionData | null = null;

export function GithubSection() {
  const { dictionary: dict } = useDictionary();
  const [data, setData] = useState<ContributionData | null>(cached);

  useEffect(() => {
    if (cached) return;
    fetch("/api/github/contributions")
      .then((res) => res.json())
      .then((json) => {
        if (json.cells) {
          cached = json;
          setData(json);
        }
      })
      .catch(() => {});
  }, []);

  const SKELETON_CELLS = 53 * 7;

  const weeks = data
    ? Array.from({ length: Math.ceil(data.cells.length / 7) }, (_, i) =>
        data.cells.slice(i * 7, i * 7 + 7)
      )
    : [];

  return (
    <section>
      <div className={styles.githubBox}>
        <div className={styles.githubInner}>
          {!data ? (
            <div className={styles.githubGrid}>
              {Array.from({ length: SKELETON_CELLS }).map((_, i) => (
                <div key={i} className={styles.githubCell} />
              ))}
            </div>
          ) : (
            <div className={styles.githubGrid}>
              {weeks.map((week, wi) =>
                week.map((day, di) => (
                  <div
                    key={`${wi}-${di}`}
                    className={`${styles.githubCell} ${LEVEL_CLASS[day.level] ?? ""}`}
                    title={`${day.date}: ${day.count} contributions`}
                  />
                ))
              )}
            </div>
          )}
          <div className={styles.githubFooter}>
            {data ? (
              <>
                <span className={styles.totalLabel}>
                  {data.total.toLocaleString()} contributions in the last year
                </span>
                <div className={styles.legend}>
                  <span className={styles.legendLabel}>Less</span>
                  <div className={styles.legendCell} />
                  <div className={`${styles.legendCell} ${styles.githubCellActive1}`} />
                  <div className={`${styles.legendCell} ${styles.githubCellActive2}`} />
                  <div className={`${styles.legendCell} ${styles.githubCellActive3}`} />
                  <div className={`${styles.legendCell} ${styles.githubCellActive4}`} />
                  <span className={styles.legendLabel}>More</span>
                </div>
              </>
            ) : (
              <span className={styles.totalLabel}>&nbsp;</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
