import type { PostDoc, TopicDoc } from "./types";

export type DisplayItem =
  | { type: "post"; post: PostDoc }
  | { type: "topic"; topic: TopicDoc; posts: PostDoc[] };

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getExcerpt(html: string, maxLength = 160): string {
  const text = stripHtml(html);
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, "") + "…";
}

export function groupByCollection(posts: PostDoc[]) {
  const groups: Record<string, PostDoc[]> = {};
  for (const p of posts) (groups[p.collectionId] ??= []).push(p);
  return groups;
}

export function buildDisplayItems(
  posts: PostDoc[],
  topics: TopicDoc[],
): DisplayItem[] {
  const items: DisplayItem[] = [];
  const used = new Set<string>();
  for (const t of topics) {
    const tp = posts.filter((p) => p.topicId === t.id);
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

export function latestDate(posts: PostDoc[]) {
  return posts.reduce(
    (l, p) => (p.updatedAt > l ? p.updatedAt : l),
    posts[0]?.updatedAt ?? "",
  );
}
