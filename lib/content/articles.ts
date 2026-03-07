export interface Article {
  id: string;
  slug: string;
  category: string;
  title: { vi: string; en: string };
  excerpt: { vi: string; en: string };
  date: string;
}

export const articles: Article[] = [
  {
    id: "1",
    slug: "getting-started-nextjs",
    category: "tech",
    title: {
      vi: "Bắt đầu với Next.js",
      en: "Getting Started with Next.js",
    },
    excerpt: {
      vi: "Viết nội dung của bạn vào đây. Đây là đoạn mô tả ngắn cho bài viết đầu tiên.",
      en: "Write your content here. This is the short description for the first article.",
    },
    date: "2026-03-01",
  },
  {
    id: "2",
    slug: "typescript-tips",
    category: "code",
    title: {
      vi: "TypeScript Tips & Tricks",
      en: "TypeScript Tips & Tricks",
    },
    excerpt: {
      vi: "Viết nội dung của bạn vào đây. Đây là đoạn mô tả ngắn cho bài viết thứ hai.",
      en: "Write your content here. This is the short description for the second article.",
    },
    date: "2026-02-20",
  },
  {
    id: "3",
    slug: "css-layout-guide",
    category: "design",
    title: {
      vi: "Hướng dẫn CSS Layout",
      en: "CSS Layout Guide",
    },
    excerpt: {
      vi: "Viết nội dung của bạn vào đây. Đây là đoạn mô tả ngắn cho bài viết thứ ba.",
      en: "Write your content here. This is the short description for the third article.",
    },
    date: "2026-02-10",
  },
];
