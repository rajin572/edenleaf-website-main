"use client";

import React, { createContext, useContext } from "react";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

/**
 * Translations for Client Components.
 *
 * Server Components call `getDictionary()` directly and nothing reaches the
 * browser. Client Components cannot — `next/root-params` and dynamic imports
 * are server-only — so the root layout seeds this context once with the active
 * locale's dictionary.
 *
 * Only the active language is serialised, and only once for the whole tree.
 */

interface DictionaryContextValue {
  dict: Dictionary;
  locale: Locale;
}

const DictionaryContext = createContext<DictionaryContextValue | null>(null);

export const DictionaryProvider = ({
  dict,
  locale,
  children,
}: DictionaryContextValue & { children: React.ReactNode }) => (
  <DictionaryContext.Provider value={{ dict, locale }}>
    {children}
  </DictionaryContext.Provider>
);

/** Translations inside a Client Component. Mirrors `getDictionary()`. */
export function useDictionary(): DictionaryContextValue {
  const context = useContext(DictionaryContext);
  if (!context) {
    throw new Error("useDictionary must be used inside <DictionaryProvider>");
  }
  return context;
}

/** Shorthand when only the strings are needed. */
export const useT = (): Dictionary => useDictionary().dict;
