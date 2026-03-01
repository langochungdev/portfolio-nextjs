import { statsData } from "@/lib/mock/stats";
import type { Dictionary } from "@/lib/i18n/getDictionary";

interface DashboardStatsProps {
  dict: Dictionary;
}

export default function DashboardStats({ dict }: DashboardStatsProps) {
  const maxChartValue = Math.max(
    ...statsData.weeklyChart.map((d) => d.value)
  );

  return (
    <>
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-value">
            {statsData.totalVisits.toLocaleString()}
          </div>
          <div className="admin-stat-label">{dict.admin.totalVisits}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{statsData.todayVisits}</div>
          <div className="admin-stat-label">{dict.admin.todayVisits}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{statsData.weeklyVisits}</div>
          <div className="admin-stat-label">{dict.admin.weeklyVisits}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{statsData.monthlyVisits}</div>
          <div className="admin-stat-label">{dict.admin.monthlyVisits}</div>
        </div>
      </div>

      <div className="admin-chart">
        <div className="admin-chart-title">
          {dict.admin.weeklyVisits} - {dict.admin.visitors}
        </div>
        <div className="admin-bar-chart">
          {statsData.weeklyChart.map((item) => (
            <div
              key={item.day}
              className="admin-bar"
              style={{
                height: `${(item.value / maxChartValue) * 100}%`,
              }}
            >
              <span className="admin-bar-label">{item.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-top-pages">
        <div className="admin-top-pages-title">{dict.admin.topPages}</div>
        {statsData.topPages.map((page) => (
          <div key={page.page}>
            <div className="admin-page-row">
              <span>{page.name}</span>
              <span>{page.visits.toLocaleString()}</span>
            </div>
            <div
              className="admin-page-bar"
              style={{ width: `${page.percentage}%` }}
            />
          </div>
        ))}
      </div>
    </>
  );
}
