"use client";

// ─── BACKLINKS: der Mengenregler ──────────────────────────────────────────────
// Der Regler arbeitet auf der MENGE selbst, Schrittweite eins. Jede ganze Zahl
// zwischen Mindest- und Höchstmenge ist erreichbar, mit Finger, Maus und
// Pfeiltaste.
//
// Beschriftet wird trotzdem nur an den Ankerpunkten. 96 Zahlen unter einer
// Schiene wären keine Orientierung, sondern Rauschen; die Anker genügen, um
// die Skala zu lesen, und die gewählte Zahl steht ohnehin groß darüber.
//
// Darunter liegt ein natives <input type="range">. Damit kommen Tastatur,
// Touch, Screenreader und die Semantik ohne Nachbau; gezeichnet wird die
// Schiene darunter. Während des Ziehens läuft keine Übergangsanimation, sonst
// liefe der Griff dem Finger hinterher.

import { useCallback, useEffect, useState } from "react";

export default function QuantitySlider({
  min,
  max,
  anchors,
  value,
  onChange,
  /** True, solange ein Wechsel nicht vom Besucher, sondern vom Moduswechsel kommt. */
  autoStepping = false,
  label,
  valueText,
  onDraggingChange,
}: {
  min: number;
  max: number;
  anchors: readonly number[];
  value: number;
  onChange: (quantity: number) => void;
  autoStepping?: boolean;
  label: string;
  /** Was ein Screenreader statt der nackten Zahl vorliest. */
  valueText: string;
  /**
   * Meldet das aktive Ziehen nach außen. Der Preisblock schaltet damit seine
   * Wechselanimation ab, solange gezogen wird: siehe SwapNumber für den Grund.
   */
  onDraggingChange?: (dragging: boolean) => void;
}) {
  const [dragging, setDraggingState] = useState(false);
  const setDragging = useCallback(
    (next: boolean) => {
      setDraggingState(next);
      onDraggingChange?.(next);
    },
    [onDraggingChange],
  );

  const span = Math.max(1, max - min);
  const pctOf = (q: number) => ((q - min) / span) * 100;
  const pct = pctOf(value);

  useEffect(() => {
    if (!dragging) return;
    const stop = () => setDragging(false);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, [dragging, setDragging]);

  const pick = useCallback(
    (q: number) => {
      const next = Math.min(max, Math.max(min, Math.round(q)));
      if (next !== value) onChange(next);
    },
    [min, max, value, onChange],
  );

  return (
    <div className="mv-slider">
      <div
        className="mv-slider-rail"
        data-dragging={dragging ? "true" : "false"}
        data-autostep={autoStepping && !dragging ? "true" : undefined}
      >
        <span className="mv-slider-track" aria-hidden="true" />
        <span className="mv-slider-fill" aria-hidden="true" style={{ width: `${pct}%` }} />

        {/* Rasterpunkte nur an den beschrifteten Stellen. Sie sind Orientierung,
            keine Aussage darüber, was wählbar ist. */}
        {anchors.map((q) => (
          <span
            key={q}
            aria-hidden="true"
            className="mv-slider-stop"
            data-passed={q <= value ? "true" : "false"}
            style={{ left: `${pctOf(q)}%` }}
          />
        ))}

        <span className="mv-slider-thumb" aria-hidden="true" style={{ left: `${pct}%` }} />

        <input
          className="mv-slider-input"
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={valueText}
          onChange={(e) => pick(Number(e.currentTarget.value))}
          onPointerDown={() => setDragging(true)}
          onKeyDown={(e) => {
            // Pos1 und Ende fehlen auf range in manchen Browsern. Ergänzt, weil
            // der Sprung an die Enden der Skala der häufigste Tastaturweg ist.
            if (e.key === "Home") { e.preventDefault(); pick(min); }
            if (e.key === "End") { e.preventDefault(); pick(max); }
          }}
        />
      </div>

      {/* Die Skala. Jede Beschriftung ist zugleich ein Sprungziel. */}
      <div className="mv-slider-ticks">
        {anchors.map((q, i) => (
          <button
            key={q}
            type="button"
            className="mv-slider-tick"
            data-active={q === value ? "true" : undefined}
            data-edge={i === 0 ? "start" : i === anchors.length - 1 ? "end" : undefined}
            /* Auf dem Telefon bleiben nur die Enden und die Auswahl stehen. */
            data-minor={i !== 0 && i !== anchors.length - 1 && q !== value ? "true" : undefined}
            style={{ left: `${pctOf(q)}%` }}
            onClick={() => pick(q)}
            tabIndex={-1}
            aria-hidden="true"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
