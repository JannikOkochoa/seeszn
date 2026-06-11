"use client";

import { useEffect } from "react";

// Sets document.documentElement.lang for /de/* routes.
// The root layout sets lang="en" by default; this component overrides it
// for German pages before hydration completes.
export default function LangSetter({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.lang = "en";
    };
  }, [lang]);
  return null;
}
