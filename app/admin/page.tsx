"use client";

import { useEffect, useState, useCallback } from "react";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  LabelList,
} from "recharts";
import {
  fetchGlobalStats,
  fetchLast7Days,
  fetchTopViewedPosts,
  type GlobalStats,
  type DailyStats,
  type TopPost,
} from "@/lib/firebase/analytics-queries";
import styles from "@/app/style/admin/dashboard.module.css";

export default function AdminDashboardPage() {
  const { dictionary: dict } = useDictionary();
  const t = dict.admin.dashboard;

  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [dailyData, setDailyData] = useState<DailyStats[]>([]);
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [global, daily, top] = await Promise.all([
        fetchGlobalStats(),
        fetchLast7Days(),
        fetchTopViewedPosts(10),
      ]);
      setGlobalStats(global);
      setDailyData(daily);
      setTopPosts(top);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.statsGrid}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={styles.statCard}>
              <div className={styles.statLabel}>—</div>
              <div className={styles.statValue}>...</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Error</div>
          <div className={styles.statValue}>{error}</div>
          <button onClick={loadData}>Retry</button>
        </div>
      </div>
    );
  }

  const g = globalStats ?? { home: 0, blog: 0, certification: 0 };
  const stats = [
    { label: t.home, value: g.home },
    { label: t.blog, value: g.blog },
    { label: t.certificates, value: g.certification },
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.statsGrid}>
        {stats.map((s) => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statLabel}>{s.label}</div>
            <div className={styles.statValue}>{s.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className={styles.chartCard}>
        <div className={styles.chartTitle}>{t.last7Days} — {t.pageViews}</div>
        <div className={styles.chartWrap}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorHome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBlog" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCert" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--color-text-muted)" />
              <YAxis tick={{ fontSize: 12 }} stroke="var(--color-text-muted)" />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="home" name={t.home} stroke="#3b82f6" fillOpacity={1} fill="url(#colorHome)">
                <LabelList dataKey="home" position="top" style={{ fontSize: 11, fill: "#3b82f6", fontWeight: 600 }} />
              </Area>
              <Area type="monotone" dataKey="blog" name={t.blog} stroke="#10b981" fillOpacity={1} fill="url(#colorBlog)">
                <LabelList dataKey="blog" position="top" style={{ fontSize: 11, fill: "#10b981", fontWeight: 600 }} />
              </Area>
              <Area type="monotone" dataKey="certification" name={t.certificates} stroke="#f59e0b" fillOpacity={1} fill="url(#colorCert)">
                <LabelList dataKey="certification" position="top" style={{ fontSize: 11, fill: "#f59e0b", fontWeight: 600 }} />
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.chartCard}>
        <div className={styles.chartTitle}>{t.topPosts}</div>
        {topPosts.length === 0 ? (
          <div className={styles.topPostsEmpty}>{t.noData}</div>
        ) : (
          <div className={styles.topPostsList}>
            {topPosts.map((post, idx) => (
              <div key={post.id} className={styles.topPostItem}>
                <span className={styles.topPostRank}>{idx + 1}</span>
                <span className={styles.topPostTitle}>{post.title}</span>
                <span className={styles.topPostViews}>
                  {post.views.toLocaleString()} {t.views}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
