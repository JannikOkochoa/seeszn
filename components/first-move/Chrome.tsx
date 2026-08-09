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
import { PRODUCT_LABEL } from "@/lib/first-move/product";

export function ProductHeader() {
  return (
    <header className="fm-header">
      <div className="fm-header-in">
        <Link href="/" aria-label="SEESZN, zur Startseite" className="fm-logo">
          SEESZN
        </Link>
        <div className="fm-header-right">
          <span className="fm-header-meta">
            <span className="fm-header-label">{PRODUCT_LABEL}</span>
          </span>
          <a href="#angebot" className="fm-btn fm-btn--sm">
            First Move starten
          </a>
        </div>
      </div>
    </header>
  );
}

export function ProductFooter() {
  return (
    <footer className="fm-footer" role="contentinfo">
      <div className="fm-footer-in">
        <nav className="fm-footer-links" aria-label="Rechtliches">
          <Link href="/privacy" className="fm-footer-link">
            Datenschutz
          </Link>
          <Link href="/legal" className="fm-footer-link">
            Impressum
          </Link>
          <a href="#leistungsbedingungen" className="fm-footer-link">
            Leistungsbedingungen
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
