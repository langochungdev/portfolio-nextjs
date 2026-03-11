"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface HeaderActionsState {
  node: ReactNode | null;
  setActions: (node: ReactNode | null) => void;
}

const HeaderActionsContext = createContext<HeaderActionsState>({
  node: null,
  setActions: () => {},
});

export function HeaderActionsProvider({ children }: { children: ReactNode }) {
  const [node, setNode] = useState<ReactNode | null>(null);
  const setActions = useCallback((n: ReactNode | null) => setNode(n), []);
  return (
    <HeaderActionsContext.Provider value={{ node, setActions }}>
      {children}
    </HeaderActionsContext.Provider>
  );
}

export function useHeaderActions() {
  return useContext(HeaderActionsContext);
}
