"use client";

// ─── BACKLINKS: Zielmarkt ─────────────────────────────────────────────────────
// Ein Auswahlfeld, kein natives <select>: die Liste wächst, und sie muss über
// Eigenbezeichnung, Ländercode und Domain-Endung durchsuchbar sein, weil
// Einkäufer genau so tippen. Ein natives Select kann das nicht.
//
// Dafür übernimmt die Komponente alles, was ein Select mitbringt: Escape
// schließt, Pfeiltasten wandern, Enter wählt, ein Klick nach außen schließt, und
// der Fokus kehrt auf den Auslöser zurück.

import { useEffect, useRef, useState } from "react";
import { MARKETS, marketByCode, marketLabel, searchMarkets } from "@/lib/moves/markets";
import { useCopy, usePricing } from "@/components/moves/pricing/PricingShell";

export default function MarketSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string) => void;
}) {
  const t = useCopy().backlinks;
  const { locale } = usePricing();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);

  const selected = marketByCode(value);
  const results = searchMarkets(query);

  // Der Effekt macht nur das, wofür ein Effekt da ist: den Fokus setzen und
  // einen Listener am Dokument an- und abmelden. Der Cursor wird beim Öffnen
  // gesetzt, nicht hier, sonst entsteht ein zweiter Renderdurchlauf allein für
  // die Startposition der Auswahl.
  useEffect(() => {
    if (!open) return;
    search.current?.focus();

    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const openPanel = () => {
    setCursor(Math.max(0, MARKETS.findIndex((m) => m.code === value)));
    setQuery("");
    setOpen(true);
  };

  const close = (refocus = true) => {
    setOpen(false);
    setQuery("");
    if (refocus) trigger.current?.focus();
  };

  const choose = (code: string) => {
    // Eine manuelle Auswahl gewinnt immer gegen eine spätere automatische
    // Erkennung. Die Regel liegt in lib/moves/markets.ts, hier wird sie nur
    // ausgelöst.
    onChange(code);
    close();
  };

  return (
    <div className="mv-market" ref={root}>
      <button
        type="button"
        ref={trigger}
        className="mv-market-btn"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => (open ? close() : openPanel())}
      >
        <span className="mv-cfg-k" style={{ margin: 0 }}>
          {t.marketLabel}
        </span>
        <span className="mv-market-flag" aria-hidden="true">
          {selected.flag}
        </span>
        {marketLabel(selected, locale)}
        <span className="mv-market-caret" aria-hidden="true">
          ▼
        </span>
      </button>

      {open ? (
        <div className="mv-market-panel">
          <input
            ref={search}
            className="mv-market-search"
            type="text"
            value={query}
            placeholder={t.marketSearch}
            aria-label={t.marketSearchLabel}
            onChange={(e) => {
              setQuery(e.currentTarget.value);
              setCursor(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") { e.preventDefault(); close(); }
              if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(results.length - 1, c + 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => Math.max(0, c - 1)); }
              if (e.key === "Enter") {
                e.preventDefault();
                const hit = results[cursor];
                if (hit) choose(hit.code);
              }
            }}
          />

          <ul className="mv-market-list" role="listbox" aria-label={t.marketLabel}>
            {results.map((market, i) => (
              <li key={market.code} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={market.code === value}
                  data-cursor={i === cursor ? "true" : undefined}
                  className="mv-market-opt"
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => choose(market.code)}
                >
                  <span className="mv-market-flag" aria-hidden="true">
                    {market.flag}
                  </span>
                  {marketLabel(market, locale)}
                  {market.code === value ? null : <span className="mv-market-code">{market.code}</span>}
                </button>
              </li>
            ))}
            {results.length === 0 ? (
              <li className="mv-market-empty">
                {t.marketEmpty(MARKETS.length)}
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
