"use client";

// ─── First Move: Domainfeld im Abschluss ──────────────────────────────────────
// Es gibt nur eine Prüfung auf der Seite. Dieses Feld startet dieselbe Maschine
// weiter oben, statt einen zweiten Zustand aufzumachen: es meldet die Domain per
// Event an die Engine, die daraufhin scrollt und den Scan startet.

import { useState } from "react";
import { FUNNEL_STRINGS, type FmLocale } from "@/lib/first-move/copy";
import { HERO_FACT_LINE } from "@/lib/first-move/product";
import { HERO_FACT_LINE_EN } from "@/lib/first-move/productEn";

export default function FinalCtaForm({
  paid = false,
  locale = "de",
}: {
  paid?: boolean;
  locale?: FmLocale;
}) {
  const [domain, setDomain] = useState("");
  const f = FUNNEL_STRINGS[locale];

  return (
    <form
      className="fm-form"
      onSubmit={(e) => {
        e.preventDefault();
        const value = domain.trim();
        if (!value) return;
        window.dispatchEvent(new CustomEvent("fm:start", { detail: { domain: value } }));
      }}
    >
      <div className="fm-field">
        <label htmlFor="fm-final-domain" className="fm-skip">
          {f.heroFieldLabel}
        </label>
        <input
          id="fm-final-domain"
          className="fm-input"
          type="text"
          inputMode="url"
          autoComplete="url"
          spellCheck={false}
          placeholder={f.instrument.placeholder}
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />
        <button type="submit" className="fm-btn">
          {paid ? "Paid Check starten" : f.heroCta}
        </button>
      </div>
      <p className="fm-micro">{locale === "en" ? HERO_FACT_LINE_EN : HERO_FACT_LINE}</p>
    </form>
  );
}
