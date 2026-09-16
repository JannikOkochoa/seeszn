// ─── Reduzierte Bewegung, hydrationssicher ────────────────────────────────────
// `useReducedMotion` aus framer-motion liefert auf dem Server einen anderen Wert
// als im Browser. Wer daraus einen anderen Baum rendert, bekommt beim Hydrieren
// einen Fehler und React verwirft den Teilbaum: genau das ist im Konfigurator
// passiert, und zwar ausschließlich bei den Besuchern, die reduzierte Bewegung
// eingestellt haben.
//
// `useSyncExternalStore` ist für diesen Fall gebaut. Beim Hydrieren gilt der
// Serverwert, danach wird einmal mit dem echten Wert nachgerendert. Kein
// Strukturwechsel, keine Warnung, und eine Änderung der Systemeinstellung greift
// ohne Neuladen.

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

const getSnapshot = () =>
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia(QUERY).matches
    : false;

/** Auf dem Server immer false: der Server kennt die Einstellung nicht. */
const getServerSnapshot = () => false;

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
