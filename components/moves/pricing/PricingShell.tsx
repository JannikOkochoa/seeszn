"use client";

// ─── PREISE: Zustand, Sprache, Rahmen ─────────────────────────────────────────
// Drei Zustände: noch nicht gewählt, First Move, Backlinks. Der Zustand steht in
// der Adresse (?product=…), damit eine ausgehende Mail direkt auf den richtigen
// Weg zeigt, der Zurück-Knopf zur vorherigen Wahl führt und ein Neuladen die
// Wahl nicht verliert.
//
// Beide Produktflächen bleiben im Baum und werden nur aus- und eingeblendet.
// Damit überlebt jede Konfiguration im Rechner einen Wechsel zu First Move und
// zurück: Menge, Kaufart, Format und Markt stehen danach unverändert da.
//
// Die Sprache reicht dieser Rahmen als Kontext weiter. Die Alternative wäre,
// ein Wörterbuch durch acht Komponenten zu reichen, von denen sechs es nur
// weitergeben.

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { track } from "@/lib/moves/analytics";
import { pricingCopy, type MovesLocale, type PricingCopy } from "@/lib/moves/i18n";

export type PricingProduct = "first-move" | "backlinks";

function isProduct(value: string | null): value is PricingProduct {
  return value === "first-move" || value === "backlinks";
}

interface PricingState {
  product: PricingProduct | null;
  select: (next: PricingProduct | null) => void;
  t: PricingCopy;
  locale: MovesLocale;
}

const Ctx = createContext<PricingState | null>(null);

export function usePricing(): PricingState {
  const value = useContext(Ctx);
  if (!value) throw new Error("usePricing außerhalb von PricingShell");
  return value;
}

/** Nur das Wörterbuch, für Komponenten ohne Interesse am Produktzustand. */
export function useCopy(): PricingCopy {
  return usePricing().t;
}

export default function PricingShell({
  initial,
  locale,
  basePath,
  entry,
  firstMove,
  backlinks,
}: {
  initial: PricingProduct | null;
  locale: MovesLocale;
  /** "/pricing" oder "/en/pricing". Hält die Adresse in der Sprache. */
  basePath: string;
  entry: React.ReactNode;
  firstMove: React.ReactNode;
  backlinks: React.ReactNode;
}) {
  const [product, setProduct] = useState<PricingProduct | null>(initial);
  const t = pricingCopy(locale);

  useEffect(() => {
    const onPop = () => {
      const next = new URLSearchParams(window.location.search).get("product");
      setProduct(isProduct(next) ? next : null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const select = useCallback(
    (next: PricingProduct | null) => {
      setProduct(next);
      window.history.pushState(null, "", next ? `${basePath}?product=${next}` : basePath);
      window.scrollTo({ top: 0, behavior: "auto" });
      if (next) track("pricing_product_selected", { product: next, locale });
    },
    [basePath, locale],
  );

  return (
    <Ctx.Provider value={{ product, select, t, locale }}>
      <div hidden={product !== null}>{entry}</div>

      {product !== null ? (
        <div className="mv-pathbar" role="tablist" aria-label={t.pathbar.label}>
          {(["first-move", "backlinks"] as const).map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={id === product}
              tabIndex={id === product ? 0 : -1}
              className="mv-pathbar-btn"
              onClick={() => select(id)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                  e.preventDefault();
                  select(id === "first-move" ? "backlinks" : "first-move");
                }
              }}
            >
              {id === "first-move" ? t.pathbar.firstMove : t.pathbar.backlinks}
            </button>
          ))}
        </div>
      ) : null}

      <div hidden={product !== "first-move"}>{firstMove}</div>
      <div hidden={product !== "backlinks"}>{backlinks}</div>
    </Ctx.Provider>
  );
}

/** Eine der beiden Zonen im Einstieg. Ohne Preis: siehe EntryView. */
export function PathZone({
  n,
  name,
  line,
  cta,
  product,
}: {
  n: string;
  name: string;
  line: string;
  cta: string;
  product: PricingProduct;
}) {
  const { select } = usePricing();
  return (
    <button type="button" className="mv-path" onClick={() => select(product)}>
      <span className="mv-path-n">{n}</span>
      <span>
        <span className="mv-path-name">{name}</span>
        <span className="mv-path-for mv-micro">{line}</span>
      </span>
      <span className="mv-path-go">
        {cta}
        <span aria-hidden="true">→</span>
      </span>
    </button>
  );
}
