import Link from "next/link";

interface MockupNoticeProps {
  /** Was hier gezeigt wird, z. B. "Über Klühspies". */
  title: string;
  /** Konzeptstand als sichtbares Datum. */
  stand: string;
}

/**
 * Interner SEESZN-Hinweis über einem Mockup.
 *
 * Er gehört ausdrücklich nicht zum Kundendesign darunter, deshalb trägt er die
 * SEESZN-Tokens (warmes Papier, Signalfarbe, Inter) statt der Klühspies-CI.
 * Schmal und ruhig, aber in jedem Screenshot eindeutig als „nicht live"
 * lesbar — genau dafür ist er da.
 */
export default function MockupNotice({ title, stand }: MockupNoticeProps) {
  return (
    <div className="mn">
      <div className="mn-row">
        <span className="mn-flag">
          <span className="mn-dot" aria-hidden="true" />
          Mockup · nicht live
        </span>
        <span className="mn-meta">
          {title} · Konzeptstand {stand}
        </span>
        <Link className="mn-back" href="/mockups">
          Alle Mockups
        </Link>
      </div>

      <style>{`
        /* Farben fest, nicht über Tokens: das Mockup darunter ist immer hell,
           und im Night Mode würde --warm-black auf helles Papier kippen und
           den Hinweis unlesbar machen. */
        .mn {
          background: #1f1e1a;
          color: #f5f1e8;
          font-family: var(--font-body), "Helvetica Neue", Helvetica, Arial, sans-serif;
        }
        .mn-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px 20px;
          max-width: 1400px;
          margin: 0 auto;
          padding: 9px clamp(16px, 4vw, 44px);
        }
        .mn-flag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .mn-dot {
          width: 7px;
          height: 7px;
          border-radius: 50% !important;
          background: #c4d83f;
          flex: none;
        }
        .mn-meta {
          font-size: 12px;
          color: rgba(245, 241, 232, 0.72);
          min-width: 0;
        }
        .mn-back {
          margin-left: auto;
          font-size: 12px;
          color: rgba(245, 241, 232, 0.72);
          text-decoration: underline;
          text-underline-offset: 3px;
          white-space: nowrap;
          transition: color 0.2s ease;
        }
        .mn-back:hover { color: #f5f1e8; }
        .mn-back:focus-visible { outline: 1px solid #f5f1e8; outline-offset: 3px; }
      `}</style>
    </div>
  );
}
