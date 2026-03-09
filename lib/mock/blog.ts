export interface BlogPost {
  id: string;
  slug: string;
  title: { vi: string; en: string };
  category: string;
  excerpt: { vi: string; en: string };
  content: { vi: string; en: string };
  date: string;
  updatedDate: string;
  author: string;
  image: string | null;
  color: string;
  readTime: number;
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
    updatedDate: "2026-02-20",
    author: "La Ngọc Hùng",
    image: null,
    color: "#1a3a5c",
    readTime: 5,
  },
  {
    id: "6",
    slug: "react-server-components-deep-dive",
    title: {
      vi: "Deep Dive vào React Server Components",
      en: "Deep Dive into React Server Components",
    },
    category: "tech",
    excerpt: {
      vi: "Tìm hiểu cách RSC hoạt động bên dưới và tại sao nó thay đổi cách chúng ta xây dựng React apps.",
      en: "Learn how RSC works under the hood and why it changes how we build React apps.",
    },
    content: {
      vi: "React Server Components (RSC) là sự thay đổi lớn nhất trong hệ sinh thái React kể từ Hooks. RSC cho phép render component trên server, giảm JavaScript bundle gửi tới client.\n\nKhác với SSR truyền thống, RSC không cần hydration. Component server chỉ chạy trên server và gửi HTML + serialized output tới client.\n\nĐiều này giúp giảm bundle size, cải thiện performance và cho phép truy cập database trực tiếp từ component.",
      en: "React Server Components (RSC) is the biggest change in the React ecosystem since Hooks. RSC allows rendering components on the server, reducing the JavaScript bundle sent to the client.\n\nUnlike traditional SSR, RSC doesn't need hydration. Server components only run on the server and send HTML + serialized output to the client.\n\nThis reduces bundle size, improves performance, and allows direct database access from components.",
    },
    date: "2026-02-12",
    updatedDate: "2026-02-14",
    author: "La Ngọc Hùng",
    image: null,
    color: "#1a3a5c",
    readTime: 8,
  },
  {
    id: "7",
    slug: "edge-computing-web-dev",
    title: {
      vi: "Edge Computing cho Web Developers",
      en: "Edge Computing for Web Developers",
    },
    category: "tech",
    excerpt: {
      vi: "Triển khai ứng dụng tại edge giúp giảm latency và cải thiện trải nghiệm người dùng toàn cầu.",
      en: "Deploying applications at the edge reduces latency and improves global user experience.",
    },
    content: {
      vi: "Edge computing đang thay đổi cách chúng ta triển khai web applications. Thay vì chạy tất cả trên một origin server, edge functions chạy gần người dùng nhất có thể.\n\nCác nền tảng như Vercel Edge Functions, Cloudflare Workers và Deno Deploy cho phép chạy code tại hàng trăm locations trên toàn cầu.\n\nHãy bắt đầu với middleware đơn giản: authentication, redirects, A/B testing — những tác vụ nhẹ nhưng có tác động lớn đến trải nghiệm.",
      en: "Edge computing is changing how we deploy web applications. Instead of running everything on a single origin server, edge functions run as close to users as possible.\n\nPlatforms like Vercel Edge Functions, Cloudflare Workers, and Deno Deploy allow running code at hundreds of locations globally.\n\nStart with simple middleware: authentication, redirects, A/B testing — lightweight tasks with significant impact on experience.",
    },
    date: "2026-02-05",
    updatedDate: "2026-02-08",
    author: "La Ngọc Hùng",
    image: null,
    color: "#1a3a5c",
    readTime: 6,
  },
  {
    id: "8",
    slug: "web-performance-core-vitals",
    title: {
      vi: "Tối ưu Core Web Vitals trong thực tế",
      en: "Optimizing Core Web Vitals in Practice",
    },
    category: "tech",
    excerpt: {
      vi: "Hướng dẫn thực tế để đạt điểm Lighthouse 100 cho LCP, FID và CLS.",
      en: "Practical guide to achieving Lighthouse 100 for LCP, FID, and CLS.",
    },
    content: {
      vi: "Core Web Vitals là bộ ba metrics mà Google sử dụng để đánh giá trải nghiệm người dùng: LCP (Largest Contentful Paint), FID (First Input Delay), và CLS (Cumulative Layout Shift).\n\nĐể cải thiện LCP: tối ưu hình ảnh với next/image, sử dụng font-display: swap, và preload critical resources.\n\nCLS cải thiện bằng cách đặt width/height cho mọi img/video, tránh inject content dynamically phía trên fold.",
      en: "Core Web Vitals are the three metrics Google uses to evaluate user experience: LCP (Largest Contentful Paint), FID (First Input Delay), and CLS (Cumulative Layout Shift).\n\nTo improve LCP: optimize images with next/image, use font-display: swap, and preload critical resources.\n\nImprove CLS by setting width/height for all img/video, avoiding dynamically injecting content above the fold.",
    },
    date: "2026-01-30",
    updatedDate: "2026-02-01",
    author: "La Ngọc Hùng",
    image: null,
    color: "#1a3a5c",
    readTime: 7,
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
    updatedDate: "2026-02-12",
    author: "La Ngọc Hùng",
    image: null,
    color: "#5c1a3a",
    readTime: 4,
  },
  {
    id: "9",
    slug: "design-systems-at-scale",
    title: {
      vi: "Xây dựng Design System cho dự án lớn",
      en: "Building Design Systems at Scale",
    },
    category: "design",
    excerpt: {
      vi: "Cách tổ chức tokens, components và patterns để design system phục vụ cả team lớn.",
      en: "How to organize tokens, components, and patterns for a design system that serves large teams.",
    },
    content: {
      vi: "Design system không chỉ là một bộ component library. Đó là ngôn ngữ chung giữa designers và developers.\n\nBắt đầu với design tokens: colors, spacing, typography, shadows. Sau đó xây dựng primitive components (Button, Input, Card) rồi mới đến composite components.\n\nDocument mọi thứ với Storybook và đảm bảo mỗi component có variants, states và accessibility guidelines.",
      en: "A design system is more than a component library. It's a shared language between designers and developers.\n\nStart with design tokens: colors, spacing, typography, shadows. Then build primitive components (Button, Input, Card) before moving to composite components.\n\nDocument everything with Storybook and ensure each component has variants, states, and accessibility guidelines.",
    },
    date: "2026-01-25",
    updatedDate: "2026-01-28",
    author: "La Ngọc Hùng",
    image: null,
    color: "#5c1a3a",
    readTime: 7,
  },
  {
    id: "10",
    slug: "color-theory-for-developers",
    title: {
      vi: "Color Theory dành cho Developers",
      en: "Color Theory for Developers",
    },
    category: "design",
    excerpt: {
      vi: "Hiểu cách chọn và kết hợp màu sắc để tạo UI hài hòa mà không cần là designer.",
      en: "Understand how to choose and combine colors for harmonious UI without being a designer.",
    },
    content: {
      vi: "Bạn không cần là designer để chọn màu tốt. Color theory cung cấp quy tắc toán học để kết hợp màu sắc hài hòa.\n\nBắt đầu với 60-30-10 rule: 60% primary, 30% secondary, 10% accent. Sử dụng HSL thay vì HEX để dễ điều chỉnh.\n\nĐảm bảo contrast ratio tối thiểu 4.5:1 cho text nhỏ và 3:1 cho text lớn. Luôn test với công cụ accessibility.",
      en: "You don't need to be a designer to choose good colors. Color theory provides mathematical rules for harmonious color combinations.\n\nStart with the 60-30-10 rule: 60% primary, 30% secondary, 10% accent. Use HSL instead of HEX for easier adjustments.\n\nEnsure minimum contrast ratio of 4.5:1 for small text and 3:1 for large text. Always test with accessibility tools.",
    },
    date: "2026-01-18",
    updatedDate: "2026-01-20",
    author: "La Ngọc Hùng",
    image: null,
    color: "#5c1a3a",
    readTime: 5,
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
    updatedDate: "2026-01-30",
    author: "La Ngọc Hùng",
    image: null,
    color: "#3a5c1a",
    readTime: 6,
  },
  {
    id: "11",
    slug: "clean-code-javascript",
    title: {
      vi: "Clean Code trong JavaScript hiện đại",
      en: "Clean Code in Modern JavaScript",
    },
    category: "code",
    excerpt: {
      vi: "Áp dụng nguyên tắc Clean Code vào JavaScript/TypeScript với ví dụ thực tế.",
      en: "Applying Clean Code principles to JavaScript/TypeScript with practical examples.",
    },
    content: {
      vi: "Clean code không phải là viết ít code nhất. Đó là viết code dễ đọc, dễ hiểu và dễ maintain.\n\nNguyên tắc cốt lõi: function nhỏ (dưới 20 dòng), tên biến rõ ràng, tránh side effects, single responsibility.\n\nSử dụng early return thay vì nested if. Prefer immutable data với const/Object.freeze. Extract magic numbers thành named constants.",
      en: "Clean code isn't about writing the least code. It's about writing code that's easy to read, understand, and maintain.\n\nCore principles: small functions (under 20 lines), clear variable names, avoid side effects, single responsibility.\n\nUse early return instead of nested if. Prefer immutable data with const/Object.freeze. Extract magic numbers into named constants.",
    },
    date: "2026-01-22",
    updatedDate: "2026-01-24",
    author: "La Ngọc Hùng",
    image: null,
    color: "#3a5c1a",
    readTime: 5,
  },
  {
    id: "12",
    slug: "git-workflow-pro",
    title: {
      vi: "Git Workflow cho Professional Projects",
      en: "Git Workflow for Professional Projects",
    },
    category: "code",
    excerpt: {
      vi: "Trunk-based development, conventional commits và CI/CD integration cho team hiện đại.",
      en: "Trunk-based development, conventional commits, and CI/CD integration for modern teams.",
    },
    content: {
      vi: "Git workflow phù hợp giúp team phát triển nhanh hơn và ít conflict hơn.\n\nTrunk-based development: mọi người commit vào main branch, sử dụng feature flags thay vì long-lived branches.\n\nConventional commits (feat:, fix:, chore:) giúp tự động generate changelog. Kết hợp với husky + lint-staged để enforce trước khi commit.",
      en: "The right Git workflow helps teams develop faster with fewer conflicts.\n\nTrunk-based development: everyone commits to main branch, using feature flags instead of long-lived branches.\n\nConventional commits (feat:, fix:, chore:) enable automatic changelog generation. Combine with husky + lint-staged to enforce before committing.",
    },
    date: "2026-01-10",
    updatedDate: "2026-01-12",
    author: "La Ngọc Hùng",
    image: null,
    color: "#3a5c1a",
    readTime: 4,
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
    updatedDate: "2026-01-22",
    author: "La Ngọc Hùng",
    image: null,
    color: "#4a2a6a",
    readTime: 3,
  },
  {
    id: "13",
    slug: "remote-work-productivity",
    title: {
      vi: "Làm việc remote hiệu quả",
      en: "Productive Remote Work",
    },
    category: "life",
    excerpt: {
      vi: "Những thói quen và công cụ giúp tôi duy trì năng suất khi work from home.",
      en: "Habits and tools that help me stay productive when working from home.",
    },
    content: {
      vi: "Làm việc remote đòi hỏi kỷ luật cá nhân cao hơn office. Sau 3 năm remote, đây là những gì tôi học được.\n\nThiết lập không gian làm việc riêng biệt. Sử dụng Pomodoro technique (25 phút focus, 5 phút nghỉ). Đặt boundaries rõ ràng giữa work và personal time.\n\nCông cụ: Notion cho task management, Slack cho communication, Loom cho async video updates.",
      en: "Remote work requires higher personal discipline than office work. After 3 years remote, here's what I've learned.\n\nSet up a dedicated workspace. Use the Pomodoro technique (25 min focus, 5 min break). Set clear boundaries between work and personal time.\n\nTools: Notion for task management, Slack for communication, Loom for async video updates.",
    },
    date: "2026-01-05",
    updatedDate: "2026-01-08",
    author: "La Ngọc Hùng",
    image: null,
    color: "#4a2a6a",
    readTime: 4,
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
    updatedDate: "2026-01-18",
    author: "La Ngọc Hùng",
    image: null,
    color: "#2a4a6a",
    readTime: 5,
  },
  {
    id: "14",
    slug: "docker-for-frontend-devs",
    title: {
      vi: "Docker cho Frontend Developers",
      en: "Docker for Frontend Developers",
    },
    category: "tutorial",
    excerpt: {
      vi: "Hướng dẫn từ cơ bản đến deploy ứng dụng Next.js với Docker và Docker Compose.",
      en: "Guide from basics to deploying a Next.js app with Docker and Docker Compose.",
    },
    content: {
      vi: "Docker giúp đảm bảo ứng dụng chạy giống nhau trên mọi môi trường. Frontend developers cũng cần biết Docker.\n\nBắt đầu với Dockerfile đơn giản: FROM node:20-alpine, COPY, RUN npm install, CMD. Sau đó tối ưu với multi-stage build.\n\nDocker Compose giúp quản lý multiple services: frontend, backend, database cùng một lúc với docker-compose up.",
      en: "Docker ensures applications run the same across all environments. Frontend developers also need to know Docker.\n\nStart with a simple Dockerfile: FROM node:20-alpine, COPY, RUN npm install, CMD. Then optimize with multi-stage builds.\n\nDocker Compose helps manage multiple services: frontend, backend, database all at once with docker-compose up.",
    },
    date: "2026-01-08",
    updatedDate: "2026-01-10",
    author: "La Ngọc Hùng",
    image: null,
    color: "#2a4a6a",
    readTime: 8,
  },
  {
    id: "15",
    slug: "testing-react-components",
    title: {
      vi: "Testing React Components đúng cách",
      en: "Testing React Components the Right Way",
    },
    category: "tutorial",
    excerpt: {
      vi: "Unit test, integration test và best practices với Vitest + Testing Library.",
      en: "Unit tests, integration tests, and best practices with Vitest + Testing Library.",
    },
    content: {
      vi: "Testing không phải là viết test cho mọi dòng code. Đó là test behavior, không test implementation.\n\nSử dụng Testing Library để test từ góc nhìn user: tìm element bằng text, role, label thay vì class name hay test id.\n\nVitest nhanh hơn Jest nhờ Vite. Kết hợp coverage report để đảm bảo critical paths đều được test.",
      en: "Testing isn't about writing tests for every line of code. It's about testing behavior, not implementation.\n\nUse Testing Library to test from the user's perspective: find elements by text, role, label instead of class name or test id.\n\nVitest is faster than Jest thanks to Vite. Combine with coverage reports to ensure all critical paths are tested.",
    },
    date: "2025-12-28",
    updatedDate: "2025-12-30",
    author: "La Ngọc Hùng",
    image: null,
    color: "#2a4a6a",
    readTime: 6,
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

export type BlogCategory = (typeof blogCategories)[number];

export const collectionColors: Record<string, string> = {
  tech: "#3B82F6",
  design: "#EC4899",
  code: "#10B981",
  life: "#F59E0B",
  tutorial: "#8B5CF6",
};
