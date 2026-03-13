import { unstable_cache } from "next/cache";
import { fetchCollections, fetchTopics } from "@/lib/firebase/collections";
import { fetchPostSummaries } from "@/lib/firebase/posts";
import type { TopicDoc, PostSummaryDoc } from "./types";

interface RelatedVisibilityInput {
  topics: TopicDoc[];
  posts: PostSummaryDoc[];
}

function shouldReturnEmptyBlogData(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const code = (error as { code?: unknown }).code;
  if (code === "permission-denied" || code === "failed-precondition") {
    return true;
  }

  const message = (error as { message?: unknown }).message;
  return typeof message === "string" && message.includes("Missing or insufficient permissions");
}

export function applyRelatedVisibility({
  topics,
  posts,
}: RelatedVisibilityInput): Pick<RelatedVisibilityInput, "posts"> {
  const publicTopicIds = new Set(topics.map((topic) => topic.id));
  const filteredPosts = posts.filter((post) => {
    if (post.topicIds.length === 0) return true;
    return post.topicIds.every((topicId) => publicTopicIds.has(topicId));
  });

  return { posts: filteredPosts };
}

const getBlogDataCached = unstable_cache(
  async () => {
    try {
      const [collections, topics, posts] = await Promise.all([
        fetchCollections(),
        fetchTopics(),
        fetchPostSummaries(),
      ]);

      const relatedFiltered = applyRelatedVisibility({ topics, posts });

      return {
        collections,
        topics,
        posts: relatedFiltered.posts,
      };
    } catch (error) {
      if (!shouldReturnEmptyBlogData(error)) throw error;

      return {
        collections: [],
        topics: [],
        posts: [],
      };
    }
  },
  ["blog-data-v4"],
  { revalidate: 300 },
);

export async function getBlogData() {
  return getBlogDataCached();
}
