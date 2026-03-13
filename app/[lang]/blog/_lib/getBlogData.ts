import { fetchCollections, fetchTopics } from "@/lib/firebase/collections";
import { fetchPostSummaries } from "@/lib/firebase/posts";
import type { TopicDoc, PostSummaryDoc } from "./types";

interface RelatedVisibilityInput {
  topics: TopicDoc[];
  posts: PostSummaryDoc[];
}

function shouldIgnoreBlogDataError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const code = (error as { code?: unknown }).code;
  if (code === "permission-denied" || code === "failed-precondition") {
    return true;
  }

  const message = (error as { message?: unknown }).message;
  return (
    typeof message === "string" &&
    message.includes("Missing or insufficient permissions")
  );
}

export function applyRelatedVisibility({
  topics,
  posts,
}: RelatedVisibilityInput): Pick<RelatedVisibilityInput, "posts"> {
  if (topics.length === 0) {
    return { posts };
  }

  const publicTopicIds = new Set(topics.map((topic) => topic.id));
  const filteredPosts = posts.filter((post) => {
    if (post.topicIds.length === 0) return true;
    return post.topicIds.every((topicId) => publicTopicIds.has(topicId));
  });

  return { posts: filteredPosts };
}

export async function getBlogData() {
  const [collections, topics, posts] = await Promise.all([
    fetchCollections().catch((error) => {
      if (shouldIgnoreBlogDataError(error)) return [];
      throw error;
    }),
    fetchTopics().catch((error) => {
      if (shouldIgnoreBlogDataError(error)) return [];
      throw error;
    }),
    fetchPostSummaries().catch((error) => {
      if (shouldIgnoreBlogDataError(error)) return [];
      throw error;
    }),
  ]);

  const relatedFiltered = applyRelatedVisibility({ topics, posts });

  return {
    collections,
    topics,
    posts: relatedFiltered.posts,
  };
}
