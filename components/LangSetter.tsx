"use client";

import { useEffect } from "react";

// Sets document.documentElement.lang for non-default-locale routes.
// The root layout sets lang="de" by default (German is the root surface);
// this component overrides it for /en/* pages before hydration completes.
export default function LangSetter({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.lang = "de";
    };
  }, [lang]);
  return null;
}
