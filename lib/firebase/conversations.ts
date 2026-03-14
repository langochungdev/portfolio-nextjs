import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  increment,
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
  typing: {
    user: boolean;
    admin: boolean;
    userUpdatedAt: string;
    adminUpdatedAt: string;
  };
  unreadCount: {
    user: number;
    admin: number;
  };
}

function tsToStr(ts: unknown): string {
  if (!ts) return "";
  if (typeof ts === "object" && ts !== null && "toDate" in ts) {
    return (ts as { toDate(): Date }).toDate().toISOString();
  }
  return "";
}

function toRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function toStringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function toNumberValue(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function mapConversationData(
  id: string,
  data: Record<string, unknown>,
): ConversationDoc {
  const typingData = toRecord(data.typing);
  const unreadData = toRecord(data.unreadCount);
  const presenceData = toRecord(data.presence);
  const metadataData = toRecord(data.metadata);
  const status = data.status === "replied" ? "replied" : "unread";

  return {
    id,
    userName: toStringValue(data.userName),
    note: toStringValue(data.note),
    lastMessage: toStringValue(data.lastMessage),
    status,
    updatedAt: tsToStr(data.updatedAt),
    fingerprint: toStringValue(data.fingerprint),
    visitCount: toNumberValue(data.visitCount),
    viewedPostIds: toStringArray(data.viewedPostIds),
    viewedPostSlugs: toStringArray(data.viewedPostSlugs),
    presence: {
      online: Boolean(presenceData.online),
      lastActive: tsToStr(presenceData.lastActive),
      currentPage: toStringValue(presenceData.currentPage),
    },
    metadata: {
      os: toStringValue(metadataData.os),
      browser: toStringValue(metadataData.browser),
      device: toStringValue(metadataData.device),
      lastIp: toStringValue(metadataData.lastIp),
      lastReferrer: toStringValue(metadataData.lastReferrer),
    },
    typing: {
      user: Boolean(typingData.user),
      admin: Boolean(typingData.admin),
      userUpdatedAt: tsToStr(typingData.userUpdatedAt),
      adminUpdatedAt: tsToStr(typingData.adminUpdatedAt),
    },
    unreadCount: {
      user: typeof unreadData.user === "number" ? unreadData.user : 0,
      admin: typeof unreadData.admin === "number" ? unreadData.admin : 0,
    },
  };
}

function mapConversation(
  d: import("firebase/firestore").QueryDocumentSnapshot,
): ConversationDoc {
  return mapConversationData(d.id, d.data());
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

export function subscribeConversation(
  visitorId: string,
  cb: (conv: ConversationDoc | null) => void,
): Unsubscribe {
  return onSnapshot(doc(db, "conversations", visitorId), (snap) => {
    if (!snap.exists()) {
      cb(null);
      return;
    }
    cb(mapConversationData(snap.id, snap.data() as Record<string, unknown>));
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
      unreadCount:
        sender === "admin" ? { user: increment(1) } : { admin: increment(1) },
      typing:
        sender === "admin"
          ? { admin: false, adminUpdatedAt: serverTimestamp() }
          : { user: false, userUpdatedAt: serverTimestamp() },
    },
    { merge: true },
  );
  return msgRef.id;
}

export async function markAsRead(
  visitorId: string,
  reader: "user" | "admin" = "admin",
): Promise<void> {
  await setDoc(
    doc(db, "conversations", visitorId),
    {
      ...(reader === "admin" ? { status: "replied" } : {}),
      unreadCount: { [reader]: 0 },
    },
    { merge: true },
  );
}

export async function updateTypingState(
  visitorId: string,
  sender: "user" | "admin",
  isTyping: boolean,
): Promise<void> {
  await setDoc(
    doc(db, "conversations", visitorId),
    {
      typing:
        sender === "admin"
          ? { admin: isTyping, adminUpdatedAt: serverTimestamp() }
          : { user: isTyping, userUpdatedAt: serverTimestamp() },
    },
    { merge: true },
  );
}

export async function fetchConversationUserName(
  visitorId: string,
): Promise<string> {
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
