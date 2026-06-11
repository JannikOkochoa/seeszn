import { TranslationProvider } from "@/lib/i18n/context";
import LangSetter from "@/components/LangSetter";
import type { ReactNode } from "react";

export default function DeLayout({ children }: { children: ReactNode }) {
  return (
    <TranslationProvider locale="de">
      <LangSetter lang="de" />
      {children}
    </TranslationProvider>
  );
}
