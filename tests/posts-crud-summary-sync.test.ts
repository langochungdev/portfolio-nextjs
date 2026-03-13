import { beforeEach, describe, expect, it, vi } from "vitest";

const addDocMock = vi.fn();
const updateDocMock = vi.fn();
const deleteDocMock = vi.fn();
const setDocMock = vi.fn();
const serverTimestampMock = vi.fn(() => "__ts__");

vi.mock("@/lib/firebase/config", () => ({
  getFirebaseDb: () => ({ __db: true }),
}));

vi.mock("firebase/firestore", () => ({
  collection: vi.fn((db: unknown, name: string) => ({ db, name })),
  addDoc: (...args: unknown[]) => addDocMock(...args),
  updateDoc: (...args: unknown[]) => updateDocMock(...args),
  deleteDoc: (...args: unknown[]) => deleteDocMock(...args),
  setDoc: (...args: unknown[]) => setDocMock(...args),
  doc: vi.fn((db: unknown, name: string, id: string) => ({ db, name, id })),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  serverTimestamp: () => serverTimestampMock(),
  writeBatch: vi.fn(() => ({ update: vi.fn(), set: vi.fn(), commit: vi.fn() })),
}));

import { createPost, deletePost, updatePost } from "@/lib/firebase/posts";

describe("posts CRUD summary sync", () => {
  beforeEach(() => {
    addDocMock.mockReset();
    updateDocMock.mockReset();
    deleteDocMock.mockReset();
    setDocMock.mockReset();
    serverTimestampMock.mockClear();
  });

  it("creates post summary when creating a post", async () => {
    addDocMock.mockResolvedValueOnce({ id: "p1" });

    await createPost({
      title: "A title",
      slug: "a-title",
      summary: "Manual summary",
      thumbnail: "",
      content: "<p>Hello world</p>",
      collectionIds: ["c1"],
      topicIds: ["t1"],
      isPinned: false,
      orderMap: {},
      visibility: "public",
    });

    expect(addDocMock).toHaveBeenCalledTimes(1);
    expect(setDocMock).toHaveBeenCalledTimes(1);
    expect(setDocMock.mock.calls[0]?.[1]).toMatchObject({
      postId: "p1",
      slug: "a-title",
      summary: "Manual summary",
      excerpt: "Manual summary",
      readTime: 1,
      visibility: "public",
    });
  });

  it("updates summary fields using manual summary", async () => {
    await updatePost("p2", {
      title: "Updated",
      summary: "Updated summary",
      content: "<p>One two three four</p>",
      visibility: "hidden",
    });

    expect(updateDocMock).toHaveBeenCalledTimes(1);
    expect(updateDocMock.mock.calls[0]?.[1]).toMatchObject({
      title: "Updated",
      summary: "Updated summary",
      excerpt: "Updated summary",
      readTime: 1,
      visibility: "hidden",
    });
    expect(setDocMock).toHaveBeenCalledTimes(1);
    expect(setDocMock.mock.calls[0]?.[1]).toMatchObject({
      postId: "p2",
      title: "Updated",
      summary: "Updated summary",
      excerpt: "Updated summary",
      readTime: 1,
      visibility: "hidden",
    });
    expect(setDocMock.mock.calls[0]?.[2]).toEqual({ merge: true });
  });

  it("deletes both post and summary docs", async () => {
    await deletePost("p3");
    expect(deleteDocMock).toHaveBeenCalledTimes(2);
  });
});
