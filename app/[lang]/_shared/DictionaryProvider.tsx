"use client";

import { createContext, useContext } from "react";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { Locale } from "@/lib/i18n/config";

interface DictionaryContextType {
  dictionary: Dictionary;
  locale: Locale;
  serverTheme: "light" | "dark";
}

const DictionaryContext = createContext<DictionaryContextType | null>(null);

export function DictionaryProvider({
  dictionary,
  locale,
  serverTheme,
  children,
}: {
  dictionary: Dictionary;
  locale: Locale;
  serverTheme: "light" | "dark";
  children: React.ReactNode;
}) {
  return (
    <DictionaryContext.Provider value={{ dictionary, locale, serverTheme }}>
      {children}
    </DictionaryContext.Provider>
  );
}

export function useDictionary() {
  const context = useContext(DictionaryContext);
  if (!context) {
    throw new Error("useDictionary must be used within a DictionaryProvider");
  }
  return context;
}
