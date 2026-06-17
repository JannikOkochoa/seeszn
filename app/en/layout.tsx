import { TranslationProvider } from "@/lib/i18n/context";
import LangSetter from "@/components/LangSetter";
import type { ReactNode } from "react";

export default function EnLayout({ children }: { children: ReactNode }) {
  return (
    <TranslationProvider locale="en">
      <LangSetter lang="en" />
      {children}
    </TranslationProvider>
  );
}
