"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import { CollectionSidebar } from "@/app/[lang]/_shared/CollectionSidebar";
import { blogPosts, blogCategories, collectionColors } from "@/lib/mock/blog";
import styles from "@/app/style/blog/layout.module.css";

const DETAIL_RE = /^\/[a-z]{2}\/blog\/.+/;

export function BlogShell({ children }: { children: React.ReactNode }) {
  const { locale, dictionary: dict } = useDictionary();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isDetail = DETAIL_RE.test(pathname);

  const categories = blogCategories.filter((c) => c !== "allPosts");
  const catLabel = (k: string) =>
    dict.blog.categories[k as keyof typeof dict.blog.categories] ?? k;

  let activeCategory: string;
  if (isDetail) {
    const slug = pathname.split("/").pop();
    const post = blogPosts.find((p) => p.slug === slug);
    activeCategory = post?.category ?? "allPosts";
  } else {
    activeCategory = searchParams.get("cat") || "allPosts";
  }

  const collectionItems = categories.map((cat) => ({
    key: cat,
    label: catLabel(cat),
    color: collectionColors[cat] ?? "#1C1C1A",
    count: blogPosts.filter((p) => p.category === cat).length,
  }));

  const handleCategoryChange = (cat: string) => {
    const qs = cat === "allPosts" ? "" : `?cat=${cat}`;
    router.push(`/${locale}/blog${qs}`);
  };

  const shellClass = [
    styles.shell,
    isDetail ? styles.shellDetail : "",
    isDetail ? styles.hidePills : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={shellClass}>
      <CollectionSidebar
        locale={locale}
        activeKey={activeCategory}
        onSelect={handleCategoryChange}
        allKey="allPosts"
        allLabel={catLabel("allPosts")}
        allCount={blogPosts.length}
        items={collectionItems}
        filters={[
          { key: "recent", label: "Most Recent" },
          { key: "oldest", label: "Oldest First" },
        ]}
      />
      {children}
    </div>
  );
}
