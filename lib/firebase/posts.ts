import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
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

const db = getFirebaseDb();

export interface PostInput {
  title: string;
  slug: string;
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
    thumbnail: (data.thumbnail as string) ?? "",
    content: (data.content as string) ?? "",
    collectionIds: Array.isArray(data.collectionIds)
      ? (data.collectionIds as string[])
      : data.collectionId
        ? [data.collectionId as string]
        : [],
    topicIds: Array.isArray(data.topicIds)
      ? (data.topicIds as string[])
      : data.topicId
        ? [data.topicId as string]
        : [],
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
  const ref = await addDoc(collection(db, "posts"), {
    ...data,
    views: 0,
    timestamps: {
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  });
  return ref.id;
}

export async function updatePost(
  id: string,
  data: Partial<PostInput>,
): Promise<void> {
  await updateDoc(doc(db, "posts", id), {
    ...data,
    "timestamps.updatedAt": serverTimestamp(),
  });
}

export async function deletePost(id: string): Promise<void> {
  await deleteDoc(doc(db, "posts", id));
}

export async function updatePostOrders(
  items: { id: string; orderMap: Record<string, number> }[],
): Promise<void> {
  const batch = writeBatch(db);
  for (const item of items) {
    batch.update(doc(db, "posts", item.id), { orderMap: item.orderMap });
  }
  await batch.commit();
}
