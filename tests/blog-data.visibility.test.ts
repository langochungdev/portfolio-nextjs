import { describe, expect, it } from "vitest";
import { applyRelatedVisibility } from "@/app/[lang]/blog/_lib/getBlogData";
import type { PostSummaryDoc, TopicDoc } from "@/app/[lang]/blog/_lib/types";

function makePost(overrides: Partial<PostSummaryDoc>): PostSummaryDoc {
  return {
    id: "p-default",
    postId: "p-default",
    title: "Post",
    slug: "post",
    summary: "Summary",
    thumbnail: "",
    excerpt: "excerpt",
    readTime: 1,
    collectionIds: [],
    topicIds: [],
    isPinned: false,
    orderMap: {},
    visibility: "public",
    views: 0,
    createdAt: "2026-03-14",
    updatedAt: "2026-03-14",
    ...overrides,
  };
}

function makeTopic(overrides: Partial<TopicDoc>): TopicDoc {
  return {
    id: "t-default",
    name: "Topic",
    slug: "topic",
    thumbnail: "",
    description: "",
    collectionId: "c-default",
    order: 0,
    visibility: "public",
    ...overrides,
  };
}

describe("applyRelatedVisibility", () => {
  it("filters posts that reference non-public topics", () => {
    const topics = [makeTopic({ id: "t-public", collectionId: "c-1" })];
    const posts: PostSummaryDoc[] = [
      makePost({ id: "p-1", postId: "p-1", topicIds: ["t-public"] }),
      makePost({ id: "p-2", postId: "p-2", topicIds: ["t-hidden"] }),
      makePost({ id: "p-3", postId: "p-3", topicIds: [] }),
    ];

    const { posts: filtered } = applyRelatedVisibility({ topics, posts });

    expect(filtered.map((post) => post.id)).toEqual(["p-1", "p-3"]);
  });

  it("keeps collectionIds unchanged without legacy inference", () => {
    const topics = [makeTopic({ id: "t-1", collectionId: "c-inferred" })];
    const posts = [
      makePost({
        id: "p-1",
        postId: "p-1",
        topicIds: ["t-1"],
        collectionIds: [],
      }),
    ];

    const { posts: filtered } = applyRelatedVisibility({ topics, posts });

    expect(filtered[0]?.collectionIds).toEqual([]);
  });
});
