export type BioBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

export const bio: Record<"vi" | "en", BioBlock[]> = {
  vi: [
    {
      type: "heading",
      text: "Về tôi",
    },
    {
      type: "paragraph",
      text: "Viết đoạn giới thiệu bản thân của bạn ở đây. Ví dụ: tôi là lập trình viên fullstack với X năm kinh nghiệm...",
    },
    {
      type: "heading",
      text: "Kỹ năng",
    },
    {
      type: "list",
      items: [
        "Kỹ năng 1 — mô tả ngắn",
        "Kỹ năng 2 — mô tả ngắn",
        "Kỹ năng 3 — mô tả ngắn",
      ],
    },
    {
      type: "heading",
      text: "Kinh nghiệm",
    },
    {
      type: "paragraph",
      text: "Viết tóm tắt kinh nghiệm làm việc hoặc dự án nổi bật ở đây.",
    },
  ],
  en: [
    {
      type: "heading",
      text: "About",
    },
    {
      type: "paragraph",
      text: "Write your self-introduction here. E.g. I'm a fullstack developer with X years of experience...",
    },
    {
      type: "heading",
      text: "Skills",
    },
    {
      type: "list",
      items: [
        "Skill 1 — short description",
        "Skill 2 — short description",
        "Skill 3 — short description",
      ],
    },
    {
      type: "heading",
      text: "Experience",
    },
    {
      type: "paragraph",
      text: "Write a summary of your work experience or notable projects here.",
    },
  ],
};
