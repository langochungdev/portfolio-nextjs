import styles from "@/app/style/blog/page.module.css";

export default function BlogLoading() {
  return (
    <main className={styles.main}>
      {Array.from({ length: 2 }).map((_, sectionIdx) => (
        <section key={sectionIdx} className={styles.collectorBlock}>
          <div className={styles.collectorHeader}>
            <span
              className={styles.collectorDot}
              style={{ background: "rgba(148, 163, 184, 0.55)" }}
            />
            <div
              style={{
                width: 180,
                height: 20,
                borderRadius: 8,
                background: "rgba(148, 163, 184, 0.18)",
              }}
            />
            <div
              style={{
                width: 140,
                height: 14,
                borderRadius: 6,
                background: "rgba(148, 163, 184, 0.14)",
                marginLeft: "auto",
              }}
            />
          </div>
          <div className={styles.gridFive}>
            {Array.from({ length: 5 }).map((__, cardIdx) => (
              <div
                key={cardIdx}
                className={styles.card}
                style={{
                  minHeight: 220,
                  background: "rgba(148, 163, 184, 0.08)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                }}
              />
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
