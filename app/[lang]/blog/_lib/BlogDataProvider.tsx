"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { fetchCollections, fetchTopics } from "@/lib/firebase/collections";
import { fetchPosts } from "@/lib/firebase/posts";
import { fetchHints } from "@/lib/firebase/hints";
import {
  assignCollectionColors,
  type BlogData,
  type CollectionWithColor,
  type PostDoc,
  type TopicDoc,
  type HintDoc,
} from "./types";

const EMPTY: BlogData = {
  collections: [],
  topics: [],
  posts: [],
  hints: [],
  loading: true,
};

const BlogDataContext = createContext<BlogData>(EMPTY);

export function useBlogData() {
  return useContext(BlogDataContext);
}

const CACHE_TTL = 5 * 60 * 1000;
let cachedData: BlogData | null = null;
let cachedAt = 0;

export function BlogDataProvider({ children }: { children: ReactNode }) {
  const isFresh = cachedData && Date.now() - cachedAt < CACHE_TTL;
  const [data, setData] = useState<BlogData>(isFresh ? cachedData! : EMPTY);

  useEffect(() => {
    if (isFresh) return;
    let cancelled = false;

    async function load() {
      try {
        const [rawCollections, topics, posts, hints] = await Promise.all([
          fetchCollections(),
          fetchTopics(),
          fetchPosts(),
          fetchHints(),
        ]);

        if (cancelled) return;

        const collections = assignCollectionColors(rawCollections);
        const result: BlogData = { collections, topics, posts, hints, loading: false };
        cachedData = result;
        cachedAt = Date.now();
        setData(result);
      } catch (err) {
        console.error("Failed to load blog data:", err);
        if (!cancelled) {
          setData((prev) => ({ ...prev, loading: false }));
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isFresh]);

  return (
    <BlogDataContext.Provider value={data}>{children}</BlogDataContext.Provider>
  );
}
