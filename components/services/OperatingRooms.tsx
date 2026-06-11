"use client";

import { motion, useScroll, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ROOMS as ROOMS_EN, type RoomVisualKind } from "@/lib/services";
import { CrawlMap, FanOut, SurfaceLayers, DiagnosisReport } from "./RoomVisuals";
import { useTranslations } from "@/lib/i18n/context";

const VISUALS: Record<RoomVisualKind, React.ComponentType> = {
  crawl: CrawlMap,
  fanout: FanOut,
  layers: SurfaceLayers,
  report: DiagnosisReport,
};

export default function OperatingRooms() {
  const t = useTranslations();
  const sys = t.servicesPage.system;
  // Merge translated room text with original visual kind (visual doesn't change per language)
  const ROOMS = t.servicesPage.rooms.map((r, i) => ({
    ...r,
    visual: ROOMS_EN[i].visual as RoomVisualKind,
    statement: [r.statementRoman, r.statementItalic] as [string, string],
  }));
  const sectionRef = useRef<HTMLElement>(null);
  const roomRefs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [seen, setSeen] = useState<boolean[]>(() => ROOMS.map(() => false));
  const reduced = useReducedMotion();

  // The Operating Line — scroll-linked signal that travels the four stations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.6", "end 0.85"],
  });

  useEffect(() => {
    const els = roomRefs.current.filter(Boolean) as HTMLElement[];
    if (!els.length) return;

    // once-only activation — a room stays "examined" after its first reveal
    const seenObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const idx = els.indexOf(en.target as HTMLElement);
          setSeen((s) => (s[idx] ? s : s.map((v, i) => (i === idx ? true : v))));
          seenObs.unobserve(en.target);
        });
      },
      { threshold: 0.18 }
    );

    // live station — whichever room crosses the center band of the viewport
    const liveObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          setActive(els.indexOf(en.target as HTMLElement));
        });
      },
      { rootMargin: "-42% 0px -42% 0px", threshold: 0 }
    );

    els.forEach((el) => {
      seenObs.observe(el);
      liveObs.observe(el);
    });
    return () => {
      seenObs.disconnect();
      liveObs.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} className="or-section" aria-label="The four rooms — services">
      {/* Section header */}
      <div className="or-header">
        <div className="or-chips">
          <span className="or-chip">03</span>
          <span className="or-chip">{sys.roomsHeader}</span>
        </div>
        <span className="or-chip or-chip--right">{sys.roomsSubheader}</span>
      </div>

      <div className="or-body">
        {/* ── The Operating Line — sticky station rail ── */}
        <nav className="or-rail" aria-label="Operating line — room index">
          <span className="or-rail-label">{t.common.railLabel}</span>
          <div className="or-rail-inner">
            <span className="or-rail-track" aria-hidden="true">
              <motion.span
                className="or-rail-fill"
                style={{ scaleY: reduced ? 1 : scrollYProgress }}
              />
            </span>
            <ul className="or-stations">
              {ROOMS.map((room, i) => (
                <li key={room.id}>
                  <a
                    href={`#${room.id}`}
                    className={`or-station${active === i ? " or-station--live" : ""}${
                      seen[i] ? " or-station--seen" : ""
                    }`}
                    aria-current={active === i ? "true" : undefined}
                  >
                    <span className="or-station-tick" aria-hidden="true" />
                    <span className="or-station-num">{room.index}</span>
                    <span className="or-station-name">{room.station}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* ── Rooms ── */}
        <div className="or-rooms">
          {ROOMS.map((room, i) => {
            const Visual = VISUALS[room.visual];
            return (
              <article
                key={room.id}
                id={room.id}
                ref={(el) => {
                  roomRefs.current[i] = el;
                }}
                className={`vroom${room.flip ? " vroom--flip" : ""}${
                  seen[i] ? " vroom--on" : ""
                }${active === i ? " vroom--live" : ""}`}
              >
                <div className="vroom-grid">
                  <div className="vroom-text">
                    <header className="vr-reveal" style={{ "--d": "0ms" } as React.CSSProperties}>
                      <div className="vroom-top">
                        <span className="vroom-index">{room.index}</span>
                        <span className="vroom-chip">
                          {room.station}
                          <span className="vroom-scan" aria-hidden="true" />
                        </span>
                      </div>
                      <h3 className="vroom-name">{room.name}</h3>
                      <p className="vroom-disc">{room.discipline}</p>
                    </header>

                    <p className="vroom-statement vr-reveal" style={{ "--d": "90ms" } as React.CSSProperties}>
                      {room.statement[0]} <em>{room.statement[1]}</em>
                    </p>

                    <p className="vroom-body vr-reveal" style={{ "--d": "180ms" } as React.CSSProperties}>
                      {room.body}
                    </p>

                    <div className="vr-reveal" style={{ "--d": "260ms" } as React.CSSProperties}>
                      <p className="vroom-deliv-label">DELIVERABLES</p>
                      <ul className="vroom-deliv">
                        {room.deliverables.map((d) => (
                          <li key={d}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="vroom-visual">
                    <Visual />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <style>{`
        /* ── Section shell ───────────────────────────── */
        .or-section {
          background: var(--paper);
          border-top: 1px solid var(--warm-black);
        }
        .or-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 44px 64px 36px;
        }
        .or-chips { display: flex; gap: 16px; align-items: center; }
        .or-chip {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        /* ── Body grid — rail + rooms ────────────────── */
        .or-body {
          display: grid;
          grid-template-columns: 184px 1fr;
        }

        /* ── The Operating Line rail ─────────────────── */
        .or-rail {
          position: sticky;
          top: 132px;
          align-self: start;
          padding: 8px 0 8px 64px;
          margin-bottom: 64px;
        }
        .or-rail-label {
          display: block;
          font-family: var(--font-mono), monospace;
          font-size: 8px;
          letter-spacing: 0.24em;
          color: var(--dust);
          margin-bottom: 22px;
        }
        .or-rail-inner { position: relative; padding-left: 20px; }
        .or-rail-track {
          position: absolute;
          left: 0; top: 4px; bottom: 4px;
          width: 1px;
          background: var(--line);
        }
        .or-rail-fill {
          position: absolute;
          inset: 0;
          background: var(--signal);
          transform-origin: top;
          will-change: transform;
        }
        .or-stations {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 34px;
        }
        .or-station {
          display: flex;
          align-items: baseline;
          gap: 10px;
          text-decoration: none;
          padding: 4px 0;
        }
        .or-station-tick {
          width: 8px;
          height: 1px;
          background: var(--dust);
          align-self: center;
          flex-shrink: 0;
          transition: width 500ms cubic-bezier(.16,1,.3,1), background 400ms ease;
        }
        .or-station-num {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.1em;
          color: var(--dust);
          transition: color 400ms ease;
        }
        .or-station-name {
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          letter-spacing: 0.16em;
          color: var(--dust);
          transition: color 400ms ease, letter-spacing 500ms cubic-bezier(.16,1,.3,1);
        }
        .or-station--seen .or-station-name { color: var(--text-secondary); }
        .or-station--live .or-station-tick { width: 18px; background: var(--signal); }
        .or-station--live .or-station-num,
        .or-station--live .or-station-name { color: var(--warm-black); }
        .or-station--live .or-station-name { letter-spacing: 0.2em; }
        .or-station:hover .or-station-name { color: var(--warm-black); }
        .or-station:focus-visible {
          outline: 1px solid var(--warm-black);
          outline-offset: 4px;
        }

        /* ── Room blocks ─────────────────────────────── */
        .vroom {
          border-top: 1px solid var(--warm-black);
          scroll-margin-top: 124px;
        }
        .vroom-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.12fr) minmax(0, 0.88fr);
          gap: 0;
        }
        .vroom-text {
          padding: 64px 56px 72px 48px;
        }
        .vroom-visual {
          border-left: 1px solid var(--line);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 56px 48px 56px 40px;
        }
        .vroom--flip .vroom-text { order: 2; padding: 64px 64px 72px 56px; }
        .vroom--flip .vroom-visual {
          order: 1;
          border-left: none;
          border-right: 1px solid var(--line);
          padding: 56px 40px 56px 24px;
        }

        /* ── Room header ─────────────────────────────── */
        .vroom-top {
          display: flex;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 18px;
        }
        .vroom-index {
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: clamp(40px, 4.5vw, 60px);
          line-height: 0.85;
          color: var(--warm-black);
        }
        .vroom-chip {
          position: relative;
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.18em;
          color: var(--text-secondary);
          padding-bottom: 7px;
          transition: color 400ms ease;
        }
        .vroom--live .vroom-chip { color: var(--warm-black); }
        .vroom-scan {
          position: absolute;
          left: 0; bottom: 0;
          width: 100%;
          height: 1px;
          background: var(--signal);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 800ms cubic-bezier(.16,1,.3,1) 240ms;
        }
        .vroom--on .vroom-scan { transform: scaleX(1); }

        .vroom-name {
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: clamp(22px, 2.2vw, 30px);
          letter-spacing: 0.01em;
          text-transform: uppercase;
          color: var(--warm-black);
          margin-bottom: 6px;
        }
        .vroom-disc {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--dust);
        }

        /* ── Room copy ───────────────────────────────── */
        .vroom-statement {
          font-family: var(--font-editorial), serif;
          font-weight: 400;
          font-size: clamp(24px, 2.6vw, 36px);
          line-height: 1.18;
          color: var(--warm-black);
          max-width: 520px;
          margin: 36px 0 24px;
        }
        .vroom-statement em {
          font-style: italic;
          color: var(--ink);
        }
        .vroom-body {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 15px;
          font-weight: 400;
          line-height: 1.65;
          color: var(--text-body);
          max-width: 460px;
          margin-bottom: 40px;
        }

        /* ── Deliverables index ──────────────────────── */
        .vroom-deliv-label {
          font-family: var(--font-mono), monospace;
          font-size: 8px;
          letter-spacing: 0.24em;
          color: var(--dust);
          margin-bottom: 4px;
        }
        .vroom-deliv {
          list-style: none;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0 36px;
          max-width: 480px;
        }
        .vroom-deliv li {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--text-body);
          padding: 10px 0;
          border-top: 1px solid var(--line);
        }

        /* ── Reveal system — once per room ───────────── */
        .vr-reveal {
          opacity: 0;
          transform: translateY(12px);
          transition:
            opacity 700ms cubic-bezier(.16,1,.3,1) var(--d, 0ms),
            transform 700ms cubic-bezier(.16,1,.3,1) var(--d, 0ms);
        }
        .vroom--on .vr-reveal {
          opacity: 1;
          transform: none;
        }

        /* ═══ Instrument animations ═══════════════════ */
        .rv-svg {
          display: block;
          width: 100%;
          max-width: 560px;
          height: auto;
          overflow: visible;
        }

        /* — 01 crawl map — */
        .cm-wall {
          opacity: 0;
          transition: opacity 600ms ease calc(120ms + var(--i, 0) * 0ms);
        }
        .vroom--on .cm-wall { opacity: 1; }
        .cm-route {
          stroke-dasharray: 620;
          stroke-dashoffset: 620;
          transition: stroke-dashoffset 1400ms cubic-bezier(.16,1,.3,1) 320ms;
        }
        .vroom--on .cm-route { stroke-dashoffset: 0; }
        .cm-node {
          opacity: 0;
          transition: opacity 400ms ease calc(480ms + var(--i, 0) * 170ms);
        }
        .vroom--on .cm-node { opacity: 1; }
        .cm-dead {
          opacity: 0;
          transition: opacity 700ms ease 1250ms;
        }
        .vroom--on .cm-dead { opacity: 1; }
        .cm-label {
          opacity: 0;
          transition: opacity 600ms ease 1400ms;
        }
        .vroom--on .cm-label { opacity: 1; }

        /* — 02 fan-out — */
        .fo-q {
          opacity: 0;
          transition: opacity 500ms ease 150ms;
        }
        .vroom--on .fo-q { opacity: 1; }
        .fo-fan {
          stroke-dasharray: 230;
          stroke-dashoffset: 230;
          transition: stroke-dashoffset 900ms cubic-bezier(.16,1,.3,1) calc(260ms + var(--i, 0) * 90ms);
        }
        .vroom--on .fo-fan { stroke-dashoffset: 0; }
        .fo-frag {
          opacity: 0;
          transition: opacity 500ms ease calc(700ms + var(--i, 0) * 90ms);
        }
        .vroom--on .fo-frag { opacity: 1; }
        .fo-conv {
          stroke-dasharray: 130;
          stroke-dashoffset: 130;
          transition: stroke-dashoffset 800ms cubic-bezier(.16,1,.3,1) calc(1050ms + var(--i, 0) * 70ms);
        }
        .vroom--on .fo-conv { stroke-dashoffset: 0; }
        .fo-box {
          stroke-dasharray: 360;
          stroke-dashoffset: 360;
          transition: stroke-dashoffset 1000ms cubic-bezier(.16,1,.3,1) 1350ms;
        }
        .vroom--on .fo-box { stroke-dashoffset: 0; }
        .fo-cites, .fo-caption {
          opacity: 0;
          transition: opacity 700ms ease 1900ms;
        }
        .vroom--on .fo-cites, .vroom--on .fo-caption { opacity: 1; }

        /* — 03 layered surface — */
        .sl-axis {
          stroke-dasharray: 310;
          stroke-dashoffset: 310;
          transition: stroke-dashoffset 1100ms cubic-bezier(.16,1,.3,1) 200ms;
        }
        .vroom--on .sl-axis { stroke-dashoffset: 0; }
        .sl-layer {
          opacity: 0;
          transform: translateY(var(--sy, 0px));
          transition:
            opacity 700ms ease calc(420ms + var(--i, 0) * 120ms),
            transform 950ms cubic-bezier(.16,1,.3,1) calc(420ms + var(--i, 0) * 120ms);
        }
        .vroom--on .sl-layer { opacity: 1; transform: translateY(0); }
        .sl-caption {
          opacity: 0;
          transition: opacity 700ms ease 1500ms;
        }
        .vroom--on .sl-caption { opacity: 1; }

        /* — 04 diagnosis report — */
        .dxr {
          width: 100%;
          max-width: 440px;
          border: 1px solid var(--warm-black);
          background: var(--paper);
        }
        .dxr-head {
          display: flex;
          justify-content: space-between;
          padding: 14px 20px;
          border-bottom: 1px solid var(--warm-black);
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.18em;
          color: var(--text-secondary);
        }
        .dxr-status {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 18px 20px;
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          letter-spacing: 0.14em;
          color: var(--warm-black);
        }
        .dxr-flag {
          width: 6px;
          height: 6px;
          background: var(--olive);
          flex-shrink: 0;
        }
        .dxr-list { list-style: none; }
        .dxr-row {
          display: flex;
          align-items: baseline;
          gap: 14px;
          padding: 12px 20px;
          border-top: 1px solid var(--line);
          opacity: 0;
          transform: translateY(8px);
          transition:
            opacity 600ms ease calc(350ms + var(--i, 0) * 130ms),
            transform 600ms cubic-bezier(.16,1,.3,1) calc(350ms + var(--i, 0) * 130ms);
        }
        .vroom--on .dxr-row { opacity: 1; transform: none; }
        .dxr-num {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          color: var(--dust);
          flex-shrink: 0;
        }
        .dxr-leak {
          font-family: var(--font-mono), monospace;
          font-size: 12px;
          color: var(--ink);
          flex: 1;
        }
        .dxr-locus {
          font-family: var(--font-mono), monospace;
          font-size: 8px;
          letter-spacing: 0.16em;
          color: var(--dust);
        }
        .dxr-foot {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-top: 1px solid var(--warm-black);
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.18em;
          color: var(--text-secondary);
          opacity: 0;
          transition: opacity 700ms ease 1100ms;
        }
        .vroom--on .dxr-foot { opacity: 1; }
        .dxr-next { font-size: 11px; color: var(--olive); }

        /* ── Reduced motion ──────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .vr-reveal, .dxr-row, .dxr-foot,
          .cm-wall, .cm-node, .cm-dead, .cm-label,
          .fo-q, .fo-frag, .fo-cites, .fo-caption,
          .sl-layer, .sl-caption {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
          .cm-route, .fo-fan, .fo-conv, .fo-box, .sl-axis {
            stroke-dashoffset: 0 !important;
            transition: none !important;
          }
          .vroom-scan { transform: scaleX(1) !important; transition: none !important; }
          .or-station-tick, .or-station-name { transition: none !important; }
        }

        /* ── Tablet / mobile ─────────────────────────── */
        @media (max-width: 1023px) {
          .or-rail { display: none; }
          .or-body { grid-template-columns: 1fr; }
        }
        @media (max-width: 820px) {
          .or-header { padding: 36px 24px 28px; }
          .or-chip--right { display: none; }
          .vroom-grid { grid-template-columns: 1fr; }
          .vroom-text,
          .vroom--flip .vroom-text {
            order: 1;
            padding: 44px 24px 8px;
          }
          .vroom-visual,
          .vroom--flip .vroom-visual {
            order: 2;
            border-left: none;
            border-right: none;
            padding: 24px 24px 52px;
          }
          .vroom-statement { margin-top: 28px; }
          .vroom-body { margin-bottom: 32px; }
          .vroom-deliv { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}
