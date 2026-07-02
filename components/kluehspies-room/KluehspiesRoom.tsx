"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRef, useState, useSyncExternalStore } from "react";
import PasswordGate from "./PasswordGate";
import HomepageMockup from "./HomepageMockup";
import {
  approvalItems,
  BRAND_MANUAL_URL,
  brandColors,
  brandValues,
  headingStructure,
  KLUE,
  overviewCards,
  recommendations,
  STORAGE_KEY,
  workLog,
  type ApprovalItem,
  type Recommendation,
  type RecStatus,
} from "./data";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

type ItemState = { status: RecStatus; note: string | null };

// ── Zugang: bewusst nur localStorage, kein echtes Auth-System. ──
// Als externer Store angebunden: Server rendert "checking" (leere Fläche),
// der Client löst nach der Hydration in "open"/"locked" auf.
type Access = "checking" | "locked" | "open";
const accessListeners = new Set<() => void>();
function subscribeAccess(cb: () => void) {
  accessListeners.add(cb);
  return () => {
    accessListeners.delete(cb);
  };
}
function readAccess(): Access {
  try {
    return localStorage.getItem(STORAGE_KEY) === "granted" ? "open" : "locked";
  } catch {
    return "locked";
  }
}
function readAccessOnServer(): Access {
  return "checking";
}
function writeAccess(granted: boolean) {
  try {
    if (granted) localStorage.setItem(STORAGE_KEY, "granted");
    else localStorage.removeItem(STORAGE_KEY);
  } catch {}
  accessListeners.forEach((cb) => cb());
}

interface KluehspiesRoomProps {
  expectedPassword: string;
}

