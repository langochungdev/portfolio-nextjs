import type { BlogPost, BlogTopic } from "@/lib/mock/blog";

export type DisplayItem =
  | { type: "post"; post: BlogPost }
  | { type: "topic"; topic: BlogTopic; posts: BlogPost[] };

export function groupByCategory(posts: BlogPost[]) {
  const groups: Record<string, BlogPost[]> = {};
  for (const p of posts) (groups[p.category] ??= []).push(p);
  return groups;
}

export function buildDisplayItems(
  posts: BlogPost[],
  topics: BlogTopic[],
): DisplayItem[] {
  const items: DisplayItem[] = [];
  const used = new Set<string>();
  for (const t of topics) {
    const tp = posts.filter((p) => p.topic === t.id);
    if (tp.length) {
      items.push({ type: "topic", topic: t, posts: tp });
      tp.forEach((p) => used.add(p.id));
    }
  }
  for (const p of posts) {
    if (!used.has(p.id)) items.push({ type: "post", post: p });
  }
  return items;
}

export function latestDate(posts: BlogPost[]) {
  return posts.reduce(
    (l, p) => (p.updatedDate > l ? p.updatedDate : l),
    posts[0].updatedDate,
  );
}
