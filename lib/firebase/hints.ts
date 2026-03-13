import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
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

export interface HintInput {
  title: string;
  content: string;
  type: "tip" | "hint" | "note";
  topicId: string;
  postId: string;
  order: number;
  visibility: VisibilityStatus;
}

export interface HintDoc extends HintInput {
  id: string;
  createdAt: string;
  updatedAt: string;
}

function formatTimestamp(ts: { seconds: number } | null): string {
  if (!ts) return new Date().toISOString().split("T")[0];
  return new Date(ts.seconds * 1000).toISOString().split("T")[0];
}

function docToHint(id: string, data: Record<string, unknown>): HintDoc {
  const timestamps = (data.timestamps ?? {}) as Record<
    string,
    { seconds: number } | null
  >;
  return {
    id,
    title: (data.title as string) ?? "",
    content: (data.content as string) ?? "",
    type: (data.type as HintDoc["type"]) ?? "tip",
    topicId: (data.topicId as string) ?? "",
    postId: (data.postId as string) ?? (data.relatedPostId as string) ?? "",
    order: (data.order as number) ?? 0,
    visibility: (data.visibility as VisibilityStatus) ?? "public",
    createdAt: formatTimestamp(timestamps.createdAt ?? null),
    updatedAt: formatTimestamp(timestamps.updatedAt ?? null),
  };
}

interface FetchHintsOptions {
  includeNonPublic?: boolean;
}

export async function fetchHints(
  options?: FetchHintsOptions,
): Promise<HintDoc[]> {
  const includeNonPublic = options?.includeNonPublic ?? false;
  const q = query(collection(db, "hints"), orderBy("order"));
  const snap = await getDocs(q);
  const mapped = snap.docs.map((d) => docToHint(d.id, d.data()));
  return includeNonPublic
    ? mapped
    : mapped.filter((hint) => hint.visibility === "public");
}

export async function fetchHintsByTopic(
  topicId: string,
  options?: FetchHintsOptions,
): Promise<HintDoc[]> {
  const includeNonPublic = options?.includeNonPublic ?? false;
  const q = query(
    collection(db, "hints"),
    where("topicId", "==", topicId),
    orderBy("order"),
  );
  const snap = await getDocs(q);
  const mapped = snap.docs.map((d) => docToHint(d.id, d.data()));
  return includeNonPublic
    ? mapped
    : mapped.filter((hint) => hint.visibility === "public");
}

export async function createHint(data: HintInput): Promise<string> {
  const ref = await addDoc(collection(db, "hints"), {
    title: data.title,
    content: data.content,
    type: data.type,
    topicId: data.topicId,
    postId: data.postId,
    order: data.order,
    visibility: data.visibility,
    timestamps: {
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  });
  return ref.id;
}

export async function updateHint(
  id: string,
  data: Partial<HintInput>,
): Promise<void> {
  await updateDoc(doc(db, "hints", id), {
    ...data,
    "timestamps.updatedAt": serverTimestamp(),
  });
}

export async function deleteHint(id: string): Promise<void> {
  await deleteDoc(doc(db, "hints", id));
}

export async function updateHintOrders(
  items: { id: string; order: number }[],
): Promise<void> {
  const batch = writeBatch(db);
  for (const item of items) {
    batch.update(doc(db, "hints", item.id), { order: item.order });
  }
  await batch.commit();
}
