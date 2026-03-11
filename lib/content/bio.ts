export type BioBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: string[] };

export const bio: Record<"vi" | "en", BioBlock[]> = {
  vi: [
    {
      type: "quote",
      text: "\u201CMọi thứ đều có thể — chỉ là chưa có cách, hoặc chưa tới lúc. Việc của mình là tìm cách, hoặc tìm đến lúc cách xuất hiện.\u201D",
    },
    {
      type: "paragraph",
      text: "Sinh viên Công nghệ — thích những thứ sáng tạo, theo chủ nghĩa tối giản.",
    },
    {
      type: "heading",
      text: "Kỹ năng",
    },
    {
      type: "list",
      items: [
        "CI/CD · Microservices · Testing & Debugging · SEO",
        "Thiết kế & phát triển hệ thống CMS",
        "Sản xuất content video & viết bài",
        "Tiếng Anh giao tiếp & đọc hiểu văn bản",
      ],
    },
  ],
  en: [
    {
      type: "quote",
      text: "\u201CEverything is possible — it\u2019s just a matter of finding the way, or waiting for the right moment.\u201D",
    },
    {
      type: "paragraph",
      text: "CS student — drawn to creative things, minimalist by principle.",
    },
    {
      type: "heading",
      text: "Skills",
    },
    {
      type: "list",
      items: [
        "CI/CD · Microservices · Testing & Debugging · SEO",
        "CMS design & development",
        "Video content production & writing",
        "English communication & reading comprehension",
      ],
    },
  ],
};
