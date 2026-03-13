import { cache } from "react";
import { fetchCollections, fetchTopics } from "@/lib/firebase/collections";
import { fetchPosts } from "@/lib/firebase/posts";
import { fetchHints } from "@/lib/firebase/hints";
import type { TopicDoc, PostDoc, HintDoc } from "./types";

interface RelatedVisibilityInput {
  topics: TopicDoc[];
  posts: PostDoc[];
  hints: HintDoc[];
}

export function applyRelatedVisibility({
  topics,
  posts,
  hints,
}: RelatedVisibilityInput): Pick<RelatedVisibilityInput, "posts" | "hints"> {
  const publicTopicIds = new Set(topics.map((topic) => topic.id));
  const topicCollectionById = new Map(
    topics.map((topic) => [topic.id, topic.collectionId] as const),
  );

  const filteredPosts = posts
    .filter((post) => {
      if (post.topicIds.length === 0) return true;
      return post.topicIds.every((topicId) => publicTopicIds.has(topicId));
    })
    .map((post) => {
      const inferredCollectionIds = post.topicIds
        .map((topicId) => topicCollectionById.get(topicId) ?? "")
        .filter((collectionId): collectionId is string => !!collectionId);

      if (inferredCollectionIds.length === 0) return post;

      const mergedCollectionIds = Array.from(
        new Set([...post.collectionIds, ...inferredCollectionIds]),
      );

      if (mergedCollectionIds.length === post.collectionIds.length) {
        return post;
      }

      return {
        ...post,
        collectionIds: mergedCollectionIds,
      };
    });

  const visiblePostIds = new Set(filteredPosts.map((post) => post.id));
  const filteredHints = hints.filter((hint) => {
    if (hint.topicId && !publicTopicIds.has(hint.topicId)) return false;
    if (hint.postId && !visiblePostIds.has(hint.postId)) return false;
    return true;
  });

  return { posts: filteredPosts, hints: filteredHints };
}

export const getBlogData = cache(async () => {
  const [collections, topics, posts, hints] = await Promise.all([
    fetchCollections(),
    fetchTopics(),
    fetchPosts(),
    fetchHints(),
  ]);

  const relatedFiltered = applyRelatedVisibility({ topics, posts, hints });

  return {
    collections,
    topics,
    posts: relatedFiltered.posts,
    hints: relatedFiltered.hints,
  };
});
