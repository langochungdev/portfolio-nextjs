import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/config";

const db = getFirebaseDb();

export interface HintDoc {
  id: string;
  title: string;
  content: string;
  type: "tip" | "hint" | "note";
  topicId: string;
  relatedPostId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

function formatTimestamp(ts: { seconds: number } | null): string {
  if (!ts) return new Date().toISOString();
  return new Date(ts.seconds * 1000).toISOString();
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
    relatedPostId: (data.relatedPostId as string) ?? "",
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
