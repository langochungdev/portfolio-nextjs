import { blogCategories, collectionColors } from "@/lib/mock/blog";
import type { Locale } from "@/lib/i18n/config";
import { CollectionSidebar } from "@/app/[lang]/_shared/CollectionSidebar";

interface BlogNavProps {
  locale: Locale;
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  categoryCounts: Record<string, number>;
  categoryLabels: Record<string, string>;
  totalPosts: number;
}

export function BlogNav({
  locale, activeCategory, onCategoryChange, categoryCounts, categoryLabels, totalPosts,
}: BlogNavProps) {
  const cats = blogCategories.filter((c) => c !== "allPosts");
  const items = cats.map((cat) => ({
    key: cat,
    label: categoryLabels[cat] ?? cat,
    color: collectionColors[cat] ?? "#1C1C1A",
    count: categoryCounts[cat] ?? 0,
  }));

  return (
    <CollectionSidebar
      locale={locale}
      activeKey={activeCategory}
      onSelect={onCategoryChange}
      allKey="allPosts"
      allLabel={categoryLabels.allPosts ?? "All Posts"}
      allCount={totalPosts}
      items={items}
      filters={[
        { key: "recent", label: "Most Recent" },
        { key: "oldest", label: "Oldest First" },
      ]}
    />
  );
}
