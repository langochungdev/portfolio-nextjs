import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/config";
import type { VisibilityStatus } from "@/lib/firebase/collections";
import { calcReadTime } from "@/lib/firebase/post-summary";

const db = getFirebaseDb();

export interface PostInput {
  title: string;
  slug: string;
  summary: string;
  thumbnail: string;
  content: string;
  collectionIds: string[];
  topicIds: string[];
  isPinned: boolean;
  orderMap: Record<string, number>;
  visibility: VisibilityStatus;
}

export interface PostDoc extends PostInput {
  id: string;
  views: number;
  excerpt: string;
  readTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostSummaryDoc {
  id: string;
  postId: string;
  title: string;
  slug: string;
  summary: string;
  thumbnail: string;
  excerpt: string;
  readTime: number;
  collectionIds: string[];
  topicIds: string[];
  isPinned: boolean;
  orderMap: Record<string, number>;
  visibility: VisibilityStatus;
  views: number;
  createdAt: string;
  updatedAt: string;
}

function formatTimestamp(ts: { seconds: number } | null): string {
  if (!ts) return new Date().toISOString().split("T")[0];
  return new Date(ts.seconds * 1000).toISOString().split("T")[0];
}

function docToPost(id: string, data: Record<string, unknown>): PostDoc {
  const timestamps = (data.timestamps ?? {}) as Record<
    string,
    { seconds: number } | null
  >;
  return {
    id,
    title: (data.title as string) ?? "",
    slug: (data.slug as string) ?? "",
    summary: (data.summary as string) ?? "",
    thumbnail: (data.thumbnail as string) ?? "",
    content: (data.content as string) ?? "",
    collectionIds: Array.isArray(data.collectionIds)
      ? (data.collectionIds as string[])
      : [],
    topicIds: Array.isArray(data.topicIds) ? (data.topicIds as string[]) : [],
    isPinned: (data.isPinned as boolean) ?? false,
    orderMap: (data.orderMap as Record<string, number>) ?? {},
    visibility: (data.visibility as VisibilityStatus) ?? "public",
    views: (data.views as number) ?? 0,
    excerpt: (data.excerpt as string) ?? "",
    readTime: (data.readTime as number) ?? 1,
    createdAt: formatTimestamp(timestamps.createdAt ?? null),
    updatedAt: formatTimestamp(timestamps.updatedAt ?? null),
  };
}

function docToPostSummary(
  id: string,
  data: Record<string, unknown>,
): PostSummaryDoc {
  const timestamps = (data.timestamps ?? {}) as Record<
    string,
    { seconds: number } | null
  >;
  return {
    id,
    postId: (data.postId as string) ?? id,
    title: (data.title as string) ?? "",
    slug: (data.slug as string) ?? "",
    summary: (data.summary as string) ?? "",
    thumbnail: (data.thumbnail as string) ?? "",
    excerpt: (data.excerpt as string) ?? "",
    readTime: (data.readTime as number) ?? 1,
    collectionIds: Array.isArray(data.collectionIds)
      ? (data.collectionIds as string[])
      : [],
    topicIds: Array.isArray(data.topicIds) ? (data.topicIds as string[]) : [],
    isPinned: (data.isPinned as boolean) ?? false,
    orderMap: (data.orderMap as Record<string, number>) ?? {},
    visibility: (data.visibility as VisibilityStatus) ?? "public",
    views: (data.views as number) ?? 0,
    createdAt: formatTimestamp(timestamps.createdAt ?? null),
    updatedAt: formatTimestamp(timestamps.updatedAt ?? null),
  };
}

interface FetchPostsOptions {
  includeNonPublic?: boolean;
}

function shouldFallbackToPosts(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = (error as { code?: unknown }).code;
  return code === "permission-denied" || code === "failed-precondition";
}

function toSummaryFromPost(post: PostDoc): PostSummaryDoc {
  return {
    id: post.id,
    postId: post.id,
    title: post.title,
    slug: post.slug,
    summary: post.summary,
    thumbnail: post.thumbnail,
    excerpt: post.excerpt,
    readTime: post.readTime,
    collectionIds: post.collectionIds,
    topicIds: post.topicIds,
    isPinned: post.isPinned,
    orderMap: post.orderMap,
    visibility: post.visibility,
    views: post.views,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

function canIgnoreSummarySyncError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = (error as { code?: unknown }).code;
  return (
    code === "permission-denied" ||
    code === "failed-precondition" ||
    code === "not-found"
  );
}

export async function fetchPosts(
  options?: FetchPostsOptions,
): Promise<PostDoc[]> {
  const includeNonPublic = options?.includeNonPublic ?? false;
  const q = query(
    collection(db, "posts"),
    orderBy("timestamps.createdAt", "desc"),
  );
  const snap = await getDocs(q);
  const mapped = snap.docs.map((d) => docToPost(d.id, d.data()));
  return includeNonPublic
    ? mapped
    : mapped.filter((post) => post.visibility === "public");
}

export async function fetchPostSummaries(
  options?: FetchPostsOptions,
): Promise<PostSummaryDoc[]> {
  const includeNonPublic = options?.includeNonPublic ?? false;
  try {
    const q = query(
      collection(db, "post_summaries"),
      orderBy("timestamps.createdAt", "desc"),
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      const mapped = snap.docs.map((d) => docToPostSummary(d.id, d.data()));
      return includeNonPublic
        ? mapped
        : mapped.filter((post) => post.visibility === "public");
    }
  } catch (err) {
    if (!shouldFallbackToPosts(err)) throw err;
  }

  const posts = await fetchPosts({ includeNonPublic: true });
  const mapped = posts.map(toSummaryFromPost);
  return includeNonPublic
    ? mapped
    : mapped.filter((post) => post.visibility === "public");
}

export async function fetchPostsByCollection(
  collectionId: string,
  options?: FetchPostsOptions,
): Promise<PostDoc[]> {
  const includeNonPublic = options?.includeNonPublic ?? false;
  const q = query(
    collection(db, "posts"),
    where("collectionIds", "array-contains", collectionId),
    orderBy("timestamps.createdAt", "desc"),
  );
  const snap = await getDocs(q);
  const mapped = snap.docs.map((d) => docToPost(d.id, d.data()));
  return includeNonPublic
    ? mapped
    : mapped.filter((post) => post.visibility === "public");
}

export async function fetchPost(id: string): Promise<PostDoc | null> {
  const snap = await getDoc(doc(db, "posts", id));
  if (!snap.exists()) return null;
  return docToPost(snap.id, snap.data());
}

export async function fetchPostBySlug(
  slug: string,
  includeNonPublic = false,
): Promise<PostDoc | null> {
  const q = query(collection(db, "posts"), where("slug", "==", slug));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  const post = docToPost(d.id, d.data());
  if (!includeNonPublic && post.visibility !== "public") return null;
  return post;
}

export async function createPost(data: PostInput): Promise<string> {
  const normalizedSummary = data.summary.trim();
  const excerpt = normalizedSummary;
  const readTime = calcReadTime(data.content);

  const ref = await addDoc(collection(db, "posts"), {
    ...data,
    summary: normalizedSummary,
    excerpt,
    readTime,
    views: 0,
    timestamps: {
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  });

  try {
    await setDoc(doc(db, "post_summaries", ref.id), {
      postId: ref.id,
      title: data.title,
      slug: data.slug,
      summary: normalizedSummary,
      thumbnail: data.thumbnail,
      excerpt,
      readTime,
      collectionIds: data.collectionIds,
      topicIds: data.topicIds,
      isPinned: data.isPinned,
      orderMap: data.orderMap,
      visibility: data.visibility,
      views: 0,
      timestamps: {
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
    });
  } catch (err) {
    if (!canIgnoreSummarySyncError(err)) throw err;
  }

  return ref.id;
}

export async function updatePost(
  id: string,
  data: Partial<PostInput>,
): Promise<void> {
  const updateData: Partial<PostInput> & {
    excerpt?: string;
    readTime?: number;
  } = {
    ...data,
  };

  if (typeof data.summary === "string") {
    const normalizedSummary = data.summary.trim();
    updateData.summary = normalizedSummary;
    updateData.excerpt = normalizedSummary;
  }

  if (typeof data.content === "string") {
    updateData.readTime = calcReadTime(data.content);
  }

  await updateDoc(doc(db, "posts", id), {
    ...updateData,
    "timestamps.updatedAt": serverTimestamp(),
  });

  const summaryData: Record<string, unknown> = {
    "timestamps.updatedAt": serverTimestamp(),
  };

  if (typeof updateData.title === "string")
    summaryData.title = updateData.title;
  if (typeof updateData.slug === "string") summaryData.slug = updateData.slug;
  if (typeof updateData.summary === "string")
    summaryData.summary = updateData.summary;
  if (typeof updateData.thumbnail === "string")
    summaryData.thumbnail = updateData.thumbnail;
  if (Array.isArray(updateData.collectionIds))
    summaryData.collectionIds = updateData.collectionIds;
  if (Array.isArray(updateData.topicIds))
    summaryData.topicIds = updateData.topicIds;
  if (typeof updateData.isPinned === "boolean")
    summaryData.isPinned = updateData.isPinned;
  if (typeof updateData.visibility === "string")
    summaryData.visibility = updateData.visibility;
  if (updateData.orderMap) summaryData.orderMap = updateData.orderMap;
  if (typeof updateData.excerpt === "string")
    summaryData.excerpt = updateData.excerpt;
  if (typeof updateData.readTime === "number")
    summaryData.readTime = updateData.readTime;

  try {
    await setDoc(
      doc(db, "post_summaries", id),
      { postId: id, ...summaryData },
      { merge: true },
    );
  } catch (err) {
    if (!canIgnoreSummarySyncError(err)) throw err;
  }
}

export async function deletePost(id: string): Promise<void> {
  await deleteDoc(doc(db, "posts", id));
  try {
    await deleteDoc(doc(db, "post_summaries", id));
  } catch (err) {
    if (!canIgnoreSummarySyncError(err)) throw err;
  }
}

export async function updatePostOrders(
  items: { id: string; orderMap: Record<string, number> }[],
): Promise<void> {
  const batch = writeBatch(db);
  for (const item of items) {
    batch.update(doc(db, "posts", item.id), { orderMap: item.orderMap });
  }
  await batch.commit();

  try {
    const summaryBatch = writeBatch(db);
    for (const item of items) {
      summaryBatch.set(
        doc(db, "post_summaries", item.id),
        { postId: item.id, orderMap: item.orderMap },
        { merge: true },
      );
    }
    await summaryBatch.commit();
  } catch (err) {
    if (!canIgnoreSummarySyncError(err)) throw err;
  }
}
