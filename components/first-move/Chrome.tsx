// ─── First Move: Product Header und Product Footer ────────────────────────────
// Der Kaufweg bekommt einen eigenen, fokussierten Rahmen. Die normale
// Agenturnavigation erscheint hier nicht: keine Ergebnisse, keine Insights, kein
// Studio, kein Blog, kein Social. Was bleibt, ist Marke, Produkt, eine Handlung
// und die notwendigen Rechtslinks.
//
// V6: der Preis steht nicht mehr im Header. Er bleibt öffentlich, direkt unter
// dem Domainfeld und im Angebot, konkurriert dort aber nicht mit der Handlung.
//
// Der Header-CTA ist die Fast Lane: er führt direkt zum kommerziellen Teil
// derselben Produktseite, damit niemand den Scan durchlaufen muss, der das
// Produkt schon verstanden hat. Er ist ein Anker, kein Skript, und funktioniert
// deshalb ohne JavaScript.

import Link from "next/link";
import type { FmLocale } from "@/lib/first-move/copy";
import { PRODUCT_LABEL } from "@/lib/first-move/product";

export function ProductHeader({ locale = "de" }: { locale?: FmLocale }) {
  const en = locale === "en";
  return (
    <header className="fm-header">
      <div className="fm-header-in">
        <Link
          href={en ? "/en" : "/"}
          aria-label={en ? "SEESZN, back to the home page" : "SEESZN, zur Startseite"}
          className="fm-logo"
        >
          SEESZN
        </Link>
        <div className="fm-header-right">
          <span className="fm-header-meta">
            <span className="fm-header-label">{PRODUCT_LABEL}</span>
          </span>
          <a href="#angebot" className="fm-btn fm-btn--sm">
            {en ? "Start the First Move" : "First Move starten"}
          </a>
        </div>
      </div>
    </header>
  );
}

export function ProductFooter({ locale = "de" }: { locale?: FmLocale }) {
  const en = locale === "en";
  return (
    <footer className="fm-footer" role="contentinfo">
      <div className="fm-footer-in">
        <nav className="fm-footer-links" aria-label={en ? "Legal" : "Rechtliches"}>
          <Link href={en ? "/en/privacy" : "/privacy"} className="fm-footer-link">
            {en ? "Privacy" : "Datenschutz"}
          </Link>
          <Link href={en ? "/en/legal" : "/legal"} className="fm-footer-link">
            {en ? "Legal notice" : "Impressum"}
          </Link>
          <a href="#leistungsbedingungen" className="fm-footer-link">
            {en ? "Terms of service" : "Leistungsbedingungen"}
          </a>
          <a href="mailto:hello@seeszn.com" className="fm-footer-link">
            hello@seeszn.com
          </a>
        </nav>
        <span className="fm-footer-copy">© 2026 Okri Holdings LLC</span>
      </div>
    </footer>
  );
}
