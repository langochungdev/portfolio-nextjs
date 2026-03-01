export const blogPosts = [
  {
    id: "1",
    title: {
      vi: "Bắt đầu với Next.js 16",
      en: "Getting Started with Next.js 16",
    },
    category: "tech",
    excerpt: {
      vi: "Khám phá các tính năng mới trong Next.js 16 và cách tận dụng chúng trong dự án của bạn.",
      en: "Explore new features in Next.js 16 and how to leverage them in your projects.",
    },
    date: "2026-02-15",
    author: "Nguyễn Văn A",
    image: null,
    color: "#1a3a5c",
  },
  {
    id: "2",
    title: {
      vi: "Thiết kế UI theo phong cách Retro",
      en: "Retro-Style UI Design",
    },
    category: "design",
    excerpt: {
      vi: "Tại sao phong cách retro đang quay trở lại và cách áp dụng vào web hiện đại.",
      en: "Why retro style is making a comeback and how to apply it to modern web.",
    },
    date: "2026-02-10",
    author: "Nguyễn Văn A",
    image: true,
    color: "#5c1a3a",
  },
  {
    id: "3",
    title: {
      vi: "TypeScript Tips & Tricks",
      en: "TypeScript Tips & Tricks",
    },
    category: "code",
    excerpt: {
      vi: "10 mẹo TypeScript hữu ích giúp code sạch và an toàn hơn.",
      en: "10 useful TypeScript tips for cleaner and safer code.",
    },
    date: "2026-01-28",
    author: "Nguyễn Văn A",
    image: null,
    color: "#3a5c1a",
  },
  {
    id: "4",
    title: {
      vi: "Cuộc sống của một lập trình viên",
      en: "Life of a Developer",
    },
    category: "life",
    excerpt: {
      vi: "Chia sẻ về hành trình trở thành lập trình viên và những bài học đã học được.",
      en: "Sharing the journey of becoming a developer and lessons learned.",
    },
    date: "2026-01-20",
    author: "Nguyễn Văn A",
    image: true,
    color: "#4a2a6a",
  },
  {
    id: "5",
    title: {
      vi: "CSS Grid vs Flexbox",
      en: "CSS Grid vs Flexbox",
    },
    category: "tutorial",
    excerpt: {
      vi: "So sánh chi tiết giữa CSS Grid và Flexbox, khi nào nên dùng cái nào.",
      en: "Detailed comparison between CSS Grid and Flexbox, when to use which.",
    },
    date: "2026-01-15",
    author: "Nguyễn Văn A",
    image: null,
    color: "#2a4a6a",
  },
];

export const blogCategories = [
  "allPosts",
  "tech",
  "design",
  "code",
  "life",
  "tutorial",
] as const;
