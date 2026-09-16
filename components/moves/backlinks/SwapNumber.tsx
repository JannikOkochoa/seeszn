"use client";

// ─── BACKLINKS: die wechselnde Zahl ───────────────────────────────────────────
// Steigt von unten ein und nach oben aus, wenn der Wert größer wird, und
// umgekehrt: die Bewegungsrichtung bestätigt die Richtung der Änderung.
//
// `instant` ist die Lehre aus einem echten Fehler. AnimatePresence mit einem
// Key je Wert legt bei jeder Änderung einen neuen motion.span an und lässt den
// alten über eine 300ms-Transition ausblenden. Bei einer Handvoll Wechsel pro
// Sekunde ist das unsichtbar. Beim schnellen Ziehen des Reglers über die
// Skala erzeugt derselbe Mechanismus dutzende Wechsel in derselben Sekunde,
// und weil jeder alte Knoten erst nach 300ms verschwindet, überlappen sich
// mehrere absolut positionierte Zahlen gleichzeitig: die alte Summe blieb
// sichtbar unter der neuen, Stückpreise lagen übereinander, die Fußzeile
// kollidierte mit dem Preis. Das Bild aus dem Fehlerbericht.
//
// Die Lösung liegt nicht in der Zeitdauer, sondern in der Knotenzahl während
// des Ziehens: `instant` rendert dann einen einzigen <span>, ohne
// AnimatePresence, ohne Warteschlange, ohne einen zweiten Knoten, der noch
// aus dem Bild fahren müsste. Erst nach dem Loslassen, bei einem Klick auf
// einen Ankerpunkt, einer Pfeiltaste oder einer bestätigten Eingabe, kommt die
// Übergangsanimation zurück und hat dann auch nur einen einzigen Wechsel zu
// zeigen.
//
// Der Baum bleibt in beiden Bewegungsmodi gleich strukturiert: bei reduzierter
// Bewegung wird ebenfalls direkt gerendert, ohne einen zweiten Codepfad mit
// eigenem Markup, an dem Server und Browser beim Hydrieren auseinanderlaufen
// könnten.

import { AnimatePresence, motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/moves/useReducedMotion";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function SwapNumber({
  value,
  direction,
  live,
  instant,
  className,
  children,
}: {
  value: string | number;
  direction: number;
  /**
   * False, solange der Besucher nichts verändert hat. Dann rendert die Zahl
   * ohne Startzustand, und der Server liefert exakt dieselben Attribute wie
   * der Browser beim Hydrieren.
   */
  live: boolean;
  /** True während des aktiven Ziehens: ein Knoten, keine Transition. */
  instant: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const reduced = usePrefersReducedMotion();

  if (instant || reduced) {
    return <span className={className}>{children}</span>;
  }

  const enter = direction >= 0 ? "0.28em" : "-0.28em";
  const leave = direction >= 0 ? "-0.22em" : "0.22em";

  return (
    <span className="mv-swap">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={String(value)}
          className={className}
          initial={live ? { opacity: 0, y: enter, filter: "blur(3px)" } : false}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: leave, filter: "blur(3px)", position: "absolute" }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
