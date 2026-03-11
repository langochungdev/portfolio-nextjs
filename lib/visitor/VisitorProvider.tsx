"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getOrCreateVisitorId,
  getStoredVisitorId,
  type VisitorIdentity,
} from "@/lib/visitor/identity";

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

export function VisitorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<VisitorContextValue>({
    visitorId: null,
    fingerprint: null,
    loading: true,
    isRecovered: false,
  });

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

  return (
    <VisitorContext.Provider value={state}>{children}</VisitorContext.Provider>
  );
}

export function useVisitor(): VisitorContextValue {
  return useContext(VisitorContext);
}
