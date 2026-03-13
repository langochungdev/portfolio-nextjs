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
import { applyRelatedVisibility } from "./getBlogData";
import {
  assignCollectionColors,
  type BlogData,
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

interface InitialData {
  collections: Awaited<ReturnType<typeof fetchCollections>>;
  topics: TopicDoc[];
  posts: PostDoc[];
  hints: HintDoc[];
}

export function BlogDataProvider({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData?: InitialData;
}) {
  const [data, setData] = useState<BlogData>(() => {
    if (cachedData && Date.now() - cachedAt < CACHE_TTL) return cachedData;
    if (initialData) {
      const relatedFiltered = applyRelatedVisibility({
        topics: initialData.topics,
        posts: initialData.posts,
        hints: initialData.hints,
      });

      const result: BlogData = {
        collections: assignCollectionColors(initialData.collections),
        topics: initialData.topics,
        posts: relatedFiltered.posts,
        hints: relatedFiltered.hints,
        loading: false,
      };
      cachedData = result;
      cachedAt = Date.now();
      return result;
    }
    return EMPTY;
  });

  useEffect(() => {
    if (data !== EMPTY) return;
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
        const relatedFiltered = applyRelatedVisibility({ topics, posts, hints });
        const result: BlogData = {
          collections,
          topics,
          posts: relatedFiltered.posts,
          hints: relatedFiltered.hints,
          loading: false,
        };
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
  }, [data]);

  return (
    <BlogDataContext.Provider value={data}>{children}</BlogDataContext.Provider>
  );
}
