"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { useTranslations } from "@/lib/i18n/context";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function FieldNotes() {
  const t = useTranslations();
  const fn = t.insightsPage.fieldNotes;
  const NOTES = fn.notes;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.08 });
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section ref={ref} className="fn-section" aria-label="Field notes — the intelligence index">
      <div className="fn-header">
        <div className="fn-chips">
          <span className="fn-chip">02</span>
          <span className="fn-chip">{fn.chip}</span>
        </div>
        <span className="fn-chip fn-chip--right">{fn.dateLabel}</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="fn-intro"
      >
        <h2 className="fn-intro-headline">
          {fn.introHeadlineRoman} <em>{fn.introHeadlineItalic}</em>
        </h2>
        <p className="fn-intro-copy">
          {fn.introCopy.split("\n").map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
        </p>
      </motion.div>

      <div className="fn-list">
        {NOTES.map((note, i) => (
          <motion.article
            key={note.id}
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.1 + i * 0.06 }}
            className="fn-row"
          >
            <button
              className="fn-trigger"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
              aria-controls={`note-${note.id}`}
            >
              <span className="fn-meta">
                <span className="fn-id">{note.id}</span>
                <span className="fn-cls">{note.cls}</span>
              </span>
              <span className="fn-title-block">
                <span className="fn-title">{note.title}</span>
                <span className="fn-abstract">{note.abstract}</span>
              </span>
              <span className={`fn-toggle${open === i ? " fn-toggle--open" : ""}`} aria-hidden="true" />
            </button>

            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div
                  key="body"
                  id={`note-${note.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  style={{ overflow: "hidden" }}
                >
                  <div className="fn-body">
                    <p className="fn-observation">{note.observation}</p>
                    <p className="fn-move">
                      <span className="fn-move-label">OPERATIVE MOVE</span>
                      {note.move}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.article>
        ))}
      </div>

      <style>{`
        .fn-section {
          background: var(--paper);
          padding-bottom: 96px;
        }
        .fn-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 44px 64px 0;
        }
        .fn-chips { display: flex; gap: 16px; align-items: center; }
        .fn-chip {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        .fn-intro {
          padding: 48px 64px 56px;
          display: grid;
          grid-template-columns: minmax(0, 60fr) minmax(0, 40fr);
          gap: 0 64px;
          align-items: end;
        }
        .fn-intro-headline {
          font-family: var(--font-editorial), serif;
          font-weight: 400;
          font-size: clamp(32px, 4vw, 52px);
          line-height: 1.1;
          color: var(--warm-black);
          margin: 0;
        }
        .fn-intro-headline em { font-style: italic; }
        .fn-intro-copy {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 14px;
          font-weight: 400;
          line-height: 1.65;
          color: var(--text-muted);
        }

        /* ── Dossier rows ────────────────────────────── */
        .fn-row { border-top: 1px solid var(--warm-black); }
        .fn-row:last-child { border-bottom: 1px solid var(--warm-black); }
        .fn-trigger {
          width: 100%;
          display: grid;
          grid-template-columns: 150px 1fr 32px;
          gap: 24px;
          align-items: start;
          text-align: left;
          background: none;
          border: none;
          padding: 28px 64px;
          cursor: pointer;
          transition: background 350ms ease;
        }
        .fn-trigger:hover { background: rgba(17,16,14,.02); }
        .fn-trigger:focus-visible { outline: 1px solid var(--warm-black); outline-offset: -1px; }
        .fn-meta { display: flex; flex-direction: column; gap: 7px; padding-top: 6px; }
        .fn-id {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.12em;
          color: var(--dust);
        }
        .fn-cls {
          font-family: var(--font-mono), monospace;
          font-size: 8px;
          letter-spacing: 0.22em;
          color: var(--olive);
        }
        .fn-title-block { display: flex; flex-direction: column; gap: 8px; }
        .fn-title {
          font-family: var(--font-editorial), serif;
          font-weight: 400;
          font-size: clamp(20px, 2.3vw, 29px);
          line-height: 1.18;
          color: var(--warm-black);
        }
        .fn-abstract {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 14px;
          font-weight: 400;
          line-height: 1.6;
          color: var(--text-body);
          max-width: 560px;
        }

        /* toggle — plus that collapses to minus */
        .fn-toggle {
          display: block;
          width: 14px;
          height: 14px;
          position: relative;
          margin-top: 12px;
          justify-self: end;
        }
        .fn-toggle::before,
        .fn-toggle::after {
          content: '';
          position: absolute;
          background: var(--warm-black);
          transition: transform 600ms cubic-bezier(.16,1,.3,1), opacity 400ms ease;
        }
        .fn-toggle::before {
          width: 100%; height: 1px;
          top: 50%; left: 0;
          transform: translateY(-50%);
        }
        .fn-toggle::after {
          width: 1px; height: 100%;
          top: 0; left: 50%;
          transform: translateX(-50%);
        }
        .fn-toggle--open::after {
          transform: translateX(-50%) scaleY(0);
          opacity: 0;
        }

        .fn-body {
          padding: 0 64px 36px;
          margin-left: 174px;
          max-width: 620px;
        }
        .fn-observation {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 15px;
          font-weight: 400;
          line-height: 1.65;
          color: var(--text-body);
          margin-bottom: 20px;
        }
        .fn-move {
          font-family: var(--font-body), "Helvetica Neue", sans-serif;
          font-size: 14px;
          font-weight: 400;
          line-height: 1.65;
          color: var(--text-primary);
          border-top: 1px solid var(--line);
          padding-top: 14px;
        }
        .fn-move-label {
          display: block;
          font-size: 8px;
          letter-spacing: 0.22em;
          color: var(--olive);
          margin-bottom: 6px;
        }

        @media (max-width: 820px) {
          .fn-header { padding: 36px 24px 0; }
          .fn-chip--right { display: none; }
          .fn-intro {
            grid-template-columns: 1fr;
            gap: 20px;
            padding: 36px 24px 44px;
          }
          .fn-trigger {
            grid-template-columns: 1fr 32px;
            gap: 12px 16px;
            padding: 24px;
          }
          .fn-meta {
            grid-column: 1 / -1;
            flex-direction: row;
            gap: 14px;
            align-items: baseline;
            padding-top: 0;
          }
          .fn-toggle { margin-top: 6px; }
          .fn-body { margin-left: 0; padding: 0 24px 32px; }
        }
      `}</style>
    </section>
  );
}
