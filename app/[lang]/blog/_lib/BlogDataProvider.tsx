"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { fetchCollections, fetchTopics } from "@/lib/firebase/collections";
import { fetchPostSummaries } from "@/lib/firebase/posts";
import { applyRelatedVisibility } from "./getBlogData";
import {
  assignCollectionColors,
  type BlogData,
  type PostSummaryDoc,
  type TopicDoc,
} from "./types";

const EMPTY: BlogData = {
  collections: [],
  topics: [],
  posts: [],
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
  posts: PostSummaryDoc[];
}

export function BlogDataProvider({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData?: InitialData;
}) {
  const [data, setData] = useState<BlogData>(() => {
    if (initialData) {
      const relatedFiltered = applyRelatedVisibility({
        topics: initialData.topics,
        posts: initialData.posts,
      });

      const result: BlogData = {
        collections: assignCollectionColors(initialData.collections),
        topics: initialData.topics,
        posts: relatedFiltered.posts,
        loading: false,
      };
      cachedData = result;
      cachedAt = Date.now();
      return result;
    }
    if (cachedData && Date.now() - cachedAt < CACHE_TTL) return cachedData;
    return EMPTY;
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [rawCollections, topics, posts] = await Promise.all([
          fetchCollections(),
          fetchTopics(),
          fetchPostSummaries(),
        ]);

        if (cancelled) return;

        const collections = assignCollectionColors(rawCollections);
        const relatedFiltered = applyRelatedVisibility({ topics, posts });
        const result: BlogData = {
          collections,
          topics,
          posts: relatedFiltered.posts,
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
  }, []);

  return (
    <BlogDataContext.Provider value={data}>{children}</BlogDataContext.Provider>
  );
}
