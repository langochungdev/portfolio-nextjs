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

export function GithubSection({ data }: { data: ContributionData | null }) {
  const weeks = data
    ? Array.from({ length: Math.ceil(data.cells.length / 7) }, (_, i) =>
        data.cells.slice(i * 7, i * 7 + 7)
      )
    : [];

  return (
    <section>
      <div className={styles.githubBox}>
        <div className={styles.githubInner}>
          <div className={styles.githubGrid}>
            {data
              ? weeks.map((week, wi) =>
                  week.map((day, di) => (
                    <div
                      key={`${wi}-${di}`}
                      className={`${styles.githubCell} ${LEVEL_CLASS[day.level] ?? ""}`}
                      title={`${day.date}: ${day.count} contributions`}
                    />
                  ))
                )
              : null}
          </div>
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
