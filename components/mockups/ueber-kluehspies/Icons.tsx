// ─── Icon-Set für das Über-Klühspies-Mockup ─────────────────────────────────
// Ein einheitliches Linien-Set auf 24er-Raster, gezeichnet in Klühspies-Blau
// (currentColor). Bewusst selbst gezeichnet und kein Markenasset: Logos,
// Siegel und Personenbilder kommen ausschließlich als echte Dateien aus
// public/mockups/ueber-kluehspies/assets/.
//
// Alle Icons sind dekorativ und werden von den Komponenten mit aria-hidden
// gerendert; die Aussage steht immer im begleitenden HTML-Text.

interface IconProps {
  className?: string;
}

function Svg({ children, className }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/* ── Trust Bar ───────────────────────────────────────────────────────────── */

/** Medaille mit „40+“ — Jahre Erfahrung. */
export function IconYears({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="9.5" r="6" />
      <path d="M8.6 14.6 7 21.5l5-2.4 5 2.4-1.6-6.9" />
      <text
        x="12"
        y="11.6"
        textAnchor="middle"
        fontSize="5.4"
        fontWeight="700"
        stroke="none"
        fill="currentColor"
      >
        40+
      </text>
    </Svg>
  );
}

/** Personengruppe — Gäste pro Jahr. */
export function IconGuests({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="7" r="3" />
      <path d="M6.5 19.5v-1.2a5.5 5.5 0 0 1 11 0v1.2" />
      <circle cx="4.6" cy="9.6" r="2.1" />
      <path d="M1 19.5v-1a3.7 3.7 0 0 1 3.6-3.7" />
      <circle cx="19.4" cy="9.6" r="2.1" />
      <path d="M23 19.5v-1a3.7 3.7 0 0 0-3.6-3.7" />
    </Svg>
  );
}

/** Kalender — keine Anzahlung bei Buchung. */
export function IconCalendar({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="5" width="18" height="16" rx="2.4" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <path d="M7.6 14h1.2M11.4 14h1.2M15.2 14h1.2M7.6 17.6h1.2M11.4 17.6h1.2" />
    </Svg>
  );
}

/** Zahlkarte — kostenloser Bezahlservice. */
export function IconCard({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="2" y="5" width="20" height="14" rx="2.4" />
      <path d="M2 9.6h20" />
      <path d="M5.6 14.6h4.2" />
    </Svg>
  );
}

/* ── USP Cards ───────────────────────────────────────────────────────────── */

/** Durchgestrichenes Euro-Zeichen — keine Anzahlung. */
export function IconNoPayment({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 8.6a4.6 4.6 0 0 0-6.6 2.1 5.4 5.4 0 0 0 0 2.6 4.6 4.6 0 0 0 6.6 2.1" />
      <path d="M7.2 11.1h5.2M7.2 13.3h5.2" />
      <path d="M5.6 5.6 18.4 18.4" />
    </Svg>
  );
}

/** Monitor mit Zahlungsübersicht — Bezahlservice inkl. Lehrer-Portal. */
export function IconPortal({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="2.5" y="4" width="19" height="12.6" rx="1.8" />
      <path d="M9.4 20.4h5.2M12 16.6v3.8" />
      <path d="M6.4 12.6V9.4M9.6 12.6V7.6M12.8 12.6v-2.2M16 12.6V8.4" />
    </Svg>
  );
}

/** Balkendiagramm mit Trendlinie — Zahlungsstand im Blick. */
export function IconChart({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M3.4 20.6h17.2" />
      <path d="M6.6 20.6v-5.4M11 20.6V11M15.4 20.6v-7.4M19.8 20.6V7" />
      <path d="M5.4 9.6 10 6.2l3.8 2.6L20 3.6" />
    </Svg>
  );
}

/** Headset mit „24/7“ — persönliche Beratung und Notfallservice. */
export function IconSupport({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="1.8" y="13.4" width="4.4" height="6.2" rx="2.2" />
      <rect x="17.8" y="13.4" width="4.4" height="6.2" rx="2.2" />
      <path d="M20 19.6v.7a2.4 2.4 0 0 1-2.4 2.4h-2.2" />
      <text
        x="12"
        y="13.4"
        textAnchor="middle"
        fontSize="5"
        fontWeight="700"
        stroke="none"
        fill="currentColor"
      >
        24/7
      </text>
    </Svg>
  );
}

/* ── Flächige Icons ──────────────────────────────────────────────────────── */

/** Gefüllter Haken — Best-Fit Mini Cards. */
/** Freiplatzregelung: ein Sitzplatz, auf der Lehne als „frei" abgehakt. */
export function IconSeat({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M6.5 3.6h11v8.4h-11z" />
      <path d="M4.6 12h14.8v3.6H4.6z" />
      <path d="M7 15.6v4.8" />
      <path d="M17 15.6v4.8" />
      <path d="M9.2 7.8l2 2 3.6-3.6" />
    </Svg>
  );
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="12" fill="currentColor" />
      <path
        d="M7 12.4 10.4 15.8 17 9.2"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── UI-Icons ────────────────────────────────────────────────────────────── */

export function IconMail({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.2" />
      <path d="m3.6 7.4 7.3 5a2 2 0 0 0 2.2 0l7.3-5" />
    </Svg>
  );
}

export function IconPhone({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M6.3 3.6h3l1.5 3.8-1.9 1.4a11.5 11.5 0 0 0 5.3 5.3l1.4-1.9 3.8 1.5v3a2 2 0 0 1-2.2 2A16.8 16.8 0 0 1 4.3 5.8a2 2 0 0 1 2-2.2Z" />
    </Svg>
  );
}

export function IconChat({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M20.5 12.4a7.6 7.6 0 0 1-8.2 7.5l-4.9 1.6 1.2-3.6a7.5 7.5 0 1 1 11.9-5.5Z" />
      <path d="M9 11.6h6M9 14.4h3.6" />
    </Svg>
  );
}

/** Beratungs-Icon der Servicezeile: Person mit Headset. */
export function IconAdvice({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5.6 20.4a6.4 6.4 0 0 1 12.8 0" />
      <path d="M4.4 9.6a7.6 7.6 0 0 1 15.2 0" />
      <path d="M4.4 9.6v2.2M19.6 9.6v2.2" />
    </Svg>
  );
}

/** Bezahlservice-Icon: Karte in der Hand. */
export function IconHandCard({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="6.6" y="3.4" width="13" height="8.4" rx="1.8" />
      <path d="M6.6 6.6h13" />
      <path d="M3 13.4a2 2 0 0 1 2.8-.3l2.6 2.1h3.4a1.7 1.7 0 0 1 0 3.4h-2.2" />
      <path d="M8.4 21.2h5.4l6-3.2a1.8 1.8 0 0 0-1.8-3.1l-3.6 1.7" />
    </Svg>
  );
}

export function IconHome({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M3.6 10.4 12 3.6l8.4 6.8" />
      <path d="M5.6 9v10.6a1 1 0 0 0 1 1h10.8a1 1 0 0 0 1-1V9" />
      <path d="M9.8 20.6v-5.4h4.4v5.4" />
    </Svg>
  );
}

export function IconChevronDown({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m6 9.4 6 5.6 6-5.6" />
    </Svg>
  );
}

export function IconArrowRight({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M4 12h15.4M13.6 6.2 19.8 12l-6.2 5.8" />
    </Svg>
  );
}

export function IconChevronRight({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="m9.4 5.6 6.2 6.4-6.2 6.4" />
    </Svg>
  );
}

export function IconFacebook({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="12" fill="currentColor" />
      <path
        d="M13.4 21.5V13h2.6l.5-3.3h-3.1V7.9c0-.9.3-1.6 1.7-1.6h1.6V3.4a20 20 0 0 0-2.4-.1c-2.6 0-4.3 1.5-4.3 4.3v2.1H7.4V13h2.6v8.5h3.4Z"
        fill="#0578be"
      />
    </svg>
  );
}

/**
 * Illustration für den Vergleichs-Teaser: Laptop mit Anbieter-Vergleichsliste
 * und Lupe. Selbst gezeichnet in Klühspies-Blau, kein Markenasset und kein
 * Screenshot. Rein dekorativ, die Aussage steht daneben als Text.
 */
export function CompareIllustration({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 320 200"
      className={className}
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      {/* Weiche Hintergrundformen */}
      <circle cx="46" cy="70" r="34" fill="#e2edf9" />
      <circle cx="278" cy="120" r="28" fill="#e2edf9" />

      {/* Laptop-Deckel */}
      <rect x="52" y="16" width="216" height="140" rx="9" fill="#0578be" />
      <rect x="60" y="24" width="200" height="124" rx="4" fill="#ffffff" />

      {/* Vier Anbieter-Spalten */}
      {[0, 1, 2, 3].map((i) => {
        const x = 72 + i * 47;
        return (
          <g key={i}>
            <rect x={x} y={34} width="37" height="104" rx="3" fill="#f2f7fc" />
            <rect x={x + 6} y={40} width="25" height="4.5" rx="2.2" fill="#c3d9ee" />
            <rect x={x + 6} y={49} width="17" height="4.5" rx="2.2" fill="#dde9f5" />
            {[0, 1].map((r) => (
              <path
                key={r}
                d={`M${x + 8} ${72 + r * 26} l4.6 4.8 8.6 -9.6`}
                fill="none"
                stroke="#0578be"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </g>
        );
      })}

      {/* Bewertungssterne über Spalte 2 und 4 */}
      {[119, 213].map((x) => (
        <g key={x} fill="#0578be">
          <path d="M0 0 1.9 3.9 6.2 4.5 3.1 7.5 3.8 11.8 0 9.8 -3.8 11.8 -3.1 7.5 -6.2 4.5 -1.9 3.9Z" transform={`translate(${x} 34) scale(.62)`} />
          <path d="M0 0 1.9 3.9 6.2 4.5 3.1 7.5 3.8 11.8 0 9.8 -3.8 11.8 -3.1 7.5 -6.2 4.5 -1.9 3.9Z" transform={`translate(${x + 11} 34) scale(.62)`} />
        </g>
      ))}

      {/* Laptop-Fuß */}
      <path d="M34 160h252l-9 14a6 6 0 0 1-5 3H48a6 6 0 0 1-5-3Z" fill="#3f93cf" />
      <rect x="34" y="156" width="252" height="6" rx="3" fill="#0578be" />

      {/* Lupe */}
      <circle cx="196" cy="112" r="34" fill="#ffffff" fillOpacity=".82" stroke="#0f4c81" strokeWidth="6" />
      <path d="m221 137 26 26" stroke="#0f4c81" strokeWidth="10" strokeLinecap="round" />
    </svg>
  );
}
