import { cache } from "react";
import { fetchCollections, fetchTopics } from "@/lib/firebase/collections";
import { fetchPosts } from "@/lib/firebase/posts";
import { fetchHints } from "@/lib/firebase/hints";

export const getBlogData = cache(async () => {
  const [collections, topics, posts, hints] = await Promise.all([
    fetchCollections(),
    fetchTopics(),
    fetchPosts(),
    fetchHints(),
  ]);
  return { collections, topics, posts, hints };
});
