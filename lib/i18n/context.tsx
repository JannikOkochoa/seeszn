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
const LocaleContext = createContext<string>("de");

export function TranslationProvider({
  locale,
  children,
}: {
  locale: string;
  children: ReactNode;
}) {
  const t = dict[locale] ?? en;
  return (
    <LocaleContext.Provider value={locale}>
      <TranslationContext.Provider value={t}>
        {children}
      </TranslationContext.Provider>
    </LocaleContext.Provider>
  );
}

export function useTranslations(): Translations {
  return useContext(TranslationContext);
}

/** Active locale ("de" | "en"). Used by client tools that call the scan API. */
export function useLocale(): string {
  return useContext(LocaleContext);
}
