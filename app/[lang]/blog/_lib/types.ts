import type { PostDoc } from "@/lib/firebase/posts";
import type { CollectionDoc, TopicDoc } from "@/lib/firebase/collections";
import type { HintDoc } from "@/lib/firebase/hints";

export type { PostDoc, CollectionDoc, TopicDoc, HintDoc };

export interface CollectionWithColor extends CollectionDoc {
  color: string;
}

const COLLECTION_COLORS = [
  "#3B82F6",
  "#EC4899",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EF4444",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#6366F1",
];

export function assignCollectionColors(
  collections: CollectionDoc[],
): CollectionWithColor[] {
  return collections.map((c, i) => ({
    ...c,
    color: COLLECTION_COLORS[i % COLLECTION_COLORS.length],
  }));
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getExcerpt(content: string, maxLength = 120): string {
  const text = stripHtml(content);
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s\S*$/, "") + "…";
}

export function getReadTime(content: string): number {
  const wordCount = stripHtml(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

export interface BlogData {
  collections: CollectionWithColor[];
  topics: TopicDoc[];
  posts: PostDoc[];
  hints: HintDoc[];
  loading: boolean;
}
