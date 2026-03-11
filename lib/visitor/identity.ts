import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { generateFingerprint } from "@/lib/visitor/fingerprint";

const VISITOR_ID_KEY = "visitor_id";
const FINGERPRINT_KEY = "visitor_fp";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 2;

function generateId(): string {
  return crypto.randomUUID();
}

function getFromLocalStorage(): string | null {
  try {
    return localStorage.getItem(VISITOR_ID_KEY);
  } catch {
    return null;
  }
}

function getFromCookie(): string | null {
  try {
    const match = document.cookie.match(
      new RegExp(`(?:^|;\\s*)${VISITOR_ID_KEY}=([^;]+)`),
    );
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

function persistId(id: string): void {
  try {
    localStorage.setItem(VISITOR_ID_KEY, id);
  } catch {
    /* private mode may block */
  }
  try {
    document.cookie = `${VISITOR_ID_KEY}=${encodeURIComponent(id)};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`;
  } catch {
    /* cookie blocked */
  }
}

function persistFingerprint(fp: string): void {
  try {
    localStorage.setItem(FINGERPRINT_KEY, fp);
  } catch {
    /* ignore */
  }
  try {
    document.cookie = `${FINGERPRINT_KEY}=${encodeURIComponent(fp)};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

async function recoverByFingerprint(
  fingerprint: string,
): Promise<string | null> {
  try {
    const q = query(
      collection(db, "conversations"),
      where("fingerprint", "==", fingerprint),
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].id;
    }
  } catch {
    /* Firestore unreachable */
  }
  return null;
}

async function updateConversationFingerprint(
  visitorId: string,
  fingerprint: string,
): Promise<void> {
  try {
    const ref = doc(db, "conversations", visitorId);
    const snap = await getDoc(ref);
    if (snap.exists() && snap.data().fingerprint !== fingerprint) {
      await setDoc(ref, { fingerprint }, { merge: true });
    }
  } catch {
    /* Firestore may be unreachable */
  }
}

async function ensureConversationDoc(
  visitorId: string,
  fingerprint: string,
): Promise<void> {
  try {
    const ref = doc(db, "conversations", visitorId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const ua = navigator.userAgent;
      await setDoc(ref, {
        userName: "",
        lastMessage: "",
        status: "unread",
        updatedAt: serverTimestamp(),
        fingerprint,
        metadata: {
          os: getOS(ua),
          browser: getBrowser(ua),
          device: getDevice(),
          lastIp: "",
        },
      });
    }
  } catch {
    /* Firestore may be unreachable or rules may block */
  }
}

export interface VisitorIdentity {
  visitorId: string;
  fingerprint: string;
  isRecovered: boolean;
}

export async function getOrCreateVisitorId(): Promise<VisitorIdentity> {
  const fingerprint = await generateFingerprint();

  const localId = getFromLocalStorage();
  if (localId) {
    persistId(localId);
    persistFingerprint(fingerprint);
    return { visitorId: localId, fingerprint, isRecovered: false };
  }

  const cookieId = getFromCookie();
  if (cookieId) {
    persistId(cookieId);
    persistFingerprint(fingerprint);
    return { visitorId: cookieId, fingerprint, isRecovered: false };
  }

  const recoveredId = await recoverByFingerprint(fingerprint);
  if (recoveredId) {
    persistId(recoveredId);
    persistFingerprint(fingerprint);
    await updateConversationFingerprint(recoveredId, fingerprint);
    return { visitorId: recoveredId, fingerprint, isRecovered: true };
  }

  const newId = generateId();
  persistId(newId);
  persistFingerprint(fingerprint);
  await ensureConversationDoc(newId, fingerprint);
  return { visitorId: newId, fingerprint, isRecovered: false };
}

export function getStoredVisitorId(): string | null {
  return getFromLocalStorage() || getFromCookie();
}

export function getDeviceMetadata(): {
  os: string;
  browser: string;
  device: string;
} {
  const ua = navigator.userAgent;
  return {
    os: getOS(ua),
    browser: getBrowser(ua),
    device: getDevice(),
  };
}

function getOS(ua: string): string {
  if (ua.includes("Win")) return "Windows";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  if (ua.includes("CrOS")) return "ChromeOS";
  return "Unknown";
}

function getBrowser(ua: string): string {
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("OPR/") || ua.includes("Opera")) return "Opera";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Unknown";
}

function getDevice(): string {
  if (/Mobi|Android/i.test(navigator.userAgent)) return "Mobile";
  if (/Tablet|iPad/i.test(navigator.userAgent)) return "Tablet";
  return "Desktop";
}
