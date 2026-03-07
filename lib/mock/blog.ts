export interface BlogPost {
  id: string;
  slug: string;
  title: { vi: string; en: string };
  category: string;
  excerpt: { vi: string; en: string };
  content: { vi: string; en: string };
  date: string;
  author: string;
  image: string | null;
  color: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "getting-started-nextjs-16",
    title: {
      vi: "Bắt đầu với Next.js 16",
      en: "Getting Started with Next.js 16",
    },
    category: "tech",
    excerpt: {
      vi: "Khám phá các tính năng mới trong Next.js 16 và cách tận dụng chúng trong dự án của bạn.",
      en: "Explore new features in Next.js 16 and how to leverage them in your projects.",
    },
    content: {
      vi: "Next.js 16 mang đến nhiều cải tiến đáng kể về hiệu suất và trải nghiệm phát triển. Trong bài viết này, chúng ta sẽ khám phá các tính năng mới như Server Components cải tiến, Turbopack ổn định, và nhiều hơn nữa.\n\nServer Components giờ đây hoạt động mượt mà hơn với streaming SSR được tối ưu. Turbopack đã trở thành bundler mặc định, giúp thời gian build giảm đáng kể.\n\nCách bắt đầu rất đơn giản: chạy npx create-next-app@latest và bắt đầu code ngay.",
      en: "Next.js 16 brings significant improvements in performance and developer experience. In this article, we'll explore new features like improved Server Components, stable Turbopack, and more.\n\nServer Components now work more smoothly with optimized streaming SSR. Turbopack has become the default bundler, significantly reducing build times.\n\nGetting started is simple: run npx create-next-app@latest and start coding right away.",
    },
    date: "2026-02-15",
    author: "La Ngọc Hùng",
    image: null,
    color: "#1a3a5c",
  },
  {
    id: "2",
    slug: "retro-ui-design",
    title: {
      vi: "Thiết kế UI theo phong cách Retro",
      en: "Retro-Style UI Design",
    },
    category: "design",
    excerpt: {
      vi: "Tại sao phong cách retro đang quay trở lại và cách áp dụng vào web hiện đại.",
      en: "Why retro style is making a comeback and how to apply it to modern web.",
    },
    content: {
      vi: "Phong cách retro đang trở lại mạnh mẽ trong thiết kế web. Từ typography đậm nét đến color palette hoài cổ, retro design mang lại cảm giác thân thuộc nhưng vẫn hiện đại.\n\nCác yếu tố chính bao gồm: font serif cổ điển, gradient màu ấm, border dày và bóng đổ rõ nét. Kết hợp với animation CSS hiện đại, bạn có thể tạo ra trải nghiệm web độc đáo.",
      en: "Retro style is making a strong comeback in web design. From bold typography to nostalgic color palettes, retro design brings familiarity while staying modern.\n\nKey elements include: classic serif fonts, warm gradients, thick borders and prominent shadows. Combined with modern CSS animations, you can create unique web experiences.",
    },
    date: "2026-02-10",
    author: "La Ngọc Hùng",
    image: null,
    color: "#5c1a3a",
  },
  {
    id: "3",
    slug: "typescript-tips-tricks",
    title: {
      vi: "TypeScript Tips & Tricks",
      en: "TypeScript Tips & Tricks",
    },
    category: "code",
    excerpt: {
      vi: "10 mẹo TypeScript hữu ích giúp code sạch và an toàn hơn.",
      en: "10 useful TypeScript tips for cleaner and safer code.",
    },
    content: {
      vi: "TypeScript không chỉ là JavaScript với type. Dưới đây là 10 mẹo giúp bạn viết code tốt hơn:\n\n1. Sử dụng const assertions để tạo literal types\n2. Template literal types cho string patterns\n3. Discriminated unions thay vì optional properties\n4. Satisfies operator để validate mà không mất type\n5. Infer keyword trong conditional types",
      en: "TypeScript is more than JavaScript with types. Here are 10 tips to help you write better code:\n\n1. Use const assertions to create literal types\n2. Template literal types for string patterns\n3. Discriminated unions instead of optional properties\n4. Satisfies operator to validate without losing type\n5. Infer keyword in conditional types",
    },
    date: "2026-01-28",
    author: "La Ngọc Hùng",
    image: null,
    color: "#3a5c1a",
  },
  {
    id: "4",
    slug: "life-of-a-developer",
    title: {
      vi: "Cuộc sống của một lập trình viên",
      en: "Life of a Developer",
    },
    category: "life",
    excerpt: {
      vi: "Chia sẻ về hành trình trở thành lập trình viên và những bài học đã học được.",
      en: "Sharing the journey of becoming a developer and lessons learned.",
    },
    content: {
      vi: "Trở thành một lập trình viên không chỉ là học code. Đó là hành trình liên tục học hỏi, thất bại và cải thiện bản thân.\n\nTừ những ngày đầu viết HTML/CSS đến việc xây dựng full-stack applications, mỗi bước đều mang lại bài học giá trị. Điều quan trọng nhất tôi học được: kiên nhẫn và sự tò mò.",
      en: "Becoming a developer is not just about learning to code. It's a continuous journey of learning, failing, and improving yourself.\n\nFrom the early days of writing HTML/CSS to building full-stack applications, every step brings valuable lessons. The most important thing I learned: patience and curiosity.",
    },
    date: "2026-01-20",
    author: "La Ngọc Hùng",
    image: null,
    color: "#4a2a6a",
  },
  {
    id: "5",
    slug: "css-grid-vs-flexbox",
    title: {
      vi: "CSS Grid vs Flexbox",
      en: "CSS Grid vs Flexbox",
    },
    category: "tutorial",
    excerpt: {
      vi: "So sánh chi tiết giữa CSS Grid và Flexbox, khi nào nên dùng cái nào.",
      en: "Detailed comparison between CSS Grid and Flexbox, when to use which.",
    },
    content: {
      vi: "CSS Grid và Flexbox đều là công cụ layout mạnh mẽ nhưng phục vụ mục đích khác nhau.\n\nFlexbox tốt cho layout 1 chiều (hàng hoặc cột). Grid tốt cho layout 2 chiều (hàng và cột cùng lúc).\n\nTrong thực tế, bạn thường kết hợp cả hai: Grid cho layout tổng thể của trang, Flexbox cho các component nhỏ bên trong.",
      en: "CSS Grid and Flexbox are both powerful layout tools but serve different purposes.\n\nFlexbox is great for 1-dimensional layouts (rows or columns). Grid is great for 2-dimensional layouts (rows and columns simultaneously).\n\nIn practice, you often combine both: Grid for the overall page layout, Flexbox for smaller components inside.",
    },
    date: "2026-01-15",
    author: "La Ngọc Hùng",
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
