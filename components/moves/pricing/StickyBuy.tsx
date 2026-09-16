"use client";

// ─── PREISE: die klebende Kaufleiste ──────────────────────────────────────────
// Sie erscheint erst, wenn der Hauptknopf das Bild verlassen hat, und geht
// wieder, sobald der Abschluss im Bild steht. Damit steht nie zweimal dieselbe
// Handlung gleichzeitig auf dem Schirm, und sie taucht nicht auf, bevor der
// Besucher weiß, worum es geht.
//
// Sie verdeckt nichts: solange sie sichtbar ist, bekommt der Inhalt unten einen
// Platzhalter derselben Höhe.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function StickyBuy({
  name,
  detail,
  cta,
  href,
  onClick,
  afterId,
  untilId,
  hidden = false,
}: {
  name: string;
  /** Kompakte Metadaten, mit Mittelpunkt getrennt. */
  detail: string;
  cta: string;
  href?: string;
  onClick?: () => void;
  afterId: string;
  untilId: string;
  /** Unterdrückt die Leiste, etwa während Checkout oder Custom. */
  hidden?: boolean;
}) {
  const [shown, setShown] = useState(false);
  const passed = useRef(false);
  const atEnd = useRef(false);

  useEffect(() => {
    const after = document.getElementById(afterId);
    const until = document.getElementById(untilId);
    if (!after) return;

    const apply = () => setShown(passed.current && !atEnd.current);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.target === after) passed.current = e.boundingClientRect.top < 0;
          if (e.target === until) atEnd.current = e.isIntersecting;
        }
        apply();
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    io.observe(after);
    if (until) io.observe(until);
    return () => io.disconnect();
  }, [afterId, untilId]);

  const visible = shown && !hidden;

  return (
    <>
      <div className="mv-sticky" data-shown={visible ? "true" : undefined} aria-hidden={!visible}>
        <span className="mv-sticky-what">
          <span className="mv-sticky-name">{name}</span>
          <span className="mv-sticky-price">{detail}</span>
        </span>
        {href ? (
          <Link href={href} className="mv-cta" tabIndex={visible ? 0 : -1} onClick={onClick}>
            {cta}
            <span className="mv-cta-arrow" aria-hidden="true">→</span>
          </Link>
        ) : (
          <button type="button" className="mv-cta" tabIndex={visible ? 0 : -1} onClick={onClick}>
            {cta}
            <span className="mv-cta-arrow" aria-hidden="true">→</span>
          </button>
        )}
      </div>
      <div className="mv-sticky-pad" data-shown={visible ? "true" : undefined} aria-hidden="true" />
    </>
  );
}
