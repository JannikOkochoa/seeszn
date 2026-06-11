"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { en, type Translations } from "./en";
import { de } from "./de";

const dict: Record<string, Translations> = { en, de };

const TranslationContext = createContext<Translations>(en);

export function TranslationProvider({
  locale,
  children,
}: {
  locale: string;
  children: ReactNode;
}) {
  const t = dict[locale] ?? en;
  return (
    <TranslationContext.Provider value={t}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslations(): Translations {
  return useContext(TranslationContext);
}
