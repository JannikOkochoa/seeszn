"use client";

import { useId, useState } from "react";
import { IconArrowRight, IconHandCard } from "./Icons";

type Variant = "button" | "button-outline" | "link";

/**
 * Serialisierbare Schlüssel statt Komponenten-Funktionen.
 *
 * Diese Datei ist eine Client Component, die Aufruferin ist eine Server
 * Component. Über diese Grenze lassen sich nur serialisierbare Werte reichen,
 * und eine Funktion ist keiner. Ein `icon`-Prop, das die Icon-Komponente selbst
 * übergab, ließ die Produktions-Runtime mit „Functions cannot be passed
 * directly to Client Components" abbrechen. Lokal fiel das nicht auf, weil die
 * Route hinter der Zugangstür liegt und ohne Session gar nicht bis hierher kam.
 *
 * Gleiches Muster wie USP_ICONS und TRUST_ICONS in UeberKluehspiesMockup: der
 * Aufrufer nennt einen Schlüssel, die Zuordnung liegt dort, wo gerendert wird.
 */
export type MockCtaIcon = "handCard";

const ICONS: Record<MockCtaIcon, (p: { className?: string }) => React.ReactElement> = {
  handCard: IconHandCard,
};

interface MockCtaProps {
  label: string;
  /** "button" = gefüllter Primär-CTA, "button-outline" = sekundärer Button,
   *  "link" = textueller Card-Link. */
  variant: Variant;
  /** Warum dieser CTA noch nicht verlinkt. Erscheint erst nach Klick. */
  note: string;
  /** Optionales führendes Icon, nur für die Button-Varianten. */
  icon?: MockCtaIcon;
}

const BUTTON_CLASS: Record<Variant, string> = {
  button: "kb-btn kb-btn-primary kb-r8",
  "button-outline": "kb-btn kb-btn-outline kb-r8",
  link: "kb-cardlink",
};

/**
 * CTA ohne freigegebene Ziel-URL.
 *
 * Für den Klassenfahrtanbieter-Vergleich existiert noch keine Produktionsseite.
 * Gleichzeitig soll die CTA-Hierarchie des Entwurfs sichtbar bleiben. Lösung:
 * ein echter Button mit identischer Optik, der nicht navigiert, sondern den
 * offenen Punkt benennt. Damit gibt es weder eine Fantasie-URL noch einen toten
 * Link noch eine gefakte Affordanz.
 */
export default function MockCta({ label, variant, note, icon }: MockCtaProps) {
  const [shown, setShown] = useState(false);
  const noteId = useId();
  const isLink = variant === "link";
  const Icon = icon ? ICONS[icon] : null;

  return (
    <div className={isLink ? "kb-mockcta kb-mockcta-inline" : "kb-mockcta"}>
      <button
        type="button"
        className={BUTTON_CLASS[variant]}
        onClick={() => setShown((v) => !v)}
        aria-expanded={shown}
        aria-controls={noteId}
      >
        {Icon && !isLink ? <Icon className="kb-btn-icon kb-btn-icon-lead" /> : null}
        {label}
        <IconArrowRight className={isLink ? "kb-cardlink-icon" : "kb-btn-icon"} />
      </button>
      <p id={noteId} className="kb-mockcta-note" hidden={!shown}>
        {note}
      </p>
    </div>
  );
}
