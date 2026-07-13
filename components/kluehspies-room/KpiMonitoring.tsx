"use client";

import { blockers } from "./data";
import SourceProvenance from "./kpi/SourceProvenance";

/**
 * KPI Monitoring — redaktioneller Rest neben dem echten KPI-Workspace.
 *
 * Alle früheren statischen Performance-Module (Snapshot-Karten, Ranking-Chart
 * Position 24→17, "+18 % seit Mai", Content-Output, Link-Pipeline,
 * Produktseiten-Fortschritt, AI/GEO Readiness 62/100) sind bewusst entfernt:
 * Zahlen kommen jetzt ausschließlich aus importierten Search-Console-Exporten
 * im KPI-Workspace darüber. Es werden keine Ersatzwerte erfunden.
 *
 * Übrig bleibt der textliche Arbeitsstand (Blocker & nächste Schritte),
 * klar als manuell gepflegt gekennzeichnet.
 */
export default function KpiMonitoring() {
  return (
    <div className="kk">
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
        <SourceProvenance source="Manuell gepflegt" maintainedBy="SEESZN" />
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
        .kk-module { margin-top: clamp(40px, 5vw, 64px); }
        .kk-module-label {
          border-top: 1px solid var(--line);
          padding-top: 18px;
          margin-bottom: clamp(24px, 3vw, 36px);
        }
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
        .kk .kw-provenance { margin-top: 14px; }
        .kk-actions { margin-top: 28px; }
        .kk-btn-link { text-decoration: none; display: inline-flex; align-items: center; }
        @media (max-width: 720px) {
          .kk-blocker { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
