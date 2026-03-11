import type { Locale } from "@/lib/i18n/config";
import { CollectionSidebar } from "@/app/[lang]/_shared/CollectionSidebar";
import type { CollectionWithColor } from "@/app/[lang]/blog/_lib/types";

interface BlogNavProps {
  locale: Locale;
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  collections: CollectionWithColor[];
  categoryCounts: Record<string, number>;
  totalPosts: number;
}

export function BlogNav({
  locale, activeCategory, onCategoryChange, collections, categoryCounts, totalPosts,
}: BlogNavProps) {
  const items = collections.map((col) => ({
    key: col.id,
    label: col.name,
    color: col.color,
    count: categoryCounts[col.id] ?? 0,
  }));

  return (
    <CollectionSidebar
      locale={locale}
      activeKey={activeCategory}
      onSelect={onCategoryChange}
      allKey="allPosts"
      allLabel="All Posts"
      allCount={totalPosts}
      items={items}
      filters={[
        { key: "recent", label: "Most Recent" },
        { key: "oldest", label: "Oldest First" },
      ]}
    />
  );
}
