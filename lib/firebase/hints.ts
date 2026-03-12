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

const db = getFirebaseDb();

export interface HintInput {
  title: string;
  content: string;
  type: "tip" | "hint" | "note";
  collectionId: string;
  topicId: string;
  order: number;
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
    collectionId: (data.collectionId as string) ?? "",
    topicId: (data.topicId as string) ?? "",
    order: (data.order as number) ?? 0,
    createdAt: formatTimestamp(timestamps.createdAt ?? null),
    updatedAt: formatTimestamp(timestamps.updatedAt ?? null),
  };
}

export async function fetchHints(): Promise<HintDoc[]> {
  const q = query(collection(db, "hints"), orderBy("order"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToHint(d.id, d.data()));
}

export async function fetchHintsByTopic(topicId: string): Promise<HintDoc[]> {
  const q = query(
    collection(db, "hints"),
    where("topicId", "==", topicId),
    orderBy("order"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToHint(d.id, d.data()));
}

export async function createHint(data: HintInput): Promise<string> {
  const ref = await addDoc(collection(db, "hints"), {
    title: data.title,
    content: data.content,
    type: data.type,
    collectionId: data.collectionId,
    topicId: data.topicId,
    order: data.order,
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
