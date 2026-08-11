"use client";

import { useId, useState } from "react";
import { IconArrowRight } from "./Icons";

interface MockCtaProps {
  label: string;
  /** "button" = gefüllter Primär-CTA, "link" = textueller Card-Link. */
  variant: "button" | "link";
  /** Warum dieser CTA noch nicht verlinkt. Erscheint erst nach Klick. */
  note: string;
}

/**
 * CTA ohne freigegebene Ziel-URL.
 *
 * CONTENT.md verbietet ausdrücklich, für den Klassenfahrtanbieter-Vergleich und
 * für die Qualitäts-Karten Links zu erfinden. Gleichzeitig soll die CTA-Hierarchie
 * des Entwurfs sichtbar bleiben. Lösung: ein echter Button mit identischer Optik,
 * der nicht navigiert, sondern den offenen Punkt benennt. Damit gibt es weder
 * eine Fantasie-URL noch einen toten Link noch eine gefakte Affordanz.
 */
export default function MockCta({ label, variant, note }: MockCtaProps) {
  const [shown, setShown] = useState(false);
  const noteId = useId();

  return (
    <div className={variant === "button" ? "kb-mockcta" : "kb-mockcta kb-mockcta-inline"}>
      <button
        type="button"
        className={
          variant === "button" ? "kb-btn kb-btn-primary kb-r8" : "kb-cardlink"
        }
        onClick={() => setShown((v) => !v)}
        aria-expanded={shown}
        aria-controls={noteId}
      >
        {label}
        <IconArrowRight className={variant === "button" ? "kb-btn-icon" : "kb-cardlink-icon"} />
      </button>
      <p id={noteId} className="kb-mockcta-note" hidden={!shown}>
        {note}
      </p>
    </div>
  );
}
