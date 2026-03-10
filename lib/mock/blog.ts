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
  topic?: string;
}

export interface BlogTopic {
  id: string;
  category: string;
  title: { vi: string; en: string };
  description: { vi: string; en: string };
  pinned?: boolean;
}

export const blogTopics: BlogTopic[] = [
  {
    id: "react-ecosystem",
    category: "tech",
    title: { vi: "Hệ sinh thái React", en: "React Ecosystem" },
    description: {
      vi: "Khám phá React Server Components, Next.js và các công nghệ hiện đại trong hệ sinh thái React.",
      en: "Explore React Server Components, Next.js and modern technologies in the React ecosystem.",
    },
    pinned: true,
  },
  {
    id: "web-performance",
    category: "tech",
    title: { vi: "Hiệu suất Web", en: "Web Performance" },
    description: {
      vi: "Tối ưu hóa hiệu suất web với Edge Computing và Core Web Vitals.",
      en: "Optimize web performance with Edge Computing and Core Web Vitals.",
    },
  },
  {
    id: "clean-coding",
    category: "code",
    title: { vi: "Code sạch", en: "Clean Coding" },
    description: {
      vi: "Nguyên tắc và thực hành viết code sạch, dễ bảo trì.",
      en: "Principles and practices for writing clean, maintainable code.",
    },
  },
];

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
    topic: "react-ecosystem",
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
    topic: "react-ecosystem",
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
    topic: "web-performance",
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
    topic: "web-performance",
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
    topic: "clean-coding",
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
    topic: "clean-coding",
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
  {
    id: "16",
    slug: "state-management-2026",
    title: {
      vi: "State Management trong React 2026",
      en: "State Management in React 2026",
    },
    category: "tech",
    excerpt: {
      vi: "So sánh Zustand, Jotai, Valtio và signals — đâu là giải pháp phù hợp cho dự án của bạn?",
      en: "Comparing Zustand, Jotai, Valtio and signals — which solution fits your project?",
    },
    content: {
      vi: "State management trong React đã thay đổi hoàn toàn so với vài năm trước. Redux không còn là lựa chọn mặc định nữa. Thay vào đó, chúng ta có nhiều thư viện nhẹ hơn, mỗi cái phục vụ use case khác nhau.\n\nZustand — Simple & Flexible. Zustand là lựa chọn phổ biến nhất hiện nay. API đơn giản, không cần Provider, hỗ trợ TypeScript tuyệt vời. Zustand hoạt động theo mô hình flux đơn giản: tạo store với create(), sử dụng hooks để đọc state, và gọi actions để cập nhật.\n\nĐiểm mạnh nổi bật của Zustand là middleware system: persist cho localStorage, devtools cho Redux DevTools, immer cho immutable updates. Bạn có thể compose nhiều middleware lại với nhau.\n\nJotai — Atomic Approach. Jotai lấy cảm hứng từ Recoil nhưng API đơn giản hơn nhiều. Thay vì một store lớn, Jotai sử dụng atoms — những đơn vị state nhỏ nhất. Mỗi atom tự quản lý subscription, nên chỉ component nào sử dụng atom đó mới re-render.\n\nJotai đặc biệt tốt cho derived state. Bạn có thể tạo computed atoms từ các atoms khác, tương tự computed properties trong Vue.\n\nValtio — Proxy Magic. Valtio sử dụng JavaScript Proxy để tạo reactive state. Bạn mutate state trực tiếp như plain JavaScript object, Valtio sẽ tự tracking changes và trigger re-render.\n\nĐiều này làm cho code cực kỳ tự nhiên — không cần spread operators, không cần setter functions. Tuy nhiên, Proxy có overhead nhỏ và không phải lúc nào cũng predictable.\n\nSignals — The Future? Signals là concept được Preact, Solid.js và Angular đều adopt. React cũng có RFC cho signals. Signals track dependencies tự động tại compile time, cho performance tối ưu mà không cần memo hay useMemo.\n\nKết luận: Dùng Zustand nếu bạn cần giải pháp đa năng, Jotai cho granular state, Valtio cho developer experience tốt nhất. Signals là tương lai nhưng chưa stable trong React.",
      en: "State management in React has changed completely compared to a few years ago. Redux is no longer the default choice. Instead, we have many lighter libraries, each serving different use cases.\n\nZustand — Simple & Flexible. Zustand is the most popular choice today. Simple API, no Provider needed, excellent TypeScript support. Zustand works on a simple flux model: create store with create(), use hooks to read state, and call actions to update.\n\nZustand's standout feature is its middleware system: persist for localStorage, devtools for Redux DevTools, immer for immutable updates. You can compose multiple middleware together.\n\nJotai — Atomic Approach. Jotai is inspired by Recoil but with a much simpler API. Instead of one large store, Jotai uses atoms — the smallest units of state. Each atom manages its own subscription, so only components using that atom re-render.\n\nJotai is especially good for derived state. You can create computed atoms from other atoms, similar to computed properties in Vue.\n\nValtio — Proxy Magic. Valtio uses JavaScript Proxy to create reactive state. You mutate state directly like a plain JavaScript object, and Valtio automatically tracks changes and triggers re-renders.\n\nThis makes code extremely natural — no spread operators, no setter functions needed. However, Proxy has small overhead and isn't always predictable.\n\nSignals — The Future? Signals is a concept adopted by Preact, Solid.js, and Angular. React also has an RFC for signals. Signals track dependencies automatically at compile time, providing optimal performance without needing memo or useMemo.\n\nConclusion: Use Zustand if you need a versatile solution, Jotai for granular state, Valtio for the best developer experience. Signals are the future but not yet stable in React.",
    },
    date: "2026-03-01",
    updatedDate: "2026-03-05",
    author: "La Ngọc Hùng",
    image: null,
    color: "#1a3a5c",
    readTime: 12,
    topic: "react-ecosystem",
  },
  {
    id: "17",
    slug: "nextjs-app-router-patterns",
    title: {
      vi: "Patterns nâng cao với Next.js App Router",
      en: "Advanced Patterns with Next.js App Router",
    },
    category: "tech",
    excerpt: {
      vi: "Parallel routes, intercepting routes và streaming patterns trong App Router.",
      en: "Parallel routes, intercepting routes and streaming patterns in App Router.",
    },
    content: {
      vi: 'Next.js App Router giới thiệu nhiều patterns mới mà Pages Router không có. Những patterns này giúp xây dựng UX phức tạp mà vẫn giữ được performance tốt.\n\nParallel Routes: Đây là khả năng render nhiều pages cùng lúc trong cùng một layout. Sử dụng @folder convention để define slots. Ví dụ @dashboard và @analytics có thể render đồng thời.\n\nTrường hợp sử dụng phổ biến: dashboard với nhiều panels, mỗi panel có loading state riêng. Conditional routes dựa trên authentication — hiển thị @auth hoặc @app tùy trạng thái đăng nhập.\n\nIntercepting Routes: Pattern này cho phép "chặn" một route và hiển thị nó trong modal, trong khi vẫn giữ URL context. Ví dụ: click vào ảnh trong feed → hiển thị modal, nhưng share URL → hiển thị full page.\n\nSử dụng (..) convention: (.)photo intercepts tại cùng level, (..)photo intercepts level trên, (...)photo intercepts từ root. Kết hợp với Parallel Routes để tạo modal overlay.\n\nStreaming & Suspense: App Router hỗ trợ streaming SSR native. Bọc component chậm trong Suspense boundary, server sẽ gửi HTML skeleton trước rồi stream content sau.\n\nLoading.tsx tự động tạo Suspense boundary cho mỗi route segment. Kết hợp với generateStaticParams cho ISR.\n\nRoute Groups: Sử dụng (folder) để nhóm routes mà không ảnh hưởng URL. Hữu ích cho shared layouts: (marketing) và (app) có thể có root layouts khác nhau.\n\nServer Actions: Thay thế API Routes cho mutations. Define async function với "use server" directive, gọi trực tiếp từ component. Server Actions hỗ trợ progressive enhancement — form vẫn hoạt động khi JavaScript disabled.\n\nBest Practices: Luôn đặt data fetching ở Server Components. Sử dụng cache() và unstable_cache() để deduplicate requests. Prefer server-side validation với Zod.',
      en: 'Next.js App Router introduces many new patterns that Pages Router didn\'t have. These patterns help build complex UX while maintaining good performance.\n\nParallel Routes: This is the ability to render multiple pages simultaneously within the same layout. Use @folder convention to define slots. For example, @dashboard and @analytics can render simultaneously.\n\nCommon use case: dashboard with multiple panels, each panel having its own loading state. Conditional routes based on authentication — display @auth or @app depending on login status.\n\nIntercepting Routes: This pattern allows "intercepting" a route and displaying it in a modal while maintaining the URL context. For example: clicking a photo in feed → shows modal, but sharing URL → shows full page.\n\nUse (..) convention: (.)photo intercepts at same level, (..)photo intercepts one level up, (...)photo intercepts from root. Combine with Parallel Routes to create modal overlay.\n\nStreaming & Suspense: App Router supports native streaming SSR. Wrap slow components in Suspense boundary, server will send HTML skeleton first then stream content later.\n\nLoading.tsx automatically creates Suspense boundary for each route segment. Combine with generateStaticParams for ISR.\n\nRoute Groups: Use (folder) to group routes without affecting URL. Useful for shared layouts: (marketing) and (app) can have different root layouts.\n\nServer Actions: Replace API Routes for mutations. Define async function with "use server" directive, call directly from component. Server Actions support progressive enhancement — forms still work when JavaScript is disabled.\n\nBest Practices: Always place data fetching in Server Components. Use cache() and unstable_cache() to deduplicate requests. Prefer server-side validation with Zod.',
    },
    date: "2026-02-28",
    updatedDate: "2026-03-02",
    author: "La Ngọc Hùng",
    image: null,
    color: "#1a3a5c",
    readTime: 15,
    topic: "react-ecosystem",
  },
  {
    id: "18",
    slug: "css-architecture-at-scale",
    title: {
      vi: "Kiến trúc CSS cho dự án lớn",
      en: "CSS Architecture at Scale",
    },
    category: "design",
    excerpt: {
      vi: "CSS Modules, CSS-in-JS, hay Tailwind? Cách tổ chức styles trong dự án enterprise.",
      en: "CSS Modules, CSS-in-JS, or Tailwind? How to organize styles in enterprise projects.",
    },
    content: {
      vi: "Khi dự án phát triển, CSS trở thành một trong những phần khó quản lý nhất. Naming conflicts, specificity wars, dead CSS — tất cả đều là vấn đề thường gặp.\n\nCSS Modules là giải pháp đơn giản nhất. Mỗi file .module.css tự động scope styles vào component. Không cần BEM naming, không specificity issues. Next.js hỗ trợ CSS Modules out of the box.\n\nTổ chức file: đặt styles cạnh component (Button.module.css) hoặc trong thư mục styles/ riêng. Sử dụng composes để share styles giữa các modules. Design tokens nên đặt trong CSS custom properties ở :root.\n\nCSS-in-JS (styled-components, Emotion) mang lại developer experience tốt nhất: colocated styles, dynamic styling dựa trên props, automatic vendor prefixing. Nhưng nhược điểm là runtime cost — mỗi render phải serialize styles.\n\nNguyên tắc chung: đặt layout styles ở parent, visual styles ở child. Tránh margin trên child components — để parent quyết định spacing. Sử dụng CSS custom properties cho theming thay vì SCSS variables.\n\nResponsive strategy: mobile-first với min-width breakpoints. Sử dụng container queries cho component-level responsiveness. Prefer fluid typography với clamp() thay vì media queries cho font-size.",
      en: "As projects grow, CSS becomes one of the hardest parts to manage. Naming conflicts, specificity wars, dead CSS — all common problems.\n\nCSS Modules is the simplest solution. Each .module.css file automatically scopes styles to a component. No need for BEM naming, no specificity issues. Next.js supports CSS Modules out of the box.\n\nFile organization: place styles alongside components (Button.module.css) or in a separate styles/ directory. Use composes to share styles between modules. Design tokens should be placed in CSS custom properties at :root.\n\nCSS-in-JS (styled-components, Emotion) provides the best developer experience: colocated styles, dynamic styling based on props, automatic vendor prefixing. But the downside is runtime cost — each render must serialize styles.\n\nGeneral principle: put layout styles on parent, visual styles on child. Avoid margin on child components — let parents decide spacing. Use CSS custom properties for theming instead of SCSS variables.\n\nResponsive strategy: mobile-first with min-width breakpoints. Use container queries for component-level responsiveness. Prefer fluid typography with clamp() instead of media queries for font-size.",
    },
    date: "2026-02-22",
    updatedDate: "2026-02-25",
    author: "La Ngọc Hùng",
    image: null,
    color: "#5c1a3a",
    readTime: 10,
  },
  {
    id: "19",
    slug: "accessibility-deep-dive",
    title: {
      vi: "Accessibility: Không chỉ là checklist",
      en: "Accessibility: More Than a Checklist",
    },
    category: "design",
    excerpt: {
      vi: "Hiểu sâu về a11y — từ semantic HTML đến screen readers và keyboard navigation.",
      en: "Deep understanding of a11y — from semantic HTML to screen readers and keyboard navigation.",
    },
    content: {
      vi: 'Accessibility (a11y) không phải là thêm aria-label vào mọi thứ. Đó là thiết kế sản phẩm cho tất cả mọi người, bao gồm người khiếm thị, khiếm thính, và người sử dụng các thiết bị hỗ trợ.\n\nSemantic HTML là foundation. Dùng đúng tag: button cho actions, a cho navigation, main/nav/aside cho landmarks. Screen readers dựa vào semantic structure để navigate — heading hierarchy (h1 > h2 > h3) đặc biệt quan trọng.\n\nKeyboard Navigation: Mọi interactive element phải accessible bằng keyboard. Tab order theo visual order. Focus trap trong modals. Skip links cho main content. Tránh tabindex > 0.\n\nARIA chỉ là phương án cuối cùng khi HTML native không đủ. Nguyên tắc: No ARIA is better than bad ARIA. Ví dụ, dùng button thay vì div role="button" — button đã có keyboard support và focus management built-in.\n\nColor & Contrast: WCAG 2.1 AA yêu cầu 4.5:1 cho normal text, 3:1 cho large text. Đừng dùng màu là chỉ báo duy nhất — thêm icon, text, hoặc pattern. Test với color blindness simulators.\n\nForms: Mỗi input phải có label visible. aria-describedby cho help text. aria-invalid và aria-errormessage cho error states. Group related inputs với fieldset/legend.\n\nTesting: Dùng axe DevTools cho automated testing. NVDA (free) hoặc VoiceOver cho manual testing. Keyboard-only navigation test mỗi sprint.',
      en: "Accessibility (a11y) is not about adding aria-label to everything. It's about designing products for everyone, including people with visual impairments, hearing impairments, and those using assistive technologies.\n\nSemantic HTML is the foundation. Use the right tags: button for actions, a for navigation, main/nav/aside for landmarks. Screen readers rely on semantic structure to navigate — heading hierarchy (h1 > h2 > h3) is especially important.\n\nKeyboard Navigation: Every interactive element must be keyboard accessible. Tab order follows visual order. Focus trap in modals. Skip links for main content. Avoid tabindex > 0.\n\nARIA is only a last resort when native HTML is insufficient. Principle: No ARIA is better than bad ARIA. For example, use button instead of div role=\"button\" — button already has keyboard support and focus management built-in.\n\nColor & Contrast: WCAG 2.1 AA requires 4.5:1 for normal text, 3:1 for large text. Don't use color as the only indicator — add icon, text, or pattern. Test with color blindness simulators.\n\nForms: Every input must have a visible label. aria-describedby for help text. aria-invalid and aria-errormessage for error states. Group related inputs with fieldset/legend.\n\nTesting: Use axe DevTools for automated testing. NVDA (free) or VoiceOver for manual testing. Keyboard-only navigation test every sprint.",
    },
    date: "2026-02-18",
    updatedDate: "2026-02-20",
    author: "La Ngọc Hùng",
    image: null,
    color: "#5c1a3a",
    readTime: 11,
  },
  {
    id: "20",
    slug: "monorepo-turborepo-guide",
    title: {
      vi: "Monorepo với Turborepo: Hướng dẫn toàn diện",
      en: "Monorepo with Turborepo: A Comprehensive Guide",
    },
    category: "code",
    excerpt: {
      vi: "Tổ chức codebase lớn với Turborepo, shared packages và CI/CD optimization.",
      en: "Organize large codebases with Turborepo, shared packages and CI/CD optimization.",
    },
    content: {
      vi: 'Monorepo không phải là "bỏ tất cả code vào 1 repo". Đó là chiến lược tổ chức code cho phép chia sẻ code, tooling và configuration giữa nhiều projects.\n\nTại sao Monorepo? Code sharing dễ dàng — shared utils, UI components, types có thể import trực tiếp. Atomic changes — sửa API và frontend trong cùng một PR. Consistent tooling — ESLint, TypeScript, Prettier config dùng chung.\n\nTurborepo Architecture: Workspace root chứa turbo.json và package.json. Mỗi app/ và package/ là một workspace. Turborepo cache task results (build, test, lint) và chỉ chạy lại khi files thay đổi.\n\nShared Packages: Tạo packages/ui cho shared components, packages/config cho shared configs, packages/types cho shared TypeScript types. Sử dụng internal packages (không publish lên npm) với "main": "./src/index.ts".\n\nCaching Strategy: Local cache ở .turbo/. Remote cache với Vercel Remote Cache hoặc self-hosted. Cache dựa trên file hash — nếu input không đổi, output được reuse. Tiết kiệm 40-60% CI time.\n\nCI/CD Optimization: Turborepo biết dependency graph — chỉ build packages bị ảnh hưởng. GitHub Actions với turbo run build --filter=[\'...@scope/app\']. Deploy preview cho mỗi PR.\n\nTask Pipeline: Define dependencies giữa tasks trong turbo.json. "build" depends on "^build" (build dependencies trước), "test" depends on "build" (build trước rồi test).\n\nMigration Strategy: Bắt đầu nhỏ — move 1-2 packages vào monorepo. Đừng migrate tất cả cùng lúc. Setup CI/CD trước khi thêm nhiều packages.',
      en: 'Monorepo is not "putting all code in 1 repo". It\'s a code organization strategy that allows sharing code, tooling, and configuration across multiple projects.\n\nWhy Monorepo? Easy code sharing — shared utils, UI components, types can be imported directly. Atomic changes — fix API and frontend in the same PR. Consistent tooling — ESLint, TypeScript, Prettier config shared across all.\n\nTurborepo Architecture: Workspace root contains turbo.json and package.json. Each app/ and package/ is a workspace. Turborepo caches task results (build, test, lint) and only reruns when files change.\n\nShared Packages: Create packages/ui for shared components, packages/config for shared configs, packages/types for shared TypeScript types. Use internal packages (not published to npm) with "main": "./src/index.ts".\n\nCaching Strategy: Local cache at .turbo/. Remote cache with Vercel Remote Cache or self-hosted. Cache based on file hash — if input hasn\'t changed, output is reused. Saves 40-60% CI time.\n\nCI/CD Optimization: Turborepo knows the dependency graph — only builds affected packages. GitHub Actions with turbo run build --filter=[\'...@scope/app\']. Deploy preview for each PR.\n\nTask Pipeline: Define dependencies between tasks in turbo.json. "build" depends on "^build" (build dependencies first), "test" depends on "build" (build first then test).\n\nMigration Strategy: Start small — move 1-2 packages into monorepo. Don\'t migrate everything at once. Setup CI/CD before adding more packages.',
    },
    date: "2026-02-15",
    updatedDate: "2026-02-18",
    author: "La Ngọc Hùng",
    image: null,
    color: "#3a5c1a",
    readTime: 14,
    topic: "clean-coding",
  },
  {
    id: "21",
    slug: "developer-burnout",
    title: {
      vi: "Developer Burnout: Nhận biết và phòng tránh",
      en: "Developer Burnout: Recognition and Prevention",
    },
    category: "life",
    excerpt: {
      vi: "Dấu hiệu burnout, nguyên nhân và chiến lược phục hồi dành cho developers.",
      en: "Signs of burnout, causes, and recovery strategies for developers.",
    },
    content: {
      vi: 'Burnout không phải là lười biếng. Đó là trạng thái kiệt sức về thể chất và tinh thần do stress kéo dài. Trong ngành tech, burnout đặc biệt phổ biến vì áp lực liên tục học hỏi, deadlines, và "hustle culture".\n\nDấu hiệu nhận biết: Mất hứng thú với code — thứ từng khiến bạn phấn khích. Mệt mỏi dù ngủ đủ giấc. Cynicism về project và đồng nghiệp. Giảm productivity rõ rệt. Khó tập trung vào tasks đơn giản.\n\nNguyên nhân phổ biến: Overwork liên tục — on-call 24/7, overtime không compensated. Lack of control — không được quyết định tech stack hay architecture. Unclear expectations — requirements thay đổi liên tục. Isolation — remote work thiếu social connection.\n\nChiến lược phòng tránh: Set boundaries rõ ràng. Nói "không" với tasks mới khi đang overloaded. Tách work/personal devices. Không check Slack sau giờ làm.\n\nPhục hồi: Nghỉ phép thực sự — không mang laptop. Tìm hobbies ngoài coding. Exercise 30 phút/ngày. Therapy/coaching nếu cần. Journaling giúp process emotions.\n\nVai trò của leadership: Managers cần recognize signs sớm. Không glorify overtime. Encourage PTO usage. Rotate on-call fairly. Invest in developer experience tools.',
      en: "Burnout is not laziness. It's a state of physical and mental exhaustion caused by prolonged stress. In the tech industry, burnout is especially common due to constant pressure to learn, deadlines, and \"hustle culture\".\n\nRecognition signs: Loss of interest in code — something that used to excite you. Fatigue despite adequate sleep. Cynicism about projects and colleagues. Notable productivity decrease. Difficulty concentrating on simple tasks.\n\nCommon causes: Continuous overwork — on-call 24/7, uncompensated overtime. Lack of control — no say in tech stack or architecture decisions. Unclear expectations — constantly changing requirements. Isolation — remote work lacking social connection.\n\nPrevention strategies: Set clear boundaries. Say \"no\" to new tasks when overloaded. Separate work/personal devices. Don't check Slack after hours.\n\nRecovery: Take real vacation — don't bring laptop. Find hobbies outside coding. Exercise 30 minutes/day. Therapy/coaching if needed. Journaling helps process emotions.\n\nRole of leadership: Managers need to recognize signs early. Don't glorify overtime. Encourage PTO usage. Rotate on-call fairly. Invest in developer experience tools.",
    },
    date: "2026-02-10",
    updatedDate: "2026-02-12",
    author: "La Ngọc Hùng",
    image: null,
    color: "#4a2a6a",
    readTime: 9,
  },
  {
    id: "22",
    slug: "api-design-best-practices",
    title: {
      vi: "API Design: Best Practices cho Frontend Developers",
      en: "API Design: Best Practices for Frontend Developers",
    },
    category: "tutorial",
    excerpt: {
      vi: "RESTful conventions, error handling, pagination và versioning mà frontend cần biết.",
      en: "RESTful conventions, error handling, pagination and versioning frontend devs need to know.",
    },
    content: {
      vi: "Dù bạn là frontend developer, hiểu API design giúp bạn communicate tốt hơn với backend team và xây dựng UI resilient hơn.\n\nRESTful Conventions: GET cho read, POST cho create, PUT/PATCH cho update, DELETE cho xóa. Dùng nouns cho resources (GET /users, POST /users). Nested resources cho relationships (GET /users/123/posts).\n\nURL Design: Dùng kebab-case, plural nouns. Filters qua query params: GET /posts?category=tech&sort=date. Pagination: ?page=1&limit=20 hoặc cursor-based ?cursor=abc&limit=20.\n\nError Handling: Standardize error response format. Mỗi error cần: status code, error code (machine-readable), message (human-readable), optional details. Frontend should handle: 400 (validation), 401 (auth), 403 (forbidden), 404 (not found), 429 (rate limit), 500 (server error).\n\nPagination cho Frontend: Offset-based đơn giản nhưng không efficient cho dataset lớn. Cursor-based tốt hơn cho infinite scroll. Response nên chứa: data, total count, next cursor/page.\n\nVersioning: URL versioning (/v1/users) hoặc header versioning (Accept: application/vnd.api+json;version=1). URL versioning phổ biến và dễ hiểu hơn.\n\nCaching: Respect Cache-Control headers. Implement ETag cho conditional requests. SWR/React Query giúp manage cache tự động.\n\nSecurity: Luôn dùng HTTPS. JWT tokens trong httpOnly cookies, không localStorage. CORS configuration chính xác. Rate limiting cho API endpoints.",
      en: "Even as a frontend developer, understanding API design helps you communicate better with backend teams and build more resilient UIs.\n\nRESTful Conventions: GET for read, POST for create, PUT/PATCH for update, DELETE for delete. Use nouns for resources (GET /users, POST /users). Nested resources for relationships (GET /users/123/posts).\n\nURL Design: Use kebab-case, plural nouns. Filters via query params: GET /posts?category=tech&sort=date. Pagination: ?page=1&limit=20 or cursor-based ?cursor=abc&limit=20.\n\nError Handling: Standardize error response format. Each error needs: status code, error code (machine-readable), message (human-readable), optional details. Frontend should handle: 400 (validation), 401 (auth), 403 (forbidden), 404 (not found), 429 (rate limit), 500 (server error).\n\nPagination for Frontend: Offset-based is simple but not efficient for large datasets. Cursor-based is better for infinite scroll. Response should contain: data, total count, next cursor/page.\n\nVersioning: URL versioning (/v1/users) or header versioning (Accept: application/vnd.api+json;version=1). URL versioning is more common and easier to understand.\n\nCaching: Respect Cache-Control headers. Implement ETag for conditional requests. SWR/React Query helps manage cache automatically.\n\nSecurity: Always use HTTPS. JWT tokens in httpOnly cookies, not localStorage. Precise CORS configuration. Rate limiting for API endpoints.",
    },
    date: "2026-03-03",
    updatedDate: "2026-03-06",
    author: "La Ngọc Hùng",
    image: null,
    color: "#2a4a6a",
    readTime: 13,
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
