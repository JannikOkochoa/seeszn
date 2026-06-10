"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

interface Note {
  id: string;
  cls: string;
  title: string;
  abstract: string;
  observation: string;
  move: string;
}

const NOTES: Note[] = [
  {
    id: "FN-01",
    cls: "RETRIEVAL",
    title: "One question becomes thirty searches.",
    abstract: "Query fan-out creates hidden search paths most brands never see.",
    observation:
      "AI search systems decompose a single prompt into a fan of sub-queries — comparisons, alternatives, pricing, reviews, local variants. Each path is answered separately, from different surfaces, and reassembled into one response. A brand can dominate the visible query and be absent from the fan that actually feeds the answer.",
    move: "Map the fan-out for your category before writing a single page.",
  },
  {
    id: "FN-02",
    cls: "CITATION",
    title: "The listicle you ignored is answering for you.",
    abstract: "Models over-cite aggregation surfaces — and someone else built them.",
    observation:
      "Answer engines lean on surfaces that compare and rank: listicles, category roundups, buyer's guides, forum threads. These pages get cited because they are dense, structured and already adjudicated. If the only roundup in your category was written by an affiliate site, that site speaks for your market.",
    move: "Earn placement on the surfaces models already trust — or build the definitive one.",
  },
  {
    id: "FN-03",
    cls: "STRUCTURE",
    title: "Machines quote paragraphs, not pages.",
    abstract: "Retrieval is chunk-level. Most pages cannot be quoted in forty words.",
    observation:
      "Retrieval systems split pages into passages and embed each one separately. A page wins by containing chunks that are distinct, self-sufficient and source-worthy — a definition that stands alone, a comparison that needs no context. Long undifferentiated prose embeds as noise and is never selected.",
    move: "Write in chunks: one claim, one passage, quotable without its page.",
  },
  {
    id: "FN-04",
    cls: "ENTITY",
    title: "If the model cannot resolve who you are, it cannot recommend you.",
    abstract: "Entity clarity decides whether mentions consolidate into memory.",
    observation:
      "Models build entity records from corroborating sources: consistent naming, a canonical description, aligned profiles, third-party confirmation. Inconsistent naming and thin corroboration split a brand into fragments too weak to cite. Mentions then accrue to the category — not to you.",
    move: "One canonical entity record, corroborated everywhere it counts.",
  },
  {
    id: "FN-05",
    cls: "STRUCTURE",
    title: "Schema is grammar, not strategy.",
    abstract: "Markup makes statements legible. It does not make them credible.",
    observation:
      "Structured data tells a parser what a statement is — it does not supply the evidence that makes the statement quotable. Schema applied to thin content is a well-formatted absence. The order of operations matters: evidence first, structure second, markup last.",
    move: "Structure follows evidence. Never the reverse.",
  },
  {
    id: "FN-06",
    cls: "TRUST",
    title: "Speed is a trust signal before it is a ranking factor.",
    abstract: "A slow surface reads as a neglected one — to people and to crawlers.",
    observation:
      "Latency shapes judgment in the first contact: visitors read slowness as neglect, and crawl systems allocate attention away from surfaces that waste their budget. Performance is not a technical afterthought; it is part of how credibility is rendered.",
    move: "Treat performance as brand, budgeted like design.",
  },
  {
    id: "FN-07",
    cls: "SURFACE",
    title: "Your category page is a retrieval surface.",
    abstract: "Commercial fan-out paths retrieve category pages. Most are thin grids.",
    observation:
      "When the fan-out turns commercial — best, versus, alternatives, pricing — systems retrieve category and service pages. Most are product grids with no statements worth quoting. A category page that defines, compares and proves becomes the fragment the answer is built from.",
    move: "Rebuild category pages as evidence: definitions, comparisons, proof.",
  },
  {
    id: "FN-08",
    cls: "RETRIEVAL",
    title: "Answers are assembled, not found.",
    abstract: "An AI answer is a composite of fragments from several surfaces.",
    observation:
      "No single page wins an AI answer. The system assembles fragments — a definition from one surface, a comparison from another, a price from a third — and cites the usable ones. Presence means being a fragment the assembly cannot skip.",
    move: "Design pages as fragment libraries, not narratives.",
  },
];

export default function FieldNotes() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.08 });
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section ref={ref} className="fn-section" aria-label="Field notes — the intelligence index">
      <div className="fn-header">
        <div className="fn-chips">
          <span className="fn-chip">02</span>
          <span className="fn-chip">FIELD NOTES</span>
        </div>
        <span className="fn-chip fn-chip--right">FILED 2026 — ONGOING</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="fn-intro"
      >
        <h2 className="fn-intro-headline">
          We publish what we verify <em>in operation.</em>
        </h2>
        <p className="fn-intro-copy">
          EACH NOTE — ONE OBSERVATION, ONE OPERATIVE MOVE.
          <br />
          NO ESSAYS. NO PREDICTION THEATER.
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
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--dust);
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
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          line-height: 1.8;
          letter-spacing: 0.05em;
          color: var(--muted);
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
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          line-height: 1.6;
          color: #5E574F;
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
          font-family: var(--font-mono), monospace;
          font-size: 13px;
          line-height: 1.75;
          color: #5E574F;
          margin-bottom: 20px;
        }
        .fn-move {
          font-family: var(--font-mono), monospace;
          font-size: 12px;
          line-height: 1.7;
          color: var(--warm-black);
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
