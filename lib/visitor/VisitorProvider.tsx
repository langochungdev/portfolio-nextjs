"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  getOrCreateVisitorId,
  getStoredVisitorId,
  type VisitorIdentity,
} from "@/lib/visitor/identity";
import { doc, setDoc, serverTimestamp, increment } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/config";
import { requestFcmToken } from "@/lib/firebase/messaging";
import { saveFcmToken } from "@/lib/firebase/notifications";

type NotificationStatus = "unsupported" | "default" | "denied" | "granted";

interface VisitorContextValue {
  visitorId: string | null;
  fingerprint: string | null;
  loading: boolean;
  isRecovered: boolean;
  notificationStatus: NotificationStatus;
  requestNotificationPermission: () => Promise<void>;
}

const VisitorContext = createContext<VisitorContextValue>({
  visitorId: null,
  fingerprint: null,
  loading: true,
  isRecovered: false,
  notificationStatus: "unsupported",
  requestNotificationPermission: async () => {},
});

function resolvePageKey(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length >= 2 && segments[1] === "blog" && segments[2]) {
    return segments[2];
  }
  if (segments.length >= 2 && segments[1] === "certificates") return "certificates";
  if (segments.length >= 2 && segments[1] === "blog") return "blog";
  return "home";
}

function sendHeartbeat(visitorId: string, page: string): void {
  const db = getFirebaseDb();
  setDoc(
    doc(db, "conversations", visitorId),
    { presence: { online: true, lastActive: serverTimestamp(), currentPage: page } },
    { merge: true },
  ).catch(() => {});
}

function sendOffline(visitorId: string): void {
  const db = getFirebaseDb();
  setDoc(
    doc(db, "conversations", visitorId),
    { presence: { online: false, lastActive: serverTimestamp() } },
    { merge: true },
  ).catch(() => {});
}

function incrementVisitCount(visitorId: string): void {
  const db = getFirebaseDb();
  setDoc(
    doc(db, "conversations", visitorId),
    { visitCount: increment(1) },
    { merge: true },
  ).catch(() => {});
}

export function VisitorProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState({
    visitorId: null as string | null,
    fingerprint: null as string | null,
    loading: true,
    isRecovered: false,
  });
  const [notiStatus, setNotiStatus] = useState<NotificationStatus>("unsupported");
  const pathname = usePathname();
  const visitCounted = useRef(false);

  useEffect(() => {
    const cached = getStoredVisitorId();
    if (cached) {
      setIdentity((s) => ({ ...s, visitorId: cached }));
    }

    getOrCreateVisitorId()
      .then(({ visitorId, fingerprint, isRecovered }: VisitorIdentity) => {
        setIdentity({ visitorId, fingerprint, loading: false, isRecovered });
      })
      .catch(() => {
        setIdentity((s) => ({ ...s, loading: false }));
      });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setNotiStatus("unsupported");
      return;
    }
    const perm = Notification.permission as NotificationStatus;
    setNotiStatus(perm === "granted" || perm === "denied" ? perm : "default");
  }, []);

  useEffect(() => {
    if (!identity.visitorId || identity.loading) return;
    if (notiStatus !== "granted") return;
    requestFcmToken()
      .then((token) => {
        if (token) saveFcmToken(identity.visitorId!, token);
      })
      .catch(() => {});
  }, [identity.visitorId, identity.loading, notiStatus]);

  const requestNotificationPermission = useCallback(async () => {
    if (!identity.visitorId) return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    try {
      const token = await requestFcmToken();
      if (token) {
        await saveFcmToken(identity.visitorId, token);
        setNotiStatus("granted");
      } else {
        setNotiStatus(Notification.permission as NotificationStatus);
      }
    } catch {
      setNotiStatus(Notification.permission as NotificationStatus);
    }
  }, [identity.visitorId]);

  useEffect(() => {
    if (!identity.visitorId || identity.loading) return;
    if (!visitCounted.current) {
      visitCounted.current = true;
      incrementVisitCount(identity.visitorId);
    }
  }, [identity.visitorId, identity.loading]);

  useEffect(() => {
    if (!identity.visitorId || identity.loading) return;
    const page = resolvePageKey(pathname);

    sendHeartbeat(identity.visitorId, page);
    const interval = setInterval(() => sendHeartbeat(identity.visitorId!, page), 30_000);

    const handleOffline = () => sendOffline(identity.visitorId!);
    window.addEventListener("beforeunload", handleOffline);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) handleOffline();
      else sendHeartbeat(identity.visitorId!, page);
    });

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleOffline);
      handleOffline();
    };
  }, [identity.visitorId, identity.loading, pathname]);

  const ctx: VisitorContextValue = {
    ...identity,
    notificationStatus: notiStatus,
    requestNotificationPermission,
  };

  return (
    <VisitorContext.Provider value={ctx}>{children}</VisitorContext.Provider>
  );
}

export function useVisitor(): VisitorContextValue {
  return useContext(VisitorContext);
}