export default function KluehspiesRoom({ expectedPassword }: KluehspiesRoomProps) {
  const reduced = useReducedMotion();
  const access = useSyncExternalStore(subscribeAccess, readAccess, readAccessOnServer);

  // ── Lab-Zustand: aktive Empfehlung + lokale Demo-Freigaben ──
  const [activeId, setActiveId] = useState<string | null>("rec-01");
  const [recState, setRecState] = useState<Record<string, ItemState>>({});
  const [appState, setAppState] = useState<Record<string, ItemState>>({});
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});

  function selectFromPin(id: string) {
    setActiveId(id);
    cardRefs.current[id]?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "nearest",
    });
  }

  function approveRec(id: string) {
    setRecState((prev) => ({
      ...prev,
      [id]: { status: "Freigegeben", note: "Demo: Freigabe wurde lokal markiert." },
    }));
  }
  function commentRec(id: string, current: RecStatus) {
    setRecState((prev) => ({
      ...prev,
      [id]: {
        status: prev[id]?.status ?? current,
        note: "Demo: Kommentare folgen im nächsten Ausbau. Feedback bitte direkt an SEESZN.",
      },
    }));
  }
  function approveItem(id: string) {
    setAppState((prev) => ({
      ...prev,
      [id]: { status: "Freigegeben", note: "Demo: Freigabe wurde lokal markiert." },
    }));
  }
  function discussItem(id: string) {
    setAppState((prev) => ({
      ...prev,
      [id]: { status: "Wird besprochen", note: "Demo: Für das nächste Gespräch vorgemerkt." },
    }));
  }

  function scrollToCi() {
    document.getElementById("kr-ci")?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
    });
  }

  if (access === "checking") {
    return <div style={{ minHeight: "100dvh", background: "var(--paper)" }} aria-hidden="true" />;
  }
  if (access === "locked") {
    return <PasswordGate expectedPassword={expectedPassword} onUnlock={() => writeAccess(true)} />;
  }

  return (
    <div className="kr">
      {/* ── 1 · Kopfleiste ─────────────────────────────────── */}
      <header className="kr-top">
        <div className="kr-top-l">
          <span className="kr-top-title">Klühspies Website Lab</span>
          <span className="kr-top-powered t-mono">powered by SEESZN</span>
        </div>
        <div className="kr-top-r">
          <span className="kr-live">
            <i className="olive-dot kr-live-dot" aria-hidden="true" />
            Live Client Room
          </span>
          <span className="kr-sprint t-mono">Q3 Website Sprint</span>
        </div>
      </header>

      <main className="kr-main">
        {/* ── 2 · Überblick ──────────────────────────────────── */}
        <Reveal as="section" className="kr-section kr-hero" reduced={reduced}>
          <SectionHead
            index="01"
            eyebrow="Überblick"
            roman="Ein privater Arbeitsraum für bessere"
            accent="Sichtbarkeit."
            lead="Hier sieht Klühspies live, welche Website-Strukturen, Inhalte und SEO/GEO-Maßnahmen SEESZN empfiehlt – inklusive Mockup, Priorisierung und Freigabe."
          />
          <div className="kr-overview">
            {overviewCards.map((card, i) => (
              <div key={card.label} className="kr-ov-card">
                <div className="kr-ov-head">
                  <span className="t-mono">{String(i + 1).padStart(2, "0")}</span>
                  <span className="t-mono">{card.label}</span>
                </div>
                <span className="kr-ov-value">{card.value}</span>
                <p className="kr-ov-detail">{card.detail}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* ── 3 · Website Lab ────────────────────────────────── */}
        <Reveal as="section" className="kr-section" reduced={reduced}>
          <SectionHead
            index="02"
            eyebrow="Website Lab"
            roman="Homepage"
            accent="Mockup."
            lead="Ein kontrollierter Website-Entwurf, auf dem Empfehlungen direkt sichtbar werden. Pins anklicken – die passende Empfehlung öffnet sich rechts."
          />
          <div className="kr-lab">
            <div className="kr-lab-mockup">
              <HomepageMockup activeId={activeId} onPinSelect={selectFromPin} />
              <p className="kr-lab-note t-mono">
                Strategisches Mockup · kein Nachbau der Live-Website
              </p>
            </div>

            {/* Empfehlungs-Sidebar */}
            <aside className="kr-side">
              <BrandReferenceCard onShowRules={scrollToCi} />
              {recommendations.map((rec) => {
                const st = recState[rec.id];
                return (
                  <RecommendationCard
                    key={rec.id}
                    rec={rec}
                    status={st?.status ?? rec.status}
                    note={st?.note ?? null}
                    active={activeId === rec.id}
                    onSelect={() => setActiveId(rec.id)}
                    onApprove={() => approveRec(rec.id)}
                    onComment={() => commentRec(rec.id, rec.status)}
                    refCallback={(el) => {
                      cardRefs.current[rec.id] = el;
                    }}
                  />
                );
              })}
              <p className="kr-side-foot t-mono">
                Demo-Modus: Freigaben werden in dieser Version lokal gespeichert.
              </p>
            </aside>
          </div>
        </Reveal>

        {/* ── 4 · CI-Regeln ──────────────────────────────────── */}
        <Reveal as="section" className="kr-section" reduced={reduced} id="kr-ci">
          <SectionHead
            index="03"
            eyebrow="Brand Reference"
            roman="Klühspies CI-Regeln"
            accent="für dieses Website Lab."
            lead="Grundlage ist das hinterlegte Brand Manual. Jede Empfehlung und jedes Mockup-Element bewegt sich innerhalb dieser Leitplanken."
          />
          <div className="kr-ci-grid">
            <div className="kr-ci-card">
              <div className="kr-ci-head">
                <span className="t-mono">01 · Markenwerte</span>
                <span className="kr-ci-mark" aria-hidden="true">
                  <i style={{ background: KLUE.blue }} />
                  <i style={{ background: KLUE.yellow }} />
                </span>
              </div>
              <span className="kr-ci-title">Jugendlichkeit · Einfachheit · Kompetenz</span>
              <p className="kr-ci-text">
                Das Mockup soll modern und digital wirken, aber weiterhin
                vertrauenswürdig, übersichtlich und schulnah bleiben.
              </p>
            </div>

            <div className="kr-ci-card">
              <div className="kr-ci-head">
                <span className="t-mono">02 · Farben</span>
              </div>
              <span className="kr-ci-title">Primärfarben</span>
              <div className="kr-swatches">
                {brandColors.map((c) => (
                  <div key={c.hex} className="kr-swatch">
                    <span
                      className="kr-swatch-color"
                      style={{
                        background: c.hex,
                        border: c.light ? "1px solid var(--line)" : "1px solid transparent",
                      }}
                      aria-hidden="true"
                    />
                    <span className="kr-swatch-name">{c.name}</span>
                    <span className="kr-swatch-hex t-mono">{c.hex}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="kr-ci-card">
              <div className="kr-ci-head">
                <span className="t-mono">03 · Typografie</span>
              </div>
              <span className="kr-ci-title">Source Sans Pro</span>
              <div className="kr-type-sample" aria-hidden="true">
                <span className="kr-type-aa">Aa</span>
                <span className="kr-type-line">Klassenfahrten einfach planen</span>
              </div>
              <p className="kr-ci-text">
                Das Klühspies-Mockup nutzt eine klare, serifenlose Schriftlogik.
                Headlines dürfen kräftig sein, Fließtext muss sehr gut lesbar bleiben.
              </p>
            </div>

            <div className="kr-ci-card">
              <div className="kr-ci-head">
                <span className="t-mono">04 · Gestaltung</span>
              </div>
              <span className="kr-ci-title">Klar, modular, nicht überladen</span>
              <p className="kr-ci-text">
                Empfehlungen, Infoboxen, FAQ-Bereiche und Kategorie-Karten sollen
                modular, leicht verständlich und ohne unnötige Effekte gestaltet
                werden.
              </p>
            </div>
          </div>
        </Reveal>

        {/* ── 5 · H-Struktur ─────────────────────────────────── */}
        <Reveal as="section" className="kr-section" reduced={reduced}>
          <SectionHead
            index="04"
            eyebrow="Struktur"
            roman="Empfohlene"
            accent="H-Struktur."
            lead="Von der generischen Startseite zur klaren semantischen Hierarchie: so lesen Google, AI-Systeme und Lehrkräfte dieselbe Geschichte."
          />
          <div className="kr-hs">
            <div className="kr-hs-panel">
              <div className="kr-hs-panel-head">
                <span className="kr-hs-chip kr-hs-chip--problem">Aktuell · Problemlage</span>
              </div>
              <ul className="kr-hs-problems">
                {headingStructure.current.map((p) => (
                  <li key={p}>
                    <i aria-hidden="true">✕</i>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="kr-hs-panel kr-hs-panel--target">
              <div className="kr-hs-panel-head">
                <span className="kr-hs-chip kr-hs-chip--target">Empfohlen · Zielbild</span>
              </div>
              <div className="kr-hs-tree">
                {headingStructure.recommended.map((row, i) => (
                  <div key={`${row.level}-${i}`} className="kr-hs-row" data-level={row.level}>
                    <span className="kr-hs-level t-mono">{row.level}</span>
                    <span className="kr-hs-text">{row.text}</span>
                  </div>
                ))}
                <div className="kr-hs-row kr-hs-row--note">
                  <span className="kr-hs-level t-mono">H4</span>
                  <span className="kr-hs-text kr-hs-text--muted">{headingStructure.h4Note}</span>
                </div>
              </div>
            </div>
          </div>
          <p className="kr-goal">{headingStructure.goal}</p>
        </Reveal>

        {/* ── 6 · Offene Freigaben ───────────────────────────── */}
        <Reveal as="section" className="kr-section" reduced={reduced}>
          <SectionHead
            index="05"
            eyebrow="Abstimmung"
            roman="Offene"
            accent="Freigaben."
            lead="Drei Entscheidungen, die die Umsetzung starten. Freigeben oder für das nächste Gespräch vormerken – direkt hier im Raum."
          />
          <div className="kr-approvals">
            {approvalItems.map((item) => {
              const st = appState[item.id];
              return (
                <ApprovalCard
                  key={item.id}
                  item={item}
                  status={st?.status ?? item.status}
                  note={st?.note ?? null}
                  onApprove={() => approveItem(item.id)}
                  onDiscuss={() => discussItem(item.id)}
                />
              );
            })}
          </div>
        </Reveal>

        {/* ── 7 · Arbeitsprotokoll ───────────────────────────── */}
        <Reveal as="section" className="kr-section kr-section--last" reduced={reduced}>
          <SectionHead
            index="06"
            eyebrow="Arbeitsprotokoll"
            roman="Was SEESZN zuletzt"
            accent="vorbereitet hat."
            lead="Der Arbeitsstand hinter den Empfehlungen – transparent und in Reihenfolge."
          />
          <div className="kr-log">
            {workLog.map((entry) => (
              <div key={entry.title} className="kr-log-row">
                <span className="kr-log-date t-mono">{entry.date}</span>
                <span className="kr-log-rail" aria-hidden="true">
                  <i className="olive-dot" />
                </span>
                <div className="kr-log-body">
                  <span className="kr-log-title">{entry.title}</span>
                  <p className="kr-log-detail">{entry.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </main>

      {/* ── Fußzeile ───────────────────────────────────────── */}
      <footer className="kr-foot">
        <span className="t-mono">SEESZN · Klühspies Website Lab</span>
        <span className="kr-foot-conf">
          Vertraulich. Nur für die Abstimmung zwischen Klühspies Reisen und SEESZN.
        </span>
        <span className="kr-foot-links">
          <a href={BRAND_MANUAL_URL} target="_blank" rel="noopener noreferrer" className="kr-foot-link">
            Brand Manual ↗
          </a>
          <button type="button" onClick={() => writeAccess(false)} className="kr-foot-link kr-foot-logout">
            Abmelden
          </button>
        </span>
      </footer>

      {/* Schwebender CI-Manual-Zugriff */}
      <a
        href={BRAND_MANUAL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="kr-ci-fab"
        aria-label="Klühspies Brand Manual als PDF öffnen"
      >
        CI Manual ↗
      </a>

      <style>{`
        .kr { background: var(--paper); min-height: 100dvh; color: var(--text-body); }

        /* ── Kopfleiste ─────────────────────────────────────── */
        .kr-top {
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 6px 20px;
          padding: 14px var(--gutter);
          background: color-mix(in srgb, var(--paper) 88%, transparent);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border-nav);
        }
        .kr-top-l { display: flex; align-items: baseline; gap: 12px; min-width: 0; }
        .kr-top-title {
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: 17px;
          letter-spacing: 0.01em;
          text-transform: uppercase;
          color: var(--ink-strong);
          white-space: nowrap;
        }
        .kr-top-powered { font-size: 9.5px; white-space: nowrap; }
        .kr-top-r { display: flex; align-items: center; gap: 18px; }
        .kr-live {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 1px solid var(--border-btn);
          padding: 6px 12px;
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: var(--ink-strong);
          white-space: nowrap;
        }
        .kr-live-dot {
          width: 7px; height: 7px;
          background: var(--signal);
          animation: kr-pulse 2.4s ease-in-out infinite;
        }
        @keyframes kr-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        .kr-sprint { font-size: 10px; }

        /* ── Layoutrhythmus ─────────────────────────────────── */
        .kr-main { padding: 0 var(--gutter); max-width: 1440px; margin: 0 auto; }
        .kr-section { padding: clamp(64px, 8vw, 110px) 0 0; }
        .kr-section--last { padding-bottom: clamp(72px, 9vw, 120px); }
        #kr-ci { scroll-margin-top: 84px; }

        /* ── Sektionsköpfe ──────────────────────────────────── */
        .kr-head { max-width: 780px; margin-bottom: clamp(34px, 4vw, 52px); }
        .kr-head-row { display: flex; gap: 16px; margin-bottom: 18px; }
        .kr-headline { color: var(--ink-strong); margin: 0; }
        .kr-headline-roman {
          display: block;
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: clamp(32px, 4.6vw, 54px);
          line-height: 0.98;
          letter-spacing: -0.015em;
          text-transform: uppercase;
        }
        .kr-headline-accent {
          display: block;
          font-family: var(--font-editorial), Georgia, serif;
          font-weight: 400;
          font-size: clamp(28px, 4vw, 46px);
          line-height: 1.12;
          letter-spacing: -0.015em;
        }
        .kr-lead { margin: 18px 0 0; max-width: 640px; font-size: 15.5px; }

        /* ── Überblickskarten ───────────────────────────────── */
        .kr-hero { padding-top: clamp(52px, 6vw, 84px); }
        .kr-overview {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }
        .kr-ov-card {
          border: 1px solid var(--line);
          background: var(--surface-raised);
          padding: 22px 22px 24px;
          display: flex;
          flex-direction: column;
          transition: border-color 0.25s;
        }
        .kr-ov-card:hover { border-color: var(--line-strong); }
        .kr-ov-head {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 30px;
        }
        .kr-ov-value {
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: 20px;
          line-height: 1.12;
          letter-spacing: 0;
          text-transform: uppercase;
          color: var(--ink-strong);
        }
        .kr-ov-detail { margin: 10px 0 0; font-size: 12.5px; color: var(--text-muted); }

        /* ── Website Lab ────────────────────────────────────── */
        .kr-lab {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 392px;
          gap: clamp(22px, 2.6vw, 36px);
          align-items: start;
        }
        .kr-lab-note { margin: 12px 0 0; font-size: 9.5px; }
        .kr-side {
          position: sticky;
          top: 84px;
          align-self: start;
          max-height: calc(100dvh - 108px);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-right: 4px;
          scrollbar-width: thin;
          scrollbar-color: var(--line-strong) transparent;
        }
        .kr-side-foot { font-size: 9.5px; padding: 4px 2px 10px; }

        /* Brand-Reference-Karte */
        .kr-brand {
          border: 1px solid var(--line-strong);
          background: var(--surface-raised);
          padding: 20px 20px 22px;
        }
        .kr-brand-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .kr-brand-mark, .kr-ci-mark { display: inline-flex; gap: 4px; }
        .kr-brand-mark i, .kr-ci-mark i { width: 9px; height: 9px; display: block; }
        .kr-brand-title {
          display: block;
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: 19px;
          text-transform: uppercase;
          color: var(--ink-strong);
          line-height: 1.1;
        }
        .kr-brand-text { margin: 8px 0 14px; font-size: 12.5px; color: var(--text-secondary); }
        .kr-pills { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
        .kr-pill {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border: 1px solid var(--border-btn);
          color: var(--ink-strong);
          padding: 4px 9px;
        }
        .kr-brand-actions { display: flex; flex-wrap: wrap; gap: 8px; }

        /* Empfehlungs-Karten */
        .kr-rc {
          border: 1px solid var(--line);
          background: var(--surface-raised);
          padding: 18px 18px 20px;
          scroll-margin: 96px;
          transition: border-color 0.25s, box-shadow 0.25s;
          position: relative;
        }
        .kr-rc[data-active="true"] {
          border-color: var(--warm-black);
          box-shadow: inset 2px 0 0 var(--signal);
        }
        .kr-rc-select {
          display: flex;
          align-items: baseline;
          gap: 10px;
          width: 100%;
          background: none;
          border: none;
          padding: 0;
          text-align: left;
          color: inherit;
        }
        .kr-rc-select:focus-visible { outline: 1px solid var(--warm-black); outline-offset: 4px; }
        .kr-rc-num {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          color: var(--text-muted);
          flex: none;
        }
        .kr-rc[data-active="true"] .kr-rc-num { color: var(--ink-strong); }
        .kr-rc-title {
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: 18px;
          line-height: 1.08;
          text-transform: uppercase;
          color: var(--ink-strong);
        }
        .kr-rc-target { margin: 8px 0 0; font-size: 9px; }
        .kr-rc-blocks { display: flex; flex-direction: column; gap: 10px; margin: 14px 0 0; }
        .kr-rc-block-label {
          display: block;
          font-family: var(--font-mono), monospace;
          font-size: 8.5px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 3px;
        }
        .kr-rc-block-text { margin: 0; font-size: 12.5px; line-height: 1.55; color: var(--text-body); }
        .kr-badges { display: flex; flex-wrap: wrap; gap: 6px; margin: 14px 0 0; }
        .kr-badge {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          border: 1px solid var(--line);
          color: var(--text-secondary);
          padding: 4px 8px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .kr-badge i { width: 6px; height: 6px; background: var(--signal); flex: none; }
        .kr-badge[data-tone="strong"] {
          background: var(--warm-black);
          border-color: var(--warm-black);
          color: var(--paper);
        }
        .kr-badge[data-tone="signal"] {
          background: var(--signal);
          border-color: var(--signal);
          color: #1f1e1a;
        }
        .kr-badge[data-tone="open"] { border-color: var(--border-btn); color: var(--ink-strong); }
        .kr-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
        .kr-btn {
          font-family: var(--font-body), sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border: 1px solid var(--warm-black);
          background: var(--warm-black);
          color: var(--paper);
          padding: 9px 14px;
          min-height: 36px;
          transition: background 0.22s, color 0.22s, border-color 0.22s, opacity 0.22s;
        }
        .kr-btn:hover:not(:disabled) { background: transparent; color: var(--ink-strong); }
        .kr-btn:disabled { opacity: 0.5; cursor: default; }
        .kr-btn:focus-visible { outline: 1px solid var(--warm-black); outline-offset: 3px; }
        .kr-btn--ghost { background: transparent; color: var(--ink-strong); border-color: var(--border-btn); }
        .kr-btn--ghost:hover:not(:disabled) { background: var(--button-hover-bg); border-color: var(--warm-black); }
        .kr-note {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin: 12px 0 0;
          font-family: var(--font-mono), monospace;
          font-size: 9.5px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--text-secondary);
        }
        .kr-note::before { content: ""; width: 7px; height: 7px; background: var(--signal); flex: none; transform: translateY(1px); }

        /* ── CI-Regeln ──────────────────────────────────────── */
        .kr-ci-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
        .kr-ci-card {
          border: 1px solid var(--line);
          background: var(--surface-raised);
          padding: 26px 26px 28px;
          transition: border-color 0.25s;
        }
        .kr-ci-card:hover { border-color: var(--line-strong); }
        .kr-ci-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 22px;
        }
        .kr-ci-title {
          display: block;
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: 22px;
          line-height: 1.1;
          text-transform: uppercase;
          color: var(--ink-strong);
          margin-bottom: 10px;
        }
        .kr-ci-text { margin: 0; font-size: 13.5px; color: var(--text-body); max-width: 460px; }
        .kr-swatches { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 6px; }
        .kr-swatch { display: flex; flex-direction: column; gap: 6px; }
        .kr-swatch-color { display: block; height: 52px; }
        .kr-swatch-name { font-size: 11.5px; color: var(--ink-strong); line-height: 1.3; }
        .kr-swatch-hex { font-size: 9px; text-transform: none; }
        .kr-type-sample {
          display: flex;
          align-items: baseline;
          gap: 16px;
          border: 1px solid var(--line-soft);
          padding: 14px 16px;
          margin-bottom: 12px;
          font-family: var(--font-kluehspies), "Source Sans Pro", sans-serif;
          color: var(--ink-strong);
        }
        .kr-type-aa { font-size: 40px; font-weight: 900; line-height: 1; }
        .kr-type-line { font-size: 15px; font-weight: 600; }

        /* ── H-Struktur ─────────────────────────────────────── */
        .kr-hs { display: grid; grid-template-columns: 1fr 1.25fr; gap: 14px; align-items: start; }
        .kr-hs-panel { border: 1px solid var(--line); background: var(--surface-raised); padding: 24px; }
        .kr-hs-panel--target { border-color: var(--line-strong); }
        .kr-hs-panel-head { margin-bottom: 18px; }
        .kr-hs-chip {
          font-family: var(--font-mono), monospace;
          font-size: 9.5px;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          padding: 5px 10px;
          border: 1px solid var(--line);
          color: var(--text-secondary);
        }
        .kr-hs-chip--target { background: var(--warm-black); border-color: var(--warm-black); color: var(--paper); }
        .kr-hs-problems { list-style: none; display: flex; flex-direction: column; gap: 13px; margin: 0; padding: 0; }
        .kr-hs-problems li {
          display: flex;
          gap: 12px;
          font-size: 13.5px;
          line-height: 1.55;
          color: var(--text-body);
        }
        .kr-hs-problems i {
          font-style: normal;
          color: var(--clay);
          font-size: 11px;
          flex: none;
          transform: translateY(2px);
        }
        .kr-hs-tree { display: flex; flex-direction: column; gap: 9px; }
        .kr-hs-row { display: flex; align-items: baseline; gap: 12px; }
        .kr-hs-row[data-level="H2"] { padding-left: 18px; }
        .kr-hs-row[data-level="H3"] { padding-left: 36px; }
        .kr-hs-row--note { padding-left: 18px; margin-top: 8px; }
        .kr-hs-level {
          flex: none;
          font-size: 8.5px;
          border: 1px solid var(--line);
          padding: 2px 6px;
          color: var(--text-muted);
        }
        .kr-hs-row[data-level="H1"] .kr-hs-level {
          background: var(--warm-black);
          border-color: var(--warm-black);
          color: var(--paper);
        }
        .kr-hs-text { font-size: 13.5px; color: var(--ink-strong); line-height: 1.45; }
        .kr-hs-row[data-level="H1"] .kr-hs-text {
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: 17px;
          text-transform: uppercase;
        }
        .kr-hs-row[data-level="H3"] .kr-hs-text { color: var(--text-body); font-size: 13px; }
        .kr-hs-text--muted { color: var(--text-muted); font-size: 12px; }
        .kr-goal {
          margin: 22px 0 0;
          padding: 14px 18px;
          border-left: 2px solid var(--signal);
          background: var(--surface-raised);
          font-size: 13.5px;
          color: var(--text-primary);
          max-width: 720px;
        }

        /* ── Freigaben ──────────────────────────────────────── */
        .kr-approvals { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; align-items: start; }
        .kr-ap-card {
          border: 1px solid var(--line);
          background: var(--surface-raised);
          padding: 24px 24px 26px;
          transition: border-color 0.25s, box-shadow 0.25s;
        }
        .kr-ap-card[data-approved="true"] {
          border-color: var(--warm-black);
          box-shadow: inset 0 2px 0 var(--signal);
        }
        .kr-ap-title {
          display: block;
          font-family: var(--font-display), sans-serif;
          font-weight: 700;
          font-size: 20px;
          line-height: 1.1;
          text-transform: uppercase;
          color: var(--ink-strong);
        }
        .kr-ap-text { margin: 10px 0 0; font-size: 13px; color: var(--text-body); }

        /* ── Arbeitsprotokoll ───────────────────────────────── */
        .kr-log { max-width: 760px; display: flex; flex-direction: column; }
        .kr-log-row { display: grid; grid-template-columns: 118px 26px 1fr; gap: 0 14px; }
        .kr-log-date { padding-top: 4px; font-size: 9.5px; white-space: nowrap; }
        .kr-log-rail { position: relative; }
        .kr-log-rail::before {
          content: "";
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 1px;
          background: var(--line);
          transform: translateX(-50%);
        }
        .kr-log-row:first-child .kr-log-rail::before { top: 9px; }
        .kr-log-row:last-child .kr-log-rail::before { bottom: calc(100% - 9px); }
        .kr-log-rail i {
          position: absolute;
          top: 5px;
          left: 50%;
          transform: translateX(-50%);
          width: 9px;
          height: 9px;
          background: var(--signal);
          border: 1px solid color-mix(in srgb, var(--warm-black) 35%, transparent);
        }
        .kr-log-body { padding-bottom: 30px; }
        .kr-log-row:last-child .kr-log-body { padding-bottom: 6px; }
        .kr-log-title {
          display: block;
          font-family: var(--font-body), sans-serif;
          font-size: 14.5px;
          font-weight: 600;
          color: var(--ink-strong);
        }
        .kr-log-detail { margin: 4px 0 0; font-size: 13px; color: var(--text-secondary); max-width: 520px; }

        /* ── Fußzeile + FAB ─────────────────────────────────── */
        .kr-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          flex-wrap: wrap;
          border-top: 1px solid var(--border-nav);
          padding: 20px var(--gutter) 24px;
        }
        .kr-foot-conf { font-size: 12px; color: var(--text-muted); }
        .kr-foot-links { display: inline-flex; align-items: center; gap: 16px; }
        .kr-foot-link {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--ink-strong);
          background: none;
          border: none;
          padding: 0;
          border-bottom: 1px solid var(--border-btn);
          padding-bottom: 2px;
          transition: border-color 0.2s;
        }
        .kr-foot-link:hover { border-color: var(--warm-black); }
        .kr-ci-fab {
          position: fixed;
          right: 20px;
          bottom: 20px;
          z-index: 60;
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: var(--ink-strong);
          background: var(--surface-raised);
          border: 1px solid var(--warm-black);
          padding: 10px 14px;
          box-shadow: 0 4px 18px rgba(17, 17, 15, 0.12);
          transition: background 0.22s, color 0.22s;
        }
        .kr-ci-fab:hover { background: var(--warm-black); color: var(--paper); }

        @media (prefers-reduced-motion: reduce) {
          .kr-live-dot { animation: none; }
        }

        /* ── Responsiv ──────────────────────────────────────── */
        @media (max-width: 1100px) {
          .kr-lab { grid-template-columns: 1fr; }
          .kr-side { position: static; max-height: none; overflow: visible; padding-right: 0; }
          .kr-overview { grid-template-columns: repeat(2, 1fr); }
          .kr-approvals { grid-template-columns: 1fr; }
          .kr-hs { grid-template-columns: 1fr; }
        }
        @media (max-width: 720px) {
          .kr-top-l { flex-direction: column; align-items: flex-start; gap: 3px; }
          .kr-top-title { white-space: normal; font-size: 15px; line-height: 1.15; }
          .kr-overview { grid-template-columns: 1fr; }
          .kr-ci-grid { grid-template-columns: 1fr; }
          .kr-swatches { grid-template-columns: repeat(2, 1fr); }
          .kr-sprint { display: none; }
          .kr-log-row { grid-template-columns: 1fr; gap: 2px; }
          .kr-log-rail { display: none; }
          .kr-log-body { padding-bottom: 24px; border-bottom: 1px solid var(--line-soft); margin-bottom: 20px; }
          .kr-log-row:last-child .kr-log-body { border-bottom: none; margin-bottom: 0; }
          .kr-foot { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}

/* ── Bausteine ─────────────────────────────────────────────── */

function Reveal({
  as: Tag = "section",
  className,
  id,
  reduced,
  children,
}: {
  as?: "section" | "div";
  className?: string;
  id?: string;
  reduced: boolean | null;
  children: React.ReactNode;
}) {
  const MotionTag = Tag === "div" ? motion.div : motion.section;
  return (
    <MotionTag
      id={id}
      className={className}
      initial={reduced ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.65, ease: EASE }}
    >
      {children}
    </MotionTag>
  );
}

function SectionHead({
  index,
  eyebrow,
  roman,
  accent,
  lead,
}: {
  index: string;
  eyebrow: string;
  roman: string;
  accent: string;
  lead: string;
}) {
  return (
    <div className="kr-head">
      <div className="kr-head-row">
        <span className="t-mono">{index}</span>
        <span className="t-eyebrow">{eyebrow}</span>
      </div>
      <h2 className="kr-headline">
        <span className="kr-headline-roman">{roman}</span>
        <span className="kr-headline-accent">{accent}</span>
      </h2>
      <p className="kr-lead t-body">{lead}</p>
    </div>
  );
}

function statusTone(status: RecStatus): "open" | "signal" | undefined {
  if (status === "Freigegeben") return "signal";
  if (status === "Freigabe offen") return "open";
  return undefined;
}

function BadgeRow({
  impact,
  effort,
  status,
}: {
  impact: string;
  effort: string;
  status: RecStatus;
}) {
  return (
    <div className="kr-badges">
      <span className="kr-badge" data-tone={impact === "Hoch" ? "strong" : undefined}>
        Impact · {impact}
      </span>
      <span className="kr-badge">Aufwand · {effort}</span>
      <span className="kr-badge" data-tone={statusTone(status)}>
        {status === "Freigabe offen" && <i aria-hidden="true" />}
        {status}
      </span>
    </div>
  );
}

function RecommendationCard({
  rec,
  status,
  note,
  active,
  onSelect,
  onApprove,
  onComment,
  refCallback,
}: {
  rec: Recommendation;
  status: RecStatus;
  note: string | null;
  active: boolean;
  onSelect: () => void;
  onApprove: () => void;
  onComment: () => void;
  refCallback: (el: HTMLElement | null) => void;
}) {
  const approved = status === "Freigegeben";
  return (
    <article className="kr-rc" data-active={active || undefined} ref={refCallback}>
      <button type="button" className="kr-rc-select" onClick={onSelect} aria-pressed={active}>
        <span className="kr-rc-num">Pin {rec.num}</span>
        <span className="kr-rc-title">{rec.title}</span>
      </button>
      <p className="kr-rc-target t-mono">Im Mockup: {rec.pinTarget}</p>
      <div className="kr-rc-blocks">
        <div>
          <span className="kr-rc-block-label">Problem</span>
          <p className="kr-rc-block-text">{rec.problem}</p>
        </div>
        <div>
          <span className="kr-rc-block-label">Empfehlung</span>
          <p className="kr-rc-block-text">{rec.recommendation}</p>
        </div>
        <div>
          <span className="kr-rc-block-label">Warum das zählt</span>
          <p className="kr-rc-block-text">{rec.why}</p>
        </div>
      </div>
      <BadgeRow impact={rec.impact} effort={rec.effort} status={status} />
      <div className="kr-actions">
        <button type="button" className="kr-btn" onClick={onApprove} disabled={approved}>
          {approved ? "Freigegeben ✓" : "Freigeben"}
        </button>
        <button type="button" className="kr-btn kr-btn--ghost" onClick={onComment}>
          Kommentar
        </button>
      </div>
      {note && <p className="kr-note">{note}</p>}
    </article>
  );
}

function BrandReferenceCard({ onShowRules }: { onShowRules: () => void }) {
  return (
    <div className="kr-brand">
      <div className="kr-brand-head">
        <span className="t-mono">Brand Reference</span>
        <span className="kr-brand-mark" aria-hidden="true">
          <i style={{ background: KLUE.blue }} />
          <i style={{ background: KLUE.yellow }} />
        </span>
      </div>
      <span className="kr-brand-title">Klühspies CI hinterlegt</span>
      <p className="kr-brand-text">
        Das Website Lab orientiert sich an den definierten
        Klühspies-Markenwerten, Farben, Typografie und Gestaltungsprinzipien.
      </p>
      <div className="kr-pills">
        {brandValues.map((v) => (
          <span key={v} className="kr-pill">
            {v}
          </span>
        ))}
      </div>
      <div className="kr-brand-actions">
        <a
          href={BRAND_MANUAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="kr-btn"
          style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}
        >
          Brand Manual öffnen ↗
        </a>
        <button type="button" className="kr-btn kr-btn--ghost" onClick={onShowRules}>
          CI-Regeln anzeigen ↓
        </button>
      </div>
    </div>
  );
}

function ApprovalCard({
  item,
  status,
  note,
  onApprove,
  onDiscuss,
}: {
  item: ApprovalItem;
  status: RecStatus;
  note: string | null;
  onApprove: () => void;
  onDiscuss: () => void;
}) {
  const approved = status === "Freigegeben";
  return (
    <article className="kr-ap-card" data-approved={approved || undefined}>
      <span className="kr-ap-title">{item.title}</span>
      <p className="kr-ap-text">{item.description}</p>
      <BadgeRow impact={item.impact} effort={item.effort} status={status} />
      <div className="kr-actions">
        <button type="button" className="kr-btn" onClick={onApprove} disabled={approved}>
          {approved ? "Freigegeben ✓" : "Freigeben"}
        </button>
        <button type="button" className="kr-btn kr-btn--ghost" onClick={onDiscuss} disabled={approved}>
          Noch besprechen
        </button>
      </div>
      {note && <p className="kr-note">{note}</p>}
    </article>
  );
}
