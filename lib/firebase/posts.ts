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

const db = getFirebaseDb();

export interface PostInput {
  title: string;
  slug: string;
  thumbnail: string;
  content: string;
  collectionIds: string[];
  topicIds: string[];
  isPinned: boolean;
  order: number;
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
    order: (data.order as number) ?? 0,
    views: (data.views as number) ?? 0,
    createdAt: formatTimestamp(timestamps.createdAt ?? null),
    updatedAt: formatTimestamp(timestamps.updatedAt ?? null),
  };
}

export async function fetchPosts(): Promise<PostDoc[]> {
  const q = query(
    collection(db, "posts"),
    orderBy("order"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToPost(d.id, d.data()));
}

export async function fetchPostsByCollection(
  collectionId: string,
): Promise<PostDoc[]> {
  const q = query(
    collection(db, "posts"),
    where("collectionIds", "array-contains", collectionId),
    orderBy("timestamps.createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToPost(d.id, d.data()));
}

export async function fetchPost(id: string): Promise<PostDoc | null> {
  const snap = await getDoc(doc(db, "posts", id));
  if (!snap.exists()) return null;
  return docToPost(snap.id, snap.data());
}

export async function fetchPostBySlug(slug: string): Promise<PostDoc | null> {
  const q = query(collection(db, "posts"), where("slug", "==", slug));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return docToPost(d.id, d.data());
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
  items: { id: string; order: number }[],
): Promise<void> {
  const batch = writeBatch(db);
  for (const item of items) {
    batch.update(doc(db, "posts", item.id), { order: item.order });
  }
  await batch.commit();
}
