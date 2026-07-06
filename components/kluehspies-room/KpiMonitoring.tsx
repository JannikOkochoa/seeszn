"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  aiReadiness,
  articleStates,
  blockers,
  contentNote,
  contentWeeks,
  KLUE,
  kpiCards,
  linkPipeline,
  linkPipelineLive,
  linkPipelineNote,
  productPages,
  productPagesNote,
  rankingTarget,
  rankingTrend,
  visibilityAside,
  visibilityInsight,
  type KpiStatus,
  type TrendDirection,
} from "./data";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

/**
 * KPI Monitoring — das Steuerungs-Cockpit des Website Labs.
 * Gleiche Sprache wie der Rest des Raums: ein Serif, ein Sans, Hairlines.
 * Zahlen sind lokale Arbeitsstände; GSC und Ranktracker folgen im Ausbau.
 * Klühspies-Blau nur als eine ruhige Linie, Gelb nur als Pilot-Marker.
 */

function kpiState(status: KpiStatus): "done" | "open" | undefined {
  if (status === "On Track") return "done";
  if (status === "Wartet auf Freigabe") return "open";
  return undefined;
}

const TREND_ARROW: Record<TrendDirection, string> = { up: "↗", down: "↘", flat: "→" };

function de(n: number) {
  return n.toLocaleString("de-DE", { maximumFractionDigits: 1 });
}

