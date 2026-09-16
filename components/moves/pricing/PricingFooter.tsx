// ─── PREISE: der minimale Footer ──────────────────────────────────────────────
// Nur das Nötige: Marke, Rechtliches, Datenschutz. Die vollständige Navigation
// des Hauses gehört nicht ans Ende einer Kaufstrecke; wer hier ankommt, soll
// entscheiden können, nicht weiterstöbern. Die Wortmarke bleibt der Weg zurück.

import Link from "next/link";
import type { MovesLocale } from "@/lib/moves/i18n";

const COPY: Record<MovesLocale, { home: string; legal: string; privacy: string; rights: string }> = {
  de: { home: "/", legal: "Rechtliches", privacy: "Datenschutz", rights: "© 2026 Okri Holdings LLC" },
  en: { home: "/en", legal: "Legal notice", privacy: "Privacy", rights: "© 2026 Okri Holdings LLC" },
};

const PATHS: Record<MovesLocale, { legal: string; privacy: string }> = {
  de: { legal: "/legal", privacy: "/privacy" },
  en: { legal: "/en/legal", privacy: "/en/privacy" },
};

export default function PricingFooter({ locale }: { locale: MovesLocale }) {
  const c = COPY[locale];
  const p = PATHS[locale];

  return (
    <footer className="mv-footer" role="contentinfo">
      <Link href={c.home} className="mv-footer-mark">
        SEESZN
      </Link>
      <nav className="mv-footer-nav" aria-label={locale === "en" ? "Legal" : "Rechtliches"}>
        <Link href={p.legal}>{c.legal}</Link>
        <Link href={p.privacy}>{c.privacy}</Link>
      </nav>
      <span className="mv-footer-copy">{c.rights}</span>
    </footer>
  );
}
