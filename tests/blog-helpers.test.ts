import { describe, expect, it } from "vitest";
import {
  buildDisplayItems,
  groupByCollection,
  latestDate,
} from "@/app/[lang]/blog/_lib/helpers";
import type { PostSummaryDoc, TopicDoc } from "@/app/[lang]/blog/_lib/types";

function post(
  id: string,
  overrides: Partial<PostSummaryDoc> = {},
): PostSummaryDoc {
  return {
    id,
    postId: id,
    title: `post-${id}`,
    slug: `slug-${id}`,
    summary: `summary-${id}`,
    thumbnail: "",
    excerpt: `excerpt-${id}`,
    readTime: 1,
    collectionIds: ["c-1"],
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

function topic(id: string, overrides: Partial<TopicDoc> = {}): TopicDoc {
  return {
    id,
    name: id,
    slug: id,
    thumbnail: "",
    description: "",
    collectionId: "c-1",
    order: 0,
    visibility: "public",
    ...overrides,
  };
}

describe("blog helpers", () => {
  it("groups post summaries by collection", () => {
    const grouped = groupByCollection([
      post("p1", { collectionIds: ["c-1"] }),
      post("p2", { collectionIds: ["c-1", "c-2"] }),
    ]);

    expect(grouped["c-1"]?.length).toBe(2);
    expect(grouped["c-2"]?.length).toBe(1);
  });

  it("builds topic + standalone display items", () => {
    const posts = [
      post("p1", { topicIds: ["t-1"] }),
      post("p2", { topicIds: [] }),
    ];
    const topics = [topic("t-1")];

    const items = buildDisplayItems(posts, topics);

    expect(items[0]?.type).toBe("topic");
    expect(items[1]?.type).toBe("post");
  });

  it("returns latest updated date", () => {
    const value = latestDate([
      post("p1", { updatedAt: "2026-03-01" }),
      post("p2", { updatedAt: "2026-03-11" }),
      post("p3", { updatedAt: "2026-03-03" }),
    ]);

    expect(value).toBe("2026-03-11");
  });
});
