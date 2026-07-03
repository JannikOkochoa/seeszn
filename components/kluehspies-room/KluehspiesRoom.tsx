"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useRef, useState, useSyncExternalStore } from "react";
import PasswordGate from "./PasswordGate";
import HomepageMockup from "./HomepageMockup";
import SignalAperture from "@/components/SignalAperture";
import {
  approvalItems,
  BRAND_MANUAL_URL,
  brandColors,
  brandValues,
  headingStructure,
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

/**
 * Klühspies Website Lab — ruhiger Client Room im SEESZN-System.
 * Ein Serif für Überschriften, ein Sans für alles andere, Hairlines
 * statt Kästen. Tag/Nacht läuft über die globalen Tokens; der Toggle
 * sitzt in der Kopfleiste. Die Klühspies-CI lebt ausschließlich im
 * Mockup und im Markenrahmen, nicht im Raum-Chrome.
 */
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

  if (access === "checking") {
    return <div style={{ minHeight: "100dvh", background: "var(--paper)" }} aria-hidden="true" />;
  }
  if (access === "locked") {
    return <PasswordGate expectedPassword={expectedPassword} onUnlock={() => writeAccess(true)} />;
  }

  return (
    <div className="kr">
      {/* ── Kopfleiste ─────────────────────────────────────── */}
      <header className="kr-top">
        <span className="kr-wordmark">Klühspies Website Lab</span>
        <div className="kr-top-r">
          <span className="kr-eyebrow kr-top-meta">SEESZN · Q3 Website Sprint</span>
          <SignalAperture />
        </div>
      </header>

      <main className="kr-main">
        {/* ── 01 · Überblick ─────────────────────────────────── */}
        <Reveal className="kr-section kr-intro" reduced={reduced}>
          <header className="kr-head">
            <p className="kr-eyebrow">01 · Überblick</p>
            <h1 className="kr-display">
              Ein privater Arbeitsraum für bessere{" "}
              <span className="kr-resolve">Sichtbarkeit.</span>
            </h1>
            <p className="kr-lead">
              Hier sieht Klühspies live, welche Website-Strukturen, Inhalte und
              SEO/GEO-Maßnahmen SEESZN empfiehlt, inklusive Mockup, Priorisierung
              und Freigabe.
            </p>
          </header>
          <div className="kr-stats">
            {overviewCards.map((card, i) => (
              <motion.div
                key={card.label}
                className="kr-stat"
                initial={reduced ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}
              >
                <span className="kr-eyebrow">{card.label}</span>
                <span className="kr-stat-value">{card.value}</span>
                <p className="kr-stat-detail">{card.detail}</p>
              </motion.div>
            ))}
          </div>
        </Reveal>

        {/* ── 02 · Website Lab ───────────────────────────────── */}
        <Reveal className="kr-section" reduced={reduced}>
          <SectionHead
            reduced={reduced}
            index="02"
            eyebrow="Website Lab"
            title="Das Homepage-Mockup."
            lead="Ein kontrollierter Website-Entwurf, auf dem Empfehlungen direkt sichtbar werden. Pins anklicken, die passende Empfehlung öffnet sich rechts."
          />
          <div className="kr-lab">
            <div className="kr-lab-mockup">
              <HomepageMockup activeId={activeId} onPinSelect={selectFromPin} />
              <p className="kr-meta kr-lab-note">
                Strategisches Mockup · kein Nachbau der Live-Website
              </p>
            </div>

            {/* Empfehlungen */}
            <aside className="kr-side">
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
              <p className="kr-meta kr-side-foot">
                Demo-Modus: Freigaben werden in dieser Version lokal gespeichert.
              </p>
            </aside>
          </div>
        </Reveal>

        {/* ── 03 · H-Struktur ────────────────────────────────── */}
        <Reveal className="kr-section" reduced={reduced}>
          <SectionHead
            reduced={reduced}
            index="03"
            eyebrow="Struktur"
            title="Empfohlene H-Struktur."
            lead="Von der generischen Startseite zur klaren semantischen Hierarchie: so lesen Google, AI-Systeme und Lehrkräfte dieselbe Geschichte."
          />
          <div className="kr-hs">
            <div className="kr-hs-col">
              <p className="kr-eyebrow kr-hs-label">Aktuell · Problemlage</p>
              <ul className="kr-hs-problems">
                {headingStructure.current.map((p) => (
                  <li key={p}>
                    <i aria-hidden="true">✕</i>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="kr-hs-col">
              <p className="kr-eyebrow kr-hs-label">Empfohlen · Zielbild</p>
              <div className="kr-hs-tree">
                {headingStructure.recommended.map((row, i) => (
                  <div key={`${row.level}-${i}`} className="kr-hs-row" data-level={row.level}>
                    <span className="kr-hs-level">{row.level}</span>
                    <span className="kr-hs-text">{row.text}</span>
                  </div>
                ))}
                <div className="kr-hs-row kr-hs-row--note">
                  <span className="kr-hs-level">H4</span>
                  <span className="kr-hs-text kr-hs-text--muted">{headingStructure.h4Note}</span>
                </div>
              </div>
            </div>
          </div>
          <p className="kr-goal">{headingStructure.goal}</p>
        </Reveal>

        {/* ── 04 · Freigaben ─────────────────────────────────── */}
        <Reveal className="kr-section" reduced={reduced}>
          <SectionHead
            reduced={reduced}
            index="04"
            eyebrow="Abstimmung"
            title="Offene Freigaben."
            lead="Drei Entscheidungen, die die Umsetzung starten. Freigeben oder für das nächste Gespräch vormerken, direkt hier im Raum."
          />
          <div className="kr-approvals">
            {approvalItems.map((item) => {
              const st = appState[item.id];
              return (
                <ApprovalRow
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

        {/* ── 05 · Markenrahmen ──────────────────────────────── */}
        <Reveal className="kr-section" reduced={reduced}>
          <SectionHead
            reduced={reduced}
            index="05"
            eyebrow="Markenrahmen"
            title="Die Klühspies-CI als Leitplanke."
            lead="Grundlage ist das hinterlegte Brand Manual. Jede Empfehlung und jedes Mockup-Element bewegt sich innerhalb dieser Leitplanken."
          />
          <div className="kr-ci">
            <div className="kr-ci-copy">
              <p className="kr-ci-values">{brandValues.join(" · ")}</p>
              <p className="kr-body">
                Das Website Lab arbeitet innerhalb der Klühspies-CI: modern und
                digital, aber weiterhin vertrauenswürdig, übersichtlich und
                schulnah. Empfehlungen, FAQ-Bereiche und Kategorie-Karten bleiben
                modular und ohne unnötige Effekte.
              </p>
              <a
                href={BRAND_MANUAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="kr-link"
              >
                Brand Manual als PDF öffnen ↗
              </a>
            </div>
            <div className="kr-ci-spec">
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
                    <span className="kr-swatch-hex">{c.hex}</span>
                  </div>
                ))}
              </div>
              <div className="kr-type-sample" aria-hidden="true">
                <span className="kr-type-aa">Aa</span>
                <span className="kr-type-line">Klassenfahrten einfach planen</span>
              </div>
              <p className="kr-meta">Source Sans Pro · Hausschrift laut Brand Manual</p>
            </div>
          </div>
        </Reveal>

        {/* ── 06 · Arbeitsprotokoll ──────────────────────────── */}
        <Reveal className="kr-section kr-section--last" reduced={reduced}>
          <SectionHead
            reduced={reduced}
            index="06"
            eyebrow="Arbeitsprotokoll"
            title="Was SEESZN zuletzt vorbereitet hat."
            lead="Der Arbeitsstand hinter den Empfehlungen, transparent und in Reihenfolge."
          />
          <div className="kr-log">
            {workLog.map((entry) => (
              <div key={entry.title} className="kr-log-row">
                <span className="kr-meta kr-log-date">{entry.date}</span>
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
        <span className="kr-meta">SEESZN · Klühspies Website Lab</span>
        <span className="kr-meta kr-foot-conf">
          Vertraulich · nur für die Abstimmung zwischen Klühspies Reisen und SEESZN
        </span>
        <button type="button" onClick={() => writeAccess(false)} className="kr-link">
          Abmelden
        </button>
      </footer>

      <style>{`
        /* ── System: ein Serif, ein Sans, fünf Größen ───────
           11px  Eyebrow / Label      (Sans, Versalien, gesperrt)
           13px  Meta / Buttons       (Sans)
           15px  Fließtext / Lead     (Sans)
           19px  Titel / Werte        (Serif)
           Display clamp(30–44px)     (Serif)
           Struktur über Hairlines und Weißraum, nicht über Kästen. */
        .kr {
          --serif: var(--font-editorial), Georgia, serif;
          --sans: var(--font-body), "Helvetica Neue", sans-serif;
          background: var(--paper);
          min-height: 100dvh;
          color: var(--text-body);
          font-family: var(--sans);
        }

        .kr-eyebrow {
          font-family: var(--sans);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin: 0;
        }
        .kr-meta {
          font-family: var(--sans);
          font-size: 13px;
          line-height: 1.5;
          color: var(--text-muted);
          margin: 0;
        }
        .kr-body {
          font-family: var(--sans);
          font-size: 15px;
          line-height: 1.65;
          color: var(--text-body);
          margin: 0;
        }
        .kr-display {
          font-family: var(--serif);
          font-weight: 400;
          font-size: clamp(30px, 3.8vw, 44px);
          line-height: 1.12;
          letter-spacing: -0.01em;
          color: var(--ink-strong);
          margin: 0;
        }
        .kr-title {
          font-family: var(--serif);
          font-weight: 400;
          font-size: 19px;
          line-height: 1.3;
          color: var(--ink-strong);
          margin: 0;
        }

        /* Das eine Wort, das scharf stellt — aus dem Hero der Hauptseite */
        .kr-resolve {
          display: inline-block;
          animation: kr-resolve 1.28s cubic-bezier(0.16, 1, 0.3, 1) 0.45s both;
        }
        @keyframes kr-resolve {
          0%   { filter: blur(6px);   opacity: 0.16; }
          42%  { filter: blur(2.5px); opacity: 0.55; }
          74%  { filter: blur(0.4px); opacity: 0.96; }
          100% { filter: blur(0);     opacity: 1; }
        }

        /* ── Kopfleiste ─────────────────────────────────────── */
        .kr-top {
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 16px var(--gutter);
          background: color-mix(in srgb, var(--paper) 90%, transparent);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--line);
        }
        .kr-wordmark {
          font-family: var(--serif);
          font-size: 17px;
          line-height: 1.2;
          color: var(--ink-strong);
          white-space: nowrap;
        }
        .kr-top-r { display: flex; align-items: center; gap: 20px; }
        .kr-top-meta { white-space: nowrap; }

        /* ── Rhythmus ───────────────────────────────────────── */
        .kr-main { padding: 0 var(--gutter); max-width: 1400px; margin: 0 auto; }
        .kr-section { padding-top: clamp(76px, 9vw, 132px); }
        .kr-section--last { padding-bottom: clamp(80px, 10vw, 140px); }
        .kr-intro { padding-top: clamp(56px, 7vw, 96px); }

        .kr-head { max-width: 720px; margin-bottom: clamp(36px, 4.5vw, 60px); }
        .kr-head .kr-eyebrow { margin-bottom: 20px; }
        .kr-head-rule {
          height: 1px;
          background: var(--line);
          transform-origin: left;
          margin-bottom: clamp(28px, 3.5vw, 44px);
        }
        .kr-lead {
          font-family: var(--sans);
          font-size: 15px;
          line-height: 1.65;
          color: var(--text-secondary);
          margin: 18px 0 0;
          max-width: 560px;
        }

        /* ── Überblick ──────────────────────────────────────── */
        .kr-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border-top: 1px solid var(--line);
          margin-top: clamp(40px, 5vw, 64px);
        }
        .kr-stat {
          padding: 24px 28px 6px 0;
          display: flex;
          flex-direction: column;
        }
        .kr-stat + .kr-stat { border-left: 1px solid var(--line); padding-left: 28px; }
        .kr-stat .kr-eyebrow { margin-bottom: 18px; }
        .kr-stat-value {
          font-family: var(--serif);
          font-size: 19px;
          line-height: 1.3;
          color: var(--ink-strong);
        }
        .kr-stat-detail {
          font-size: 13px;
          line-height: 1.5;
          color: var(--text-muted);
          margin: 8px 0 0;
        }

        /* ── Website Lab ────────────────────────────────────── */
        .kr-lab {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 400px;
          gap: clamp(28px, 3.5vw, 56px);
          align-items: start;
        }
        .kr-lab-note { margin-top: 14px; }
        .kr-side {
          position: sticky;
          top: 92px;
          align-self: start;
          max-height: calc(100dvh - 116px);
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: var(--line-strong) transparent;
        }
        .kr-side-foot { padding: 16px 0 12px; }

        /* Empfehlungen — Zeilen statt Kästen */
        .kr-rc {
          border-top: 1px solid var(--line);
          padding: 22px 18px 24px;
          margin: 0 -18px;
          scroll-margin: 104px;
          transition: background-color 0.3s ease;
        }
        .kr-rc:hover { background: var(--paper-soft); }
        .kr-rc[data-active="true"] {
          background: var(--surface-raised);
          box-shadow: inset 2px 0 0 var(--signal);
        }
        .kr-rc-select {
          display: block;
          width: 100%;
          background: none;
          border: none;
          padding: 0;
          text-align: left;
          color: inherit;
        }
        .kr-rc-select:focus-visible { outline: 1px solid var(--ink-strong); outline-offset: 4px; }
        .kr-rc-select .kr-eyebrow { display: block; margin-bottom: 10px; }
        .kr-rc-select .kr-title { display: block; }
        .kr-rc[data-active="true"] .kr-rc-select .kr-eyebrow { color: var(--ink-strong); }
        .kr-rc-blocks { display: flex; flex-direction: column; gap: 14px; margin: 16px 0 0; }
        .kr-rc-label {
          display: block;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 4px;
        }
        .kr-rc-text { margin: 0; font-size: 13px; line-height: 1.6; color: var(--text-body); }

        /* Meta-Zeile: Impact · Aufwand · Status */
        .kr-metaline {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 8px;
          margin: 16px 0 0;
          font-size: 13px;
          color: var(--text-muted);
        }
        .kr-status { display: inline-flex; align-items: center; gap: 7px; color: var(--text-secondary); }
        .kr-status i {
          width: 6px;
          height: 6px;
          flex: none;
          background: var(--text-faint);
        }
        .kr-status[data-state="open"] i {
          background: transparent;
          box-shadow: inset 0 0 0 1px var(--line-strong);
        }
        .kr-status[data-state="done"] i { background: var(--signal); }

        /* Aktionen: ein stiller Primärknopf, ein Textlink */
        .kr-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 18px;
          margin-top: 18px;
        }
        .kr-btn {
          font-family: var(--sans);
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.01em;
          border: 1px solid var(--warm-black);
          background: var(--warm-black);
          color: var(--paper);
          padding: 10px 20px;
          min-height: 40px;
          transition: background 0.25s, color 0.25s, opacity 0.25s;
        }
        .kr-btn:hover:not(:disabled) { background: transparent; color: var(--ink-strong); }
        .kr-btn:disabled { opacity: 0.45; cursor: default; }
        .kr-btn:focus-visible { outline: 1px solid var(--ink-strong); outline-offset: 3px; }
        .kr-link {
          font-family: var(--sans);
          font-size: 13px;
          font-weight: 400;
          color: var(--ink-strong);
          background: none;
          border: none;
          padding: 0 0 2px;
          border-bottom: 1px solid var(--border-btn);
          transition: border-color 0.25s;
          cursor: pointer;
        }
        .kr-link:hover:not(:disabled) { border-color: var(--warm-black); }
        .kr-link:focus-visible { outline: 1px solid var(--ink-strong); outline-offset: 3px; }
        .kr-link:disabled { opacity: 0.4; cursor: default; }
        .kr-note {
          margin: 14px 0 0;
          font-size: 13px;
          line-height: 1.5;
          color: var(--text-secondary);
        }

        /* ── H-Struktur ─────────────────────────────────────── */
        .kr-hs {
          display: grid;
          grid-template-columns: 1fr 1.3fr;
          gap: clamp(32px, 5vw, 88px);
          align-items: start;
        }
        .kr-hs-label { margin-bottom: 22px; }
        .kr-hs-problems { list-style: none; margin: 0; padding: 0; }
        .kr-hs-problems li {
          display: flex;
          gap: 14px;
          font-size: 15px;
          line-height: 1.6;
          color: var(--text-body);
          padding: 14px 0;
          border-top: 1px solid var(--line);
        }
        .kr-hs-problems li:last-child { border-bottom: 1px solid var(--line); }
        .kr-hs-problems i {
          font-style: normal;
          color: var(--text-faint);
          font-size: 11px;
          flex: none;
          transform: translateY(4px);
        }
        .kr-hs-tree { display: flex; flex-direction: column; }
        .kr-hs-row {
          display: flex;
          align-items: baseline;
          gap: 14px;
          padding: 11px 0;
          border-top: 1px solid var(--line-soft);
        }
        .kr-hs-row:last-child { border-bottom: 1px solid var(--line-soft); }
        .kr-hs-row[data-level="H2"] { padding-left: 22px; }
        .kr-hs-row[data-level="H3"] { padding-left: 44px; }
        .kr-hs-row--note { padding-left: 22px; }
        .kr-hs-level {
          flex: none;
          width: 24px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.08em;
          color: var(--text-faint);
        }
        .kr-hs-row[data-level="H1"] .kr-hs-level { color: var(--ink-strong); }
        .kr-hs-text { font-size: 15px; line-height: 1.5; color: var(--text-body); }
        .kr-hs-row[data-level="H1"] .kr-hs-text {
          font-family: var(--serif);
          font-size: 19px;
          color: var(--ink-strong);
        }
        .kr-hs-row[data-level="H2"] .kr-hs-text { color: var(--ink-strong); }
        .kr-hs-text--muted { color: var(--text-muted); font-size: 13px; }
        .kr-goal {
          font-family: var(--serif);
          font-size: 19px;
          line-height: 1.5;
          color: var(--ink-strong);
          max-width: 640px;
          margin: clamp(36px, 4.5vw, 56px) 0 0;
          padding-top: 24px;
          border-top: 1px solid var(--line);
        }

        /* ── Freigaben — Zeilen mit Hairlines ───────────────── */
        .kr-approvals { border-bottom: 1px solid var(--line); }
        .kr-ap {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.5fr) auto;
          gap: 20px clamp(24px, 3.5vw, 56px);
          align-items: start;
          border-top: 1px solid var(--line);
          padding: 30px 0 34px;
        }
        .kr-ap-text { margin: 0; font-size: 15px; line-height: 1.65; color: var(--text-body); max-width: 520px; }
        .kr-ap-side { display: flex; flex-direction: column; align-items: flex-start; }
        .kr-ap-side .kr-actions { margin-top: 0; }
        .kr-ap-side .kr-note { max-width: 240px; }

        /* ── Markenrahmen ───────────────────────────────────── */
        .kr-ci {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
          gap: clamp(32px, 5vw, 88px);
          align-items: start;
        }
        .kr-ci-values {
          font-family: var(--serif);
          font-size: 19px;
          line-height: 1.4;
          color: var(--ink-strong);
          margin: 0 0 18px;
        }
        .kr-ci-copy .kr-body { max-width: 460px; margin-bottom: 26px; }
        .kr-swatches {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          border-top: 1px solid var(--line);
          padding-top: 24px;
        }
        .kr-swatch { display: flex; flex-direction: column; gap: 8px; }
        .kr-swatch-color { display: block; height: 64px; }
        .kr-swatch-name { font-size: 13px; color: var(--ink-strong); line-height: 1.3; }
        .kr-swatch-hex { font-size: 11px; color: var(--text-muted); }
        .kr-type-sample {
          display: flex;
          align-items: baseline;
          gap: 18px;
          border-top: 1px solid var(--line);
          padding: 20px 0 0;
          margin: 24px 0 10px;
          font-family: var(--font-kluehspies), "Source Sans Pro", sans-serif;
          color: var(--ink-strong);
        }
        .kr-type-aa { font-size: 40px; font-weight: 700; line-height: 1; }
        .kr-type-line { font-size: 15px; font-weight: 600; }

        /* ── Arbeitsprotokoll ───────────────────────────────── */
        .kr-log { max-width: 760px; display: flex; flex-direction: column; }
        .kr-log-row { display: grid; grid-template-columns: 118px 24px 1fr; gap: 0 16px; }
        .kr-log-date { padding-top: 3px; white-space: nowrap; }
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
        .kr-log-row:first-child .kr-log-rail::before { top: 8px; }
        .kr-log-row:last-child .kr-log-rail::before { bottom: calc(100% - 8px); }
        .kr-log-rail i {
          position: absolute;
          top: 5px;
          left: 50%;
          transform: translateX(-50%);
          width: 7px;
          height: 7px;
          background: var(--signal);
        }
        .kr-log-body { padding-bottom: 34px; }
        .kr-log-row:last-child .kr-log-body { padding-bottom: 4px; }
        .kr-log-title {
          display: block;
          font-size: 15px;
          font-weight: 500;
          color: var(--ink-strong);
        }
        .kr-log-detail { margin: 4px 0 0; font-size: 13px; line-height: 1.6; color: var(--text-secondary); max-width: 520px; }

        /* ── Fußzeile ───────────────────────────────────────── */
        .kr-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px 32px;
          flex-wrap: wrap;
          border-top: 1px solid var(--line);
          padding: 24px var(--gutter) 28px;
        }
        .kr-foot-conf { flex: 1; text-align: center; }

        @media (prefers-reduced-motion: reduce) {
          .kr-resolve { animation: none; }
        }

        /* ── Responsiv ──────────────────────────────────────── */
        @media (max-width: 1100px) {
          .kr-lab { grid-template-columns: 1fr; }
          .kr-side { position: static; max-height: none; overflow: visible; }
          .kr-stats { grid-template-columns: repeat(2, 1fr); }
          .kr-stat { padding-bottom: 24px; }
          .kr-stat:nth-child(odd) { border-left: none; padding-left: 0; }
          .kr-stat:nth-child(n + 3) { border-top: 1px solid var(--line); }
          .kr-hs { grid-template-columns: 1fr; }
          .kr-ap { grid-template-columns: 1fr; gap: 16px; }
          .kr-ap-text { max-width: 640px; }
          .kr-ci { grid-template-columns: 1fr; }
        }
        @media (max-width: 720px) {
          .kr-top { flex-wrap: wrap; }
          .kr-top-meta { display: none; }
          .kr-stats { grid-template-columns: 1fr; }
          .kr-stat { border-left: none !important; padding-left: 0 !important; }
          .kr-stat + .kr-stat { border-top: 1px solid var(--line); }
          .kr-swatches { grid-template-columns: repeat(2, 1fr); }
          .kr-log-row { grid-template-columns: 1fr; gap: 2px; }
          .kr-log-rail { display: none; }
          .kr-log-body { padding-bottom: 24px; border-bottom: 1px solid var(--line-soft); margin-bottom: 20px; }
          .kr-log-row:last-child .kr-log-body { border-bottom: none; margin-bottom: 0; }
          .kr-foot { flex-direction: column; align-items: flex-start; }
          .kr-foot-conf { text-align: left; }
          .kr-rc { margin: 0; padding-left: 0; padding-right: 0; }
        }
      `}</style>
    </div>
  );
}

/* ── Bausteine ─────────────────────────────────────────────── */

function Reveal({
  className,
  reduced,
  children,
}: {
  className?: string;
  reduced: boolean | null;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      className={className}
      initial={reduced ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      {children}
    </motion.section>
  );
}

function SectionHead({
  reduced,
  index,
  eyebrow,
  title,
  lead,
}: {
  reduced: boolean | null;
  index: string;
  eyebrow: string;
  title: string;
  lead: string;
}) {
  return (
    <header className="kr-head">
      <motion.div
        className="kr-head-rule"
        initial={reduced ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 1.1, ease: EASE }}
        aria-hidden="true"
      />
      <p className="kr-eyebrow">
        {index} · {eyebrow}
      </p>
      <h2 className="kr-display">{title}</h2>
      <p className="kr-lead">{lead}</p>
    </header>
  );
}

function statusState(status: RecStatus): "done" | "open" | undefined {
  if (status === "Freigegeben") return "done";
  if (status === "Freigabe offen") return "open";
  return undefined;
}

function MetaLine({
  impact,
  effort,
  status,
}: {
  impact: string;
  effort: string;
  status: RecStatus;
}) {
  return (
    <p className="kr-metaline">
      <span>Impact {impact.toLowerCase()}</span>
      <span aria-hidden="true">·</span>
      <span>Aufwand {effort.toLowerCase()}</span>
      <span aria-hidden="true">·</span>
      <span className="kr-status" data-state={statusState(status)}>
        <i className="olive-dot" aria-hidden="true" />
        {status}
      </span>
    </p>
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
        <span className="kr-eyebrow">
          {rec.num} · {rec.pinTarget}
        </span>
        <span className="kr-title">{rec.title}</span>
      </button>
      <div className="kr-rc-blocks">
        <div>
          <span className="kr-rc-label">Problem</span>
          <p className="kr-rc-text">{rec.problem}</p>
        </div>
        <div>
          <span className="kr-rc-label">Empfehlung</span>
          <p className="kr-rc-text">{rec.recommendation}</p>
        </div>
        <div>
          <span className="kr-rc-label">Warum das zählt</span>
          <p className="kr-rc-text">{rec.why}</p>
        </div>
      </div>
      <MetaLine impact={rec.impact} effort={rec.effort} status={status} />
      <div className="kr-actions">
        <button type="button" className="kr-btn" onClick={onApprove} disabled={approved}>
          {approved ? "Freigegeben" : "Freigeben"}
        </button>
        <button type="button" className="kr-link" onClick={onComment}>
          Kommentar
        </button>
      </div>
      {note && <p className="kr-note">{note}</p>}
    </article>
  );
}

function ApprovalRow({
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
    <article className="kr-ap">
      <div>
        <h3 className="kr-title">{item.title}</h3>
        <MetaLine impact={item.impact} effort={item.effort} status={status} />
      </div>
      <p className="kr-ap-text">{item.description}</p>
      <div className="kr-ap-side">
        <div className="kr-actions">
          <button type="button" className="kr-btn" onClick={onApprove} disabled={approved}>
            {approved ? "Freigegeben" : "Freigeben"}
          </button>
          <button type="button" className="kr-link" onClick={onDiscuss} disabled={approved}>
            Noch besprechen
          </button>
        </div>
        {note && <p className="kr-note">{note}</p>}
      </div>
    </article>
  );
}
