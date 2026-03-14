import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/config";

const db = getFirebaseDb();

export interface MessageDoc {
  id: string;
  text: string;
  sender: "user" | "admin";
  createdAt: string;
}

export interface ConversationDoc {
  id: string;
  userName: string;
  note: string;
  lastMessage: string;
  status: "unread" | "replied";
  updatedAt: string;
  fingerprint: string;
  visitCount: number;
  viewedPostIds: string[];
  viewedPostSlugs: string[];
  presence: {
    online: boolean;
    lastActive: string;
    currentPage: string;
  };
  metadata: {
    os: string;
    browser: string;
    device: string;
    lastIp: string;
    lastReferrer: string;
  };
}

function tsToStr(ts: unknown): string {
  if (!ts) return "";
  if (typeof ts === "object" && ts !== null && "toDate" in ts) {
    return (ts as { toDate(): Date }).toDate().toISOString();
  }
  return "";
}

function mapConversation(
  d: import("firebase/firestore").QueryDocumentSnapshot,
): ConversationDoc {
  const data = d.data();
  return {
    id: d.id,
    userName: data.userName ?? "",
    note: data.note ?? "",
    lastMessage: data.lastMessage ?? "",
    status: data.status ?? "unread",
    updatedAt: tsToStr(data.updatedAt),
    fingerprint: data.fingerprint ?? "",
    visitCount: data.visitCount ?? 0,
    viewedPostIds: Array.isArray(data.viewedPostIds)
      ? data.viewedPostIds.filter(
          (value): value is string => typeof value === "string",
        )
      : [],
    viewedPostSlugs: Array.isArray(data.viewedPostSlugs)
      ? data.viewedPostSlugs.filter(
          (value): value is string => typeof value === "string",
        )
      : [],
    presence: {
      online: data.presence?.online ?? false,
      lastActive: tsToStr(data.presence?.lastActive),
      currentPage: data.presence?.currentPage ?? "",
    },
    metadata: data.metadata ?? {
      os: "",
      browser: "",
      device: "",
      lastIp: "",
      lastReferrer: "",
    },
  };
}

export async function fetchConversations(): Promise<ConversationDoc[]> {
  const q = query(
    collection(db, "conversations"),
    orderBy("updatedAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map(mapConversation);
}

export function subscribeConversations(
  cb: (convs: ConversationDoc[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, "conversations"),
    orderBy("updatedAt", "desc"),
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map(mapConversation));
  });
}

export async function fetchMessages(visitorId: string): Promise<MessageDoc[]> {
  const q = query(
    collection(db, "conversations", visitorId, "messages"),
    orderBy("createdAt", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      text: data.text ?? "",
      sender: data.sender ?? "user",
      createdAt: tsToStr(data.createdAt),
    };
  });
}

export function subscribeMessages(
  visitorId: string,
  cb: (msgs: MessageDoc[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, "conversations", visitorId, "messages"),
    orderBy("createdAt", "asc"),
  );
  return onSnapshot(q, (snap) => {
    cb(
      snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          text: data.text ?? "",
          sender: data.sender ?? "user",
          createdAt: tsToStr(data.createdAt),
        };
      }),
    );
  });
}

export async function sendMessage(
  visitorId: string,
  text: string,
  sender: "user" | "admin",
): Promise<string> {
  const msgRef = await addDoc(
    collection(db, "conversations", visitorId, "messages"),
    { text, sender, createdAt: serverTimestamp() },
  );
  await setDoc(
    doc(db, "conversations", visitorId),
    {
      lastMessage: text,
      status: sender === "admin" ? "replied" : "unread",
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
  return msgRef.id;
}

export async function markAsRead(visitorId: string): Promise<void> {
  await setDoc(
    doc(db, "conversations", visitorId),
    { status: "replied" },
    { merge: true },
  );
}

export async function fetchConversationUserName(
  visitorId: string,
): Promise<string> {
  const { getDoc } = await import("firebase/firestore");
  const snap = await getDoc(doc(db, "conversations", visitorId));
  return snap.exists() ? (snap.data().userName ?? "") : "";
}

export async function updateConversationUserName(
  visitorId: string,
  userName: string,
): Promise<void> {
  await setDoc(
    doc(db, "conversations", visitorId),
    { userName },
    { merge: true },
  );
}

export async function updateConversationNote(
  visitorId: string,
  note: string,
): Promise<void> {
  await setDoc(doc(db, "conversations", visitorId), { note }, { merge: true });
}

export async function deleteConversation(visitorId: string): Promise<void> {
  const msgsSnap = await getDocs(
    collection(db, "conversations", visitorId, "messages"),
  );
  const deletions = msgsSnap.docs.map((d) =>
    deleteDoc(doc(db, "conversations", visitorId, "messages", d.id)),
  );
  await Promise.all(deletions);
  await deleteDoc(doc(db, "conversations", visitorId));
}
