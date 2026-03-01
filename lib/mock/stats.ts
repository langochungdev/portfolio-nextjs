export const statsData = {
  totalVisits: 12543,
  todayVisits: 89,
  weeklyVisits: 634,
  monthlyVisits: 2847,
  weeklyChart: [
    { day: "T2", value: 120 },
    { day: "T3", value: 145 },
    { day: "T4", value: 132 },
    { day: "T5", value: 168 },
    { day: "T6", value: 155 },
    { day: "T7", value: 98 },
    { day: "CN", value: 78 },
  ],
  topPages: [
    { page: "/", name: "Home", visits: 5420, percentage: 43 },
    { page: "/blog", name: "Blog", visits: 3210, percentage: 26 },
    { page: "/gallery", name: "Gallery", visits: 1890, percentage: 15 },
    { page: "/admin", name: "Admin", visits: 523, percentage: 4 },
  ],
};

export const adminBlogPosts = [
  {
    id: "1",
    title: "Bắt đầu với Next.js 16",
    status: "published" as const,
    date: "2026-02-15",
  },
  {
    id: "2",
    title: "Thiết kế UI theo phong cách Retro",
    status: "published" as const,
    date: "2026-02-10",
  },
  {
    id: "3",
    title: "TypeScript Tips & Tricks",
    status: "draft" as const,
    date: "2026-01-28",
  },
  {
    id: "4",
    title: "Cuộc sống của một lập trình viên",
    status: "published" as const,
    date: "2026-01-20",
  },
];
