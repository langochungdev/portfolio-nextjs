"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useDictionary } from "@/app/[lang]/_shared/DictionaryProvider";
import { CollectionSidebar } from "@/app/[lang]/_shared/CollectionSidebar";
import { useBlogData } from "@/app/[lang]/blog/_lib/BlogDataProvider";
import styles from "@/app/style/blog/layout.module.css";

const DETAIL_RE = /^\/[a-z]{2}\/blog\/.+/;

export function BlogShell({ children }: { children: React.ReactNode }) {
  const { locale, dictionary: dict } = useDictionary();
  const { collections, posts, loading } = useBlogData();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isDetail = DETAIL_RE.test(pathname);

  let activeCategory: string;
  if (isDetail) {
    const slug = pathname.split("/").pop();
    const post = posts.find((p) => p.slug === slug);
    activeCategory = post?.collectionId ?? "allPosts";
  } else {
    activeCategory = searchParams.get("cat") || "allPosts";
  }

  const collectionItems = collections.map((col) => ({
    key: col.id,
    label: col.name,
    color: col.color,
    count: posts.filter((p) => p.collectionId === col.id).length,
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

  if (loading) {
    return <div className={shellClass}>{children}</div>;
  }

  return (
    <div className={shellClass}>
      <CollectionSidebar
        locale={locale}
        activeKey={activeCategory}
        onSelect={handleCategoryChange}
        allKey="allPosts"
        allLabel={dict.blog.categories?.allPosts ?? "All Posts"}
        allCount={posts.length}
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
