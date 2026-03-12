"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
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

interface VisitorContextValue {
  visitorId: string | null;
  fingerprint: string | null;
  loading: boolean;
  isRecovered: boolean;
}

const VisitorContext = createContext<VisitorContextValue>({
  visitorId: null,
  fingerprint: null,
  loading: true,
  isRecovered: false,
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
  const [state, setState] = useState<VisitorContextValue>({
    visitorId: null,
    fingerprint: null,
    loading: true,
    isRecovered: false,
  });
  const pathname = usePathname();
  const visitCounted = useRef(false);

  useEffect(() => {
    const cached = getStoredVisitorId();
    if (cached) {
      setState((s) => ({ ...s, visitorId: cached }));
    }

    getOrCreateVisitorId()
      .then(({ visitorId, fingerprint, isRecovered }: VisitorIdentity) => {
        setState({ visitorId, fingerprint, loading: false, isRecovered });
      })
      .catch(() => {
        setState((s) => ({ ...s, loading: false }));
      });
  }, []);

  useEffect(() => {
    if (!state.visitorId || state.loading) return;
    if (!visitCounted.current) {
      visitCounted.current = true;
      incrementVisitCount(state.visitorId);
    }
  }, [state.visitorId, state.loading]);

  useEffect(() => {
    if (!state.visitorId || state.loading) return;
    const page = resolvePageKey(pathname);

    sendHeartbeat(state.visitorId, page);
    const interval = setInterval(() => sendHeartbeat(state.visitorId!, page), 30_000);

    const handleOffline = () => sendOffline(state.visitorId!);
    window.addEventListener("beforeunload", handleOffline);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) handleOffline();
      else sendHeartbeat(state.visitorId!, page);
    });

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleOffline);
      handleOffline();
    };
  }, [state.visitorId, state.loading, pathname]);

  return (
    <VisitorContext.Provider value={state}>{children}</VisitorContext.Provider>
  );
}

export function useVisitor(): VisitorContextValue {
  return useContext(VisitorContext);
}
