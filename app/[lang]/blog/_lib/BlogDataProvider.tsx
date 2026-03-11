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

export function BlogDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<BlogData>(EMPTY);

  useEffect(() => {
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
        setData({ collections, topics, posts, hints, loading: false });
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
  }, []);

  return (
    <BlogDataContext.Provider value={data}>{children}</BlogDataContext.Provider>
  );
}
