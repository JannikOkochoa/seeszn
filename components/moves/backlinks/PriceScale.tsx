"use client";

// ─── BACKLINKS: die Staffel ───────────────────────────────────────────────────
// Die Skalenlogik sichtbar machen, ohne sie zu bewerben. Eine Tabelle, kein
// Kachelfeld, und kein Etikett wie "beliebteste Wahl", für das es hier ohnehin
// keine Belege gäbe.
//
// Die letzte Spalte zeigt je Kaufart eine andere Größe, weil je Kaufart eine
// andere Frage ansteht:
//
//   EINMALIG   "was spare ich je Backlink, wenn ich mehr nehme"
//              Der Stückpreis fällt hier über die ganze Staffel, von 19,80 €
//              auf 15,99 €. Die Ersparnis je Stück ist damit die passende Größe.
//
//   MONATLICH  "was spare ich gegenüber demselben Einmalkauf"
//              Der Stückpreis fällt auch hier durchgehend, von 16,20 € auf
//              14,45 €. Trotzdem steht in dieser Spalte die Ersparnis gegenüber
//              dem Einmalkauf: wer monatlich bucht, vergleicht nicht mit der
//              kleinsten Monatsmenge, sondern mit dem Preis, den dieselbe Menge
//              einmalig kosten würde. Das ist die Entscheidung, die ansteht.
//
// Der Balken läuft in beiden Fällen von null aus über eine echte Größe. Eine
// abgeschnittene Achse, die einen Unterschied größer macht, als er ist, kommt
// hier nicht vor.
//
// Jede Zeile ist zugleich ein Sprungziel. Wer die Staffel liest, will von dort
// aus wählen und nicht wieder nach oben zum Regler.

import { euroIn, priceTable, unitEuroIn, type PurchaseMode } from "@/lib/moves/backlinks";
import type { MovesLocale, PricingCopy } from "@/lib/moves/i18n";

export default function PriceScale({
  mode,
  quantity,
  onPick,
  locale,
  t,
}: {
  mode: PurchaseMode;
  quantity: number;
  onPick: (quantity: number) => void;
  locale: MovesLocale;
  t: PricingCopy["backlinks"];
}) {
  const rows = priceTable(mode);
  const monthly = mode === "monthly";
  const euro = (c: number) => euroIn(c, locale);
  const unitEuro = (c: number) => unitEuroIn(c, locale);

  // Die Größe der letzten Spalte, je Kaufart eine andere. Siehe oben.
  const deltaOf = (row: (typeof rows)[number]) =>
    monthly ? row.savingCents : rows[0]!.unitCents - row.unitCents;

  const maxDelta = Math.max(...rows.map(deltaOf), 1);

  const deltaHead = monthly ? t.priceScale.savingHeadMonthly : t.priceScale.savingHeadOnce(rows[0]!.quantity);

  return (
    <div className="mv-scale">
      <div className="mv-scale-row" data-head="true" aria-hidden="true">
        <span className="mv-micro">{t.quantityLabel}</span>
        <span className="mv-micro">{monthly ? t.totalLabelMonthly : t.totalLabelOnce}</span>
        <span className="mv-micro">{t.perUnit}</span>
        <span className="mv-micro">{deltaHead}</span>
      </div>

      {rows.map((row) => {
        const active = row.quantity === quantity;
        const delta = deltaOf(row);
        const label = delta === 0 ? t.priceScale.reference : `− ${euro(delta)}`;

        return (
          <div
            key={row.quantity}
            className="mv-scale-row"
            data-active={active ? "true" : undefined}
            role="button"
            tabIndex={0}
            aria-pressed={active}
            aria-label={
              delta === 0
                ? t.priceScale.rowLabelReference(row.quantity, euro(row.totalCents), unitEuro(row.unitCents))
                : t.priceScale.rowLabelSaving(
                    row.quantity,
                    euro(row.totalCents),
                    unitEuro(row.unitCents),
                    euro(delta),
                    monthly,
                    rows[0]!.quantity,
                  )
            }
            onClick={() => onPick(row.quantity)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPick(row.quantity);
              }
            }}
          >
            <span className="mv-scale-q">{row.quantity}</span>
            <span className="mv-scale-v mv-scale-v--lead">{euro(row.totalCents)}</span>
            <span className="mv-scale-v">{unitEuro(row.unitCents)}</span>
            <span className="mv-scale-delta">
              <span className="mv-scale-bar" aria-hidden="true">
                <i style={{ width: `${(delta / maxDelta) * 100}%` }} />
              </span>
              <span className="mv-scale-v">{label}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
