"use client";

import { KLUE } from "./data";

interface HomepageMockupProps {
  activeId: string | null;
  onPinSelect: (id: string) => void;
}

/**
 * Strategisches Homepage-Mockup in Klühspies-CI. Kein Nachbau der echten
 * Website, sondern ein kontrollierter Entwurf: Hier wird sichtbar, wie die
 * empfohlene Struktur aussehen könnte. Farben, Rundungen und Typografie
 * (Source Sans) folgen dem Brand Manual — bewusst getrennt vom ruhigen
 * SEESZN-Raum drumherum. Die nummerierten Pins sind die Annotationsebene
 * von SEESZN und koppeln Mockup und Empfehlungs-Sidebar.
 */
export default function HomepageMockup({ activeId, onPinSelect }: HomepageMockupProps) {
  return (
    <div className="kx">
      {/* Browser-Chrome — macht klar: Das ist ein Entwurf im Lab */}
      <div className="kx-chrome">
        <span className="kx-dots" aria-hidden="true">
          <i className="kx-round" />
          <i className="kx-round" />
          <i className="kx-round" />
        </span>
        <span className="kx-url">kluehspies.de · Homepage-Entwurf</span>
        <span className="kx-chip">Mockup</span>
      </div>

      <div className="kx-site">
        {/* Navigation — Blau als Führungsfarbe */}
        <div className="kx-nav">
          <span className="kx-logo">
            Klühspies <em>Reisen</em>
          </span>
          <span className="kx-nav-links" aria-hidden="true">
            <span>Reiseziele</span>
            <span>Klassenfahrten</span>
            <span>Über uns</span>
            <span>Kontakt</span>
          </span>
          <span className="kx-nav-cta kx-pill">Anfragen</span>
        </div>

        {/* Hero */}
        <div className="kx-hero">
          <div className="kx-hero-copy">
            <span className="kx-eyebrow kx-pill">Klassenfahrten &amp; Gruppenreisen</span>
            <Anno
              id="rec-01"
              num="01"
              label="Hero H1"
              activeId={activeId}
              onPinSelect={onPinSelect}
            >
              <span className="kx-h1" role="presentation">
                Klassenfahrten einfach planen – mit Klühspies Reisen
              </span>
            </Anno>
            <p className="kx-hero-p">
              Seit Jahrzehnten unterstützt Klühspies Schulen bei sicheren, gut
              organisierten und erlebnisreichen Klassenfahrten.
            </p>
            <div className="kx-cta-row">
              <span className="kx-btn-primary kx-pill">Klassenfahrt anfragen</span>
              <span className="kx-btn-secondary kx-pill">Reiseziele entdecken</span>
            </div>
          </div>

          {/* Visual — Gelb/Blau-Komposition statt Stockfoto */}
          <div className="kx-hero-visual kx-r16" aria-hidden="true">
            <svg viewBox="0 0 300 230" className="kx-visual-svg" role="presentation">
              <rect width="300" height="230" fill={KLUE.blue} />
              <circle cx="236" cy="52" r="44" fill={KLUE.yellow} />
              {/* Bergsilhouette */}
              <path d="M0 230 L78 132 L128 192 L186 118 L262 230 Z" fill="#0468a6" />
              <path d="M118 230 L186 118 L262 230 Z" fill="#035c94" />
              {/* Reiseroute */}
              <path
                d="M24 196 C 90 150, 150 186, 204 118 S 268 84, 282 66"
                fill="none"
                stroke={KLUE.white}
                strokeWidth="2"
                strokeDasharray="1 7"
                strokeLinecap="round"
              />
              <circle cx="24" cy="196" r="5" fill={KLUE.white} />
              <circle cx="204" cy="118" r="5" fill={KLUE.yellow} />
              <circle cx="282" cy="66" r="5" fill={KLUE.white} />
            </svg>
            <span className="kx-visual-tag kx-pill">Reiseziele in ganz Europa</span>
          </div>
        </div>

        {/* Kategorien — Pin 02 */}
        <div className="kx-section">
          <span className="kx-kicker">Unsere Klassenfahrten</span>
          <span className="kx-h2" role="presentation">
            Beliebte Klassenfahrten für Schulen
          </span>
          <span className="kx-bar" aria-hidden="true" />
          <Anno
            id="rec-02"
            num="02"
            label="Kategorie-Karten"
            activeId={activeId}
            onPinSelect={onPinSelect}
          >
            <div className="kx-cards">
              <CategoryCard
                title="Städtereisen"
                text="Berlin, Hamburg, Prag und mehr: Kultur und Programm für jede Klassenstufe."
                visual="city"
              />
              <CategoryCard
                title="Skiklassenfahrten"
                text="Betreute Skireisen mit Kursen, Material und erfahrener Begleitung."
                visual="mountain"
              />
              <CategoryCard
                title="Erlebnisreisen"
                text="Natur, Sport und Teamerlebnis: Fahrten, die Klassen zusammenbringen."
                visual="compass"
              />
            </div>
          </Anno>
        </div>

        {/* Werte */}
        <div className="kx-section kx-section-tint">
          <span className="kx-kicker">Ihre Vorteile</span>
          <span className="kx-h2" role="presentation">
            Warum Schulen mit Klühspies planen
          </span>
          <span className="kx-bar" aria-hidden="true" />
          <div className="kx-values">
            <ValueCard
              num="1"
              title="Einfach organisiert"
              text="Klare Abläufe von der ersten Anfrage bis zur Rückreise."
            />
            <ValueCard
              num="2"
              title="Sicher begleitet"
              text="Erfahrene Organisation und erreichbare Ansprechpartner."
            />
            <ValueCard
              num="3"
              title="Persönlich beraten"
              text="Individuelle Beratung für jede Klassenstufe und jedes Budget."
            />
          </div>
        </div>

        {/* FAQ — Pin 03 */}
        <div className="kx-section">
          <span className="kx-kicker">Gut zu wissen</span>
          <span className="kx-h2" role="presentation">
            Häufige Fragen zur Klassenfahrt
          </span>
          <span className="kx-bar" aria-hidden="true" />
          <Anno
            id="rec-03"
            num="03"
            label="FAQ-Bereich"
            activeId={activeId}
            onPinSelect={onPinSelect}
          >
            <div className="kx-faq">
              <FaqRow
                q="Was kostet eine Klassenfahrt?"
                a="Die Kosten hängen von Reiseziel, Dauer und Programm ab. Klühspies erstellt ein transparentes Angebot pro Klasse."
              />
              <FaqRow
                q="Welche Reiseziele eignen sich für Schulklassen?"
                a="Beliebt sind Städtereisen nach Berlin, Hamburg oder Prag sowie Ski- und Erlebnisreisen in den Alpen."
              />
              <FaqRow
                q="Wie unterstützt Klühspies Lehrkräfte bei der Planung?"
                a="Ein persönlicher Ansprechpartner begleitet die gesamte Planung: vom Reiseziel über das Programm bis zur Organisation vor Ort."
              />
            </div>
          </Anno>
        </div>

        {/* Städte-Hub — Pin 04 */}
        <div className="kx-section kx-section-hub">
          <span className="kx-kicker">Beliebte Städte</span>
          <span className="kx-h2" role="presentation">
            Reiseziele für Klassenfahrten
          </span>
          <span className="kx-bar" aria-hidden="true" />
          <Anno
            id="rec-04"
            num="04"
            label="Städte-Hub / interne Verlinkung"
            activeId={activeId}
            onPinSelect={onPinSelect}
          >
            <div className="kx-hub">
              {["Berlin", "Hamburg", "München", "Prag", "Wien"].map((city) => (
                <span key={city} className="kx-hub-chip kx-pill">
                  {city}
                </span>
              ))}
              <span className="kx-hub-all">Alle Reiseziele →</span>
            </div>
          </Anno>
        </div>

        {/* Footer-Leiste */}
        <div className="kx-footer">
          <span className="kx-logo kx-logo-s">
            Klühspies <em>Reisen</em>
          </span>
          <span className="kx-footer-note">Klassenfahrten &amp; Gruppenreisen</span>
        </div>
      </div>

      <style>{`
        /* ── Rahmen (SEESZN-Instrument, scharfkantig) ─────────── */
        .kx {
          border: 1px solid var(--line);
          background: var(--surface-raised);
        }
        .kx-chrome {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 10px 14px;
          border-bottom: 1px solid var(--line);
        }
        .kx-dots { display: inline-flex; gap: 5px; }
        .kx-dots i {
          width: 8px; height: 8px; display: block;
          background: color-mix(in srgb, var(--warm-black) 18%, transparent);
        }
        .kx-url {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.06em;
          color: var(--text-muted);
          flex: 1;
          min-width: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .kx-chip {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink-strong);
          border: 1px solid var(--border-btn);
          padding: 3px 8px;
        }

        /* ── Innenwelt: Klühspies-CI, immer hell ──────────────── */
        .kx-site {
          background: ${KLUE.white};
          color: #16181a;
          font-family: var(--font-kluehspies), "Source Sans Pro", "Source Sans 3", sans-serif;
          font-size: 13.5px;
          line-height: 1.55;
          container-type: inline-size;
        }

        /* Rundungen — nur hier, als bewusste CI-Ausnahme */
        .kx .kx-r8  { border-radius: 8px !important; }
        .kx .kx-r12 { border-radius: 12px !important; }
        .kx .kx-r16 { border-radius: 16px !important; }
        .kx .kx-pill { border-radius: 999px !important; }
        .kx .kx-round { border-radius: 50% !important; }

        .kx-nav {
          display: flex;
          align-items: center;
          gap: 20px;
          background: ${KLUE.blue};
          color: ${KLUE.white};
          padding: 13px 26px;
        }
        .kx-logo { font-weight: 900; font-size: 15px; letter-spacing: 0.01em; white-space: nowrap; }
        .kx-logo em { font-style: normal; font-weight: 400; opacity: 0.92; }
        .kx-nav-links {
          display: flex;
          gap: 16px;
          font-size: 12px;
          font-weight: 600;
          opacity: 0.94;
          margin-left: auto;
        }
        .kx-nav-cta {
          background: ${KLUE.yellow};
          color: #16181a;
          font-size: 11.5px;
          font-weight: 700;
          padding: 6px 14px;
          white-space: nowrap;
        }

        .kx-hero {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 30px;
          align-items: center;
          padding: 40px 26px 44px;
        }
        .kx-eyebrow {
          display: inline-block;
          background: ${KLUE.yellow};
          color: #16181a;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 5px 12px;
          margin-bottom: 16px;
        }
        .kx-h1 {
          display: block;
          font-size: clamp(21px, 4.2cqw, 30px);
          font-weight: 900;
          line-height: 1.14;
          letter-spacing: -0.01em;
          color: #0e1013;
        }
        .kx-hero-p {
          margin: 14px 0 0;
          color: #3d4650;
          max-width: 380px;
        }
        .kx-cta-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; }
        .kx-btn-primary {
          background: ${KLUE.yellow};
          color: #16181a;
          font-weight: 700;
          font-size: 12.5px;
          padding: 10px 20px;
          box-shadow: 0 1px 0 rgba(0,0,0,0.08);
        }
        .kx-btn-secondary {
          border: 1.5px solid ${KLUE.blue};
          color: ${KLUE.blue};
          font-weight: 700;
          font-size: 12.5px;
          padding: 9px 20px;
        }
        .kx-hero-visual {
          position: relative;
          overflow: hidden;
          line-height: 0;
        }
        .kx-visual-svg { width: 100%; height: auto; display: block; }
        .kx-visual-tag {
          position: absolute;
          left: 12px;
          bottom: 12px;
          background: ${KLUE.white};
          color: ${KLUE.blue};
          font-size: 10.5px;
          font-weight: 700;
          padding: 5px 12px;
          line-height: 1.4;
        }

        .kx-section { padding: 34px 26px 38px; border-top: 1px solid #e8eaee; }
        .kx-section-tint { background: #f4f8fb; }
        .kx-section-hub { background: ${KLUE.blue}; border-top: none; }
        .kx-kicker {
          display: block;
          color: ${KLUE.blue};
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.09em;
          text-transform: uppercase;
        }
        .kx-section-hub .kx-kicker { color: ${KLUE.yellow}; }
        .kx-h2 {
          display: block;
          font-size: 19px;
          font-weight: 900;
          color: #0e1013;
          margin-top: 5px;
          line-height: 1.2;
        }
        .kx-section-hub .kx-h2 { color: ${KLUE.white}; }
        .kx-bar {
          display: block;
          width: 34px;
          height: 4px;
          background: ${KLUE.yellow};
          margin: 12px 0 20px;
        }

        .kx-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .kx-card {
          border: 1px solid #e4e7eb;
          background: ${KLUE.white};
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .kx-card-visual { line-height: 0; }
        .kx-card-visual svg { width: 100%; height: auto; display: block; }
        .kx-card-body { padding: 13px 14px 15px; }
        .kx-h3 { display: block; font-size: 14px; font-weight: 700; color: #0e1013; }
        .kx-card-text { margin: 5px 0 10px; font-size: 12px; color: #4a545e; }
        .kx-card-link { color: ${KLUE.blue}; font-weight: 700; font-size: 12px; }

        .kx-values { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .kx-value {
          background: ${KLUE.white};
          border: 1px solid #e4e7eb;
          padding: 16px 16px 18px;
        }
        .kx-value-num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 26px; height: 26px;
          background: ${KLUE.yellow};
          color: #16181a;
          font-weight: 900;
          font-size: 12.5px;
          margin-bottom: 10px;
        }
        .kx-value-text { margin: 4px 0 0; font-size: 12px; color: #4a545e; }

        .kx-faq { display: flex; flex-direction: column; gap: 8px; }
        .kx-faq-row {
          border: 1px solid #e4e7eb;
          background: ${KLUE.white};
          padding: 13px 16px;
        }
        .kx-faq-q {
          display: flex;
          align-items: baseline;
          gap: 10px;
          font-weight: 700;
          font-size: 13px;
          color: #0e1013;
        }
        .kx-faq-q i {
          font-style: normal;
          color: ${KLUE.blue};
          font-weight: 900;
          flex: none;
        }
        .kx-faq-a { margin: 5px 0 0 22px; font-size: 12px; color: #4a545e; }

        .kx-hub { display: flex; flex-wrap: wrap; align-items: center; gap: 9px; }
        .kx-hub-chip {
          background: ${KLUE.white};
          color: ${KLUE.blue};
          font-weight: 700;
          font-size: 12px;
          padding: 7px 16px;
        }
        .kx-hub-all {
          color: ${KLUE.yellow};
          font-weight: 700;
          font-size: 12px;
          margin-left: 6px;
          white-space: nowrap;
        }

        .kx-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          background: #0e1013;
          color: ${KLUE.white};
          padding: 14px 26px;
        }
        .kx-logo-s { font-size: 13px; }
        .kx-footer-note { font-size: 11px; opacity: 0.75; }

        /* ── Annotationsebene (SEESZN) ────────────────────────── */
        .kx-anno { position: relative; }
        .kx-anno[data-active] > :first-child {
          outline: 1.5px dashed color-mix(in srgb, #1f1e1a 55%, transparent);
          outline-offset: 7px;
        }
        .kx-pin {
          position: absolute;
          top: -13px;
          right: -9px;
          z-index: 6;
          width: 30px;
          height: 30px;
          border-radius: 50% !important;
          border: 1.5px solid #1f1e1a;
          background: #1f1e1a;
          color: #f5f1e8;
          font-family: var(--font-mono), monospace;
          font-size: 10.5px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 10px rgba(15, 16, 13, 0.28);
          transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), background 0.22s, color 0.22s;
        }
        .kx-pin:hover { transform: scale(1.12); }
        .kx-pin:focus-visible { outline: 2px solid #1f1e1a; outline-offset: 3px; }
        .kx-pin.is-active {
          background: var(--signal, #c4d83f);
          color: #1f1e1a;
          transform: scale(1.12);
        }
        .kx-anno-tag {
          position: absolute;
          top: -24px;
          right: 28px;
          z-index: 6;
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: #1f1e1a;
          color: #f5f1e8;
          padding: 4px 8px;
          white-space: nowrap;
        }

        /* ── Container-Anpassung: Mockup bleibt in schmalen Spalten sauber ── */
        @container (max-width: 640px) {
          .kx-hero { grid-template-columns: 1fr; padding: 30px 20px 34px; }
          .kx-cards, .kx-values { grid-template-columns: 1fr; }
          .kx-nav-links { display: none; }
          .kx-section { padding: 28px 20px 32px; }
          .kx-hero-visual { max-width: 420px; }
        }
        @container (min-width: 641px) and (max-width: 860px) {
          .kx-cards, .kx-values { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
    </div>
  );
}

/* ── Annotation: Pin + Auswahlrahmen um einen Mockup-Baustein ── */
function Anno({
  id,
  num,
  label,
  activeId,
  onPinSelect,
  children,
}: {
  id: string;
  num: string;
  label: string;
  activeId: string | null;
  onPinSelect: (id: string) => void;
  children: React.ReactNode;
}) {
  const active = activeId === id;
  return (
    <div className="kx-anno" data-active={active || undefined}>
      {children}
      {active && (
        <span className="kx-anno-tag" aria-hidden="true">
          Empfehlung {num}
        </span>
      )}
      <button
        type="button"
        className={`kx-pin${active ? " is-active" : ""}`}
        onClick={() => onPinSelect(id)}
        aria-pressed={active}
        aria-label={`Empfehlung ${num} anzeigen: ${label}`}
        title={`Empfehlung ${num} · ${label}`}
      >
        {num}
      </button>
    </div>
  );
}

function CategoryCard({
  title,
  text,
  visual,
}: {
  title: string;
  text: string;
  visual: "city" | "mountain" | "compass";
}) {
  return (
    <div className="kx-card kx-r12">
      <span className="kx-card-visual" aria-hidden="true">
        {visual === "city" && (
          <svg viewBox="0 0 200 78" role="presentation">
            <rect width="200" height="78" fill={KLUE.blue} />
            <circle cx="168" cy="18" r="13" fill={KLUE.yellow} />
            <rect x="22" y="34" width="16" height="44" fill="#0468a6" />
            <rect x="44" y="22" width="18" height="56" fill={KLUE.white} opacity="0.92" />
            <rect x="68" y="40" width="14" height="38" fill="#0468a6" />
            <rect x="88" y="28" width="18" height="50" fill={KLUE.white} opacity="0.92" />
            <rect x="112" y="46" width="14" height="32" fill="#0468a6" />
            <rect x="132" y="36" width="16" height="42" fill={KLUE.white} opacity="0.92" />
          </svg>
        )}
        {visual === "mountain" && (
          <svg viewBox="0 0 200 78" role="presentation">
            <rect width="200" height="78" fill="#eaf3fa" />
            <circle cx="38" cy="22" r="13" fill={KLUE.yellow} />
            <path d="M6 78 L74 18 L120 78 Z" fill={KLUE.blue} />
            <path d="M62 29 L74 18 L87 30 L74 40 Z" fill={KLUE.white} />
            <path d="M96 78 L152 32 L200 78 Z" fill="#0468a6" />
          </svg>
        )}
        {visual === "compass" && (
          <svg viewBox="0 0 200 78" role="presentation">
            <rect width="200" height="78" fill={KLUE.yellow} />
            <circle cx="100" cy="39" r="26" fill={KLUE.white} />
            <path d="M100 17 L107 39 L100 61 L93 39 Z" fill={KLUE.blue} />
            <circle cx="100" cy="39" r="4" fill="#16181a" />
            <circle cx="30" cy="58" r="7" fill={KLUE.blue} />
            <circle cx="172" cy="20" r="7" fill={KLUE.blue} />
          </svg>
        )}
      </span>
      <span className="kx-card-body">
        <span className="kx-h3" role="presentation">
          {title}
        </span>
        <p className="kx-card-text">{text}</p>
        <span className="kx-card-link">Mehr erfahren →</span>
      </span>
    </div>
  );
}

function ValueCard({ num, title, text }: { num: string; title: string; text: string }) {
  return (
    <div className="kx-value kx-r12">
      <span className="kx-value-num kx-round">{num}</span>
      <span className="kx-h3" role="presentation">
        {title}
      </span>
      <p className="kx-value-text">{text}</p>
    </div>
  );
}

function FaqRow({ q, a }: { q: string; a: string }) {
  return (
    <div className="kx-faq-row kx-r8">
      <span className="kx-faq-q">
        <i aria-hidden="true">+</i>
        {q}
      </span>
      <p className="kx-faq-a">{a}</p>
    </div>
  );
}
