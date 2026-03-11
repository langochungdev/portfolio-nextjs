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
import { db } from "@/lib/firebase/config";

export interface MessageDoc {
  id: string;
  text: string;
  sender: "user" | "admin";
  createdAt: string;
}

export interface ConversationDoc {
  id: string;
  userName: string;
  lastMessage: string;
  status: "unread" | "replied";
  updatedAt: string;
  fingerprint: string;
  metadata: {
    os: string;
    browser: string;
    device: string;
    lastIp: string;
  };
}

function tsToStr(ts: unknown): string {
  if (!ts) return "";
  if (typeof ts === "object" && ts !== null && "toDate" in ts) {
    return (ts as { toDate(): Date }).toDate().toISOString();
  }
  return "";
}

export async function fetchConversations(): Promise<ConversationDoc[]> {
  const q = query(collection(db, "conversations"), orderBy("updatedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      userName: data.userName ?? "",
      lastMessage: data.lastMessage ?? "",
      status: data.status ?? "unread",
      updatedAt: tsToStr(data.updatedAt),
      fingerprint: data.fingerprint ?? "",
      metadata: data.metadata ?? { os: "", browser: "", device: "", lastIp: "" },
    };
  });
}

export function subscribeConversations(
  cb: (convs: ConversationDoc[]) => void,
): Unsubscribe {
  const q = query(collection(db, "conversations"), orderBy("updatedAt", "desc"));
  return onSnapshot(q, (snap) => {
    cb(
      snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          userName: data.userName ?? "",
          lastMessage: data.lastMessage ?? "",
          status: data.status ?? "unread",
          updatedAt: tsToStr(data.updatedAt),
          fingerprint: data.fingerprint ?? "",
          metadata: data.metadata ?? { os: "", browser: "", device: "", lastIp: "" },
        };
      }),
    );
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
