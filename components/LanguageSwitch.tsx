"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

// German is the root surface; English lives under /en.
// Path map: strip or prepend /en, preserve current page slug.
function swapLocale(pathname: string, targetLang: "en" | "de"): string {
  const isEn = pathname === "/en" || pathname.startsWith("/en/");
  if (targetLang === "en") {
    return isEn ? pathname : "/en" + (pathname === "/" ? "" : pathname);
  }
  // targetLang === "de" (root)
  const stripped = isEn ? pathname.replace(/^\/en/, "") : pathname;
  return stripped || "/";
}

export default function LanguageSwitch({ mobile }: { mobile?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [hoveredLang, setHoveredLang] = useState<"en" | "de" | null>(null);

  const currentLang: "en" | "de" =
    pathname === "/en" || pathname.startsWith("/en/") ? "en" : "de";

  function switchTo(lang: "en" | "de") {
    if (lang === currentLang) return;
    const target = swapLocale(pathname, lang);
    try { localStorage.setItem("seeszn-lang", lang); } catch {}
    router.push(target);
  }

  const langs: Array<"en" | "de"> = ["en", "de"];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: mobile ? 14 : 6,
        flexShrink: 0,
      }}
    >
      {langs.map((lang, i) => {
        const isActive = lang === currentLang;
        const isHovered = hoveredLang === lang;
        return (
          <span key={lang} style={{ display: "flex", alignItems: "center", gap: mobile ? 14 : 6 }}>
            <button
              onClick={() => switchTo(lang)}
              onMouseEnter={() => setHoveredLang(lang)}
              onMouseLeave={() => setHoveredLang(null)}
              aria-label={lang === "en" ? "Switch to English" : "Zur deutschen Version wechseln"}
              aria-current={isActive ? "true" : undefined}
              style={{
                background: "none",
                border: "none",
                fontFamily: "var(--font-body), 'Helvetica Neue', sans-serif",
                fontSize: mobile ? 13 : 11,
                fontWeight: isActive ? 600 : 400,
                letterSpacing: "0.09em",
                textTransform: "uppercase",
                color: isActive
                  ? "var(--text-primary)"
                  : isHovered
                  ? "var(--text-primary)"
                  : "var(--text-muted)",
                cursor: isActive ? "default" : "pointer",
                padding: "4px 0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                minHeight: 32,
                justifyContent: "center",
                transition: "color 250ms ease",
              }}
            >
              {lang.toUpperCase()}
              <span
                aria-hidden="true"
                style={{
                  display: "block",
                  width: "100%",
                  height: 1,
                  background: "var(--signal)",
                  transform: isActive ? "scaleX(1)" : "scaleX(0)",
                  transformOrigin: "left",
                  transition: "transform 400ms cubic-bezier(0.16,1,0.3,1)",
                }}
              />
            </button>
            {i === 0 && (
              <span
                aria-hidden="true"
                style={{
                  width: 1,
                  height: 12,
                  background: "var(--line-strong)",
                  display: "block",
                  opacity: 0.5,
                }}
              />
            )}
          </span>
        );
      })}
    </div>
  );
}
