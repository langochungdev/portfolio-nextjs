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
    id: "6",
    title: {
      vi: "AWS Solutions Architect Associate",
      en: "AWS Solutions Architect Associate",
    },
    issuer: "Amazon Web Services",
    date: "2025-09-05",
    image: "https://placehold.co/400x300/0d1f3c/60a5fa?text=AWS+SAA",
    credentialUrl: null,
    category: "cloud",
  },
  {
    id: "7",
    title: {
      vi: "Google Cloud Associate Engineer",
      en: "Google Cloud Associate Engineer",
    },
    issuer: "Google Cloud",
    date: "2025-07-22",
    image: "https://placehold.co/400x300/1a2744/93c5fd?text=GCP+ACE",
    credentialUrl: null,
    category: "cloud",
  },
  {
    id: "8",
    title: {
      vi: "Azure Fundamentals AZ-900",
      en: "Azure Fundamentals AZ-900",
    },
    issuer: "Microsoft",
    date: "2025-05-18",
    image: "https://placehold.co/400x300/1e3a5f/7dd3fc?text=Azure+AZ900",
    credentialUrl: null,
    category: "cloud",
  },
  {
    id: "9",
    title: {
      vi: "Azure Developer Associate AZ-204",
      en: "Azure Developer Associate AZ-204",
    },
    issuer: "Microsoft",
    date: "2025-04-10",
    image: "https://placehold.co/400x300/0c2d48/4fc3f7?text=Azure+AZ204",
    credentialUrl: null,
    category: "cloud",
  },
  {
    id: "10",
    title: {
      vi: "Terraform Associate",
      en: "Terraform Associate",
    },
    issuer: "HashiCorp",
    date: "2025-02-28",
    image: "https://placehold.co/400x300/1b2838/a78bfa?text=Terraform",
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
    id: "11",
    title: {
      vi: "React Developer Certificate",
      en: "React Developer Certificate",
    },
    issuer: "Meta",
    date: "2025-07-15",
    image: "https://placehold.co/400x300/1e3a5f/61dafb?text=React+Dev",
    credentialUrl: null,
    category: "frontend",
  },
  {
    id: "12",
    title: {
      vi: "Vue.js Advanced Developer",
      en: "Vue.js Advanced Developer",
    },
    issuer: "Vue School",
    date: "2025-06-01",
    image: "https://placehold.co/400x300/1a3328/4ade80?text=Vue+Advanced",
    credentialUrl: null,
    category: "frontend",
  },
  {
    id: "13",
    title: {
      vi: "TypeScript Professional",
      en: "TypeScript Professional",
    },
    issuer: "Microsoft",
    date: "2025-04-20",
    image: "https://placehold.co/400x300/1e293b/3b82f6?text=TypeScript",
    credentialUrl: null,
    category: "frontend",
  },
  {
    id: "14",
    title: {
      vi: "Next.js Mastery",
      en: "Next.js Mastery",
    },
    issuer: "Vercel",
    date: "2025-03-10",
    image: "https://placehold.co/400x300/0a0a0a/fafafa?text=Next.js",
    credentialUrl: null,
    category: "frontend",
  },
  {
    id: "15",
    title: {
      vi: "Nuxt.js Certification",
      en: "Nuxt.js Certification",
    },
    issuer: "NuxtLabs",
    date: "2025-01-25",
    image: "https://placehold.co/400x300/0f291e/00dc82?text=Nuxt+Cert",
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
    id: "16",
    title: {
      vi: "Figma UI Design Professional",
      en: "Figma UI Design Professional",
    },
    issuer: "Figma",
    date: "2025-05-10",
    image: "https://placehold.co/400x300/2d2040/a855f7?text=Figma+Pro",
    credentialUrl: null,
    category: "design",
  },
  {
    id: "17",
    title: {
      vi: "Interaction Design Foundation",
      en: "Interaction Design Foundation",
    },
    issuer: "IDF",
    date: "2025-03-22",
    image: "https://placehold.co/400x300/3b1d3f/e879f9?text=IxDF",
    credentialUrl: null,
    category: "design",
  },
  {
    id: "18",
    title: {
      vi: "Adobe XD Specialist",
      en: "Adobe XD Specialist",
    },
    issuer: "Adobe",
    date: "2025-02-14",
    image: "https://placehold.co/400x300/3b0d2e/f472b6?text=Adobe+XD",
    credentialUrl: null,
    category: "design",
  },
  {
    id: "19",
    title: {
      vi: "Design Systems with Storybook",
      en: "Design Systems with Storybook",
    },
    issuer: "Chromatic",
    date: "2025-01-05",
    image: "https://placehold.co/400x300/331a1a/fb7185?text=Storybook",
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
  {
    id: "20",
    title: {
      vi: "Node.js Application Developer",
      en: "Node.js Application Developer",
    },
    issuer: "OpenJS Foundation",
    date: "2025-06-08",
    image: "https://placehold.co/400x300/14291e/22c55e?text=Node+JSNAD",
    credentialUrl: null,
    category: "backend",
  },
  {
    id: "21",
    title: {
      vi: "PostgreSQL Professional",
      en: "PostgreSQL Professional",
    },
    issuer: "EDB",
    date: "2025-05-01",
    image: "https://placehold.co/400x300/1a2744/818cf8?text=PostgreSQL",
    credentialUrl: null,
    category: "backend",
  },
  {
    id: "22",
    title: {
      vi: "Docker Certified Associate",
      en: "Docker Certified Associate",
    },
    issuer: "Docker",
    date: "2025-04-15",
    image: "https://placehold.co/400x300/0d2137/38bdf8?text=Docker+DCA",
    credentialUrl: null,
    category: "backend",
  },
  {
    id: "23",
    title: {
      vi: "Kubernetes Administrator (CKA)",
      en: "Kubernetes Administrator (CKA)",
    },
    issuer: "CNCF",
    date: "2025-02-20",
    image: "https://placehold.co/400x300/1e293b/60a5fa?text=K8s+CKA",
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
