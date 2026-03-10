import styles from "@/app/style/blog/detail.module.css";

export default function BlogDetailLoading() {
  return (
    <div className={styles.shell}>
      <div className={styles.collectionWrap} />

      <aside className={styles.sidebar}>
        <div className={styles.skeletonLine} style={{ width: "60%" }} />
        <div className={styles.sidebarSection}>
          <div className={styles.skeletonLine} style={{ width: "40%", height: 10 }} />
          <div className={styles.sidebarNav}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.skeletonLine} style={{ width: `${80 - i * 10}%`, height: 14, marginBottom: 6 }} />
            ))}
          </div>
        </div>
      </aside>

      <main className={styles.main}>
        <article className={styles.article}>
          <div className={styles.articleTop}>
            <span className={`${styles.tag} ${styles.skeleton}`} style={{ width: 60 }}>&nbsp;</span>
            <span className={`${styles.skeleton}`} style={{ width: 8, height: 8, borderRadius: "50%" }} />
            <span className={`${styles.skeleton}`} style={{ width: 80, height: 14, borderRadius: 4 }} />
          </div>

          <div className={styles.skeletonLine} style={{ width: "90%", height: 32, marginBottom: 8 }} />
          <div className={styles.skeletonLine} style={{ width: "60%", height: 32, marginBottom: 20 }} />

          <div className={styles.meta}>
            <div className={`${styles.authorAvatar} ${styles.skeleton}`} />
            <div className={styles.skeletonLine} style={{ width: 100, height: 14 }} />
          </div>

          <div className={styles.content}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={styles.skeletonLine}
                style={{ width: `${90 - (i % 3) * 15}%`, height: 16, marginBottom: 14 }}
              />
            ))}
          </div>
        </article>
      </main>
    </div>
  );
}
