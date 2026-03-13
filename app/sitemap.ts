import type { MetadataRoute } from "next";
import { i18nConfig } from "@/lib/i18n/config";
import { getBlogData } from "@/app/[lang]/blog/_lib/getBlogData";

const BASE_URL = "https://langochung.me";

function buildAlternates(path: string) {
  return {
    languages: Object.fromEntries(
      i18nConfig.locales.map((loc) => [loc, `${BASE_URL}/${loc}${path}`]),
    ),
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = i18nConfig.locales;

  const staticRoutes = ["", "/blog", "/certificates"];
  const staticEntries: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    staticRoutes.map((route) => ({
      url: `${BASE_URL}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency:
        route === "/blog" ? ("daily" as const) : ("weekly" as const),
      priority: route === "" ? 1.0 : 0.8,
      alternates: buildAlternates(route),
    })),
  );

  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const { posts } = await getBlogData();
    blogEntries = locales.flatMap((locale) =>
      posts.map((post) => ({
        url: `${BASE_URL}/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt || post.createdAt),
        changeFrequency: "weekly" as const,
        priority: 0.6,
        alternates: buildAlternates(`/blog/${post.slug}`),
      })),
    );
  } catch {
    blogEntries = [];
  }

  return [...staticEntries, ...blogEntries];
}
