"use client";

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
import styles from "@/app/style/admin/dashboard.module.css";

const mockDailyData = [
  { date: "03/05", home: 42, blog: 28, certificates: 15 },
  { date: "03/06", home: 38, blog: 35, certificates: 12 },
  { date: "03/07", home: 55, blog: 40, certificates: 22 },
  { date: "03/08", home: 47, blog: 32, certificates: 18 },
  { date: "03/09", home: 61, blog: 45, certificates: 25 },
  { date: "03/10", home: 52, blog: 38, certificates: 20 },
  { date: "03/11", home: 58, blog: 42, certificates: 28 },
];

const mockGlobal = { home: 1247, blog: 856, certificates: 423 };

export default function AdminDashboardPage() {
  const { dictionary: dict } = useDictionary();
  const t = dict.admin.dashboard;

  const stats = [
    { label: t.home, value: mockGlobal.home },
    { label: t.blog, value: mockGlobal.blog },
    { label: t.certificates, value: mockGlobal.certificates },
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
            <AreaChart data={mockDailyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
              <Area type="monotone" dataKey="certificates" name={t.certificates} stroke="#f59e0b" fillOpacity={1} fill="url(#colorCert)">
                <LabelList dataKey="certificates" position="top" style={{ fontSize: 11, fill: "#f59e0b", fontWeight: 600 }} />
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
