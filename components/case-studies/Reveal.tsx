"use client";

import { useEffect, useRef } from "react";

// ─── Scroll-Reveal ───────────────────────────────────────────────────────────
// Hüllt serverseitig gerenderte Kinder ein und blendet sie beim Eintritt in den
// Viewport gestaffelt ein. Die Kinder bleiben echtes HTML aus der ersten
// Antwort — hier wird nur die Sichtbarkeit gesteuert.
//
// Wichtig: Der versteckte Zustand entsteht erst, wenn dieser Effekt läuft
// (`data-armed`). Ohne JavaScript, bei einem Hydration-Fehler oder bei
// `prefers-reduced-motion` bleibt alles sichtbar. Der Beobachter deckt
// zusätzlich Elemente ab, an denen der Viewport per Sprung vorbeigezogen ist —
// ein IntersectionObserver feuert in dem Fall nie.

export default function Reveal({
  children,
  stagger = 90,
  className,
}: {
  children: React.ReactNode;
  /** Verzögerung je Element in ms. 0 blendet alles gleichzeitig ein. */
  stagger?: number;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const nodes = Array.from(el.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!nodes.length) return;

    nodes.forEach((n, i) => n.style.setProperty("--reveal-delay", `${i * stagger}ms`));
    const pending = new Set(nodes);

    el.setAttribute("data-armed", "true");

    const show = (n: HTMLElement) => {
      n.setAttribute("data-in", "true");
      pending.delete(n);
      io.unobserve(n);
      if (!pending.size) teardown();
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) show(e.target as HTMLElement);
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    pending.forEach((n) => io.observe(n));

    let frame = 0;
    const sweep = () => {
      frame = 0;
      for (const n of Array.from(pending)) {
        if (n.getBoundingClientRect().bottom < 0) show(n);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(sweep);
    };

    function teardown() {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return teardown;
  }, [stagger]);

  return (
    <div ref={root} data-reveal-root className={className}>
      {children}
    </div>
  );
}
