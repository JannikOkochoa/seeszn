"use client";

// ─── First Move: Domainfeld im Abschluss ──────────────────────────────────────
// Es gibt nur eine Prüfung auf der Seite. Dieses Feld startet dieselbe Maschine
// weiter oben, statt einen zweiten Zustand aufzumachen: es meldet die Domain per
// Event an die Engine, die daraufhin scrollt und den Scan startet.

import { useState } from "react";
import { HERO_FACT_LINE } from "@/lib/first-move/product";

export default function FinalCtaForm({ paid = false }: { paid?: boolean }) {
  const [domain, setDomain] = useState("");

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
          Deine Domain
        </label>
        <input
          id="fm-final-domain"
          className="fm-input"
          type="text"
          inputMode="url"
          autoComplete="url"
          spellCheck={false}
          placeholder="deine-domain.de"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />
        <button type="submit" className="fm-btn">
          {paid ? "Paid Check starten" : "Domain prüfen"}
        </button>
      </div>
      <p className="fm-micro">{HERO_FACT_LINE}</p>
    </form>
  );
}
