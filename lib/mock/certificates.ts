export interface Certificate {
  id: string;
  title: { vi: string; en: string };
  issuer: string;
  date: string;
  image: string;
  credentialUrl: string | null;
  category: string;
}

export const certificates: Certificate[] = [
  {
    id: "1",
    title: {
      vi: "AWS Certified Cloud Practitioner",
      en: "AWS Certified Cloud Practitioner",
    },
    issuer: "Amazon Web Services",
    date: "2025-11-10",
    image: "https://placehold.co/400x300/0a1628/38bdf8?text=AWS+Cloud",
    credentialUrl: null,
    category: "cloud",
  },
  {
    id: "2",
    title: {
      vi: "Meta Front-End Developer",
      en: "Meta Front-End Developer",
    },
    issuer: "Meta (Coursera)",
    date: "2025-08-20",
    image: "https://placehold.co/400x300/1a365d/63b3ed?text=Meta+Frontend",
    credentialUrl: null,
    category: "frontend",
  },
  {
    id: "3",
    title: {
      vi: "Google UX Design",
      en: "Google UX Design",
    },
    issuer: "Google (Coursera)",
    date: "2025-06-15",
    image: "https://placehold.co/400x300/2d3748/f6ad55?text=Google+UX",
    credentialUrl: null,
    category: "design",
  },
  {
    id: "4",
    title: {
      vi: "Oracle Certified Professional: Java SE 17",
      en: "Oracle Certified Professional: Java SE 17",
    },
    issuer: "Oracle",
    date: "2025-03-01",
    image: "https://placehold.co/400x300/742a2a/fc8181?text=Oracle+Java",
    credentialUrl: null,
    category: "backend",
  },
  {
    id: "5",
    title: {
      vi: "VMware Spring Professional",
      en: "VMware Spring Professional",
    },
    issuer: "VMware",
    date: "2025-01-12",
    image: "https://placehold.co/400x300/22543d/68d391?text=Spring+Pro",
    credentialUrl: null,
    category: "backend",
  },
];

export const certCategories = [
  "cloud",
  "frontend",
  "design",
  "backend",
] as const;

export type CertCategory = (typeof certCategories)[number];

export const certCollectionColors: Record<string, string> = {
  cloud: "#3B82F6",
  frontend: "#10B981",
  design: "#EC4899",
  backend: "#F59E0B",
};