/* ── Modul 2: ruhige Ranking-Linie als eigenes SVG ─────────── */
function TrendChart({ reduced }: { reduced: boolean | null }) {
  const [hover, setHover] = useState<number | null>(null);

  const W = 640;
  const H = 232;
  const pad = { l: 30, r: 66, t: 18, b: 30 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const dMin = 10;
  const dMax = 26;

  const x = (i: number) => pad.l + (i / (rankingTrend.length - 1)) * innerW;
  const y = (pos: number) => pad.t + ((pos - dMin) / (dMax - dMin)) * innerH;

  const path = rankingTrend
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p.position).toFixed(1)}`)
    .join(" ");

  const last = rankingTrend.length - 1;
  const hovered = hover === null ? null : rankingTrend[hover];
  const tipX = hover === null ? 0 : Math.min(Math.max(x(hover), pad.l + 52), W - pad.r - 40);

  return (
    <figure className="kk-chart">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Durchschnittliches Keyword-Ranking von Position 24 in KW 21 auf Position 17 in KW 28, Ziel Position ${rankingTarget}`}
        onMouseLeave={() => setHover(null)}
      >
        {/* zurückhaltendes Raster */}
        {[15, 20, 25].map((pos) => (
          <g key={pos}>
            <line x1={pad.l} x2={W - pad.r} y1={y(pos)} y2={y(pos)} className="kk-grid" />
            <text x={pad.l - 8} y={y(pos) + 3} textAnchor="end" className="kk-tick">
              {pos}
            </text>
          </g>
        ))}

        {/* Ziel-Linie */}
        <line
          x1={pad.l}
          x2={W - pad.r}
          y1={y(rankingTarget)}
          y2={y(rankingTarget)}
          className="kk-goal-line"
        />
        <text x={W - pad.r + 10} y={y(rankingTarget) + 3} className="kk-goal-text">
          Ziel {rankingTarget}
        </text>

        {/* Datenlinie: Klühspies-Blau, ruhig gezeichnet */}
        <motion.path
          d={path}
          fill="none"
          stroke={KLUE.blue}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduced ? false : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 1.6, ease: EASE }}
        />

        {/* Direktlabels: Start und Stand */}
        <circle cx={x(0)} cy={y(rankingTrend[0].position)} r={3.5} fill={KLUE.blue} className="kk-point" />
        <circle cx={x(last)} cy={y(rankingTrend[last].position)} r={4.5} fill={KLUE.blue} className="kk-point" />
        <text x={x(0)} y={y(rankingTrend[0].position) - 12} textAnchor="start" className="kk-dl">
          {de(rankingTrend[0].position)}
        </text>
        <text x={x(last) + 12} y={y(rankingTrend[last].position) + 4} textAnchor="start" className="kk-dl">
          {de(rankingTrend[last].position)}
        </text>

        {/* Achsenbeschriftung: nur erste und letzte Woche */}
        <text x={x(0)} y={H - 8} textAnchor="start" className="kk-tick">
          {rankingTrend[0].week}
        </text>
        <text x={x(last)} y={H - 8} textAnchor="end" className="kk-tick">
          {rankingTrend[last].week}
        </text>

        {/* Hover: Spalte für Spalte, Werte auf Anfrage */}
        {hover !== null && hovered && (
          <g aria-hidden="true">
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + innerH} className="kk-cross" />
            <circle cx={x(hover)} cy={y(hovered.position)} r={4.5} fill={KLUE.blue} className="kk-point" />
            <g transform={`translate(${tipX}, ${pad.t})`}>
              <rect x={-50} y={-4} width={100} height={22} className="kk-tip-bg" />
              <text x={0} y={11} textAnchor="middle" className="kk-tip">
                {hovered.week} · Pos. {de(hovered.position)}
              </text>
            </g>
          </g>
        )}
        {rankingTrend.map((p, i) => (
          <rect
            key={p.week}
            x={x(i) - innerW / (rankingTrend.length - 1) / 2}
            y={pad.t}
            width={innerW / (rankingTrend.length - 1)}
            height={innerH}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
          />
        ))}
      </svg>
      <figcaption className="kk-visually-hidden">
        <table>
          <caption>Durchschnittliches Keyword-Ranking pro Kalenderwoche</caption>
          <thead>
            <tr>
              <th scope="col">Woche</th>
              <th scope="col">Position</th>
            </tr>
          </thead>
          <tbody>
            {rankingTrend.map((p) => (
              <tr key={p.week}>
                <td>{p.week}</td>
                <td>{de(p.position)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
      <p className="kr-meta kk-chart-note">
        Ø Position des Keyword-Sets · niedriger ist besser · Stand {rankingTrend[last].week}
      </p>
    </figure>
  );
}

/* ── Dünner Fortschrittsbalken, sanft von links gezeichnet ── */
function Track({ share, reduced, delay = 0 }: { share: number; reduced: boolean | null; delay?: number }) {
  return (
    <span className="kk-track" aria-hidden="true">
      <motion.span
        className="kk-track-fill"
        style={{ transformOrigin: "left" }}
        initial={reduced ? false : { scaleX: 0 }}
        whileInView={{ scaleX: share }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 1.1, ease: EASE, delay }}
      />
    </span>
  );
}

export default function KpiMonitoring({ reduced }: { reduced: boolean | null }) {
  return (
    <div className="kk">
      {/* ── 1 · Executive Snapshot ─────────────────────────── */}
      <div className="kk-cards">
        {kpiCards.map((card, i) => (
          <motion.article
            key={card.id}
            className="kk-card"
            initial={reduced ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, ease: EASE, delay: i * 0.07 }}
          >
            <span className="kr-eyebrow">{card.label}</span>
            <span className="kk-value">
              {card.value} <span className="kk-target">· {card.target}</span>
            </span>
            <span className="kk-trend" data-dir={card.trend}>
              <span aria-hidden="true">{TREND_ARROW[card.trend]}</span> {card.trendLabel}
            </span>
            <p className="kk-exp">{card.explanation}</p>
            <span className="kr-status kk-card-status" data-state={kpiState(card.status)}>
              <i className="olive-dot" aria-hidden="true" />
              {card.status}
            </span>
          </motion.article>
        ))}
      </div>

      {/* ── 2 · Sichtbarkeitsentwicklung ───────────────────── */}
      <div className="kk-module">
        <p className="kr-eyebrow kk-module-label">Sichtbarkeitsentwicklung</p>
        <div className="kk-vis">
          <TrendChart reduced={reduced} />
          <div className="kk-vis-aside">
            {visibilityAside.map((item) => (
              <div key={item.label} className="kk-aside-block">
                <span className="kr-eyebrow">{item.label}</span>
                <span className="kk-aside-value">{item.value}</span>
                <p className="kr-meta">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="kk-insight">{visibilityInsight}</p>
      </div>

      {/* ── 3 · Content Output ─────────────────────────────── */}
      <div className="kk-module">
        <p className="kr-eyebrow kk-module-label">Content Output · 2 Ratgeber pro Woche</p>
        <div className="kk-weeks">
          {contentWeeks.map((week) => (
            <div key={week.week} className="kk-week" data-current={week.current || undefined}>
              <span className="kk-week-label">
                {week.week}
                {week.current && <em>Diese Woche</em>}
              </span>
              <div className="kk-week-articles">
                {week.articles.map((article) => {
                  const step = articleStates.indexOf(article.state);
                  return (
                    <div key={article.title} className="kk-article">
                      <span className="kk-article-title">{article.title}</span>
                      <span className="kk-article-state">
                        <span
                          className="kk-steps"
                          data-live={article.state === "Live" || undefined}
                          role="img"
                          aria-label={`Status: ${article.state}, Schritt ${step + 1} von ${articleStates.length}`}
                        >
                          {articleStates.map((s, i) => (
                            <i key={s} data-filled={i <= step || undefined} />
                          ))}
                        </span>
                        {article.state}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <p className="kr-meta kk-module-note">{contentNote}</p>
      </div>

      {/* ── 4 · Linkaufbau ─────────────────────────────────── */}
      <div className="kk-module">
        <p className="kr-eyebrow kk-module-label">Linkaufbau · Outreach Pipeline</p>
        <div className="kk-pipe">
          {linkPipeline.map((stage, i) => (
            <div key={stage.label} className="kk-pipe-row">
              <div className="kk-pipe-top">
                <span className="kk-pipe-label">{stage.label}</span>
                <span className="kk-pipe-value">{stage.display}</span>
              </div>
              <Track share={stage.share} reduced={reduced} delay={i * 0.12} />
              <p className="kr-meta">{stage.detail}</p>
            </div>
          ))}
        </div>
        <p className="kr-meta kk-module-note">{linkPipelineLive}</p>
        <p className="kk-insight kk-insight--tight">{linkPipelineNote}</p>
      </div>

      {/* ── 5 · Produktseiten ──────────────────────────────── */}
      <div className="kk-module">
        <p className="kr-eyebrow kk-module-label">Produktseiten · Fortschritt</p>
        <div className="kk-pages">
          <div className="kk-page kk-page--head" aria-hidden="true">
            <span className="kr-eyebrow">Seite</span>
            <span className="kr-eyebrow">Maßnahmen</span>
            <span className="kr-eyebrow">Status</span>
            <span className="kr-eyebrow">TYPO3-Aufwand</span>
          </div>
          {productPages.map((page) => (
            <div key={page.city} className="kk-page">
              <span className="kk-page-city">
                {page.city}
                {page.pilot && <span className="kk-pilot">Pilot</span>}
              </span>
              <ul className="kk-checks">
                {page.checks.map((check) => (
                  <li key={check.label} data-state={check.state}>
                    <i className="olive-dot" aria-hidden="true" />
                    {check.label}
                  </li>
                ))}
              </ul>
              <span
                className="kr-status kk-page-status"
                data-state={page.status === "Wartet auf Freigabe" ? "open" : undefined}
              >
                <i className="olive-dot" aria-hidden="true" />
                {page.status}
              </span>
              <span className="kr-meta kk-page-typo3">{page.typo3}</span>
            </div>
          ))}
        </div>
        <p className="kr-meta kk-module-note">{productPagesNote}</p>
      </div>

      {/* ── 6 · AI/GEO Readiness ───────────────────────────── */}
      <div className="kk-module">
        <p className="kr-eyebrow kk-module-label">AI / GEO Readiness</p>
        <div className="kk-ai">
          <div className="kk-ai-score">
            <span className="kk-ai-number">
              {aiReadiness.score}
              <span className="kk-ai-of"> / 100</span>
            </span>
            <Track share={aiReadiness.score / 100} reduced={reduced} />
            <p className="kr-meta kk-ai-exp">{aiReadiness.explanation}</p>
          </div>
          <div className="kk-ai-factors">
            {aiReadiness.factors.map((factor, i) => (
              <div key={factor.label} className="kk-factor">
                <div className="kk-factor-top">
                  <span className="kk-factor-label">{factor.label}</span>
                  <span className="kr-meta">{factor.score}</span>
                </div>
                <Track share={factor.score / 100} reduced={reduced} delay={i * 0.1} />
                <p className="kr-meta">{factor.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 7 · Blocker & nächste Schritte ─────────────────── */}
      <div className="kk-module">
        <p className="kr-eyebrow kk-module-label">Blocker · Nächste Schritte</p>
        <div className="kk-blockers">
          {blockers.map((blocker) => (
            <div key={blocker.title} className="kk-blocker">
              <span className="kk-blocker-title">{blocker.title}</span>
              <p className="kr-meta kk-blocker-detail">{blocker.detail}</p>
            </div>
          ))}
        </div>
        <div className="kr-actions kk-actions">
          <a href="#freigaben" className="kr-btn kk-btn-link">
            Zur Freigabe
          </a>
          <a href="#seo-pipeline" className="kr-link">
            In SEO Pipeline ansehen
          </a>
        </div>
      </div>

      <style>{`
        /* ── KPI Monitoring — gleiche Sprache, eigene Bausteine ── */
        .kk-module { margin-top: clamp(56px, 7vw, 88px); }
        .kk-module-label {
          border-top: 1px solid var(--line);
          padding-top: 18px;
          margin-bottom: clamp(24px, 3vw, 36px);
        }
        .kk-module-note { margin-top: 20px; max-width: 620px; }

        /* 1 · Snapshot-Karten */
        .kk-cards {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          border-top: 1px solid var(--line);
        }
        .kk-card {
          display: flex;
          flex-direction: column;
          padding: 26px 24px 26px 0;
          transition: background-color 0.35s ease;
        }
        .kk-card + .kk-card { border-left: 1px solid var(--line); padding-left: 24px; }
        .kk-card:hover { background: var(--paper-soft); }
        .kk-card .kr-eyebrow { margin-bottom: 16px; }
        .kk-value {
          font-family: var(--serif);
          font-size: 30px;
          line-height: 1.15;
          color: var(--ink-strong);
        }
        .kk-target {
          font-size: 15px;
          color: var(--text-muted);
          white-space: nowrap;
        }
        .kk-trend {
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: 10px;
        }
        .kk-trend[data-dir="down"] { color: var(--text-muted); }
        .kk-exp {
          font-size: 13px;
          line-height: 1.55;
          color: var(--text-muted);
          margin: 10px 0 0;
          flex: 1;
        }
        .kk-card-status { margin-top: 18px; font-size: 13px; }

        /* 2 · Sichtbarkeit */
        .kk-vis {
          display: grid;
          grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr);
          gap: clamp(28px, 4vw, 64px);
          align-items: start;
        }
        .kk-chart { margin: 0; }
        .kk-chart svg { display: block; width: 100%; height: auto; }
        .kk-chart-note { margin-top: 12px; }
        .kk-grid { stroke: var(--line-soft); }
        .kk-goal-line {
          stroke: var(--text-faint);
          stroke-dasharray: 3 6;
        }
        .kk-goal-text, .kk-tick {
          font-family: var(--sans);
          font-size: 10px;
          fill: var(--text-faint);
          letter-spacing: 0.04em;
        }
        .kk-goal-text { fill: var(--text-muted); }
        .kk-dl {
          font-family: var(--sans);
          font-size: 12px;
          font-weight: 500;
          fill: var(--text-body);
        }
        .kk-point { stroke: var(--paper); stroke-width: 2px; }
        .kk-cross { stroke: var(--line-strong); stroke-width: 1px; }
        .kk-tip-bg { fill: var(--paper); stroke: var(--line); }
        .kk-tip { font-family: var(--sans); font-size: 11px; fill: var(--text-body); }
        .kk-vis-aside { display: flex; flex-direction: column; }
        .kk-aside-block {
          border-top: 1px solid var(--line);
          padding: 18px 0 26px;
          display: flex;
          flex-direction: column;
        }
        .kk-aside-block .kr-eyebrow { margin-bottom: 12px; }
        .kk-aside-value {
          font-family: var(--serif);
          font-size: 19px;
          line-height: 1.3;
          color: var(--ink-strong);
          margin-bottom: 8px;
        }
        .kk-insight {
          font-family: var(--serif);
          font-size: 19px;
          line-height: 1.5;
          color: var(--ink-strong);
          max-width: 640px;
          margin: clamp(28px, 3.5vw, 44px) 0 0;
          padding-top: 22px;
          border-top: 1px solid var(--line);
        }
        .kk-insight--tight { font-size: 15px; margin-top: 24px; padding-top: 18px; max-width: 560px; }

        /* 3 · Content-Wochen */
        .kk-weeks { border-bottom: 1px solid var(--line); }
        .kk-week {
          display: grid;
          grid-template-columns: 130px minmax(0, 1fr);
          gap: 12px clamp(20px, 3vw, 48px);
          border-top: 1px solid var(--line);
          padding: 20px 0;
        }
        .kk-week-label {
          font-size: 13px;
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding-top: 2px;
        }
        .kk-week[data-current] .kk-week-label { color: var(--ink-strong); font-weight: 500; }
        .kk-week-label em {
          font-style: normal;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-muted);
        }
        .kk-week-articles { display: flex; flex-direction: column; gap: 12px; }
        .kk-article {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 16px 28px;
          flex-wrap: wrap;
        }
        .kk-article-title { font-size: 15px; line-height: 1.5; color: var(--text-body); }
        .kk-week[data-current] .kk-article-title { color: var(--ink-strong); }
        .kk-article-state {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--text-muted);
          white-space: nowrap;
        }
        .kk-steps { display: inline-flex; gap: 3px; }
        .kk-steps i {
          width: 5px;
          height: 5px;
          background: transparent;
          box-shadow: inset 0 0 0 1px var(--line-strong);
        }
        .kk-steps i[data-filled] { background: var(--text-secondary); box-shadow: none; }
        .kk-steps[data-live] i[data-filled] { background: var(--signal); }

        /* 4 · Link-Pipeline */
        .kk-pipe { display: flex; flex-direction: column; max-width: 760px; }
        .kk-pipe-row { border-top: 1px solid var(--line); padding: 18px 0 22px; }
        .kk-pipe-row:last-child { border-bottom: 1px solid var(--line); }
        .kk-pipe-top {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 12px;
        }
        .kk-pipe-label { font-size: 15px; color: var(--ink-strong); }
        .kk-pipe-value { font-family: var(--serif); font-size: 19px; color: var(--ink-strong); white-space: nowrap; }
        .kk-pipe-row .kr-meta { margin-top: 10px; max-width: 520px; }
        .kk-track {
          display: block;
          height: 2px;
          background: var(--line-soft);
          overflow: hidden;
        }
        .kk-track-fill {
          display: block;
          height: 100%;
          width: 100%;
          background: var(--ink-strong);
        }

        /* 5 · Produktseiten */
        .kk-pages { border-bottom: 1px solid var(--line); }
        .kk-page {
          display: grid;
          grid-template-columns: 150px minmax(0, 1fr) 180px 110px;
          gap: 12px clamp(18px, 2.5vw, 40px);
          align-items: baseline;
          border-top: 1px solid var(--line);
          padding: 18px 0;
        }
        .kk-page--head { border-top: none; padding-bottom: 6px; }
        .kk-page-city {
          font-family: var(--serif);
          font-size: 19px;
          color: var(--ink-strong);
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
        .kk-pilot {
          font-family: var(--sans);
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          background: ${KLUE.yellow};
          color: #1a1a1a;
          padding: 2px 7px 1px;
          transform: translateY(-2px);
        }
        .kk-checks {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 6px 22px;
        }
        .kk-checks li {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          color: var(--text-body);
        }
        .kk-checks li i { width: 6px; height: 6px; flex: none; background: var(--signal); }
        .kk-checks li[data-state="open"] { color: var(--text-muted); }
        .kk-checks li[data-state="open"] i {
          background: transparent;
          box-shadow: inset 0 0 0 1px var(--line-strong);
        }
        .kk-page-status { font-size: 13px; }
        .kk-page-typo3 { text-align: right; }

        /* 6 · AI Readiness */
        .kk-ai {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr);
          gap: clamp(32px, 5vw, 88px);
          align-items: start;
        }
        .kk-ai-number {
          font-family: var(--serif);
          font-size: clamp(48px, 5vw, 64px);
          line-height: 1;
          color: var(--ink-strong);
          display: block;
          margin-bottom: 18px;
        }
        .kk-ai-of { font-size: 19px; color: var(--text-muted); }
        .kk-ai-exp { margin-top: 16px; max-width: 380px; }
        .kk-ai-factors { display: flex; flex-direction: column; }
        .kk-factor { border-top: 1px solid var(--line); padding: 16px 0 20px; }
        .kk-factor:last-child { border-bottom: 1px solid var(--line); }
        .kk-factor-top {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 10px;
        }
        .kk-factor-label { font-size: 15px; color: var(--ink-strong); }
        .kk-factor .kr-meta { margin-top: 8px; }

        /* 7 · Blocker */
        .kk-blockers { border-bottom: 1px solid var(--line); max-width: 760px; }
        .kk-blocker {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
          gap: 8px clamp(20px, 3vw, 48px);
          border-top: 1px solid var(--line);
          padding: 16px 0 18px;
        }
        .kk-blocker-title { font-size: 15px; font-weight: 500; color: var(--ink-strong); }
        .kk-blocker-detail { max-width: 460px; }
        .kk-actions { margin-top: 28px; }
        .kk-btn-link { text-decoration: none; display: inline-flex; align-items: center; }

        .kk-visually-hidden {
          position: absolute;
          width: 1px;
          height: 1px;
          margin: -1px;
          padding: 0;
          overflow: hidden;
          clip: rect(0 0 0 0);
          white-space: nowrap;
          border: 0;
        }

        /* ── Responsiv ──────────────────────────────────────── */
        @media (max-width: 1100px) {
          .kk-cards { grid-template-columns: repeat(2, 1fr); }
          .kk-card { padding-bottom: 26px; }
          .kk-card:nth-child(odd) { border-left: none; padding-left: 0; }
          .kk-card:nth-child(n + 3) { border-top: 1px solid var(--line); }
          .kk-vis { grid-template-columns: 1fr; }
          .kk-ai { grid-template-columns: 1fr; }
          .kk-page { grid-template-columns: 130px minmax(0, 1fr); }
          .kk-page--head { display: none; }
          .kk-page-status { grid-column: 2; }
          .kk-page-typo3 { grid-column: 2; text-align: left; }
          .kk-page-typo3::before { content: "TYPO3-Aufwand "; }
        }
        @media (max-width: 720px) {
          .kk-cards { grid-template-columns: 1fr; }
          .kk-card { border-left: none !important; padding-left: 0 !important; }
          .kk-card + .kk-card { border-top: 1px solid var(--line); }
          .kk-week { grid-template-columns: 1fr; }
          .kk-page { grid-template-columns: 1fr; }
          .kk-page-status, .kk-page-typo3 { grid-column: 1; }
          .kk-blocker { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
