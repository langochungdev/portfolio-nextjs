import type { PostDoc } from "@/lib/firebase/posts";

const SITE_URL = "https://langochung.me";
const SITE_NAME = "langochungdev";
const AUTHOR_NAME = "La Ngọc Hùng";
const AUTHOR_IMAGE = `${SITE_URL}/img/portrait.webp`;
const SITE_LOGO = `${SITE_URL}/icon-512x512.png`;
const AUTHOR_JOB_TITLE = "Software Engineer";
const AUTHOR_DESCRIPTION =
  "La Ngọc Hùng (langochungdev) - Software Engineer chuyên về Full-stack Web Development với Next.js, Nuxt.js, Spring Boot, TypeScript, Firebase.";

export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: AUTHOR_NAME,
    alternateName: "langochungdev",
    url: SITE_URL,
    image: {
      "@type": "ImageObject",
      url: AUTHOR_IMAGE,
      width: 512,
      height: 512,
    },
    jobTitle: AUTHOR_JOB_TITLE,
    description: AUTHOR_DESCRIPTION,
    knowsAbout: [
      "Next.js",
      "Nuxt.js",
      "Spring Boot",
      "TypeScript",
      "Firebase",
      "Full-stack Development",
      "Web Development",
      "DevOps",
    ],
    sameAs: [
      "https://github.com/langochungdev",
      "https://linkedin.com/in/langochungdev",
    ],
    mainEntityOfPage: {
      "@type": "ProfilePage",
      "@id": `${SITE_URL}/#profilepage`,
    },
  };
}

export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    alternateName: AUTHOR_NAME,
    url: SITE_URL,
    description: AUTHOR_DESCRIPTION,
    publisher: { "@id": `${SITE_URL}/#person` },
    inLanguage: ["vi", "en"],
  };
}

export function profilePageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${SITE_URL}/#profilepage`,
    name: `${AUTHOR_NAME} - ${AUTHOR_JOB_TITLE}`,
    url: SITE_URL,
    description: AUTHOR_DESCRIPTION,
    mainEntity: { "@id": `${SITE_URL}/#person` },
    breadcrumb: { "@id": `${SITE_URL}/#breadcrumb-home` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };
}

export function breadcrumbSchema(
  items: { name: string; url: string }[],
  id: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${SITE_URL}/#${id}`,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function articleSchema(post: PostDoc, locale: string) {
  const url = `${SITE_URL}/${locale}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": url,
    headline: post.title,
    url,
    image: post.thumbnail || SITE_LOGO,
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    author: { "@id": `${SITE_URL}/#person` },
    publisher: {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: AUTHOR_NAME,
      logo: {
        "@type": "ImageObject",
        url: SITE_LOGO,
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };
}

export function blogListingSchema(
  posts: PostDoc[],
  locale: string,
) {
  const url = `${SITE_URL}/${locale}/blog`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": url,
    name: "Blog - langochungdev",
    url,
    description: `Blog posts by ${AUTHOR_NAME} about web development, software engineering, and technology.`,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: posts.length,
      itemListElement: posts.slice(0, 20).map((post, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/${locale}/blog/${post.slug}`,
        name: post.title,
      })),
    },
  };
}

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
