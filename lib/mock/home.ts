export const profileData = {
  avatar: "N",
  skills: [
    { name: "Next.js", icon: "/img/tech-stack-icon/nextjs-icon.png" },
    { name: "Nuxt.js", icon: "/img/tech-stack-icon/nuxtjs-icon.png" },
    { name: "Firebase", icon: "/img/tech-stack-icon/firebase-icon.png" },
    { name: "Git", icon: "/img/tech-stack-icon/git-icon.png" },
    { name: "Spring Boot", icon: "/img/tech-stack-icon/springboot-icon.png" },
    { name: "Vercel", icon: "/img/tech-stack-icon/vercel-icon.png" },
    { name: "Linux", icon: "/img/tech-stack-icon/linux-icon.png" },
    { name: "Figma", icon: "/img/tech-stack-icon/figma-icon.png" },
    { name: "Notion", icon: "/img/tech-stack-icon/notion-icon.png" },
    { name: "Claude", icon: "/img/tech-stack-icon/claude-icon.png" },
  ],
  social: {
    github: "https://github.com/example",
    linkedin: "https://linkedin.com/in/example",
    tiktok: "https://tiktok.com/@example",
    instagram: "https://instagram.com/example",
    facebook: "https://facebook.com/example",
    zalo: "https://zalo.me/example",
    pinterest: "https://pinterest.com/example",
  },
};

export const projectsData = [
  {
    id: "1",
    title: "Tạo Thiệp Tương Tác",
    image: "/img/project1.webp",
    touchDescription:
      "thay ảnh, nhạc và thông điệp trên các template gửi cho bạn bè lời chúc",
    description: {
      vi: "Nền tảng tạo thiệp tương tác trực tuyến.",
      en: "Interactive greeting card creation platform.",
    },
    tech: ["NuxtJS", "Spring Boot", "Vercel", "Firestore"],
    color: "#2d5a27",
    link: "https://story4u.online",
    source: "#",
  },
  {
    id: "2",
    title: "world chain game",
    image: "/img/project2.webp",
    touchDescription: "trò chơi nối từ bằng tiếng nha chat realtime",
    description: {
      vi: "Trang giới thiệu chi nhánh Cơm Tấm Long Xuyên.",
      en: "Landing page for Com Tam Long Xuyen branch.",
    },
    tech: ["NuxtJS", "Firestore", "Cloudinary", "Vercel", "Cloudflare"],
    color: "#5a2727",
    link: "https://wcg.langochung.me",
    source: "#",
  },
  {
    id: "3",
    title: "chi nhánh cơm tấm",
    image: "/img/project3.webp",
    touchDescription: "giới thiệu chuỗi chi nhánh cơm tấm của khách hàng",
    description: {
      vi: "Website chính thức của World Chain Game.",
      en: "Official website for World Chain Game.",
    },
    tech: ["NuxtJS", "Firestore", "Cloudinary", "Vercel", "Cloudflare"],
    color: "#27405a",
    link: "https://comtamlongxuyen.com",
    source: "#",
  },
  {
    id: "4",
    title: "Chat Application",
    image: "/img/project1.webp",
    touchDescription: "ứng dụng chat realtime với websocket và thông báo đẩy",
    description: {
      vi: "Ứng dụng nhắn tin thời gian thực với WebSocket và thông báo đẩy.",
      en: "Real-time messaging app with WebSocket and push notifications.",
    },
    tech: ["Node.js", "Socket.io", "React"],
    color: "#5a4827",
    link: "#",
    source: "#",
  },
];
